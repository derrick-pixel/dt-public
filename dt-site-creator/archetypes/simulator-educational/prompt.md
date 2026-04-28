# Simulator-Educational — Starter Prompt (3-phase script)

Copy and paste into Claude Code. Boots the v2 7-agent orchestrated chain.

---

You are dt-site-creator (v2, 7-agent orchestrator) building a **simulator-educational** site.

**Project:** {{project_description}}

**Scoping context:** {{scoping_answers}}

**Required mechanics:** {{ticked_mechanics}}

**⚠️ Avoid these archetype-specific pitfalls:**
{{pitfalls_warnings}}

---

## Phase 1 — optional sibling fork (default skip)

For simulator-educational, **optional and usually skipped**. Fork only if:
- The simulator monetises (premium tiers, paid templates)
- Pricing / WTP is in scope (e.g., market_tracker premium, ELIX-resume templates)

If forking: read `prompts/consume-sibling-intel.md`.

---

## Phase 2 — 7-agent construction chain (with simulator adaptations)

```
Step 0:  gh repo create derrick-pixel/<slug>; first push.

Step 1:  Agent 1 (Brief Router) — confirms simulator-educational archetype +
         tech-stack choice (vanilla / Streamlit) in brief.constraints.

Step 2a: Agents 2 + 3 + 5 in parallel.
Step 2b: Before Agent 4, write scenarios.md — every interaction with inputs,
         state transitions, outputs, and Reset path. NON-NEGOTIABLE.

Step 3:  Human picks palette.

Step 4:  Agent 4 (Stitch / UI Composer) wires:
         - localstorage-state (versioned save schema; refresh = no data loss)
         - wizard-form (multi-step input gathering)
         - pdf-pipeline (if report-generation in scope; test 2+ pages)
         - chartjs-dashboard (if data-driven simulator)
         - Reset button visible on EVERY scenario page
         - API rate limiter (if external API used: yfinance / OpenAI / Gemini)
         - Peer-level voice in copy.json (NOT "Great job!" — adult learners bounce)

Step 5:  Agent 6 — OG, favicon, sitemap, robots. Standard.

Step 6:  Agent 7 (QA Curator) — opt-in. Simulator-specific tests:
         - Refresh test: state preserved?
         - Reset test: clears state without losing user account?
         - Rate-limit test: 100x rapid API calls — limiter kicks in?
         - PDF test: 3-page export renders correctly?
         - Mobile test: Likert scales tap-able, editor preview legible?
```

---

## Phase 3 — commit and push

Every iteration: commit + push. State schema versioned — bump version on schema change, write migration in `js/migrations.js`.

---

**Style authority:** `archetypes/simulator-educational/CLAUDE.md` (inherits static-informational/CLAUDE.md)
**Agent dispatch + scenarios.md template:** `archetypes/simulator-educational/agents.md`
**JSON schemas + state versioning:** `archetypes/simulator-educational/data-contract.md`
**Sibling handoff playbook (if forking):** `prompts/consume-sibling-intel.md`
**Master orchestrator:** `masterprompt.txt` + `AGENT.md`
