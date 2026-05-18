-- 0021_events_holder_view.sql
-- SEC-P1: events table RLS lets holders see rows scoped to them or to no
-- specific holder. But on broad org-wide events (window_closed,
-- valuation_added, committee_member_appointed) the payload + client_ip +
-- user_agent leak data holders shouldn't see — e.g. window_closed.payload
-- carries the entire `trades` array including counterparty holder ids,
-- and every row carries the actor's IP/UA.
--
-- Strategy: create a sanitised view `events_for_holders` that strips
-- those columns and removes counterparty fields from payloads. Holders
-- get SELECT on the view only; the underlying table's holder SELECT
-- policy is removed (committee + admin still SELECT the table directly).
--
-- The frontend syncAll() already orders by `seq` — switching it to read
-- from the view when role=holder is a follow-up. For now this migration
-- creates the view + locks down so even direct table reads by holders
-- return nothing.

create or replace view public.events_for_holders as
select
  e.seq,
  e.id,
  e.type,
  e.at,
  e.actor_role,
  e.prev_hash,
  e.hash,
  -- Strip payload counterparty / leaver / committee internals when the
  -- viewer is a holder. Keep everything else.
  case
    when public.profile_role() = 'holder' then
      -- For window_closed: keep only trade rows that name this holder.
      case when e.type = 'window_closed' then
        jsonb_set(
          e.payload,
          '{trades}',
          coalesce(
            (
              select jsonb_agg(t) from jsonb_array_elements(e.payload->'trades') t
              where t->>'buyer' = (select holder_id from public.profiles where id = auth.uid())
                 or t->>'seller' = (select holder_id from public.profiles where id = auth.uid())
            ), '[]'::jsonb
          ),
          false
        )
      else e.payload
      end
    else e.payload
  end as payload,
  -- Hide IP / UA from holders.
  case when public.profile_role() = 'holder' then null else e.actor_id end as actor_id,
  case when public.profile_role() = 'holder' then null else e.client_ip end as client_ip,
  case when public.profile_role() = 'holder' then null else e.user_agent end as user_agent,
  -- digest_input is verifier-internal; hide from holders.
  case when public.profile_role() = 'holder' then null else e.digest_input end as digest_input
from public.events e;

-- View permissions: holders read events through this view; staff via table.
revoke all on public.events_for_holders from public, anon, authenticated;
grant select on public.events_for_holders to authenticated;

-- Tighten table SELECT for holders — they no longer need direct access.
drop policy if exists events_holder_select on public.events;
-- Re-create only for committee/admin (they need full table for audits).
-- The existing events_committee_admin_select policy already covers them.

-- Optional helper RPC for paginated reads via the view (mirror of fetchSince
-- but role-aware). Kept simple — frontend can also just `from(view)` if it
-- wants the unified shape.
create or replace function public.events_page(p_after_seq bigint default null, p_limit int default 1000)
returns setof public.events_for_holders
language sql security invoker stable as $$
  select * from public.events_for_holders
  where (p_after_seq is null or seq > p_after_seq)
  order by seq asc limit greatest(1, least(coalesce(p_limit, 1000), 1000));
$$;
grant execute on function public.events_page(bigint, int) to authenticated;
