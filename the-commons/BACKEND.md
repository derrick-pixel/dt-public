# The Commons — Backend Swap Guide

The client-side v2 (localStorage) is a fully-typed data model that mirrors
exactly what a real backend needs. Moving from `store.js` → Supabase
(or Postgres / Planetscale / Firebase) is a 1-day swap because every
page talks to the store through a thin interface, not raw storage.

This doc explains:

1. The schema that already exists in your browser.
2. Suggested Postgres / Supabase schema + RLS policies.
3. Where to swap reads and writes.
4. Auth upgrade path.
5. Webhook-based PayNow verification (replaces manual admin reconciliation).

---

## 1. Current schema (mirrored in localStorage)

All tables are JSON arrays keyed under `tc:*`. Shape of each row:

### `tc:events`
```ts
{
  id: string            // evt-xxxxxx
  slug: string          // url-safe
  title: string
  emoji: string         // cover icon
  category: 'yacht' | 'festival' | 'hike' | 'party' | 'travel' | 'food' | 'learn' | 'sport'
  description: string
  date: string          // YYYY-MM-DD (event date)
  time: string          // HH:MM
  location: string
  costPerPerson: number // SGD
  depositAmount: number
  maxGuests: number
  milestones: Array<{ id: string, label: string, amount: number, dueOffset: number }>
  providers: Array<{ name: string, amount: number }>
  organiser: { name: string, email: string, paynow?: string }
  status: 'live' | 'cancelled' | 'released'
  createdAt: number     // epoch ms
  cancelledAt?: number
  cancelReason?: string
  releasedAt?: number
}
```

### `tc:rsvps`
```ts
{
  id: string
  eventId: string       // FK → events.id
  name: string
  email: string
  phone: string
  amountPaid: number
  status: 'pending_verification' | 'verified' | 'refunded' | 'cancelled'
  createdAt: number
  refundedAt?: number
}
```

### `tc:transactions`  (the ledger)
```ts
{
  id: string
  type: 'rsvp_deposit' | 'rsvp_milestone' | 'booking_deposit' | 'refund'
  amount: number        // positive value; refunds live alongside as type='refund'
  reference: string     // TC-RSVP-YYMMDD-XXXX (matches PayNow reference)
  eventId?: string
  rsvpId?: string
  bookingId?: string
  milestoneId?: string  // m1, m2, m3
  payerName: string
  payerEmail: string
  status: 'pending_verification' | 'verified' | 'released' | 'refunded' | 'rejected'
  createdAt: number
  verifiedAt?: number
  releasedAt?: number
  refundedAt?: number
  reason?: string       // for refunds
}
```

### `tc:bookings`
```ts
{
  id: string
  providerName: string
  providerCategory?: string
  amount: number
  reference: string
  eventId?: string
  notes: string
  payerName: string
  payerEmail: string
  status: 'pending_verification' | 'verified' | 'cancelled'
  createdAt: number
}
```

### `tc:payouts`
```ts
{
  id: string
  eventId: string
  amount: number
  paynowTo: string
  requestedBy: { name: string, email: string }
  reference: string
  status: 'requested' | 'approved' | 'sent' | 'rejected'
  createdAt: number
  approvedAt?: number
  sentAt?: number
  rejectedAt?: number
  rejectReason?: string
  approvedBy?: string
  sentBy?: string
}
```

### `tc:reminders`
```ts
{
  id: string
  eventId: string
  rsvpId: string
  milestoneId: string
  amount: number
  kind: 'overdue' | 'due_tomorrow' | 'upcoming'
  dueDate: string       // YYYY-MM-DD
  toName: string
  toEmail: string
  toPhone: string
  subject: string
  body: string
  status: 'queued' | 'sent' | 'sent_local' | 'failed' | 'dismissed'
  createdAt: number
  sentAt?: number
  transport?: 'formspree' | 'log'
  error?: string
}
```

### `tc:currentUser`
Single object, not an array:
```ts
{ name: string, email: string }
```

---

## 2. Supabase schema (recommended)

```sql
-- enable UUID generator
create extension if not exists "pgcrypto";

-- 1. users (or rely on auth.users)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  paynow text,
  created_at timestamptz default now()
);

-- 2. events
create table events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  emoji text default '🎉',
  category text default 'party',
  description text,
  date date,
  time time,
  location text,
  cost_per_person numeric(10,2) not null,
  deposit_amount numeric(10,2) not null,
  max_guests int,
  milestones jsonb default '[]',
  providers jsonb default '[]',
  organiser_id uuid references profiles(id),
  status text default 'live' check (status in ('live','cancelled','released')),
  created_at timestamptz default now(),
  cancelled_at timestamptz,
  cancel_reason text,
  released_at timestamptz
);

create index events_status_idx on events(status);
create index events_date_idx on events(date);

-- 3. rsvps
create table rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  amount_paid numeric(10,2) default 0,
  status text default 'pending_verification' check (status in ('pending_verification','verified','refunded','cancelled')),
  created_at timestamptz default now(),
  refunded_at timestamptz,
  unique (event_id, email)
);

-- 4. transactions (ledger)
create table transactions (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('rsvp_deposit','rsvp_milestone','booking_deposit','refund','payout')),
  amount numeric(10,2) not null,
  reference text unique,
  event_id uuid references events(id) on delete cascade,
  rsvp_id uuid references rsvps(id) on delete cascade,
  booking_id uuid references bookings(id) on delete cascade,
  milestone_id text,
  payer_name text,
  payer_email text,
  status text default 'pending_verification' check (status in ('pending_verification','verified','released','refunded','rejected')),
  reason text,
  created_at timestamptz default now(),
  verified_at timestamptz,
  released_at timestamptz,
  refunded_at timestamptz
);
create index txn_status_idx on transactions(status);
create index txn_reference_idx on transactions(reference);

-- 5. bookings (marketplace)
create table bookings (
  id uuid primary key default gen_random_uuid(),
  provider_name text,
  provider_category text,
  amount numeric(10,2),
  reference text,
  event_id uuid references events(id),
  notes text,
  payer_email text,
  status text default 'pending_verification',
  created_at timestamptz default now()
);

-- 6. payouts
create table payouts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  amount numeric(10,2),
  paynow_to text,
  requested_by uuid references profiles(id),
  reference text,
  status text default 'requested' check (status in ('requested','approved','sent','rejected')),
  created_at timestamptz default now(),
  approved_at timestamptz,
  sent_at timestamptz,
  rejected_at timestamptz,
  reject_reason text
);

-- 7. reminders
create table reminders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  rsvp_id uuid references rsvps(id) on delete cascade,
  milestone_id text,
  amount numeric(10,2),
  kind text check (kind in ('overdue','due_tomorrow','upcoming')),
  due_date date,
  to_name text, to_email text, to_phone text,
  subject text, body text,
  status text default 'queued' check (status in ('queued','sent','sent_local','failed','dismissed')),
  transport text,
  created_at timestamptz default now(),
  sent_at timestamptz
);
```

### Row-level security (RLS)

```sql
-- Everyone reads events
alter table events enable row level security;
create policy events_read on events for select using (true);
-- Organiser writes their own
create policy events_write on events for all using (organiser_id = auth.uid());

-- RSVPs: a user sees their own + the organiser sees all for their event
alter table rsvps enable row level security;
create policy rsvps_self on rsvps for all using (email = auth.email());
create policy rsvps_organiser on rsvps for select using (
  event_id in (select id from events where organiser_id = auth.uid())
);

-- Transactions: similar to RSVPs + platform admin sees all
-- (Easiest: have `role` column on profiles; admin bypasses RLS via service_role key.)
```

---

## 3. Swap plan — replace `store.js` with `store-supabase.js`

The public surface of `window.TCStore` is stable. Re-implement each method
so it calls Supabase instead of `localStorage`:

```js
// store-supabase.js (sketch)
import { createClient } from '@supabase/supabase-js';
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listEvents() {
  const { data } = await sb.from('events').select('*').order('date');
  return data || [];
}
async function createEvent(payload) {
  const { data, error } = await sb.from('events').insert([payload]).select().single();
  if (error) throw error;
  return data;
}
// ... same for RSVPs, transactions, bookings, payouts, reminders
```

**Note**: today the renderers call `TCStore.listEvents()` synchronously.
For a backend swap you'll need to either:
- Make renderers `async` + await store calls, OR
- Pre-fetch on page load and cache in-memory, passing to the same sync
  API. The second path preserves all existing code with minimal surgery.

---

## 4. Auth upgrade (Supabase)

Current simulated auth (`TCStore.setCurrentUser({name, email})`) becomes
real Supabase magic-link auth:

```js
// Replace handleAuth() body:
await sb.auth.signInWithOtp({ email });
// Supabase sends an email; on click it returns to the site with auth state.
```

Add `/auth/callback.html` that calls `sb.auth.getSession()` and persists
nothing more — Supabase handles it.

---

## 5. PayNow webhook auto-verification

Today admins manually flip `pending_verification → verified`. With a real
backend, replace the Admin Reconciliation click with a webhook:

1. Connect your bank (DBS IDEAL API, Xero Bank Feed, OCBC) or use a
   PayNow-aware pass-through (HitPay, Stripe PayNow).
2. On incoming payment with matching reference code, a serverless
   function (Supabase Edge Function / Vercel Function) looks up the
   transaction by `reference` and flips it to `verified`.
3. The client subscribes via `sb.channel('transactions')` and re-renders
   the RSVP/event page in real time.

Sketch:
```ts
// Supabase Edge Function — /functions/paynow-webhook.ts
export const handler = async (req: Request) => {
  const { reference, amount } = await req.json();
  const { data: t } = await sb.from('transactions')
    .select('*').eq('reference', reference).single();
  if (!t) return new Response('no-match', { status: 404 });
  if (Math.abs(t.amount - amount) > 0.01) return new Response('amount-mismatch', { status: 400 });
  await sb.from('transactions').update({
    status: 'verified', verified_at: new Date().toISOString()
  }).eq('id', t.id);
  await sb.from('rsvps').update({
    status: 'verified', amount_paid: amount
  }).eq('id', t.rsvp_id);
  return new Response('ok');
};
```

---

## Migration checklist

- [ ] Create Supabase project, run the schema above.
- [ ] Write `store-supabase.js` matching the `TCStore` API.
- [ ] Add `import` or `<script src="store-supabase.js">` before `app.js`.
- [ ] Convert synchronous callers (renderers) to async, or pre-fetch once per page.
- [ ] Replace `handleAuth()` with Supabase `signInWithOtp`.
- [ ] Set up bank → webhook → `transactions.status=verified` flow.
- [ ] Enable Supabase Realtime on `transactions` and re-render on change.
- [ ] Hide or rename the Admin Reconciliation tab (still useful for manual override).

Estimated engineering: **1 day for schema + auth + CRUD**, **+1 day for
webhook + realtime**, **+half day for polish**.
