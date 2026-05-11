create extension if not exists pgcrypto;

-- Allowed event types per role. Anything not listed is rejected.
create or replace function public._can_emit(role_name text, event_type text) returns boolean
language sql immutable as $$
  select case
    when role_name in ('committee','admin') then true
    when role_name = 'holder' and event_type in (
      'letter_of_offer_signed','exercise_notice_signed','exercise_submitted','document_viewed'
    ) then true
    else false
  end;
$$;

create or replace function public.append_event(p_type text, p_payload jsonb)
returns public.events
language plpgsql security definer set search_path = public, pg_temp as $$
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

  -- Holders can never lie about their holder_id.
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

revoke all on function public.append_event(text, jsonb) from public;
grant execute on function public.append_event(text, jsonb) to authenticated;
