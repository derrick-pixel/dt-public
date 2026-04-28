# meta-tags-generator (per-page meta + sitemap + robots + manifest)

Generates per-page `<head>` meta tags, `sitemap.xml`, `robots.txt`, and `site.webmanifest` from `sitemap.json` + `palette.json` + `copy.json` + `assets-manifest.json`. Owned by Agent 6 (SEO / OG / Asset Engineer).

## What it does

For every page in `sitemap.json.pages[]`:

1. Inject canonical meta tag block into `<head>`:
   - `<title>`, `<meta name="description">`, `<link rel="canonical">`
   - Open Graph: type, url, title, description, image (with width+height), locale
   - Twitter Card: card, title, description, image
   - Geo (if `brief.target_geo` non-default): geo.region, geo.placename
   - `<meta name="theme-color">` from palette `--bg`

2. Generate `sitemap.xml`:
   - One `<url>` per page, excluding `auth_gated: true` pages
   - `priority`: home=1.0, top-level=0.8, deep=0.5, admin=0.3
   - `changefreq`: home=weekly, others=monthly
   - `lastmod`: file's git-modified date (ISO YYYY-MM-DD)

3. Generate `robots.txt`:
   - Production: `User-agent: *\nAllow: /\nDisallow: /admin/`
   - WIP/mirrored: `Disallow: /` + `noindex` meta

4. Generate `site.webmanifest`:
   - PWA manifest with icons (from favicon mechanic), theme_color, background_color

5. Update `assets-manifest.json` with paths and validation timestamps.

## When to plug in

Every project. Required by Agent 6 on the first build AND on every commit that changes branding/title/tagline.

## How to use

Agent 6 reads:
- `brief.json` (live_url, target_geo, domain)
- `sitemap.json` (every page + og.title, og.description, og.image, consumes_intel)
- `palette.json.chosen.tokens` (theme-color, mask-icon color)
- `copy.json.global` (site_title, site_tagline, site_description)
- `design-system.json` (font-preload hints if needed)

…then for each page, injects the canonical meta block (see `snippet.html`). Re-runs on every commit.

The `consumes_intel[]` field on each page lets Agent 6 cross-reference sibling competitor data for SEO white-space (avoid clichés competitors use; lead with differentiator).

## Trade-offs

- **Pro:** One source of truth (sitemap.json) for every meta tag. No drift between pages.
- **Pro:** sitemap.xml + robots.txt regenerated automatically — never out of sync with the page set.
- **Pro:** Twitter Card + WhatsApp + LinkedIn previews "just work" because the structured tags are complete.
- **Con:** First-build is slow (per-page HTML write). Acceptable since it's offline.
- **Con:** Requires Agent 6 to re-run on branding changes — Agent 7 audits this.

## Linked pitfalls

- `seo-og-on-homepage-only` — only homepage has OG; subpages share blank previews. Fix: per-page OG.
- `seo-no-canonical` — no `<link rel="canonical">`. Fix: every page has canonical URL.
- `seo-sitemap-stale` — sitemap.xml has 4 pages, repo has 6. Fix: regenerate every time `sitemap.json` changes.
- `seo-robots-disallow-everything` — copied WIP `Disallow: /` to production. Site removed from index. Fix: distinguish WIP from production.

## Past uses

(new mechanic shipped 2026-04-28)
