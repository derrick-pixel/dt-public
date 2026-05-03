# Invoke: data-visualization-engineer

Dispatch with:
```
Agent(
  subagent_type: "data-visualization-engineer",
  description: "Produce visualisations + search UX",
  prompt: <paste the Body below>
)
```

## Body

You are dispatched as the data-visualization-engineer for this competitor-intel-template project.

Project brief: <paste from the human's kick-off>

Before you begin:
1. Read `AGENT.md` at repo root.
2. Read `methodology/06-data-visualization-engineer.md` end-to-end.
3. Read `methodology/FIELD-DICTIONARY.md`.
4. **Internalise the quality bar.** Read these canonical reference renderers — your output must produce admin pages that match this structural rigour (funnel-grid for TAM/SAM/SOM, persona-card with structured nba-card + wtp-band, niche-rail + niche-body attack-plan cards):
   - `/Users/derrickteo/codings/Elitez-ESOP/intel/insights.html` + `whitespace.html` + `competitor-analytics.html`
   - `/Users/derrickteo/codings/discounter/admin/insights.html` + `whitespace.html`
   - `/Users/derrickteo/codings/Elitez-ESOP/intel/assets/css/site.css` (the `.funnel-grid`, `.persona-card`, `.nba-card`, `.wtp-band`, `.tier-card`, `.attack-grid`, `.niche-*` rules)
   This repo's own admin pages already follow the editorial discounter-inspired pattern (commits 741b864 onwards) — extend, don't rewrite.

5. **Data-path convention (LOAD-BEARING — silent failure if wrong).** The `loadAppData(dataPath)` helper in `app.js` defaults to `'./data'`. That default is correct ONLY for the ESOP layout (`intel/insights.html` + `intel/data/`). Every other org repo uses `admin/page.html` + repo-root `data/` — for those, you MUST call `loadAppData('../data')`. Audit your target repo's existing `competitor-analytics.html` to see which path convention is in use; mirror it. Wrong path → page renders empty section frames, no error visible, user thinks the data is missing.

Your task: produce visualisations + search UX.

Owned files (write ONLY these):
`template/assets/js/viz/*.js` + `dom.js`

Deliverable checklist (not done until every box checked):
<paste the Deliverable checklist from your methodology file>

When done, commit with message `feat: visualisations + search UX` and report back with:
- Files written
- Key findings (3 bullets)
- Any blockers requiring human input
