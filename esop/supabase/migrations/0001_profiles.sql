create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('holder','committee','admin')),
  holder_id text,
  committee_seat text check (committee_seat in ('major','senior') or committee_seat is null),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_holder_id_idx on public.profiles(holder_id);
create index profiles_role_idx on public.profiles(role);

alter table public.profiles enable row level security;

create policy profiles_self_select on public.profiles
  for select using (id = auth.uid());

create policy profiles_committee_admin_select on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('committee','admin'))
  );

create policy profiles_self_update on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Named profile_role (NOT current_role) — `current_role` is a reserved
-- Postgres keyword aliasing CURRENT_USER. Unqualified or unaware callers
-- would silently get the connection role instead of the profile role.
create or replace function public.profile_role() returns text language sql stable as $$
  select role from public.profiles where id = auth.uid();
$$;
