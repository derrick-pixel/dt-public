# Altru · Stage 0 Decisions Doc

**Prepared for:** Derrick Teo, Founder · **Date:** 11 May 2026 · **Status:** Draft for sign-off

These are the foundational decisions that gate every other piece of work on altru.asia. Until each of these is settled, downstream work (charity contract execution, tech build, marketing) risks rework.

**Take this document to:** (a) a Singapore corporate services agent, and (b) your accountant / tax advisor.

---

## 1 · Summary — One Line Per Decision

| # | Decision | Recommended | Why |
|---|---|---|---|
| 1 | Legal entity | **Singapore Pte Ltd** | Standard, signable, IPC partners will expect it. |
| 2 | Incorporation route | **Sleek or Osome** (corporate services SaaS) | Fast (~1 week), all-in-one with company secretary, ~S$500–1,500/yr. |
| 3 | Corporate banking | **DBS BusinessFirst** (primary) + **Wise Business** (operating buffer) | DBS gives the credibility a regulated counterparty wants; Wise gives speed. |
| 4 | Payments architecture | **Stripe Connect Custom** (initial) | Holds funds up to 90 days (covers the 14-day window), licensed under MAS, refunds and payouts are API-driven. |
| 5 | Backend stack | **Cloudflare Workers + D1 + Workers Cron** | Same vendor as today, generous free tier, edge-deployed, one bill. |
| 6 | Couple auth | **Passwordless magic link** (email) | Lightest, no passwords, no Singpass integration cost. |
| 7 | Donor auth | **No account** — single-use PayNow + idempotent reference | Lowest friction; matches wedding-guest mental model. |
| 8 | DPO | **You** at launch, formalise later | PDPA requires the role; not the person. Document the appointment. |
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

## 5 · Decision 4 — Payments Architecture

This is the highest-stakes Stage 0 decision because it determines MAS regulatory posture, the refund mechanic, reconciliation work, and per-transaction economics.

### The three viable paths

| Path | How it works | MAS posture | Per-gift cost | Effort | Holds funds? |
|---|---|---|---|---|---|
| **A. Stripe Connect Custom (recommended)** | Guest pays Altru's Stripe account via PayNow; funds sit in Stripe balance up to 90 days; on couple authorisation, payout to charity UEN; on non-authorisation, refund | None — Stripe SG is a Major Payment Institution licensed by MAS; you are their merchant | ~3.4% + S$0.50 (cards) / ~0.8% + S$0.50 (PayNow) | Medium — API integration, accounts for each charity | Yes, up to 90 days |
| **B. HitPay** | Similar shape, Singapore-native, simpler UI, fewer escrow controls | None — HitPay is also MAS-licensed | ~2% PayNow | Lower than Stripe | Payout T+1 default; manual hold via merchant settings, harder to do at scale |
| **C. Direct PayNow Corporate + own escrow bank account** | You receive PayNow into a dedicated DBS account, manually reconcile, manually trigger transfers + refunds | **You** may be a "domestic money transfer service" under MAS Payment Services Act — needs licensing or exemption | Bank fees only (close to zero variable cost) | High — manual reconciliation, refund flows, audit | Yes, indefinitely |

### Recommendation: Path A (Stripe Connect Custom)

**Why:**
1. **Removes the MAS licensing question entirely** — you're a merchant on Stripe SG, not a money-transfer service. This is the single biggest regulatory simplification available.
2. **The 14-day escrow window fits inside Stripe's 90-day hold ceiling.** You can hold funds in your Stripe balance until the couple authorises, then trigger a payout to the charity's external bank account.
3. **Refunds are first-class.** API-driven, full audit trail, handles chargeback flow.
4. **Reconciliation reports are built in** — feeds the monthly remittance statement you promised charity finance teams (see /charities/escrow).
5. **Charity UEN payouts.** Stripe Connect allows "External Account" payouts to Singapore bank accounts (or directly to UENs via PayNow when Stripe SG supports it).

**The cost:** ~3.4% on cards. If most gifts are PayNow (~0.8%), the blended fee on each gift is roughly the same as your 5% platform fee. Two options:
- Absorb it into the 5% (Altru's fee is gross; Stripe is COGS) — preserves the marketing message but compresses margin.
- Pass it through (charity sees a 5% Altru fee + Stripe fee separately) — clearer but tells two stories.

I lean **absorb** at launch; revisit once volume creates pricing power.

### What you'd switch to later (revisit at scale)
Once volume justifies it (~S$300K+/month routed), revisit **Path C** with proper MAS licensing or a confirmed exemption letter. Cuts variable cost dramatically.

### What I need from you to proceed
- Confirm "Stripe Connect Custom" as the chosen architecture, or push back.
- Decide pass-through vs absorbed fee economics.
- I'll spec the integration in Stage 2.

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

**Recommendation: Derrick acts as DPO at launch, formalised in a one-page appointment letter signed by the company.**

- PDPA requires the *role* to be filled; it does not require a third-party DPO.
- Set up `dpo@altru.asia` (Cloudflare Email Routing → your inbox, free).
- Write a one-page Data Protection Policy (template available from PDPC website).
- Reassign once Altru has > 5 employees or a dedicated compliance hire.

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

## 13 · Open Questions for You to Verify

1. **PSA exemption**: Even with Stripe in the middle, confirm with a Singapore payments lawyer (or via MAS directly) that Altru's role as orchestrator does not by itself require a PSA licence. Estimated 1 hour of legal time, ~S$300.
2. **IRAS receipt mechanic**: Confirm directly with IRAS that "couple is named donor; charity issues receipt to couple" is the correct posture for this wedding-giving structure. Get the answer in writing.
3. **Cyber-liability minimum cover**: PFA cl.6.2 requires "commercially appropriate" insurance. Get the SCS-equivalent expectation in writing — typically S$1M minimum, possibly S$2M.
4. **Nominee director**: Only relevant if you are not a Singapore resident. If you are, skip.
5. **Pass-through vs absorbed Stripe fee**: My recommendation is absorb; you may have a stronger view on the marketing implications.

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
