# Invoke: SEO / OG / Asset Engineer (Agent 6)

Dispatch with:

```
Agent(
  subagent_type: "general-purpose",
  description: "dt-site-creator Agent 6 — OG image + favicons + sitemap.xml + meta tags",
  prompt: <paste Body below, with {{placeholders}} filled>
)
```

---

## Body

You are dispatched as **Agent 6 (SEO / OG / Asset Engineer)** in the dt-site-creator construction chain.

### Working directory

{{project_path}}

### When to run

This agent runs:
1. After Agent 4 builds the markup (first full build).
2. On every commit thereafter that changes branding, title, tagline, or palette. Check the trigger list in your handbook.

### Inputs to read first

1. `{{project_path}}/data/brief.json` — `live_url`, `target_geo`, `domain`
2. `{{project_path}}/data/sitemap.json` — every page that needs OG tags
3. `{{project_path}}/data/palette.json` — colours for OG image
4. `{{project_path}}/data/copy.json` — `site_title`, `site_tagline`, per-page `hero_headline`
5. `{{project_path}}/data/design-system.json` — `font_pairing` for OG image typography
6. `{{project_path}}/data/intel/competitors.json` if present — meta-description white-space scan
7. `/Users/derrickteo/codings/dt-site-creator/methodology/06-seo-og-asset-engineer.md` — your handbook
8. `/Users/derrickteo/codings/dt-site-creator/FIELD-DICTIONARY.md` — `assets-manifest.json` schema
9. `/Users/derrickteo/codings/dt-site-creator/mechanics/og-thumbnail/README.md`
10. `/Users/derrickteo/codings/dt-site-creator/mechanics/favicon/README.md`
11. `/Users/derrickteo/codings/dt-site-creator/mechanics/meta-tags-generator/README.md`

### Your task

1. **OG image:** Generate `/og-image.jpg` (1200×630, ≤200 KB). Use Stitch or the `og-thumbnail` mechanic. Test legibility at 600px wide. Generate per-page variants `/og-image-<page-id>.jpg` if positioning differs from homepage.
2. **Favicon set:** Generate all 8 files via `favicon` mechanic. Source: brand logo from Stitch or hand-designed.
3. **Meta tags:** Inject into every page's `<head>` per the canonical block in your handbook. Cover: `<title>`, description, canonical, full OG, Twitter card, theme-color, geo (if non-default).
4. **`sitemap.xml`:** Generate from `sitemap.json.pages[]`. Exclude auth-gated admin pages. Set priority + changefreq + lastmod.
5. **`robots.txt`:** Production = `Allow: /, Disallow: /admin/`. WIP/mirror = `Disallow: /` with `noindex` meta.
6. **`site.webmanifest`:** PWA manifest with icons, theme_color, background_color.
7. **Validate:** Test WhatsApp preview by pasting URL. (Twitter / LinkedIn validators if first launch.)
8. **`assets-manifest.json`:** Update with all paths and `generated_at` timestamps.
9. Commit and push.

### Files you write

- `{{project_path}}/og-image.jpg` (+ per-page variants if any)
- `{{project_path}}/favicon.ico`, `favicon.svg`, `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, `android-chrome-192.png`, `android-chrome-512.png`, `safari-pinned-tab.svg`
- `{{project_path}}/site.webmanifest`
- `{{project_path}}/sitemap.xml`
- `{{project_path}}/robots.txt`
- Meta tags injected into every page's `<head>`
- `{{project_path}}/data/assets-manifest.json`

### Deliverable checklist

Tick every item in your handbook's checklist before reporting back.

### When done, report back with

- OG image generated (+ count of per-page variants)
- Favicon set complete (8 files)
- Meta tags coverage: # pages with full OG / # pages total
- WhatsApp preview tested (paste URL, screenshot in handoff note)
- Lighthouse SEO score (if site live)
- Next agent: 7 (QA & Pitfall Curator) — opt-in, run when ready
