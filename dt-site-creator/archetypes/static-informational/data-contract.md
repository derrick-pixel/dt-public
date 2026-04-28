# Static-Informational — Data Contract

JSON files this archetype produces and consumes. See `/Users/derrickteo/codings/dt-site-creator/FIELD-DICTIONARY.md` for full schemas.

---

## Produces

| File | Owner | Path |
|---|---|---|
| `brief.json` | Agent 1 | `/data/brief.json` |
| `palette.json` | Agent 2 | `/data/palette.json` |
| `sitemap.json` | Agent 3 | `/data/sitemap.json` |
| `design-system.json` | Agent 4 | `/data/design-system.json` |
| `copy.json` | Agent 5 | `/data/copy.json` |
| `assets-manifest.json` | Agent 6 | `/data/assets-manifest.json` |
| `qa-report.json` | Agent 7 | `/data/qa-report.json` |

## Consumes (from sibling, when forked)

| File | Used by | Purpose |
|---|---|---|
| `competitors.json` | Agent 3 (admin.html), Agent 5 (FAQ from weaknesses) | Competitor list + Top-5 |
| `market-intelligence.json` | Agent 3 (admin-insights), Agent 5 (proof points), Agent 6 (geo meta) | TAM/SAM/SOM + policies + culture |
| `pricing-strategy.json` | Agent 3 (admin-insights), Agent 5 (hero subhead voice) | Personas + tiers |
| `whitespace-framework.json` | Agent 3 (admin pages both), Agent 5 (value-prop) | 8-D canvas + heatmap + attack plans |

Place sibling JSON at `/data/intel/<filename>.json` in the construction repo. Agent 3 lists which files each admin page consumes via `sitemap.json.pages[<id>].consumes_intel[]`.

---

## Minimum viable shapes

If full sibling fork isn't available, the archetype can still ship if these minimum fields exist:

### `brief.json` minimum
- `project_name`, `archetype: "static-informational"`, `domain`, `target_geo[]`

### `palette.json` minimum
- 5 variants × 12 canonical tokens, `chosen` set after human picks

### `sitemap.json` minimum
- index.html
- One admin page (admin.html) — even with placeholders if no sibling intel
- All pages have `og.title` and `og.description`

### `copy.json` minimum
- `global.{site_title, site_tagline, site_description, company_name}`
- `pages.home.{hero_headline, hero_subhead, hero_cta_primary}`
- `microcopy.{toast_save_success, toast_save_error, form_required, 404_headline, loading}`

### `assets-manifest.json` minimum
- `og_images[].path` for at least homepage
- All 8 favicon paths
- `sitemap_xml_path`, `robots_txt_path`

If any minimum field is missing, Agent 4 cannot proceed — the build halts.

---

## Schema evolution

If you find that this archetype needs a new field (e.g., a `team_members[]` array for company sites that have a team page), Agent 7 proposes the addition via `qa-report.json.pitfall_proposals[]`. Do NOT silently extend the schema in this project. Schema changes must be approved and merged into `FIELD-DICTIONARY.md` first.
