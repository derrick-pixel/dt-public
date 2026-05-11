create or replace view public.activity_unified as
  select
    e.at,
    p.email as actor_email,
    e.actor_role,
    e.type as action,
    coalesce(e.payload->>'holder_id', e.payload->>'document_id', e.payload->>'reference', '') as target,
    e.client_ip as ip,
    e.user_agent,
    e.payload as metadata
  from public.events e
  left join public.profiles p on p.id = e.actor_id
  union all
  select
    a.at, a.actor_email, null as actor_role, a.action, a.target, a.ip, a.user_agent, a.metadata
  from public.audit_log a;

create or replace function public.activity_log(
  p_from timestamptz default now() - interval '30 days',
  p_to timestamptz default now(),
  p_actor_email text default null,
  p_action_prefix text default null,
  p_ip_contains text default null,
  p_limit int default 100,
  p_offset int default 0
) returns setof public.activity_unified
language sql stable security definer set search_path = public, pg_temp as $$
  select * from public.activity_unified
  where at between p_from and p_to
    and (p_actor_email is null or actor_email ilike '%'||p_actor_email||'%')
    and (p_action_prefix is null or action like p_action_prefix||'%')
    and (p_ip_contains is null or ip::text like '%'||p_ip_contains||'%')
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('committee','admin'))
  order by at desc
  limit p_limit offset p_offset;
$$;

revoke all on function public.activity_log(timestamptz, timestamptz, text, text, text, int, int) from public;
grant execute on function public.activity_log(timestamptz, timestamptz, text, text, text, int, int) to authenticated;
