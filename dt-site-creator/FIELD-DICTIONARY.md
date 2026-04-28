# dt-site-creator — Field Dictionary

**Version:** 2026-04-28
**Status:** canonical

This file documents the JSON schemas produced by the 7 construction agents and the JSON consumed from the sibling `competitor-intel-template` repo. Agents do NOT invent new fields — they follow this dictionary, or route through Agent 7 (Pitfall Curator) to propose additions.

---

## Schema files produced by dt-site-creator

| File | Owner | Path |
|---|---|---|
| `brief.json` | Agent 1 (Brief & Archetype Router) | `/data/brief.json` |
| `palette.json` | Agent 2 (Palette & Brand Generator) | `/data/palette.json` |
| `sitemap.json` | Agent 3 (Information Architect) | `/data/sitemap.json` |
| `design-system.json` | Agent 4 (Stitch / UI Composer) | `/data/design-system.json` |
| `copy.json` | Agent 5 (Copy & Microcopy Writer) | `/data/copy.json` |
| `assets-manifest.json` | Agent 6 (SEO / OG / Asset Engineer) | `/data/assets-manifest.json` |
| `qa-report.json` | Agent 7 (QA & Pitfall Curator) | `/data/qa-report.json` |

## Schema files consumed from sibling

| File | Origin | Path in this repo |
|---|---|---|
| `competitors.json` | competitor-intel-template Agent 1 | `/data/intel/competitors.json` |
| `market-intelligence.json` | competitor-intel-template Agent 2 | `/data/intel/market-intelligence.json` |
| `pricing-strategy.json` | competitor-intel-template Agent 3 | `/data/intel/pricing-strategy.json` |
| `whitespace-framework.json` | competitor-intel-template Agent 4 | `/data/intel/whitespace-framework.json` |

For sibling schema details, read sibling repo's `FIELD-DICTIONARY.md`. This repo only documents how it **reads** those files (which fields are load-bearing for construction).

---

## brief.json (Agent 1)

```json
{
  "project_name": "string — short slug, kebab-case",
  "project_description": "string — one paragraph, what this site does",
  "github_repo": "derrick-pixel/<slug>",
  "live_url": "https://derrick-pixel.github.io/<slug>/ — null if not GitHub Pages",
  "archetype": "static-informational | transactional | dashboard-analytics | simulator-educational | game",
  "scoping_answers": {
    "who_visits": "public | customers | internal | learners",
    "do_users_pay_or_persist": "no | one-time | recurring | escrow",
    "core_experience": "content | interaction | goal",
    "live_data_layer": "no | dashboard | api"
  },
  "sibling_intel": {
    "fork_recommended": "boolean",
    "fork_status": "not-started | in-progress | complete | skipped",
    "intel_files_present": ["competitors.json", "market-intelligence.json", "..."]
  },
  "domain": "string — tech | defence | aviation | corporate | finance | hr | consumer | aged-care | …",
  "target_geo": ["SG", "MY", "ID", "VN", "TH", "PH"],
  "constraints": ["string — any explicit constraints (e.g., 'no PayNow', 'must use Supabase')"]
}
```

**Load-bearing:** `archetype` drives which `agents.md` to follow. `sibling_intel.fork_status` drives whether Agent 3 reads `/data/intel/`. `domain` seeds Agent 2's accent palette range.

---

## palette.json (Agent 2)

```json
{
  "chosen": "warm-cream | obsidian-amber | … (slug of selected variant)",
  "variants": [
    {
      "id": "warm-cream",
      "name": "Warm Cream Editorial",
      "mode": "light | dark",
      "tokens": {
        "--bg": "#FFF9F3",
        "--surface": "#ffffff",
        "--card": "#ffffff",
        "--card-hi": "#fafbfc",
        "--border": "#E0D5C8",
        "--border2": "#c9bdab",
        "--text": "#1A1A1A",
        "--muted": "#555555",
        "--muted2": "#888888",
        "--accent": "#dc2626",
        "--accent2": "#fbbf24",
        "--accent-d": "#b91c1c"
      },
      "rationale": "string — why this palette fits the brief, max 240 chars",
      "preview_html": "string — path to colors.html#variant-id"
    }
  ]
}
```

**Load-bearing:** Exactly 5 variants. Each must be **diametrically different** from the others (warm vs cool, dark vs light, muted vs vibrant). `chosen` is null until Derrick picks one — agents downstream wait.

---

## sitemap.json (Agent 3)

```json
{
  "pages": [
    {
      "id": "home",
      "path": "/index.html",
      "title": "string — <title> text",
      "nav_label": "string — short label for nav, ≤16 chars",
      "nav_order": 0,
      "admin": false,
      "auth_gated": false,
      "og": {
        "title": "string — distinct from page <title>, ≤60 chars",
        "description": "string — ≤160 chars",
        "image": "/og-image.jpg or /og-image-<slug>.jpg"
      },
      "consumes_intel": ["competitors.json", "market-intelligence.json"]
    }
  ],
  "admin_pages": [
    { "id": "admin", "path": "/admin.html", "auth_gated": false, "purpose": "competitor analytics" },
    { "id": "admin-insights", "path": "/admin-insights.html", "auth_gated": false, "purpose": "pricing & personas" }
  ],
  "footer_links": [
    { "label": "GitHub", "href": "string" }
  ]
}
```

**Load-bearing:** `consumes_intel` array tells Agent 5 (Copy) and Agent 6 (Assets) which sibling JSON files to read for that page. Empty array = no intel consumed.

---

## design-system.json (Agent 4)

```json
{
  "stitch_project_id": "string — Stitch project handle",
  "stitch_design_system_id": "string",
  "components": [
    {
      "id": "hero-band",
      "type": "hero | card | nav | cta | section | modal | accordion",
      "stitch_screen_id": "string",
      "html_path": "/components/hero-band.html — null if inlined",
      "css_classes": [".hero", ".hero-band"]
    }
  ],
  "font_pairing": {
    "headline": "Inter | Orbitron | Playfair Display | Noto Serif | Barlow Condensed",
    "body": "Inter | Exo 2 | Lato | Manrope | Barlow",
    "mono": "JetBrains Mono | null"
  }
}
```

**Load-bearing:** `font_pairing` chosen ONCE per site. `components` array is grow-only — components don't get renamed mid-project.

---

## copy.json (Agent 5)

```json
{
  "global": {
    "site_title": "string",
    "site_tagline": "string — ≤80 chars",
    "site_description": "string — ≤160 chars (used in meta description)",
    "company_name": "string"
  },
  "pages": {
    "home": {
      "hero_headline": "string — ≤72 chars",
      "hero_subhead": "string — ≤180 chars",
      "hero_cta_primary": "string — ≤24 chars",
      "hero_cta_secondary": "string — ≤24 chars or null",
      "sections": [
        { "id": "value-prop", "heading": "string", "body": "string (markdown)" }
      ]
    }
  },
  "microcopy": {
    "toast_save_success": "Saved.",
    "toast_save_error": "Save failed — try again.",
    "form_required": "Required.",
    "404_headline": "Page not found.",
    "loading": "Loading…"
  },
  "faq": [
    { "q": "string", "a": "string (markdown)" }
  ]
}
```

**Load-bearing:** ALL strings rendered in the site come from this file. No hardcoded copy in HTML/JS. Agent 5 reads sibling `pricing-strategy.json` personas to seed `hero_subhead` voice.

---

## assets-manifest.json (Agent 6)

```json
{
  "og_images": [
    {
      "page_id": "home",
      "path": "/og-image.jpg",
      "width": 1200,
      "height": 630,
      "generated_at": "2026-04-28T00:00:00Z",
      "source_design": "/admin/og-gen.html#home"
    }
  ],
  "favicons": {
    "favicon_ico": "/favicon.ico",
    "favicon_svg": "/favicon.svg",
    "favicon_16": "/favicon-16.png",
    "favicon_32": "/favicon-32.png",
    "apple_touch_icon": "/apple-touch-icon.png",
    "android_192": "/android-chrome-192.png",
    "android_512": "/android-chrome-512.png",
    "safari_pinned_tab": "/safari-pinned-tab.svg",
    "site_webmanifest": "/site.webmanifest"
  },
  "sitemap_xml_path": "/sitemap.xml",
  "robots_txt_path": "/robots.txt",
  "social_meta_validated": {
    "whatsapp": "boolean — preview tested",
    "twitter_card_validator": "boolean",
    "linkedin_post_inspector": "boolean"
  }
}
```

**Load-bearing:** `og_images[].generated_at` must be ≥ last commit that changed branding/title/tagline. Stale OG is a high-severity pitfall.

---

## qa-report.json (Agent 7)

```json
{
  "axe_violations": [
    {
      "page_id": "home",
      "rule": "color-contrast",
      "severity": "critical | serious | moderate | minor",
      "selector": "string",
      "fix_suggestion": "string"
    }
  ],
  "mobile_checks": {
    "iphone_13": { "passes": "boolean", "notes": "string" },
    "pixel_7": { "passes": "boolean", "notes": "string" },
    "ipad": { "passes": "boolean", "notes": "string" }
  },
  "performance": {
    "lighthouse_performance": 0,
    "lighthouse_accessibility": 0,
    "lighthouse_seo": 0
  },
  "pitfall_proposals": [
    {
      "id": "ia-admin-nav-mismatch",
      "category": "ia | brief | palette | copy | seo | qa",
      "severity": "low | medium | high | critical",
      "phase": "planning | building | shipping | live",
      "story": "string — what went wrong (≤300 words)",
      "source_project": "string — which site surfaced this",
      "fix": "string — how to avoid (code snippet welcome)",
      "lesson": "string — one-line takeaway",
      "mechanic": "string — related mechanic id, or null"
    }
  ]
}
```

**Load-bearing:** `pitfall_proposals` are PROPOSALS — they go to `methodology/proposals/`, not to `archetypes/<name>/pitfalls.md` directly. Human review required before merge.

---

## Sibling JSON consumption notes

### How Agent 3 (Information Architect) reads `/data/intel/`

- **competitors.json** → seeds admin.html: list of competitors, ratings, threat-level
- **market-intelligence.json** → seeds admin-insights.html: TAM/SAM/SOM funnel, policies, country readiness
- **pricing-strategy.json** → seeds admin-insights.html: personas, NBA cards, tiers
- **whitespace-framework.json** → seeds admin-insights.html: 8-D radar, heatmap, attack plans

### How Agent 5 (Copy Writer) reads `/data/intel/`

- **pricing-strategy.json** `personas[].pains[]` → seeds hero subhead voice + FAQ questions
- **whitespace-framework.json** `attack_plans[].why_we_win` → seeds value-prop section
- **market-intelligence.json** `policies[].implication_for_us` → seeds proof-point copy

### How Agent 6 (SEO Engineer) reads `/data/intel/`

- **competitors.json** → identifies meta description gaps competitors don't cover (white-space SEO)
- **market-intelligence.json** `country_readiness` → drives `<meta name="geo.region">` decisions

---

## Schema evolution rules

1. **Agents do not invent fields.** If an analysis needs a new field, the agent surfaces it in `qa-report.json.pitfall_proposals[]` (Agent 7 only) or in a structured handoff note for human review.
2. **Sibling schema is immutable from this side.** dt-site-creator never proposes changes to sibling JSON. Sibling proposals route through sibling's own `methodology/07-methodology-curator.md`.
3. **Field-level changes are version-bumped.** Bumps logged in `METHODS.md` with date + reason + source project.
4. **Deletions require ≥3 projects unused.** Same threshold as sibling.
5. **All field names are `snake_case`.** All JSON IDs are `kebab-case` slugs. No camelCase.

---

## Type conventions

- All ISO timestamps are UTC, `YYYY-MM-DDTHH:MM:SSZ`.
- All money fields are `*_sgd` (Singapore dollars, integers if whole, decimals if cents matter).
- All percentages are `*_pct` (0–100, not 0.0–1.0).
- All ratings are 1–5 unless otherwise noted (5 = best). Design ratings are 1–10 in 0.5 steps.
- Nullable fields are explicit (`null` allowed) — never use empty string as null.
- Arrays default to `[]`, never `null`.
