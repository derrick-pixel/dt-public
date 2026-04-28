# dt-site-creator — Methods Changelog

Append-only. Every methodology change gets a dated entry. Agent 7 (Pitfall Curator) writes proposals; humans approve and merge here.

---

## v2.0.0 — 2026-04-28 — Paradigm shift to 7-agent orchestration

**Why:** competitor-intel-template (sibling repo) introduced 9-agent specialist architecture with handoff contracts, methodology-as-code, and curator loop. Old monolithic `masterprompt.txt` (v1.0, 2026-04-09) couldn't scale to that level of rigour. Adopt the same paradigm here, scoped to construction.

**Added:**
- `AGENT.md` — paradigm doc, 7-agent dispatch graph, sibling-handoff explanation
- `FIELD-DICTIONARY.md` — canonical JSON schemas for all 7 owned files + 4 consumed sibling files
- `methodology/00-overview.md` — paradigm + dispatch graph (handbook-format)
- `methodology/01-brief-archetype-router.md` — Agent 1 handbook
- `methodology/02-palette-brand-generator.md` — Agent 2 handbook
- `methodology/03-information-architect.md` — Agent 3 handbook
- `methodology/04-stitch-ui-composer.md` — Agent 4 handbook
- `methodology/05-copy-microcopy-writer.md` — Agent 5 handbook
- `methodology/06-seo-og-asset-engineer.md` — Agent 6 handbook
- `methodology/07-qa-pitfall-curator.md` — Agent 7 handbook (the meta-agent)
- `prompts/invoke-*.md` — 7 dispatch templates (one per agent)
- `prompts/consume-sibling-intel.md` — how to wire sibling JSON into construction
- Per-archetype `agents.md` and `data-contract.md` (10 files: 5 archetypes × 2)

**Changed:**
- `masterprompt.txt` slimmed from 585 lines to ~120 lines. Now an orchestrator that points to AGENT.md.
- Each archetype `prompt.md` becomes a 3-phase script (optional sibling fork → 7-agent chain → commit/push).
- `mechanics/` library: 6 new construction mechanics added, 2 refactored, 1 deprecated.

**Deprecated:**
- `mechanics/competitor-pricing-intel/` — work moved upstream to sibling repo. Replaced with stub README pointing to sibling + new `intel-consumer` mechanic.

**New mechanics:**
- `intel-consumer` — bridge: loads sibling JSON, exposes typed JS module
- `palette-tryout` — codified colors.html with 5 variants + Copy CSS button
- `stitch-bridge` — standard prompt + flow for Agent 4 driving Stitch
- `copy-deck` — copy.json schema + DOM-binding helper
- `meta-tags-generator` — per-page OG/Twitter/canonical/sitemap.xml/robots.txt from sitemap.json
- `a11y-axe-runner` — browser-side axe-core integration for Agent 7
- `mobile-test-harness` — single-page iframe tester at iPhone/Pixel/iPad widths

**Refactored:**
- `og-thumbnail` — tightened contract (filename, dims, regen-on-branding-change rule, design-at-600px-legibility)
- `chartjs-dashboard` — added lazy-init via IntersectionObserver, `Chart.afterRender` wait, flex-collapse fix as canonical pattern

**Added pitfall categories:**
- `brief-*` — scope drift, archetype mis-pick, missed sibling-fork decision
- `palette-*` — chose colors.html palette without dogfooding on actual cards
- `ia-*` — admin nav inconsistent across public/admin, OG missing on subpages
- `copy-*` — headlines written without reading sibling personas, generic CTAs
- `seo-*` — sitemap.xml missing, og-image stale on >1 commit, favicon set incomplete
- `qa-*` — axe violations shipped, mobile not phone-tested, pitfall not curated back

**Backward compatibility:** Old prompts ("use dt-site-creator to build me X") still work — they route through Agent 1 (Brief & Archetype Router), which picks the archetype and dispatches the rest.

**Migration path:** Existing in-flight projects continue with the v1 monolith if already started. New projects use v2 as of 2026-04-28.

---

## v1.0.0 — 2026-04-09 — Initial monolithic masterprompt

585-line `masterprompt.txt` with universal rules (Sections A–G). 5 archetypes with 5-file contract. 11 mechanics. ~40 pitfalls.

Retired 2026-04-28 in favour of v2 orchestrator architecture. Old playbook content migrated into archetype-specific CLAUDE.md files (verbatim) and slim orchestrator at root.
