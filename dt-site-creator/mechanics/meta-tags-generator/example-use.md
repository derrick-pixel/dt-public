# meta-tags-generator — Example usage

## Pattern: filled meta block (homepage)

```html
<title>Lumana — Quiet, calm aged-care monitoring.</title>
<meta name="description" content="Ambient sensors. No cameras. No wearables. Built for Singapore homes." />
<link rel="canonical" href="https://derrick-pixel.github.io/lumana/" />

<meta property="og:type" content="website" />
<meta property="og:url" content="https://derrick-pixel.github.io/lumana/" />
<meta property="og:title" content="Quiet, calm aged-care monitoring" />
<meta property="og:description" content="Ambient sensors. No cameras. No wearables. Built for Singapore homes." />
<meta property="og:image" content="https://derrick-pixel.github.io/lumana/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="en_SG" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Quiet, calm aged-care monitoring" />
<meta name="twitter:description" content="Ambient sensors. No cameras. No wearables. Built for Singapore homes." />
<meta name="twitter:image" content="https://derrick-pixel.github.io/lumana/og-image.jpg" />

<meta name="geo.region" content="SG" />
<meta name="geo.placename" content="Singapore" />

<meta name="theme-color" content="#FFF9F3" />

<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#dc2626" />
<link rel="manifest" href="/site.webmanifest" />
```

## Pattern: sitemap.xml

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
  <url>
    <loc>https://derrick-pixel.github.io/lumana/admin.html</loc>
    <lastmod>2026-04-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

(admin pages excluded if `auth_gated: true`.)

## Pattern: production robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://derrick-pixel.github.io/lumana/sitemap.xml
```

## Pattern: WIP / mirrored robots.txt

```
User-agent: *
Disallow: /
```

Plus `<meta name="robots" content="noindex, nofollow">` injected into every `<head>`.

## Pattern: site.webmanifest

```json
{
  "name": "Lumana",
  "short_name": "Lumana",
  "icons": [
    { "src": "/android-chrome-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#FFF9F3",
  "background_color": "#FFF9F3",
  "display": "standalone"
}
```

## Sourced from

(new mechanic shipped 2026-04-28; codifies patterns from past projects' Agent 6 work)
