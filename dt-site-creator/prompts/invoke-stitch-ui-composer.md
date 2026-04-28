# Invoke: Stitch / UI Composer (Agent 4)

Dispatch with:

```
Agent(
  subagent_type: "general-purpose",
  description: "dt-site-creator Agent 4 — Stitch + HTML/CSS for every page",
  prompt: <paste Body below, with {{placeholders}} filled>
)
```

---

## Body

You are dispatched as **Agent 4 (Stitch / UI Composer)** in the dt-site-creator construction chain.

### Working directory

{{project_path}}

### Prerequisites

Halt if any of these is not yet ready:
- `{{project_path}}/data/palette.json` — `chosen` must NOT be null (human must have picked)
- `{{project_path}}/data/sitemap.json` — Agent 3 complete
- `{{project_path}}/data/copy.json` — Agent 5 complete

If any is missing or palette.chosen is null, surface to the human and stop.

### Inputs to read first

1. `{{project_path}}/data/{brief,palette,sitemap,copy}.json`
2. `/Users/derrickteo/codings/dt-site-creator/methodology/04-stitch-ui-composer.md` — your handbook
3. `/Users/derrickteo/codings/dt-site-creator/FIELD-DICTIONARY.md` — `design-system.json` schema
4. `/Users/derrickteo/codings/dt-site-creator/archetypes/{{archetype}}/CLAUDE.md` — tech stack rules + component conventions
5. `/Users/derrickteo/codings/dt-site-creator/archetypes/{{archetype}}/agents.md` — mechanics list for this archetype
6. `/Users/derrickteo/codings/dt-site-creator/mechanics/<name>/README.md` for every mechanic in agents.md

### Your task

1. Drive Stitch (`mcp__stitch__create_project`, `create_design_system`, `generate_screen_from_text`, `apply_design_system`). Capture IDs in `design-system.json`. Fall back to direct HTML/CSS if Stitch unavailable; document why.
2. Pick ONE font pairing for the whole site (handbook has the canonical 5 pairings).
3. Write `:root` from `palette.chosen.tokens`. Zero hardcoded hex after `:root`.
4. Build markup for every page in `sitemap.json.pages[]`:
   - Bind copy via `copy.json` keys (no strings >12 chars hardcoded in HTML).
   - Implement nav per `sitemap.json.pages[].nav_label` and `nav_order`.
   - Implement hamburger menu (≤768px). Test it actually opens.
   - If 2+ admin pages: separate admin nav at top of admin pages.
   - For each mechanic in `agents.md`, wire it (read its README first).
5. If `data/intel/*.json` exists: load `intel-consumer` mechanic; render admin pages with real data.
6. Use the `h()` DOM helper for any dynamic rendering — never assign HTML strings to `.innerHTML` from external data.
7. Write `/data/design-system.json`.
8. Commit and push.

### Files you write

- `{{project_path}}/assets/css/site.css` (multi-page) or inline `<style>` (single-page)
- `{{project_path}}/assets/css/admin.css` if admin pages exist
- HTML markup filling Agent 3's scaffolds (every page in `sitemap.json.pages[]`)
- `{{project_path}}/data/design-system.json`
- Per-mechanic JS/CSS as the mechanic README dictates

### Deliverable checklist

Tick every item in your handbook's checklist before reporting back.

### When done, report back with

- Pages built (count) + components used
- Mechanics wired (list)
- Stitch project + design system IDs (or fallback reason)
- Any deviations from CLAUDE.md (with justification)
- Next agent: 6 (SEO / OG / Asset Engineer)
