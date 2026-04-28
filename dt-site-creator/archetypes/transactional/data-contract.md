# Transactional — Data Contract

JSON files this archetype produces and consumes, plus state mutations during transactions.

---

## Produces (same 7 as static + transaction state)

Standard 7 from FIELD-DICTIONARY.md (`brief`, `palette`, `sitemap`, `design-system`, `copy`, `assets-manifest`, `qa-report`).

### Plus: transaction state

Held in localStorage OR Supabase. Schema documented in project's `data-flow.md` (created before Agent 4 builds).

#### localStorage example (cart)
```json
{
  "version": 1,
  "items": [
    { "sku": "abc", "name": "...", "price_sgd": 1200, "qty": 2 }
  ],
  "subtotal_sgd": 2400,
  "updated_at": "2026-04-28T08:30:00Z"
}
```

Versioned schema. On version mismatch, migrate or clear (with user warning).

#### Supabase example (orders)
```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  amount_sgd integer not null,
  status text not null check (status in ('pending', 'paid', 'cancelled')),
  paynow_reference text,
  customer_email text,
  items jsonb not null
);

alter table orders enable row level security;

create policy "orders_select_own" on orders
  for select using (auth.uid() = user_id);
```

RLS is mandatory. No table ships without it.

---

## Consumes (sibling intel)

Same as static-informational. Particularly load-bearing:
- `pricing-strategy.json.recommended_tiers[]` → pricing.html copy + tier CTA buttons
- `pricing-strategy.json.personas[].next_best_alternative` → "vs. competitors" section copy
- `whitespace-framework.json.attack_plans[].pricing` → tier price anchors

---

## Minimum viable shapes (in addition to static-informational minimums)

### transaction state minimum
- Versioned schema (version: 1, 2, …)
- `updated_at` ISO timestamp
- Either localStorage namespace `<project>:cart` OR Supabase table with RLS

### `data-flow.md` (project-level doc, Agent 4 references)
- Inputs (what user enters: cart items, contact info)
- State transitions (idle → adding-to-cart → checkout → paid → confirmed)
- Mutations (which state changes write to localStorage / Supabase)
- Outputs (what user sees on thank-you.html: order ID, receipt link, next action)

### `thank-you.html` minimum content
- Order ID or reference number
- Itemised receipt (mirrors what was in cart)
- What happens next (delivery ETA, support email, calendar invite, etc.)
- "Save this page" instruction OR auto-emailed confirmation link

---

## PayNow QR contract

If `paynow-qr` mechanic is used:

```js
// Both must reflect the same number; the mechanic asserts equivalence at render time.
const amountInUI = formatSgd(cart.total_sgd);
const amountInQR = generatePayNowQR({
  uen: BRAND_UEN,
  amount: cart.total_sgd,  // SAME source of truth
  reference: order.id
});
console.assert(amountInUI === formatSgd(parseQrAmount(amountInQR)));
```

The amount displayed on screen and the amount encoded in the QR must derive from one source. Documented in `paynow-qr` mechanic README.

---

## Schema evolution

Transactional state schemas evolve more often than static schemas. When you change them:

1. Bump `version` in localStorage payload.
2. Write a migration in `js/migrations.js`: `migrate_v1_to_v2(state)`.
3. On load, detect old version → migrate → save new version → continue.
4. Document the migration in `data-flow.md`.

If you can't migrate safely (lossy schema change), warn the user before clearing:
> "Cart from a previous version found. Continuing will reset it. [OK] [Cancel]"
