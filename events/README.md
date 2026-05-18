# Elitez Events

Public-facing site + competitor-intel analytics package for **Elitez Events** — the corporate event-management arm of Elitez Group, Singapore. Founded 2021.

> _"Your trusted partner to create memorable events together."_

## What's here

```
elitez-events/
├── index.html              # Landing
├── services.html           # 6 disciplines (D&D, team-building, awards, family day, brand, exhibition)
├── work.html               # 30+ recent productions, filterable
├── about.html              # Vision/mission, journey, ecosystem, team, ESG
├── contact.html            # Brief intake form
│
├── admin/                  # Competitor-intel analytics (built from competitor-intel-template)
│   ├── index.html          # 35 competitors + Top-5 + search
│   ├── insights.html       # Market size, policies, personas, tiered pricing
│   ├── whitespace.html     # Strategy canvas + heatmap + attack plans
│   ├── design-audit.html   # 15 audited competitor websites
│   └── report.html         # Compiled full report
│
├── data/                   # Source-of-truth JSON (Agents 1-6 own different slices)
│   ├── competitors.json
│   ├── market-intelligence.json
│   ├── pricing-strategy.json
│   └── whitespace-framework.json
│
├── methodology/            # Per-agent handbooks (forked from competitor-intel-template)
├── .claude/agents/         # Subagent definitions
├── assets/                 # CSS, JS modules, images, screenshots
├── reference-deck.pdf      # Original Aug 2025 company profile
└── og-image.jpg            # 1200x630 social card
```

## Build philosophy

Built using two of Derrick's own systems:

1. **`dt-site-creator/masterprompt.txt`** — vanilla HTML5/CSS3/JS, no frameworks, GitHub Pages, gradient-forward unique-per-site identity. Brand lifted from the company deck (orange `#FF6A00` × black `#0A0604`, person-glyph wordmark).
2. **`competitor-intel-template/`** — 7-agent analytics pipeline. Agents 1 → 6 + 8 ran in workflow order, each writing to its owned file slice.

## Local preview

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Repo

`derrick-pixel/Elitez-Events` (private — flip to public + enable Pages when ready).

## Contact

Sam Neo · sam.neo@elitez.asia · +65 9727 1292
Eevann Seah · eevann.seah@elitez.asia · +65 8180 0994
2 Kallang Avenue #03-08, CT Hub, Singapore 188613
