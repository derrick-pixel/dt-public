# Mechanics — The Lego Brick Library

Cross-archetype reusable building blocks. Each mechanic folder has a 5-file contract:

1. `meta.json` — dashboard-readable metadata (fits, dependencies, past uses, linked pitfalls)
2. `snippet.html` — self-contained paste-in HTML+CSS+JS block
3. `README.md` — what / when / trade-offs / how to use
4. `example-use.md` — past-project implementation excerpt
5. `preview.jpg` — 400×300 thumbnail for dashboard cards

## v1 mechanics (10 active + 1 deprecated)

| # | ID | Summary | Core for |
|---|---|---|---|
| 1 | [paynow-qr](./paynow-qr/) | EMVCo SG PayNow QR | Transactional |
| 2 | [localstorage-state](./localstorage-state/) | Versioned persistence wrapper | Game, Simulator, Dashboard, Transactional |
| 3 | [admin-auth-gate](./admin-auth-gate/) | sessionStorage password gate | Transactional, Dashboard |
| 4 | [canvas-hero](./canvas-hero/) | Animated canvas background | Game (core); Static (optional) |
| 5 | [chartjs-dashboard](./chartjs-dashboard/) | Chart.js + flex-fix + last-updated + lazy-init *(refactored v2)* | Dashboard |
| 6 | [pdf-pipeline](./pdf-pipeline/) | jsPDF + html2canvas report gen | (optional across several) |
| 7 | [wizard-form](./wizard-form/) | Multi-step form with progress | Transactional, Simulator, Game |
| 8 | [multi-page-scaffold](./multi-page-scaffold/) | Shared nav/footer + current-page highlight | Static, Transactional |
| 9 | [og-social-meta](./og-social-meta/) | OG + Twitter Card meta tags | All (mandatory) |
| 10 | [og-thumbnail](./og-thumbnail/) | 1200×630 image design + regeneration triggers *(refactored v2)* | All (mandatory) |
| 11 | [favicon](./favicon/) | Complete favicon set | All (mandatory) |
| 12 | ~~[competitor-pricing-intel](./competitor-pricing-intel/)~~ | **DEPRECATED 2026-04-28** — replaced by sibling repo `competitor-intel-template` + `intel-consumer` | (none) |

## v2 mechanics (added 2026-04-28)

7 new mechanics aligned with the 7-agent orchestration architecture:

| # | ID | Summary | Owned by |
|---|---|---|---|
| 13 | [intel-consumer](./intel-consumer/) | Bridge: loads sibling JSON from `/data/intel/`, exposes typed JS module + `h()` DOM helper | Agent 4 wires it; Agents 3, 5, 6 read it |
| 14 | [palette-tryout](./palette-tryout/) | colors.html generator — 5 diametric variants + Copy CSS button | Agent 2 |
| 15 | [stitch-bridge](./stitch-bridge/) | Standardised Stitch flow: project + design system + screens + apply | Agent 4 |
| 16 | [copy-deck](./copy-deck/) | copy.json schema + DOM-binding helper (no hardcoded strings in HTML) | Agent 5 + Agent 4 |
| 17 | [meta-tags-generator](./meta-tags-generator/) | Per-page meta + sitemap.xml + robots.txt + site.webmanifest | Agent 6 |
| 18 | [a11y-axe-runner](./a11y-axe-runner/) | Browser-side axe-core integration (dev-mode banner + Agent 7 batch) | Agent 7 |
| 19 | [mobile-test-harness](./mobile-test-harness/) | iframe spot-check at iPhone / Pixel / iPad widths | Agent 7 |

## v2.1 mechanics (added 2026-04-29 — SEO rigor track)

| # | ID | Summary | Owned by |
|---|---|---|---|
| 20 | [schema-jsonld](./schema-jsonld/) | Schema.org JSON-LD: Organization, WebSite, BreadcrumbList, FAQPage, Product, LocalBusiness, Article, Person | Agent 6 |

See `../METHODS.md` for the full v2 changelog.

## How Claude uses mechanics

When an archetype's `agents.md` lists a mechanic, or the user ticks it on the dashboard:
1. Read the mechanic's `README.md` for when / how.
2. Copy-adapt `snippet.html` into the project.
3. Check `linked_pitfalls` in `meta.json` and proactively avoid them.

## Adding a new mechanic

1. Create `mechanics/<slug>/` folder.
2. Author all 5 files (meta.json, README.md, snippet.html, example-use.md, preview.jpg).
3. Update every archetype's `agents.md` and `mechanic-fit.md` to declare its fit.
4. Add to the index above.
5. The dashboard auto-detects on next load — no code change needed.
