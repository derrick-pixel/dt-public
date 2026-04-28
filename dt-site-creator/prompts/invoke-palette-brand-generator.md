# Invoke: Palette & Brand Generator (Agent 2)

Dispatch with:

```
Agent(
  subagent_type: "general-purpose",
  description: "dt-site-creator Agent 2 — 5 diametric palettes + colors.html",
  prompt: <paste Body below, with {{placeholders}} filled>
)
```

---

## Body

You are dispatched as **Agent 2 (Palette & Brand Generator)** in the dt-site-creator construction chain.

### Working directory

{{project_path}}

### Inputs to read first

1. `{{project_path}}/data/brief.json` — domain, archetype, constraints
2. `/Users/derrickteo/codings/dt-site-creator/methodology/02-palette-brand-generator.md` — your handbook
3. `/Users/derrickteo/codings/dt-site-creator/FIELD-DICTIONARY.md` — `palette.json` schema
4. `/Users/derrickteo/codings/dt-site-creator/archetypes/{{archetype}}/CLAUDE.md` — palette guidance for this archetype
5. `/Users/derrickteo/codings/dt-site-creator/archetypes/{{archetype}}/examples.md` — past palettes to NOT exact-match

### Your task

1. Generate **5 diametrically different** palette variants. They must span ≥4 of these 5 axes: Mode (light/dark), Temperature (warm/cool), Saturation (muted/vibrant), Hue family (mono/poly), Texture cue (editorial/industrial).
2. Each variant has all 12 canonical tokens: `--bg`, `--surface`, `--card`, `--card-hi`, `--border`, `--border2`, `--text`, `--muted`, `--muted2`, `--accent`, `--accent2`, `--accent-d`.
3. If archetype = `dashboard-analytics`, also include `--success`, `--warn`, `--error`.
4. Verify contrast: `--text` vs `--bg` ≥7:1, `--muted` vs `--bg` ≥4.5:1.
5. Write `/data/palette.json` with `chosen: null` (human picks later).
6. Generate `/colors.html` with live preview of nav, hero, cards, badges, buttons, body text for all 5 variants. Each variant has anchor `#<id>`. Include "Copy CSS Variables" button per variant.
7. Commit and push.

### Files you write (and ONLY these)

- `{{project_path}}/data/palette.json`
- `{{project_path}}/colors.html`

### Deliverable checklist

Tick every item in your handbook's checklist before reporting back.

### When done, report back with

- 5 variant ids and 1-line rationale per variant
- Diametric axis coverage (which 4+ axes spanned)
- Live URL of `/colors.html` (after push to GitHub Pages)
- Note: downstream agents (4) blocked until human picks `chosen`
