# 02 — Palette & Brand Generator

**Owns:** `/data/palette.json`, `/colors.html`
**Position in chain:** Parallel with Agents 3 and 5 after Agent 1.
**Reads:** `brief.json`, `archetypes/<archetype>/CLAUDE.md` (palette guidance)
**Writes:** `palette.json` with 5 variants, `colors.html` with live preview, "Copy CSS Variables" button.

---

## Role

Generate 5 **diametrically different** colour palettes for the human to choose from. Each palette must be visually distinct (not 5 shades of the same direction). Render them live in `colors.html` so the human sees nav, hero, cards, buttons, badges in each palette before deciding.

You do NOT pick the palette. You propose. The human picks. Downstream agents wait until `palette.json.chosen` is set.

---

## Inputs

- **`brief.json`** — `domain` and `archetype` shape the palette range.
- **Past palettes for the brand family** (if any) — read `archetypes/<archetype>/examples.md` and check no exact-match reuse.
- **Reference accent table** in `archetypes/static-informational/CLAUDE.md` Section 2 — a starting point only.

---

## Diametric variant rule

The 5 variants must span at least 4 of these 5 axes:

| Axis | Pole A | Pole B |
|---|---|---|
| Mode | Light | Dark |
| Temperature | Warm (red/orange/gold) | Cool (blue/cyan/teal) |
| Saturation | Muted / earthy | Vibrant / neon |
| Hue family | Monochrome (1 hue) | Polychrome (3+ hues) |
| Texture cue | Editorial / serif-feeling | Industrial / mono-feeling |

Bad set (rejected): 5 dark palettes with different accents — they're all on the same Mode pole.
Good set (accepted): 1 warm cream editorial, 1 obsidian + amber HUD, 1 cool teal aged-care, 1 vibrant coral lifestyle, 1 muted military olive.

---

## Per-variant tokens (canonical 12)

Every variant produces all 12 tokens. No optional fields:

```css
--bg            /* deepest background */
--surface       /* card/panel background */
--card          /* elevated card */
--card-hi       /* highest elevation, hover state */
--border        /* subtle border */
--border2       /* stronger border */
--text          /* primary text */
--muted         /* secondary text */
--muted2        /* tertiary text */
--accent        /* primary accent */
--accent2       /* secondary accent */
--accent-d      /* darker shade of primary, for hover/pressed */
```

Optional (when the archetype/domain calls for it):
- `--success`, `--warn`, `--error`, `--info` (status bands — required for dashboard-analytics)
- `--font-head`, `--font-body`, `--font-mono` (typography — required if Agent 4 will theme-flip later)

---

## Domain-to-palette starting hints

| Domain | Tendency |
|---|---|
| tech / saas | dark mode + cyan / blue accent or warm obsidian + amber HUD |
| defence / aviation | dark + amber/orange or industrial olive |
| aged-care / healthcare | warm light + teal or sage green |
| consumer / lifestyle | warm light + coral / pink or vibrant gradient |
| finance / analytics | dark + green or light + indigo |
| hr / people | warm light + gold or warm cream + violet |
| education | warm light + violet or dark + cyan |
| compliance / corporate | dark + indigo or light + slate + red accent |

These are STARTING points. The 5 variants should still span the diametric axes — don't generate 5 variants on the "tendency" alone.

---

## Naming conventions

Each variant has:
- `id` — kebab-case slug, ≤32 chars: `warm-cream-editorial`, `obsidian-amber-hud`
- `name` — title-case, ≤40 chars: "Warm Cream Editorial", "Obsidian + Amber HUD"
- `mode` — `light` or `dark` (drives Agent 9-equivalent theme-flip if added later)
- `rationale` — one sentence, ≤240 chars, why this palette fits the brief

Example:
```json
{
  "id": "obsidian-amber-hud",
  "name": "Obsidian + Amber HUD",
  "mode": "dark",
  "tokens": { /* 12 canonical tokens */ },
  "rationale": "Tactical warmth — amber primary signals operational readiness without the cyan-tech cliché. Pairs with the defence/aviation domain.",
  "preview_html": "/colors.html#obsidian-amber-hud"
}
```

---

## colors.html requirements

The page must render, side-by-side or as switchable tabs:

1. **Fixed nav** in palette colours
2. **Hero band** with headline + subhead + 2 CTAs (primary + outline)
3. **Card grid** (3 cards) showing card colour + border + hover state
4. **Badge row** (4 colour variants — blue/green/gold/coral or palette equivalents)
5. **Body text** with 3 paragraphs, demonstrating `--text` and `--muted`
6. **Button states**: default, hover, disabled
7. **Status bands** (if archetype is dashboard-analytics): success / warn / error
8. **All 12 tokens displayed as a code block** for each variant
9. **"Copy CSS Variables" button** — copies the variant's `:root { ... }` block to clipboard

Each variant has its own anchor `#<id>` so Agent 3 can link to it from the brief.

---

## Output: palette.json

Follow `FIELD-DICTIONARY.md` schema. Example:

```json
{
  "chosen": null,
  "variants": [
    { "id": "warm-cream-editorial", "name": "Warm Cream Editorial", "mode": "light", "tokens": {...}, "rationale": "...", "preview_html": "/colors.html#warm-cream-editorial" },
    { "id": "obsidian-amber-hud", "name": "Obsidian + Amber HUD", "mode": "dark", "tokens": {...}, "rationale": "...", "preview_html": "/colors.html#obsidian-amber-hud" },
    { "id": "cool-teal-aged-care", ... },
    { "id": "vibrant-coral-lifestyle", ... },
    { "id": "muted-military-olive", ... }
  ]
}
```

`chosen: null` until human picks. Update `chosen` to the variant `id` after selection. Downstream agents read `chosen` to find the active token set.

---

## Pitfalls to avoid

- **palette-five-cyans** — 5 dark cyan variants because "tech site." Rejected: not diametric. Severity: medium. Fix: walk the 5 axes table, ensure variants span ≥4.
- **palette-reuse-prior-site** — Same exact tokens as a previous Elitez site. Brand recognition collapses. Severity: high. Fix: cross-reference `archetypes/<archetype>/examples.md` token lists; every value must differ in ≥1 of {bg, surface, accent}.
- **palette-no-card-hi** — Skipped `--card-hi` because "looks the same as --card". Then hover states are invisible. Severity: low. Fix: require all 12 canonical tokens; if `--card-hi == --card`, the palette is broken.
- **palette-bad-contrast** — Picked `--muted` too close to `--bg`. WCAG AA fails on body text. Severity: high. Fix: contrast check `--text` vs `--bg` ≥7:1, `--muted` vs `--bg` ≥4.5:1.
- **palette-status-bands-missing** — dashboard-analytics archetype but no `--success/--warn/--error`. Charts and KPI tiles can't band. Severity: high. Fix: add status bands when archetype = dashboard-analytics.

---

## Deliverable checklist

- [ ] 5 variants present in `palette.json`
- [ ] Variants span ≥4 of the 5 diametric axes (Mode, Temperature, Saturation, Hue family, Texture)
- [ ] Each variant has all 12 canonical tokens (no missing fields)
- [ ] Each variant has `id`, `name` (title-case), `mode`, `rationale` (≤240 chars), `preview_html`
- [ ] No exact-token-match with prior site in same archetype
- [ ] Contrast: `--text` vs `--bg` ≥7:1, `--muted` vs `--bg` ≥4.5:1 (WCAG AA body)
- [ ] colors.html renders all 5 variants with nav, hero, cards, badges, buttons, body text
- [ ] "Copy CSS Variables" button works in all variants
- [ ] If archetype = dashboard-analytics: `--success/--warn/--error` present in every variant
- [ ] `chosen: null` until human picks
- [ ] Committed and pushed; commit message names the 5 variant ids
