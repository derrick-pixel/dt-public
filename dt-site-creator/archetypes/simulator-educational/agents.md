# Simulator-Educational — Agent Dispatch

**Sibling fork recommendation:** **Optional.** Default skip. Fork only if the simulator monetises (WTP / pricing in scope, e.g., market_tracker's premium tiers, ELIX-resume's templates).

---

## Dispatch order

```
[1] Sibling fork — OPTIONAL
        ↓ if forked AND pricing in scope: /data/intel/*.json
[2] Agent 1 (Brief & Archetype Router)
        ↓
[3] Agents 2 + 3 + 5 in parallel
        ↓
[4] Human picks palette
        ↓
[5] Agent 4 (Stitch / UI Composer)
        ↓
[6] Agent 6 (SEO / OG / Asset Engineer)
        ↓
[7] Agent 7 (QA & Pitfall Curator) — opt-in
```

Additional non-agent step before Agent 4: write `scenarios.md` documenting every interaction (inputs, state transitions, outputs) and the Reset path for each. Non-negotiable for this archetype.

---

## Tech-stack deviation

Vanilla HTML/CSS/JS by default. Streamlit allowed as a secondary track for Python-heavy compute (CAPM, DCF, ML). If Streamlit, document in `design-system.json.tech_stack: "streamlit"`.

ELIX-resume showed that vanilla can deliver WYSIWYG editors, real-time preview, photo upload, PDF download, localStorage drafts — there's rarely a need to escape vanilla.

---

## Required pages

| Page | Owner | Notes |
|---|---|---|
| `index.html` | Agents 3 + 4 + 5 | Intro + try-it CTA |
| `simulator.html` OR `quiz.html` OR `editor.html` | Agents 3 + 4 + 5 | The tool itself — most state lives here |
| `results.html` | Agents 3 + 4 + 5 | Optional — can merge into simulator with state-machine views |
| `admin.html` + `admin-insights.html` | Agents 3 + 4 (consumes intel) | Optional — only if WTP / pricing in scope |
| `colors.html` | Agent 2 | Transient |

---

## Mechanics required

| Mechanic | Always? | Notes |
|---|---|---|
| `og-social-meta` | yes | Mandatory |
| `og-thumbnail` | yes | Mandatory |
| `favicon` | yes | Mandatory |
| `localstorage-state` | yes | Quiz progress / editor drafts / scenario state survive tab close |
| `wizard-form` | yes (most) | Multi-step input gathering |
| `palette-tryout` | yes | colors.html |
| `meta-tags-generator` | yes | Per-page meta from sitemap |

## Mechanics optional

| Mechanic | When |
|---|---|
| `pdf-pipeline` | Report-generation simulators (resume builders, scenario reports) |
| `chartjs-dashboard` | Data-driven simulators (market analysis, financial models) |
| `admin-auth-gate` | Instructor / admin dashboards |
| `formspree-form` | Email results / lead capture |
| `intel-consumer` | If sibling intel forked |
| `persona-cards` | If pricing in scope |
| `multi-page-scaffold` | Multi-tool platforms (multiple simulators on one site) |

---

## Critical conventions

### State persistence (mandatory)
Quiz progress, editor drafts, scenario state — all persist after every meaningful change. Refresh = no data loss. Pitfall `sim-progress-lost` happens when state is in memory only.

### Reset buttons (mandatory)
Every scenario / calculator has a visible "Reset" button. Clears state but not progress.

### API rate-limiter (mandatory if external API)
yfinance, OpenAI, Gemini — all have rate limits. Add a guest rate-limiter (max N calls / session, cache aggressively, clear messaging when limit hit). Pitfall `sim-api-no-limiter` got an entire site IP-banned for 2 hours.

### PDF testing (mandatory if pdf-pipeline used)
Test 2+ pages explicitly. Page breaks, page footers. Pitfall `sim-pdf-multipage`: jsPDF page 2 overlapped page 1 because only single-page was tested.

### Voice (mandatory)
Peer-level for adult learners. NOT teacher-to-student. NOT "Great job!" Adult learners bounce on patronising tone. Pitfall `sim-patronizing-tone`.

---

## Per-page hydration plan (when sibling intel present and pricing in scope)

### admin-insights.html
- Personas grid from `pricing-strategy.json.personas[]`
- Tier comparison from `pricing-strategy.json.recommended_tiers[]`
- WTP heuristics from `pricing-strategy.json.elasticity_heuristics[]`

### simulator.html (rare)
- "Inspired by [Top-3 competitor]" footer using `competitors.json.top_5[]`
- "Why ours is different" callout using `whitespace-framework.json.attack_plans[0].why_we_win`

---

## Skip rules

If `brief.constraints[]` includes:
- `no-pricing` → skip admin pages; sibling fork unnecessary
- `streamlit-only` → skip Stitch + vanilla mechanics; use Streamlit native components; still ship og-thumbnail + favicon for social
- `single-page-tool` → merge intro + simulator + results into index.html with state-machine views
