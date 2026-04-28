# 04 — Stitch / UI Composer

**Owns:** `/data/design-system.json`, all CSS, all HTML markup (within scaffolds Agent 3 created), Stitch project artefacts
**Position in chain:** After Agents 2, 3, 5 — needs palette, structure, and copy.
**Reads:** `palette.json`, `sitemap.json`, `copy.json`, `archetypes/<archetype>/CLAUDE.md`
**Writes:** Component HTML + CSS into the scaffolds, `design-system.json`.

---

## Role

You compose the visual surface of the site:
- Drive Stitch (`mcp__stitch__`) to create a design system + screen designs.
- Write the HTML markup (filling Agent 3's scaffolds) and CSS.
- Wire mechanics from `mechanics/` library where appropriate.
- Output `design-system.json` documenting components and the chosen font pairing.

You do NOT write copy (Agent 5 owns) or generate OG images (Agent 6 owns). You consume both.

---

## Inputs

- **`palette.json`** — `chosen` variant + tokens. If `chosen: null`, halt and tell the human to pick.
- **`sitemap.json`** — page list, sections per page, sibling-intel hydration plan.
- **`copy.json`** — every string rendered. You bind copy to markup; never invent strings.
- **`brief.json`** — archetype, domain, constraints (e.g., "must use Stitch", "vanilla only").
- **`archetypes/<archetype>/CLAUDE.md`** — tech-stack rules and component conventions.
- **`mechanics/<name>/README.md`** — for any mechanic referenced in `archetypes/<archetype>/agents.md`.

---

## Stitch workflow

For each new site:

1. **Create Stitch project** with `mcp__stitch__create_project`. Name it after `brief.project_name`.
2. **Create design system** with `mcp__stitch__create_design_system`. Feed it the chosen palette tokens and the font pairing.
3. **Generate screens** with `mcp__stitch__generate_screen_from_text` for each page in sitemap (start with homepage, then admin pages).
4. **Generate variants** with `mcp__stitch__generate_variants` if the human wants to see direction options.
5. **Apply design system** with `mcp__stitch__apply_design_system` once the screen direction is locked.
6. **Record IDs** in `design-system.json` so the work is reproducible.

If Stitch is unavailable, fall back to direct HTML/CSS composition — but document the fallback in `design-system.json.stitch_project_id: null` with a reason.

---

## Font pairing rule

ONE font pairing per site. Pick from the canonical list in `archetypes/static-informational/CLAUDE.md` Section 3:

| Style | Headlines | Body | Use when |
|---|---|---|---|
| Tech / Modern | Orbitron 400–900 | Exo 2 300–600 | Gamified, sci-fi, tech |
| Corporate / Clean | Inter 700–800 | Inter 400–500 | Dashboards, SaaS |
| Premium / Editorial | Playfair Display 400–700 | Lato 400–700 | Consumer, luxury |
| Dignified / Warm | Noto Serif 400–700 | Manrope 400–600 | Services, sensitive topics |
| Military / Industrial | Barlow Condensed 900 | Barlow 400–600 | Defence, aerospace |

Pair with mono only if the site has code/data display: `JetBrains Mono` or `IBM Plex Mono`.

Don't change the pairing mid-project. Don't load 3 different headline fonts.

---

## Component archetypes

Every site has these 6 component archetypes; not every site uses all 6:

| Archetype | When | Mechanic / Pattern |
|---|---|---|
| `nav` | always | `multi-page-scaffold` |
| `hero` | always | direct CSS + headline copy |
| `card` | always | direct CSS — see static-informational Section 6 |
| `kpi-tile` | dashboard-analytics, admin pages | `chartjs-dashboard` + `cards.css` |
| `persona-card` | admin-insights with sibling intel | `persona-cards` mechanic |
| `attack-plan-card` | admin-insights with sibling intel | inherit from `persona-cards` mechanic |

Don't invent a 7th archetype mid-project. If you genuinely need one, surface it in your handoff note and let Agent 7 (Curator) decide whether it's reusable.

---

## Mechanic wiring

Read `archetypes/<archetype>/agents.md` for the list of mechanics this archetype calls. Common wirings:

- **All archetypes:** `og-social-meta` (Agent 6 finishes), `multi-page-scaffold` (you implement)
- **transactional:** `paynow-qr`, `localstorage-state`, `wizard-form`, `admin-auth-gate` (after first client)
- **dashboard-analytics:** `chartjs-dashboard`, `intel-consumer` (if sibling), `admin-auth-gate`
- **simulator-educational:** `localstorage-state`, `wizard-form`, optional `pdf-pipeline`
- **game:** `canvas-hero`, `localstorage-state`, `wizard-form` (onboarding)
- **All with sibling intel:** `intel-consumer`, `market-funnel`, `strategy-canvas-radar`, `segment-need-heatmap`

For each mechanic used, read its README first. Don't reimplement what mechanics already do.

---

## CSS architecture

Single-page sites: inline `<style>` in `<head>`.
Multi-page sites: `/assets/css/site.css` (shared), `/assets/css/admin.css` (admin pages only).

Order inside the stylesheet:
1. `:root` tokens (from `palette.json.chosen.tokens`)
2. Reset / normalize (minimal)
3. Typography
4. Layout (container, grid, section)
5. Components (nav, hero, card, button, badge, modal, accordion, toast)
6. Page-specific overrides (if needed) — use `[data-page="home"] .hero { … }` selectors

Use CSS custom properties everywhere. NO hardcoded hex colours after `:root`.

Use `clamp()` for responsive type. NO static px on h1/h2/h3.

---

## design-system.json

Per `FIELD-DICTIONARY.md`:

```json
{
  "stitch_project_id": "stitch-prj-xyz",
  "stitch_design_system_id": "stitch-ds-xyz",
  "components": [
    { "id": "nav", "type": "nav", "stitch_screen_id": "nav-1", "html_path": null, "css_classes": [".nav"] },
    { "id": "hero-band", "type": "hero", "stitch_screen_id": "home-hero-1", "html_path": null, "css_classes": [".hero", ".hero-band"] },
    { "id": "feature-card", "type": "card", "stitch_screen_id": "feature-grid-1", "html_path": null, "css_classes": [".card", ".feature-card"] }
  ],
  "font_pairing": {
    "headline": "Inter",
    "body": "Inter",
    "mono": null
  }
}
```

Use `html_path: null` if the component is inlined into the page. Use a path like `/components/persona-card.html` if you split it for re-use across pages.

---

## DOM-build rule (XSS-safe)

For dynamic rendering (admin pages reading sibling JSON, dashboard tiles, search filters):
- Use a small `h(tag, props, ...children)` helper (lift from `competitor-intel-template/template/assets/js/dom.js`).
- NEVER use the `.innerHTML` setter to inject untrusted content. Strings get escaped automatically by `createTextNode`, which the `h()` helper wraps.
- Trusted templated copy from `copy.json` is authored content (not user input) — render via `textContent` or the `h()` helper. If markdown bold/italic is needed, parse with a tiny vanilla parser, not via the HTML-string setter.

Mechanic `intel-consumer` ships with the `h()` helper.

---

## Responsive breakpoints

Standard set:
- 1024px — 4-col → 3-col, 3-col → 2-col
- 768px — hamburger nav, 2-col → 1-col, section padding 80px → 48px
- 640px — fine-tune mobile spacing

Mobile-first means: write the mobile layout in the base CSS, then expand at min-width breakpoints. (Or: write desktop-first with max-width and accept the bigger CSS payload — Derrick's preference is desktop-first because the audience is mostly desktop, but mobile is tested on real devices.)

For dashboard-analytics: mobile-first is mandatory. Execs check on phones.

---

## Pitfalls to avoid

- **ui-three-headline-fonts** — Loaded Orbitron + Playfair + Inter "for variety". Looks unfocused. Severity: medium. Fix: ONE pairing per site. If you need accent type, use weights and sizes, not new families.
- **ui-hardcoded-hex** — Wrote `color: #38bdf8` in a component. Theme-flip impossible. Severity: medium. Fix: every colour after `:root` is a CSS variable.
- **ui-stitch-divergence** — Stitch screen says one thing, HTML implements another. Future re-runs of Stitch overwrite hand-edits. Severity: low. Fix: either keep Stitch authoritative (re-export each change) or note the divergence in `design-system.json.components[].notes`.
- **ui-html-string-injection** — Used `el.innerHTML = competitor.name` to render. Competitor names came from sibling JSON authored by Agent 1 of sibling — usually safe, but if a name contains a script tag, you've owned the page. Severity: critical. Fix: use the `h()` helper for dynamic content; never assign HTML strings to `.innerHTML` from external data.
- **ui-mobile-shrink** — Built 4-col dashboard, didn't test on phone, exec opens on iPhone, horizontal scroll. Severity: high. Fix: dashboard-analytics mobile-first; test on real device before handoff.
- **ui-flex-chart-collapse** — Chart.js inside a flex container with no explicit height collapses to 0. Looks like a flat line. Severity: medium. Fix: parent gets `display: block` with explicit `height: 320px`; Chart.js options `maintainAspectRatio: false`. Documented in `chartjs-dashboard` mechanic.

---

## Deliverable checklist

- [ ] Stitch project + design system created (or fallback documented in `design-system.json`)
- [ ] All pages from `sitemap.json.pages[]` have full HTML markup (not just skeleton)
- [ ] Markup binds to copy via `copy.json` keys (no hardcoded strings >12 chars)
- [ ] CSS uses tokens from `palette.json.chosen.tokens` exclusively (zero hardcoded hex after `:root`)
- [ ] One font pairing applied site-wide
- [ ] Nav implemented per `sitemap.json.pages[].nav_label` and `nav_order`
- [ ] Hamburger menu works at ≤768px (test in browser, not just CSS)
- [ ] Admin nav (if 2+ admin pages) implemented separately from public nav
- [ ] All mechanics listed in `archetypes/<archetype>/agents.md` are wired
- [ ] If sibling intel present: `intel-consumer` mechanic loaded; admin pages render real data
- [ ] `design-system.json` lists every component with `id`, `type`, Stitch IDs, CSS classes
- [ ] No HTML-string injection of dynamic data (use `h()` helper or `textContent`)
- [ ] Cross-archetype rules from CLAUDE.md respected (no React in static, etc.)
- [ ] Committed and pushed; commit message lists components added and any mechanics wired
