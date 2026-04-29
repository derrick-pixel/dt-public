# competitor-intel-template

Reusable static-site template for competitor / market analytics. Fork this repo, swap the JSON in `/template/data/`, and dispatch the nine included Claude Code subagents to produce a full analytics package: competitor database, market intelligence, pricing strategy, Blue-Ocean whitespace atlas, website design audit, a downloadable full-bleed PDF report, and an opt-in final beautify pass that re-skins the admin pages to match the target brand's public site.

## Three zones

- **`/template/`** — forkable scaffold. Static site with all seven analytics wired on sample data.
- **`/methodology/`** — handbook. One file per agent: what to collect, why it matters, scoring rubric.
- **`/showcase/`** — gallery of real projects built on this template (XinceAI, Elix EOR, Lumana).

## Quick start (humans)

1. `gh repo create <your-org>/<your-project> --template derrick-pixel/competitor-intel-template --public`
2. Clone locally, open `AGENT.md`.
3. Replace `/template/data/*.json` with your market's data. Set `meta.sample_data: false`.
4. Update brand tokens in `/template/assets/css/site.css` `:root`.
5. Push. GitHub Pages serves `/showcase/index.html` landing, `/template/` live demo.

## Quick start (AI agents)

Read `AGENT.md` first, then dispatch agents 1–6 and 8 in workflow order: 1 → 2 → 3 → 4 → 5 → 6 → 8. Agent 7 (methodology-curator) runs later, against a finished project. Agent 9 (aesthetics-presenter) runs **last and only when explicitly requested** — after the human has reviewed and approved the un-styled layout, it re-skins every admin page to resonate with the target brand's public site.

## Stack

Vanilla HTML5 + ES2020 + Chart.js + html2canvas + jsPDF. No build step, no framework. Tests: Node 20+ `node:test`.

## License

MIT © 2026 Derrick Teo
