-- sign_document: holder asserts intent on a doc they own.
create or replace function public.sign_document(p_document_id uuid, p_typed_name text)
returns public.documents
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_doc public.documents;
  v_profile public.profiles;
  v_ip inet;
  v_ua text;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile is null then raise exception 'unauthenticated' using errcode = '42501'; end if;

  select * into v_doc from public.documents where id = p_document_id for update;
  if v_doc is null then raise exception 'document not found' using errcode = '02000'; end if;
  if v_doc.holder_id is distinct from v_profile.holder_id then
    raise exception 'not your document' using errcode = '42501';
  end if;
  if v_doc.status <> 'awaiting_signature' then
    raise exception 'document not signable, status=%', v_doc.status using errcode = '22023';
  end if;
  if lower(trim(p_typed_name)) <> lower(trim(v_profile.full_name)) then
    raise exception 'typed name does not match profile' using errcode = '22023';
  end if;

  begin v_ip := nullif(current_setting('request.headers', true)::json->>'x-forwarded-for','')::inet;
  exception when others then v_ip := null; end;
  begin v_ua := current_setting('request.headers', true)::json->>'user-agent';
  exception when others then v_ua := null; end;

  update public.documents set
    status = 'signed',
    signed_at = now(),
    signed_by = auth.uid(),
    signature_metadata = jsonb_build_object(
      'typed_name', p_typed_name,
      'ip', v_ip,
      'user_agent', v_ua,
      'at', now()
    )
  where id = p_document_id
  returning * into v_doc;

  perform public.append_event(
    case v_doc.kind
      when 'letter_of_offer' then 'letter_of_offer_signed'
      when 'exercise_notice' then 'exercise_notice_signed'
      when 'clawback_notice' then 'clawback_notice_signed'
      else 'document_signed'
    end,
    jsonb_build_object('document_id', v_doc.id, 'holder_id', v_doc.holder_id, 'kind', v_doc.kind)
  );

  return v_doc;
end $$;

revoke all on function public.sign_document(uuid, text) from public;
grant execute on function public.sign_document(uuid, text) to authenticated;

-- finalize_signed_document — v1.1 hook. The signed-PDF-upload-to-Storage flow
-- is intentionally not wired into the v1 client UI. The schema is retained so
-- the storage path can be added in v1.1 without another migration.
create or replace function public.finalize_signed_document(p_document_id uuid, p_storage_path text)
returns public.documents
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_doc public.documents; v_profile public.profiles;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile is null then raise exception 'unauthenticated' using errcode = '42501'; end if;

  select * into v_doc from public.documents where id = p_document_id;
  if v_doc.holder_id is distinct from v_profile.holder_id and v_profile.role not in ('committee','admin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.documents set storage_path = p_storage_path
  where id = p_document_id returning * into v_doc;

  insert into public.audit_log(actor_id, actor_email, action, target, metadata)
  values (auth.uid(), v_profile.email, 'file_uploaded', v_doc.id::text,
    jsonb_build_object('storage_path', p_storage_path));

  return v_doc;
end $$;

revoke all on function public.finalize_signed_document(uuid, text) from public;
grant execute on function public.finalize_signed_document(uuid, text) to authenticated;

-- submit_exercise: holder requests exercise of N options against a grant.
create or replace function public.submit_exercise(p_grant_id text, p_qty int, p_qr_payload text, p_amount_sgd numeric)
returns table (event public.events, document public.documents, payment public.payments)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_holder text;
  v_event public.events;
  v_doc public.documents;
  v_pay public.payments;
  v_year int := extract(year from now());
  v_seq int;
  v_ref text;
begin
  if public.profile_role() <> 'holder' then
    raise exception 'only holders can submit exercise' using errcode = '42501';
  end if;
  if p_qty <= 0 then raise exception 'qty must be positive'; end if;
  if p_amount_sgd <= 0 then raise exception 'amount must be positive'; end if;

  select holder_id into v_holder from public.profiles where id = auth.uid();

  -- Serialise reference allocation per-year so two concurrent submit_exercise
  -- calls can't both compute the same EXR-YYYY-NNNNN. Advisory lock is released
  -- automatically at txn commit/rollback. Keyed on year so different years
  -- never block each other.
  perform pg_advisory_xact_lock(hashtext('exr_seq_' || v_year::text));
  select coalesce(max((substring(reference from 'EXR-\d{4}-(\d+)$'))::int), 0) + 1
    into v_seq from public.payments where reference like 'EXR-' || v_year::text || '-%';
  v_ref := 'EXR-' || v_year::text || '-' || lpad(v_seq::text, 5, '0');

  v_event := public.append_event(
    'exercise_submitted',
    jsonb_build_object('grant_id', p_grant_id, 'qty', p_qty, 'amount_sgd', p_amount_sgd, 'reference', v_ref)
  );

  insert into public.documents(holder_id, kind, status)
    values (v_holder, 'exercise_notice', 'awaiting_signature')
    returning * into v_doc;

  insert into public.payments(exercise_event_id, holder_id, amount_sgd, reference, qr_payload)
    values (v_event.id, v_holder, p_amount_sgd, v_ref, p_qr_payload)
    returning * into v_pay;

  return query select v_event, v_doc, v_pay;
end $$;

revoke all on function public.submit_exercise(text, int, text, numeric) from public;
grant execute on function public.submit_exercise(text, int, text, numeric) to authenticated;

-- confirm_payment: admin/committee marks a payment as paid; emits exercise_settled.
create or replace function public.confirm_payment(p_payment_id uuid, p_notes text)
returns public.payments
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_pay public.payments;
begin
  if public.profile_role() not in ('committee','admin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.payments set status='paid', paid_at=now(), confirmed_by=auth.uid(), confirmation_notes=p_notes
    where id = p_payment_id and status = 'pending'
    returning * into v_pay;
  -- `RETURNING * INTO` populates the composite type with NULLs when no row
  -- matched, so `v_pay IS NULL` would always be false. NOT FOUND is the
  -- correct sentinel.
  if not found then raise exception 'payment not found or not pending'; end if;

  perform public.append_event('exercise_settled',
    jsonb_build_object('payment_id', v_pay.id, 'holder_id', v_pay.holder_id,
                       'reference', v_pay.reference, 'amount_sgd', v_pay.amount_sgd));
  return v_pay;
end $$;

revoke all on function public.confirm_payment(uuid, text) from public;
grant execute on function public.confirm_payment(uuid, text) to authenticated;

-- cancel_payment: admin/committee cancels a pending exercise; emits exercise_cancelled.
create or replace function public.cancel_payment(p_payment_id uuid, p_reason text)
returns public.payments
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_pay public.payments;
begin
  if public.profile_role() not in ('committee','admin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.payments set status='cancelled', confirmed_by=auth.uid(), confirmation_notes=p_reason
    where id = p_payment_id and status = 'pending'
    returning * into v_pay;
  if not found then raise exception 'payment not found or not pending'; end if;

  perform public.append_event('exercise_cancelled',
    jsonb_build_object('payment_id', v_pay.id, 'holder_id', v_pay.holder_id, 'reason', p_reason));
  return v_pay;
end $$;

revoke all on function public.cancel_payment(uuid, text) from public;
grant execute on function public.cancel_payment(uuid, text) to authenticated;

-- finalize_payment_qr: holder regenerates the SGQR with the real reference
-- right after submit_exercise returns it. Scoped tightly: only the owning
-- holder can call this, only on a pending payment, only updates qr_payload.
-- Without this RPC the client cannot UPDATE payments.qr_payload (no UPDATE
-- policy exists), so the QR stored in the DB stays as the PENDING-reference
-- placeholder.
create or replace function public.finalize_payment_qr(p_payment_id uuid, p_qr_payload text)
returns public.payments
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_pay public.payments; v_profile public.profiles;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile is null then raise exception 'unauthenticated' using errcode = '42501'; end if;
  if p_qr_payload is null or length(p_qr_payload) = 0 then
    raise exception 'qr_payload required';
  end if;

  update public.payments set qr_payload = p_qr_payload
    where id = p_payment_id
      and holder_id = v_profile.holder_id
      and status = 'pending'
    returning * into v_pay;
  if not found then
    raise exception 'payment not yours or not pending' using errcode = '42501';
  end if;
  return v_pay;
end $$;

revoke all on function public.finalize_payment_qr(uuid, text) from public;
grant execute on function public.finalize_payment_qr(uuid, text) to authenticated;
