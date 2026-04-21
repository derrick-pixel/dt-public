# Transactional — Past Examples

## 1. Altru — PayNow charity red-packet pass-through
- **Showcase:** https://derrickteo.com
- **Why it matches:** PayNow QR generator, tax-relief calculator, narrative flow leading to a transaction.
- **Mechanics used:** paynow-qr, multi-page-scaffold, wizard-form, og-social-meta
- **Screenshot:** `/dashboard/samples/transactional/altru.jpg`

## 2. Discounter — near-expiry FMCG delivery with Supabase cart
- **Showcase:** https://derrickteo.com
- **Why it matches:** Cart persistence (Zustand + localStorage), weekly batch checkout, PayNow EMVCo, Supabase auth.
- **Mechanics used:** paynow-qr, localstorage-state, admin-auth-gate, multi-page-scaffold, og-social-meta
- **Screenshot:** `/dashboard/samples/transactional/discounter.jpg`

## 3. The Commons — P2P event platform with escrow
- **Showcase:** https://derrickteo.com
- **Why it matches:** Event creation form, escrow runner gating payment, marketplace listings, admin panel.
- **Mechanics used:** wizard-form, localstorage-state, admin-auth-gate, multi-page-scaffold
- **Screenshot:** `/dashboard/samples/transactional/the-commons.jpg`

## 4. Quotation Preparer — PDF → Excel tender generator
- **Showcase:** Internal tool
- **Why it matches:** Upload pipeline (PDF → JSON → Excel), Gemini extraction, bilingual BOQ output.
- **Mechanics used:** pdf-pipeline, wizard-form
- **Screenshot:** `/dashboard/samples/transactional/quotation-preparer.jpg`
