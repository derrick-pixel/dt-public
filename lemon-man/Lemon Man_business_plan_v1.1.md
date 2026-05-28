# Aver
## Workforce Reliability Network — Business Plan v1.1

**Working name:** Aver Pte. Ltd. (provisional; pending trademark and entity search)
**Date:** 18 May 2026
**Status:** Concept-stage; pre-funding; pre-incorporation
**Distribution:** Confidential — founder and direct advisors only

---

## Changes from v1.0

Two material structural changes:

1. **Rebrand.** Lemonade / Workforce Reliability Network → **Aver**. The word means "to assert as true, formally and under one's name." It is short, legally weighted, neutral, and free in the HR-tech space (search clean as of May 2026). Alternate names retained for fallback if trademark search blocks: **Concord** (agreement, accord) or **Recta** (Latin, "straight/true"). The "Lemonade" sub-brand from v1.0 is dropped entirely — any playful framing pulls the product toward consumer-app territory, where the legal exposure is higher and the credibility lower.

2. **Sponsor de-linking.** v1.0 positioned Elitez Group as visible anchor sponsor and data partner. v1.1 separates them entirely. Aver is incorporated, governed, staffed, and publicly positioned as an independent venture with no Elitez branding, lineage, or visible founder linkage. The strategic implications of this separation are significant and worked through in §6.5 below.

The rest of this document is the v1.0 plan rewritten under these constraints. Numbers, market sizing, and regulatory architecture are unchanged from v1.0 except where the de-linking forces a different operational approach.

---

## 1. TL;DR

Aver is a two-sided employment-reputation utility for the Singapore (and later SEA) shift, contract, and freelance labour markets. Employers contribute structured, evidence-backed conduct records on workers; workers can claim profiles, dispute records, and accumulate positive endorsements. The platform is positioned as the **non-financial-sector extension of MAS's "rolling bad apples" reference-check regime** — established for SG financial institutions since December 2023 and now the cleanest regulatory precedent for inter-employer conduct data sharing.

**Why now:**
- MAS's rolling-bad-apples framework gives a clean regulatory analogue and a clean rhetorical anchor.
- Singapore's gig and shift-staffing platforms (FastGig, Anytime Work, Staffie, Troopers) have validated cross-shift worker rating systems — but each is a walled garden. There is no neutral cross-platform utility.
- Workplace Fairness Act enters operative phase 2026–2027, creating both risk (worker rights tightened) and opportunity (employers need defensible, well-documented hiring processes).
- Singapore's licensed employment agency base has consolidated from ~3,900 in 2015 into a smaller, more professionalised set willing to pay for shared infrastructure.

**Headline targets:**
- Year 1: 80 paying employer logos, S$220k ARR, ~120k records under management.
- Year 3: 1,200 logos across SG/MY/PH, S$5–7M ARR, 2M+ records.
- Capital to MVP: S$280k–S$420k. To EBITDA breakeven: S$1.5–1.8M across two rounds.

**Headline risks:**
- Defamation suit from a worker on a contested record.
- PDPC enforcement action on the consent / processing architecture.
- TAFEP, NTUC, or MOM publicly opposing the platform.
- Network-effect cold-start with no Elitez data anchor (de-linking constraint).

Each is addressed in §7–8.

---

## 2. Problem & opportunity

### 2.1 The economic problem

The market for shift, contract, and freelance labour in Singapore exhibits classic Akerlof "market for lemons" dynamics:

1. **Asymmetric information.** Employers cannot easily distinguish a reliable worker from one with a pattern of no-shows, malingering, or data-leakage before deployment.
2. **One-sided review infrastructure.** Workers can publicly review employers on Glassdoor, Google Maps, JobStreet, Reddit, and TikTok. Employers have no comparable channel.
3. **Asymmetric cost of failure.** A single no-show in F&B costs S$200–S$1,000 (wage paid, backfill premium of 30–60%, liquidated damages to client, ops time, relationship damage). In events, security, healthcare, or aviation, a missed shift can void an entire client contract.
4. **Bad actors can freely re-enter.** Workers dismissed at one employer simply reappear at another agency under the same identity, with no record following them. This is the labour-market analogue of MAS's "rolling bad apples" problem in finance.

### 2.2 Cost-stack of an unreliable shift worker (illustrative)

For a typical S$120/shift F&B or events deployment:

| Cost component | Conservative | Aggressive |
|---|---|---|
| Wage paid for absent shift (where applicable) | S$0 | S$120 |
| Last-minute backfill premium (30–60%) | S$36 | S$72 |
| Liquidated damages owed to client | S$100 | S$300 |
| Ops team firefighting | S$25 | S$80 |
| Client-relationship damage (amortised) | S$50 | S$500 |
| **Total cost per no-show incident** | **S$211** | **S$1,072** |

For security, healthcare, or aviation, per-incident cost scales to S$500–S$3,000. An agency with 2,000 deployed manpower at a 3–5% no-show rate sustains 60–100 incidents/month — S$13k–S$107k of cost per month, or S$150k–S$1.3M annualised from a single failure mode.

### 2.3 The signalling opportunity

Modest improvements in the signalling layer create disproportionate value:
- An employer avoiding 20% of no-show hires saves S$30k–S$260k/year per mid-sized agency.
- *Deterring* no-shows ex ante (via the existence of cross-employer records) creates value that does not appear in transaction data. This deterrent value is structurally similar to consumer credit bureaus — being on a record matters more than being looked up.

### 2.4 Adjacent gap: background checks

Formal background checks (HireRight, Sterling, First Advantage; local: Veremark, Verify SG) cost S$30–S$150 per check and are too slow and expensive for low-wage, high-volume shift hiring. There is a clear gap for fast, cheap, **behavioural-record** checks calibrated for shift and contract roles.

---

## 3. Strategic reframing: utility, not blacklist

### 3.1 Why a pure "blacklist" frame is fatal

Three converging forces make a one-sided adverse-record database non-viable in Singapore:

1. **PDPA exposure.** Third-party publishing of employee personal data without lawful basis violates PDPA. Fines as of 2026: higher of S$1M or 10% of annual turnover. Internal "evaluative purpose" and "managing employment" exceptions do not extend to a commercial cross-employer platform.

2. **Defamation precedent (*Ramesh s/o Krishnan v AXA Life Insurance Singapore Pte Ltd* [2016] 4 SLR 1124).** SG Court of Appeal: employers giving references must ensure facts are true and accurate, avoid cherry-picking to create misleading impressions, and **give the worker a meaningful opportunity to respond to adverse information before it is used.** A platform without these safeguards inherits defamation risk for itself and every contributor.

3. **Workplace Fairness Act 2025 + TAFEP.** WFA enters full force through 2027 with statutory employee rights against discrimination and unfair grievance handling. A platform marketed as helping employers screen out "lemons" with thin due process will draw TAFEP investigation — and TAFEP scrutiny, even short of penalty, is reputationally fatal in HR services.

### 3.2 The viable structure: credit-bureau-for-conduct

Aver is structured as the labour-conduct analogue of a credit bureau:

- **Credit Bureau Singapore (CBS) and DP Credit Bureau** demonstrate that PDPA-compliant cross-firm conduct data sharing is viable when the architecture is right. Legal framework: Credit Bureau Act 2016 + PDPA evaluative-purpose exception.
- **MAS rolling-bad-apples regime** (mandatory for FIs since Dec 2023) demonstrates the same model applied to misconduct: structured information schema, five-year lookback, 21-day response window, representative right to view.
- **HKMA, UK SMCR, Australian Banking Code** are international variants of the same model.

| Original brief element | Aver equivalent |
|---|---|
| Lemon score (one-way negative) | Reliability score (bidirectional: positive + adverse) |
| Employer uploads only | Bilateral: employers and workers both contribute |
| Score expires over time | Adverse records expire 12–60 months by severity; positive records persist |
| OTP contest 24–72h | Formal right of reply: 14-day notice before publication |
| Pay-to-remove | No pay-to-remove; structured rehabilitation pathway |
| Soft power / MAD | Deterrent effect (same mechanism, defensible framing) |
| Off-shore hosting to evade IMDA | Full SG regulatory alignment; PDPC pre-consultation |

### 3.3 Why bidirectional matters legally

The strongest single defence against PDPA, defamation, and WFA risk is structural symmetry: workers and employers are both data subjects, both contributors, both with rights of reply. This:
- Strengthens the "fair and reasonable purpose" test under PDPA.
- Makes the platform harder to characterise as adversarial to workers in any regulatory review.
- Gives workers a positive reason to engage (claim profile, accumulate endorsements, port reputation), creating consent-based lawful basis.

---

## 4. Product

### 4.1 Core offerings

**Employer / agency side (paying):**
- **Pre-deployment check.** Look up worker by name + last 4 NRIC + DOB. Return: reliability score, summary of adverse records (count, severity, recency, dispute status), summary of positive endorsements.
- **Adverse-record submission.** Structured report with mandatory evidence (timestamped shift records, communications, MC pattern, disciplinary letter). No free-text submissions.
- **Reference-check workflow.** Structured reference request to a worker's prior employer, 21-day response window, stored on platform. Mirrors MAS framework.
- **Watchlist & alerts.** Subscribe to events on specific workers.

**Worker side:**
- **Claimed profile.** Singpass MyInfo verification. Claimed profiles unlock self-service: view all records, request endorsements, dispute, port reputation.
- **Endorsements.** Verified employers issue structured positive endorsements (punctuality, attendance, customer-handling, data-handling, technical competence).
- **Dispute & rehabilitation.** Dispute adverse records with evidence; disputed records flagged until resolved. Structured rehabilitation pathway (WSQ training, new endorsements) accelerates expiry.
- **Counter-records.** Workers can submit adverse records against employers (wage disputes, illegal deployment, retaliatory dismissal) with same evidence standard.

### 4.2 Record schema (fixed; not free-text)

Every adverse record must use a fixed factual schema:

- **Event type** (closed list): no-show, late cancellation (<24h), excessive unsupported MC, data-secrecy breach with finding, insubordination with disciplinary action, theft with police report, contract abandonment, falsification of credentials.
- **Date and shift reference.**
- **Evidence attached** (mandatory): roster screenshot, timestamped comms, MC analysis, disciplinary letter, police report number.
- **Worker notified internally?** (mandatory yes/no with date)
- **Due-inquiry process conducted?** (mandatory yes/no with detail)
- **Submitted to MOM / other regulator?** (mandatory yes/no with reference)

Records lacking required fields are rejected at intake. **The schema is the legal product.**

### 4.3 Scoring engine

Reliability score (0–1000, credit-bureau style) computed from:
- Adverse records weighted by severity, recency, corroboration (multiple employers), dispute status.
- Positive endorsements weighted by issuer credibility and recency.
- Tenure and shift-count base rate (raw experience).
- Training certifications (WSQ, MOM-recognised).

Adverse-record decay schedule:
- No-show / late cancellation: 12 months
- Pattern MC: 18 months
- Data-secrecy breach (finding): 36 months
- Theft (police report): 60 months (mirrors MAS five-year lookback)

Confidence band: profiles with <3 records show "insufficient data" rather than spurious score. Important guard-rail against thin-data defamation.

---

## 5. Market sizing

### 5.1 Singapore TAM

Addressable employer base:
- MOM-licensed employment agencies (post-consolidation): ~3,200
- F&B operators (≥5 staff): ~10,500
- Retail chains (≥3 outlets): ~2,800
- Security agencies: ~250
- Logistics/warehouse operators: ~1,400
- Healthcare manpower providers: ~180
- Events/MICE operators: ~400
- **Total: ~18,700**

Tiered pricing:
- Free (limited lookups)
- Pro (S$49/mo or S$490/yr) — mid-market employer
- Agency (S$199/mo or S$1,990/yr) — 100 lookups + 20 submissions/month
- Enterprise (S$1,500+/mo) — multi-brand, API, white-glove

ARPU-weighted TAM (SG only): ~S$40M ARR ceiling at 15% penetration and S$120 average ARPU. Realistic 5-year SG penetration: 5–8% → S$13–22M ARR.

### 5.2 SEA expansion (Year 2–4)

- **Year 2:** Malaysia. English-language, similar regulatory regime.
- **Year 3:** Philippines. BPO concentration.
- **Year 4:** Vietnam, Indonesia.

Cross-border data flow under each country's privacy law requires careful jurisdictional design (§7.1).

### 5.3 Adjacent revenue surfaces

- **Background-check API** for ATS / HRIS / gig platforms.
- **Insurance and surety bonds** — license behavioural data to fidelity-insurance and surety-bond carriers.
- **Training and rehabilitation** — funnel workers seeking record cleanup to WSQ partners (SSG-funded). Revenue share.

---

## 6. Business model and GTM

### 6.1 Revenue mix

| Stream | Pricing | Year 1 | Year 3 |
|---|---|---|---|
| Employer subscriptions | S$49–S$1,500/mo | 65% | 50% |
| Pay-per-lookup tokens (overage) | S$2/lookup | 15% | 15% |
| Pay-per-submission tokens | S$6/submission | 10% | 5% |
| Background-check API | per-call / rev-share | 5% | 20% |
| Training partner rev-share | 10–20% of course fee | 3% | 5% |
| Insurance data licensing | annual licence | 2% | 5% |

### 6.2 Unit economics (Agency tier)

- ARPU: S$2,400/year
- CAC: S$600 (direct + content + association partnerships)
- Gross margin: 78%
- Payback: 3.8 months
- LTV (35% annual logo churn): ~S$5,800
- LTV:CAC at steady state: ~9.7x; Year 1: ~3x

### 6.3 GTM phasing

**Phase 1 — Anchor (M0–M6).** Founder-led + 1 senior sales hire. Top 50 SG staffing/F&B/security players. Talk track: "MAS already requires this for banks; we make it work for everyone else." Channels: SAEA, SCCC manpower subgroup, security-agency association. 50% off list, 12-month minimum. Goal: 50–80 logos, 200k records.

**Phase 2 — Network (M6–18).** Inbound + inside sales. ATS/HRIS integrations (BIPO, Whyze, Talenox, JustLogin, Info-Tech, Adrenalin). Self-serve Pro. Goal: 300–500 logos, S$1.5M+ ARR.

**Phase 3 — Utility (M18–36).** Enterprise + API. Insurance and gig-platform wholesale. Malaysia, Philippines. Regulatory engagement targeting an industry code of practice with Aver as default infrastructure. Goal: 1,200+ logos, S$5–7M ARR.

### 6.4 Cold-start without Elitez visibility

This is the operational consequence of the de-linking constraint. v1.0 assumed Elitez-anchored data seeding (~80–150k shift-records from across the ten brands). v1.1 cannot use that on-the-record.

Three replacement mechanisms:

1. **Anonymous data contribution programme.** Aver runs a pre-launch "Founding Contributor Programme" — any agency contributing ≥6 months of shift conduct data (anonymised, schema-compliant) before public launch receives 24 months of free Pro access. Up to 15 founding contributors. **Elitez can participate in this programme without any branded visibility**, alongside other agencies. This is a clean structure that doesn't single out any one contributor.

2. **Friendly-agency syndicate (8–12 agencies).** Recruit through existing industry relationships, including but not visibly featuring Elitez. Each agency's commercial terms identical and at arm's length. Aim: 200k+ records under management at launch from 12 contributors, no single contributor exceeding ~25% of total records.

3. **Reference-check transactional bootstrap.** Even with no historical adverse records, the reference-check workflow (Phase 1, MAS-style structured request to a worker's prior employer with 21-day response) is independently valuable and generates records as a by-product of normal hiring activity. This works from day one with zero anchor data.

The trade-off vs. v1.0 is real: cold-start is harder, growth is slower, and the differentiator narrative ("seeded with 100k+ records on day one") is muted. The compensating advantage is total separation from Elitez reputational risk and a cleaner governance posture.

### 6.5 Founder visibility and governance — the operational consequence

If the brand cannot link to Elitez, then **the founder cannot publicly be the CEO of Elitez while leading Aver.** Three credible structures:

**Option A — Silent investor + independent CEO (recommended).**
- Founder takes seat on the board, holds majority economic interest through a personal investment vehicle (e.g., a single-purpose Pte. Ltd. under personal name, not Elitez Group).
- Operating CEO and CTO are independent hires with no Elitez history. Recruit ideally from local HR-tech (BIPO, Whyze, Talenox, JustLogin, FastGig) or compliance consulting (Straits Interactive, Privacy Ninja).
- Public board composition: independent CEO, one independent director with regulatory background (e.g., ex-MOM or ex-MAS), one worker-representative observer.
- Founder's name appears only in confidential cap-table / regulatory filings, never in marketing or press.

**Option B — Founder visible as chair/founder but with operating CEO.**
- Founder publicly identified as founder/chair but not CEO. Operating CEO runs day-to-day and fronts media.
- Risk: anyone Googling founder name immediately surfaces Elitez. The de-linking is partial, not real. **Not recommended** if the constraint is genuine.

**Option C — Founder steps back from Elitez operational role.**
- Founder transitions from CEO to non-executive chair at Elitez. Goes full-time on Aver.
- Removes the conflict-of-interest and operational-distraction concerns.
- Material life-and-career decision; not in scope for this plan. Worth surfacing.

**Recommendation:** Option A. It preserves founder economic interest and strategic control, separates reputational exposure, and allows arm's-length transactions when Elitez is a customer. Operationally, the search for an independent CEO is the long-pole item and should start in parallel with the legal opinions in §7.

### 6.6 Related-party governance

Because the founder owns both Aver and Elitez Group, the platform-customer relationship between them must be documented at arm's length from day one:

- Master Services Agreement at standard customer rates.
- Board-approved related-party transactions policy with annual disclosure.
- Independent director sign-off on any pricing concessions or favourable terms.
- Annual audit attestation that Elitez customer terms are no more favourable than top-decile other customers.
- No data exclusivity for Elitez. Elitez does not receive Aver records earlier, faster, or in greater volume than other Agency-tier subscribers.
- Aver does not market the founder's other interests.

This matters less for tax than for regulator-trust and acquirer/investor due diligence — Aver must be a clean asset, not a captive vendor.

---

## 7. Regulatory and legal strategy

### 7.1 PDPA architecture

**Lawful bases for processing:**
- **Worker consent** for claimed profiles (gold standard; Singpass MyInfo flow at sign-up).
- **Evaluative purpose exception** (PDPA Second Schedule, Part 2) for employment-context lookups by verified employers; lookup logged.
- **Legitimate interests** (post-2020 amendments) for record-keeping by contributing employers, with documented Legitimate Interests Assessment (LIA).

**Mandatory controls:**
- **DPO.** Required by statute; recommend external co-DPO arrangement for first 24 months.
- **Worker notification within 14 days of any adverse record being created, before publication.** Substance of record, contributing employer, dispute process.
- **Right of access, correction, withdrawal.** Workers can withdraw claimed-profile consent; platform retains records under legitimate-interests basis but masks from public lookup if no other basis applies.
- **Retention limits.** Hardcoded record expiry by category (§4.3); purged on expiry.
- **Cross-border transfer.** SG-only at launch. Cross-border to MY/PH via SCCs, assessed under Transfer Limitation Obligation.

### 7.2 Defamation architecture

Ramesh Krishnan requires reasonable care. Structural mitigations:
- No opinions, only facts. Fixed schema. Free-text limited and not shown in primary lookup.
- Evidence requirement at intake. No evidence → no submission.
- Worker notification before publication (14 days). Mirrors due-inquiry doctrine.
- Active dispute mechanism with flagged display.
- Qualified-privilege defence: records visible only to verified employers with documented legitimate hiring interest. Narrow circle of publication.
- Contributor warrants accuracy and indemnifies platform; platform indemnifies only against system-level errors.

Structurally similar to a credit bureau under the Credit Bureau Act 2016.

### 7.3 WFA alignment

- Reject records alleging protected characteristics or constructable as discriminatory ("attitude problem", "doesn't fit culture" — prohibited fields).
- Require evidence of due inquiry for disciplinary records (WFA-aligned requirement).
- Publish annual transparency report (records submitted/disputed/upheld/expired). Self-imposed; signals good faith.

### 7.4 TAFEP and MOM positioning

- Pre-launch briefings with PDPC, MOM, TAFEP.
- Frame: "private-sector infrastructure for the MAS rolling-bad-apples norm, with worker rights built in."
- Offer alignment with the future Workplace Fairness Commission once stood up.
- NTUC and SISEU / FDAWU briefings. Worker-side features (counter-records, rehabilitation, free claimed-profile access) as union value.
- Tripartite framing throughout. No adversarial messaging.

### 7.5 Hard "no" list (do not build, do not market)

- ❌ "Pay to remove records" — PDPA "fair and reasonable" violation.
- ❌ "Mutual assured destruction" / blacklist framing in any document.
- ❌ Back-channel worker-employer negotiation for removal — coercion / Prevention of Harassment Act risk.
- ❌ Off-shore hosting to evade regulator action.
- ❌ "Lemon" framing in customer-facing UX, worker profiles, or marketing.
- ❌ Any "no-rehire" flag that is not backed by structured evidence in the schema.

---

## 8. Risk register

| Category | Risk | Likelihood | Severity | Mitigation |
|---|---|---|---|---|
| Legal | Defamation suit | M | H | Schema, evidence, dispute, qualified privilege, contributor indemnity, S$5M PI insurance |
| Legal | PDPC enforcement | L–M | VH | DPO, audited consent, transparent notification, conservative retention |
| Legal | MOM/TAFEP opposition | M | H | Pre-launch engagement, tripartite framing, worker features, transparency report |
| Legal | WFA non-compliance | L | M | WFA-aligned schema, due-inquiry evidence |
| Legal | Cross-border data breach | M | M | SCCs, residency, country entities |
| Commercial | Cold-start (empty DB) | H at launch | H | Founding contributor programme; transactional bootstrap; reference-check from day one |
| Commercial | SME logo churn | M | M | Annual contracts; ATS embedding |
| Commercial | Price compression vs free gig-platform ratings | M | M | Cross-platform coverage, dispute infra, regulator alignment |
| Commercial | Single-contributor concentration | M | M | Cap any contributor at ~25% of total records |
| Strategic | Reputational spillover to founder's other interests | M | H | Option A governance (§6.5); independent CEO; no public founder linkage |
| Strategic | Worker opposition campaign (TikTok / Reddit) | M | H | Worker features, transparency, worker observer on board |
| Strategic | Government nationalises / heavily regulates | L | M | Engage early; offer to be regulated; CBS-style model |

**Existential events:**
1. High-profile false-record lawsuit with media. Mitigation: insurance, conservative submission gating, rapid PR/legal protocol.
2. PDPC enforcement publicly framing the platform as a privacy violator. Mitigation: architecture in §7.1; ongoing PDPC dialogue.

S$5M+ professional indemnity + cyber liability + media liability insurance from day one. Cost ~S$25–40k/year.

---

## 9. Roadmap

**Phase 0 — Foundation (M0–3)**
- Two parallel legal opinions on the architecture (see separate briefing pack). Budget S$60–100k.
- External DPO engaged. Budget S$24–48k/year.
- Pre-launch briefings: PDPC, MOM, TAFEP, NTUC.
- Incorporate Aver Pte. Ltd. (or equivalent under chosen brand).
- Hire founding engineer, sales lead, part-time DPO advisor. Independent CEO search begins.
- Insurance bound (S$5M PI + cyber + media).

**Phase 1 — MVP (M3–6)**
- Build: Singpass MyInfo identity, employer KYB, schema, dispute workflow, scoring engine.
- Founding Contributor Programme: 8–12 agencies. ~150–200k records seeded.
- Closed beta: 20 customers, 100k records under management.

**Phase 2 — Public launch (M6–12)**
- Self-serve Pro tier.
- ATS integrations (3 by M12).
- First annual transparency report.
- Malaysia legal opinion + entity scoping.
- Goal: 80 logos, S$220k ARR, 250k records.

**Phase 3 — Network (M12–24)**
- Malaysia launch. API GA. First insurance data partnership.
- Goal: 300+ logos, S$1.5M+ ARR.

**Phase 4 — Utility (M24–48)**
- Philippines launch. Industry code of practice. Series A or strategic acquisition optionality.
- Goal: 1,200+ logos, S$5–7M ARR.

---

## 10. Illustrative financials (S$ thousands)

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Paying logos (year-end) | 80 | 320 | 1,200 |
| Average ARPU (S$) | 2,750 | 3,000 | 3,500 |
| Subscription ARR | 220 | 960 | 4,200 |
| Transactional revenue | 35 | 240 | 1,800 |
| Data licensing | 0 | 80 | 600 |
| **Total revenue** | **255** | **1,280** | **6,600** |
| COGS | 75 | 300 | 1,300 |
| **Gross profit** | **180** | **980** | **5,300** |
| GM% | 71% | 77% | 80% |
| S&M | 320 | 580 | 1,800 |
| R&D | 380 | 720 | 1,500 |
| G&A (DPO, legal, insurance) | 220 | 360 | 700 |
| **EBITDA** | **(740)** | **(680)** | **1,300** |
| Cumulative burn | (740) | (1,420) | (120) |

Capital to EBITDA breakeven: ~S$1.5–1.8M, plausibly across two rounds. First round S$400k–600k from founder vehicle + friendly capital. Seed S$1.0–1.4M at M12 once anchor traction proven.

---

## 11. Open decisions for founder

1. **Brand.** Aver primary; Concord / Recta as fallback pending trademark search. Validate within 30 days.
2. **Governance.** Option A (silent investor + independent CEO) recommended. Confirm and begin CEO search in parallel with legal opinions.
3. **Anchor data approach.** Founding Contributor Programme with anonymised participation (including founder's other interests as one of 8–12 contributors, not the singular anchor).
4. **MOM engagement timing.** Brief MOM/TAFEP/PDPC before MVP launch (recommended) vs. after first 6 months of traction.
5. **International data flow.** SG-only at launch, with clearly documented cross-border roadmap.
6. **Founder transparency to lieutenants.** Yvonne, Wayne, Lin Rong Jie need to be in the loop given founder's existing fiduciary obligations to Elitez Group — but the circle should be tight, with NDAs in place before any operational discussion.

---

## 12. Immediate next steps

1. **Week 1–2.** Commission two parallel legal opinions per the separate briefing pack (`aver_legal_briefing_pack.md`). Budget S$60–100k.
2. **Week 1–4.** Founder decision on Option A governance and entity structure. Loop in CFO for cap-table modelling under founder's personal investment vehicle.
3. **Week 3–6.** Confidential pre-briefings with 8–12 prospective Founding Contributor agencies. Without their commitment, cold-start does not break.
4. **Week 4–8.** PDPC informal pre-consultation.
5. **Week 6–8.** Begin independent CEO search via discreet executive-search engagement (recommend a search firm with no current Elitez Group mandate to avoid conflict).
6. **Week 6–12.** If green-lit by §12.1 and §12.4: incorporate, hire founding engineer, begin MVP build.

**Total spend to "go / no-go": ~S$80–130k** (legal opinions + DPO retainer + executive search retainer). Until that decision, no public commitments, no engineering, no marketing.

---

## Appendix A — Why MAS rolling-bad-apples matters

MAS's mandatory reference-check regime (effective for FIs from 2024, following Dec 2023 response paper) establishes that in some labour markets, systemic risk from "rolling bad apples" justifies structured, regulated, inter-institutional misconduct sharing — with bounded retention (5-year lookback), structured schema, and rights of reply.

MAS framework includes:
- Mandatory reference check on hire for in-scope roles.
- 21-day mandatory response window.
- 5-year lookback.
- Defined info categories: employment history, role, reason for cessation, fitness-and-propriety (incl. investigations, breaches), disciplinary actions, misconduct reports filed with MAS, balanced-scorecard grades, persistency ratios.
- Representative's right to view their reference.
- Reasonable-care standard (consistent with *Ramesh Krishnan*).

This is, in substance, the model Aver proposes — extended to non-FI sectors where the cost of bad actors is similarly material but the regulatory architecture has not caught up. **Every public-facing communication, regulator brief, and legal pleading anchors on this analogy.**

## Appendix B — Comparable models

- **CBS Singapore, DP Credit Bureau.** Demonstrate that consumer-conduct sharing is legally and commercially viable when wrapped in the right architecture. PDPA-aligned + Credit Bureau Act 2016.
- **Beeline VMS (US).** Cross-employer "Not Eligible for Rehire" flags. Operates without specific consent; recurring legal controversy in US blacklisting-statute states. **Lesson:** model works at scale; legal architecture varies sharply by jurisdiction.
- **HireRight, Sterling, First Advantage.** Background-check incumbents. Consent-based, FCRA equivalents. Upper bound of screening business is multi-billion-dollar; do not capture the inter-employer-conduct gap.
- **Glassdoor.** One-sided employer reviews. Litigation frequent but mostly survivable. **Lesson:** structural symmetry (the opposite side of which Aver proposes) materially improves defensibility.
- **Internal gig-platform ratings (FastGig, Anytime Work, Staffie, Troopers).** Demonstrate worker-rating demand in SG. Each is a walled garden. **Lesson:** clear demand, clear gap, no neutral cross-platform utility yet.

---

*v1.1 — supersedes v1.0. Companion document: `aver_legal_briefing_pack.md` for parallel legal opinion engagement.*
