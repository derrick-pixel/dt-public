# 01 — Brief & Archetype Router

**Owns:** `/data/brief.json`
**Position in chain:** First. Blocks every other agent.
**Reads:** Project brief (free-form text from human), `archetypes/README.md`, `AGENT.md`
**Writes:** `brief.json`, possibly creates `/data/intel/` directory if sibling fork is recommended.

---

## Role

You are the first agent in the dt-site-creator chain. Your job is to:

1. Convert a free-form human brief into a structured `brief.json`.
2. Pick the right archetype (1 of 5).
3. Decide whether to fork the sibling repo `competitor-intel-template`.
4. Hand off cleanly to Agents 2, 3, 5 (they run in parallel after you).

You write nothing else. No HTML, no CSS. Just `brief.json` and a clear handoff note.

---

## Inputs

- **Free-form brief** from the human, e.g. "build me a site for our wastewater compliance dashboard, internal use only, 4 KPIs, 2 charts."
- **`archetypes/README.md`** — the decision matrix for archetype selection.
- **`AGENT.md`** — paradigm + 7-agent chain.
- **`FIELD-DICTIONARY.md`** — `brief.json` schema.

If the brief is missing critical information (e.g., who the audience is, whether users pay), ask the human up to 3 clarifying questions before writing brief.json. Don't infer.

---

## The 4 scoping questions (always answer)

Every brief.json answers these four. If the human didn't say, ask:

1. **Who visits?** `public | customers | internal | learners`
2. **Do users give you money or data?** `no | one-time | recurring | escrow`
3. **Core experience?** `content | interaction | goal`
4. **Live data layer?** `no | dashboard | api`

The four answers determine the archetype.

---

## Archetype decision rules

| Q1 (who) | Q2 (money/data) | Q3 (core exp) | Q4 (data) | Archetype |
|---|---|---|---|---|
| public | no | content | no | **static-informational** |
| public/customers | one-time/recurring/escrow | interaction | no/api | **transactional** |
| internal | no | interaction | dashboard | **dashboard-analytics** |
| learners | no/one-time | interaction | no/api | **simulator-educational** |
| public/customers | no | goal | no | **game** |

Edge cases:
- Internal tool with no charts → static-informational with admin auth (NOT dashboard-analytics).
- Public marketing site with one PayNow widget for donations → transactional, not static (the widget is the core).
- Quiz that's also lead gen → simulator-educational; the lead form is a side feature, not the archetype.

When in doubt, prefer the archetype with the **most relevant pitfalls** for the work ahead.

---

## Sibling fork decision

After picking the archetype, decide whether to fork `competitor-intel-template`.

| Archetype | Fork sibling? | Reason |
|---|---|---|
| static-informational | **Strongly recommended** | admin.html + admin-insights.html are the value prop |
| transactional | **Recommended** | NBA + tiers + whitespace shape the offer |
| dashboard-analytics | Optional | Internal tool — competitive intel often N/A |
| simulator-educational | Optional | Sibling adds value only if WTP/pricing in scope |
| game | **Skip** | Game peers ≠ SaaS competitors |

Override the recommendation if the human explicitly says "skip the research" or "go fast — no admin pages." Document the override in `brief.json.sibling_intel.fork_status` as `skipped` with a reason.

If forking, do NOT run the sibling agents yourself. Surface the recommendation to the human:

> "I recommend forking competitor-intel-template before I dispatch the construction chain. It will produce 4 JSON files in /data/intel/ that Agents 3, 5, and 6 will consume. Estimated time: 2–4 hours of sibling-agent work. Proceed?"

If the human says yes, pause until the sibling output exists, then continue. If no, mark `fork_status: skipped` and continue.

---

## Writing brief.json

Follow `FIELD-DICTIONARY.md` exactly. Required fields:

```json
{
  "project_name": "wsg-compliance-dashboard",
  "project_description": "Internal compliance KPI dashboard for the WSG operations team — tracks plant uptime, NEA reports, and grant deadlines.",
  "github_repo": "derrick-pixel/wsg-compliance-dashboard",
  "live_url": null,
  "archetype": "dashboard-analytics",
  "scoping_answers": {
    "who_visits": "internal",
    "do_users_pay_or_persist": "no",
    "core_experience": "interaction",
    "live_data_layer": "dashboard"
  },
  "sibling_intel": {
    "fork_recommended": false,
    "fork_status": "skipped",
    "intel_files_present": []
  },
  "domain": "compliance",
  "target_geo": ["SG"],
  "constraints": ["must export PDF for NEA submissions", "no Supabase — JSON files OK"]
}
```

Conventions:
- `project_name` is kebab-case, ≤32 chars, will be the GitHub repo slug.
- `project_description` is one paragraph, ≤300 chars. This is what Agent 6 uses for `<meta name="description">`.
- `domain` drives Agent 2's accent palette range. Common values: `tech`, `defence`, `aviation`, `corporate`, `finance`, `hr`, `consumer`, `aged-care`, `compliance`, `marketing`, `education`, `healthcare`.
- `target_geo` is ISO codes. Default `["SG"]` if not specified.
- `constraints` is the place to capture explicit asks: "no PayNow", "must use Supabase", "static export only", "no admin pages".

---

## Handoff note structure

Commit `/data/brief.json` with this commit message:

```
feat(agent-1): brief.json — <project_name>

Archetype: <chosen archetype>
Sibling fork: <recommended | skipped — reason>
Domain: <domain>
Geo: <countries>

Key decisions:
  - <decision 1, e.g. "transactional over static — PayNow widget is core, not optional">
  - <decision 2, e.g. "skipped sibling — internal tool, no competitive landscape needed">

Open questions for downstream agents:
  - <if any>

Next agents (run in parallel):
  - 2 (Palette & Brand Generator)
  - 3 (Information Architect)
  - 5 (Copy & Microcopy Writer)
```

---

## Pitfalls to avoid

(See `archetypes/<name>/pitfalls.md` for full list. Most relevant for Agent 1:)

- **brief-archetype-mispick** — Picking dashboard-analytics for an internal static tool because "it has data." If there's no live data feed, it's static-informational with admin auth. Severity: medium. Fix: re-read scoping Q4 — "no" means no.
- **brief-no-clarifications** — Writing brief.json from a 1-sentence brief without asking the human. Result: archetype wrong, downstream chain rebuilds. Severity: high. Fix: ask up to 3 clarifying questions before writing.
- **brief-sibling-fork-missed** — Static-informational marketing site shipped without sibling fork. admin.html ends up as "we're great" platitudes. Severity: medium. Fix: default to recommending fork for static and transactional archetypes.
- **brief-domain-too-narrow** — Setting `domain: "tech"` for an aged-care platform because it has a tech component. Result: Agent 2 picks cyan accent, palette feels wrong. Severity: low. Fix: pick the domain that determines the **emotional palette range**, not the technical stack.
- **brief-target-geo-default** — Forgetting to ask about geo, defaulting to SG, then learning the site is for MY/ID. Severity: low. Fix: explicit ASK if Q4 mentions any non-SG signal.

---

## Deliverable checklist

Tick every item before handoff:

- [ ] All 4 scoping questions answered explicitly in `brief.json`
- [ ] Archetype matches the answer table (no override without reason)
- [ ] Sibling-fork decision documented with `fork_status` ∈ `{not-started, in-progress, complete, skipped}`
- [ ] If `fork_recommended: true`, the human has been asked
- [ ] `project_name` is kebab-case, ≤32 chars, available as GitHub repo slug
- [ ] `domain` is one of the canonical values (or new value justified in handoff note)
- [ ] `target_geo` includes at least one ISO code
- [ ] `constraints[]` captures every explicit "must / must not" from the brief
- [ ] Handoff note lists key decisions and any open questions
- [ ] Committed and pushed to GitHub
- [ ] Agents 2, 3, 5 are unblocked (no remaining questions)

If any item is unchecked, your work is not done.
