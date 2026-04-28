# schema-jsonld — example use

This mechanic is new (2026-04-29). No production project has shipped it yet — the v2 SEO rigor track is rolling it out across the dt-site-creator shipped fleet starting Q2 2026.

## Reference implementation: Lumana (planned)

Lumana is the canonical first integration because:
- It's a SG service business → exercises Organization + LocalBusiness (ProfessionalService).
- It has 4 pages → exercises BreadcrumbList per page.
- Its FAQ section has 8 entries → exercises FAQPage.
- It has a founder page → exercises Person.

### `assets/js/site-data.js` (excerpt)

```js
export const brief = {
  project_name: "Lumana",
  live_url: "https://derrick-pixel.github.io/lumana/",
  project_description: "Aged-care ambient monitoring — reducing falls by 40% in care homes.",
  target_geo: ["SG"]
};

export const copy = {
  global: {
    site_title: "Lumana",
    site_tagline: "Ambient monitoring for aged-care, without the cameras."
  }
};

export const sitemap = {
  live_url: "https://derrick-pixel.github.io/lumana/",
  pages: [
    { id: "home",    path: "",                nav_label: "Home" },
    { id: "product", path: "product.html",    nav_label: "How it works" },
    { id: "pricing", path: "pricing.html",    nav_label: "Pricing" },
    { id: "founder", path: "founder.html",    nav_label: "Founder" }
  ]
};

export const business = {
  subtype: "ProfessionalService",
  telephone: "+65-XXXX-XXXX",
  streetAddress: "—",
  addressLocality: "Singapore",
  postalCode: "—",
  addressCountry: "SG",
  priceRange: "$$$",
  openingHours: "Mo-Fr 09:00-18:00",
  image: "https://derrick-pixel.github.io/lumana/og-image.jpg"
};

export const faqs = [
  { q: "Does Lumana use cameras?", a: "No. The system is camera-free; it uses ambient mmWave radar and audio-classification." },
  { q: "What does it monitor?",     a: "Falls, gait changes, and bathroom incidents." }
  // ... 6 more
];

export const founder = {
  name: "Phuong Nguyen",
  url: "https://derrick-pixel.github.io/lumana/founder.html",
  jobTitle: "Founder, Lumana",
  image: "https://derrick-pixel.github.io/lumana/founder.jpg",
  worksFor: "Lumana",
  sameAs: ["https://www.linkedin.com/in/phuong-nguyen-lumana/"]
};
```

### Per-page injection

**`index.html`** — homepage gets Organization + WebSite + LocalBusiness:

```html
<script type="module">
  import { renderJsonLd, buildOrganizationSchema, buildWebSiteSchema, buildLocalBusinessSchema } from '/assets/js/schema-jsonld.js';
  import { brief, copy, business } from '/assets/js/site-data.js';

  renderJsonLd([
    buildOrganizationSchema(brief, copy, { logo: brief.live_url + 'og-image.jpg' }),
    buildWebSiteSchema(brief, copy),
    buildLocalBusinessSchema(brief, copy, business)
  ]);
</script>
```

**`pricing.html`** — adds BreadcrumbList:

```html
<script type="module">
  import { renderJsonLd, buildOrganizationSchema, buildBreadcrumbSchema } from '/assets/js/schema-jsonld.js';
  import { brief, copy, sitemap } from '/assets/js/site-data.js';

  renderJsonLd([
    buildOrganizationSchema(brief, copy),
    buildBreadcrumbSchema(sitemap, 'pricing')
  ]);
</script>
```

**`product.html`** — adds FAQPage (the FAQ accordion is on this page):

```html
<script type="module">
  import { renderJsonLd, buildOrganizationSchema, buildBreadcrumbSchema, buildFaqPageSchema } from '/assets/js/schema-jsonld.js';
  import { brief, copy, sitemap, faqs } from '/assets/js/site-data.js';

  renderJsonLd([
    buildOrganizationSchema(brief, copy),
    buildBreadcrumbSchema(sitemap, 'product'),
    buildFaqPageSchema(faqs)
  ]);
</script>
```

**`founder.html`** — adds Person:

```html
<script type="module">
  import { renderJsonLd, buildOrganizationSchema, buildBreadcrumbSchema, buildPersonSchema } from '/assets/js/schema-jsonld.js';
  import { brief, copy, sitemap, founder } from '/assets/js/site-data.js';

  renderJsonLd([
    buildOrganizationSchema(brief, copy),
    buildBreadcrumbSchema(sitemap, 'founder'),
    buildPersonSchema(founder)
  ]);
</script>
```

## Verification

After deploying, paste each live URL into:
1. https://search.google.com/test/rich-results
2. https://validator.schema.org/

Expected eligible rich results:
- `index.html` → Organization + LocalBusiness panel
- `product.html` → FAQ collapsed snippet
- `pricing.html` → BreadcrumbList
- `founder.html` → Person knowledge-card

## Other planned integrations (Q2 2026)

| Site | Schemas needed | Rationale |
|---|---|---|
| ELIX EOR | Organization + WebSite + Product (the $30/mo plan) + FAQPage + LocalBusiness | Transactional; clear price, clear country |
| Passage | Organization + WebSite + Product (3 casket SKUs) + FAQPage + LocalBusiness | Transactional + funeral-services LocalBusiness |
| XinceAI | Organization + WebSite + ProfessionalService + FAQPage | SG service business |
| Aevum MRI | Organization + WebSite + MedicalBusiness + FAQPage | Medical subtype unlocks Maps panel |
| Ecotech | Organization + WebSite + ProfessionalService | 37-yr legacy company; LocalBusiness is critical for legitimacy |
| derrickteo.com | Person + WebSite | Portfolio = person-led |
| Elitez Pulse | Organization + WebSite + Service + FAQPage | Bundled retainer service |
| Elitez Security | Organization + WebSite + ProfessionalService + Service | SSIA-awarded security agency |

These will be backfilled as part of the SEO rigor track audit.
