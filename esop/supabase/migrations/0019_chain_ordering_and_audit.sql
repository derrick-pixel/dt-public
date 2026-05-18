-- 0019_chain_ordering_and_audit.sql
-- QA pass round 3:
--   DATA-P1 (chain tie-break): two events sharing the same `at` ms can be
--     ordered differently by append (order by at desc, id desc) vs by
--     verify-chain (order by at asc, id asc). Adding a strictly-monotonic
--     `seq` column and using it as the canonical sort.
--   DATA-P1 (canonical hash mismatch): hashing v_payload::text on the
--     server vs JSON.stringify in JS produces different bytes. Storing
--     the exact input bytes on each event (digest_input) and adding a
--     server-side verify_chain() RPC so verification stays single-source.
--   SEC-P1: update_role logs v_profile.role as previous_role, but that's
--     the NEW role. Fixed by capturing old role before the UPDATE.

-- ----- 1. Add seq column for strict ordering ------------------------------
alter table public.events add column if not exists seq bigserial unique;

-- ----- 2. New append_event: clock_timestamp + canonical digest + seq -----
create or replace function public.append_event(p_type text, p_payload jsonb)
returns public.events
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  v_role text := public.profile_role();
  v_holder text;
  v_prev_hash text;
  v_id text;
  v_at timestamptz := clock_timestamp();     -- microsecond precision, advances inside a txn
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
  v_ip inet;
  v_ua text;
  v_event public.events;
  v_digest_input text;
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

  -- Strict ordering: latest by (seq desc) — seq is bigserial, never collides.
  select hash into v_prev_hash from public.events order by seq desc limit 1;

  v_id := 'ev_' || replace(gen_random_uuid()::text,'-','');
  -- Canonical digest input: store the exact bytes we hashed so verify-chain
  -- can re-hash deterministically (no JSON-canonicalisation round-trip).
  v_digest_input := coalesce(v_prev_hash, '') || '|' || p_type || '|' || to_char(v_at, 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') || '|' || v_payload::text;

  insert into public.events(id, type, payload, at, actor_id, actor_role, client_ip, user_agent, prev_hash, hash, digest_input)
  values (
    v_id, p_type, v_payload, v_at, auth.uid(), v_role, v_ip, v_ua, v_prev_hash,
    encode(digest(v_digest_input, 'sha256'), 'hex'),
    v_digest_input
  )
  returning * into v_event;

  return v_event;
end $$;

-- Add the column the new function writes into.
alter table public.events add column if not exists digest_input text;

-- ----- 3. Server-side verify_chain RPC ------------------------------------
-- Returns the first broken link or null if intact. No JS hashing required.
create or replace function public.verify_chain()
returns table(broken_at_seq bigint, broken_at_id text, expected_hash text, stored_hash text)
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  v_role text := public.profile_role();
  r record;
  v_prev_hash text := null;
  v_recomputed text;
begin
  if v_role not in ('admin','committee') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  for r in select seq, id, type, at, payload, prev_hash, hash, digest_input
           from public.events order by seq asc loop
    if r.prev_hash is distinct from v_prev_hash then
      broken_at_seq := r.seq; broken_at_id := r.id;
      expected_hash := v_prev_hash; stored_hash := r.prev_hash;
      return next; return;
    end if;
    -- If digest_input was recorded (post-0019 events), re-hash from it.
    -- Pre-0019 events have NULL digest_input — fall back to legacy formula.
    if r.digest_input is not null then
      v_recomputed := encode(digest(r.digest_input, 'sha256'), 'hex');
    else
      v_recomputed := encode(digest(
        coalesce(r.prev_hash, '') || r.type || r.at::text || r.payload::text,
        'sha256'
      ), 'hex');
    end if;
    if v_recomputed <> r.hash then
      broken_at_seq := r.seq; broken_at_id := r.id;
      expected_hash := v_recomputed; stored_hash := r.hash;
      return next; return;
    end if;
    v_prev_hash := r.hash;
  end loop;
  -- intact — no rows returned
  return;
end $$;
revoke all on function public.verify_chain() from public;
grant execute on function public.verify_chain() to authenticated;

-- ----- 4. update_role: capture OLD role for audit ------------------------
create or replace function public.update_role(p_id uuid, p_new_role text, p_reason text default null)
returns public.profiles
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_caller text := public.profile_role();
  v_profile public.profiles;
  v_previous_role text;
begin
  if v_caller <> 'admin' then
    raise exception 'only admins can change roles' using errcode = '42501';
  end if;
  if p_new_role not in ('holder','committee','admin') then
    raise exception 'invalid role: %', p_new_role;
  end if;
  -- Capture OLD role first (SEC-P1 fix: previously logged v_profile.role
  -- AFTER the update, which was the new role — destroying audit value).
  select role into v_previous_role from public.profiles where id = p_id;
  update public.profiles set role = p_new_role, updated_at = now()
    where id = p_id returning * into v_profile;
  if not found then raise exception 'profile % not found', p_id; end if;
  insert into public.audit_log(actor_id, actor_email, action, target, metadata)
    values (
      auth.uid(),
      (select email from public.profiles where id = auth.uid()),
      'role_changed',
      v_profile.email,
      jsonb_build_object('previous_role', v_previous_role, 'new_role', p_new_role, 'reason', p_reason)
    );
  return v_profile;
end $$;
revoke all on function public.update_role(uuid, text, text) from public;
grant execute on function public.update_role(uuid, text, text) to authenticated;
