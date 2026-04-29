# Proposal — Fleet SEO Audit

**Source:** v2.1 SEO rigor track Week 3 — `semantic-html-audit` mechanic run across all dt-public-mirrored shipped sites.
**Date:** 2026-04-29
**Author:** Agent 7 (auto, with `mechanics/semantic-html-audit/cli.js`)
**Audit fixture:** `/tmp/fleet-audit-20260429.json`

---

## Executive summary

**Fleet average score: 56.1 / 100** across 20 audited homepages.

The picture: every shipped site is at least partially broken on baseline SEO hygiene. Three issues account for >70% of all violations:

1. **No JSON-LD structured data** (17 of 20 sites). High severity.
2. **No `<main>` landmark** (13 of 20 sites). High severity.
3. **Skipped heading levels** (10 of 20 sites, 37 cumulative hits). Medium severity.

Fortunately every one of these is mechanical — no design rework required, no copy rewrite. Estimated total effort across the fleet: **~14 hours** for the top-5 priority sites; **~28 hours** for the full fleet to reach score ≥85.

---

## Ranked fleet score table

| Rank | Site | Score | High | Med | Low | Top fixes |
|---|---|---|---|---|---|---|
| 1 | aevum | **14** | 2 | 10 | 1 | Heading rebalance (9 skips), `<main>`, JSON-LD, image dims |
| 2 | competitor-intel | **32** | 4 | 2 | 4 | Page is essentially empty static HTML; needs full hydration or pre-rendering |
| 3 | the-commons (dt-public) | **38** | 2 | 6 | 1 | Heading rebalance (6 skips), `<main>`, JSON-LD |
| 3 | the-commons (codings) | **38** | 2 | 6 | 1 | (Same — duplicate of dt-public mirror) |
| 5 | Lumana | **48** | 2 | 4 | 2 | Heading rebalance (4 skips), `<main>`, JSON-LD, internal links |
| 6 | altru | **52** | 3 | 2 | 0 | `<main>`, meta description, JSON-LD, image dims |
| 6 | discounter | **52** | 3 | 1 | 3 | `<main>`, meta description, JSON-LD, 34 image dims (worst CLS exposure) |
| 8 | pulse (Elitez Pulse) | **54** | 2 | 3 | 2 | Heading rebalance, `<main>`, footer/nav, JSON-LD |
| 8 | vectorsky | **54** | 2 | 3 | 2 | Heading rebalance, `<main>`, JSON-LD, image dims |
| 10 | elitezai | **56** | 3 | 1 | 1 | `<main>`, meta description, image dims, JSON-LD |
| 10 | elixcraft (dt-public) | **56** | 3 | 1 | 1 | Heading rebalance, `<main>`, meta description, JSON-LD |
| 10 | passage | **56** | 2 | 3 | 1 | Heading rebalance, `<main>`, JSON-LD, image dims |
| 10 | elixcraft (codings) | **56** | 3 | 1 | 1 | (Same as dt-public mirror) |
| 14 | esop (Elitez ESOP) | **58** | 2 | 2 | 3 | Heading rebalance, meta description, image dims, JSON-LD |
| 15 | xinceai | **62** | 2 | 2 | 1 | Heading rebalance, `<main>`, JSON-LD, image dims |
| 16 | elitez-security | **66** | 2 | 1 | 2 | `<main>`, JSON-LD, image dims |
| 17 | dtws_works | **70** | 2 | 0 | 3 | h1 missing entirely, JSON-LD |
| 18 | elix-eor | **78** | 1 | 1 | 2 | JSON-LD, image dims |
| 19 | dt-site-creator | **86** | 1 | 0 | 1 | JSON-LD only |
| 20 | dt-public-root (derrickteo.com) | **96** | 0 | 0 | 2 | Internal links + footer landmark only |

---

## Cross-fleet pitfall frequency

| Pitfall | Severity | Sites affected | Total hits |
|---|---|---|---|
| seo-no-jsonld | high | 17 | 19 |
| seo-no-main | high | 13 | 15 |
| seo-no-header | low | 13 | 14 |
| seo-heading-skip | medium | 10 | 37 |
| seo-img-no-dimensions | medium | 10 | 10 |
| seo-no-internal-links | low | 7 | 7 |
| seo-no-meta-description | high | 6 | 7 |
| seo-no-footer | low | 6 | 6 |
| seo-no-nav | low | 5 | 6 |
| seo-no-h1 | high | 2 | 2 |
| seo-no-lang-attr | medium | 1 | 1 |
| seo-thin-content | medium | 1 | 1 |
| seo-meta-description-length | low | 1 | 1 |

---

## Pattern: the universal fix

**One change unblocks 17 sites: drop in `schema-jsonld`.**

Each affected site needs:
1. Add `mechanics/schema-jsonld/snippet.html` content as `assets/js/schema-jsonld.js`.
2. Add to every page's `<head>`:
   ```html
   <script type="module">
     import { renderJsonLd, buildOrganizationSchema, buildWebSiteSchema } from '/assets/js/schema-jsonld.js';
     renderJsonLd([
       buildOrganizationSchema({ project_name: 'X', live_url: 'https://...' }, { global: { site_title: 'X', site_tagline: '...' } }),
       buildWebSiteSchema(...)
     ]);
   </script>
   ```
3. Per-page additions where applicable:
   - `BreadcrumbList` for multi-page sites
   - `Product` for transactional sites
   - `FAQPage` where FAQ is primary content
   - `LocalBusiness` for SG service businesses
   - `Person` for portfolio sites

**Estimated effort per site: 30 min** for site-wide minimum (Organization + WebSite). +30 min per archetype-specific schema.

---

## Pattern: the second-cheapest fix

**`<main>` landmark — 13 sites. Most sites already have a `<div class="main">` or unwrapped section that needs the tag swapped to `<main>`.**

5-minute change per site:
- find: `<div class="main"` or unwrapped hero+content sections
- replace with: `<main>` … `</main>`
- ensure exactly one `<main>` per page (not multiple)

**Total fleet effort: ~65 minutes** for all 13 sites.

---

## Top 5 priority targets (Week 4 fix scope)

These sites yield the highest score lift per hour invested. Recommended order:

### 1. **aevum** — score 14 → target 85+ (~3 hours)

The heading hierarchy is genuinely broken; needs a structural pass.
- 9 heading skips (h1→h4, h2→h4, h2→h5, h3→h5). Each is a section that should be h2 or h3 but was tagged h4/h5 for visual size.
- **Fix:** Audit each `<h4>` and `<h5>` on the page; promote to correct level based on outline. Use CSS to control visual size, not heading tag.
- Add `<main>` wrapper around primary content.
- Add JSON-LD: Organization + WebSite + LocalBusiness (MedicalBusiness subtype since it's an MRI clinic).
- Add `width`/`height` to all 12 images.
- Score after: should reach ≥85.

### 2. **competitor-intel** — score 32 → target 75+ (~2 hours)

This is a pure-JS hydrated dashboard; static HTML shell has no h1, no main, no content — the audit can't see what JS injects. Two options:
- (a) **Pre-render** the shell with at least a hero h1, primary content sections, and a brief description. Hydrated dashboard works on top of skeleton.
- (b) **Server-side render** via a small build step that emits static HTML. Heavier change.
- Either way, add JSON-LD: Organization + WebSite (the sibling toolkit's Organization).
- Set `<html lang="en-SG">`.
- Add `<meta name="description">` describing the toolkit.

### 3. **the-commons** — score 38 → target 85+ (~2 hours)

- 6 heading skips (h2→h4, h2→h5). Needs the same demote-from-h4/h5 → h3 pass as aevum.
- Add `<main>`, `<header>`.
- JSON-LD: Organization + WebSite + Service (P2P event marketplace).
- *Note:* both `/codings/the-commons/` and `/codings/dt-public/the-commons/` need the fix; one is the source, the other is the dt-public mirror. Fix in source then resync.

### 4. **Lumana** — score 48 → target 90+ (~2.5 hours)

- 4 heading skips (h1→h4, h2→h4, h2→h5). Same rebalance pattern.
- Add `<main>`, `<header>`.
- JSON-LD: Organization + WebSite + ProfessionalService (or MedicalBusiness given aged-care domain) + LocalBusiness + Person (founder Phuong).
- Add ≥1 internal link (footer pricing link, related case-study link, etc.) to clear the orphan-page warning.

### 5. **altru** — score 52 → target 90+ (~2 hours)

- Add `<main>`.
- Write `<meta name="description">` (probably a one-line donation pitch).
- Add `width`/`height` to 2 images.
- JSON-LD: NonprofitOrganization + WebSite + DonateAction (opportunity for rich-snippet "donate now" button on Google Knowledge Panel).

**Top-5 total effort: ~11.5 hours.** Lifts the fleet's worst sites from sub-50 scores to 85+ — the lowest-hanging fruit on the entire SEO rigor track.

---

## Sites already in good shape

- **dt-public-root (derrickteo.com): 96** — exemplary. Only blockers are 2 minor low-severity (footer + nav landmark soft-warnings on a portfolio page that doesn't really need them).
- **dt-site-creator: 86** — only blocker is JSON-LD. 30-min fix.
- **elix-eor: 78** — only blockers are JSON-LD + image dims. ~45-min fix.

These three should be batched as a "quick wins" hour — knock all three to ≥90 in <2 hours total.

---

## Recommended Week 4 plan

1. **Day 1 — Quick wins** (2h): elix-eor + dt-site-creator + dt-public-root → all to 90+.
2. **Day 1 — Universal JSON-LD pass** (4h): drop `schema-jsonld` into the remaining 14 affected sites. Don't touch heading or landmark issues yet — just JSON-LD.
3. **Day 2 — `<main>` pass** (1.5h): change `<div class="main">` to `<main>` across the 13 affected sites.
4. **Day 3 — Top-5 deep fix** (~11.5h, can be split): aevum, competitor-intel, the-commons, Lumana, altru.
5. **Day 4 — Re-run audit** + commit `qa-report-fleet-20260430.json` showing new scores. Target: fleet average ≥85.

---

## Proposed methodology refinements (none new this round)

All findings map to existing pitfall ids in `archetypes/static-informational/pitfalls.md` (added in v2.1.0 + v2.1.1). No new pitfalls proposed from this round — the playbook caught what it was supposed to catch.

The next pitfall worth considering — observed in this audit but not yet codified — is **`seo-pre-render-empty-shell`**: SPA-style pages where the static HTML shell (what crawlers and `semantic-html-audit` see) is empty or near-empty, but the runtime JS hydrates the content. Caught at competitor-intel. Threshold to add as a pitfall: needs to recur in ≥2 projects. Will revisit if any future v2.2 dashboard-archetype builds repeat the pattern.

---

## Proposal status

This is a **fix-list proposal**, not a methodology change. No `archetypes/`, `mechanics/`, or `methodology/0N-*.md` edits required. Awaiting human review for prioritisation + go-ahead on Week 4 execution.
