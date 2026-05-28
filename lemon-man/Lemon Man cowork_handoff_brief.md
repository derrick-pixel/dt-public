# Handoff brief — moving Project [Brand TBD] to Claude Cowork

**Purpose:** Set up a persistent Cowork project for ongoing work on the workforce-reliability-network venture currently in concept stage. Replaces the chat-based workflow which loses context between sessions.

**Prerequisites:**
- Paid Claude plan (Max recommended; minimum Pro)
- Claude Desktop app, latest version, Mac (Apple Silicon) or Windows
- Cowork enabled (Settings → Features → Computer Use / Cowork)

---

## 1. Project folder structure

Create this folder structure on your local machine before opening Cowork. Recommended path: `~/projects/lemonscore/` (or whatever brand name you commit to).

```
lemonscore/
├── 00_meta/
│   ├── custom_instructions.md       (paste content from §2 below)
│   ├── memory_seed.md                (paste content from §3 below)
│   └── glossary.md                   (terms-of-art reference)
├── 01_strategy/
│   ├── business_plan_v1.1.md         (drop the v1.1 plan here)
│   └── decision_log.md               (track key decisions as they're made)
├── 02_legal/
│   ├── legal_briefing_pack.md        (drop the briefing pack here)
│   ├── nda_template.md               (draft NDA for the two law firms)
│   ├── firm_engagement_letters/      (one folder per firm engaged)
│   ├── opinions_received/            (drop each firm's opinion here)
│   └── reconciliation.md             (your synthesis of the two opinions)
├── 03_governance/
│   ├── proxy_owner_structure.md      (the nominee/trust structure spec)
│   ├── related_party_policy.md       (Elitez-as-customer policy)
│   └── ceo_search_brief.md           (independent CEO recruitment brief)
├── 04_regulator_engagement/
│   ├── pdpc_briefing.md
│   ├── mom_briefing.md
│   ├── tafep_briefing.md
│   └── ntuc_briefing.md
├── 05_product/
│   ├── record_schema_spec.md         (the structured-record schema)
│   ├── scoring_engine_spec.md
│   ├── dispute_workflow_spec.md
│   └── mvp_scope.md
├── 06_gtm/
│   ├── founding_contributor_targets.md
│   ├── pricing_tier_spec.md
│   └── sales_playbook.md
├── 07_financials/
│   ├── unit_economics.xlsx           (once built)
│   └── cap_table_model.xlsx
└── 99_research/
    ├── competitor_notes/
    ├── regulator_announcements/
    └── case_law/
```

Don't pre-create all subfolders — let Cowork build them on first task. Just create the top-level `lemonscore/` folder and drop the two existing markdown files into `01_strategy/` and `02_legal/`.

---

## 2. Custom instructions for the Cowork project

Paste this verbatim into the Cowork project's custom instructions field (or save it as `00_meta/custom_instructions.md` and reference it on every session start).

---

```
This is a persistent project workspace for a concept-stage venture in Singapore: a workforce-reliability-network platform that operates as a credit-bureau-analogue for shift, contract, and freelance labour. Provisional brand: [TBD — current options: LemonScore / Lemons / Lemonet]. Public-facing brand must remain separate from any HR-services business in which the founder has executive interest.

SOURCE OF TRUTH:
The two foundational documents are 01_strategy/business_plan_v1.1.md and 02_legal/legal_briefing_pack.md. Read both at the start of any non-trivial task. If a proposed action conflicts with either document, raise the conflict before acting. If a decision genuinely supersedes a v1.1 position, update the document and log the change in 01_strategy/decision_log.md.

STRATEGIC ANCHOR:
The platform is positioned as the non-financial-sector extension of MAS's "rolling bad apples" reference-check regime (effective for FIs from 2024). Every regulator brief, legal pleading, marketing message, and design decision should anchor on this analogy. If a proposed approach cannot be defended against the MAS framework, treat that as a red flag and surface it.

HARD CONSTRAINTS (from v1.1, §7.5):
- No pay-to-remove records.
- No "blacklist" or "mutual assured destruction" framing in any document, internal or external.
- No back-channel worker-employer negotiation for record removal.
- No off-shore hosting to evade regulators.
- No free-text "attitude" or "culture fit" fields visible in lookup output.
- No identifiable worker data sold to third parties outside the regulated lookup function.
- No public association between this project and any HR-services business the founder leads.

OPERATING POSTURE:
- Singapore law as the primary framework. Workplace Fairness Act, PDPA, Defamation Act, Employment Act, MAS Notice on Reference Checks, Ramesh Krishnan precedent are the core authorities.
- Worker rights are non-negotiable. Notification before publication, right of reply, right of access, structured rehabilitation pathway.
- Bidirectional records architecture (workers can submit counter-records against employers).
- Conservative defaults on data retention, evidence requirements, dispute windows.

OUTPUT EXPECTATIONS:
- Direct, professional tone. No hedging language for the sake of softness.
- For any new substantive document, save as markdown in the appropriate subfolder.
- For decisions: log in 01_strategy/decision_log.md with date, options considered, decision, rationale.
- For ongoing research: log in 99_research/ with date and source.
- Push back on bad ideas. Specifically flag legal, regulatory, or governance risks the founder may have missed.

THINGS THIS PROJECT IS NOT:
- Not a Claude Code project (no software engineering happening yet).
- Not a customer-facing artefact builder (no website copy, no marketing collateral until brand and legal are settled).
- Not a research project on AI capabilities or unrelated topics. Stay on the venture.

FOUNDER CONTEXT:
The founder is a Singapore-based HR-services executive and Chicago Booth EMBA. Treat as a sophisticated decision-maker. Surface trade-offs, not just answers. Be skeptical of the founder's own ideas where appropriate; do not be agreeable for the sake of agreement.

CONFIDENTIALITY:
All files in this folder are confidential. Do not share content with web search tools or external services unless explicitly instructed. Specifically: never search the web for any combination of founder's name + this project's content.
```

---

## 3. Memory seed

Paste this into the project's first conversation so Cowork's project-scoped memory has the key facts. The custom instructions above set context; this seeds specific decisions already made.

---

```
KEY DECISIONS ALREADY MADE (do not re-debate without new information):

1. The pure "blacklist" framing has been rejected. The architecture is a bidirectional workforce-reliability network, modelled on MAS's rolling-bad-apples regime and SG consumer credit bureaus.

2. The platform must be brand-separated from the founder's HR-services business. Proxy owner / nominee-shareholder structure to be used. Founder is silent investor, not visible founder.

3. The HR-services business will participate as a paying customer at standard Agency-tier or Enterprise pricing — not as anchor sponsor, not as founding contributor, not in marketing collateral. Arm's-length related-party transaction.

4. Independent CEO and CTO will be hired. Founder does not run day-to-day.

5. Two parallel legal opinions are being commissioned (engagement budget S$60–100k). The legal briefing pack in 02_legal/ is the document being issued to both firms.

6. SG-only data residency at launch. MY/PH expansion in Years 2–3 with separate jurisdictional opinions to follow.

7. Hard "no" list — see custom instructions.

8. Founding Contributor Programme replaced by standard paying-customer relationships for anchor agencies. No special data deals.

PENDING DECISIONS (open):

A. Final brand name (current options: LemonScore / Lemons / Lemonet — Lemon-Man rejected due to Cass Beer collision and structural framing concerns).

B. Trademark search and class registration once brand committed.

C. Specific legal firm pairings for the parallel opinions.

D. Independent CEO recruitment strategy (search firm vs. founder network).

E. Timing of PDPC informal pre-consultation (recommend before MVP build).

F. Whether and when to brief the founder's senior lieutenants at the HR-services business (NDA required first).
```

---

## 4. First tasks to run in Cowork

Try these in order. Each one tests a different Cowork capability and produces real value.

### Task 1: confirm-and-summarise
> "Read 01_strategy/business_plan_v1.1.md and 02_legal/legal_briefing_pack.md. Confirm understanding by producing a one-page executive summary saved as 00_meta/founder_handoff_summary.md. Flag anything that is internally inconsistent between the two documents."

This is a no-risk task that loads context and confirms file access.

### Task 2: glossary
> "Build a glossary of terms-of-art used in this project: PDPA Second Schedule exceptions, MAS rolling-bad-apples, Ramesh Krishnan, WFA, qualified privilege, evaluative purpose, LIA, KYB, etc. Save as 00_meta/glossary.md. Use plain English."

### Task 3: NDA draft
> "Draft a Singapore-law NDA suitable for issuing to a law firm before sharing the legal briefing pack. The NDA should bind the firm to confidentiality of the founder's identity, the working brand name, and the existence of a parallel engagement. Save as 02_legal/nda_template.md. Include a one-paragraph explanation of why each major clause is included."

### Task 4: scheduled regulator-watch
> "Create a scheduled task to run every Monday at 9am Singapore time: search anthropic.com, pdpc.gov.sg, mom.gov.sg, tafep.gov.sg, and mas.gov.sg for any new announcements, consultation papers, or guidance issued in the previous 7 days that could affect the workforce-reliability-network venture. Save findings to 99_research/regulator_announcements/[YYYY-MM-DD]_weekly_scan.md."

### Task 5: decision log initialisation
> "Initialise 01_strategy/decision_log.md with the 8 decisions already made (from memory seed §3) and the 6 pending decisions. Use the format: Decision number, Date, Options considered, Decision taken, Rationale, Source (which document the decision is recorded in)."

---

## 5. Workflow recommendations

### Session opening
At the start of every Cowork session for this project, the first instruction should be: *"Read 00_meta/custom_instructions.md and 01_strategy/decision_log.md before doing anything else."*

This is a belt-and-braces check that the project memory has loaded the right context. If you've added new decisions in the previous session, this ensures Claude works from the current state.

### Major edits to v1.1 documents
Treat `business_plan_v1.1.md` and `legal_briefing_pack.md` as canonical. Any substantive change creates a new version:
- v1.1 → v1.2 (minor edit, same direction)
- v1.x → v2.0 (major architectural change)

Don't overwrite. Keep the version history.

### Iteration with legal opinions
Once the two legal opinions come back:
1. Drop each into `02_legal/opinions_received/firm_A_opinion.pdf` and `firm_B_opinion.pdf`.
2. Ask Cowork to read both and produce a structured reconciliation in `02_legal/reconciliation.md`: where do the two firms agree, where do they disagree, what's the residual risk after recommended modifications.
3. Update `business_plan_v1.1` → `business_plan_v2.0` to incorporate the recommended modifications.
4. Log each change in the decision log.

### What Cowork is good at for this project
- Long, structured writing (e.g., updating the business plan after legal opinions).
- Cross-document consistency checks (e.g., "do any of my regulator briefings contradict what's in the legal pack?").
- Scheduled monitoring (regulator-watch, MAS/MOM consultation tracking).
- Research synthesis (e.g., "read these three MAS papers and tell me how the framework evolved between 2021 and 2024").
- Document templating (engagement letters, NDAs, board memos).

### What Cowork is not good at for this project (yet)
- Anything requiring direct calls to a regulator or law firm (still a human task).
- Anything requiring genuine industry-relationship judgement (e.g., which agency CEOs to brief first — this is your domain).
- Anything where confidentiality risk is asymmetric (e.g., do not let Cowork research the founder's name + this project together).

### Data hygiene
- Cowork files stay on your local Mac/Windows machine. Don't put them in a shared Google Drive or Dropbox until brand and legal are committed.
- Back up the project folder weekly. Time Machine to UGREEN NAS is fine (this matches your existing backup workflow).
- Don't bring the project folder onto any device managed by the HR-services IT team. Personal device only.

---

## 6. Bridging from chat to Cowork: what carries over, what doesn't

| What carries | How |
|---|---|
| The two markdown documents (plan + legal pack) | Drop into project folder; Cowork reads natively |
| Decisions made in this chat | Captured in memory seed §3 above and decision log §4 task 5 |
| Custom instructions / project context | Pasted into Cowork project custom instructions field |
| Ongoing memory of project facts | Cowork Projects have project-scoped memory; will accumulate within the project |

| What does NOT carry | Workaround |
|---|---|
| This chat's conversation history | Not needed — the documents and decision log capture the substance |
| Web search results from this chat | Cowork has web search; re-run if needed |
| Any tools or artefacts from this chat | Documents already exported; nothing else needed |

---

## 7. When to come back to chat (vs. Cowork)

Stay in Cowork for the operational work on this project — that's what it's for.

Use this chat or new chats for:
- Quick one-off questions unrelated to the project.
- Sensitive questions you don't want logged into a project workspace.
- Initial brainstorm of unrelated ventures.
- When you want a clean second-opinion read on a Cowork-produced document (paste it in, ask without the project's accumulated context).

---

## 8. Pricing note

- **Pro plan:** S$26/month. Cowork available. Reasonable for light use.
- **Max plan:** US$100–200/month. Cowork with higher rate limits. Recommended for this project given iteration intensity, scheduled tasks, and document length.
- Tax-deductibility: if billed to the new entity once incorporated, it's a standard SaaS subscription expense. While pre-incorporation, expense it personally and reimburse on incorporation.

---

*End of handoff brief. v1.0, May 2026.*
