create table public.events (
  id text primary key,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  at timestamptz not null default now(),
  actor_id uuid references public.profiles(id),
  actor_role text,
  client_ip inet,
  user_agent text,
  prev_hash text,
  hash text not null
);

create index events_at_idx on public.events(at desc);
create index events_type_at_idx on public.events(type, at desc);
create index events_payload_gin on public.events using gin (payload);
create index events_actor_idx on public.events(actor_id);

alter table public.events enable row level security;

-- Holders: see non-holder-scoped events (valuation_added, window_opened, threshold_changed,
-- committee_member_appointed, etc.) OR events whose payload.holder_id matches them.
create policy events_holder_select on public.events
  for select using (
    public.profile_role() = 'holder' and (
      not (payload ? 'holder_id') or
      payload->>'holder_id' = (select holder_id from public.profiles where id = auth.uid())
    )
  );

create policy events_committee_admin_select on public.events
  for select using (public.profile_role() in ('committee','admin'));

-- No INSERT/UPDATE/DELETE policies — all writes via append_event RPC (SECURITY DEFINER).
