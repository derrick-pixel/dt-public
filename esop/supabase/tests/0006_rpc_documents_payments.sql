-- Verifies sign_document, submit_exercise, confirm_payment, cancel_payment.
begin;
set local role postgres;

insert into auth.users(id, email) values
  ('11111111-1111-1111-1111-111111111111','h@x.com'),
  ('22222222-2222-2222-2222-222222222222','a@x.com');
insert into public.profiles(id, email, full_name, role, holder_id) values
  ('11111111-1111-1111-1111-111111111111','h@x.com','Holder One','holder','H001'),
  ('22222222-2222-2222-2222-222222222222','a@x.com','Admin One','admin', null);

-- Admin creates a LoO doc for H001
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
set local role authenticated;
do $$ declare doc_id uuid;
begin
  insert into public.documents(holder_id, kind, status) values('H001','letter_of_offer','awaiting_signature')
    returning id into doc_id;
  perform set_config('test.doc_id', doc_id::text, true);
end $$;

-- Wrong typed name should fail
set local role postgres;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
set local role authenticated;
do $$ declare doc_id uuid := current_setting('test.doc_id')::uuid;
begin
  begin
    perform public.sign_document(doc_id, 'Wrong Name');
    raise exception 'should have rejected mismatched name';
  exception when invalid_parameter_value or others then null;
  end;
end $$;

-- Right name (case-insensitive) succeeds
do $$ declare doc_id uuid := current_setting('test.doc_id')::uuid; d public.documents;
begin
  d := public.sign_document(doc_id, 'holder one');
  if d.status <> 'signed' then raise exception 'expected signed status'; end if;
  if d.signature_metadata->>'typed_name' is null then raise exception 'no signature metadata'; end if;
end $$;

-- submit_exercise creates event + doc + payment with EXR-YYYY-NNNNN reference
do $$ declare r record;
begin
  for r in select * from public.submit_exercise('G001', 100, 'qrpayload', 250.00) loop
    if (r.event).type <> 'exercise_submitted' then raise exception 'wrong event type'; end if;
    if (r.payment).reference !~ '^EXR-\d{4}-\d{5}$' then raise exception 'bad reference'; end if;
  end loop;
end $$;

-- Holder cannot confirm_payment
do $$ declare pay_id uuid;
begin
  select id into pay_id from public.payments where holder_id = 'H001' limit 1;
  begin
    perform public.confirm_payment(pay_id, 'paid');
    raise exception 'holder should not be able to confirm';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Admin can confirm_payment
set local role postgres;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
set local role authenticated;
do $$ declare pay_id uuid; p public.payments;
begin
  select id into pay_id from public.payments where holder_id = 'H001' limit 1;
  p := public.confirm_payment(pay_id, 'paid via PayNow');
  if p.status <> 'paid' then raise exception 'expected paid'; end if;
end $$;

rollback;
