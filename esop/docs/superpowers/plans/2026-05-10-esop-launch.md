# Elitez ESOP Internal Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the localStorage-only ESOP platform with a multi-user Supabase-backed product covering real auth, e-signing, PayNow QR exercise, and full audit logging — ready for internal launch in two weeks.

**Architecture:** Static site on Cloudflare Pages at `esop.derrickteo.com` (migrating to `esop.elitez.com.sg`). Browser talks directly to Supabase via `@supabase/supabase-js` (anon key); RLS policies and `SECURITY DEFINER` RPCs are the authorisation surface. One Edge Function (`admin-invite`) holds the service-role key. Existing localStorage event store becomes a read-through cache; Supabase is the source of truth.

**Tech Stack:** Supabase (Postgres + Auth + Storage + Edge Functions), `@supabase/supabase-js` v2 via CDN, jsPDF + html2canvas (already used), Resend SMTP for email, Cloudflare Pages for hosting, Wrangler CLI for deploy, Supabase CLI for schema migrations.

**Spec:** `docs/superpowers/specs/2026-05-10-esop-launch-design.md` (committed at `210a69d`).

---

## Conventions used in this plan

- All Supabase migrations go in `supabase/migrations/NNNN_<name>.sql`. Apply locally with `supabase db reset` and to the project with `supabase db push`.
- All Edge Functions go in `supabase/functions/<name>/index.ts`. Deploy with `supabase functions deploy <name>`.
- SQL "tests" run as inline assertions inside a transaction in `supabase/tests/<name>.sql`. Failure mode: assertions raise an exception. Run with `supabase db execute --file supabase/tests/<name>.sql`.
- Commit after every task. Pre-commit hook (gitleaks) is on the repo.
- Browser smoke tests are documented inline as **Manual smoke** blocks.
- **XSS hygiene:** every JS module that uses `innerHTML` with values from the database must declare a local `esc()` helper at the top and pipe DB values through it. Helper:

```js
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));
```

For static UI strings that are author-controlled, raw template literals are fine.

---

## Task 1: Provision Supabase project and CLI scaffolding

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/.gitignore`
- Modify: `.gitignore` (add `.env.local`)
- Create: `.env.example`

- [ ] **Step 1: Install Supabase CLI**

```bash
brew install supabase/tap/supabase
supabase --version  # expect 1.x or newer
```

- [ ] **Step 2: Create the project on supabase.com**

Manual: log in to supabase.com → Create new project → name `elitez-esop` → region `Southeast Asia (Singapore)` → strong db password → save URL and anon key.

- [ ] **Step 3: Initialise Supabase locally**

```bash
cd /Users/derrickteo/codings/Elitez-ESOP
supabase init
```

This creates `supabase/config.toml`. Edit it: under `[auth]`, set `site_url = "https://esop.derrickteo.com"` and `additional_redirect_urls = ["https://esop.elitez.com.sg", "http://localhost:8000"]`.

- [ ] **Step 4: Link to the remote project**

```bash
supabase link --project-ref <project-ref-from-supabase-dashboard>
```

- [ ] **Step 5: Create `.env.example`**

```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
# Service role only used by Edge Functions, never in browser
```

- [ ] **Step 6: Commit**

```bash
git add supabase/config.toml supabase/.gitignore .env.example .gitignore
git commit -m "chore: scaffold Supabase project + config"
```

---

## Task 2: Convert `assets/data.js` to `assets/data.json`

**Files:**
- Create: `assets/data.json` (extracted from current `assets/data.js`)
- Modify: `assets/data.js` (becomes a thin loader that reads the JSON)

JSON is safer for the seed-migration generator than evaluating JS.

- [ ] **Step 1: Create `assets/data.json`**

Take the literal currently assigned to `window.ESOP_DATA` in `assets/data.js` and save it as standalone JSON. Verify it parses:

```bash
python3 -c "import json; json.load(open('assets/data.json'))" && echo OK
```

- [ ] **Step 2: Replace `assets/data.js` with a JSON loader**

```js
// Loads assets/data.json synchronously into window.ESOP_DATA.
// Transitional shim; deleted once Task 27 cleanup runs.
(function () {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "assets/data.json", false);
  xhr.send();
  window.ESOP_DATA = JSON.parse(xhr.responseText);
})();
```

- [ ] **Step 3: Manual smoke**

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. Expected: pages load identically; `console.log(window.ESOP_DATA)` shows the same object.

- [ ] **Step 4: Commit**

```bash
git add assets/data.json assets/data.js
git commit -m "chore: extract seed to data.json (loader stays for now)"
```

---

## Task 3: Schema — `profiles` with RLS

**Files:**
- Create: `supabase/migrations/0001_profiles.sql`
- Create: `supabase/tests/0001_profiles.sql`

- [ ] **Step 1: Write the migration**

```sql
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

create or replace function public.current_role() returns text language sql stable as $$
  select role from public.profiles where id = auth.uid();
$$;
```

- [ ] **Step 2: Write the test**

```sql
begin;
set local role postgres;

insert into auth.users(id, email) values
  ('11111111-1111-1111-1111-111111111111','holder@example.com'),
  ('22222222-2222-2222-2222-222222222222','admin@example.com');

insert into public.profiles(id, email, full_name, role, holder_id) values
  ('11111111-1111-1111-1111-111111111111','holder@example.com','Test Holder','holder','H001'),
  ('22222222-2222-2222-2222-222222222222','admin@example.com','Test Admin','admin', null);

set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
set local role authenticated;
do $$ declare cnt int;
begin
  select count(*) into cnt from public.profiles;
  if cnt <> 1 then raise exception 'holder should see 1, got %', cnt; end if;
end $$;

set local role postgres;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
set local role authenticated;
do $$ declare cnt int;
begin
  select count(*) into cnt from public.profiles;
  if cnt <> 2 then raise exception 'admin should see 2, got %', cnt; end if;
end $$;

rollback;
```

- [ ] **Step 3: Apply locally and run the test**

```bash
supabase db reset
supabase db execute --file supabase/tests/0001_profiles.sql
```

Expected: no exception. If raised, the policy is wrong.

- [ ] **Step 4: Push to remote**

```bash
supabase db push
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0001_profiles.sql supabase/tests/0001_profiles.sql
git commit -m "schema: profiles table with role-based RLS"
```

---

## Task 4: Schema — `events` (append-only, hash-chained)

**Files:**
- Create: `supabase/migrations/0002_events.sql`
- Create: `supabase/tests/0002_events.sql`

- [ ] **Step 1: Write the migration**

```sql
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

create policy events_holder_select on public.events
  for select using (
    public.current_role() = 'holder' and (
      not (payload ? 'holder_id') or
      payload->>'holder_id' = (select holder_id from public.profiles where id = auth.uid())
    )
  );

create policy events_committee_admin_select on public.events
  for select using (public.current_role() in ('committee','admin'));
```

- [ ] **Step 2: Write the test**

```sql
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

set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
set local role authenticated;
do $$ declare cnt int;
begin
  select count(*) into cnt from public.events;
  if cnt <> 2 then raise exception 'H001 holder should see 2 events, got %', cnt; end if;
end $$;

set local role postgres;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
set local role authenticated;
do $$ declare cnt int;
begin
  select count(*) into cnt from public.events;
  if cnt <> 3 then raise exception 'admin should see 3 events, got %', cnt; end if;
end $$;

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
```

- [ ] **Step 3: Apply and run**

```bash
supabase db reset
supabase db execute --file supabase/tests/0001_profiles.sql
supabase db execute --file supabase/tests/0002_events.sql
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0002_events.sql supabase/tests/0002_events.sql
git commit -m "schema: events table with hash chain + holder-scoped RLS"
```

---

## Task 5: Schema — `audit_log`

**Files:**
- Create: `supabase/migrations/0003_audit_log.sql`

- [ ] **Step 1: Write the migration**

```sql
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
  for select using (public.current_role() in ('committee','admin'));
```

- [ ] **Step 2: Apply and verify**

```bash
supabase db reset
for f in supabase/tests/*.sql; do supabase db execute --file "$f"; done
psql "$SUPABASE_DB_URL" -c "\d public.audit_log"
```

Expected: table exists with the columns above, RLS enabled.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0003_audit_log.sql
git commit -m "schema: audit_log table with committee/admin SELECT only"
```

---

## Task 6: Schema — `documents` and `payments`

**Files:**
- Create: `supabase/migrations/0004_documents_payments.sql`
- Create: `supabase/tests/0004_documents_payments.sql`

- [ ] **Step 1: Write the migration**

```sql
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
    public.current_role() = 'holder' and
    holder_id = (select holder_id from public.profiles where id = auth.uid())
  );

create policy documents_committee_admin_select on public.documents
  for select using (public.current_role() in ('committee','admin'));

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
    public.current_role() = 'holder' and
    holder_id = (select holder_id from public.profiles where id = auth.uid())
  );

create policy payments_committee_admin_select on public.payments
  for select using (public.current_role() in ('committee','admin'));
```

- [ ] **Step 2: Write the test**

```sql
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
```

- [ ] **Step 3: Apply and run**

```bash
supabase db reset
for f in supabase/tests/*.sql; do supabase db execute --file "$f"; done
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0004_documents_payments.sql supabase/tests/0004_documents_payments.sql
git commit -m "schema: documents + payments with holder-scoped RLS"
```

---

## Task 7: RPC — `append_event`

**Files:**
- Create: `supabase/migrations/0005_rpc_append_event.sql`
- Create: `supabase/tests/0005_rpc_append_event.sql`

- [ ] **Step 1: Write the migration**

```sql
create extension if not exists pgcrypto;

create or replace function public._can_emit(role_name text, event_type text) returns boolean
language sql immutable as $$
  select case
    when role_name in ('committee','admin') then true
    when role_name = 'holder' and event_type in (
      'letter_of_offer_signed','exercise_notice_signed','exercise_submitted','document_viewed'
    ) then true
    else false
  end;
$$;

create or replace function public.append_event(p_type text, p_payload jsonb)
returns public.events
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_role text := public.current_role();
  v_holder text;
  v_prev_hash text;
  v_id text;
  v_at timestamptz := now();
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
  v_ip inet;
  v_ua text;
  v_event public.events;
begin
  if v_role is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;
  if not public._can_emit(v_role, p_type) then
    raise exception 'role % cannot emit %', v_role, p_type using errcode = '42501';
  end if;

  if v_role = 'holder' then
    select holder_id into v_holder from public.profiles where id = auth.uid();
    if v_holder is null then
      raise exception 'holder profile missing holder_id' using errcode = '22023';
    end if;
    v_payload := jsonb_set(v_payload, '{holder_id}', to_jsonb(v_holder), true);
  end if;

  begin
    v_ip := nullif(current_setting('request.headers', true)::json->>'x-forwarded-for','')::inet;
  exception when others then v_ip := null; end;
  begin
    v_ua := current_setting('request.headers', true)::json->>'user-agent';
  exception when others then v_ua := null; end;

  select hash into v_prev_hash from public.events order by at desc, id desc limit 1;

  v_id := 'ev_' || replace(gen_random_uuid()::text,'-','');

  insert into public.events(id, type, payload, at, actor_id, actor_role, client_ip, user_agent, prev_hash, hash)
  values (
    v_id, p_type, v_payload, v_at, auth.uid(), v_role, v_ip, v_ua, v_prev_hash,
    encode(digest(coalesce(v_prev_hash,'') || p_type || v_at::text || v_payload::text, 'sha256'), 'hex')
  )
  returning * into v_event;

  return v_event;
end $$;

revoke all on function public.append_event(text, jsonb) from public;
grant execute on function public.append_event(text, jsonb) to authenticated;
```

- [ ] **Step 2: Write the test**

```sql
begin;
set local role postgres;

insert into auth.users(id, email) values
  ('11111111-1111-1111-1111-111111111111','h@x.com'),
  ('22222222-2222-2222-2222-222222222222','a@x.com');
insert into public.profiles(id, email, full_name, role, holder_id) values
  ('11111111-1111-1111-1111-111111111111','h@x.com','H','holder','H001'),
  ('22222222-2222-2222-2222-222222222222','a@x.com','A','admin', null);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
set local role authenticated;
do $$ declare ev public.events;
begin
  ev := public.append_event('grant_approved', '{"holder_id":"H001","fy":2025}'::jsonb);
  if ev.actor_role <> 'admin' then raise exception 'expected admin actor'; end if;
  if ev.hash is null then raise exception 'expected hash'; end if;
end $$;

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

do $$
begin
  begin
    perform public.append_event('grant_approved', '{"fy":2025}'::jsonb);
    raise exception 'should have rejected';
  exception when insufficient_privilege then null;
  end;
end $$;

set local role postgres;
do $$ declare cnt int;
begin
  select count(*) into cnt from public.events e1 join public.events e2
    on e2.prev_hash = e1.hash;
  if cnt < 1 then raise exception 'hash chain not linking, joined % rows', cnt; end if;
end $$;

rollback;
```

- [ ] **Step 3: Apply and run**

```bash
supabase db reset
for f in supabase/tests/*.sql; do supabase db execute --file "$f"; done
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0005_rpc_append_event.sql supabase/tests/0005_rpc_append_event.sql
git commit -m "rpc: append_event with role gate, hash chain, IP capture"
```

---

## Task 8: RPCs — `sign_document`, `finalize_signed_document`, `submit_exercise`, `confirm_payment`, `cancel_payment`

**Files:**
- Create: `supabase/migrations/0006_rpc_documents_payments.sql`
- Create: `supabase/tests/0006_rpc_documents_payments.sql`

- [ ] **Step 1: Write the migration**

```sql
create or replace function public.sign_document(p_document_id uuid, p_typed_name text)
returns public.documents
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_doc public.documents;
  v_profile public.profiles;
  v_ip inet;
  v_ua text;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile is null then raise exception 'unauthenticated' using errcode = '42501'; end if;

  select * into v_doc from public.documents where id = p_document_id for update;
  if v_doc is null then raise exception 'document not found' using errcode = '02000'; end if;
  if v_doc.holder_id is distinct from v_profile.holder_id then
    raise exception 'not your document' using errcode = '42501';
  end if;
  if v_doc.status <> 'awaiting_signature' then
    raise exception 'document not signable, status=%', v_doc.status using errcode = '22023';
  end if;
  if lower(trim(p_typed_name)) <> lower(trim(v_profile.full_name)) then
    raise exception 'typed name does not match profile' using errcode = '22023';
  end if;

  begin v_ip := nullif(current_setting('request.headers', true)::json->>'x-forwarded-for','')::inet;
  exception when others then v_ip := null; end;
  begin v_ua := current_setting('request.headers', true)::json->>'user-agent';
  exception when others then v_ua := null; end;

  update public.documents set
    status = 'signed',
    signed_at = now(),
    signed_by = auth.uid(),
    signature_metadata = jsonb_build_object(
      'typed_name', p_typed_name,
      'ip', v_ip,
      'user_agent', v_ua,
      'at', now()
    )
  where id = p_document_id
  returning * into v_doc;

  perform public.append_event(
    case v_doc.kind
      when 'letter_of_offer' then 'letter_of_offer_signed'
      when 'exercise_notice' then 'exercise_notice_signed'
      when 'clawback_notice' then 'clawback_notice_signed'
      else 'document_signed'
    end,
    jsonb_build_object('document_id', v_doc.id, 'holder_id', v_doc.holder_id, 'kind', v_doc.kind)
  );

  return v_doc;
end $$;

revoke all on function public.sign_document(uuid, text) from public;
grant execute on function public.sign_document(uuid, text) to authenticated;

create or replace function public.finalize_signed_document(p_document_id uuid, p_storage_path text)
returns public.documents
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_doc public.documents; v_profile public.profiles;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile is null then raise exception 'unauthenticated' using errcode = '42501'; end if;

  select * into v_doc from public.documents where id = p_document_id;
  if v_doc.holder_id is distinct from v_profile.holder_id and v_profile.role not in ('committee','admin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.documents set storage_path = p_storage_path
  where id = p_document_id returning * into v_doc;

  insert into public.audit_log(actor_id, actor_email, action, target, metadata)
  values (auth.uid(), v_profile.email, 'file_uploaded', v_doc.id::text,
    jsonb_build_object('storage_path', p_storage_path));

  return v_doc;
end $$;

revoke all on function public.finalize_signed_document(uuid, text) from public;
grant execute on function public.finalize_signed_document(uuid, text) to authenticated;

create or replace function public.submit_exercise(p_grant_id text, p_qty int, p_qr_payload text, p_amount_sgd numeric)
returns table (event public.events, document public.documents, payment public.payments)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_holder text;
  v_event public.events;
  v_doc public.documents;
  v_pay public.payments;
  v_year int := extract(year from now());
  v_seq int;
  v_ref text;
begin
  if public.current_role() <> 'holder' then
    raise exception 'only holders can submit exercise' using errcode = '42501';
  end if;
  if p_qty <= 0 then raise exception 'qty must be positive'; end if;
  if p_amount_sgd <= 0 then raise exception 'amount must be positive'; end if;

  select holder_id into v_holder from public.profiles where id = auth.uid();

  select coalesce(max((substring(reference from 'EXR-\d{4}-(\d+)$'))::int), 0) + 1
    into v_seq from public.payments where reference like 'EXR-' || v_year::text || '-%';
  v_ref := 'EXR-' || v_year::text || '-' || lpad(v_seq::text, 5, '0');

  v_event := public.append_event(
    'exercise_submitted',
    jsonb_build_object('grant_id', p_grant_id, 'qty', p_qty, 'amount_sgd', p_amount_sgd, 'reference', v_ref)
  );

  insert into public.documents(holder_id, kind, status)
    values (v_holder, 'exercise_notice', 'awaiting_signature')
    returning * into v_doc;

  insert into public.payments(exercise_event_id, holder_id, amount_sgd, reference, qr_payload)
    values (v_event.id, v_holder, p_amount_sgd, v_ref, p_qr_payload)
    returning * into v_pay;

  return query select v_event, v_doc, v_pay;
end $$;

revoke all on function public.submit_exercise(text, int, text, numeric) from public;
grant execute on function public.submit_exercise(text, int, text, numeric) to authenticated;

create or replace function public.confirm_payment(p_payment_id uuid, p_notes text)
returns public.payments
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_pay public.payments;
begin
  if public.current_role() not in ('committee','admin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.payments set status='paid', paid_at=now(), confirmed_by=auth.uid(), confirmation_notes=p_notes
    where id = p_payment_id and status = 'pending'
    returning * into v_pay;
  if v_pay is null then raise exception 'payment not found or not pending'; end if;

  perform public.append_event('exercise_settled',
    jsonb_build_object('payment_id', v_pay.id, 'holder_id', v_pay.holder_id,
                       'reference', v_pay.reference, 'amount_sgd', v_pay.amount_sgd));
  return v_pay;
end $$;

revoke all on function public.confirm_payment(uuid, text) from public;
grant execute on function public.confirm_payment(uuid, text) to authenticated;

create or replace function public.cancel_payment(p_payment_id uuid, p_reason text)
returns public.payments
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_pay public.payments;
begin
  if public.current_role() not in ('committee','admin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.payments set status='cancelled', confirmed_by=auth.uid(), confirmation_notes=p_reason
    where id = p_payment_id and status = 'pending'
    returning * into v_pay;
  if v_pay is null then raise exception 'payment not found or not pending'; end if;

  perform public.append_event('exercise_cancelled',
    jsonb_build_object('payment_id', v_pay.id, 'holder_id', v_pay.holder_id, 'reason', p_reason));
  return v_pay;
end $$;

revoke all on function public.cancel_payment(uuid, text) from public;
grant execute on function public.cancel_payment(uuid, text) to authenticated;
```

- [ ] **Step 2: Write the test**

```sql
begin;
set local role postgres;

insert into auth.users(id, email) values
  ('11111111-1111-1111-1111-111111111111','h@x.com'),
  ('22222222-2222-2222-2222-222222222222','a@x.com');
insert into public.profiles(id, email, full_name, role, holder_id) values
  ('11111111-1111-1111-1111-111111111111','h@x.com','Holder One','holder','H001'),
  ('22222222-2222-2222-2222-222222222222','a@x.com','Admin One','admin', null);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
set local role authenticated;
do $$ declare doc_id uuid;
begin
  insert into public.documents(holder_id, kind, status) values('H001','letter_of_offer','awaiting_signature')
    returning id into doc_id;
  perform set_config('test.doc_id', doc_id::text, true);
end $$;

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

do $$ declare doc_id uuid := current_setting('test.doc_id')::uuid; d public.documents;
begin
  d := public.sign_document(doc_id, 'holder one');
  if d.status <> 'signed' then raise exception 'expected signed status'; end if;
  if d.signature_metadata->>'typed_name' is null then raise exception 'no signature metadata'; end if;
end $$;

do $$ declare r record;
begin
  for r in select * from public.submit_exercise('G001', 100, 'qrpayload', 250.00) loop
    if (r.event).type <> 'exercise_submitted' then raise exception 'wrong event type'; end if;
    if (r.payment).reference !~ '^EXR-\d{4}-\d{5}$' then raise exception 'bad reference'; end if;
  end loop;
end $$;

do $$ declare pay_id uuid;
begin
  select id into pay_id from public.payments where holder_id = 'H001' limit 1;
  begin
    perform public.confirm_payment(pay_id, 'paid');
    raise exception 'holder should not be able to confirm';
  exception when insufficient_privilege then null;
  end;
end $$;

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
```

- [ ] **Step 3: Apply and run**

```bash
supabase db reset
for f in supabase/tests/*.sql; do supabase db execute --file "$f"; done
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0006_rpc_documents_payments.sql supabase/tests/0006_rpc_documents_payments.sql
git commit -m "rpc: sign_document, submit_exercise, confirm/cancel payment"
```

---

## Task 9: RPCs — `get_document_url` and `update_role`

**Files:**
- Create: `supabase/migrations/0007_rpc_url_role.sql`

- [ ] **Step 1: Write the migration**

```sql
create or replace function public.get_document_url(p_document_id uuid)
returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_doc public.documents;
  v_profile public.profiles;
  v_url text;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile is null then raise exception 'unauthenticated' using errcode = '42501'; end if;

  select * into v_doc from public.documents where id = p_document_id;
  if v_doc is null then raise exception 'not found' using errcode = '02000'; end if;
  if v_doc.holder_id is distinct from v_profile.holder_id and v_profile.role not in ('committee','admin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_doc.storage_path is null then raise exception 'document has no file' using errcode = '02000'; end if;

  select storage.create_signed_url('esop-documents', v_doc.storage_path, 60) into v_url;

  insert into public.audit_log(actor_id, actor_email, action, target, metadata)
  values (auth.uid(), v_profile.email, 'file_downloaded', v_doc.id::text,
    jsonb_build_object('storage_path', v_doc.storage_path));

  return v_url;
end $$;

revoke all on function public.get_document_url(uuid) from public;
grant execute on function public.get_document_url(uuid) to authenticated;

create or replace function public.update_role(p_profile_id uuid, p_new_role text)
returns public.profiles
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_profile public.profiles; v_actor public.profiles;
begin
  select * into v_actor from public.profiles where id = auth.uid();
  if v_actor.role <> 'admin' then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_new_role not in ('holder','committee','admin') then
    raise exception 'invalid role' using errcode = '22023';
  end if;
  update public.profiles set role = p_new_role, updated_at = now() where id = p_profile_id
    returning * into v_profile;
  if v_profile is null then raise exception 'profile not found' using errcode = '02000'; end if;

  insert into public.audit_log(actor_id, actor_email, action, target, metadata)
  values (auth.uid(), v_actor.email, 'role_changed', p_profile_id::text,
    jsonb_build_object('new_role', p_new_role, 'previous_role', v_profile.role));

  return v_profile;
end $$;

revoke all on function public.update_role(uuid, text) from public;
grant execute on function public.update_role(uuid, text) to authenticated;
```

- [ ] **Step 2: Apply**

```bash
supabase db reset
for f in supabase/tests/*.sql; do supabase db execute --file "$f"; done
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0007_rpc_url_role.sql
git commit -m "rpc: get_document_url + update_role"
```

---

## Task 10: `activity_unified` view + storage bucket + auth audit trigger

**Files:**
- Create: `supabase/migrations/0008_activity_view.sql`
- Create: `supabase/migrations/0009_storage_bucket.sql`
- Create: `supabase/migrations/0010_auth_audit_trigger.sql`

- [ ] **Step 1: Activity unified view**

```sql
create or replace view public.activity_unified as
  select
    e.at,
    p.email as actor_email,
    e.actor_role,
    e.type as action,
    coalesce(e.payload->>'holder_id', e.payload->>'document_id', e.payload->>'reference', '') as target,
    e.client_ip as ip,
    e.user_agent,
    e.payload as metadata
  from public.events e
  left join public.profiles p on p.id = e.actor_id
  union all
  select
    a.at, a.actor_email, null as actor_role, a.action, a.target, a.ip, a.user_agent, a.metadata
  from public.audit_log a;

create or replace function public.activity_log(
  p_from timestamptz default now() - interval '30 days',
  p_to timestamptz default now(),
  p_actor_email text default null,
  p_action_prefix text default null,
  p_ip_contains text default null,
  p_limit int default 100,
  p_offset int default 0
) returns setof public.activity_unified
language sql stable security definer set search_path = public, pg_temp as $$
  select * from public.activity_unified
  where at between p_from and p_to
    and (p_actor_email is null or actor_email ilike '%'||p_actor_email||'%')
    and (p_action_prefix is null or action like p_action_prefix||'%')
    and (p_ip_contains is null or ip::text like '%'||p_ip_contains||'%')
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('committee','admin'))
  order by at desc
  limit p_limit offset p_offset;
$$;

revoke all on function public.activity_log(timestamptz, timestamptz, text, text, text, int, int) from public;
grant execute on function public.activity_log(timestamptz, timestamptz, text, text, text, int, int) to authenticated;
```

- [ ] **Step 2: Storage bucket**

```sql
insert into storage.buckets (id, name, public)
  values ('esop-documents','esop-documents', false)
  on conflict (id) do nothing;

create policy "Disallow direct read"
on storage.objects for select to authenticated
using (false);

create policy "Disallow direct upload"
on storage.objects for insert to authenticated
with check (false);
```

- [ ] **Step 3: Auth audit trigger**

```sql
create or replace function public._mirror_auth_audit() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_action text; v_email text;
begin
  v_action := case new.payload->>'action'
    when 'login' then case when (new.payload->>'actor_id') is not null then 'login_success' else 'login_failed' end
    when 'logout' then 'logout'
    when 'user_recovery_requested' then 'password_reset_requested'
    when 'user_updated_password' then 'password_changed'
    when 'user_signedup' then 'password_set'
    when 'user_invited' then 'magic_link_sent'
    else 'auth_' || coalesce(new.payload->>'action', 'unknown')
  end;
  v_email := new.payload->>'actor_username';
  insert into public.audit_log(actor_id, actor_email, action, target, ip, user_agent, metadata)
  values (
    nullif(new.payload->>'actor_id','')::uuid,
    v_email, v_action, v_email,
    nullif(new.ip_address::text,'')::inet,
    null,
    new.payload
  );
  return new;
exception when others then return new;
end $$;

create trigger trg_mirror_auth_audit
after insert on auth.audit_log_entries
for each row execute function public._mirror_auth_audit();
```

- [ ] **Step 4: Apply**

```bash
supabase db reset
for f in supabase/tests/*.sql; do supabase db execute --file "$f"; done
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0008_activity_view.sql supabase/migrations/0009_storage_bucket.sql supabase/migrations/0010_auth_audit_trigger.sql
git commit -m "schema: activity_unified view + storage bucket + auth audit mirror"
```

---

## Task 11: Seed bootstrap migration

**Files:**
- Create: `scripts/build-seed-migration.mjs`
- Create: `supabase/migrations/0011_seed_bootstrap.sql` (generated)

- [ ] **Step 1: Write the seed-builder script**

```js
// scripts/build-seed-migration.mjs
// Reads assets/data.json (NOT data.js — JSON is safer to parse).
// Builds a deterministic SQL migration that seeds events.
// Re-running regenerates byte-identical output.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const data = JSON.parse(readFileSync('assets/data.json', 'utf8'));

const events = [];
for (const h of (data.holders || [])) {
  if (h.fy_2025_grant_qty) {
    events.push({
      type: 'grant_approved',
      payload: {
        holder_id: h.id, fy: 2025,
        grant_date: data.meta?.as_of, letter_date: data.meta?.as_of,
        qty: h.fy_2025_grant_qty
      }
    });
  }
}
for (const v of (data.valuations || [])) {
  events.push({ type: 'valuation_added', payload: v });
  if (v.active) events.push({ type: 'valuation_activated', payload: { fy: v.fy } });
}
for (const m of (data.committee_roster || [])) {
  events.push({ type: 'committee_member_appointed', payload: m });
}
// Add other event types as data.json schema requires.

const ids = events.map((e, i) => {
  const stable = `${i}|${e.type}|${JSON.stringify(e.payload)}`;
  return 'ev_seed_' + createHash('sha256').update(stable).digest('hex').slice(0, 16);
});

const lines = [
  '-- Auto-generated by scripts/build-seed-migration.mjs',
  '-- Idempotent via on conflict do nothing.',
  'begin;'
];
events.forEach((e, i) => {
  const id = ids[i];
  const payloadEsc = JSON.stringify(e.payload).replace(/'/g, "''");
  const at = (data.meta?.as_of || new Date().toISOString().slice(0,10)) + 'T00:00:00Z';
  const prevSelect = i === 0
    ? "''"
    : `coalesce((select hash from public.events where id = '${ids[i-1]}'),'')`;
  const prevInsert = i === 0 ? 'null' : `(select hash from public.events where id = '${ids[i-1]}')`;
  lines.push(`insert into public.events(id, type, payload, at, actor_role, prev_hash, hash)
values('${id}', '${e.type}', '${payloadEsc}'::jsonb, '${at}', 'system',
  ${prevInsert},
  encode(digest(${prevSelect} || '${e.type}' || '${at}' || '${payloadEsc}', 'sha256'), 'hex'))
on conflict (id) do nothing;`);
});
lines.push('commit;');

writeFileSync('supabase/migrations/0011_seed_bootstrap.sql', lines.join('\n'));
console.log(`Generated ${events.length} seed events.`);
```

- [ ] **Step 2: Generate and verify**

```bash
node scripts/build-seed-migration.mjs
wc -l supabase/migrations/0011_seed_bootstrap.sql
head -5 supabase/migrations/0011_seed_bootstrap.sql
```

Expected: file exists, has `begin;` and `commit;` plus N inserts.

- [ ] **Step 3: Apply locally and verify count**

```bash
supabase db reset
for f in supabase/tests/*.sql; do supabase db execute --file "$f"; done
psql "$SUPABASE_DB_URL" -c "select count(*) from public.events;"
```

Expected: count matches the script's printed N.

- [ ] **Step 4: Push to remote**

```bash
supabase db push
```

- [ ] **Step 5: Commit**

```bash
git add scripts/build-seed-migration.mjs supabase/migrations/0011_seed_bootstrap.sql
git commit -m "seed: bootstrap migration replays data.json into events table"
```

---

## Task 12: Bootstrap Derrick as admin

**Files:**
- Create: `supabase/migrations/0012_bootstrap_admin.sql`

- [ ] **Step 1: Manual — create Derrick's auth user**

In Supabase dashboard → Authentication → Add user → email `derrick@elitez.asia` → set a temporary strong password. Note the resulting user UUID.

- [ ] **Step 2: Write the bootstrap migration**

```sql
-- Replace the UUID below with the one from Step 1.
insert into public.profiles (id, email, full_name, role)
values ('PASTE_UUID_HERE', 'derrick@elitez.asia', 'Teo Wen Shan, Derrick', 'admin')
on conflict (id) do update set role = 'admin';
```

- [ ] **Step 3: Apply remote**

```bash
supabase db push
```

- [ ] **Step 4: Verify**

In Supabase dashboard SQL editor: `select * from public.profiles where email = 'derrick@elitez.asia';` — expect role=admin.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0012_bootstrap_admin.sql
git commit -m "bootstrap: Derrick as initial admin"
```

---

## Task 13: Client — `assets/supa.js`

**Files:**
- Create: `assets/supa.js`
- Modify: every HTML page (`index.html`, `portal.html`, `admin.html`, `committee.html`, `trading.html`, `scheme.html`)

- [ ] **Step 1: Create `assets/supa.js`**

```js
(function () {
  const CACHE_KEY = "elitez_esop_cache_v3";
  const CACHE_VERSION = 3;

  const SUPA_URL = window.ESOP_CONFIG?.supabase_url;
  const SUPA_KEY = window.ESOP_CONFIG?.supabase_anon_key;
  if (!SUPA_URL || !SUPA_KEY) {
    console.error("ESOP_CONFIG.supabase_url and supabase_anon_key required.");
    return;
  }
  const supa = window.supabase.createClient(SUPA_URL, SUPA_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });

  const subs = new Set();

  function loadCache() {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (!c || c.version !== CACHE_VERSION) return { events: [], cursor: null };
      return c;
    } catch { return { events: [], cursor: null }; }
  }
  function saveCache(c) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...c, version: CACHE_VERSION }));
  }

  async function fetchSince(cursor) {
    let q = supa.from("events").select("*").order("at", { ascending: true }).limit(1000);
    if (cursor) q = q.gt("id", cursor);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  async function syncAll() {
    let cache = loadCache();
    while (true) {
      const batch = await fetchSince(cache.cursor);
      if (!batch.length) break;
      cache.events.push(...batch);
      cache.cursor = batch[batch.length - 1].id;
      saveCache(cache);
      if (batch.length < 1000) break;
    }
    return cache.events;
  }

  async function appendEvent(type, payload) {
    const { data, error } = await supa.rpc("append_event", { p_type: type, p_payload: payload || {} });
    if (error) throw error;
    const cache = loadCache();
    cache.events.push(data);
    cache.cursor = data.id;
    saveCache(cache);
    notify(data);
    return data;
  }

  function notify(ev) {
    subs.forEach(fn => { try { fn(ev); } catch (e) { console.error(e); } });
  }
  function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }

  function startRealtime() {
    supa.channel("events-stream")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, payload => {
        const ev = payload.new;
        const cache = loadCache();
        if (cache.events.some(x => x.id === ev.id)) return;
        cache.events.push(ev);
        cache.cursor = ev.id;
        saveCache(cache);
        notify(ev);
      })
      .subscribe();
  }

  window.ESOPSupa = { client: supa, syncAll, appendEvent, subscribe, startRealtime, loadCache };
})();
```

- [ ] **Step 2: Wire into every HTML page**

Add to `<head>` (above `assets/auth.js`):

```html
<script>
  window.ESOP_CONFIG = {
    supabase_url: "https://<project-ref>.supabase.co",
    supabase_anon_key: "<anon-key>"
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="assets/supa.js"></script>
```

- [ ] **Step 3: Manual smoke**

```bash
python3 -m http.server 8000
```

In DevTools console:

```js
await ESOPSupa.client.auth.signInWithPassword({ email: "derrick@elitez.asia", password: "<temp>" });
const events = await ESOPSupa.syncAll();
console.log(events.length);
```

Expected: returns the seed event count from Task 11.

- [ ] **Step 4: Commit**

```bash
git add assets/supa.js index.html portal.html admin.html committee.html trading.html scheme.html
git commit -m "client: supa.js with init, sync engine, realtime"
```

---

## Task 14: Rewrite `assets/auth.js`

**Files:**
- Modify: `assets/auth.js` (full rewrite)

- [ ] **Step 1: Read current public API**

```bash
grep -n "ESOPAuth\." assets/*.js *.html
```

Note every method consumed.

- [ ] **Step 2: Rewrite `assets/auth.js`**

```js
(function () {
  const supa = window.ESOPSupa.client;
  let cachedProfile = null;

  async function currentSession() {
    const { data } = await supa.auth.getSession();
    if (!data.session) return null;
    if (!cachedProfile) {
      const { data: p } = await supa.from("profiles").select("*").eq("id", data.session.user.id).single();
      cachedProfile = p;
    }
    return {
      kind: cachedProfile.role,
      id: cachedProfile.holder_id || cachedProfile.id,
      name: cachedProfile.full_name,
      email: cachedProfile.email,
      label: cachedProfile.full_name,
      issued_at: data.session.created_at,
      expires_at: data.session.expires_at * 1000
    };
  }

  async function requireSession(allowedKinds) {
    const s = await currentSession();
    if (!s) { window.location.href = "index.html"; return null; }
    if (allowedKinds && !allowedKinds.includes(s.kind)) {
      alert("Access denied for your role."); window.location.href = "index.html"; return null;
    }
    return s;
  }

  async function login(email, password) {
    const { error } = await supa.auth.signInWithPassword({ email, password });
    if (error) throw error;
    cachedProfile = null;
    return await currentSession();
  }

  async function logout() {
    await supa.auth.signOut();
    cachedProfile = null;
    window.location.href = "index.html";
  }

  async function changePassword(current, next) {
    const session = await currentSession();
    if (!session) throw new Error("not signed in");
    const { error: e1 } = await supa.auth.signInWithPassword({ email: session.email, password: current });
    if (e1) throw new Error("Current password incorrect");
    const { error: e2 } = await supa.auth.updateUser({ password: next });
    if (e2) throw e2;
  }

  async function requestPasswordReset(email) {
    const { error } = await supa.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password.html"
    });
    if (error) throw error;
  }

  window.ESOPAuth = {
    currentSession, requireSession, login, logout, changePassword, requestPasswordReset
  };
})();
```

- [ ] **Step 3: Update consumers expecting synchronous calls**

```bash
grep -n "ESOPAuth\.currentSession\|ESOPAuth\.requireSession" assets/*.js *.html
```

Any call site that did `const s = ESOPAuth.currentSession()` becomes `const s = await ESOPAuth.currentSession()`. Wrap each affected page-init function in `(async () => { ... })()`.

- [ ] **Step 4: Manual smoke**

Open `index.html`, log in as Derrick. Expected: redirected to `admin.html`; in console, `await ESOPAuth.currentSession()` returns the admin session.

- [ ] **Step 5: Commit**

```bash
git add assets/auth.js portal.html admin.html committee.html trading.html
git commit -m "auth: rewrite around Supabase Auth, remove elitez2026 shared code"
```

---

## Task 15: Login + set/reset password pages

**Files:**
- Modify: `index.html` (login form wiring)
- Create: `set-password.html`
- Create: `reset-password.html`

- [ ] **Step 1: Update `index.html`**

```html
<form id="login-form" class="card form">
  <label>Email <input type="email" name="email" required></label>
  <label>Password <input type="password" name="password" required minlength="12"></label>
  <button type="submit" class="btn-primary">Sign in</button>
  <a href="#" id="forgot-link" class="link">Forgot password?</a>
  <p id="login-error" class="error" hidden></p>
</form>

<script>
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    await ESOPAuth.login(f.email.value, f.password.value);
    const s = await ESOPAuth.currentSession();
    window.location.href = s.kind === "holder" ? "portal.html" : (s.kind === "admin" ? "admin.html" : "committee.html");
  } catch (err) {
    const el = document.getElementById("login-error");
    el.textContent = err.message || "Login failed."; el.hidden = false;
  }
});
document.getElementById("forgot-link").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = prompt("Your work email:");
  if (!email) return;
  await ESOPAuth.requestPasswordReset(email);
  alert("Password reset email sent if the address is registered.");
});
</script>
```

- [ ] **Step 2: Create `set-password.html`**

```html
<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><title>Set Password — Elitez ESOP</title>
<link rel="stylesheet" href="assets/styles.css">
<script>window.ESOP_CONFIG = { supabase_url: "...", supabase_anon_key: "..." };</script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="assets/supa.js"></script>
<script src="assets/auth.js"></script>
</head><body>
<main class="container">
  <h1>Welcome to Elitez ESOP</h1>
  <p>Choose a password (minimum 12 characters).</p>
  <form id="set-form" class="card form">
    <label>New password <input type="password" name="pw" required minlength="12"></label>
    <label>Confirm <input type="password" name="pw2" required minlength="12"></label>
    <button class="btn-primary" type="submit">Set password</button>
    <p id="err" class="error" hidden></p>
  </form>
</main>
<script>
document.getElementById("set-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  if (f.pw.value !== f.pw2.value) {
    const el = document.getElementById("err");
    el.textContent = "Passwords don't match"; el.hidden = false; return;
  }
  const supa = window.ESOPSupa.client;
  const { error } = await supa.auth.updateUser({ password: f.pw.value });
  if (error) { document.getElementById("err").textContent = error.message; return; }
  const s = await ESOPAuth.currentSession();
  window.location.href = s.kind === "holder" ? "portal.html" : (s.kind === "admin" ? "admin.html" : "committee.html");
});
</script>
</body></html>
```

- [ ] **Step 3: Create `reset-password.html`**

Same shell as `set-password.html` with title and heading changed to "Reset your password".

- [ ] **Step 4: Manual smoke**

After Task 17 wires the invite UI, click a magic link from email → land on `set-password.html` → set password → redirected per role.

- [ ] **Step 5: Commit**

```bash
git add index.html set-password.html reset-password.html
git commit -m "pages: login + set-password + reset-password"
```

---

## Task 16: Edge Function — `admin-invite`

**Files:**
- Create: `supabase/functions/admin-invite/index.ts`
- Create: `supabase/functions/admin-invite/deno.test.ts`

- [ ] **Step 1: Write the function**

```ts
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE = Deno.env.get("ESOP_SITE_URL") ?? "https://esop.derrickteo.com";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method", { status: 405 });
  const auth = req.headers.get("authorization");
  if (!auth) return new Response("unauthenticated", { status: 401 });

  const userClient = createClient(SUPA_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } }
  });
  const { data: caller } = await userClient.auth.getUser();
  if (!caller?.user) return new Response("unauthenticated", { status: 401 });

  const admin = createClient(SUPA_URL, SERVICE);
  const { data: callerProfile } = await admin.from("profiles").select("*").eq("id", caller.user.id).single();
  if (callerProfile?.role !== "admin") return new Response("forbidden", { status: 403 });

  const body = await req.json();
  const { email, full_name, role, holder_id } = body;
  if (!email || !full_name || !["holder","committee","admin"].includes(role)) {
    return new Response("bad request", { status: 400 });
  }

  const { data: invite, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${SITE}/set-password.html`,
    data: { full_name, role, holder_id }
  });
  if (error) return new Response(error.message, { status: 400 });

  await admin.from("profiles").upsert({
    id: invite.user.id, email, full_name, role, holder_id: holder_id ?? null
  });

  await admin.from("audit_log").insert({
    actor_id: caller.user.id,
    actor_email: caller.user.email,
    action: "magic_link_sent",
    target: email,
    metadata: { role, holder_id }
  });

  return Response.json({ ok: true, user_id: invite.user.id });
});
```

- [ ] **Step 2: Write the test**

```ts
import { assertEquals } from "jsr:@std/assert";

Deno.test("rejects non-POST", async () => {
  const res = await fetch("http://localhost:54321/functions/v1/admin-invite", { method: "GET" });
  assertEquals(res.status, 405);
});
```

- [ ] **Step 3: Deploy**

```bash
supabase functions deploy admin-invite --no-verify-jwt
supabase secrets set ESOP_SITE_URL=https://esop.derrickteo.com
```

- [ ] **Step 4: Manual smoke**

```bash
curl -X POST "https://<ref>.supabase.co/functions/v1/admin-invite" \
  -H "Authorization: Bearer <derrick's access token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@elitez.asia","full_name":"Test User","role":"holder","holder_id":"H001"}'
```

Expected: 200 with `{"ok":true,"user_id":"..."}`. Email arrives.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/admin-invite/index.ts supabase/functions/admin-invite/deno.test.ts
git commit -m "edge: admin-invite function"
```

---

## Task 17: Roster tab + Invite UI

**Files:**
- Modify: `admin.html` (Roster tab markup)
- Modify: `assets/admin-tabs.js`
- Create: `assets/admin-roster.js`

- [ ] **Step 1: Add Roster tab markup in `admin.html`**

```html
<section id="tab-roster" class="tab-panel" hidden>
  <header><h2>Holder Roster</h2></header>
  <table id="roster-table" class="data-table">
    <thead><tr><th>Holder ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
    <tbody></tbody>
  </table>
  <button id="add-holder" class="btn">Add Holder</button>
</section>
```

- [ ] **Step 2: Create `assets/admin-roster.js`**

```js
(async function () {
  await ESOPAuth.requireSession(["admin","committee"]);
  const supa = window.ESOPSupa.client;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  async function load() {
    const { data: profiles } = await supa.from("profiles").select("*").order("full_name");
    const tbody = document.querySelector("#roster-table tbody");
    tbody.innerHTML = "";
    for (const p of profiles) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${esc(p.holder_id)}</td>
        <td>${esc(p.full_name)}</td>
        <td>${esc(p.email)}</td>
        <td>${esc(p.role)}</td>
        <td>${p.id ? "Active" : "Pending"}</td>
        <td><button class="btn-small" data-email="${esc(p.email)}" data-action="resend">Resend Invite</button></td>
      `;
      tbody.appendChild(tr);
    }
  }

  async function invite(email, full_name, role, holder_id) {
    const { data: { session } } = await supa.auth.getSession();
    const res = await fetch(`${window.ESOP_CONFIG.supabase_url}/functions/v1/admin-invite`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email, full_name, role, holder_id })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  document.getElementById("add-holder").addEventListener("click", async () => {
    const holder_id = prompt("Holder ID (e.g. H001):");
    const full_name = prompt("Full legal name:");
    const email = prompt("Email:");
    const role = prompt("Role (holder/committee/admin):", "holder");
    if (!holder_id || !full_name || !email || !role) return;
    try {
      await invite(email, full_name, role, holder_id);
      alert("Invite sent.");
      load();
    } catch (e) { alert("Invite failed: " + e.message); }
  });

  document.querySelector("#roster-table").addEventListener("click", async (e) => {
    if (e.target.dataset.action !== "resend") return;
    if (!confirm("Resend invite to " + e.target.dataset.email + "?")) return;
    const tr = e.target.closest("tr");
    const cells = tr.querySelectorAll("td");
    await invite(cells[2].textContent, cells[1].textContent, cells[3].textContent, cells[0].textContent);
    alert("Re-sent.");
  });

  await load();
})();
```

- [ ] **Step 3: Register the tab**

In `assets/admin-tabs.js`, add `roster` to the tab list and lazy-load `assets/admin-roster.js` on first activation.

- [ ] **Step 4: Manual smoke**

Sign in as Derrick → admin.html → Roster tab. Expected: see Derrick's profile row. Click "Add Holder" → enter test data → confirm invite email arrives.

- [ ] **Step 5: Commit**

```bash
git add admin.html assets/admin-tabs.js assets/admin-roster.js
git commit -m "admin: Roster tab with invite + resend"
```

---

## Task 18: Lift-and-shift — rewire `store.js`

**Files:**
- Modify: `assets/store.js`

- [ ] **Step 1: Replace `emit()`**

```js
async function emit(type, payload) {
  try {
    const ev = await window.ESOPSupa.appendEvent(type, payload || {});
    events.push(ev);
    subscribers.forEach(fn => { try { fn(ev, state()); } catch (e) { console.error(e); } });
    return ev;
  } catch (err) {
    window.ESOPNotify?.error?.(err.message || "Save failed.");
    throw err;
  }
}
```

- [ ] **Step 2: Replace event-loading**

```js
async function init() {
  events = await window.ESOPSupa.syncAll();
  window.ESOPSupa.subscribe((ev) => {
    if (events.some(x => x.id === ev.id)) return;
    events.push(ev);
    subscribers.forEach(fn => { try { fn(ev, state()); } catch (e) { console.error(e); } });
  });
  window.ESOPSupa.startRealtime();
}
```

Expose `init` and require all pages call `await ESOPStore.init()` before any UI work that reads `state()`.

- [ ] **Step 3: Update each page entrypoint**

For `portal.html`, `admin.html`, `committee.html`, `trading.html`: wrap existing initialisation in:

```js
(async () => {
  await ESOPStore.init();
  // ...existing init code...
})();
```

- [ ] **Step 4: Manual smoke**

Sign in as Derrick. On admin → Approve a draft grant. Expected: page updates, network tab shows successful `append_event` RPC, refresh shows the change persisted.

- [ ] **Step 5: Commit**

```bash
git add assets/store.js portal.html admin.html committee.html trading.html
git commit -m "store: rewire emit/state through Supabase via supa.js"
```

---

## Task 19: Sanity sweep — every existing page works on Supabase

Verification only. Commit only if a fix is needed.

- [ ] **Step 1: Portal page**

Sign in as a test holder (invited via Roster). Expected: vested calc renders, history list shows seed events for that holder.

- [ ] **Step 2: Committee page**

Sign in as Derrick. Expected: roster shows 3 Majors + 2 vacant Senior, can propose a resolution end-to-end.

- [ ] **Step 3: Admin page**

Sign in as Derrick. Expected: all original tabs still work; events emitted via Supabase persist.

- [ ] **Step 4: Trading page**

Sign in as Derrick. Open a synthetic window via Committee → confirm window appears on trading page.

- [ ] **Step 5: Fix any regressions**

For each broken flow: identify the offending file, patch, commit per fix.

```bash
git commit -m "fix: <specific regression> after Supabase rewire"
```

---

## Task 20: SGQR generator module

**Files:**
- Create: `assets/sgqr.js`
- Create: `tests/sgqr.test.html`

- [ ] **Step 1: Create `assets/sgqr.js`**

```js
// Singapore PayNow Corporate (UEN) QR — EMVCo TLV format.
(function () {
  function tlv(id, value) {
    const len = value.length.toString().padStart(2, "0");
    return id + len + value;
  }
  function crc16(s) {
    let crc = 0xFFFF;
    for (const ch of s) {
      crc ^= ch.charCodeAt(0) << 8;
      for (let i = 0; i < 8; i++) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }
  function buildPayNowQR({ uen, amount, reference, editable = false }) {
    if (!uen) throw new Error("uen required");
    if (!(amount > 0)) throw new Error("amount required");

    const tag26 = tlv("00", "SG.PAYNOW")
                + tlv("01", "2")
                + tlv("02", uen)
                + tlv("03", editable ? "1" : "0");

    const tag62 = tlv("01", reference);

    let payload =
        tlv("00", "01")
      + tlv("01", "12")
      + tlv("26", tag26)
      + tlv("52", "0000")
      + tlv("53", "702")
      + tlv("54", amount.toFixed(2))
      + tlv("58", "SG")
      + tlv("59", "ELITEZ GROUP PTE LTD")
      + tlv("60", "Singapore")
      + tlv("62", tag62);

    payload += "6304";
    payload += crc16(payload);
    return payload;
  }
  window.ESOPSGQR = { buildPayNowQR };
})();
```

- [ ] **Step 2: Create the test page**

```html
<!doctype html>
<html><body>
<script src="../assets/sgqr.js"></script>
<script>
const out = ESOPSGQR.buildPayNowQR({ uen: "201912345A", amount: 250.00, reference: "EXR-2026-00001" });
console.log(out);
if (!out.includes("SG.PAYNOW")) throw new Error("missing payload header");
if (!out.includes("EXR-2026-00001")) throw new Error("missing reference");
if (!/6304[0-9A-F]{4}$/.test(out)) throw new Error("bad CRC");
const pre = document.createElement("pre"); pre.textContent = out; document.body.appendChild(pre);
const ok = document.createElement("p"); ok.textContent = "OK"; document.body.appendChild(ok);
</script>
</body></html>
```

- [ ] **Step 3: Open the test page**

```bash
python3 -m http.server 8000
open "http://localhost:8000/tests/sgqr.test.html"
```

Expected: page shows the EMV string and "OK". No console errors.

- [ ] **Step 4: Validate against real banking app**

Render the EMV string to a QR image (`QRCode.toDataURL` from the `qrcode` lib). Open UOB / DBS / OCBC / Trust mobile banking, scan it. Expected: amount and reference pre-fill, recipient name shows ELITEZ GROUP PTE LTD.

- [ ] **Step 5: Commit**

```bash
git add assets/sgqr.js tests/sgqr.test.html
git commit -m "lib: SGQR PayNow Corporate QR generator with CRC16"
```

---

## Task 21: Acceptance + signing modal in portal

**Files:**
- Modify: `portal.html` (modal markup + open trigger)
- Modify: `assets/portal.js` (modal logic)
- Modify: `assets/docs.js` (`renderForSigning` + `renderSignedPdf`)

- [ ] **Step 1: Add modal markup to `portal.html`**

```html
<dialog id="signing-modal" class="modal">
  <header><h2 id="signing-title">Letter of Offer</h2><button class="close" data-close>&times;</button></header>
  <article id="signing-body" class="doc-body"></article>
  <form id="signing-form" class="signing-form">
    <label><input type="checkbox" name="accept" required> I have read and accept the terms of this Letter of Offer.</label>
    <label>Type your full legal name as it appears on your NRIC/Passport:
      <input type="text" name="typed_name" required>
    </label>
    <button class="btn-primary" type="submit">Sign &amp; Submit</button>
    <p id="signing-error" class="error" hidden></p>
  </form>
</dialog>

<section id="pending-signatures" hidden>
  <h3>Action required</h3>
  <ul id="pending-list"></ul>
</section>
```

- [ ] **Step 2: Wire `assets/portal.js`**

```js
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

async function refreshPendingSignatures() {
  const supa = window.ESOPSupa.client;
  const { data: docs } = await supa.from("documents")
    .select("*").eq("status","awaiting_signature").order("created_at");
  const list = document.getElementById("pending-list");
  list.innerHTML = "";
  for (const d of docs) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "link";
    btn.dataset.doc = d.id;
    btn.dataset.kind = d.kind;
    btn.textContent = `Review & sign: ${d.kind.replace(/_/g," ")}`;
    li.appendChild(btn);
    list.appendChild(li);
  }
  document.getElementById("pending-signatures").hidden = docs.length === 0;
}

document.getElementById("pending-list").addEventListener("click", async (e) => {
  const doc_id = e.target.dataset.doc;
  if (!doc_id) return;
  const kind = e.target.dataset.kind;
  const html = await window.ESOPDocs.renderForSigning(kind, doc_id);
  document.getElementById("signing-body").innerHTML = html; // template is author-controlled
  document.getElementById("signing-modal").showModal();
  document.getElementById("signing-form").dataset.docId = doc_id;
  document.getElementById("signing-form").dataset.kind = kind;
});

document.getElementById("signing-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const doc_id = f.dataset.docId;
  const kind = f.dataset.kind;
  const supa = window.ESOPSupa.client;

  try {
    const { data: signed, error } = await supa.rpc("sign_document", {
      p_document_id: doc_id, p_typed_name: f.typed_name.value
    });
    if (error) throw error;

    const pdfBlob = await window.ESOPDocs.renderSignedPdf(kind, signed);

    const path = `${signed.holder_id}/${kind}/${doc_id}.pdf`;
    const { data: up } = await supa.storage.from("esop-documents").createSignedUploadUrl(path);
    await fetch(up.signedUrl, { method: "PUT", body: pdfBlob, headers: { "x-upsert": "true" } });

    await supa.rpc("finalize_signed_document", { p_document_id: doc_id, p_storage_path: path });

    document.getElementById("signing-modal").close();
    await refreshPendingSignatures();
    window.ESOPNotify.success("Signed and recorded.");
  } catch (err) {
    const el = document.getElementById("signing-error");
    el.textContent = err.message; el.hidden = false;
  }
});
```

- [ ] **Step 3: Add `renderForSigning` and `renderSignedPdf` to `docs.js`**

Both reuse the existing letter-rendering template. `renderSignedPdf` appends an audit page that pipes signature_metadata fields through `esc()` before placing them in the HTML:

```js
const audit = `
  <div class="signature-page">
    <h3>Signature</h3>
    <p><strong>Signed by:</strong> ${esc(signed.signature_metadata.typed_name)}</p>
    <p><strong>At:</strong> ${esc(signed.signed_at)}</p>
    <p><strong>From IP:</strong> ${esc(signed.signature_metadata.ip)}</p>
    <p><strong>User agent:</strong> ${esc(signed.signature_metadata.user_agent)}</p>
  </div>
`;
```

Then html2canvas → jsPDF → Blob (instead of triggering download), returning the Blob.

- [ ] **Step 4: Manual smoke**

As admin (Derrick), approve a grant for a test holder. Sign out, sign in as the test holder, see the banner, click, sign with the right name. Expected: modal closes, banner empty; admin's document row shows status=signed and the PDF is in storage.

- [ ] **Step 5: Commit**

```bash
git add portal.html assets/portal.js assets/docs.js
git commit -m "portal: acceptance + e-signing modal with audit-page PDF + storage upload"
```

---

## Task 22: Exercise modal + Notice PDF + payment row

**Files:**
- Modify: `portal.html` (exercise tab + modal markup)
- Modify: `assets/portal.js`
- Modify: `assets/docs.js` (`renderExerciseNoticePdf`)
- Modify: `assets/calc.js` (read-only helper `getVestedUnexercised`)

- [ ] **Step 1: Add `getVestedUnexercised` helper to `calc.js`**

```js
function getVestedUnexercised(state, holder_id) {
  const grants = state.grants_by_holder?.[holder_id] || [];
  let total = 0;
  for (const g of grants) total += vestedQty(g, new Date()) - exercisedQty(state, holder_id, g.fy);
  return total;
}
window.ESOPCalc = Object.assign(window.ESOPCalc || {}, { getVestedUnexercised });
```

- [ ] **Step 2: Add markup**

```html
<dialog id="exercise-modal" class="modal">
  <header><h2>Exercise Options</h2><button class="close" data-close>&times;</button></header>
  <form id="exercise-form" class="form">
    <label>Grant <select name="grant"></select></label>
    <label>Quantity to exercise <input type="number" name="qty" min="1" required></label>
    <p id="exercise-calc"></p>
    <label><input type="checkbox" name="accept" required> I confirm I want to exercise the above options at the stated strike price.</label>
    <label>Type your full legal name: <input type="text" name="typed_name" required></label>
    <button class="btn-primary" type="submit">Generate Exercise Notice &amp; QR</button>
    <p id="exercise-error" class="error" hidden></p>
  </form>
</dialog>

<section id="exercise-tab" hidden>
  <header><h2>Exercise</h2></header>
  <button id="open-exercise" class="btn-primary">Start an exercise</button>
  <div id="pending-payments-holder"></div>
</section>
```

Reveal `#exercise-tab` only when `state.windows.current` is open.

- [ ] **Step 3: Wire `assets/portal.js`**

Build `<option>` elements via DOM API rather than innerHTML so grant data isn't HTML-injected:

```js
document.getElementById("open-exercise").addEventListener("click", async () => {
  const state = window.ESOPStore.state();
  const session = await ESOPAuth.currentSession();
  const grants = state.grants_by_holder?.[session.id] || [];
  const select = document.querySelector("#exercise-form select[name=grant]");
  select.replaceChildren();
  for (const g of grants) {
    const opt = document.createElement("option");
    opt.value = String(g.fy);
    opt.textContent = `FY${g.fy} — ${g.qty} options @ S$${g.strike}`;
    select.appendChild(opt);
  }
  document.getElementById("exercise-modal").showModal();
});

document.querySelector("#exercise-form").addEventListener("input", (e) => {
  const f = e.target.form;
  const state = window.ESOPStore.state();
  const session = state.session;
  const grant_fy = +f.grant.value;
  const grant = (state.grants_by_holder?.[session.id] || []).find(g => g.fy === grant_fy);
  const qty = +f.qty.value || 0;
  if (!grant) return;
  const total = (qty * grant.strike).toFixed(2);
  document.getElementById("exercise-calc").textContent = `${qty} × S$${grant.strike} = S$${total}`;
});

document.getElementById("exercise-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const supa = window.ESOPSupa.client;
  const state = window.ESOPStore.state();
  const session = await ESOPAuth.currentSession();
  const profile = (await supa.from("profiles").select("*").eq("id",
      (await supa.auth.getUser()).data.user.id).single()).data;

  if (f.typed_name.value.trim().toLowerCase() !== profile.full_name.trim().toLowerCase()) {
    document.getElementById("exercise-error").textContent = "Name doesn't match profile."; return;
  }
  const grant_fy = +f.grant.value;
  const grant = state.grants_by_holder[session.id].find(g => g.fy === grant_fy);
  const qty = +f.qty.value;
  const amount = +(qty * grant.strike).toFixed(2);

  const placeholderQr = window.ESOPSGQR.buildPayNowQR({
    uen: state.org.uen, amount, reference: "PENDING"
  });

  const { data: rows, error } = await supa.rpc("submit_exercise", {
    p_grant_id: String(grant_fy), p_qty: qty, p_qr_payload: placeholderQr, p_amount_sgd: amount
  });
  if (error) { document.getElementById("exercise-error").textContent = error.message; return; }

  const row = rows[0];
  const finalQr = window.ESOPSGQR.buildPayNowQR({
    uen: state.org.uen, amount, reference: row.payment.reference
  });
  await supa.from("payments").update({ qr_payload: finalQr }).eq("id", row.payment.id);

  const pdfBlob = await window.ESOPDocs.renderExerciseNoticePdf({
    holder: profile, grant, qty, amount, reference: row.payment.reference, qr_emv: finalQr,
    typed_name: f.typed_name.value, signed_at: new Date().toISOString()
  });
  const path = `${profile.holder_id}/exercise_notice/${row.document.id}.pdf`;
  const { data: up } = await supa.storage.from("esop-documents").createSignedUploadUrl(path);
  await fetch(up.signedUrl, { method: "PUT", body: pdfBlob, headers: { "x-upsert": "true" } });
  await supa.rpc("finalize_signed_document", { p_document_id: row.document.id, p_storage_path: path });
  await supa.rpc("sign_document", { p_document_id: row.document.id, p_typed_name: f.typed_name.value });

  document.getElementById("exercise-modal").close();
  await refreshHolderPendingPayments();
});
```

- [ ] **Step 4: Render Exercise Notice in `docs.js`**

Add `renderExerciseNoticePdf({holder, grant, qty, amount, reference, qr_emv, typed_name, signed_at})` that builds a notice page (template author-controlled, holder/typed_name passed through `esc()`) including a QR canvas drawn via `QRCode.toCanvas(canvas, qr_emv)` before html2canvas captures.

- [ ] **Step 5: Show pending payments to the holder**

```js
async function refreshHolderPendingPayments() {
  const supa = window.ESOPSupa.client;
  const state = window.ESOPStore.state();
  const { data } = await supa.from("payments").select("*").eq("status","pending").order("created_at");
  const wrap = document.getElementById("pending-payments-holder");
  wrap.replaceChildren();
  for (const p of data) {
    const card = document.createElement("article");
    card.className = "card";
    const h = document.createElement("h3"); h.textContent = p.reference; card.appendChild(h);
    const a = document.createElement("p");
    a.innerHTML = `Amount: <strong>S$ ${esc(p.amount_sgd.toFixed(2))}</strong>`;
    card.appendChild(a);
    const r = document.createElement("p");
    r.append(`Pay via PayNow Corporate (UEN ${state.org.uen}). Reference: `);
    const code = document.createElement("code"); code.textContent = p.reference; r.appendChild(code);
    card.appendChild(r);
    const cv = document.createElement("canvas"); cv.width = 240; cv.height = 240;
    QRCode.toCanvas(cv, p.qr_payload, { width: 240 });
    card.appendChild(cv);
    const m = document.createElement("p"); m.className = "muted"; m.textContent = "Awaiting payment confirmation by Admin.";
    card.appendChild(m);
    wrap.appendChild(card);
  }
}
```

- [ ] **Step 6: Manual smoke**

Sign in as test holder during an open window, exercise 10 options. Expected: modal closes, pending-payments card shows reference + amount + scannable QR.

- [ ] **Step 7: Commit**

```bash
git add portal.html assets/portal.js assets/docs.js assets/calc.js
git commit -m "portal: exercise modal + Notice PDF + PayNow QR + pending-payments"
```

---

## Task 23: Admin Pending Payments panel

**Files:**
- Modify: `admin.html`
- Modify: `assets/admin-tabs.js`
- Create: `assets/admin-payments.js`

- [ ] **Step 1: Add markup**

```html
<section id="tab-payments" class="tab-panel" hidden>
  <header><h2>Pending Payments</h2></header>
  <table id="payments-table" class="data-table">
    <thead><tr><th>Reference</th><th>Holder</th><th>Amount (SGD)</th><th>Submitted</th><th></th></tr></thead>
    <tbody></tbody>
  </table>
</section>
```

- [ ] **Step 2: Create `assets/admin-payments.js`**

```js
(async function () {
  await ESOPAuth.requireSession(["admin","committee"]);
  const supa = window.ESOPSupa.client;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  async function load() {
    const { data } = await supa.from("payments").select("*").eq("status","pending").order("created_at");
    const tbody = document.querySelector("#payments-table tbody");
    tbody.replaceChildren();
    for (const p of data) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${esc(p.reference)}</td>
        <td>${esc(p.holder_id)}</td>
        <td>${esc(p.amount_sgd.toFixed(2))}</td>
        <td>${esc(new Date(p.created_at).toLocaleString())}</td>
        <td>
          <button class="btn-small" data-pay="${esc(p.id)}" data-action="confirm">Mark Paid</button>
          <button class="btn-small" data-pay="${esc(p.id)}" data-action="cancel">Cancel</button>
        </td>`;
      tbody.appendChild(tr);
    }
  }
  document.querySelector("#payments-table").addEventListener("click", async (e) => {
    const id = e.target.dataset.pay;
    if (!id) return;
    if (e.target.dataset.action === "confirm") {
      const notes = prompt("Confirmation notes (e.g. bank ref, txn ID):", "");
      if (notes === null) return;
      const { error } = await supa.rpc("confirm_payment", { p_payment_id: id, p_notes: notes });
      if (error) return alert("Failed: " + error.message);
    } else if (e.target.dataset.action === "cancel") {
      const reason = prompt("Cancellation reason:");
      if (!reason) return;
      const { error } = await supa.rpc("cancel_payment", { p_payment_id: id, p_reason: reason });
      if (error) return alert("Failed: " + error.message);
    }
    load();
  });
  load();
})();
```

- [ ] **Step 3: Register the tab**

In `admin-tabs.js`, register `payments` and lazy-load `assets/admin-payments.js`.

- [ ] **Step 4: Manual smoke**

As Derrick → admin → Pending Payments → see the test holder's exercise. Click Mark Paid → enter notes → row disappears. Sign in as the holder → portal shows the exercise as settled.

- [ ] **Step 5: Commit**

```bash
git add admin.html assets/admin-tabs.js assets/admin-payments.js
git commit -m "admin: Pending Payments panel with confirm + cancel"
```

---

## Task 24: Activity Log page (filters + CSV export)

**Files:**
- Modify: `admin.html` and `committee.html`
- Create: `assets/activity-log.js`

- [ ] **Step 1: Add markup to both pages**

```html
<section id="tab-activity" class="tab-panel" hidden>
  <header><h2>Activity Log</h2></header>
  <form id="activity-filters" class="form-row">
    <label>From <input type="datetime-local" name="from"></label>
    <label>To <input type="datetime-local" name="to"></label>
    <label>Actor email <input type="text" name="actor_email" placeholder="contains..."></label>
    <label>Action prefix <input type="text" name="action_prefix" placeholder="e.g. login_"></label>
    <label>IP contains <input type="text" name="ip_contains"></label>
    <button type="submit" class="btn">Apply</button>
    <button type="button" id="csv-export" class="btn">Download CSV</button>
  </form>
  <table id="activity-table" class="data-table">
    <thead><tr><th>Time</th><th>Actor</th><th>Role</th><th>Action</th><th>Target</th><th>IP</th><th>UA</th></tr></thead>
    <tbody></tbody>
  </table>
  <nav class="pager">
    <button id="prev-page" class="btn-small">Prev</button>
    <span id="page-info"></span>
    <button id="next-page" class="btn-small">Next</button>
  </nav>
</section>
```

- [ ] **Step 2: Create `assets/activity-log.js`**

```js
(async function () {
  await ESOPAuth.requireSession(["admin","committee"]);
  const supa = window.ESOPSupa.client;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let offset = 0; const LIMIT = 100;
  let lastFilters = {};

  function readFilters(form) {
    return {
      p_from: form.from.value || null,
      p_to: form.to.value || null,
      p_actor_email: form.actor_email.value || null,
      p_action_prefix: form.action_prefix.value || null,
      p_ip_contains: form.ip_contains.value || null
    };
  }

  async function load() {
    const params = { ...lastFilters, p_limit: LIMIT, p_offset: offset };
    const { data, error } = await supa.rpc("activity_log", params);
    if (error) return alert(error.message);
    const tbody = document.querySelector("#activity-table tbody");
    tbody.replaceChildren();
    for (const r of data) {
      const tr = document.createElement("tr");
      const ua = String(r.user_agent || "");
      tr.innerHTML = `
        <td>${esc(new Date(r.at).toLocaleString())}</td>
        <td>${esc(r.actor_email)}</td>
        <td>${esc(r.actor_role)}</td>
        <td>${esc(r.action)}</td>
        <td>${esc(r.target)}</td>
        <td>${esc(r.ip)}</td>
        <td title="${esc(ua)}">${esc(ua.slice(0,30))}</td>`;
      tbody.appendChild(tr);
    }
    document.getElementById("page-info").textContent = `${offset + 1}–${offset + data.length}`;
  }

  document.getElementById("activity-filters").addEventListener("submit", (e) => {
    e.preventDefault();
    lastFilters = readFilters(e.target);
    offset = 0;
    load();
  });
  document.getElementById("prev-page").addEventListener("click", () => { offset = Math.max(0, offset - LIMIT); load(); });
  document.getElementById("next-page").addEventListener("click", () => { offset += LIMIT; load(); });

  document.getElementById("csv-export").addEventListener("click", async () => {
    const params = { ...lastFilters, p_limit: 10000, p_offset: 0 };
    const { data } = await supa.rpc("activity_log", params);
    const csv = ["at,actor_email,actor_role,action,target,ip,user_agent"]
      .concat(data.map(r => [r.at, r.actor_email, r.actor_role, r.action, r.target, r.ip, JSON.stringify(r.user_agent || "")].join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `activity-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    await supa.from("audit_log").insert({ action: "audit_export_downloaded", target: "activity_log",
      metadata: { filters: lastFilters, rows: data.length } });
  });

  load();
})();
```

- [ ] **Step 3: Manual smoke**

Generate activity (sign in/out, sign a doc, exercise something). Activity Log shows rows with IP. Filter `action_prefix=login_` → only login rows. CSV export downloads a file.

- [ ] **Step 4: Commit**

```bash
git add admin.html committee.html assets/activity-log.js
git commit -m "audit: Activity Log page with filters + CSV export"
```

---

## Task 25: Per-holder drill-down + failed-login badge

**Files:**
- Modify: `assets/admin-workflow.js` (holder detail panel)
- Modify: `assets/app.js` (topbar)
- Modify: `admin.html`, `committee.html` (topbar markup)

- [ ] **Step 1: Add per-holder activity to holder detail card**

In the function in `admin-workflow.js` that renders a holder detail card:

```js
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const { data: rows } = await supa.rpc("activity_log", {
  p_actor_email: holder.email, p_limit: 50, p_offset: 0
});
const ul = document.createElement("ul");
for (const r of rows) {
  const li = document.createElement("li");
  li.innerHTML = `<time>${esc(new Date(r.at).toLocaleString())}</time> — ${esc(r.action)} ${r.target ? '('+esc(r.target)+')' : ''} from ${esc(r.ip || '?')}`;
  ul.appendChild(li);
}
detailPanel.querySelector(".activity-list").replaceChildren(ul);
```

- [ ] **Step 2: Add failed-login badge to topbar**

Markup (admin.html and committee.html topbar):

```html
<button id="failed-login-badge" class="badge badge-warning" hidden>0</button>
```

In `assets/app.js`:

```js
async function refreshFailedLoginBadge() {
  const supa = window.ESOPSupa.client;
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await supa.from("audit_log").select("*", { count: "exact", head: true })
    .eq("action","login_failed").gte("at", since);
  const badge = document.getElementById("failed-login-badge");
  if (!badge) return;
  badge.textContent = count > 0 ? String(count) : "";
  badge.hidden = count === 0;
  badge.onclick = () => {
    document.querySelector("[data-tab=activity]").click();
    document.querySelector("input[name=action_prefix]").value = "login_failed";
    document.getElementById("activity-filters").dispatchEvent(new Event("submit"));
  };
}
setInterval(refreshFailedLoginBadge, 60000);
refreshFailedLoginBadge();
```

- [ ] **Step 3: Manual smoke**

Try to log in 3 times with wrong password. Expected: badge shows "3". Click → Activity Log filtered to login_failed.

- [ ] **Step 4: Commit**

```bash
git add assets/admin-workflow.js assets/app.js admin.html committee.html
git commit -m "audit: per-holder drill-down + topbar failed-login badge"
```

---

## Task 26: Nightly chain-verification cron

**Files:**
- Create: `supabase/functions/verify-chain/index.ts`

- [ ] **Step 1: Write the function**

```ts
import { createClient } from "jsr:@supabase/supabase-js@2";
import { crypto } from "jsr:@std/crypto";

Deno.serve(async (_req) => {
  const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: events, error } = await supa.from("events").select("*").order("at", { ascending: true });
  if (error) return new Response(error.message, { status: 500 });

  let prev = "";
  let broken: string | null = null;
  for (const e of events) {
    const stable = (e.prev_hash ?? "") + e.type + e.at + JSON.stringify(e.payload);
    const hash = await sha256Hex(stable);
    if (e.hash !== hash || (e.prev_hash ?? "") !== prev) {
      broken = e.id; break;
    }
    prev = e.hash;
  }

  await supa.from("audit_log").insert({
    action: broken ? "chain_broken" : "chain_verified",
    target: broken ?? "",
    metadata: { event_count: events.length, latest_hash: prev }
  });

  return Response.json({ ok: !broken, broken, count: events.length });
});

async function sha256Hex(s: string) {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,"0")).join("");
}
```

- [ ] **Step 2: Deploy and schedule**

```bash
supabase functions deploy verify-chain
```

Supabase dashboard → Database → Cron jobs → new schedule:
- Name: `nightly-chain-verify`
- Cron: `0 17 * * *` (01:00 SGT)
- SQL: `select net.http_post(url:='https://<ref>.functions.supabase.co/verify-chain', headers:='{"Authorization":"Bearer <service-role>"}'::jsonb);`

- [ ] **Step 3: Manual smoke**

```bash
curl -X POST "https://<ref>.functions.supabase.co/verify-chain" -H "Authorization: Bearer <service-role>"
```

Expected: `{"ok":true,"broken":null,"count":N}`. A `chain_verified` audit row appears.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/verify-chain/index.ts
git commit -m "audit: nightly chain-verification Edge Function"
```

---

## Task 27: Cleanup — delete legacy code

**Files:**
- Delete: `backend/`
- Delete: `assets/data.js`, `assets/data.json` (after confirming bootstrap is on remote)
- Modify: every HTML page including `<script src="assets/data.js">`
- Modify: `assets/store.js` (remove BACKEND_MODE)

- [ ] **Step 1: Confirm seed events are on remote**

```bash
psql "$SUPABASE_DB_URL" -c "select count(*) from public.events where actor_role = 'system';"
```

Expected: matches the count from Task 11.

- [ ] **Step 2: Delete files**

```bash
git rm -r backend/
git rm assets/data.js assets/data.json
```

- [ ] **Step 3: Remove `data.js` script tags**

```bash
grep -rln "assets/data.js" *.html intel/ | xargs sed -i '' '/assets\/data\.js/d'
```

- [ ] **Step 4: Remove BACKEND_MODE block from `assets/store.js`**

Open the file, delete lines mentioning `BACKEND_URL`, `BACKEND_MODE`, `API`, and the `if (BACKEND_MODE)` branches.

- [ ] **Step 5: Manual smoke**

Hard-refresh every page. Expected: no console errors about missing `data.js` or `ESOP_DATA`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "cleanup: drop CF Workers scaffold, data.js/json, BACKEND_MODE"
```

---

## Task 28: Cloudflare Pages deploy

**Files:**
- (No files unless `wrangler.toml` is added at root)

- [ ] **Step 1: Create CF Pages project**

Cloudflare dashboard → Pages → Create project → Connect to GitHub `derrick-pixel/Elitez-ESOP`. Build command: none. Output dir: `/`.

- [ ] **Step 2: Add custom domains**

Pages project → Custom domains → add `esop.derrickteo.com` and `esop.elitez.com.sg` (the second stays inert until DNS exists).

- [ ] **Step 3: Trigger first deploy**

Push to main; CF auto-builds. Or `wrangler pages deploy . --project-name elitez-esop`.

- [ ] **Step 4: Verify**

```bash
curl -sI https://esop.derrickteo.com | head -1
```

Expected: `HTTP/2 200`.

- [ ] **Step 5: Update Supabase Auth redirect URLs**

Supabase dashboard → Auth → URL Configuration → confirm `https://esop.derrickteo.com` and `https://esop.elitez.com.sg` are in `Redirect URLs`.

- [ ] **Step 6: Commit (if `wrangler.toml` was added)**

```bash
git add wrangler.toml
git commit -m "deploy: Cloudflare Pages config"
```

---

## Task 29: Staged rollout

Verification only.

- [ ] **Step 1: Smoke the full holder journey on production**

Sign in as Derrick on `esop.derrickteo.com`. Invite a real test user. Receive email → set password → log in as holder. See seed data. Sign a draft LoO. Run an exercise during an open window. As Derrick again, mark the exercise paid.

- [ ] **Step 2: Verify audit**

Activity Log shows the chain: magic_link_sent, password_set, login_success, letter_of_offer_signed, exercise_submitted, exercise_settled. All with IP.

- [ ] **Step 3: Send invite to one real holder**

Pick the most-tolerant test holder. Send invite. Watch their Activity Log.

- [ ] **Step 4: Buffer**

Reserve the rest of the day for fixes from the staged rollout.

- [ ] **Step 5: Commit any fixes**

```bash
git commit -m "fix: <specific issue surfaced during rollout>"
```

---

## Self-review checklist

1. **Spec coverage**
   - Auth (real login + password change) → Tasks 13, 14, 15
   - Backend file records (Supabase Storage) → Tasks 6, 10, 21, 22
   - Accept + e-signing → Tasks 7, 8, 21
   - Exercise + QR → Tasks 8, 20, 22
   - Manual payment confirmation → Task 23
   - Audit log + IP capture → Tasks 7, 10, 24, 25
   - Onboarding via magic link → Tasks 16, 17
   - Hosting at esop.derrickteo.com → Task 28
   - Kill legacy admin code → Task 27
   - Hash chain + tamper-evidence → Tasks 7, 26
   - Lift-and-shift event store → Task 18

2. **Placeholder scan**
   - "PASTE_UUID_HERE" in Task 12 — explicit manual step.
   - "<project-ref>" / "<anon-key>" / "<service-role>" — config from Supabase dashboard.
   - "<temp>" — placeholder for Derrick's chosen temporary password.

3. **Type/method consistency**
   - `appendEvent`/`syncAll`/`subscribe`/`startRealtime`/`loadCache` exposed identically in supa.js + consumed in store.js.
   - `requireSession`/`currentSession`/`login`/`logout`/`changePassword`/`requestPasswordReset` all async, all consumed via `await`.
   - `holder_id` is text in profiles, events.payload, documents, payments — consistent.
   - RPC names match between SQL and JS callers: `append_event`, `sign_document`, `finalize_signed_document`, `submit_exercise`, `confirm_payment`, `cancel_payment`, `get_document_url`, `update_role`, `activity_log`.

4. **Scope check**
   - 29 tasks for 10 working days ≈ 3 tasks/day. Realistic given the existing 6671 LOC backbone is unchanged in spirit.

5. **Output safety**
   - Every JS module that uses `innerHTML` with DB-derived values declares an `esc()` helper at the top and pipes those values through it.
   - DOM-API construction is preferred when looping over arbitrary DB content (admin-payments, exercise pending list).
