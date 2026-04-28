# Transactional — Mechanic Fit

Human-readable summary. Authoritative source: each mechanic's `meta.json.fits["transactional"]`.

| Mechanic | Fit | Notes |
|---|---|---|
| og-social-meta | core | Mandatory |
| meta-tags-generator | core | Per-page OG/Twitter/canonical/sitemap.xml (v2) |
| schema-jsonld | core | Organization + WebSite + Product + BreadcrumbList; FAQPage where relevant (v2.1) |
| paynow-qr | core | Default SG payment flow |
| localstorage-state | core | Cart / draft / session state |
| wizard-form | core | Multi-step checkout / submission |
| admin-auth-gate | core | Real admin, not just analytics |
| multi-page-scaffold | core | Landing + cart + checkout + thank-you |
| admin-insights-panel | core | Shops need pricing/positioning strategy documented |
| dashboard-admin-shell | core | Order + customer + inventory management app |
| pdf-pipeline | optional | Receipts, invoices, extraction |
| canvas-hero | optional | If brand calls for it |
| chartjs-dashboard | optional | Admin analytics view |
| formspree-form | optional | Lightweight enquiry/contact form alongside real backend |
| design-variant-switcher | optional | For brand exploration before locking in |
| streamlit-analytics-scaffold | rare | Use dashboard-analytics archetype instead |
