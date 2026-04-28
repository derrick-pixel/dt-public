# Transactional — Agent Dispatch

**Sibling fork recommendation:** **Recommended.** NBA analysis, tier design, and whitespace inform the offer architecture. Skip only if the brief has tight pricing already locked.

---

## Dispatch order

```
[1] Sibling fork (competitor-intel-template) — recommended
        ↓ produces /data/intel/*.json
[2] Agent 1 (Brief & Archetype Router)
        ↓
[3] Agents 2 + 3 + 5 in parallel
        ↓
[4] Human picks palette
        ↓
[5] Agent 4 (Stitch / UI Composer)
        ↓
[6] Agent 6 (SEO / OG / Asset Engineer)
        ↓
[7] Agent 7 (QA & Pitfall Curator) — opt-in
```

Additional non-agent step before Agent 4: write `data-flow.md` documenting inputs → state → mutations → outputs for the transaction (e.g., cart → checkout → PayNow → thank-you). This is the transactional archetype's distinguishing artefact.

---

## Required pages

| Page | Owner | Notes |
|---|---|---|
| `index.html` | Agents 3 + 4 + 5 | Hero + features + pricing tease + CTA |
| `pricing.html` OR `cart.html` OR `book.html` | Agents 3 + 4 + 5 | The actual transaction page |
| `thank-you.html` | Agents 3 + 4 + 5 | **NON-NEGOTIABLE** — confirms what was paid/submitted |
| `admin.html` | Agents 3 + 4 (consumes intel) | Functional admin, not just analytical (read/mutate real data) |
| `admin-insights.html` | Agents 3 + 4 (consumes intel) | Pricing + personas + whitespace |
| `colors.html` | Agent 2 | Transient |

---

## Mechanics required

| Mechanic | Always? | Notes |
|---|---|---|
| `og-social-meta` | yes | Mandatory |
| `og-thumbnail` | yes | Mandatory |
| `favicon` | yes | Mandatory |
| `multi-page-scaffold` | yes | Landing + transaction + thank-you minimum |
| `meta-tags-generator` | yes | Per-page meta from sitemap.json |
| `paynow-qr` | yes (SG) | Default SG payment — render amount in UI AND QR, assert equivalence |
| `localstorage-state` | yes | Cart / draft state persistence — Zustand+persist or vanilla |
| `wizard-form` | yes | Multi-step checkout / booking |
| `palette-tryout` | yes | colors.html |

## Mechanics optional

| Mechanic | When |
|---|---|
| `admin-auth-gate` | After first paying client |
| `pdf-pipeline` | Receipts, invoices, booking confirmations |
| `intel-consumer` | If sibling intel forked |
| `market-funnel` | If admin-insights includes TAM funnel |
| `persona-cards` | If sibling intel present |
| `chartjs-dashboard` | Admin analytics (orders over time, conversion funnel) |
| `canvas-hero` | Brand-driven hero on landing page |

---

## Critical pitfalls (transactional-specific)

These are the high-severity ones that have happened before and must NOT happen again. See `pitfalls.md` for the full list.

- `trans-paynow-wrong-amount` — UI showed $20, QR encoded $200. Refund nightmare. Render amount in UI AND QR; assert equivalence in code.
- `trans-paynow-no-checksum` — QR rejected by bank. Implement EMVCo CRC16.
- `trans-cart-memory-only` — Refresh = empty cart. Use localStorage or Zustand+persist.
- `trans-supabase-rls-off` — Anyone could read all orders with anon key. Enable RLS before shipping.
- `trans-service-role-exposure` — Service-role key in browser. Never. Use anon + RLS.
- `trans-no-confirmation` — After PayNow, lands on home. No receipt. Support exploded. `thank-you.html` is non-negotiable.

---

## Per-page hydration plan (when sibling intel present)

### admin.html (Competitor Analytics + functional admin)
Same as static-informational PLUS:
- Live order list (functional, not just analytical)
- Customer table
- Inventory or capacity dashboard

Functional admin reads real data (Supabase or localStorage). Analytical admin reads sibling JSON. They can co-exist in the same page or split into `admin.html` (analytical) + `admin-orders.html` (functional).

### admin-insights.html
Same as static-informational. Tier comparison from `pricing-strategy.json.recommended_tiers[]` is especially load-bearing — it directly shapes pricing.html copy and CTA.

### pricing.html / cart.html
- Tier copy from `pricing-strategy.json.recommended_tiers[].what_in[]` and `what_excluded[]`
- Effective price after PSG from `effective_price_after_psg`
- Trust anchors from `pricing-strategy.json.recommended_tiers[].psychological_anchor`

---

## Skip rules

If `brief.constraints[]` includes:
- `no-paynow` → skip paynow-qr; route to Stripe or external checkout via meta refresh.
- `static-export-only` → cannot ship transactional. Re-route to static-informational with a "Contact us" CTA.
- `single-page-checkout` → merge cart + thank-you into index.html with state-machine views; still ship the URL `/thank-you.html` for sharing the receipt.
