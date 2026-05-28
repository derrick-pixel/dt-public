# Lemon Man — Candidate Lemon Platform

Marketing site for **Lemon Man**, a concept-stage workforce-screening venture in
Singapore. A shared reliability check for temp, daily-rated and short-contract
staff, built around the **Lemon Score** — a demerit engine where high = sour
(bad hire), low = peach (clean).

> **Status: concept-stage, not launched.** Public-facing marketing site, built
> as a design artefact. Repository is **private**; every page carries
> `noindex, nofollow`; GitHub Pages is off. See *Going live* before changing any
> of that.
>
> **⚠️ Legal note.** This v2 build re-flavours the site to the founder's
> original v1.0 first-principles brief — including mechanics (Mutual Assured
> Destruction framing, "blacklist", pay-to-upload, pay-to-remove) that Business
> Plan v1.1 §7.5 and the legal assessment explicitly rejected. Built this way on
> the founder's explicit, informed instruction. **Do not publish without the
> venture's lawyers clearing this version.**

## Stack

Static HTML/CSS/JS — no build step, no dependencies. dt-site-creator
methodology: multi-page scaffold, shared design system, OG/social meta,
adaptive SVG favicon, cache-busted includes (`?v=2`).

## Pages

| File | Purpose |
|---|---|
| `index.html` | Hero, the lemon economics (Akerlof), two problems, the Lemon Score, hard/soft power, lemon-detector scoreboard |
| `how-it-works.html` | The Lemon Score engine — incident points, the quadratic corroboration multiplier, decay, the 24–72h contest window |
| `for-workers.html` | "Un-lemon yourself" — the alert, contesting, ripening into a peach, fast-track removal |
| `pricing.html` | Lemon tokens, monthly plans, removal pricing, the >10-lemons-a-quarter headcount rule |
| `trust.html` | "The Squeeze" — paid uploads, contest window, Mutually Assured Sourness, corroboration |

```
assets/
  css/lemon.css      design system v2 (citrus B2B, Lemon Score = sour-high)
  js/lemon.js        nav, scroll-reveal, Lemon Score gauge + meter, form stub
  img/favicon.svg    filled-lemon monogram
  img/og-image.png   1200×630 social card  (regenerate: scripts/generate-og.py)
scripts/
  generate-og.py     PIL-based OG card generator (rerunnable)
```

## Run locally

```
python3 -m http.server 8000   →   http://localhost:8000
```

## Design

Playful citrus B2B. Warm cream paper, deep ink, hard borders with offset
shadows. Lemon amber = the "sour / bad" signal; peach-coral = clean / good.
Fraunces (display) + Hanken Grotesk (body) + Spline Sans Mono (data).
Deliberately not Elitez navy — the venture is positioned as independent.

## The Lemon Score

0–1000 demerit scale. High = lemon (bad), low = peach (clean). Incidents add
severity-weighted points; a quadratic multiplier fires when independent
employers corroborate; clean time and rehabilitation decay it back down. The
gauge arc colours by band (peach → lemon → sour) via `assets/js/lemon.js`.

## Going live

Currently private + `noindex`, and held pending **legal sign-off on this v2
flavour specifically**. To publish: get the lawyers' clearance, remove
`noindex, nofollow` from every page `<head>`, make the repo public, enable
GitHub Pages, bump the `?v=` cache-bust.

---
Concept-stage venture. Confidential.
