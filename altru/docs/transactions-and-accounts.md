# Altru · Transactions & Accounts — Design Proposal

**Status:** Proposal awaiting founder sign-off · **Author:** Derrick + Claude · **Date:** 11 May 2026

This is the missing design between "we have lovely pages" and "we have a working platform." It covers two interlocking questions that haven't been settled:

1. **How does a couple's account come into being?** — particularly the case where a *wedding guest* discovers Altru and wants to give a gift before the couple have signed up.
2. **What is the full life of a transaction?** — every state, every actor, every notification, every edge case.

Eight sections; ~15 minutes to read; the founder decisions you need to make are in §10 at the end.

---

## 1 · Actors & entities

The platform models five actors and four core entities. Keeping them named explicitly removes most of the ambiguity in the flows below.

**Actors**
- **Couple** — one or both partners to a wedding. One person is enough to operate the account; the second partner can be added later for co-donor tax-receipt purposes.
- **Guest** — a wedding attendee who sends a gift via Altru. No account required.
- **Charity admin** — authorised representative of a partner IPC charity (read-only access to their own remittance reports).
- **Altru operator** — staff (you, today) handling support, dispute, abuse, and partnership administration.
- **System** — Altru's own automated processes (cron, webhooks, notifications). Modelled as an actor so its actions appear in the audit log.

**Entities**
- **Wedding** — the unit of the relationship. Has a date, a couple, one or more selected partner charities, and a configured default split.
- **Account** — the credentials, contact details, and consent record attached to a wedding. One wedding has exactly one account.
- **Gift** — the unit of money. Has an originating guest, a wedding, a charity selection, a personal/charitable split, and a state (see §5).
- **Disbursement** — the unit of payout. Aggregates one or more released gifts into a single transfer to a charity's UEN or to the couple's account, with a single bank reference.

---

## 2 · Account creation — the fork

The platform supports two creation paths. Both produce the same end state (an active account with a charity selection); they differ in who initiates.

### Path A · Couple-led (the primary path)

The default. The couple visits altru.asia, registers their wedding, picks one or more partner charities, generates a shareable URL, and announces it to their guests.

1. Couple visits `/couple` (or follows a link from a guest who said "you should be on this").
2. Provides: name(s), wedding date, primary email, primary mobile, target charity selection (1–3 from the panel), default split suggestion to guests.
3. Receives a magic link by email; clicks to verify.
4. SMS OTP to verify the mobile (raised friction here is deliberate — protects against typo-fraud and casual abuse).
5. Provides NRIC of the named donor of record (one or both partners, by election) for IRAS receipt purposes.
6. Account is active. Wedding URL is generated and shareable: `altru.asia/wedding/<slug>`.

**Time from start to active: ~3 minutes if the couple has their NRIC handy. ~6 minutes if SMS OTP arrives slowly.**

### Path B · Guest-led "create on behalf"

The case the founder asked about. A guest wants to send a gift to a wedding they're attending — but the couple is not on Altru yet. This path lets the guest pre-create the wedding so they can give immediately; the couple claims the account later.

1. Guest visits `/donor` and searches for the couple. No match found.
2. Guest clicks "Create a wedding entry for your couple" and provides: couple names, wedding date, the couple's email **and** mobile (the guest must know both — friction is the anti-abuse measure here).
3. Guest sends their gift through the normal donor flow. Gift state: `pending_claim`. **No charity is selected yet** — the gift sits in escrow pending couple claim *and* couple charity selection.
4. System sends two messages to the couple within 60 seconds:
   - **Email** to the address the guest provided: "[Guest name] has sent you a wedding gift through Altru. To accept this gift and direct the charity portion to a cause of your choice, claim your wedding dashboard within 14 days. If you don't, [Guest] will be fully refunded — no action needed on your part to refuse."
   - **SMS** to the same content but shortened, with a one-tap claim link.
5. Couple clicks the claim link, completes the couple-led onboarding flow (steps 2–5 of Path A) — name confirmation, charity selection, NRIC for IRAS, magic-link + SMS verification.
6. Once the couple is verified and a charity selected, the pending gift transitions to `pending` (the normal state) and the 14-day authorisation clock — *which was already running from the moment the guest paid* — continues. The couple can authorise or let it auto-refund.

**If the couple does not claim within 14 days, the gift auto-refunds to the guest.** No charitable transfer ever occurs.

**This path has an additional invariant: a wedding that is created by a guest cannot disburse to a charity until the couple is verified.** This is the structural anti-abuse control. Anyone could create a fake "John & Jane" wedding, but no money can move to any charity (or to the couple) without the real couple verifying email + mobile + NRIC.

### Path C · Vendor-led (deferred to phase 2)

Wedding planners, venues, and bridal-package vendors sometimes onboard their clients to platforms. This is the same as Path A operationally, with the vendor pressing the buttons on the couple's behalf and the couple completing the verification themselves. We don't build a dedicated vendor portal at launch; a vendor who wants to help can simply walk a couple through Path A.

---

## 3 · The wedding URL and the discovery surface

Every active wedding has a stable URL:

`altru.asia/wedding/<slug>`

The slug is a couple-chosen handle (e.g., `darren-and-priya-jun14`), shown to guests on save-the-dates, invitations, ang-bao cards, or wedding-website embed widgets. Defaults to `<firstname1>-and-<firstname2>-<mmm>` (lower case) if the couple doesn't pick one.

A guest who doesn't have the URL can also reach the wedding via:
- A search on `/donor` by couple name + wedding date (must match both — name alone is too ambiguous).
- A printed QR on physical ang-bao cards (encodes the wedding URL).

---

## 4 · NRIC capture — timing and scope

NRIC is captured **only from the named donor of record**, **only at the moment it is needed for an IRAS receipt**, and only with explicit consent.

- **Path A:** NRIC captured at couple onboarding (step 5).
- **Path B:** NRIC captured at couple claim (when the couple completes the deferred onboarding).
- **Guest NRIC:** Not captured by default. Optional only if a guest explicitly requests a personal tax receipt — and given our IRAS letter (Section 3 of `/docs/iras-clarification-letter.md`), the IRAS guidance is expected to confirm couple-as-named-donor, so this branch may not be supported at launch.

**Storage:** column-level encrypted in D1 using a Cloudflare-managed key; access logged immutably in `audit_log`. Never written to logs, never sent to third parties except the partner charity that issues the receipt for that specific gift.

---

## 5 · The gift state machine (full lifecycle)

```
                  guest pays
       ┌─────────────────────────────┐
       │                             │
       ▼                             │
 ┌──────────────┐  couple claims  ┌─────────────────┐
 │ pending_claim│─────────────────►│     pending     │
 └──────────────┘                  └─────────────────┘
       │                             │       │
       │ 14 days no claim            │       │
       ▼                             │       │ couple authorises
 ┌──────────────┐                    │       ▼
 │ auto_refunded│◄────────────────── │ ┌─────────────┐
 └──────────────┘  14 days no auth   │ │ authorised  │
       ▲                             │ └─────────────┘
       │                             │       │
       │ guest cancels in window     │       │ system disburses (T+1)
       └─────────────────────────────┘       ▼
                                       ┌─────────────┐
                                       │  released   │
                                       └─────────────┘
                                             │
                                             ▼ (terminal)
```

**States** (each one a row in `audit_log` when entered, with timestamp + actor + reason)

| State | Set by | Money location | Time-limited? |
|---|---|---|---|
| `pending_claim` | System on guest payment under Path B | HitPay merchant → Altru escrow | 14 days from payment |
| `pending` | System on couple claim, or System on guest payment under Path A | HitPay merchant → Altru escrow | 14 days from payment (not from claim) |
| `authorised` | Couple via dashboard | Altru escrow | Until system disburses (≤ 1 banking day) |
| `released` | System on disbursement | Charity UEN + Couple account | Terminal |
| `auto_refunded` | System on day 14 of `pending_claim` or `pending` with no authorisation | Returned to guest's PayNow | Terminal |
| `refunded` | Guest unilateral cancel, or Altru operator on dispute | Returned to guest's PayNow | Terminal |
| `failed` | System on payment processing failure | Never debited | Terminal |
| `disputed` | Altru operator on partner-charity raise or guest dispute | Frozen | Until operator resolves |

The 14-day clock is **always measured from the original payment timestamp**, never from the claim event. This is deliberate: it bounds the entire lifecycle predictably, regardless of how long the couple takes to claim.

---

## 6 · The full sequence — Path B example

To make the abstraction concrete, here is a complete Path B sequence for a single gift, with every actor visible.

| t | Actor | Event | State |
|---|---|---|---|
| 00:00 | Guest | Visits altru.asia/donor, can't find couple, creates wedding entry, pays S$200 via PayNow | `pending_claim` |
| 00:00 | System | Audit-log entry: `gift.created`, `state=pending_claim` | — |
| 00:01 | System | Sends claim email to couple's email + SMS to couple's mobile | — |
| 00:01 | System | Sends payment confirmation email to guest with refund link | — |
| 02:14 | Couple (one partner) | Receives email, clicks claim link, completes onboarding (name confirmation, charity selection, NRIC, magic-link + SMS OTP) | `pending_claim → pending` |
| 02:14 | System | Audit-log entry: `couple.verified`, `wedding.activated`, gift transitions to `pending` | — |
| 02:14 | Couple | Views Wedding Dashboard; sees the gift in the "pending authorisation" list | — |
| t+3 days | Couple (the other partner) | Joins as co-donor (50/50 election), provides own NRIC | — |
| t+5 days | Couple | Reviews all pending gifts (1 so far), authorises the S$200 gift | `pending → authorised` |
| t+5 days +24h | System | Daily disbursement cron runs; transfers charity portion to charity UEN and personal portion to couple's nominated bank | `authorised → released` |
| t+5 days +24h | System | Sends release confirmation email to guest and to couple | — |
| t+30 days | System | Monthly remittance: charity receives statement of all gifts released this month + an Altru tax invoice for 5% on those amounts | — |
| t+45 days | Charity | Issues IRAS tax-deduction receipt to the couple as named donor | — |

The Path A sequence is the same minus the `pending_claim` state — the gift starts in `pending` directly because the couple is already verified.

---

## 7 · Edge cases — how each is handled

| Case | Behaviour |
|---|---|
| Guest sends gift, then changes mind same day | Guest uses the refund link in their payment-confirmation email. Gift moves to `refunded`. Full refund T+1 via HitPay refund API. |
| Couple claims but selects no charity | Cannot exit onboarding without selecting at least one charity. The list is the three confirmed IPC partners; the couple may select up to three. |
| Couple authorises some gifts and ignores others | Each gift is independent. Authorised ones disburse; un-authorised ones auto-refund at their individual day-14 mark. |
| Couple changes charity selection mid-wedding | Future gifts go to the new charity; gifts already received are committed to the charity they were designated for at the moment of guest payment. The couple sees both in the dashboard, segregated. |
| Multiple charities split per gift | Yes — guest can split a single gift across up to three of the couple's selected charities. Each portion tracked independently and disbursed independently. |
| Guest sends to the wrong wedding | Donor flow shows a confirmation screen: couple names, wedding date, selected charities, amounts. Confirm-or-cancel before PayNow tap. Refund link still works for 14 days after. |
| Couple never claims (Path B) | All gifts in `pending_claim` auto-refund on day 14. The wedding entry remains as a stub for 6 months in case the couple shows up later, then is purged. |
| Couple verification fails (SMS OTP not received) | Operator can manually verify in a documented support flow with audit-log entry: `couple.verified.manual`, with reason. |
| Partner #2 wants to be co-donor mid-window | Partner #2 joins the account via separate magic link; provides their own NRIC; couple elects new split (50/50, 100/0, etc.). IRAS receipt issued to the elected split. |
| Wedding date is in the past by > 30 days | Cannot register a new wedding more than 30 days in the past. (Avoid backdating-fraud and confusion.) |
| Wedding date > 24 months out | Cannot register more than 24 months ahead. (Account state degrades over long horizons.) |
| Couple closes the account before wedding date | All `pending` gifts auto-refund immediately; couple receives a closure summary. |
| Partner-charity withdraws from Altru mid-window | All `pending` gifts designated to that charity auto-refund to the guests; couple is notified. New gifts cannot be designated to that charity from the moment of withdrawal. |
| HitPay payment fails (insufficient funds, network) | Gift never enters any state on Altru's side; guest sees the standard PayNow failure and may retry. |
| Disputed transaction (charity claims they didn't receive) | Altru operator marks the gift `disputed`; cross-checks bank statement; resolves within 5 working days per PFA cl.2.12. |
| Money-laundering / sanctioned-name match on guest or couple | HitPay's own KYC + AML controls cover this on the payment side. Altru maintains a sanctions check on couple registration (basic name match against MAS-published lists). Failed checks → `disputed`, operator review. |

---

## 8 · Identity, trust, and anti-abuse controls

| Control | Where it sits | Why |
|---|---|---|
| Magic-link email verification | Couple onboarding & claim | Confirms the email is real and reachable |
| SMS OTP verification | Couple onboarding & claim | Independent verification of the mobile; raises the cost of casual fake-couple creation |
| NRIC requirement gate before disbursement | System | No money moves to a charity without an IRAS-receivable named donor |
| Wedding-date sanity bounds | Couple onboarding | Stops backdating and far-future ghost weddings |
| Rate limit on couple creation per IP / per email | Workers + KV | Stops bulk fake-couple grift |
| Captcha on guest-led couple creation (Path B) | Donor flow | Stops automated abuse of the discovery path |
| Sanctions check on couple registration | Couple onboarding | MAS-published sanctions list match by name + DOB-equivalent; failed = `disputed` for operator review |
| Audit log on every state transition | System | 5-year immutable record for COC, IRAS, and dispute resolution |
| Donor-side refund link (14 days) | Donor-side payment-confirmation email | Self-service unwind; reduces operator load and customer-support burden |
| HitPay's own KYC + AML | Payment processing | Inherited from the licensed PSP relationship |

---

## 9 · Data model — D1 tables (first cut)

Schema sketch; field types omitted for readability.

```
couples
  id, wedding_id, name, role_in_wedding ('partner1' | 'partner2'),
  email, mobile, email_verified_at, mobile_verified_at,
  nric_encrypted, nric_consented_at, created_at

weddings
  id, slug, date, status ('pending_couple_claim' | 'active' | 'closed' | 'past'),
  default_split_personal_pct, created_by ('couple' | 'guest'),
  created_at, claimed_at, closed_at

wedding_charities
  wedding_id, charity_id, share_pct, added_at, removed_at

charities
  id, name, uen, ipc_no, paynow_uen, status, brand_kit_url

gifts
  id, wedding_id, guest_name, guest_mobile, gift_amount,
  personal_portion, charity_portions_json,
  state, state_changed_at, payment_ref, refund_ref,
  scheduled_auto_refund_at, created_at

disbursements
  id, wedding_id, charity_id_or_null, beneficiary_uen, amount,
  gift_ids_json, bank_ref, status, sent_at

invoices
  id, charity_id, month, gift_count, gross_charity_amount,
  altru_fee_amount, pdf_url, status ('issued' | 'paid'), issued_at

audit_log
  id, ts, actor_type ('couple' | 'guest' | 'system' | 'operator' | 'charity'),
  actor_ref, event_type, entity_type, entity_id, payload_json
  -- append-only; no updates, no deletes within retention
```

This is enough to drive every flow described above and meets the 5-year audit-log retention requirement in the Charities Act and the PFA.

---

## 10 · Decisions — locked in for Stage 2

Founder-confirmed 11 May 2026.

### Decision A — Path B (guest-led create-on-behalf): **YES, ship at launch.**

Both Path A and Path B are in V1, with the §8 anti-abuse controls. Build effort +1–2 weeks vs Path A only. Rationale: removes the cold-start problem, matches the "guest is at the wedding now and wants to give" moment, viral discovery surface.

### Decision B — Guest-side NRIC for personal IRAS receipts: **DEFER.**

Wait for IRAS reply to `/docs/iras-clarification-letter.md`. If IRAS confirms couple-as-named-donor is the only acceptable posture, the question disappears.

### Decision C — Both-partner verification: **NO, one partner is enough to operate.**

Either partner registers and operates the account. NRIC required only from the named donor of record (one or both, by election).

### Decision D — Sanctions screening at couple registration: **YES, light name-match.**

~30 LOC server-side match against MAS-published designated-persons lists. Failed match → hold the wedding in `disputed` for operator review. HitPay handles AML on the payment side; Altru handles party eligibility.

### Decision E — Wedding URL slug: **opinionated default with override.**

Default `<first1>-and-<first2>-<mmm>` lower-case (e.g. `darren-and-priya-jun`). Couple may override at onboarding. Server-side denylist blocks profanity / impersonation patterns.

---

## 11 · What this unlocks for Stage 2 build

Once these five decisions are signed off, the Stage 2 implementation has a definite scope:

- D1 schema (~9 tables, §9).
- Workers API routes: `/api/wedding/*`, `/api/couple/*`, `/api/gift/*`, `/api/auth/*`, `/api/charity/*`, `/api/admin/*`.
- HitPay integration (server-side webhook handler + refund API + payout reconciliation).
- Workers Cron: hourly auto-refund tick, daily disbursement, monthly invoice generation, daily retention sweep.
- Couple Dashboard UI (build on the existing `/couple.html` scaffold).
- Donor flow UI (build on the existing `/donor.html` scaffold), with the new "create wedding for couple" branch.
- Email + SMS transactional templates (claim, magic link, OTP, payment confirmation, refund, release, monthly statement).
- Sanctions screen + denylist.

Estimated implementation effort assuming a single developer: 4–6 weeks for Path A core; +1–2 weeks for Path B; +1 week for polish. Practical critical path is the HitPay integration + the cron jobs (the rest is form CRUD).

---

*Reviewer: Derrick Teo. Sign-off on Decisions A–E needed before Stage 2 build begins.*
