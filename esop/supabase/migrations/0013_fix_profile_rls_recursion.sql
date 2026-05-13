-- Fix RLS recursion that bricked sign-in.
--
-- The original profiles_committee_admin_select policy did:
--   exists (select 1 from public.profiles p where p.id = auth.uid() ...)
-- That subquery on profiles is itself subject to profiles RLS, which Postgres
-- detects as recursion and denies. The denial cascaded so even profiles_self_select
-- couldn't return the caller's own row consistently — sign-in failed with
-- "Cannot read properties of null (reading 'kind')" on the client.
--
-- Fix: make profile_role() SECURITY DEFINER so its inner select bypasses RLS,
-- then express the committee/admin policy as a flat call to it.

create or replace function public.profile_role() returns text
  language sql stable security definer set search_path = public, pg_temp as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all on function public.profile_role() from public;
grant execute on function public.profile_role() to authenticated;

drop policy if exists profiles_committee_admin_select on public.profiles;
create policy profiles_committee_admin_select on public.profiles
  for select using (public.profile_role() in ('committee','admin'));
