# SEO Optimization Track — Overview

The construction agents (01–07 in `methodology/`) get a site to "crawler-friendly". This track handles the next layers — **measurement**, **local SEO**, **performance**, **page-level optimization**, and **off-page authority**.

## The 4-tier model

| Tier | Question it answers | Status after construction agents |
|---|---|---|
| 1. Structural HTML | Can crawlers read + understand the site? | ✅ Done by Agents 4 + 6 + 7 |
| 2. Measurement | What are search engines actually doing with the site? | ❌ Requires SEO Agent 01 |
| 3. Page-level optimization | Are pages ranking for the queries we want? | ❌ Requires Tier 2 data first |
| 4. Off-page / authority | Does the domain have weight to compete? | ❌ Long-game; SEO Agent 06 |

You can't optimize what you can't measure, so **Tier 2 is the universal gateway**. Without it, every Tier 3 / Tier 4 effort is guessing.

## Agent registry

| # | Agent | Tier | Owns | Recommended frequency |
|---|---|---|---|---|
| **01** | [Measurement Setup](./01-measurement-setup.md) | 2 | GSC + GA4 + Bing webmaster + sitemap submission | Once per site, at launch |
| **02** | [Google Business Profile](./02-google-business-profile.md) | 2.5 | Local SEO for SG service businesses | Once per SG service site |
| **03** | [Lighthouse / Core Web Vitals](./03-lighthouse-audit.md) | 1.5 | Page speed, LCP, CLS, INP audit + fixes | After every major asset/CSS change |
| **04** | [Title + Meta Optimizer](./04-title-meta-optimizer.md) | 3 | Data-driven `<title>` + meta description rewrites | After 2–4 weeks of GSC data; then quarterly |
| **05** | [Internal Linking Strategist](./05-internal-linking-strategist.md) | 3 | Link graph analysis + orphan-page detection | Quarterly per site |
| **06** | [Backlink + Authority Strategist](./06-backlink-authority.md) | 4 | Off-page citations, PR, directory listings | Quarterly review; ongoing |

## Sequencing — when to invoke what

```
SITE LAUNCH
  │
  ├──→ Agent 01 (Measurement Setup) ─── always first
  │       │
  │       └─ wait 2-4 weeks for data ──┐
  │                                    │
  ├──→ Agent 02 (GBP) ─── if SG service business, in parallel with above
  │
  ├──→ Agent 03 (Lighthouse) ─── before launch + on every asset change
  │
  └──→ Agent 06 (Backlinks) ─── start quietly in background, long game
                                       │
                                       ▼
                       2-4 WEEKS LATER (data flowing)
                                       │
                                       ├──→ Agent 04 (Title/Meta Optimizer)
                                       │
                                       └──→ Agent 05 (Internal Linking)
                                               │
                                               ▼
                                       QUARTERLY CYCLE: 04 + 05 again
```

## How agents are invoked

Each agent has:
- A handbook at `methodology/seo/0N-*.md` (the agent's playbook — read first)
- A dispatch prompt at `prompts/seo/invoke-*.md` (paste-into-Claude template)

When you want to activate one:

```
1. Read prompts/seo/invoke-<agent>.md
2. Fill in {{placeholders}} — usually site URL + scope
3. Paste the body into a fresh Claude conversation OR Agent dispatch
4. Agent reads its handbook + does the work
```

Most SEO agents are **human-assisted** (they can't click in Cloudflare/Google dashboards on your behalf). They walk you through setup, draft content, propose changes, and verify outputs — but you do the click-work in third-party UIs.

## What this track does NOT cover

- **Content writing for ranking content pages.** That's Agent 5 (Copy & Microcopy) territory; if you need long-form content for SEO ranking, invoke Agent 5 with explicit "write for ranking" framing.
- **Keyword research.** Use external tools (Ahrefs, SEMrush, Google Keyword Planner). The agents here CONSUME keyword research; they don't generate it.
- **Penalty recovery.** If a site's been hit with a manual action, the playbook here doesn't apply — that's a specialist task.
- **Multi-language SEO.** All current agents assume `en` or `en-SG`. If a site needs `zh-Hant` / `ja` / `ms`, the agents need adaptation.

## Pitfalls in the SEO track itself

- **`seo-measure-without-data`** — running optimization agents (04, 05) before SEO 01 has 2-4 weeks of data is guessing dressed up as work. Severity: medium.
- **`seo-tactic-without-content`** — chasing rankings on thin pages. SEO can't rescue a 200-word page from competitive queries. Severity: high.
- **`seo-backlink-spam`** — outreach for links via low-quality directory listings or comment spam. Get the site penalized. Severity: critical.
- **`seo-wrong-tier`** — page-speed audit on a site that's not even indexed yet (Tier 1 problem). Always solve in tier order. Severity: low.

## Sourced from

The 4-tier model + agent decomposition is based on the 2026-Q1 audit of dt-site-creator-shipped sites. Agents 1–7 (construction) shipped HTML that scored 100/100 structurally but couldn't be measured or improved without these post-launch competencies.
