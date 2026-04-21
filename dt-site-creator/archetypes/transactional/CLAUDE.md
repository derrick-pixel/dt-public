# Transactional Archetype Playbook (v1 thin — depth coming in v1.5)

Sites where users pay, upload, or persist data. Examples: altru (PayNow charity pass-through), discounter (cart + Supabase), the-commons (escrow + marketplace), quotation_preparer (PDF → Excel).

## Inherits from
`archetypes/static-informational/CLAUDE.md` — style, layout, typography, component library all apply.

## Additional v1 rules

1. **Data persistence is mandatory.** Either localStorage (cart, drafts) or Supabase (orders, users). Never in-memory only.
2. **PayNow: use the EMVCo spec.** See `mechanics/paynow-qr/snippet.html`. Always render the amount in UI text AND in the QR payload — assert equivalence.
3. **Supabase gotchas.** Row-Level Security is OFF by default — enable it before shipping. Never commit service-role keys (they're distinct from anon keys).
4. **Confirmation pages are non-negotiable.** After every transaction, route to a dedicated `thank-you.html` showing what was paid / submitted / received, and a receipt-worthy summary.
5. **Admin panel is functional, not just analytical.** Unlike static-informational's competitor-analysis admin, transactional admin pages need to read/mutate real data (orders, submissions, status).

## Deferred to v1.5
- Full Supabase schema conventions
- Email / SMS confirmation patterns
- Refund / dispute flows
- Stripe integration (if needed beyond PayNow)
