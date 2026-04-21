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
```
