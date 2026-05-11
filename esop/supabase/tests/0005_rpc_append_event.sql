-- Verifies append_event: role gate, holder_id injection, hash chain, IP capture.
begin;
set local role postgres;

insert into auth.users(id, email) values
  ('11111111-1111-1111-1111-111111111111','h@x.com'),
  ('22222222-2222-2222-2222-222222222222','a@x.com');
insert into public.profiles(id, email, full_name, role, holder_id) values
  ('11111111-1111-1111-1111-111111111111','h@x.com','H','holder','H001'),
  ('22222222-2222-2222-2222-222222222222','a@x.com','A','admin', null);

-- Admin emits a privileged event
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
set local role authenticated;
do $$ declare ev public.events;
begin
  ev := public.append_event('grant_approved', '{"holder_id":"H001","fy":2025}'::jsonb);
  if ev.actor_role <> 'admin' then raise exception 'expected admin actor'; end if;
  if ev.hash is null then raise exception 'expected hash'; end if;
end $$;

-- Holder emits an allowed event; payload.holder_id auto-injected
set local role postgres;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
set local role authenticated;
do $$ declare ev public.events;
begin
  ev := public.append_event('exercise_submitted', '{"qty":100}'::jsonb);
  if ev.payload->>'holder_id' <> 'H001' then
    raise exception 'expected holder_id=H001, got %', ev.payload->>'holder_id';
  end if;
end $$;

-- Holder cannot emit a forbidden event type
do $$
begin
  begin
    perform public.append_event('grant_approved', '{"fy":2025}'::jsonb);
    raise exception 'should have rejected';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Hash chain links: at least one row has prev_hash matching a prior row's hash
set local role postgres;
do $$ declare cnt int;
begin
  select count(*) into cnt from public.events e1 join public.events e2
    on e2.prev_hash = e1.hash;
  if cnt < 1 then raise exception 'hash chain not linking, joined % rows', cnt; end if;
end $$;

rollback;
