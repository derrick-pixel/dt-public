# stitch-bridge (Stitch design system + screens)

Standardised flow for Agent 4 (Stitch / UI Composer) to drive Stitch via `mcp__stitch__*` tools. Captures the design system, generates screens for each page in `sitemap.json`, and records IDs in `design-system.json` for reproducibility.

## What it does

Six steps Agent 4 runs in order:

1. **`mcp__stitch__create_project`** — name from `brief.project_name`. Returns `project_id`.
2. **`mcp__stitch__create_design_system`** — pass:
   - palette tokens from `palette.json.chosen.tokens`
   - font pairing from agent's choice (one of 5 canonical pairings)
   - archetype label
   Returns `design_system_id`.
3. **`mcp__stitch__generate_screen_from_text`** — for each page in `sitemap.json.pages[]`, generate a screen. Pass:
   - copy from `copy.json.pages[<id>]`
   - section structure from sitemap
   - design system id
4. **`mcp__stitch__generate_variants`** (optional) — only if human wants to see directional alternatives. Saves wall-clock time vs hand-iteration.
5. **`mcp__stitch__apply_design_system`** — once direction locked, propagate the design system across all screens for consistency.
6. **Record IDs** in `design-system.json.stitch_project_id` and `stitch_design_system_id` so the work is reproducible.

## When to plug in

Default for all archetypes. Skip ONLY when:
- Stitch unavailable in the agent's environment (rare)
- Brief explicitly forbids Stitch ("manual design only")
- Project is so small (one-page game) that Stitch overhead exceeds value

In skip cases, document the fallback in `design-system.json`:
```json
{ "stitch_project_id": null, "fallback_reason": "single-page game, hand-coded canvas" }
```

## How to use

```
# Inside Agent 4's execution
const stitchProject = await mcp__stitch__create_project({
  name: brief.project_name,
  description: brief.project_description,
});

const stitchDS = await mcp__stitch__create_design_system({
  project_id: stitchProject.id,
  palette: palette.chosen.tokens,
  font_pairing: { headline: 'Inter', body: 'Inter' },  // chosen pairing
  archetype: brief.archetype,
});

for (const page of sitemap.pages) {
  const screen = await mcp__stitch__generate_screen_from_text({
    project_id: stitchProject.id,
    design_system_id: stitchDS.id,
    page_id: page.id,
    title: copy.pages[page.id].hero_headline,
    description: copy.pages[page.id].hero_subhead,
    sections: page.sections,  // from sitemap
  });
  // Record in design-system.json.components
}

await mcp__stitch__apply_design_system({
  project_id: stitchProject.id,
  design_system_id: stitchDS.id,
});

// Save IDs
designSystemJson.stitch_project_id = stitchProject.id;
designSystemJson.stitch_design_system_id = stitchDS.id;
```

## Trade-offs

- **Pro:** Stitch produces design that is consistent across pages without manual coordination.
- **Pro:** Stitch IDs make re-runs reproducible — if you need to revisit the design, the same project comes back.
- **Pro:** Variant generation (step 4) is faster than hand-iteration when exploring direction.
- **Con:** Stitch divergence: if you hand-edit HTML after Stitch generated it, future re-runs of Stitch may overwrite your edits. Either keep Stitch authoritative (re-export every change) or document the divergence in `design-system.json.components[].notes`.
- **Con:** Stitch tools are only available in Claude Code with the plugin enabled. Other environments will fall back.

## Linked pitfalls

- `ui-stitch-divergence` — Stitch screen says one thing, HTML implements another. Future re-runs overwrite. Fix: keep Stitch authoritative or note divergence.
- `ui-three-headline-fonts` — Stitch generated multiple variants with different fonts. Don't load all 3. Pick one pairing, regenerate all screens with it.

## Past uses

All dt-site-creator projects with Stitch enabled. Most recent: lumana, casket/passage, elix-eor, xinceai, aevum.
