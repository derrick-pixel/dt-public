# Simulator-Educational — Data Contract

JSON files this archetype produces and consumes, plus the simulator-specific state schema.

---

## Produces (standard 7 + scenarios.md + state)

Standard 7 from FIELD-DICTIONARY.md.

### Plus: `scenarios.md` (project-level documentation)

Written before Agent 4 builds. Documents every interaction:

```markdown
## Scenario: "Build a CV"
- Inputs: name, role, summary, work history (1-N entries), education (1-N entries), skills (CSV)
- State transitions: empty → drafting → preview-ready → exporting → exported
- Outputs: WYSIWYG preview pane (real-time), PDF download
- Reset path: "Clear CV" button → confirms → resets state to empty, keeps user account if logged in

## Scenario: "Run a CAPM analysis"
- Inputs: ticker, beta, risk-free rate, market premium
- State transitions: idle → fetching → computed → cached
- Outputs: expected return, breakdown chart, downloadable PDF
- Reset path: "New analysis" button → clears inputs, keeps history of past analyses
- API rate limit: max 50 yfinance calls per session
```

### Plus: simulator state (localStorage)

Versioned schema:

```json
{
  "version": 1,
  "scenario": "build-a-cv",
  "inputs": { /* shape per scenario */ },
  "outputs": { /* computed */ },
  "started_at": "2026-04-28T08:00:00Z",
  "updated_at": "2026-04-28T08:30:00Z",
  "completed": false
}
```

Multiple scenarios can be active at once; key by scenario id.

### Plus (if pdf-pipeline used): PDF metadata

```json
{
  "page_count": 3,
  "rendered_at": "2026-04-28T08:30:00Z",
  "source_scenario": "build-a-cv",
  "filename": "cv-{user-id}-{date}.pdf"
}
```

---

## Consumes (when sibling intel forked AND pricing in scope)

| File | Used by | Purpose |
|---|---|---|
| `pricing-strategy.json` | Agent 3 (admin-insights), Agent 5 (paywall copy) | Tiers + personas if monetising |
| `competitors.json` | Agent 5 ("inspired by" footer), Agent 6 (SEO white-space) | Optional |
| `market-intelligence.json` | rare | Only if simulator surfaces market context (market_tracker) |
| `whitespace-framework.json` | rare | If positioning vs. alternatives is a key narrative |

---

## Minimum viable shapes

### simulator state minimum
- Versioned (`version: 1`)
- `scenario` id
- `inputs`, `outputs` (shape per scenario, documented in scenarios.md)
- `updated_at` ISO timestamp

### `scenarios.md` minimum
- One section per scenario in the simulator
- Each section: Inputs, State transitions, Outputs, Reset path
- API rate limits if external APIs used

### `qa-report.json` (additions over baseline)
- `state_persistence_audit:` does refresh preserve quiz progress / draft state? (Agent 7 must test)
- `reset_button_audit:` is "Reset" visible on every scenario page?
- `api_rate_limit_audit:` is the rate limiter active and tested?
- `pdf_multipage_audit:` if pdf-pipeline used, does page 2 render correctly?

---

## Streamlit alternative

If `design-system.json.tech_stack: "streamlit"`:
- State held in `st.session_state` (in-memory) and `streamlit_javascript` for localStorage bridge.
- Versioning via key prefixes: `v1_inputs`, `v2_inputs` after schema change.
- PDF via `streamlit-pdf-export` or `weasyprint` server-side.
- Rate limiter: a custom `RateLimiter` decorator on yfinance / OpenAI calls.
- OG image: served from `static/` directory; Streamlit can't inject `<head>` tags directly without `streamlit-extras` or a reverse proxy.

Document the Streamlit-specific notes in `design-system.json.notes`.

---

## Test contract

Agent 7 (QA Curator) verifies for simulator-educational:

1. **Refresh test:** Start a quiz / draft. Refresh. Resume. State preserved? ✅
2. **Reset test:** Click Reset. Confirms? Clears state? Doesn't lose user account? ✅
3. **Rate-limit test:** Call API 100x in rapid succession. Limiter kicks in? Clear UI message? ✅
4. **PDF test:** If PDF in scope, generate a 3-page export. Page breaks correct? Footers correct? ✅
5. **Mobile test:** Quiz on iPhone 13 width — Likert scales tap-able? Editor preview legible?

Each adds an entry to `qa-report.json` with pass/fail.
