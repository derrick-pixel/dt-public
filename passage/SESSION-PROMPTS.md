# Passage — Session Prompts (Verbatim)

Captured from the 7-analytics-agent refresh session. Useful as a re-run reference.

## Working assumptions
- **Canonical repo**: `/Users/derrickteo/codings/casket/` → `github.com/derrick-pixel/Passage.git`
- **Source of truth for positioning**: `docs/SITE-INTEL.md` (extracted verbatim from public pages — Passage is a casket-only DTC brand, NOT a digital bereavement platform).
- **Visual style**: light theme `--primary:#32332d` / `--gold:#725b3f` / `--surface:#fcf9f5`, serif headings (Georgia / Times). Do NOT clone Elitez Security's dark theme.
- **DO NOT** dispatch agents pointing at `/Users/derrickteo/codings/dt-public/passage/` — that is a mirror that gets wiped by `~/codings/dt-public/sync-wip.sh` on its cron loop.

## User prompts (verbatim, in order)

1. *"i want to continue work on competitor-intel-template"*
2. *"i want you to rerun the full 7 agents for Elitez Security. Note that this time, you learn more about the actual Elitez Security services from this deck "Elitez Security 150423 R00.pptx.pdf" in the elitez-security folder. proceed, push and commit to elitez-security github"*
3. *"ok, now for a long command, i plan to get you to do the same for next 5 sites at 1 go, you can take as long as you need, i will keep my device on. is that doable?"*
4. *"ok, then let's take 1 step at a time. now proceed to do for Passage."*
5. *"use existing information in the passage repo. you may proceed."*
6. *"done? if not, please continue"*
7. *"some info are not shown yet. rectify"* (with screenshot of `competitor-analytics.html` showing em-dash KPIs and a blank radar canvas)
8. */compact and save prompts, restart terminal*

## 7-agent refresh — Passage adaptation

For a re-run, dispatch sub-agents in parallel pointing at `/Users/derrickteo/codings/casket/` with `docs/SITE-INTEL.md` as the canonical brief. Each agent writes to a clearly-scoped output file:

| # | Agent | Reads | Writes |
|---|-------|-------|--------|
| 1 | competitor-research | `docs/SITE-INTEL.md` + public web | `data/competitors.json` |
| 2 | market-intel + pricing-strategy | `docs/SITE-INTEL.md` + `data/competitors.json` | `admin/insights.html` |
| 3 | whitespace-blue-ocean | `docs/SITE-INTEL.md` + `data/competitors.json` | `data/whitespace-competitors.json`, `data/whitespace-framework.json`, `admin/whitespace.html` (CANVAS_DIMS / SEGMENTS / NEEDS / NICHES inline) |
| 4 | website-design-auditor | live URL `https://derrick-pixel.github.io/Passage/` + N peer URLs | `data/design-audit.json`, `admin/design-audit.html` |
| 5 | data-viz-engineer | all four JSONs | `admin/competitor-analytics.html` |
| 6 | report-generator | all four JSONs + 5 admin pages | `admin/report.html` |

(Agent 7 = curator/QA pass that harmonises atlas-nav, fixes link drift, verifies data wiring.)

## Common gotchas (from this session)

- **Script ordering**: every analytics page has TWO `<script>` blocks. Block #1 has `showDashboard()` + auth, Block #2 has the data fetcher (`initAnalytics`/`initAtlas`/`initAudit`). Calling `showDashboard()` at the end of Block #1 hits a `ReferenceError` because Block #2 hasn't been parsed yet. **Fix pattern**: defer the auto-show call with `DOMContentLoaded` (see commit `e4dc681`).
- **Atlas-nav drift**: parallel agents independently add `Insights` / `Design Audit` / `Report` links and step on each other. Curator pass must harmonise to canonical order: `Orders | White Space | Competitors | Insights | Design Audit | Report | Site | Sign out`.
- **Old link names**: a stale `competitors.html` link sometimes lingers — the canonical file is `competitor-analytics.html`. Grep before pushing.
- **Login overlay**: every admin page has a hashed-credential login overlay BUT the auth gate is currently bypassed (`showDashboard()` called directly). To re-enable, remove the auto-call.
- **`admin/index.html`** uses `admin-topbar`, NOT atlas-nav — it's an Operations dashboard with subcontractor + order tabs. Keep its layout distinct.
- **JSON-key contract**: `whitespace.html` has `CANVAS_DIMS` / `SEGMENTS` / `NEEDS` / `NICHES` / `scoreCompetitor` / `ourScore` inline — these MUST mirror the keys in `data/whitespace-framework.json`. If the framework changes, refresh both together or the canvas renders gibberish.

## Commits worth knowing

- `669b589` (elitez-security) — full 7-agent refresh grounded in deck PDF
- `f41a1bd` (Passage) — full 7-agent refresh grounded in `docs/SITE-INTEL.md`
- `e4dc681` (Passage) — fix: showDashboard race condition leaving admin KPIs blank
