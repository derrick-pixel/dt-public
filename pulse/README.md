# Elitez Pulse

Marketing services by Elitez Group — public site, ROI Diagnostic, admin portal, proposal PDF generator.

**Live:** https://derrick-pixel.github.io/elitez-pulse/

## Stack

- Vanilla HTML / CSS / ES2022 JS modules. No framework.
- Hosted on GitHub Pages from `main` root.
- Self-hosted Inter fonts + Python-generated favicon + OG.
- CDN libraries: Chart.js, html2canvas, jsPDF.
- All dynamic state in browser `localStorage` under `ep_*` keys.

See `docs/superpowers/specs/2026-04-22-elitez-pulse-design.md` for the design spec and `docs/superpowers/plans/2026-04-22-elitez-pulse.md` for the 28-task implementation plan.

## Local dev

```bash
python3 -m http.server 8765
# → open http://localhost:8765
```

## Public pages

| URL | Purpose |
|---|---|
| `/` | Homepage — hero, positioning, 5 capabilities, ROI diagnostic CTA |
| `/services.html` | 5 capabilities deep-dive |
| `/pricing.html` | Entry / Core / Premium retainer tiers + add-ons |
| `/work.html` | Case studies stub (Q3 2026) + internal Elitez brand showcase |
| `/about.html` | Geographic Arbitrage Engine story + Elitez Group tie-in |
| `/contact.html` | Lead form → writes to `localStorage.ep_leads` |
| `/diagnostic.html` | 7-question ROI diagnostic + scored report + PDF export |

## Admin portal

`/admin/` — no password for v1. Linked from the public nav as "Admin". All lead data lives in browser `localStorage`, never leaves your device unless you export.

Seven tabs:

1. **Leads & Pipeline** — captured leads from contact + diagnostic, drawer editor with stage tracking + notes + CSV export.
2. **Commission Calculator** — tiered + upsell bonus + monthly bonus calc. Tier table per source deck.
3. **Packages** — inline editor for Entry/Core/Premium + add-ons; save to browser, download JSON to commit.
4. **Competitor Intel** — 12 SG/MY competitors seeded; per-row battle-card drawer.
5. **Insights** — mental models + Diagnostic benchmark editor + scoring-weights reference.
6. **Templates** — swap between 4 visual variants (Sticker Zine / Risograph / Bubblegum / Neon).
7. **Settings** — company info + full localStorage backup export + clear-leads.

`/admin/proposal.html?leadId=<id>` — 5-page proposal PDF generator with live preview.

## Tests

```bash
node --test tests/*.test.mjs
```

Tested: diagnostic scoring (6 cases) + commission calculator (9 cases).

## Content editing

- **Public copy:** edit HTML directly.
- **Packages / competitors / insights / settings:** use the admin tab's inline editor → *Download JSON* → paste into `data/*.json` in the repo when permanent.
- **Theme swap:** admin Templates tab → *Set active*. Refresh any public page to see the new theme.

## Regenerate assets

```bash
python3 scripts/generate-favicon.py   # 9 favicon PNGs + favicon.ico
python3 scripts/generate-og.py        # 1200x630 og-image.png
python3 scripts/linkcheck.py          # verify internal links
```

## CI

- **linkcheck** on every push touching `*.html` or `scripts/linkcheck.py`
- **tests** on every push touching `js/**` or `tests/**`

## License

All rights reserved — Elitez Group.
