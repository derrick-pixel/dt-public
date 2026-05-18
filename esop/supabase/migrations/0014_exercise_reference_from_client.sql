-- 0014_exercise_reference_from_client.sql
--
-- Switches PayNow reference from server-allocated EXR-YYYY-NNNNN to a
-- client-computed format: first 6 letters of holder name + last 3 digits
-- of NRIC, e.g. "TOKMEI267".  The IC isn't stored server-side (PII
-- minimisation), so the client computes the value and passes it in.
--
-- Same holder exercising multiple times will produce the same reference;
-- reconciliation distinguishes by amount + date in the bank statement.
-- The pg_advisory_xact_lock + uniqueness sequence is therefore dropped.

drop function if exists public.submit_exercise(text, int, text, numeric);

create or replace function public.submit_exercise(
  p_grant_id text,
  p_qty int,
  p_qr_payload text,
  p_amount_sgd numeric,
  p_reference text
)
returns table (event public.events, document public.documents, payment public.payments)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_holder text;
  v_event public.events;
  v_doc public.documents;
  v_pay public.payments;
begin
  if public.profile_role() <> 'holder' then
    raise exception 'only holders can submit exercise' using errcode = '42501';
  end if;
  if p_qty <= 0 then raise exception 'qty must be positive'; end if;
  if p_amount_sgd <= 0 then raise exception 'amount must be positive'; end if;
  if p_reference is null or length(p_reference) = 0 then
    raise exception 'reference required';
  end if;
  if length(p_reference) > 25 then
    raise exception 'reference exceeds 25-char PayNow limit';
  end if;
  if p_reference !~ '^[A-Z0-9]+$' then
    raise exception 'reference must be uppercase alphanumeric only';
  end if;

  select holder_id into v_holder from public.profiles where id = auth.uid();

  v_event := public.append_event(
    'exercise_submitted',
    jsonb_build_object('grant_id', p_grant_id, 'qty', p_qty, 'amount_sgd', p_amount_sgd, 'reference', p_reference)
  );

  insert into public.documents(holder_id, kind, status)
    values (v_holder, 'exercise_notice', 'awaiting_signature')
    returning * into v_doc;

  insert into public.payments(exercise_event_id, holder_id, amount_sgd, reference, qr_payload)
    values (v_event.id, v_holder, p_amount_sgd, p_reference, p_qr_payload)
    returning * into v_pay;

  return query select v_event, v_doc, v_pay;
end $$;

revoke all on function public.submit_exercise(text, int, text, numeric, text) from public;
grant execute on function public.submit_exercise(text, int, text, numeric, text) to authenticated;
