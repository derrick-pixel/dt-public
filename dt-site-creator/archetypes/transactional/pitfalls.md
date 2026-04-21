# Transactional — Pitfalls

Scar tissue from payment / persistence work.

```yaml
- id: universal-no-push
  title: "The site that went live but nobody could see"
  severity: high
  phase: shipping
  story: "Edited the site locally, demoed in browser, didn't git push. GitHub Pages kept serving the old version."
  source: "Universal"
  fix: |
    After every change: git add . && git commit -m "..." && git push
  lesson: "GitHub Pages serves from the remote, not your disk."
  mechanic: null

- id: universal-dark-default
  title: "Another dark-cyan site"
  severity: medium
  phase: planning
  story: "Started with dark-cyan by default, shipped a site identical to the last 3."
  source: "Universal"
  fix: |
    Generate colors.html with 5 palettes first. Never reuse a previous accent color.
  lesson: "Every brand needs its own personality."
  mechanic: null

- id: universal-stale-og
  title: "The WhatsApp preview showing last week's site"
  severity: medium
  phase: shipping
  story: "Redesigned landing, shipped, shared on WhatsApp. Thumbnail showed old accent + tagline."
  source: "Universal"
  fix: |
    Regenerate og-image.jpg on any visual change.
  lesson: "OG images cache aggressively."
  mechanic: og-social-meta

- id: universal-no-competitors
  title: "The generic copy"
  severity: medium
  phase: planning
  story: "Skipped competitor research, wrote from imagination. Site read like a template."
  source: "Universal"
  fix: |
    Research 30+ sites. Ship admin.html with analysis.
  lesson: "You cannot design better than the best if you haven't seen the best."
  mechanic: null

- id: trans-paynow-wrong-amount
  title: "The $20 QR that says $200"
  severity: critical
  phase: building
  story: "PayNow QR embedded amount 20000 cents instead of 2000. Customer scanned, paid $200 when owing $20. Had to refund manually."
  source: "discounter, Apr 2026"
  fix: |
    1. Render amount in UI text AND in QR payload.
    2. Before generating QR: assert uiAmountCents equals qrAmountCents.
    3. Show the amount to the user with 'Verify this amount' copy.
  lesson: "LLMs and humans hallucinate numbers. Assert equivalence at the QR boundary."
  mechanic: paynow-qr

- id: trans-paynow-no-checksum
  title: "The QR that scanned as invalid"
  severity: high
  phase: building
  story: "Generated PayNow string without the EMVCo CRC16 checksum. Bank app rejected it as malformed."
  source: "altru v1, Apr 2026"
  fix: |
    1. Always append CRC16 (field 63) to PayNow payload.
    2. Validate against a working bank QR before shipping.
  lesson: "Payment specs are pedantic. Copy a known-good implementation, don't paraphrase."
  mechanic: paynow-qr

- id: trans-cart-memory-only
  title: "The refresh that emptied the cart"
  severity: high
  phase: building
  story: "Cart state held only in React state. User refreshed mid-checkout, everything gone. Two customers complained in the first day."
  source: "discounter, Apr 2026"
  fix: |
    1. Use Zustand + persist middleware, or plain localStorage.
    2. Hydrate cart from storage on every page load.
  lesson: "E-commerce state outlives a page lifetime. Persist or lose."
  mechanic: localstorage-state

- id: trans-supabase-rls-off
  title: "The order table anyone could read"
  severity: critical
  phase: shipping
  story: "Shipped with Supabase default — RLS off. Anyone with the anon key (visible in browser) could SELECT * FROM orders."
  source: "discounter security audit, Apr 2026"
  fix: |
    1. Enable RLS on every table before shipping: alter table orders enable row level security.
    2. Write a policy matching user_id to auth.uid().
    3. Test with an unauthenticated client that queries return empty.
  lesson: "Supabase default is insecure-by-default. Enable RLS first, forget last."
  mechanic: null

- id: trans-service-role-exposure
  title: "The service-role key in the browser"
  severity: critical
  phase: shipping
  story: "Copied Supabase service_role key into the frontend by accident (swapped for anon). Full admin access leaked to every visitor."
  source: "security audit, Apr 2026"
  fix: |
    1. Only anon keys go in frontend JS.
    2. Service-role keys live in server-side env vars only.
    3. If leaked: rotate in Supabase dashboard immediately.
  lesson: "Two keys, two worlds. Never swap them."
  mechanic: null

- id: trans-no-confirmation
  title: "The checkout with no receipt"
  severity: medium
  phase: building
  story: "After PayNow QR scan, page returned to landing. User didn't know if payment went through. Support inbox filled up."
  source: "altru v1"
  fix: |
    1. Route to /thank-you.html after any transaction initiation.
    2. Show: amount, timestamp, reference number, what happens next.
    3. Email/SMS receipt is v1.5; UI receipt is non-negotiable at v1.
  lesson: "The buyer needs closure. UI confirmation is the minimum viable receipt."
  mechanic: null

- id: trans-ui-qr-mismatch
  title: "The hidden amount mismatch"
  severity: high
  phase: building
  story: "UI showed $20, QR encoded $22 (forgot to re-render after surcharge). User paid $22 thinking they paid $20."
  source: "discounter edge-case test"
  fix: |
    1. Compute amount once in a single source of truth.
    2. Both UI and QR read from that source.
    3. Never update one without the other.
  lesson: "Dual sources of truth breed bugs. Render from one."
  mechanic: paynow-qr
```
