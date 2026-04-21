# Mechanics — The Lego Brick Library

Cross-archetype reusable building blocks. Each mechanic folder has a 5-file contract:

1. `meta.json` — dashboard-readable metadata (fits, dependencies, past uses, linked pitfalls)
2. `snippet.html` — self-contained paste-in HTML+CSS+JS block
3. `README.md` — what / when / trade-offs / how to use
4. `example-use.md` — past-project implementation excerpt
5. `preview.jpg` — 400×300 thumbnail for dashboard cards

## The 11 v1 Mechanics

| # | ID | Summary | Core for |
|---|---|---|---|
| 1 | [paynow-qr](./paynow-qr/) | EMVCo SG PayNow QR | Transactional |
| 2 | [localstorage-state](./localstorage-state/) | Versioned persistence wrapper | Game, Simulator, Dashboard, Transactional |
| 3 | [admin-auth-gate](./admin-auth-gate/) | sessionStorage password gate | Transactional, Dashboard |
| 4 | [canvas-hero](./canvas-hero/) | Animated canvas background | Game (core); Static (optional) |
| 5 | [chartjs-dashboard](./chartjs-dashboard/) | Chart.js + last-updated pattern | Dashboard |
| 6 | [pdf-pipeline](./pdf-pipeline/) | jsPDF + html2canvas report gen | (optional across several) |
| 7 | [wizard-form](./wizard-form/) | Multi-step form with progress | Transactional, Simulator, Game |
| 8 | [multi-page-scaffold](./multi-page-scaffold/) | Shared nav/footer + current-page highlight | Static, Transactional |
| 9 | [og-social-meta](./og-social-meta/) | OG + Twitter Card meta tags | All (mandatory) |
| 10 | [og-thumbnail](./og-thumbnail/) | 1200×630 image design + generation (WhatsApp/Twitter/LinkedIn) | All (mandatory) |
| 11 | [favicon](./favicon/) | Complete favicon set for browser tabs, iOS/Android home screens | All (mandatory) |

## How Claude uses mechanics

When an archetype's `mechanic-fit.md` marks a mechanic as `core`, or the user ticks it on the dashboard:
1. Read the mechanic's `README.md` for when / how.
2. Copy-adapt `snippet.html` into the project.
3. Check `linked_pitfalls` in `meta.json` and proactively avoid them.

## Adding a new mechanic

1. Create `mechanics/<slug>/` folder.
2. Author all 5 files.
3. Update every archetype's `mechanic-fit.md` to declare its fit.
4. The dashboard auto-detects on next load — no code change needed.
