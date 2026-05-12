# Altru · Stage 0 Decisions Doc

**Prepared for:** Derrick Teo, Founder · **Date:** 11 May 2026 (last revised) · **Status:** Founder-confirmed, in execution

These are the foundational decisions that gate every other piece of work on altru.asia. Until each of these is settled, downstream work (charity contract execution, tech build, marketing) risks rework.

**Take this document to:** (a) a Singapore corporate services agent, and (b) your accountant / tax advisor.

---

## 0 · Status snapshot (revised 11 May 2026)

| # | Item | Status | Note |
|---|---|---|---|
| 1 | Pte Ltd incorporation | **✅ Done** | Altru Asia Pte Ltd registered. UEN to be filled here once available: `[UEN]`. |
| 2 | Corporate banking | ⏳ In progress | Application being submitted; aiming for primary at DBS BusinessFirst. |
| 3 | Payments architecture | **HitPay** (founder-chosen, overrides original Stripe Connect recommendation) | See revised Section 5 — different MAS posture; lawyer brief drafted in `/docs/payments-lawyer-brief.md`. |
| 4 | Backend stack | Cloudflare Workers + D1 + Workers Cron | Stage 2 build. |
| 5 | Couple auth | Passwordless magic link | Stage 2 build. |
| 6 | DPO | **✅ Done** | Held at group level. Working email `dpo@altru.asia` → group DPO inbox via Cloudflare Email Routing. |
| 7 | Accountant | ⏳ To engage | Brief drafted in Section 12. |
| 8 | Transactional email | Resend or Postmark | Stage 2 build. |
| 9 | Error tracking | Sentry (free tier) | Stage 2 build. |
| 10 | Insurance | ⏳ To quote | PI + cyber-liability; targeting S$1–2M cover. |

The remaining hot items this week: **banking (close it), payments-lawyer engagement (send the brief), insurance (request quotes), accountant (engage).** Everything else flows from those.

---

## 1 · Summary — One Line Per Decision

| # | Decision | Selected | Why |
|---|---|---|---|
| 1 | Legal entity | **Altru Asia Pte Ltd** (incorporated) | Standard, signable, IPC partners expect it. |
| 2 | Incorporation route | **Done** | (Historic note: Sleek / Osome / equivalent.) |
| 3 | Corporate banking | **DBS BusinessFirst** (primary, in application) | Credibility a regulated counterparty wants. |
| 4 | Payments architecture | **HitPay Payment Solutions** | Singapore-native, MAS-licensed PSP, low PayNow fees (~0.8%). See Section 5 for MAS posture caveats. |
| 5 | Backend stack | **Cloudflare Workers + D1 + Workers Cron** | Same vendor as today, generous free tier, edge-deployed. |
| 6 | Couple auth | **Passwordless magic link** (email) | Lightest, no passwords, no Singpass integration cost. |
| 7 | Donor auth | **No account** — single-use PayNow + idempotent reference | Lowest friction; matches wedding-guest mental model. |
| 8 | DPO | **Group DPO** (`dpo@altru.asia` → group inbox) | Already in place; PDPA programme documented at `/docs/pdpa-programme.md`. |
| 9 | Transactional email | **Resend** or **Postmark** | Reliable, Workers-friendly SDKs, low cost at our scale. |
| 10 | Error tracking | **Sentry** (free tier) | Industry standard; integrates with Workers. |

---

## 2 · Decision 1 — Legal Entity

**Recommendation: Singapore private company limited by shares (Pte Ltd).**

### Why Pte Ltd
- Limited liability — protects personal assets if something goes wrong with charity money.
- Required for: signing a PFA with a charity, opening a corporate bank account, applying for MAS exemption or PSP merchant account, getting professional-indemnity insurance.
- Singapore Pte Ltd is the universal default for tech startups.

### Minimum statutory requirements
- ≥ 1 director who is **Singapore-resident** (citizen, PR, or EntrePass holder).
- ≥ 1 shareholder (can be the same person as the director).
- Company secretary appointed within 6 months (corporate services agent provides this).
- Paid-up capital: S$1 minimum (recommended ≥ S$1,000 for credibility).
- Registered Singapore address (agent's address is fine; cannot be a PO Box).
- ACRA filing fee: ~S$315.

### Naming
- "Altru Pte. Ltd." — check ACRA availability.
- The trading name "Altru" can be a separately registered business name if you want flexibility.

### What I need from you to proceed
- Confirm sole shareholder/director vs co-founder structure.
- Decide initial paid-up capital (S$1, S$1,000, S$10,000 are all common — affects perception, not legal substance).
- Singapore residency proof for the resident director.

---

## 3 · Decision 2 — Incorporation Route

**Recommendation: Sleek or Osome.**

| Provider | Approx. annual cost | What's included | Best for |
|---|---|---|---|
| **Sleek** | ~S$500–1,200/yr | Incorporation, company secretary, registered address, optional accounting | Fast online setup, good UX |
| **Osome** | ~S$700–1,500/yr | Same scope as Sleek + accounting & tax bundles | Slight edge on accounting integration |
| Traditional CSP (e.g., Tian Lay, A1) | Varies | Same scope, more bespoke | If you want a named human |

Avoid pure-DIY at this stage — the time saved on filings is worth more than the fee.

### What to email the chosen provider (paste-ready)
> Hi — I'd like to incorporate a Singapore Pte Ltd, sole director and shareholder (me, Derrick Teo, [your residency status]). Trading as Altru. Need: ACRA incorporation, registered address, company secretary, nominee director [if needed], and corporate bank account introductions to DBS or OCBC. Could you send me the engagement letter and a checklist of documents you need from me? Target: incorporated within 14 days.

---

## 4 · Decision 3 — Corporate Banking

**Recommendation: DBS BusinessFirst as primary, Wise Business as operating buffer.**

### Why two
- **DBS BusinessFirst** — credibility with regulated counterparties (charities, IRAS, the COC). The charity finance teams expect a real Singapore bank UEN on the receiving end. Account opening usually requires a director's physical presence (allow 1–2 weeks).
- **Wise Business** — fast online setup (~3–5 days), useful for paying vendors and operating expenses. Not a credibility tool, just operational.

### What you'll need to open the DBS account
- ACRA business profile (incorporation certificate).
- Director's NRIC.
- Initial deposit (often S$0 to S$3,000 depending on the plan).
- Business plan / one-pager (DBS sometimes asks).

### Important: the escrow account is NOT this account
The escrow holding (the 14-day couple-authorisation window) lives inside Stripe (see Decision 4), not on your own ledger. The DBS account receives Stripe payouts and outgoing transfers to charity UENs.

---

## 5 · Decision 4 — Payments Architecture (HitPay)

**Selected: HitPay Payment Solutions Pte Ltd as Altru's payment service provider.**

HitPay is a MAS-licensed Major Payment Institution, Singapore-native, with strong PayNow economics (~0.8% per transaction) and a clean merchant onboarding flow. The choice is sound; the **caveat** is that HitPay's standard payout cycle (T+1 / T+2) does not by itself implement a 14-day escrow window — the escrow has to live somewhere, and that "somewhere" is what determines our MAS posture.

### The fund-flow shape we will operate

1. Guest pays via PayNow → HitPay merchant balance.
2. HitPay pays out T+1 / T+2 → **Altru's DBS escrow account** (segregated from operating funds).
3. The funds rest in the DBS escrow account for the remainder of the 14-day couple-authorisation window.
4. On couple authorisation → Altru transfers the charity-portion to the charity's PayNow-UEN.
5. On non-authorisation by day 14 → Altru triggers a full refund via HitPay's refund API back to the guest.
6. The guest also retains a unilateral right of refund during the window.

### Why this triggers an MAS posture question

Because step 3 has Altru holding customer funds in its own bank account for up to 14 days, **Altru's role may meet the PSA s.2 definition of a "domestic money transfer service"** even though HitPay does the front-end processing. This is the single highest-stakes legal question to settle before launch.

**Mitigations on the table:**
- The PSA's small-scale exemption likely covers Altru's first-year volume (forecast below S$3M).
- Restructuring the flow so the charity portion is paid out directly from HitPay to the charity UEN (with the 14-day window enforced inside HitPay's refund window) would cleanly remove the question.
- A standard PI or major PI licence is a fallback, but heavy and not justified at our scale.

### Action item: payments-lawyer brief is drafted

A paste-ready brief asking Singapore payments counsel to settle this question — including the exemption analysis and the alternative-structure question — is at **`/docs/payments-lawyer-brief.md`**. Estimated lawyer time: ~1 hour, ~S$300–600. Send it this week.

### Per-gift economics

HitPay PayNow rate is ~0.8%. On a S$200 gift with 50/50 split, the platform fee position is:
- 5% on the charity portion (S$100) = S$5 invoiced to the charity
- HitPay fee on the gross (~S$1.60) is absorbed by Altru as COGS
- Net Altru margin on this gift ≈ S$3.40 after PSP fee, before other operating costs

This is healthier than the Stripe scenario, and the "100% to charity in gross" marketing line remains intact.

### What's still uncertain

- Whether HitPay supports a clean **payment-splitting** flow (one PayNow tap → fork at HitPay between charity UEN and Altru escrow) that would let us avoid the 14-day-hold-on-Altru's-books problem. This requires a conversation with HitPay sales / integration.
- Whether the small-scale PSA exemption is a self-assessment or requires written confirmation. Lawyer brief covers this.

### What I need from you to proceed

- Status update on HitPay merchant application (will go in here once confirmed): `[ ] account created  [ ] under review  [ ] live`
- Send the payments-lawyer brief this week (or assign to legal).

---

## 6 · Decision 5 — Backend Stack

**Recommendation: Cloudflare Workers + D1 + Workers Cron + Resend, all on the existing Cloudflare account.**

### Why this stack
- **Already deployed on Cloudflare Workers static-assets.** No architectural break.
- **One vendor, one bill.** Solo-founder ergonomics.
- **Free tier covers Altru-scale for years** — Workers (100K requests/day free), D1 (5GB free), Workers Cron (free at low frequency).
- **Edge-deployed.** No cold starts, no region selection.
- **D1 is SQLite** — backups are a `wrangler d1 export` away. Auditable.

### What you'd avoid by NOT picking this
- Supabase + Workers → adds a vendor, more $.
- AWS Lambda + RDS → expensive at idle, slow to set up.
- Self-managed VM → on-call burden you don't need.

### Concrete pieces you'll need built (Stage 2 work)
- D1 schema: `couples`, `gifts`, `escrow_states`, `audit_log`, `charities`, `disbursements`, `invoices`.
- Workers Cron job: hourly tick that auto-refunds gifts past their 14-day window.
- Workers routes: `/api/gift/create`, `/api/gift/authorise`, `/api/gift/refund`, `/api/couple/auth/*`.
- A Stripe webhook handler at `/api/stripe/webhook`.

---

## 7 · Decision 6 — Auth Model

**Couples — passwordless magic link via email.** Workers KV stores one-time tokens with a 15-minute TTL. ~200 lines of code. No password reset flow ever.

**Donors — no auth.** Each gift carries an idempotent reference (UUID); the donor receives an email confirmation with a refund link valid for 14 days. No account creation, no friction.

**Admin (you) — Cloudflare Access on `/admin/*`.** Free, SSO via your Google/email, zero code.

### Avoid
- Singpass MyInfo integration. Heavy, requires GovTech onboarding, not justifiable until volume.
- Password-based logins. Lock-out costs in support volume; cost of doing this securely is real.
- Anonymous couple accounts. Without auth, you can't deliver the dashboard or honour authorisation.

---

## 8 · Decision 7 — DPO & Compliance Roles

**Decided: the group-level DPO covers Altru.**

- The role is filled at the parent-group level; no separate appointment is required for Altru Asia Pte Ltd at this stage.
- Working email `dpo@altru.asia` is routed via Cloudflare Email Routing to the group DPO inbox.
- Full programme (data inventory, retention schedule, breach runbook, contact card) is documented at **`/docs/pdpa-programme.md`**.
- Annual review and tabletop exercise scheduled in the programme.

To complete this item: confirm the group DPO's name and group-level appointment letter is on file, and update the PDPA programme's contact card with their mobile.

---

## 9 · Decision 8 — Accountant

**Recommendation: a fixed-fee compliance package from Sleek or Osome (S$80–150/month at our scale).**

Includes:
- Monthly bookkeeping
- Annual return + AGM filing
- Estimated Chargeable Income (ECI) filing
- Form C-S filing (tax)
- GST advice (we're under the S$1M threshold for now, so no GST registration needed yet)

**What to tell the accountant on Day 1:**
> Altru is a Singapore Pte Ltd operating as a third-party charity fundraiser under the Charities Act. Revenue model is a 5% platform fee billed to partner IPC charities on funds disbursed. Payments are processed through Stripe Connect Custom; charity-portion donations never sit on Altru's balance sheet — they pass through Stripe's escrow direct to the charity UEN. Operating expenses only on our books. We need accounting that reflects this pass-through structure, not gross-up accounting.

---

## 10 · Sequencing — Calendar View

### Week 1 (start now)
- Email Sleek/Osome with the script in Section 3.
- Open Wise Business account online (3–5 days; needs ACRA pending OK in most cases).
- Reserve company name in ACRA via the chosen agent.

### Week 2
- Incorporation complete → ACRA business profile in hand.
- Apply for DBS BusinessFirst account (1–2 weeks).
- Create Stripe Singapore business account (apply once you have the ACRA profile).

### Week 3
- DBS account open.
- Stripe Connect Custom configured; sandbox test of payment + refund.
- Engage accountant.
- Appoint yourself as DPO in writing; create `dpo@altru.asia`.

### Week 4
- Get insurance quote (Lockton, Howden, Tokio Marine all underwrite professional-indemnity + cyber-liability for Singapore SMBs).
- Restart SCS partnership conversation with the paid-in-gross structural fix.

By end of Week 4, Stage 0 is closed and Stage 1 / Stage 2 can run in parallel.

---

## 11 · What to Bring to the Corporate Services Agent (paste-ready)

```
Engagement scope requested:
- Incorporate "Altru Pte. Ltd." (subject to ACRA name availability)
- Sole director + sole shareholder: Derrick Teo (Singapore resident)
- Paid-up capital: S$1,000
- Registered address: agent's address
- Company secretary: provided by agent
- Bank account introductions: DBS BusinessFirst (primary)
- Standard annual compliance package (annual return, AGM filing, etc.)
- Bookkeeping bundle: needed (separate quote acceptable)

Target incorporation date: within 14 days of engagement letter signing.
```

---

## 12 · What to Bring to the Accountant (paste-ready)

```
Business description:
Altru is a Singapore Pte Ltd (subject to incorporation) operating as a
third-party charity fundraiser under the Charities Act. We are not a
charity ourselves.

Revenue model:
5% platform fee invoiced to partner IPC charities on funds successfully
disbursed to them. No revenue is taken from donor funds. Charity-portion
donations flow through Stripe Connect Custom direct to the charity UEN.
They do not pass through Altru's balance sheet at any point.

Reporting needs:
- Monthly P&L
- Annual return + Form C-S
- ECI filing
- Quarterly check on GST threshold (S$1M)

Special items to flag:
- Pass-through donation flow — not gross-up accounting
- Stripe Singapore fee is COGS (deducted from gross 5%)
- 5-year record retention required by Charities Act / PFA template
```

---

## 13 · Open Questions — Status

| # | Question | Status | Artefact |
|---|---|---|---|
| 1 | PSA posture under HitPay-merchant pattern with Altru-held escrow | **Brief drafted, awaiting send to counsel** | `/docs/payments-lawyer-brief.md` |
| 2 | IRAS confirmation of couple-as-named-donor receipt mechanic | **Letter drafted, awaiting send to IRAS** | `/docs/iras-clarification-letter.md` |
| 3 | Cyber-liability minimum cover for PFA compliance | ⏳ To be quoted | (target S$1–2M, request quotes from Lockton / Howden / Tokio Marine) |
| 4 | Nominee director | ✅ Moot (Derrick is Singapore-resident) | — |
| 5 | Pass-through vs absorbed PSP fee | ✅ Decided: absorb at launch | (Section 5 above; preserves the "100% to charity in gross" marketing line) |
| 6 | HitPay payment-splitting capability | ⏳ To clarify with HitPay sales | (would simplify the MAS question if available) |

---

## 14 · Assumptions Behind This Document

If any of these are wrong, the recommendations may shift:
- Altru launches with one charity partner, not three at once.
- Annual gift volume in year one is below S$3M (kept inside the small-scale PSA exemption envelope).
- Derrick is the sole founder and director at launch.
- The site stays static + Workers; no traditional server.
- No physical office; agent's registered address is acceptable.
- Singapore-only operation; no cross-border donors at launch.

---

*Reviewer: Derrick Teo. Sign-off needed on all 10 decisions in Section 1 before Stage 1 begins.*
