# palette-tryout (colors.html generator)

Generates `/colors.html` — a single page that renders **5 diametrically different palettes** side-by-side with full UI previews and "Copy CSS Variables" buttons per variant. Required by Agent 2 (Palette & Brand Generator).

## What it does

For each of the 5 palette variants, renders:
1. Fixed nav using palette tokens
2. Hero band (headline + subhead + 2 CTAs primary + outline)
3. Card grid (3 cards) showing card colour + border + hover state
4. Badge row (4 colour variants)
5. Body text (3 paragraphs) demonstrating `--text` and `--muted`
6. Button states: default, hover, disabled
7. Status bands (`--success`, `--warn`, `--error`) — only if archetype = dashboard-analytics
8. All 12 canonical tokens displayed as a code block
9. "Copy CSS Variables" button — copies `:root { ... }` block to clipboard

Each variant has anchor `#<variant-id>` for direct linking.

## When to plug in

**Every project, every time.** This is the single mechanism the human uses to pick the palette. Without it, Agent 2 can't hand off to downstream agents.

Generated early (after Agent 1 completes brief.json, parallel with sitemap.json and copy.json). Removed from the repo after the human picks (`palette.json.chosen` is set).

## How to use

Agent 2 (Palette & Brand Generator) reads:
- `brief.json` — domain, archetype
- `palette.json.variants[]` — the 5 variants Agent 2 just generated

…then writes `/colors.html` using `snippet.html` as a template. Each variant is a full `<section data-variant="...">` block with all 12 tokens applied via CSS custom properties scoped to the section.

The "Copy CSS Variables" button uses `navigator.clipboard.writeText(...)` to put the `:root { ... }` block on the user's clipboard.

After human picks: update `palette.json.chosen` to the variant `id`, then:
- Either delete `colors.html` (recommended for production)
- Or keep it but remove from nav (Agent 6 will skip it from sitemap.xml)

## Trade-offs

- **Pro:** Visual decision is far better than choosing colours from a JSON list. Live preview catches "looks great in Figma, hideous on cards" cases.
- **Pro:** "Copy CSS Variables" is a hand-off mechanism — the chosen tokens land in the project verbatim.
- **Con:** colors.html itself isn't a production asset — it bloats the repo if not removed.
- **Con:** 5 variants × 6 components = 30 small renders on one page. Slow on low-end devices. Acceptable since it's only seen by the human reviewer.

## Diametric variant rule

The 5 variants must span ≥4 of these 5 axes (Agent 2 enforces this):

| Axis | Pole A | Pole B |
|---|---|---|
| Mode | Light | Dark |
| Temperature | Warm | Cool |
| Saturation | Muted / earthy | Vibrant / neon |
| Hue family | Monochrome | Polychrome |
| Texture cue | Editorial | Industrial |

5 dark cyan variants = rejected (all on the same Mode pole).
1 warm cream + 1 obsidian amber + 1 cool teal + 1 vibrant coral + 1 muted military olive = accepted.

## Linked pitfalls

- `palette-five-cyans` — 5 variants all in same Mode pole. Fix: walk diametric axes.
- `palette-reuse-prior-site` — Same exact tokens as previous Elitez site.
- `palette-bad-contrast` — `--text` vs `--bg` <7:1.
- `palette-no-card-hi` — `--card-hi == --card`, hover states invisible.

## Past uses

Every dt-site-creator project since 2026-03 ships colors.html in the first build. Examples in: lumana, casket, elix-eor, elitez-security, xinceai, aevum.
