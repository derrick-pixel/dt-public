# dt-site-creator — Methods Changelog

Append-only. Every methodology change gets a dated entry. Agent 7 (Pitfall Curator) writes proposals; humans approve and merge here.

---

## v2.1.1 — 2026-04-29 — SEO rigor track (Week 2 of 7) — semantic-html-audit

**Why:** JSON-LD (Week 1) gives crawlers structured signals, but the underlying HTML must also be semantic. 2026-Q1 audit caught: 4/6 sites had multiple h1s, 5/6 sites had decorative images without alt, 6/6 sites missed `loading="lazy"` on below-fold images. Need a systematic, automatable detector.

**Added:**
- `mechanics/semantic-html-audit/` — 5-file mechanic. Pure-JS audit core; two surfaces: browser dev banner (drop-in script tag, activates on localhost or `?audit=1`) and Node CLI (`cli.js` for batch audit across the shipped fleet). Returns per-page `{ score, violations[], stats }`.

**Audit dimensions (8):**
1. Heading hierarchy — exactly one h1, no skipped levels
2. Semantic landmarks — `<main>`, `<header>`, `<nav>`, `<footer>` present
3. Image hygiene — `alt`, `width`, `height` on every `<img>`
4. Internal linking — ≥3 internal links per page, descriptive anchor text
5. Lang attribute — `<html lang="...">` present
6. Title + meta description — present, correct length, not duplicates
7. JSON-LD presence — cross-references schema-jsonld mechanic
8. Content thinness — `<main>` ≥100 words

**Changed:**
- `methodology/07-qa-pitfall-curator.md` — Agent 7 now runs semantic-html-audit BEFORE axe-core. Quality bar: avg score ≥80 across all pages; zero high-severity violations of certain ids. Updated deliverable checklist.

**Added pitfalls (8):**
- `seo-multiple-h1` (high), `seo-heading-skip` (medium), `seo-img-no-alt` (high), `seo-img-no-dimensions` (medium), `seo-no-landmarks` / `seo-no-main` (high), `seo-no-lang-attr` (medium), `seo-thin-content` (medium), `seo-no-internal-links` (low)

**Roadmap progress:**
- Week 1 ✅ — schema-jsonld mechanic + Agent 6 integration (v2.1.0)
- Week 2 ✅ — semantic-html-audit mechanic + Agent 7 integration (this entry)
- Week 3 → next — fleet audit across 20+ shipped sites; produce ranked fix list

---

## v2.2.0 — 2026-04-29 — Post-construction SEO agent track (7 agents)

**Why:** Construction agents (01-07) get a site to "structurally crawler-friendly" — the Week 1-5 SEO rigor track verified this works (fleet 56 → 100 on homepages, 56 → 92 on subpages). But that's just Tier 1 of the 4-tier SEO model. The next 3 tiers (Measurement, Page-level optimization, Off-page authority) need their own competencies, none of which were codified before.

This commit parks 7 SEO agent definitions in a parallel track so they're activatable on demand.

**Added:**
- `methodology/seo/00-overview.md` — 4-tier SEO model, agent registry, sequencing diagram, anti-patterns
- `methodology/seo/01-measurement-setup.md` — Tier 2: Google Search Console + GA4 + Bing Webmaster + sitemap submission + structured data validation
- `methodology/seo/02-google-business-profile.md` — Tier 2.5: SG-focused local SEO (GBP claim, NAP consistency, directory citations, reviews)
- `methodology/seo/03-lighthouse-audit.md` — Tier 1.5: Core Web Vitals (LCP / CLS / INP), image compression, font loading, render-blocking resource elimination
- `methodology/seo/04-title-meta-optimizer.md` — Tier 3: data-driven `<title>` + meta description rewrites using GSC Performance data (≥14 days minimum)
- `methodology/seo/05-internal-linking-strategist.md` — Tier 3: link-graph audit, orphan-page detection, hub-and-spoke architecture, anchor-text quality
- `methodology/seo/06-backlink-authority.md` — Tier 4: 4-lane backlink pipeline (founder profiles / industry directories / editorial PR / partner co-marketing), competitor backlink reconnaissance
- 6 matching invoke templates at `prompts/seo/invoke-*.md`

**Sequencing rules:**
- SEO 01 (Measurement) is always first. Without it, downstream agents (04, 05) are guessing.
- SEO 02 (GBP) runs in parallel with 01 — only for SG service businesses.
- SEO 03 (Lighthouse) runs at launch + after every major asset change.
- SEO 04 + 05 require ≥14 days of GSC data; abort if invoked too early.
- SEO 06 starts quietly within 1-2 weeks of launch; quarterly review thereafter.

**Anti-patterns codified:**
- `seo-measure-without-data` — running optimization agents (04, 05) before measurement (01) has data
- `seo-link-buying` / `seo-pbn-private-blog-networks` / `seo-anchor-text-overoptimization` — backlink penalty risks
- `seo-keyword-stuffing-title` — hurts CTR + ranking
- `seo-immediate-optimization` — invoking title/meta optimizer week 1 (no data)
- `seo-nap-inconsistent` — Name/Address/Phone differs across HTML, JSON-LD, GBP

**Roadmap progress:**
- Week 1 ✅ schema-jsonld mechanic + Agent 6 integration (v2.1.0)
- Week 2 ✅ semantic-html-audit mechanic + Agent 7 integration (v2.1.1)
- Week 3 ✅ fleet audit (v2.1.2)
- Week 4 ✅ fleet fix execution — homepages 56→100 (v2.1.3)
- Week 5 ✅ subpage polish — customer-facing 159 pages, avg 92/100 (v2.1.4)
- Post-construction tier ✅ this entry — 7 SEO agents parked for on-demand activation

**Backward compatibility:** None of these agents change construction behavior. They're additive; activated only when a human invokes them via the `prompts/seo/invoke-*.md` templates.

---

## v2.1.0 — 2026-04-29 — SEO rigor track (Week 1 of 7)

**Why:** 2026-Q1 audit of 6 dt-site-creator-shipped sites (Lumana, Passage, ELIX EOR, XinceAI, Elitez Pulse, Aevum MRI) found **0 of 6 had any structured data**. The single biggest under-shipped SEO win in vanilla-HTML projects is JSON-LD. Schema-rich pages outrank schema-less peers by 20–35%, and LLM-era search (ChatGPT, Claude, Perplexity citations) parses JSON-LD natively. We must close this gap systematically before more sites ship.

**Scope:** This is Week 1 of a 7-week SEO rigor track. Subsequent weeks add `semantic-html-audit` (Week 2), site-wide audit + ranked fix list (Week 3), top-5-site fixes (Week 4), and `content-publishing` archetype pilot via Astro (Weeks 5–7).

**Added:**
- `mechanics/schema-jsonld/` — 4-file mechanic with builder functions for 8 schema types: Organization, WebSite (with optional SearchAction), BreadcrumbList, FAQPage, Product, LocalBusiness (and subtypes), Article, Person.

**Changed:**
- `methodology/06-seo-og-asset-engineer.md` — Agent 6 now owns JSON-LD blocks. Added required-schemas-per-archetype matrix, regeneration triggers, validation flow (Google + Schema.org + Bing), and 4 critical rules (never hand-write, exactly-one-Organization, FAQPage-only-if-primary, LocalBusiness-needs-real-data).
- Agent 6 deliverable checklist gained 7 new schema-related items.

**Added pitfalls (4):**
- `seo-no-jsonld` (high) — site has zero structured data
- `seo-jsonld-stale` (medium) — schema lists old phone/address/price
- `seo-jsonld-multiple-organization` (high) — two Organization blocks confuses Google
- `seo-jsonld-broken-syntax` (critical) — trailing comma / smart-quote / unescaped quote disables ALL rich snippets

**Roadmap (next weeks):**
- Week 2: `semantic-html-audit` mechanic + Agent 7 integration
- Week 3: SEO audit across 20+ shipped sites; produce ranked fix list
- Week 4: Fix top 5 sites by SEO score
- Weeks 5–7: Pilot `content-publishing` archetype using Astro for content-heavy sites

**Backward compatibility:** Existing v2 archetype prompts continue to work. JSON-LD is added at Agent 6 stage, which already runs every commit.

---

## v2.0.0 — 2026-04-28 — Paradigm shift to 7-agent orchestration

**Why:** competitor-intel-template (sibling repo) introduced 9-agent specialist architecture with handoff contracts, methodology-as-code, and curator loop. Old monolithic `masterprompt.txt` (v1.0, 2026-04-09) couldn't scale to that level of rigour. Adopt the same paradigm here, scoped to construction.

**Added:**
- `AGENT.md` — paradigm doc, 7-agent dispatch graph, sibling-handoff explanation
- `FIELD-DICTIONARY.md` — canonical JSON schemas for all 7 owned files + 4 consumed sibling files
- `methodology/00-overview.md` — paradigm + dispatch graph (handbook-format)
- `methodology/01-brief-archetype-router.md` — Agent 1 handbook
- `methodology/02-palette-brand-generator.md` — Agent 2 handbook
- `methodology/03-information-architect.md` — Agent 3 handbook
- `methodology/04-stitch-ui-composer.md` — Agent 4 handbook
- `methodology/05-copy-microcopy-writer.md` — Agent 5 handbook
- `methodology/06-seo-og-asset-engineer.md` — Agent 6 handbook
- `methodology/07-qa-pitfall-curator.md` — Agent 7 handbook (the meta-agent)
- `prompts/invoke-*.md` — 7 dispatch templates (one per agent)
- `prompts/consume-sibling-intel.md` — how to wire sibling JSON into construction
- Per-archetype `agents.md` and `data-contract.md` (10 files: 5 archetypes × 2)

**Changed:**
- `masterprompt.txt` slimmed from 585 lines to ~120 lines. Now an orchestrator that points to AGENT.md.
- Each archetype `prompt.md` becomes a 3-phase script (optional sibling fork → 7-agent chain → commit/push).
- `mechanics/` library: 6 new construction mechanics added, 2 refactored, 1 deprecated.

**Deprecated:**
- `mechanics/competitor-pricing-intel/` — work moved upstream to sibling repo. Replaced with stub README pointing to sibling + new `intel-consumer` mechanic.

**New mechanics:**
- `intel-consumer` — bridge: loads sibling JSON, exposes typed JS module
- `palette-tryout` — codified colors.html with 5 variants + Copy CSS button
- `stitch-bridge` — standard prompt + flow for Agent 4 driving Stitch
- `copy-deck` — copy.json schema + DOM-binding helper
- `meta-tags-generator` — per-page OG/Twitter/canonical/sitemap.xml/robots.txt from sitemap.json
- `a11y-axe-runner` — browser-side axe-core integration for Agent 7
- `mobile-test-harness` — single-page iframe tester at iPhone/Pixel/iPad widths

**Refactored:**
- `og-thumbnail` — tightened contract (filename, dims, regen-on-branding-change rule, design-at-600px-legibility)
- `chartjs-dashboard` — added lazy-init via IntersectionObserver, `Chart.afterRender` wait, flex-collapse fix as canonical pattern

**Added pitfall categories:**
- `brief-*` — scope drift, archetype mis-pick, missed sibling-fork decision
- `palette-*` — chose colors.html palette without dogfooding on actual cards
- `ia-*` — admin nav inconsistent across public/admin, OG missing on subpages
- `copy-*` — headlines written without reading sibling personas, generic CTAs
- `seo-*` — sitemap.xml missing, og-image stale on >1 commit, favicon set incomplete
- `qa-*` — axe violations shipped, mobile not phone-tested, pitfall not curated back

**Backward compatibility:** Old prompts ("use dt-site-creator to build me X") still work — they route through Agent 1 (Brief & Archetype Router), which picks the archetype and dispatches the rest.

**Migration path:** Existing in-flight projects continue with the v1 monolith if already started. New projects use v2 as of 2026-04-28.

---

## v1.0.0 — 2026-04-09 — Initial monolithic masterprompt

585-line `masterprompt.txt` with universal rules (Sections A–G). 5 archetypes with 5-file contract. 11 mechanics. ~40 pitfalls.

Retired 2026-04-28 in favour of v2 orchestrator architecture. Old playbook content migrated into archetype-specific CLAUDE.md files (verbatim) and slim orchestrator at root.
