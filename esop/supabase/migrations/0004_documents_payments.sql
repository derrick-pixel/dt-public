create table public.documents (
  id uuid primary key default gen_random_uuid(),
  holder_id text not null,
  kind text not null check (kind in ('letter_of_offer','exercise_notice','clawback_notice','plan_pdf')),
  storage_path text,
  status text not null default 'awaiting_signature'
    check (status in ('draft','awaiting_signature','signed','voided')),
  signed_at timestamptz,
  signed_by uuid references public.profiles(id),
  signature_metadata jsonb,
  created_at timestamptz not null default now()
);

create index documents_holder_idx on public.documents(holder_id);
create index documents_status_idx on public.documents(status);

alter table public.documents enable row level security;

create policy documents_holder_select on public.documents
  for select using (
    public.profile_role() = 'holder' and
    holder_id = (select holder_id from public.profiles where id = auth.uid())
  );

create policy documents_committee_admin_select on public.documents
  for select using (public.profile_role() in ('committee','admin'));

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  exercise_event_id text not null references public.events(id),
  holder_id text not null,
  amount_sgd numeric(12,2) not null check (amount_sgd > 0),
  reference text not null unique,
  qr_payload text not null,
  status text not null default 'pending' check (status in ('pending','paid','cancelled')),
  paid_at timestamptz,
  confirmed_by uuid references public.profiles(id),
  confirmation_notes text,
  created_at timestamptz not null default now()
);

create index payments_holder_idx on public.payments(holder_id);
create index payments_status_idx on public.payments(status, created_at desc);
create index payments_exercise_idx on public.payments(exercise_event_id);

alter table public.payments enable row level security;

create policy payments_holder_select on public.payments
  for select using (
    public.profile_role() = 'holder' and
    holder_id = (select holder_id from public.profiles where id = auth.uid())
  );

create policy payments_committee_admin_select on public.payments
  for select using (public.profile_role() in ('committee','admin'));
