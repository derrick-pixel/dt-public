# 06 — SEO / OG / Asset Engineer

**Owns:** `og-image.jpg`, all favicons, `sitemap.xml`, `robots.txt`, all `<meta>` tags in `<head>`, `/data/assets-manifest.json`
**Position in chain:** Runs every commit (after Agent 4 builds the markup; on every subsequent change).
**Reads:** `brief.json`, `sitemap.json`, `palette.json`, `copy.json`, `design-system.json`
**Writes:** OG images, favicon set, sitemap.xml, robots.txt, meta-tag injections, `assets-manifest.json`.

---

## Role

You make the site **shareable** and **discoverable**. Every commit checks:
- Is `og-image.jpg` current? (matches latest branding/title/tagline)
- Does every page have its OG/Twitter/canonical tags?
- Does the favicon set cover all platforms?
- Is `sitemap.xml` up to date?
- Is `robots.txt` correct?

You run last in the build chain (after Agent 4) AND on every subsequent commit (catching drift).

---

## Inputs

- **`brief.json`** — `live_url`, `project_description`, `target_geo`, `domain`.
- **`sitemap.json`** — every page that needs OG tags. `pages[].og` is the source of truth for per-page OG.
- **`palette.json.chosen.tokens`** — colours for OG image generation.
- **`copy.json`** — `global.site_title`, `global.site_tagline`, `pages.<id>.hero_headline`.
- **`design-system.json.font_pairing`** — fonts for OG image typography.
- **`/data/intel/competitors.json`** if present — for SEO white-space (meta angles competitors don't cover).

---

## OG image generation

Spec:
- 1200 × 630 px (Facebook/Twitter/WhatsApp/LinkedIn standard)
- Filename: `/og-image.jpg` for homepage; `/og-image-<page-id>.jpg` for per-page variants
- Format: JPG quality 85 (≤200 KB) OR PNG if transparency-critical
- Design rule: legible at 600 px wide (typical mobile preview size). Test by halving in your viewer.

Default content:
- `global.site_title` as visual anchor (large display type)
- `global.site_tagline` as subtitle
- One brand element (logo / mark / icon)
- Background using `palette.chosen.tokens.--bg` or a brand gradient

Generation method (in order of preference):
1. **Stitch-driven** — `mcp__stitch__generate_screen_from_text` with explicit "1200x630 OG card" instruction.
2. **`og-thumbnail` mechanic** — uses inline HTML page + html2canvas to rasterize. See `mechanics/og-thumbnail/README.md`.
3. **Manual** in design tool (Figma, Affinity) — only if 1 & 2 unavailable.

---

## When to regenerate OG image

Triggers (any of these = regenerate):
- `brief.project_description` changed
- `copy.json.global.site_title` or `site_tagline` changed
- `palette.json.chosen` changed
- `sitemap.json.pages[].nav_label` for homepage changed
- More than 7 days since last regeneration AND any commit changed visible site copy

Do NOT regenerate on every commit blindly — that creates churn. Check the trigger list, then regenerate if any tripped.

After regenerating, update `assets-manifest.json.og_images[].generated_at` to current ISO timestamp.

---

## Per-page OG variants

Optional. Use when:
- A page has substantively different positioning from homepage (e.g., `pricing.html` highlights "From S$30/mo" vs homepage's brand statement)
- An admin page is shared internally and benefits from distinct preview

If used, generate `/og-image-<page-id>.jpg` and reference it in `sitemap.json.pages[<page-id>].og.image`.

---

## Meta tag injection

Every page in `sitemap.json.pages[]` gets these tags in `<head>`. You write them — Agent 3's scaffolds left an anchor comment.

```html
<!-- SEO -->
<title>{copy.global.site_title} — {copy.pages.<id>.hero_headline}</title>
<meta name="description" content="{sitemap.pages[<id>].og.description}" />
<link rel="canonical" href="{brief.live_url}{sitemap.pages[<id>].path}" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content="{brief.live_url}{sitemap.pages[<id>].path}" />
<meta property="og:title" content="{sitemap.pages[<id>].og.title}" />
<meta property="og:description" content="{sitemap.pages[<id>].og.description}" />
<meta property="og:image" content="{brief.live_url}{sitemap.pages[<id>].og.image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="en_SG" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{sitemap.pages[<id>].og.title}" />
<meta name="twitter:description" content="{sitemap.pages[<id>].og.description}" />
<meta name="twitter:image" content="{brief.live_url}{sitemap.pages[<id>].og.image}" />

<!-- Geo (if applicable) -->
<meta name="geo.region" content="SG" />
<meta name="geo.placename" content="Singapore" />
```

`og:locale` defaults to `en_SG` for SG-targeted sites. Override per `brief.target_geo[0]` if non-SG primary.

---

## Favicon set

Required (all):

```
/favicon.ico                    16+32+48 multi-size ICO
/favicon.svg                    Adaptive (dark-mode aware via media queries)
/favicon-16.png                 16x16
/favicon-32.png                 32x32
/apple-touch-icon.png           180x180 (iOS home screen)
/android-chrome-192.png         192x192
/android-chrome-512.png         512x512
/safari-pinned-tab.svg          Monochrome SVG (Safari macOS)
/site.webmanifest               PWA manifest
```

Generation: use the `favicon` mechanic — see `mechanics/favicon/README.md`. Source asset is the brand logo (Stitch-generated or hand-designed).

Inject in `<head>`:
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="{palette.chosen.tokens.--accent}" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="{palette.chosen.tokens.--bg}" />
```

`site.webmanifest`:
```json
{
  "name": "{copy.global.site_title}",
  "short_name": "{copy.global.site_title}",
  "icons": [
    { "src": "/android-chrome-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "{palette.chosen.tokens.--bg}",
  "background_color": "{palette.chosen.tokens.--bg}",
  "display": "standalone"
}
```

---

## sitemap.xml

Generated from `sitemap.json.pages[]`. One `<url>` per page, excluding pages where `admin: true` AND `auth_gated: true`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://derrick-pixel.github.io/lumana/</loc>
    <lastmod>2026-04-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://derrick-pixel.github.io/lumana/about.html</loc>
    <lastmod>2026-04-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

`priority`: homepage = 1.0, top-level public pages = 0.8, deep pages = 0.5, admin pages = 0.3 (or excluded if auth-gated).
`changefreq`: homepage = weekly, others = monthly.
`lastmod`: file's git-modified date (ISO).

Regenerate every time `sitemap.json` changes.

---

## robots.txt

Default for all sites:

```
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://derrick-pixel.github.io/<slug>/sitemap.xml
```

Auth-gated admin pages: `Disallow: /admin/` blanket pattern.
WIP / mirrored sites (`dt-public/<slug>/`): apply `noindex` meta + `Disallow: /` in robots.txt. Document in `assets-manifest.json` why.

---

## SEO white-space (sibling-intel pattern)

If `competitors.json` is present, scan their meta descriptions (where available in `competitors[].website_design_notes` or via WebFetch on their URLs). Identify angles competitors don't cover.

Example. 5 of 7 competitors say "AI-powered." None mention "Singapore-built." Your `meta description` should lead with "Singapore-built", because it's a differentiator that competitors aren't claiming.

This is a soft signal — don't force it. But if a clear gap exists, use it.

---

## assets-manifest.json

Per `FIELD-DICTIONARY.md`. Tracks every asset Agent 6 produced:

```json
{
  "og_images": [
    {
      "page_id": "home",
      "path": "/og-image.jpg",
      "width": 1200,
      "height": 630,
      "generated_at": "2026-04-28T08:30:00Z",
      "source_design": "/admin/og-gen.html#home"
    }
  ],
  "favicons": { /* all 8 paths */ },
  "sitemap_xml_path": "/sitemap.xml",
  "robots_txt_path": "/robots.txt",
  "social_meta_validated": {
    "whatsapp": false,
    "twitter_card_validator": false,
    "linkedin_post_inspector": false
  }
}
```

`social_meta_validated` is set to `true` after testing the URL on:
- WhatsApp: paste link in any chat, confirm rich preview.
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

Do at least WhatsApp on every commit that changes branding. Twitter + LinkedIn weekly.

---

## Pitfalls to avoid

- **seo-stale-og** — OG image hasn't been regenerated since the rebrand 2 weeks ago. WhatsApp shows old brand. Severity: high. Fix: trigger list above; check `assets-manifest.og_images[].generated_at` against `git log` of `palette.json` and `copy.json`.
- **seo-missing-favicon-set** — Only `favicon.ico` exists. iOS home screen shows blurry default. Severity: medium. Fix: all 8 favicon files; use the `favicon` mechanic.
- **seo-og-on-homepage-only** — `pricing.html` shared on Slack, preview is generic homepage card. Severity: medium. Fix: every page in sitemap has its own `og.title` and `og.description` (or explicit `inherited: true`).
- **seo-no-canonical** — No `<link rel="canonical">`. Crawler indexes both `/` and `/index.html`. Severity: low. Fix: every page has canonical URL.
- **seo-robots-disallow-everything** — Copied a `Disallow: /` from a WIP site to production. Site removed from Google index. Severity: critical. Fix: distinguish WIP (`Disallow: /`) from production (`Allow: /, Disallow: /admin/`).
- **seo-sitemap-stale** — sitemap.xml lists 4 pages, repo has 6. New pages don't get crawled. Severity: medium. Fix: regenerate sitemap.xml every time `sitemap.json` changes; date-bump `lastmod`.
- **seo-og-illegible-at-mobile** — OG image typography too thin, illegible at 600px wide. Severity: medium. Fix: design at 600px first, then upscale to 1200×630. Test by viewing at 50%.

---

## Deliverable checklist

- [ ] `og-image.jpg` exists at root, 1200×630, ≤200 KB
- [ ] OG image legible at 600px wide (visual check)
- [ ] Per-page OG variants generated where positioning differs (optional)
- [ ] All 8 favicon files exist at root
- [ ] `site.webmanifest` exists with name, icons, theme_color
- [ ] `sitemap.xml` lists all non-auth-gated pages
- [ ] `robots.txt` correct: production allows everything except admin; WIP `Disallow: /`
- [ ] Every page has `<title>`, `<meta name="description">`, `<link rel="canonical">`
- [ ] Every page has full OG tags: type, url, title, description, image, image:width, image:height
- [ ] Every page has Twitter tags: card, title, description, image
- [ ] `<meta name="theme-color">` set from palette
- [ ] Geo meta tags set if `brief.target_geo` is non-default
- [ ] `assets-manifest.json` updated with all paths and timestamps
- [ ] WhatsApp preview tested (paste URL, confirm card renders)
- [ ] Committed and pushed; commit message lists OG-regenerated and any meta drift fixed
