-- Verifies profiles RLS: holder sees own row only; committee/admin sees all.
begin;
set local role postgres;

insert into auth.users(id, email) values
  ('11111111-1111-1111-1111-111111111111','holder@example.com'),
  ('22222222-2222-2222-2222-222222222222','admin@example.com');

insert into public.profiles(id, email, full_name, role, holder_id) values
  ('11111111-1111-1111-1111-111111111111','holder@example.com','Test Holder','holder','H001'),
  ('22222222-2222-2222-2222-222222222222','admin@example.com','Test Admin','admin', null);

-- Holder sees own row only
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
set local role authenticated;
do $$ declare cnt int;
begin
  select count(*) into cnt from public.profiles;
  if cnt <> 1 then raise exception 'holder should see 1, got %', cnt; end if;
end $$;

-- Admin sees both
set local role postgres;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
set local role authenticated;
do $$ declare cnt int;
begin
  select count(*) into cnt from public.profiles;
  if cnt <> 2 then raise exception 'admin should see 2, got %', cnt; end if;
end $$;

rollback;
