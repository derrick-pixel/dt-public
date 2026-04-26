# Elitez ESOP Platform — Build Prompt (v3, authoritative)

> This prompt is built from four source documents: the legal **Elitez Employee Share Option Plan** (adopted 5 Oct 2025), the employee-facing **ESOP Guidebook**, the **Year 2026 ESOP Info** operational playbook dated 25 Dec 2025, and **KPMG's Pricing Analysis** dated March 2024. Where they disagree, the legal Plan document governs; operational detail comes from the 2026 Info. A companion file `elitez-esop-seed-data.json` contains the holder roster (28 active + 3 terminated), grant history, valuation history, clawback formulas, and scheme parameters. Hand both to your coding agent.

---

## 1. Context

**Issuer**: Elitez Group Pte. Ltd. (EGPL), Singapore-incorporated holding company.
**Registered office**: 2 Kallang Avenue, #03-08, CT Hub, Singapore 339407.
**Base currency**: SGD.
**Fiscal year**: May 1 – April 30.

**Shareholding**: Three co-founders hold the company pre-ESOP:
- Teo Wen Shan, Derrick — Co-founder / CEO — 33.33%
- Chen Zaoxiang — Co-founder / Executive Director — 33.33%
- Lim Yong Ciat — CFO — 33.34% (also **ESOP Trustee**)

Collectively defined in the Plan as the **Major Shareholders**.

**Group entities** (ownership by EGPL):
- Elitez Pte. Ltd. — 100%
- Elitez & Associates Pte. Ltd. — 90% (10% minority interest)
- Elitez (FMCG) Pte. Ltd. — 100% *(verify: xlsx Trading Rules sheet implies 80/20 — resolve before go-live)*
- Elitez Security Pte. Ltd. — 70% (30% MI)
- **Dynamic Human Capital Pte. Ltd. (DHC)** — **60% (40% MI)** — notable because ~6 ESOP holders are DHC employees
- Jobs Today Pte. Ltd. — 100%
- Elitez Property Pte. Ltd. — 100% (investment-holding, excluded from ESOP-related transactions)

**Post-ESOP authorised shares**: 32,432,432. Pre-ESOP: 30,000,000. Pool: 6,486,486 (20%).

**Plan**: "The Elitez Employee Share Option Plan" adopted **5 October 2025**. Perpetual term. Governed by Singapore law; disputes via SMC mediation then SIAC arbitration.

**Grant history**: FY2022 (366,000 shares, grant date 15 Jul 2022, letter 31 Jul 2022), FY2023 (0), FY2024 (1,200,000, grant date 31 Jul 2024), FY2025 (535,300 draft). Note: FY2022 and FY2024 grants pre-date Plan commencement and are **regularised under the Plan** — confirm governance with corporate secretary.

**Users**: ~28 active holders (mid-to-senior employees across SG / MY, plus some based in BN and TW). 3 terminated leavers from FY2022 cohort. Most holders are first-timers — UX must be plain-language.

---

## 2. Tech stack

- **Next.js 15** (App Router) + **TypeScript strict**
- **Tailwind + shadcn/ui**
- **Supabase** (Postgres + Auth + Storage) — **RLS enabled from day 1**
- **Drizzle ORM**
- **Recharts**
- **React Hook Form + Zod**
- **TanStack Query**
- **Resend** for transactional email
- **Vercel** deploy

Propose stack changes with reasoning before scaffolding.

---

## 3. User roles

1. **Holder** — employee Option Holder. Read-only on own data. Submits exercise requests (when eligible) and trade bids/asks (during annual window). **Bound by confidentiality** under Plan Clause 15 — UI must enforce per-holder visibility; no peer directories, no public leaderboards.
2. **Admin (HR/Finance)** — captures performance scores, runs allocation, issues grants, maintains holder data, processes exercise payments, administers trading window.
3. **Committee** — the three Major Shareholders + 2 senior employees. Approval authority on grants, clawback determinations, FMV, exit events. Majority vote required; must include majority of Major Shareholders.
4. **Super Admin / Owner** — Derrick. Manages admins, thresholds, org settings.
5. **Trustee** — Lim Yong Ciat. Sees beneficial-owner registry and share certificate records. Confirms receipt of exercise funds to issue shares.
6. **Payment operations** — Lin Rongjie (rongjie@elitez.asia). Receives PayNow remittances (+65 96639634); reconciles to exercise requests; hands off to Trustee.
7. **Auditor** — read-only for external auditors / corporate secretary.

---

## 4. THE SCHEME — STRICTLY PER LEGAL PLAN + 2026 INFO

### 4.1 Pool & cap
- Authorised pool: **6,486,486 shares (20% of fully-diluted share capital)** — Plan Clause 6.1.
- Once 20% is reached, subsequent grants **dilute existing holders** (per 2026 Info Rule 5) rather than expanding the pool — requires Major Shareholder approval.
- Forfeited Options (expired, terminated grants) return to the pool (Clause 6.2).
- Treasury shares bought back under Company ROFR during trading window are earmarked for future ESOP (2026 Info Rule 7).

### 4.2 Eligibility (Plan Clause 7 + Guidebook Slide 6 + Slide 8)
- Minimum **3 years** employment with EGPL or any Group member on or before Grant Date (Committee may waive).
- Average performance rating **> 3.5** over the past 2 years.
- Age **18+**.
- Not bankrupt, not in composition with creditors.
- Not under termination notice.
- Shows potential for scalability, growth, sustainability, stability.

### 4.3 Share class
Employee Shares are **Series A Preference Shares** (as defined in the EGPL Constitution). Rights: **economic only** — dividends, liquidity-event proceeds, exit-event proceeds. **No voting rights.** On IPO / Exit Event, a **Mandatory Conversion Notice** converts Employee Shares 1:1 into Ordinary Shares (Clause 13.7).

### 4.4 Annual grant allocation — LINEAR (Guidebook Slide 7)

Each fiscal year the Committee determines the pool for that year. Eligible employees receive a weighted score across three factors, then:

```
shares_i = (score_i / Σ scores_all_eligible) × annual_pool_allocation
```

**Factor weights and scales** (Guidebook Slide 8 governs — not the xlsx):

| Factor | Weight | 1 pt | 2 pts | 3 pts | 4 pts | 5 pts |
|---|---|---|---|---|---|---|
| Years in Company | 15% | > 3 yrs | > 5 yrs | > 7 yrs | > 9 yrs | > 12 yrs |
| Current Year Performance | 60% | > 3.5 | > 4.0 | > 4.5 | > 4.75 | 5.0 |
| Potential in Future | 25% | 75% likely SM | Holding SM | 50% to Director | 75% to Director | Will assume Director |

Admin workflow:
- **Scoring screen** — enter all three factors per eligible holder; F1 auto-computes from date-of-hire; F2 and F3 manual entry by admin.
- **Allocation preview** — total pool for year, per-holder computed shares, rank, delta vs prior year.
- **Scenario modelling** (Derrick's own exploration, keep available but not default): also allow `quadratic_power` method (`shares_i ∝ score_i^p`, default p=2.3) and `median_anchored` method for what-if analysis only.
- **Guardrails** (soft, warnings only): top-20% pool share 38–50%; stdev of issued shares 10–15k; soft per-pax cap 60,000; round to 100.
- **Overrides**: admin can edit any row with a reason; both values logged.
- **Committee approval**: lock the run; Committee signs off (majority including majority of Major Shareholders); then grants are issued.
- **Issue**: generate Letter of Offer PDF per holder (template from Plan Appendix I), send by email; holder must accept within 30 days and remit **S$1 acceptance payment**; platform records Acceptance Form (Appendix II) execution.

### 4.5 Vesting — 1-year cliff + 48-month monthly (Plan Clause 10.1)

```
Year 1 (from Grant Date to day before 1st anniversary): 0% vested
End of Year 1:                                          20% vested (cliff)
Years 2-5: additional 1/48 × 80% vests each month       up to 100%
```

- Grant Date convention: **deemed to be first calendar day of the month of Grant Date** (Clause 10.1.2).
- **Exit Event** (Liquidity Event or IPO) triggers **immediate 100% vesting** (Clause 10.3).
- Leave of absence may suspend vesting at Committee discretion (Clause 10.2).

### 4.6 Exercise — event-triggered, 14-day window (Plan Clauses 10.6, 10.9)

**Exercise Date** = earlier of:
(a) receipt of an **Exit Notice** (Company informs holder of an Exit Event), or
(b) **5 years from the Grant Date**.

Holder must exercise **in whole, not in part**, **within 14 days** of Exercise Date, by submitting the Exercise Notice (Plan Appendix III) and remitting the **Aggregate Subscription Cost**.

Operationalised per 2026 Info:
- **January 1**: invitation sent to holders whose grants have hit the 5-year anniversary.
- **14 days** to exercise.
- Payment by cheque, cashier's order, or **PayNow to +65 96639634 (LIN RONGJIE)** with last-4 NRIC in remarks.
- Official shareholder by **30 January**.

**Exercise Price** = **90% discount on Fair Market Value as determined on the Exercise Date** (per Plan, not at grant date; per Letter of Offer template).

Example (FY2022 cohort exercising Jan 2027 at FY2025 FMV of S$0.8555):
- 60,000 shares × S$0.08555 = **S$5,133 cash in**
- Taxable perquisite (90% of FMV) = 60,000 × S$0.77 = **S$46,198** treated as SG employment income at exercise.

### 4.7 Fair Market Value — 6× EBITDA or NTA, whichever higher (2026 Info Rule 1)

```
if EBITDA > 0:
    enterprise_value = EBITDA × 6
    fmv_per_share    = max(enterprise_value, NTA) / total_outstanding_shares
else:
    fmv_per_share    = NTA / total_outstanding_shares
```

- Source: Elitez Group **audited financial statements**, published by 30 Nov after fiscal year-end.
- Committee determines annually; recorded with supporting PDFs.
- **Exit Event override**: FMV = actual transaction price (not the internal formula).
- Platform admin UI also surfaces the **KPMG benchmark** (March 2024: EV/EBITDA 8.0x–9.0x, equity range S$28.0–32.1m, P/E 10.5x–12.1x) as an *external reference only* so that the discrepancy between internal valuation (6x) and independent third-party benchmark (8–9x) is visible and auditable. It is a conscious policy choice; the platform must not auto-apply the higher multiple.

Historical FMV to seed:

| FY | EBITDA (S$) | × 6 (S$) | FMV/share (S$) |
|---|---|---|---|
| FY2021 | 2,866,596 | 17,199,576 | 0.5303 |
| FY2022 | (690,139) | NTA floor | 0.1969 (NTA) |
| FY2023 | 2,221,089 | 13,326,534 | 0.4109 |
| FY2024 | 6,146,972 | 36,881,832 | 1.1372 |
| **FY2025** | **4,624,269** | **27,745,614** | **0.8555 (active)** |

### 4.8 Trust structure

Exercised Employee Shares are held in **nominee trust by Lim Yong Ciat**. Beneficial owners (the employees) have economic rights only. Platform must:
- Track a `trust_holdings` registry keyed by beneficial owner, trustee, acquisition date, certificate number, cost basis.
- Generate share certificate records on trustee confirmation of funds receipt.
- Surface the trust-holding view to the Trustee role.

### 4.9 Leaver clawback — four-state matrix (Plan Clauses 11, 13.2)

**Committee determines** whether a termination is Bad Leaver (for Cause) or Good Leaver (without Cause, or employee-initiated with Board approval). Documented in audit log.

**Cause** includes: moral turpitude / fraud; material failure to perform; gross negligence / misconduct; material breach; bankruptcy.

**Unvested options** on termination: **always forfeited to pool**, regardless of leaver type.

**Vested but unexercised options** (Options Clawback Right):

| Scenario | Per-option consideration | Notes |
|---|---|---|
| **Bad Leaver** | **S$1.00 total for ALL vested options** | Flat, not per-option. Complete wipeout. |
| Good Leaver | `(0.20 × FMV_current) − Exercise_Price` per option | Typically ~10% of FMV |
| Exit Event | `FMV_current − Exercise_Price` per option | Full gain capture |

**Exercised Employee Shares** (Clawback Right):

| Scenario | Per-share consideration |
|---|---|
| **Bad Leaver** | `MIN(0.10 × FMV_current, 0.10 × Aggregate_Subscription_Cost_per_share)` — near-total wipeout |
| Good Leaver | `MAX(FMV_current, Aggregate_Subscription_Cost_per_share)` — keeps full FMV gain |
| Death | `MAX(FMV_current, Aggregate_Subscription_Cost_per_share)` |
| Exit Event | `MAX(FMV_current, Aggregate_Subscription_Cost_per_share)` |

Windows:
- Company must notify within **30 calendar days** of termination.
- For Good Leaver vested-unexercised: Committee has **90 days** to decide clawback vs let holder retain. Default = forfeited if no notice.
- Settlement within **30 days** of clawback notice.

### 4.10 Exit events (Plan Clause 13)

**IPO**: All unvested options vest immediately; exercisable before listing date. Employee Shares convert 1:1 to Ordinary via Mandatory Conversion Notice.

**Liquidity Event / Change of Control / Trade Sale** — company has **two options**:

1. **Drag** (Plan Clause 13.6.1) — Committee + Shareholder approval → notice within **30 days**:
   - **Cancellation Notice** (Appendix IV) to holders with unexercised vested options: cancel at `purchaser_price − Exercise_Price` per option.
   - **Drag-Along Notice** (Appendix V) to holders with exercised shares: transfer at `purchaser_price` per share.
   - Holders obliged to comply; attorney-in-fact appointment if defaulting.

2. **Tag** (Clause 13.6.2) — if company waives drag:
   - **Tag-Along Notice** (Appendix VI); 5 Business Days to reply.
   - Converted options: `purchaser_price − Exercise_Price`.
   - Exercised shares: `purchaser_price`.

Price adjustment mechanisms and non-cash consideration flow through. Platform must model all three scenarios (IPO waterfall, Drag, Tag) in the waterfall simulator.

### 4.11 Annual internal trading (2026 Info Rule 6)

- Target **January 16–31** yearly.
- Bid/ask form submission; batch-clear at window close.
- **Company ROFR**: EGPL has right to buy any lot at a premium of **S$0.01 above the highest buy-offer price**. Bought shares go to **treasury** earmarked for future ESOP.
- No per-holder cap on shares listed.
- Must observe lockup: newly exercised shares (from January exercise window) can enter the trading window only in the subsequent January, not same year.

### 4.12 Dividends

**Regular annual dividend** (if declared):
- **August**: declaration notice (based on FY ending April).
- **30 November**: payout.
- **December AGM**: adoption of audited FS and dividend confirmation.

**Special discretionary dividends** (e.g. from asset sales):
- Management decides per event; Committee / Major Shareholders approve.
- **Eligibility**: holders who exercise within the specified window (typically 1 month) receive the dividend.
- Unclaimed amounts return to EGPL.
- **Historical example**: Adept Academy Pte Ltd Sale (31 Dec 2025) — SGD 70,054.46 catered across 2,056,942 shares at **S$0.0341/share**.

Platform must support both types with approval workflow, per-holder payout ledger, payment instruction CSV for bank upload, and PDF dividend notices.

### 4.13 Multi-entity cost sharing (2026 Info Rules 2 & 3)

- **Rule 2**: When a non-wholly-owned subsidiary's employee exercises ESOP, **the exercise-price monies are routed to that subsidiary** (because the subsi's minority shareholders co-share the cost of issuing discounted shares to their staff).
- **Rule 3**: When EGPL pays dividends to ESOP holders who are employed by a non-100% subsi, **the subsi contributes back to HQ** pro-rata to the minority's share.

Platform must:
- Track employer entity per holder and its `group_ownership_pct`.
- On exercise: generate a ledger entry directing the exercise proceeds from EGPL to the relevant subsi.
- On dividend payout: compute minority contribution-back owed by each subsi and generate a ledger entry.
- Report: **Minority Cost-Sharing Ledger** per subsi per FY, exportable for audit.

**SESOP alternative** (Guidebook Slide 5 — not currently operationalised): subsidiary may swap up to 20% of own shares for EGPL shares at 30% discount, creating a SESOP pool for subsi employees only. Keep schema extensible for this; do not build in Phase 1.

### 4.14 Annual AGM (2026 Info December agenda)

AGM notice issued in **December**; meeting typically January. Agenda items to support in the platform:
1. Prepare Group valuation for next tranche of ESOP
2. Business directions and updates
3. Key group updates
4. Adopt audited FS
5. Confirm dividend payout (completed by 30 Nov)
6. Other matters

Platform features: notice publication, board-pack document hosting, resolution tracking, attendance register for ESOP beneficial owners and shareholders.

### 4.15 Annual calendar

| Month | Event |
|---|---|
| **January 1** | Exercise invitation sent to holders hitting 5-yr anniversary |
| **January 1–14** | Exercise window (14 days from invitation) |
| **January 16–31** | Annual Trading window |
| **January 30** | Official share registration for newly exercised shares |
| **May** | New ESOP grant notices based on performance appraisal |
| **August** | Final regular dividend declaration |
| **November 30** | Regular dividend payout |
| **December** | AGM notice + next-year trading notice |

---

## 5. Data model

Drizzle schemas with RLS policies inline. Hydrate from `elitez-esop-seed-data.json`.

| Table | Notes |
|---|---|
| `organizations` | EGPL, address, UEN |
| `entities` | Issuer + 7 subsis; `group_ownership_pct`; drives multi-entity cost sharing |
| `share_classes` | "Ordinary", "Series A Preference" (non-voting, convertible 1:1) |
| `users` | Supabase auth, role, mfa |
| `committee_members` | role (Major Shareholder / Senior Employee), active from/to |
| `holders` | employed_entity_id, full_name, job_title, nationality, nric_fin_encrypted (last-4 visible), address_encrypted, email, direct_supervisor_code, date_of_hire, termination_date, termination_type (null / good_leaver / bad_leaver / death), tax_residency, bank_account_encrypted |
| `performance_scores` | fiscal_year, holder_id, f1_years_pts, f2_perf_rating, f2_perf_pts, f3_potential_desc, f3_potential_pts, total_weighted_score, scored_by, scored_at |
| `allocation_runs` | fiscal_year, method (linear / quadratic_power / median_anchored), p_value, annual_pool, status (draft / committee_approved / issued), approved_by, approved_at, guardrail_flags_json |
| `allocation_entries` | run_id, holder_id, computed_shares, override_shares, final_shares, override_reason |
| `grants` | grant_no, holder_id, fiscal_year, letter_of_offer_date, grant_date (deemed 1st of month), quantity, vesting_cliff_date, fully_vested_date, earliest_exercise_date (=grant_date + 5yrs), latest_exercise_date (=earliest + 14d), status (offered / accepted / active / partially_vested / fully_vested / exercised / forfeited / lapsed), acceptance_form_doc_id, acceptance_fee_sgd (=1.00), board_resolution_doc_id |
| `valuations` | fiscal_year, ebitda_sgd, multiple (default 6), nta_sgd, enterprise_value_sgd, fmv_per_share_sgd, supporting_audit_doc_id, kpmg_benchmark_multiple_low, kpmg_benchmark_multiple_high, committee_approved_at |
| `exercise_invitations` | grant_id, invitation_date, deadline_date, status |
| `exercise_requests` | invitation_id, holder_id, quantity, exercise_price_per_share, aggregate_subscription_cost, payment_method (cheque / paynow / cashier_order), payment_ref, payment_received_at, status |
| `trust_holdings` | trustee_id (Lim Yong Ciat), holder_id (beneficial owner), share_class_id, share_count, acquisition_date, exercise_request_id, cost_basis_sgd, certificate_no |
| `liquidity_windows` | fiscal_year, submission_start, submission_end, settlement_end |
| `trade_orders` | window_id, holder_id, side (buy/sell), quantity, price_per_share, status |
| `company_rofr_actions` | window_id, target_order_id, rofr_price (=highest_bid + 0.01), status, destination (treasury) |
| `trade_matches` | window_id, sell_order_id, buy_order_id, quantity, price_per_share, settlement_status |
| `treasury_shares` | acquisition_event, acquisition_date, share_count, unit_cost_sgd, earmark (future_esop), status (held / reissued) |
| `dividends` | type (regular / special), source_event (e.g. "Adept Academy Sale"), declaration_date, record_date, payment_deadline, per_share_sgd, total_sgd, eligibility_rule, board_resolution_doc_id |
| `dividend_payouts` | dividend_id, holder_id, shares_held_at_record, amount_sgd, status (pending / paid / returned_to_egpl) |
| `minority_cost_ledger` | entity_id, fiscal_year, event_type (exercise / dividend / buyback), event_ref_id, group_pct, minority_pct, egpl_cash_flow_sgd, subsi_owes_or_receives_sgd, settled_at |
| `clawback_events` | holder_id, trigger (bad_leaver / good_leaver / death / exit_event), event_date, options_cleared_count, shares_cleared_count, options_consideration_sgd (=1 flat for bad leaver), shares_consideration_sgd (per-formula), committee_determination_doc_id, settled_at |
| `exit_events` | type (ipo / trade_sale / change_of_control / winding_up), status (proposed / approved / completed), transaction_price, drag_vs_tag_choice, notice_date |
| `drag_along_notices` / `tag_along_notices` / `cancellation_notices` | per Plan Appendices IV/V/VI |
| `agms` | fiscal_year, notice_date, meeting_date, agenda_json, board_pack_doc_id, resolutions_json |
| `agm_attendance` | agm_id, holder_id, status (invited / attended / proxy) |
| `documents` | type (letter_of_offer / acceptance_form / exercise_notice / share_cert / grant_agreement / audited_fs / valuation_report / kpmg_pricing / drag_notice / tag_notice / dividend_notice / scheme_rulebook), scope, storage_path, signed |
| `audit_log` | actor_id, action, entity, entity_id, before_json, after_json, ip, ua, created_at |
| `notifications` | user_id, kind, payload, read_at |

---

## 6. Holder features

### 6.1 Dashboard
- Cards: granted / vested / unvested / exercised; **current economic value** = (held shares × current FMV); **cost basis**; **unrealised gain (Good-Leaver equivalent)**.
- Vesting timeline: 1-yr cliff + 48-month curve. Shade in vested, outline unvested, show current position.
- **Next Exercise Date** countdown (5-yr anniversary of next-eligible grant).
- Upcoming windows: Exercise, Trading, AGM.
- Latest FMV card with the EBITDA × 6 breakdown (transparent).
- Active dividend and AGM notices.

### 6.2 My Grants
Per grant: grant date, letter-of-offer date, quantity, vesting status with breakdown (month-by-month), Exercise Date (earliest), status, linked Letter of Offer and Acceptance Form PDFs.

### 6.3 Exercise (only when eligible)
Shown when any grant has hit Exercise Date and is within 14-day window.
- **Simulator**: quantity, pay-in = 10% × FMV × qty, taxable perquisite = 90% × FMV × qty, estimated SG income tax at marginal rate.
- **Submit Exercise Request** → routes to admin queue.
- **Payment instructions**: PayNow QR, bank details, last-4-NRIC remark convention.
- Disclaimer: tax is employment income at exercise in SG; estimates only; consult tax advisor; deemed-exercise risk if non-SG-resident.

### 6.4 Trade (January 16–31 window only)
- **Sell**: list quantity + asking price. Shows expected proceeds; reminder that **Company has ROFR at highest bid + S$0.01**; company-purchased shares go to treasury.
- **Buy**: browse open asks (post-ROFR).
- Shows active / closed bids; historical trades of own only.
- Lockup: shares exercised this January cannot be listed until next January.

### 6.5 Dividends & special payouts
- History of regular + special dividends, eligibility status per event, amount received.
- For special dividends with "must exercise within window" condition, clear surfacing of deadline.

### 6.6 Documents
- Letter of Offer, Acceptance Form, Grant Agreement, Exercise Notice, Share Certificate, Cancellation / Drag / Tag Notices, Dividend Notices, AGM notices, Plan rulebook, Guidebook.

### 6.7 Profile
- Personal info (changes require admin approval).
- Tax residency toggle (affects estimates and deemed-exercise warning).
- Bank account for dividend / trade proceeds (encrypted).
- MFA.

### 6.8 Learn section (non-negotiable; most users are first-timers)
Plain-language pages:
- **How my ESOP works** — offer → accept → vest (1yr cliff + monthly 48mo) → 5-yr wait → exercise at 90% discount → hold in trust → annual trading / dividends / exit.
- **What are my shares worth** — EBITDA × 6 / 32.4M shares, with the current numbers.
- **What tax will I pay** — gain at exercise is SG employment income (IRAS perquisite).
- **What if I leave** — Bad Leaver vs Good Leaver vs Exit: show the actual numbers for a sample grant, not euphemisms. Bad Leaver = near-total wipeout. Good Leaver exercised = keep FMV. Exit = full value.
- **What if there's an IPO or sale** — drag, tag, automatic vesting.
- **Confidentiality reminder** — Clause 15; no sharing of scheme terms.

---

## 7. Admin features

### 7.1 Annual scoring & allocation
- Bulk-score eligible holders; F1 auto-derives from date-of-hire; F2 rating entry; F3 potential-tier picker.
- Eligibility filter auto-excludes <3yrs, <3.5 avg rating, under-notice, etc.
- Allocation preview with linear (default); toggle to quadratic/median-anchored for scenario modelling only.
- Guardrail panel; override with reason.
- **Committee approval workflow**: draft → submitted to Committee → majority approval (including majority Major Shareholders) → issued.
- Bulk-generate Letter of Offer PDFs (Plan Appendix I template), dispatch, track 30-day acceptance + S$1 fee receipt.

### 7.2 Cap table
- Fully diluted: founder holdings, Ordinary vs Series A Preference, pool outstanding, pool remaining, treasury, in-trust per holder, dilution %.
- Subsidiary ownership tree.
- **Waterfall simulator**: given Exit transaction price S$X, compute per-holder:
  - If unexercised vested: (X - Exercise Price) × count
  - If exercised: X × count
  - If Bad/Good Leaver historic: applicable clawback
  - Net of Exercise Price costs paid

### 7.3 Holders & eligibility
- CRUD. Employer entity drives multi-entity cost ledger.
- Eligibility auto-calc with override.
- Termination workflow: record date → Committee determines Bad vs Good → triggers clawback workflow.

### 7.4 Valuations
- Annual entry: FY, EBITDA, NTA, multiple (default 6), supporting audit PDF, KPMG benchmark values (optional).
- Auto-compute enterprise value, FMV.
- Publish → Committee approval → cascade to dashboards and subsequent exercise calculations.

### 7.5 Exercise operations (annual January window)
- Identify holders with Exercise Date in window; bulk-generate invitations.
- Queue of submitted Exercise Requests.
- Payment reconciliation (match PayNow inbound to holder's last-4-NRIC remark).
- On funds receipt: Trustee confirms; generate share certificate; register in trust_holdings; record minority-cost-ledger entry if subsi employee; generate Exercise Notice PDF (Plan Appendix III).

### 7.6 Trading window (Jan 16–31)
- Open/close window.
- Review bid/ask book.
- Execute **Company ROFR** per lot (highest bid + S$0.01 → treasury).
- Batch-clear remaining orders at window close.
- Settlement: generate transfer instructions, update trust_holdings, generate trade confirmations.

### 7.7 Leaver clawback workflow
- **Bad Leaver flow**:
  - Vested unexercised options → S$1 total buyback.
  - Exercised shares → MIN(10% FMV, 10% cost/share) × count.
- **Good Leaver flow**:
  - Committee 90-day decision window.
  - If clawback: (20% FMV − Exercise Price) × options; MAX(FMV, cost/share) × shares.
  - If allowed to retain: let holder keep Employee Shares; options lapse at 5-yr mark as normal.
- Generate clawback notice PDF; settle via bank transfer; update treasury / pool.

### 7.8 Dividends
- Regular: FY declaration, per-share amount, approval, payout CSV by 30 Nov.
- Special: trigger event, eligibility window, per-share amount, approval.
- Per-holder payout ledger. Unclaimed returns to EGPL (for special dividends).

### 7.9 Minority cost-sharing ledger
- Per-subsi, per-FY view of:
  - Exercise proceeds owed to subsi (from subsi-employee exercises)
  - Dividend contribution-back owed by subsi (from subsi-employee dividend payouts)
  - Clawback proceeds / costs
- Exportable CSV for subsidiary financial consolidation.

### 7.10 Exit event workflow
- Create Exit Event record (IPO / Trade Sale / Change of Control).
- Committee + Shareholder approval.
- Choose Drag vs Tag.
- Generate Cancellation / Drag-Along / Tag-Along notices (Appendices IV/V/VI) to all holders.
- Track replies, consent deeds.
- On completion: Mandatory Conversion Notice for preference → ordinary; settle considerations.

### 7.11 AGM
- Notice in Dec with board pack upload.
- Agenda, resolutions.
- Attendance + proxy register.

### 7.12 Reports
- Grants outstanding by holder / status.
- Exercises this FY with computed perquisite.
- Forfeitures / clawbacks.
- Dividends paid.
- Minority cost-sharing owed/received.
- Treasury shares movements.
- **IRAS Appendix 8B-style export** — gain on exercise per employee per tax year.
- ACRA-friendly cap table snapshot.
- Drop-date snapshots (as-of-date query for auditor).

### 7.13 Audit log
Immutable. Filter by actor, entity, date.

### 7.14 Settings
- Scheme parameters (all values in section 4) editable with audit trail.
- Entities & ownership %.
- Committee membership.
- Trustee name / deed.
- Payment operations contact.
- Email templates.
- Admin + role management.
- Dual-control thresholds (e.g. Bad Leaver wipeout above S$Xk requires 2 admin approvals even when formula is clear).

---

## 8. UI direction

- Finance-grade, clean. Reference Carta / Pulley — warmer, simpler.
- Light default, dark toggle.
- Holder top-nav, admin sidebar.
- Mobile-responsive for holders.
- Currency: S$ with thousand separators; integer cents storage.
- Share counts: integers only.
- Share prices: 4 dp for FMV, 4 dp for exercise price (e.g. S$0.0856).
- Tooltips on every ESOP term including "Series A Preference", "Aggregate Subscription Cost", "Clawback Price", "Drag-Along", "Tag-Along", "Bad Leaver", "Exit Event".
- Empty states must be educational.

---

## 9. Security, compliance, privacy

- **RLS on every table**. Holder → own rows. Admin → gated. Trustee → trust_holdings, dividend_payouts, clawback_events. Auditor → read-only all.
- **MFA mandatory**: super-admin, admin, trustee, committee. Strongly recommended for holders.
- **Encryption at rest** via application-layer envelope encryption (keys in Supabase Vault): NRIC/FIN, address, bank account.
- **NRIC masking**: `XXXXX267F` everywhere except own-profile full view.
- **Confidentiality enforcement (Plan Clause 15)**: no peer directories; no holder-to-holder info leakage; trade window shows only quantities and prices, not counterparties until settlement.
- **Audit log** on every write, same transaction.
- **Dual-control** above thresholds (configurable): clawback payouts > S$100k, ROFR treasury buys > S$500k, grants > 100k shares, FMV adjustments > 20% YoY.
- **Signed URLs**: 5-min TTL.
- **Session timeout**: 30 min admin/trustee/committee, 7 days holder.
- **Rate-limit** auth + write endpoints.
- **Singapore specifics**:
  - **IRAS gain-on-exercise reporting**: platform exports Appendix 8B-compatible data; corporate secretary files.
  - **Deemed-exercise warning**: surfaced when a non-SG-resident holder's termination is recorded.
  - **ACRA register of members** export (Ordinary + Series A Preference).
  - **No auto-filing** — platform surfaces; humans file.
- **Legal templates**: all PDFs (Letter of Offer, Acceptance Form, Exercise Notice, Cancellation, Drag, Tag, Dividend Notice) rendered from Plan Appendices with merge fields. Never freeform legal text in the app.
- **No crypto, no tokenisation, no public orderbook.**

---

## 10. Phased delivery

### Phase 1 — MVP
- Auth (email + password + TOTP); role-based RLS.
- Full data model per section 5, migrated with seed JSON (28 active + 3 terminated holders, 5 valuations, 3 grant years, 1 special dividend).
- Holder dashboard (6.1) + My Grants (6.2) + Learn (6.8 static).
- Admin: valuations (7.4), holders CRUD (7.3), cap table basic (7.2).
- Admin: scoring + linear allocation + Committee-approval workflow + Letter-of-Offer PDF generation (7.1).
- Documents upload/download.
- Audit log on all mutations.

### Phase 2
- Exercise operations (6.3 + 7.5) — end-to-end from invitation to trust_holdings registration.
- Annual trading window with Company ROFR + treasury (6.4 + 7.6).
- Leaver clawback workflow full matrix (7.7).
- Regular + special dividends (7.8 + 6.5).
- Minority cost-sharing ledger (7.9).
- Transactional email (Resend) for all notifications.

### Phase 3
- Exit event workflow (7.10): drag/tag/cancellation notices, Mandatory Conversion.
- AGM module (7.11).
- Waterfall simulator (7.2).
- IRAS Appendix 8B export (7.12).
- Dual-control framework (section 9).
- Trustee dedicated view.
- Auditor read-only.

---

## 11. Explicit non-goals
- No public orderbook; trading is batch-cleared, once a year.
- No crypto / tokenisation.
- No automatic tax filing.
- No e-signature vendor in Phase 1 (unsigned PDFs are fine; out-of-band DocuSign or physical).
- No payroll / HRIS integration in Phase 1 (F2 performance rating is admin-entered).
- No continuous multi-tenant SaaS — single org EGPL, but keep schema extensible.
- No surfacing of the higher KPMG valuation multiples as an operating price — keep the 6× internal methodology authoritative, show KPMG as reference-only.

---

## 12. Disclaimers to surface in-product (verbatim where legal matters)

1. **Exercise page**: "The gain at exercise (90% of FMV × shares exercised) is taxable as Singapore employment income and must be reported on your annual tax return. Calculator outputs are estimates. Consult your tax advisor."
2. **Non-SG residents on exercise page**: "As a non-Singapore tax resident, deemed-exercise rules may apply if you leave Singapore before exercise. Consult your tax advisor."
3. **Trade page**: "Share prices reflect Elitez Group's most recent internal valuation (6× audited EBITDA or NTA floor). Clearing depends on internal demand. The Company has a right of first refusal to buy at the highest bid + S$0.01."
4. **Every holder dashboard**: "If your employment ends, the consequences depend on the Committee's determination of Bad Leaver vs Good Leaver: Bad Leaver triggers near-total buyback at near-zero prices; Good Leaver allows you to keep the value of any exercised shares. Unvested options are always forfeited. See the 'What if I leave' page for specifics."
5. **Confidentiality** (on every page footer): "Information about the Elitez ESOP is confidential under Clause 15 of the Plan. Do not share details with third parties."

---

## 13. What I want you (the agent) to deliver

1. **Stack confirmation or proposed changes** with brief reasoning.
2. **3–5 clarifying questions** on:
   - Whether pre-Commencement (FY2022, FY2024) grants are fully covered by the 5-Oct-2025 Plan or require a separate deed of adherence;
   - How to model the Trustee — separate auth role with its own view vs admin-mode flag;
   - Whether multi-entity cost-sharing ledger should auto-settle (intercompany netting monthly) or remain an accounting report;
   - How to handle the FMCG ownership discrepancy in seed data (100% per KPMG, implied 80/20 per xlsx);
   - Whether the Letter of Offer PDF template in Plan Appendix I should be baked in as React-PDF or templated in the docs folder for corporate-secretary iteration.
3. **Scaffold**:
   ```
   /app
   /components
   /lib
     /calc          # PURE functions with unit tests:
                    #   - vestingStatus(grant, asOfDate)     [1yr cliff + 48mo]
                    #   - exerciseEligibility(grant, asOfDate)  [5yr rule + 14d window]
                    #   - exercisePrice(fmv)                  [fmv × 0.10]
                    #   - fmvPerShare(ebitda, multiple, nta, totalShares)  [max(ebitda*m, nta)/shares]
                    #   - allocationLinear / allocationQuadratic / allocationMedianAnchored
                    #   - clawbackOptions(leaverType, vestedOptions, fmv, exercisePrice)
                    #   - clawbackShares(leaverType, shares, fmv, costPerShare)
                    #   - minorityCostSharing(event, entity)
                    #   - taxEstimateSG(perquisiteAmount, residency)
                    #   - waterfall(exitPrice, grantsAndShares)
     /auth
     /pdf           # Letter of Offer, Acceptance, Exercise Notice, Clawback, Drag, Tag, Dividend
   /db
     /schema
     /migrations
     /seed          # consumes elitez-esop-seed-data.json
   /server-actions
   /docs
     architecture.md
     data-model.mmd
     scheme-rules.md           # plain-English restatement of section 4 for Learn section
     annual-calendar.md
     leaver-matrix.md          # table + examples
     setup.md
     compliance-sg.md          # for corporate secretary
     valuation-methodology.md  # internal 6x vs KPMG 8-9x
   SECURITY.md
   ```
4. **Migrations with RLS** for Phase 1 tables.
5. **Load seed** — verify pool remaining = 6,486,486 − 2,101,300 = **4,385,186** and the 28-holder roster ties to the 2026 Info table.
6. **Holder dashboard first** with real seed data: Tok Meiting's 171,995 shares across 3 grants should show FY2022 grant (60k, fully vested Jul 2027), FY2024 grant (71,595, fully vested Jul 2029), FY2025 grant (40,400, draft).
7. **Admin scoring + linear allocation** second.
8. **Grant issuance flow with Letter of Offer PDF** third.
9. **Stub Phase 2/3** with route skeletons and `// TODO:` comments.
10. **Unit tests for `/lib/calc/*`** covering:
    - Vesting: day 0 (0%), day before cliff (0%), cliff day (20%), month 13 (21.67%), month 60 (100%).
    - Exercise eligibility: 4 years 364 days (false), exactly 5 years (true, day-1 of 14-day window), 5 years + 14 days (true, day-14), 5 years + 15 days (false).
    - Exercise price: 60,000 shares at FY2025 FMV = S$5,133.
    - FMV: FY2025 (EBITDA 4,624,269 × 6 / 32,432,432 ≈ 0.8555); FY2022 negative EBITDA falls through to NTA floor.
    - Clawback matrix: all 4 scenarios × 2 vehicles = 8 cases with worked numbers from seed data.
    - Minority cost-sharing: DHC at 60% ownership, FY2025 dividend of S$0.0341 × 52,545 shares (Lim Runting) → S$1,791.79 payout, S$716.72 contribution-back owed by DHC.
11. **README** with local dev, env vars, Supabase setup, seed command.

---

## 14. Ground rules

- Server components by default; client only where interactivity demands.
- Mutations via server actions with Zod validation.
- Business logic in `/lib/calc` or server actions — never in UI components.
- Money as integer cents. Shares as integer. Prices as integer micro-SGD (6 dp) to handle S$0.085549-style exercise prices.
- Dates UTC in DB, render Asia/Singapore.
- Every write appends to `audit_log` in the same transaction.
- No placeholder data — seed is real and flows through to live dashboards.
- Keep legal terms verbatim from the Plan — do not paraphrase "Bad Leaver", "Exit Event", "Exercise Date", "Aggregate Subscription Cost", "Clawback Price".

---

## 15. Start by

Reply with:
(a) stack confirmation or changes,
(b) your 3–5 clarifying questions,
(c) a short plan ending with a working holder dashboard against the seed data.

Then ship.
