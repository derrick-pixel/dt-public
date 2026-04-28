# schema-jsonld — Schema.org structured data via JSON-LD

The single most under-shipped SEO win in vanilla-HTML projects. Adds machine-readable JSON to every page so Google, Bing, and LLM crawlers can construct a typed knowledge-graph entry for your site instead of guessing from prose.

## What it does

Drops `<script type="application/ld+json">` blocks into the `<head>` of every page. Each block describes a **typed entity** (Organization, WebSite, FAQPage, Product, etc.) using the Schema.org vocabulary. Crawlers parse this directly — no NLP, no guesswork.

This is what produces:
- **Sitelinks search box** in Google results (WebSite + SearchAction)
- **Rich snippets**: FAQ accordion, product price + rating, breadcrumb trail, knowledge-panel
- **LLM citation accuracy**: ChatGPT/Claude/Perplexity that ground in your site quote your structured fields verbatim instead of paraphrasing.

## When to plug in

**Every page of every site, full stop.** Schema-rich pages outrank schema-less peers by 20–35% in our 2026-Q1 audit. The only excuse for skipping is admin-only pages behind auth (those don't get crawled).

Specific schema types per archetype:

| Archetype | Required schemas | Optional |
|---|---|---|
| static-informational | Organization, WebSite, BreadcrumbList | FAQPage, LocalBusiness, Person |
| transactional | Organization, WebSite, BreadcrumbList, Product OR Service | FAQPage, AggregateRating |
| simulator-educational | Organization, WebSite, BreadcrumbList, LearningResource | Article (per lesson) |
| game | Organization, WebSite, VideoGame | none |
| dashboard-analytics | Organization, WebSite | none (admin gated, low SEO value) |

## Trade-offs

- **Pro:** ~15 minutes of work per site. Free SEO. No build pipeline.
- **Pro:** Forward-compatible with LLM-era search (LLMs parse JSON-LD natively).
- **Con:** Schema gets stale fast — change company address, change phone, change pricing → must regenerate. Agent 6 enforces a `schema_validated_at` field in `assets-manifest.json` and re-runs the validator on commits that touch `brief.json`, `copy.json`, or `sitemap.json`.
- **Con:** Wrong schema is worse than no schema. Google's Rich Results Test will email you "issues" if you misuse types — fix immediately or remove. Validator: https://search.google.com/test/rich-results

---

## The 8 schema types we ship

### 1. Organization (every site)

Identifies the company / brand behind the site. **One per site, on every page.**

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Lumana",
  "url": "https://lumana.example/",
  "logo": "https://lumana.example/og-image.jpg",
  "description": "Aged-care ambient monitoring — reducing falls by 40% in care homes.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "SG",
    "addressLocality": "Singapore"
  },
  "sameAs": [
    "https://www.linkedin.com/company/lumana",
    "https://twitter.com/lumana"
  ]
}
```

### 2. WebSite (every site, includes SearchAction)

Tells Google your site is a site (vs an article reprint), and optionally registers a sitelinks search box.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Lumana",
  "url": "https://lumana.example/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://lumana.example/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

Drop `potentialAction` if no on-site search exists.

### 3. BreadcrumbList (multi-page sites)

Per-page. Tells crawler the path: Home → Pricing → Enterprise.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://lumana.example/" },
    { "@type": "ListItem", "position": 2, "name": "Pricing", "item": "https://lumana.example/pricing.html" }
  ]
}
```

### 4. FAQPage (any page with FAQ accordion)

Eligible for Google's collapsed FAQ rich snippet. **Only use on pages where the FAQ is the primary content** — putting FAQPage on a marketing page with one footer FAQ is a violation.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does Lumana monitor?",
      "acceptedAnswer": { "@type": "Answer", "text": "Falls, gait changes, and bathroom incidents — without cameras or wearables." }
    }
  ]
}
```

### 5. Product (transactional commerce)

For products with a clear price. Each variant = own Product entity OR aggregate via `offers`.

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "ELIX EOR — Singapore Micro Business",
  "description": "Employer of record for SG companies <10 staff. CardUp miles, full payroll compliance.",
  "image": "https://elix-eor.example/og-image.jpg",
  "brand": { "@type": "Brand", "name": "ELIX" },
  "offers": {
    "@type": "Offer",
    "price": "30.00",
    "priceCurrency": "SGD",
    "availability": "https://schema.org/InStock",
    "url": "https://elix-eor.example/pricing.html"
  }
}
```

### 6. LocalBusiness (Singapore-targeted services)

Subtype of Organization. Use when the company has a physical address visitors can transact with. **Required** for any SG service business — populates Google Maps panel.

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Ecotech Engineering",
  "image": "https://ecotech.example/og-image.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "10 Anson Road, #14-06",
    "addressLocality": "Singapore",
    "postalCode": "079903",
    "addressCountry": "SG"
  },
  "telephone": "+65-6XXX-XXXX",
  "url": "https://ecotech.example/",
  "priceRange": "$$",
  "openingHours": "Mo-Fr 09:00-18:00"
}
```

Use the most specific subtype Schema.org offers: `LegalService`, `MedicalBusiness`, `FinancialService`, `ProfessionalService`, `HomeAndConstructionBusiness`, etc.

### 7. Article (blog / content posts)

For pieces of journalism, analysis, or long-form content. Eligible for Google News-style rich snippets.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Why Singapore aged-care needs ambient monitoring",
  "image": ["https://lumana.example/og-blog-1.jpg"],
  "datePublished": "2026-04-15T10:00:00+08:00",
  "dateModified": "2026-04-15T10:00:00+08:00",
  "author": { "@type": "Person", "name": "Phuong Nguyen" },
  "publisher": {
    "@type": "Organization",
    "name": "Lumana",
    "logo": { "@type": "ImageObject", "url": "https://lumana.example/favicon.svg" }
  }
}
```

### 8. Person (portfolio / personal sites)

For derrickteo.com-style sites where the human IS the brand.

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Derrick Teo",
  "url": "https://derrickteo.com/",
  "image": "https://derrickteo.com/og-image.jpg",
  "jobTitle": "Founder, Elitez Group",
  "worksFor": { "@type": "Organization", "name": "Elitez Group" },
  "sameAs": [
    "https://www.linkedin.com/in/derrickteo/",
    "https://github.com/derrick-pixel"
  ]
}
```

---

## How the snippet works

`snippet.html` exposes a tiny JS module — `schemaJsonLd.js` — with two responsibilities:

1. **`renderJsonLd(schemas)`** — given an array of schema objects, injects them as `<script type="application/ld+json">` into `<head>`. Idempotent: safe to call multiple times; replaces existing blocks tagged with `data-schema-id`.
2. **`buildOrganizationSchema(brief, copy)`** etc. — pure builder functions that take typed inputs and return a schema object. Called by Agent 6 during page hydration.

Drop `snippet.html` content into `assets/js/schema-jsonld.js` and import per page:

```html
<script type="module">
  import { renderJsonLd, buildOrganizationSchema, buildWebSiteSchema, buildBreadcrumbSchema } from '/assets/js/schema-jsonld.js';
  import { brief, copy, sitemap } from '/assets/js/site-data.js';

  renderJsonLd([
    buildOrganizationSchema(brief, copy),
    buildWebSiteSchema(brief, copy),
    buildBreadcrumbSchema(sitemap, 'pricing')
  ]);
</script>
```

Or — for static-only sites — paste the raw JSON-LD into each page's `<head>` at build time (Agent 6 does this).

---

## Validation

After every commit that touches schema:

1. **Google Rich Results Test** — https://search.google.com/test/rich-results — paste live URL. Confirms the schema parses, lists what rich-result types are eligible, flags errors.
2. **Schema.org Validator** — https://validator.schema.org/ — broader validation; catches off-vocabulary properties.
3. **Bing Markup Validator** — https://www.bing.com/webmaster/tools/markup-validator — Bing parses slightly differently; sanity-check.

Update `assets-manifest.json.schema_validated_at` to ISO timestamp when all three pass clean.

---

## Common mistakes (the 4 linked pitfalls)

- **`seo-no-jsonld`** — Site has zero structured data. Severity: high. The default state of every vanilla-HTML site we shipped pre-2026-04. Fix: ship at minimum Organization + WebSite + per-page BreadcrumbList.
- **`seo-jsonld-stale`** — Schema lists old phone, old address, old price. Severity: medium. Schema is the FIRST thing to drift after a content update because no human visually checks it. Fix: regenerate on every commit that touches `brief.json`, `copy.json`, or product `pricing` fields.
- **`seo-jsonld-multiple-organization`** — Two different Organization blocks (one with logo, one without; or one with old name). Severity: high. Confuses Google enough to drop ALL rich snippets. Fix: exactly ONE Organization per page.
- **`seo-jsonld-broken-syntax`** — Trailing comma, smart-quotes, unescaped quotes in description. Severity: critical (rich results disabled site-wide). Fix: never hand-write JSON-LD; always serialize via `JSON.stringify(obj, null, 2)`.

---

## Sourced from

- Schema.org official vocabulary: https://schema.org/docs/schemas.html
- Google Search Central — Structured data documentation: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- 2026-Q1 audit of dt-site-creator-shipped sites (Lumana, Passage, ELIX EOR, XinceAI, Elitez Pulse, Aevum MRI) — found 0/6 sites had any structured data. This mechanic is the systematic fix.
