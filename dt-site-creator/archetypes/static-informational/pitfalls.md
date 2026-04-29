# Static Informational — Pitfalls

Scar tissue from past sites. Dashboard parses this file's YAML block.

```yaml
- id: universal-no-push
  title: "The site that went live but nobody could see"
  severity: high
  phase: shipping
  story: "Edited the site locally, demoed in browser, didn't git push. GitHub Pages kept serving the old version. Spent 30 minutes debugging before realizing."
  source: "Universal (every site)"
  fix: |
    After every change: git add . && git commit -m "..." && git push
    Refresh the live URL (not localhost) to verify.
  lesson: "GitHub Pages serves from the remote, not your disk. Local = invisible."
  mechanic: null

- id: universal-dark-default
  title: "Another dark-cyan site"
  severity: medium
  phase: planning
  story: "Started with the dark-cyan template by default. Shipped a site that looked identical to the previous 3. Client couldn't distinguish their brand from competitors."
  source: "Universal (CLAUDE.md §2)"
  fix: |
    Generate colors.html with 5 distinct palettes before writing main site.
    Never reuse a previous site's exact accent color.
  lesson: "Every brand needs its own personality. dt-site-creator is a floor, not a ceiling."
  mechanic: null

- id: universal-stale-og
  title: "The WhatsApp preview showing last week's site"
  severity: medium
  phase: shipping
  story: "Redesigned the landing page, shipped, shared on WhatsApp. The thumbnail showed the previous accent color and old tagline. Looked broken."
  source: "Universal (CLAUDE.md §14.2)"
  fix: |
    Regenerate og-image.jpg (1200x630) whenever branding, title, or tagline changes.
    Test the preview by pasting URL into WhatsApp before announcing.
  lesson: "OG images cache aggressively. Always regenerate when visuals change."
  mechanic: og-social-meta

- id: universal-no-competitors
  title: "The generic copy"
  severity: medium
  phase: planning
  story: "Skipped competitor research, wrote copy from imagination. Site read like a template. No design rationale to defend when client pushed back."
  source: "Universal (CLAUDE.md §14.3)"
  fix: |
    Research 30+ sites in the domain.
    Ship admin.html with the analysis.
    Let the competitor analysis drive copy + feature decisions.
  lesson: "You cannot design better than the best if you haven't seen the best."
  mechanic: null

- id: static-palette-reuse
  title: "Every Elitez site looks the same"
  severity: medium
  phase: planning
  story: "Shipped elitez-security, elitezaviation, vectorsky back-to-back with near-identical dark + cyan / amber palettes. Client couldn't tell them apart."
  source: "Elitez brand family, Apr 2026"
  fix: |
    Enforce unique palette per site via colors.html tryout.
    Track the last 5 site palettes; avoid adjacent hues.
  lesson: "Brand distinction is a product decision, not a taste decision."
  mechanic: null

- id: static-mega-index
  title: "The 4000-line index.html"
  severity: low
  phase: building
  story: "Jammed hero + features + pricing + FAQ + footer into one index.html. SEO suffered, no per-page meta, no clear URL structure for linking."
  source: "Multiple early sites"
  fix: |
    When content exceeds 3 content bands, split into multi-page (features.html, pricing.html, faq.html).
    Keep index.html focused on hero + primary CTA + top 3 sells.
  lesson: "Multi-page is a feature, not a complication."
  mechanic: multi-page-scaffold

- id: static-premature-admin-lock
  title: "The admin panel I couldn't demo"
  severity: low
  phase: shipping
  story: "Password-gated admin.html before dogfooding. Lost my own password. Had to redeploy to access my competitor analysis."
  source: "casket admin, Apr 2026"
  fix: |
    Keep admin panels password-free until first paying client.
    Use sessionStorage auth only when multiple people access the site.
  lesson: "Premature security is user-hostile security — to yourself."
  mechanic: admin-auth-gate

- id: static-mobile-untested
  title: "The hamburger that didn't open"
  severity: high
  phase: shipping
  story: "Tested everything at 1440px. Shipped. Opened on phone. Nav rendered, hamburger icon visible, tap did nothing — JS listener attached to the wrong element ID after a refactor."
  source: "elitez-security, Apr 2026"
  fix: |
    Always test mobile (<=768px) in actual browser devtools before commit.
    Add a console.log in the menu toggle during dev; remove before ship.
  lesson: "Mobile is not 'desktop scaled down'. It's its own test surface."
  mechanic: null

- id: static-anim-overload
  title: "The seizure-inducing scroll"
  severity: low
  phase: building
  story: "Added fade-in on every element. Page felt like an animated slideshow. Client asked to 'remove the jittery effect'."
  source: "Early portfolio site"
  fix: |
    Animate only headline blocks and stat rows. Body copy stays static.
    Scroll threshold 0.12 with 0.6s transition — no faster.
  lesson: "Animation is a seasoning, not a main course."
  mechanic: null

# ─── v2 categories (added 2026-04-28 with 7-agent paradigm) ──────────────────

- id: brief-archetype-mispick
  title: "Picked dashboard-analytics for an internal static tool"
  severity: medium
  phase: planning
  story: "Brief said 'internal team needs to see KPIs'. Routed to dashboard-analytics. But there was no live data feed — just a static page with last-quarter numbers. Wasted Next.js + base-ui scaffold."
  source: "Internal Elitez tool, Apr 2026"
  fix: |
    Re-read scoping Q4. "no" means no live data layer. Static-informational with admin auth fits this case.
    Agent 1 (Brief & Archetype Router) follows the table strictly — overrides need a stated reason.
  lesson: "Having data ≠ having a data layer. KPIs in a JSON file with last-quarter numbers is static."
  mechanic: null

- id: brief-no-clarifications
  title: "Wrote brief.json from a 1-line brief"
  severity: high
  phase: planning
  story: "Brief: 'build a site for X.' Wrote brief.json by inferring all 4 scoping answers. Picked wrong archetype. Downstream chain rebuilt twice."
  source: "Universal — Agent 1 methodology"
  fix: |
    Agent 1 asks up to 3 clarifying questions before writing brief.json if scoping answers can't be derived from the brief.
    Don't infer — ask.
  lesson: "Three minutes of questions saves three hours of rework."
  mechanic: null

- id: brief-sibling-fork-missed
  title: "Static-informational site shipped without sibling fork"
  severity: medium
  phase: planning
  story: "Built a marketing site. admin.html ended up with platitudes ('we serve our clients well') because no competitive research had been done. Client noticed at review."
  source: "Universal — Agent 1 methodology"
  fix: |
    Default to recommending sibling fork (competitor-intel-template) for static-informational and transactional archetypes.
    Skip only if Derrick explicitly opts out.
  lesson: "admin pages are the value prop for marketing sites. Don't ship them empty."
  mechanic: intel-consumer

- id: palette-five-cyans
  title: "Five dark cyan variants because it's a tech site"
  severity: medium
  phase: planning
  story: "Generated colors.html with 5 dark cyan/blue palettes. All on the same Mode + Temperature pole. Human had to ask for a re-roll."
  source: "Universal — Agent 2 methodology"
  fix: |
    Walk the 5 diametric axes (Mode, Temperature, Saturation, Hue family, Texture).
    Variants must span ≥4 of them.
  lesson: "Diametric means visually distinct, not 5 shades of the same colour."
  mechanic: palette-tryout

- id: palette-no-card-hi
  title: "Hover states invisible because --card-hi == --card"
  severity: low
  phase: building
  story: "Picked a palette without realising --card-hi was identical to --card. Card hover lift had no visual change."
  source: "Universal — Agent 2 methodology"
  fix: |
    Require all 12 canonical tokens.
    --card-hi must differ from --card by ≥4% lightness.
  lesson: "Tokens that mean different things must look different."
  mechanic: palette-tryout

- id: palette-bad-contrast
  title: "Body text fails WCAG AA"
  severity: high
  phase: planning
  story: "Picked --muted too close to --bg. axe scan flagged --muted body copy at 3.2:1, fails AA (need 4.5:1)."
  source: "Universal — Agent 2 + Agent 7"
  fix: |
    Contrast check at palette-pick time:
    --text vs --bg ≥ 7:1 (AAA body)
    --muted vs --bg ≥ 4.5:1 (AA body)
  lesson: "Accessibility starts at palette selection, not at QA."
  mechanic: palette-tryout

- id: ia-admin-nav-mismatch
  title: "Admin nav says 'Pricing', public nav says 'Insights'"
  severity: medium
  phase: building
  story: "Same page (admin-insights.html) had two different labels in two navs. Stakeholder clicked back-and-forth confused. Took 20 minutes to spot."
  source: "Universal — Agent 3 methodology"
  fix: |
    Use sitemap.json.pages[].nav_label consistently across both public and admin navs.
    Admin nav re-uses the same label as public nav for the same page.
  lesson: "Nav labels are a contract — pick once, apply everywhere."
  mechanic: null

- id: ia-og-missing-on-subpage
  title: "/pricing.html shared on Slack, blank preview"
  severity: high
  phase: shipping
  story: "Homepage had full OG. Pricing page had nothing. Shared the pricing URL — Slack showed bare URL with no card."
  source: "Universal — Agent 3 + Agent 6"
  fix: |
    Every page in sitemap.json.pages[] has og.title (≤60 chars) AND og.description (≤160 chars).
    Or explicit og.inherited: true to use homepage defaults.
    Agent 6 audits at every commit.
  lesson: "Per-page OG is not optional in 2026."
  mechanic: meta-tags-generator

- id: copy-hardcoded-in-html
  title: "Hero headline hardcoded in index.html"
  severity: medium
  phase: building
  story: "Wrote 'Welcome to Lumana' directly in HTML. Agent 5 had it as a different headline in copy.json. Two sources of truth, drifted."
  source: "Universal — Agent 4 + Agent 5"
  fix: |
    Every string >12 chars rendered on the site lives in copy.json with a key.
    HTML uses data-copy='path.to.key' to bind.
    Agent 7 grep-audits HTML for any literal headline.
  lesson: "Copy in HTML is technical debt the moment you write it."
  mechanic: copy-deck

- id: copy-no-persona-voice
  title: "Generic 'AI-powered analytics' hero"
  severity: high
  phase: building
  story: "Wrote hero subhead from imagination instead of reading sibling personas. Result: didn't speak to the buyer. Bounce rate confirmed."
  source: "Universal — Agent 5 methodology"
  fix: |
    If pricing-strategy.json (sibling) exists, identify the dominant persona (highest WTP).
    Hero subhead names that persona's top pain in their language.
  lesson: "Speak to a real persona, not 'a SaaS buyer'."
  mechanic: copy-deck

- id: copy-cta-vague
  title: "'Get started' with no destination"
  severity: low
  phase: building
  story: "Every CTA was 'Get started', 'Learn more', 'Click here'. Funnel conversion was 30% lower than competitor ranges."
  source: "Universal — Agent 5 methodology"
  fix: |
    Every CTA names the destination action: 'Book a home visit', 'Buy a starter kit', 'Try the simulator'.
    No 'Click here'.
  lesson: "Vague CTAs are a tax on conversion."
  mechanic: null

- id: seo-stale-og
  title: "OG image two weeks behind the rebrand"
  severity: high
  phase: shipping
  story: "Site rebranded last sprint. og-image.jpg never regenerated. WhatsApp showed old logo + old tagline."
  source: "Universal — Agent 6 methodology"
  fix: |
    Agent 6 checks the regeneration trigger list on every commit:
    - project_description changed
    - site_title or site_tagline changed
    - palette.chosen changed
    - >7 days since last gen + visible site copy changed
    Regenerate when triggered. Update assets-manifest.og_images[].generated_at.
  lesson: "OG image is a published asset, not a build artefact."
  mechanic: og-thumbnail

- id: seo-missing-favicon-set
  title: "Only favicon.ico — iOS home screen blurry"
  severity: medium
  phase: shipping
  story: "Shipped with one .ico file. iOS user added to home screen. Icon was blurry default. Looked unfinished."
  source: "Universal — Agent 6 methodology"
  fix: |
    Ship all 8 favicon files via the favicon mechanic.
    Plus site.webmanifest with theme_color.
  lesson: "Modern sites need 8 favicons. The .ico era ended in 2014."
  mechanic: favicon

- id: seo-robots-disallow-everything
  title: "Copied WIP Disallow:/ to production. Site removed from Google index."
  severity: critical
  phase: shipping
  story: "WIP/mirror sites use Disallow: / to stay out of indexes. Copied that file when scaffolding production. Google deindexed the site within 48h."
  source: "Universal — Agent 6 methodology"
  fix: |
    Production robots.txt: Allow: / + Disallow: /admin/.
    WIP robots.txt: Disallow: / (separate file, separate origin).
    Agent 6 confirms which mode the site is in via brief.live_url and explicit constraints.
  lesson: "Robots.txt is one of the most dangerous files in the repo. Treat with care."
  mechanic: meta-tags-generator

- id: qa-skipped-axe
  title: "Site shipped with 12 critical axe violations"
  severity: critical
  phase: shipping
  story: "Skipped accessibility scan because 'site looks fine'. Client's accessibility audit found 12 critical violations. Emergency rework."
  source: "Universal — Agent 7 methodology"
  fix: |
    axe scan is non-optional before pitfall curation begins.
    0 critical, 0 serious — otherwise QA gate fails and site doesn't ship.
  lesson: "Looks fine ≠ accessible. Use axe."
  mechanic: a11y-axe-runner

- id: qa-mobile-not-tested
  title: "Hamburger broken on actual phone"
  severity: high
  phase: shipping
  story: "Tested in DevTools' phone emulator, looked fine. Real iPhone — hamburger didn't open. Touchstart vs click bug."
  source: "Universal — Agent 7 methodology"
  fix: |
    Test on real device OR via mobile-test-harness mechanic at 3 phone widths.
    Don't trust DevTools alone.
  lesson: "Touch is a different input model. Test it on a touch device."
  mechanic: mobile-test-harness

- id: qa-direct-edit
  title: "Agent 7 edited pitfalls.md directly, bypassed review"
  severity: high
  phase: live
  story: "Agent 7 wrote new pitfall directly into archetypes/static-informational/pitfalls.md. Skipped the proposals workflow. Human couldn't review or veto."
  source: "Universal — Agent 7 methodology"
  fix: |
    Agent 7 writes proposals to methodology/proposals/<date>-<project>.md ONLY.
    Human reviews, ✅-marks, and merges. METHODS.md gets a version bump entry.
  lesson: "The curator proposes; the human disposes."
  mechanic: null

- id: intel-stale-fork
  title: "Sibling intel forked 14 months ago"
  severity: medium
  phase: live
  story: "Reused last year's competitor-intel-template fork for a new project. Pricing landscape had shifted. NBA cards showed prices that no longer existed."
  source: "Universal — sibling consumption"
  fix: |
    Refresh sibling intel:
    - Competitor pricing: every 6 months
    - Policies: every 12 months
    - TAM/SAM/SOM: every 12 months unless macro shock
    - Personas: every 18 months
    Agent 7 flags stale intel as qa-stale-intel proposal.
  lesson: "Intel ages. Plan refreshes."
  mechanic: intel-consumer

- id: intel-partial-files
  title: "Only competitors.json present, admin-insights renders empty"
  severity: medium
  phase: building
  story: "Forked sibling but only Agent 1 of sibling completed. competitors.json was there; market-intelligence + pricing-strategy + whitespace JSONs missing. admin-insights.html had three blank sections."
  source: "Universal — sibling consumption"
  fix: |
    intel-consumer mechanic surfaces missing files as warnings.
    Agent 4 either:
    - renders fallback ('Coming soon — analysis in progress'), OR
    - omits the dependent admin sections entirely from sitemap.json
    Don't ship blank sections.
  lesson: "Partial intel = explicit fallback, not empty divs."
  mechanic: intel-consumer

# ── SEO rigor track (added 2026-04-29) ─────────────────────────────────────

- id: seo-no-jsonld
  title: "Site has zero structured data — invisible to LLM crawlers"
  severity: high
  phase: shipping
  story: "2026-Q1 audit of 6 dt-site-creator-shipped sites found 0 of 6 had any JSON-LD. Result: ChatGPT/Claude/Perplexity ground-truth queries about Lumana, Passage, ELIX EOR returned generic competitor descriptions instead of the actual site copy. Google rich-result eligibility was zero across the board."
  source: "Universal — 2026-04-29 SEO audit"
  fix: |
    Use the schema-jsonld mechanic. Minimum:
    - Organization on every page
    - WebSite on every page (with optional SearchAction)
    - Per-page BreadcrumbList for multi-page sites
    Add archetype-specific schemas: Product (transactional), FAQPage (where FAQ is primary content), LocalBusiness (SG service biz), Person (portfolio).
    Validate with Google Rich Results Test before declaring done.
  lesson: "JSON-LD is the cheapest 20–35% SEO uplift available. No build pipeline. ~15 min per site."
  mechanic: schema-jsonld

- id: seo-jsonld-stale
  title: "Schema lists last quarter's phone, address, and price"
  severity: medium
  phase: live
  story: "Site changed pricing from $30/mo to $35/mo in copy.json. Hero, pricing page, and OG image all updated. JSON-LD Product offers.price still said 30.00. Customers reading Google Knowledge Panel saw $30 and complained when checkout showed $35."
  source: "Anticipated — schema is invisible to humans, drifts first"
  fix: |
    Agent 6 runs every commit. Add schema regeneration to its trigger list:
    - brief.json changed → regenerate Organization
    - copy.json.global changed → regenerate Organization + WebSite
    - product price changed → regenerate Product
    - FAQ entry changed → regenerate FAQPage
    - sitemap.json.pages changed → regenerate BreadcrumbList on affected pages
    Track schema_validated_at in assets-manifest.json.
  lesson: "What humans don't see is what drifts first. Automate the regen trigger."
  mechanic: schema-jsonld

- id: seo-jsonld-multiple-organization
  title: "Two Organization blocks confuses Google into dropping all rich snippets"
  severity: high
  phase: shipping
  story: "Site had Organization in <head> from schema-jsonld mechanic AND a leftover Organization block in a CMS template footer with old branding (no logo, old name). Google's Rich Results Test flagged 'multiple Organization entities' as a warning. ALL rich snippets disabled site-wide for 2 weeks until detected."
  source: "Anticipated — common when migrating sites between toolkits"
  fix: |
    Exactly ONE Organization per page. Before shipping schema-jsonld:
    - grep the codebase for application/ld+json — make sure only the new mechanic emits it
    - check footer templates, theme partials, third-party widgets
    - if a CMS or template forces an Organization block, override it via the mechanic's clearJsonLd() then renderJsonLd()
    Run Google Rich Results Test on every commit that touches schema.
  lesson: "Two Organizations = zero rich snippets. Audit before adding."
  mechanic: schema-jsonld

- id: seo-jsonld-broken-syntax
  title: "Trailing comma disables every rich snippet site-wide"
  severity: critical
  phase: shipping
  story: "Hand-typed JSON-LD in an early draft had a trailing comma in the offers object. JSON.parse failed silently in Google's crawler. Site-wide rich-result eligibility dropped to zero. Took 3 days for Google to recrawl after fix."
  source: "Anticipated — every hand-typed JSON-LD has this risk"
  fix: |
    Never hand-write JSON-LD. Always use schema-jsonld builder functions + JSON.stringify(obj, null, 2).
    The mechanic's renderJsonLd() does this automatically.
    Validate with https://validator.schema.org/ on any commit that touches schema.
  lesson: "JSON syntax errors are silent killers. Serialize, never hand-type."
  mechanic: schema-jsonld

# ── SEO rigor track Week 2 — semantic HTML hygiene (added 2026-04-29) ──

- id: seo-multiple-h1
  title: "Two h1s on the same page; crawler picks at random"
  severity: high
  phase: building
  story: "Hero section had h1 'Lumana — Aged-care monitoring'. Below, 'How it works' section also used h1 because the dev wanted that bigger size. Google Rich Results Test flagged 'multiple top-level headings'; the section h1 outranked the brand h1 in some queries."
  source: "Anticipated — common when devs use heading tags for visual size"
  fix: |
    Exactly one <h1> per page. Use CSS to size other headings, not h1.
    Run semantic-html-audit (browser banner or CLI) — flags this automatically.
  lesson: "Heading level is structure, not size. Style with CSS."
  mechanic: semantic-html-audit

- id: seo-heading-skip
  title: "h1 → h3 with no h2 between"
  severity: medium
  phase: building
  story: "Page had h1 hero, then h3 section titles because the dev preferred the smaller size. Screen readers announced an outline that skipped h2. Google's crawler treated h3s as detached fragments instead of nested sections."
  source: "Anticipated — pattern across multiple sites"
  fix: |
    Heading levels must descend without skipping: h1 → h2 → h3.
    To make h2 visually smaller, use CSS (font-size, font-weight) — don't drop to h3.
    semantic-html-audit flags level skips automatically.
  lesson: "Outline structure is for crawlers + screen readers, not visual taste."
  mechanic: semantic-html-audit

- id: seo-img-no-alt
  title: "Decorative images without alt; SEO + a11y double loss"
  severity: high
  phase: building
  story: "Marketing site had 12 product images. None had alt attributes. Screen readers said 'image, image, image…'. Google Image search couldn't index them. axe flagged each one as critical."
  source: "Anticipated — pervasive across vanilla-HTML sites"
  fix: |
    Every <img> needs alt. Two cases:
    - Informational image: alt='descriptive sentence'
    - Decorative image: alt='' (empty string is correct, not omitted)
    semantic-html-audit + a11y-axe-runner both catch this.
  lesson: "alt='' is a deliberate decision; missing alt is a defect."
  mechanic: semantic-html-audit

- id: seo-img-no-dimensions
  title: "<img> without width/height triggers Cumulative Layout Shift"
  severity: medium
  phase: building
  story: "Hero image loaded after page render → text below jumped 280px. Lighthouse CLS score dropped from 0.05 to 0.42 (anything above 0.25 is poor). Core Web Vital fail. Google Search Console flagged the page."
  source: "Anticipated — common when devs let CSS aspect-ratio handle it"
  fix: |
    Always add width + height attributes to <img> (even with CSS sizing).
    The browser uses them to reserve space before image loads — prevents jump.
    Optional but recommended: loading='lazy' for below-fold images.
  lesson: "Reserved space prevents jump. Width + height are not optional."
  mechanic: semantic-html-audit

- id: seo-no-landmarks
  title: "Page wrapped in <div>s only; crawler can't find primary content"
  severity: high
  phase: building
  story: "Site built with <div class='nav'>, <div class='main'>, <div class='footer'>. Worked visually. Lighthouse SEO score 72. Google's reading-order extraction merged nav text with hero text in 'About this site' summaries."
  source: "Anticipated — legacy of pre-HTML5 div-itis"
  fix: |
    Use HTML5 landmarks: <header>, <nav>, <main>, <footer>.
    Optional inside <main>: <article>, <section>, <aside>.
    semantic-html-audit checks for presence of all four.
  lesson: "Landmarks are the cheapest SEO upgrade. ~10 minutes per site."
  mechanic: semantic-html-audit

- id: seo-no-lang-attr
  title: "<html> without lang attribute; locale inference broken"
  severity: medium
  phase: building
  story: "SG-targeted site shipped with <html> (no lang). Google indexed for global English instead of en-SG. Bing flagged in markup validator. Screen readers used default voice instead of region voice."
  source: "Anticipated — easy to forget"
  fix: |
    <html lang='en'> at minimum. <html lang='en-SG'> for SG-targeted.
    Other valid: en-GB, zh-Hant, ja, etc.
    semantic-html-audit catches missing lang attribute.
  lesson: "One attribute, multiple downstream effects: SEO, screen readers, region targeting."
  mechanic: semantic-html-audit

- id: seo-thin-content
  title: "Landing page with <100 words triggers 'thin content' penalty"
  severity: medium
  phase: building
  story: "Hero-only landing page: 38 words of copy. Google's quality classifier flagged as thin. Page de-ranked in 4 weeks. Took 2 months to recover after content expansion."
  source: "Anticipated — common with 'less is more' design instincts"
  fix: |
    Pages need ≥100 words in <main>; ≥300 ideal for content pages.
    Marketing landings can be terse but should still cross 100 — about 2 short paragraphs + section copy.
    semantic-html-audit reports word count per page.
  lesson: "Visual minimalism ≠ content minimalism. Crawlers count words."
  mechanic: semantic-html-audit

- id: seo-no-internal-links
  title: "Orphan page: zero links to other site pages"
  severity: low
  phase: building
  story: "Pricing page had only external links (Stripe, calendar booking). Crawler couldn't traverse from /pricing back into the rest of the site. PageRank dead-end."
  source: "Anticipated — pages built in isolation"
  fix: |
    Every content page links to ≥3 other site pages (internal links).
    Footer + cross-references + 'Related' sections are common patterns.
    semantic-html-audit reports internal-link count per page.
  lesson: "Sites are graphs. Orphan nodes are invisible nodes."
  mechanic: semantic-html-audit
```
