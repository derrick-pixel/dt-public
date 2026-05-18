-- 0017_qa_pass_security.sql
-- Batch of security/correctness fixes surfaced by the QA audit:
--   1. SEC-P0-2: revoke select on public.activity_unified (the view bypassed
--      the activity_log RPC's role gate)
--   2. DATA-P0-1: holders need to emit grant_accepted from the portal.
--      Adding it to _can_emit. Holder identity is still forced from
--      profiles.holder_id inside append_event so payload can't be forged.
--   3. SEC-P0-3 / ADM-P1: add an audit_log_export RPC so the client can
--      record a CSV-download event without trying to INSERT directly into
--      audit_log (which RLS silently denies).
--   4. ADM-P0-1: register holder_added in Committee thresholds and
--      executors so admin onboarding actually does something.
--   5. HLDR-P0-2: add a partial-unique index preventing two PENDING
--      payments with the same (holder_id, amount_sgd) — covers fat-finger
--      double-submits. Settled rows are unconstrained (legitimate same-ref
--      multi-exercise stays possible).

-- ----- 1. Revoke the leaky view --------------------------------------------
revoke all on public.activity_unified from public, anon, authenticated;
-- The activity_log RPC retains SECURITY DEFINER access; it gates by role.

-- ----- 2. Let holders emit grant_accepted ---------------------------------
create or replace function public._can_emit(role_name text, event_type text) returns boolean
language sql immutable as $$
  select case
    when role_name in ('committee','admin') then true
    when role_name = 'holder' and event_type in (
      'letter_of_offer_signed',
      'grant_accepted',
      'exercise_notice_signed',
      'exercise_submitted',
      'document_viewed'
    ) then true
    else false
  end;
$$;

-- ----- 3. SECURITY DEFINER audit RPC for client-side events ----------------
-- The client (admin's CSV download) needs to record "audit_export_downloaded"
-- without holding INSERT on audit_log. Tight allow-list: only a fixed set of
-- non-state-changing telemetry actions are permitted via this RPC. Any action
-- string outside the list is rejected.
create or replace function public.record_client_audit(p_action text, p_target text default null, p_metadata jsonb default '{}'::jsonb)
returns public.audit_log
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_row public.audit_log;
  v_role text := public.profile_role();
  v_caller_email text;
  v_allowed text[] := array['audit_export_downloaded', 'document_viewed', 'login_attempt_from_form'];
begin
  if v_role is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;
  if not (p_action = any(v_allowed)) then
    raise exception 'audit action % is not allowed via client RPC', p_action using errcode = '42501';
  end if;
  select email into v_caller_email from public.profiles where id = auth.uid();
  insert into public.audit_log(actor_id, actor_email, action, target, metadata)
    values (auth.uid(), v_caller_email, p_action, p_target, coalesce(p_metadata, '{}'::jsonb))
    returning * into v_row;
  return v_row;
end $$;

revoke all on function public.record_client_audit(text, text, jsonb) from public;
grant execute on function public.record_client_audit(text, text, jsonb) to authenticated;

-- ----- 4. holder_added — register as operational (no resolution needed) ----
-- DEFAULT_THRESHOLDS lives client-side in committee.js, so the registration
-- is a JS change. But the EXECUTOR-side is here: this RPC lets an admin emit
-- a holder_added event directly, scoped by role.
create or replace function public.add_holder(
  p_id int,
  p_name text,
  p_dept text default null,
  p_title text default null,
  p_nat text default null,
  p_ic text default null,
  p_email text default null
) returns public.events
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  v_event public.events;
begin
  if public.profile_role() not in ('admin','committee') then
    raise exception 'only admin/committee can add holders' using errcode = '42501';
  end if;
  if p_id is null or p_name is null or length(trim(p_name)) = 0 then
    raise exception 'id and name are required';
  end if;
  v_event := public.append_event(
    'holder_added',
    jsonb_build_object(
      'id', p_id,
      'name', p_name,
      'dept', p_dept,
      'title', p_title,
      'nat', p_nat,
      'ic', p_ic,
      'email', p_email,
      'status', 'active'
    )
  );
  return v_event;
end $$;
revoke all on function public.add_holder(int, text, text, text, text, text, text) from public;
grant execute on function public.add_holder(int, text, text, text, text, text, text) to authenticated;

-- ----- 5. Partial-unique index on pending payments ------------------------
-- Two pending payments with the same (holder, amount) — almost certainly a
-- double-click. Confirmed/cancelled payments are not constrained.
create unique index if not exists payments_no_dup_pending
  on public.payments (holder_id, amount_sgd)
  where status = 'pending';
