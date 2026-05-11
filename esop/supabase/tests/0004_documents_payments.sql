-- Verifies documents + payments RLS isolate by holder_id.
begin;
set local role postgres;

insert into auth.users(id, email) values ('11111111-1111-1111-1111-111111111111','h@x.com');
insert into public.profiles(id, email, full_name, role, holder_id)
  values ('11111111-1111-1111-1111-111111111111','h@x.com','H','holder','H001');

insert into public.events(id, type, payload, hash)
  values ('ev_e1','exercise_submitted','{"holder_id":"H001"}'::jsonb,'h');

insert into public.documents(id, holder_id, kind, status) values
  (gen_random_uuid(),'H001','letter_of_offer','awaiting_signature'),
  (gen_random_uuid(),'H002','letter_of_offer','awaiting_signature');

insert into public.payments(exercise_event_id, holder_id, amount_sgd, reference, qr_payload) values
  ('ev_e1','H001',100.00,'EXR-2026-00001','qr1');

set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
set local role authenticated;
do $$ declare doc_cnt int; pay_cnt int;
begin
  select count(*) into doc_cnt from public.documents;
  select count(*) into pay_cnt from public.payments;
  if doc_cnt <> 1 then raise exception 'holder should see 1 doc, got %', doc_cnt; end if;
  if pay_cnt <> 1 then raise exception 'holder should see 1 payment, got %', pay_cnt; end if;
end $$;

rollback;
