# Spec C2: Dormitory Worker Storefront

**Date:** 2026-05-16
**Status:** Draft (awaiting user review)
**Repo:** `derrick-pixel/discounter` (evolved in place — Approach A)
**Deploy:** existing Vercel project `discounter-elitez.vercel.app`
**Backend:** merged Supabase project `mvbxnvrkxgfeylrwsuom`, `dormitory-workers` event
**Predecessors:** Spec C (parent), Spec C1 (backend foundation — DONE 2026-05-16)

---

## 1. Problem

Merger C1 made discounter's 72 products a flashcart event (`dormitory-workers`) on the merged Supabase backend, then flipped them to `tenant='flashcart'` + `event_id`. The existing discounter Next.js app still filters by `tenant='discounter'`, so `discounter-elitez.vercel.app` now shows an empty catalogue.

C2 rebuilds the discounter app as the dedicated dormitory-worker storefront on the new event-based backend, restoring and modernising the four capabilities the dormitory pivot needs: multi-language UI, dormitory/gathering-spot delivery selection, identifiable phone-OTP checkout, and a weekly-catalogue-with-delivery ordering model.

## 2. Approach (decided)

**Approach A — evolve discounter's existing app in place.** Discounter's Next.js 16 app already has a storefront, cart, checkout, account, order history, dormitory FK and weekly-cutoff concepts. C2 keeps that shell and changes the data layer + adds the dormitory features, rather than importing flashcart's thinner storefront (which has no account/orders/dormitory concepts). The "flashcart engine" advantage is its *admin* — event management, CSV/xlsx import, export — which is **out of C2 scope** (admin stays on flashcart's existing `/admin`). The event architecture itself lives in the *database*; the storefront merely queries `event_id`.

## 3. Goals

- `discounter-elitez.vercel.app` serves a working dormitory-worker storefront bound to the `dormitory-workers` event.
- Catalogue, cart, checkout, account/order-history all function end-to-end.
- 5-language UI (English, Hindi, Indonesian, Burmese, Tamil).
- Checkout: delivery-mode choice (deliver-to-dormitory OR collect-at-gathering-spot), phone-OTP identity, PayNow-upfront payment.
- Persistent 180-day login session so returning workers skip OTP (SMS-cost reduction).
- The old GH Pages static site (`derrick-pixel.github.io/discounter`) is retired.

## 4. Non-goals

- Admin / delivery-routing UI — deferred to Spec C3. Merchant uses flashcart's existing `/admin/orders` to view dormitory orders in the interim.
- Translating the 72 GSK product names — only UI chrome is translated; SKU names stay in English.
- Per-event URL routing — C2 is a single-event app hard-bound to `dormitory-workers`.
- Multi-event admin, CSV/xlsx import — flashcart's job.
- Migrating discounter's legacy 4 orders / 2 phone-auth users — archived per Spec C (kept in DB, not surfaced).
- Backend schema changes — C1 already shipped the full schema (one optional constraint noted in §10).
- Pay-on-collection / cash handling — payment is PayNow-upfront only.

## 5. End state

- Discounter repo `src/` evolved: `tenant`-based queries replaced by `event_id`; admin routes removed; i18n, phone-OTP checkout, delivery-mode pickers, PayNow flow added.
- One Vercel deployment (`discounter-elitez.vercel.app`), reading the merged Supabase project.
- GH Pages disabled; `index.html` + `locations.html` moved to `archive/`.
- Supabase auth: `sessions_inactivity_timeout = 4320` (hours = 180 days).

## 6. Architecture

Single-event Next.js 16 app, evolved from the current discounter codebase.

### 6.1 Event binding

The storefront is hard-bound to the event with slug `dormitory-workers`. The event row (id, `badge_text`, `tagline_text`, `subtitle_text`) and its products are fetched **server-side** in a server component using the Supabase **service-role (admin) client** — not the browser anon client.

Reason: the `dormitory-workers` event starts `is_active = false`, and the products RLS policy only permits anon reads when the event is active. A server-side admin-client read sidesteps RLS entirely, works pre-launch, and means the anon key is never needed for the catalogue. `is_active` then functions purely as flashcart's admin "which event is publicly live" toggle and does not gate C2's own reads.

### 6.2 Component boundaries

- **Server components** — fetch event + products (admin client), pass as props.
- **Client components** — catalogue search/filter, cart, checkout wizard, language switcher. Use the browser client (`@supabase/ssr`) only for auth (phone OTP) and session.
- **Route handlers** (`/api/*`) — order creation and lookup; server-side price re-validation; service-role writes.

### 6.3 Data source

Merged Supabase `mvbxnvrkxgfeylrwsuom`. Tables (all exist post-C1): `events`, `products` (`event_id` FK), `orders` (`event_id`, `dormitory_id`, `gathering_spot_id`, `fulfillment_status`, `delivery_day`), `order_items`, `dormitories` (20 rows: id, name, address, delivery_day, is_active), `gathering_spots` (10 rows), `users` (`default_gathering_spot_id`).

## 7. Pages & routes

Evolve discounter's existing routes. **Delete** `src/app/admin/**` and `src/app/api/admin/**` (admin is flashcart's responsibility).

| Route | Type | Responsibility |
|---|---|---|
| `/` | Server + client | Catalogue. Server fetches event + active products for `dormitory-workers`; client component does search + category filter. Language bar. Event-driven hero (badge/tagline/subtitle). |
| `/cart` | Client | Cart review, quantity edit, proceed to checkout. |
| `/checkout` | Client | Checkout wizard — see §9. |
| `/account` | Client | If session live: show profile + default delivery location. If not: phone-OTP sign-in. |
| `/account/orders` | Client | Order history for the signed-in phone identity. |
| `/out-of-stock` | Client | Kept as-is. |

## 8. Internationalisation

Five languages: `en` (English), `hi` (Hindi), `id` (Indonesian), `my` (Burmese), `ta` (Tamil) — the same set the static `index.html` offered.

**Note:** the old static site achieved multi-language via an embedded **Google Translate widget**, not hand-authored strings — there is nothing to "port." C2 instead builds proper translation catalogues: the English catalogue is authored from the UI copy, and the Hindi/Indonesian/Burmese/Tamil catalogues are **AI-drafted as a first pass and marked for later human review** (a `"_status": "machine-draft"` key in each non-English file). This is deliberate — a Google Translate DOM-rewrite can mistranslate payment/delivery copy on a checkout flow, which is unacceptable here.

**Implementation — lightweight, no routing:**

- One JSON message catalogue per locale: `src/messages/{locale}.json`.
- A `LanguageProvider` React context holding the active locale; default `en`.
- A `useTranslation()` hook returning a `t(key)` lookup function.
- Active locale persisted in `localStorage` (key `dormstore.lang`) and mirrored to a cookie so the server render can pick the right `<html lang>`.
- A language bar (5 buttons) at the top of every page — mirrors the old static site's `setLang` toggle. No `/en/` URL prefixes, no `next-intl` routing.

**Scope:** only UI chrome (labels, buttons, headings, checkout copy, error messages) is translated. Product names and categories render from the DB in English.

## 9. Checkout wizard (`/checkout`)

A linear multi-step client flow. State held in component state; cart from the existing zustand store.

**Step 1 — Cart review.** Line items, quantities, total. Reject if cart empty.

**Step 2 — Delivery mode.** Two choices:
- *Deliver to my dormitory* → Step 3a.
- *Collect at a gathering spot* → Step 3b.

**Step 3a — Dormitory picker.** Dropdown of the 20 active `dormitories` (name + address). Selecting one fixes `dormitory_id`; `delivery_day` is derived from that dormitory's `delivery_day` column.

**Step 3b — Gathering-spot picker.** Dropdown of the 10 active `gathering_spots` (name + area). Selecting one fixes `gathering_spot_id`. Gathering spots are Sunday pickup points (they have no per-spot day column), so `delivery_day` is the fixed string `'Sunday'` for this mode.

If the worker has a live session and a saved default location, the relevant picker is pre-selected.

**Step 4 — Identity (phone OTP).** *Skipped entirely if a valid session already exists.* Otherwise:
- Worker enters an 8-digit SG mobile number; the app normalises it to `+65XXXXXXXX`.
- `supabase.auth.signInWithOtp({ phone })` → Twilio Verify sends an SMS code.
- Worker enters the 6-digit code → `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`.
- A "Resend code" button is disabled for a 60-second cooldown after each send.
- On success a session is established (persistent — see §11).

**Step 5 — Payment (PayNow upfront).** A PayNow QR is generated client-side from the shared `paynow.ts` util, encoding the order total and a payment reference. The worker pays in their banking app, then enters the PayNow transaction reference.

**Step 6 — Confirm.** Submits to `POST /api/orders/create` (see §10). On success → Step 7.

**Step 7 — Success.** Order summary: items, total, delivery mode + location, delivery day, "we'll notify you" copy.

## 10. Order API

### 10.1 `POST /api/orders/create`

Modify discounter's existing route:

- Resolve and set `event_id` = the `dormitory-workers` event id.
- Accept `dormitory_id` **xor** `gathering_spot_id` (exactly one). Reject if both or neither.
- Accept and persist `delivery_day`: for dormitory mode, re-derived server-side from the chosen `dormitories.delivery_day`; for gathering-spot mode, the fixed string `'Sunday'`.
- Associate the order with the phone-authenticated user (`user_id` from the session). C2 orders are always phone-identified — the A1-era anonymous `last_name` path is not used.
- Persist `payment_ref` (PayNow reference) and set `fulfillment_status = 'pending'`.
- Server-side price re-validation: recompute the total from current `products.sale_price`; reject with 409 if the client total drifted (existing behaviour — keep).
- Idempotency: a `client_request_id` UUID supplied by the client; a duplicate request returns the existing order rather than creating a second.

### 10.2 `GET /api/orders/lookup`

Kept. Returns order history for the signed-in phone identity, used by `/account/orders`.

## 11. Authentication & session

- Supabase phone auth via Twilio Verify — already LIVE on the merged project (C1).
- **Persistent 180-day session.** After a successful order the app does **not** sign the worker out. The `@supabase/ssr` client stores the session in cookies and auto-refreshes it. A returning worker within the window lands on checkout already identified and skips Step 4 (OTP) — directly reducing SMS cost.
- **Supabase config:** `sessions_inactivity_timeout = 4320`.
  - ⚠️ **This field's unit is HOURS, not seconds.** Supabase's Management API appends `h` to the integer. `4320h` = 180 days. Setting it to a seconds value (e.g. `15552000`) produces `15552000h` (~1775 years), overflows Go's `int64`, and **crash-loops GoTrue — the exact incident from C1.** Set it to `4320` and nothing else.
  - Apply via `PATCH /v1/projects/mvbxnvrkxgfeylrwsuom/config/auth`, then **restart the project** from the dashboard (a Management-API config PATCH does not reload GoTrue).
- A `users` row keyed to the auth user persists order history and `default_gathering_spot_id` (and, by extension, the default delivery location), so even a re-OTP after expiry prefills the worker's usual destination.

## 12. Branding

Single-event app, but hero copy is data-driven: the same server query that fetches products also reads the event's `badge_text` (`'Worker Welfare'`), `tagline_text` (`'Weekly Catalogue'`) and `subtitle_text`, and renders them in the hero. This replaces the current hard-coded red "Up to 80% OFF" banner.

Elitez house style (per global brand instructions): navy `#003a70` as the primary colour, orange `#F26522` as accent only, small Elitez logo in the header, "Operated by Elitez Group of Companies" footer attribution. Restrained, institutional tone.

## 13. Error handling

- **OTP:** wrong/expired code → inline error, allow re-entry. SMS not received → "Resend code" after the 60s cooldown.
- **Phone format:** reject non-8-digit input before calling Supabase.
- **Price drift:** server 409 → toast "Prices have changed, please review your cart" → return to Step 1.
- **Out of stock:** existing `/out-of-stock` page; a product going inactive between browse and checkout is caught at order creation.
- **Network / unexpected:** `sonner` toasts (already wired).
- **Empty cart:** checkout blocked at Step 1.

## 14. Testing

`vitest` is already configured. Unit tests:

- Cart store (existing tests carried over).
- `paynow.ts` QR/reference generation (existing tests carried over).
- Phone normalisation (8-digit → `+65XXXXXXXX`, rejection cases).
- Delivery-day derivation — dormitory mode reads `dormitories.delivery_day`; gathering-spot mode returns `'Sunday'`.
- `useTranslation` hook — key lookup, fallback to `en` on missing key.
- Order-create route validation — `dormitory_id` xor `gathering_spot_id`, price-drift rejection, idempotency.

Manual: full checkout flow end-to-end in a browser, exercised in at least English and one non-Latin-script language (Tamil or Burmese), covering both delivery modes and both the OTP-required and session-skip paths.

## 15. Retirement

- Disable GitHub Pages for `derrick-pixel/discounter`.
- Move `index.html` and `locations.html` from the repo root into `archive/` (kept for reference, no longer served).
- The discounter repo is **not** archived on GitHub — it is now the C2 app's home.

## 16. File structure (modify / create / delete)

**Modify:**
- `src/app/(store)/page.tsx` — server component; fetch event + products by `event_id`.
- `src/app/(store)/checkout/page.tsx` — rebuilt as the §9 wizard.
- `src/app/(store)/account/page.tsx`, `account/orders/page.tsx` — session-aware, phone identity.
- `src/app/(store)/layout.tsx` — add `LanguageProvider`, language bar, Elitez branding.
- `src/app/api/orders/create/route.ts` — §10.1 changes.
- `src/lib/supabase/*` — ensure a server/admin client is available for the catalogue fetch.
- `src/components/layout/Navbar.tsx`, `CutoffBanner.tsx` — event-driven copy, i18n.
- `src/components/products/ProductCard.tsx`, `CategoryFilter.tsx` — i18n.

**Create:**
- `src/messages/{en,hi,id,my,ta}.json` — UI string catalogues.
- `src/lib/i18n/` — `LanguageProvider`, `useTranslation` hook.
- `src/lib/utils/phone.ts` — SG phone normalisation (+ test).
- `src/components/checkout/*` — wizard step components.
- `src/components/layout/LanguageBar.tsx`.

**Delete:**
- `src/app/admin/**`, `src/app/api/admin/**`.
- `src/lib/tenant.ts` (superseded by event binding).

## 17. Risks & rollback

- **Risk: LOW–MEDIUM.** No backend schema changes; C2 is frontend + API-route work on an already-migrated database.
- The `sessions_inactivity_timeout` change is the one backend touch — §11's warning makes the hours-vs-seconds trap explicit. Verify GoTrue health after the restart.
- Rollback: the current discounter app is the fallback only in the sense that it is already non-functional (empty catalogue); there is no working state to regress *to*. Work proceeds on a feature branch; `main` is only updated when C2 is verified.
- Vercel env: confirm `SUPABASE_SERVICE_ROLE_KEY` is present in the `discounter-elitez` Vercel project (needed for the server-side catalogue fetch).

## 18. Acceptance criteria

- [ ] `discounter-elitez.vercel.app` shows the `dormitory-workers` catalogue (72 products) with working search + category filter.
- [ ] Hero copy renders from the event row (`badge_text`/`tagline_text`/`subtitle_text`), not hard-coded.
- [ ] Language bar switches all UI chrome between en/hi/id/my/ta; selection persists across reloads.
- [ ] Checkout wizard completes: cart → delivery mode → dormitory **or** gathering-spot picker → (OTP) → PayNow → confirm → success.
- [ ] First-time checkout requires phone OTP; a returning worker with a live session skips the OTP step.
- [ ] An order is written with `event_id`, exactly one of `dormitory_id`/`gathering_spot_id`, `delivery_day`, `payment_ref`, `fulfillment_status='pending'`, and the phone `user_id`.
- [ ] Order appears in flashcart's `/admin/orders`.
- [ ] `sessions_inactivity_timeout` is `4320` (hours); GoTrue healthy after the project restart.
- [ ] `src/app/admin/**` and `src/app/api/admin/**` removed from the discounter repo.
- [ ] GitHub Pages disabled; `index.html`/`locations.html` moved to `archive/`.
- [ ] `vitest` suite passes (cart, paynow, phone, delivery-day, i18n hook, order-create validation).
- [ ] Manual checkout verified in a browser in English + one non-Latin-script language, both delivery modes.

## 19. Out of scope (recap → Spec C3)

Admin delivery-routing: orders grouped by dormitory/gathering spot and delivery day, pick/pack/deliver `fulfillment_status` workflow, fulfilment exports. C2 ships the storefront; C3 ships the logistics admin.
