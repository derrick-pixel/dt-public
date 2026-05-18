-- 0015_append_event_search_path.sql
--
-- pgcrypto is installed in the `extensions` schema (Supabase default), but
-- append_event's search_path is `public, pg_temp`. That makes `digest()`
-- unresolvable inside the function:
--   ERROR: function digest(text, unknown) does not exist
-- Fix by including `extensions` in the function's search_path.

create or replace function public.append_event(p_type text, p_payload jsonb)
returns public.events
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  v_role text := public.profile_role();
  v_holder text;
  v_prev_hash text;
  v_id text;
  v_at timestamptz := now();
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
  v_ip inet;
  v_ua text;
  v_event public.events;
begin
  if v_role is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;
  if not public._can_emit(v_role, p_type) then
    raise exception 'role % cannot emit %', v_role, p_type using errcode = '42501';
  end if;

  if v_role = 'holder' then
    select holder_id into v_holder from public.profiles where id = auth.uid();
    if v_holder is null then
      raise exception 'holder profile missing holder_id' using errcode = '22023';
    end if;
    v_payload := jsonb_set(v_payload, '{holder_id}', to_jsonb(v_holder), true);
  end if;

  begin
    v_ip := nullif(current_setting('request.headers', true)::json->>'x-forwarded-for','')::inet;
  exception when others then v_ip := null; end;
  begin
    v_ua := current_setting('request.headers', true)::json->>'user-agent';
  exception when others then v_ua := null; end;

  select hash into v_prev_hash from public.events order by at desc, id desc limit 1;

  v_id := 'ev_' || replace(gen_random_uuid()::text,'-','');

  insert into public.events(id, type, payload, at, actor_id, actor_role, client_ip, user_agent, prev_hash, hash)
  values (
    v_id, p_type, v_payload, v_at, auth.uid(), v_role, v_ip, v_ua, v_prev_hash,
    encode(digest(coalesce(v_prev_hash,'') || p_type || v_at::text || v_payload::text, 'sha256'), 'hex')
  )
  returning * into v_event;

  return v_event;
end $$;

-- Same fix for submit_exercise (also uses digest indirectly via append_event,
-- but reset its search_path for consistency).
create or replace function public.submit_exercise(
  p_grant_id text,
  p_qty int,
  p_qr_payload text,
  p_amount_sgd numeric,
  p_reference text
)
returns table (event public.events, document public.documents, payment public.payments)
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
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
