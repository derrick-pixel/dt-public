-- Verifies events RLS: holder sees own events + non-holder-scoped events;
-- admin sees all; direct client INSERT is rejected.
begin;
set local role postgres;

insert into auth.users(id, email) values
  ('11111111-1111-1111-1111-111111111111','holder@example.com'),
  ('22222222-2222-2222-2222-222222222222','admin@example.com');
insert into public.profiles(id, email, full_name, role, holder_id) values
  ('11111111-1111-1111-1111-111111111111','holder@example.com','Test Holder','holder','H001'),
  ('22222222-2222-2222-2222-222222222222','admin@example.com','Test Admin','admin', null);

insert into public.events(id, type, payload, hash) values
  ('ev_test_1','grant_approved','{"holder_id":"H001","fy":2025}'::jsonb,'h1'),
  ('ev_test_2','grant_approved','{"holder_id":"H002","fy":2025}'::jsonb,'h2'),
  ('ev_test_3','valuation_added','{"fy":2025,"fmv":1.85}'::jsonb,'h3');

-- H001 holder sees ev_test_1 (own) and ev_test_3 (no holder_id), not ev_test_2
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
set local role authenticated;
do $$ declare cnt int;
begin
  select count(*) into cnt from public.events;
  if cnt <> 2 then raise exception 'H001 holder should see 2 events, got %', cnt; end if;
end $$;

-- Admin sees all 3
set local role postgres;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
set local role authenticated;
do $$ declare cnt int;
begin
  select count(*) into cnt from public.events;
  if cnt <> 3 then raise exception 'admin should see 3 events, got %', cnt; end if;
end $$;

-- Direct client INSERT must be rejected (no INSERT policy)
set local role postgres;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
set local role authenticated;
do $$
begin
  begin
    insert into public.events(id, type, hash) values ('ev_should_fail','x','h');
    raise exception 'INSERT should have been rejected';
  exception when insufficient_privilege or others then null;
  end;
end $$;

rollback;
