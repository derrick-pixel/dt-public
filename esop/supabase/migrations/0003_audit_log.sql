create table public.audit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  actor_id uuid references public.profiles(id),
  actor_email text,
  action text not null,
  target text,
  ip inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb
);

create index audit_log_at_idx on public.audit_log(at desc);
create index audit_log_actor_email_idx on public.audit_log(actor_email, at desc);
create index audit_log_action_idx on public.audit_log(action, at desc);

alter table public.audit_log enable row level security;

create policy audit_log_committee_admin_select on public.audit_log
  for select using (public.profile_role() in ('committee','admin'));

-- No INSERT/UPDATE/DELETE policies. Writes come from triggers and Edge Function service role.
