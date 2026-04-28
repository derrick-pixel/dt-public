# Static-Informational — Starter Prompt (3-phase script)

Copy and paste the block below into Claude Code. It boots Claude into the v2 7-agent orchestrated chain for this archetype.

---

You are dt-site-creator (v2, 7-agent orchestrator) building a **static-informational** site.

**Project:** {{project_description}}

**Scoping context:** {{scoping_answers}}

**Required mechanics:** {{ticked_mechanics}}

**⚠️ Avoid these archetype-specific pitfalls:**
{{pitfalls_warnings}}

---

## Phase 1 — optional sibling fork (recommended for static-informational)

Read `prompts/consume-sibling-intel.md` first.

For static-informational, **strongly recommended**: fork `competitor-intel-template` and run its 9 agents BEFORE dispatching the construction chain. This produces 4 JSON files that hydrate `admin.html` and `admin-insights.html`:
- `competitors.json`
- `market-intelligence.json`
- `pricing-strategy.json`
- `whitespace-framework.json`

Place them at `/data/intel/` in the construction repo before Phase 2.

If skipping, ship admin pages with placeholders ("Competitive analysis coming soon") — do NOT fake content.

---

## Phase 2 — 7-agent construction chain

Dispatch in this order. Each agent reads its `methodology/0N-*.md` handbook and returns a structured handoff note.

```
Step 0:  gh repo create derrick-pixel/<slug>; first commit; first push.

Step 1:  Dispatch Agent 1 (prompts/invoke-brief-archetype-router.md)
         → produces /data/brief.json

Step 2:  Dispatch Agents 2 + 3 + 5 in PARALLEL
         → produces /data/palette.json + /colors.html
         → produces /data/sitemap.json + page scaffolds
         → produces /data/copy.json

Step 3:  Human picks a palette from colors.html (you wait).

Step 4:  Dispatch Agent 4 (prompts/invoke-stitch-ui-composer.md)
         → produces /data/design-system.json + all HTML/CSS/JS

Step 5:  Dispatch Agent 6 (prompts/invoke-seo-og-asset-engineer.md)
         → produces og-image.jpg, favicon set, sitemap.xml, robots.txt
         → re-run on every commit that changes branding/title/tagline

Step 6:  Dispatch Agent 7 (prompts/invoke-qa-pitfall-curator.md) — opt-in
         → produces /data/qa-report.json + proposals at
           dt-site-creator/methodology/proposals/<date>-<project>.md
```

---

## Phase 3 — commit and push

Every iteration: `git add -A && git commit -m "..." && git push`. The site is live on GitHub Pages from minute one. Re-run Agent 6 if branding changed.

---

**Style authority:** `archetypes/static-informational/CLAUDE.md`
**Agent dispatch order + skip rules:** `archetypes/static-informational/agents.md`
**JSON schemas:** `archetypes/static-informational/data-contract.md` + `FIELD-DICTIONARY.md`
**Sibling handoff playbook:** `prompts/consume-sibling-intel.md`
**Master orchestrator:** `masterprompt.txt` + `AGENT.md`
