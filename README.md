# dt-public

Public-facing portfolio for Derrick Teo — **derrickteo.com**.

Curated subset of works ready for public audience. For the full internal index (including WIP), see [dtws_works](https://github.com/derrick-pixel/dtws_works).

## Canonical direction (since 2026-04-29)

**Source repos are canonical. This repo is a one-way downstream mirror.**

Each per-site subfolder (`aevum/`, `altru/`, `passage/`, etc.) is a slave copy of an upstream `derrick-pixel/<repo>` repository. **Do not edit per-site files in this repo directly** — your changes will be overwritten on the next `sync-wip.sh` run. Edit the upstream source repo, push, then resync.

Exceptions (dt-public-native, no source repo behind them):
- `index.html` — the derrickteo.com portfolio landing page
- `bg-space.jpg`, `thumbnail.png`, `*.png`/`favicon*`/etc. — landing page assets
- `CNAME`, `sitemap.xml`, `wrangler.jsonc`, `.assetsignore` — deploy config
- `wip/` — staging area for not-yet-public previews
- `competitor-intel/`, `pulse/` and any other folders that are dt-public-only experiments — these are flagged in `sync-wip.sh` if absent from `WIP_REPOS`

Why this rule exists: in April 2026, Week 4 of the SEO rigor track applied fixes only to dt-public mirrors, leaving source repos broken. Both URLs (each repo's github.io and derrickteo.com) ended up serving different versions of the same site. The only structural fix is one-way sync: source canonical, dt-public mirror. After this rule was put in place, drift became impossible.

See `methodology/proposals/2026-04-29-fleet-seo-fix-week4.md` in dt-site-creator for the full backstory.

## Structure

- `index.html` — landing page (Live + Preview sections)
- `CNAME` — custom domain (derrickteo.com)
- `thumbnail.png` — OG preview image
- `bg-space.jpg` — background image (dark theme only)
- `sync-wip.sh` — manual weekly sync script
- `<project>/` — mirrored WIP project subfolders (passage, elitez-security, etc.)

## Categories

- **Live** — real products pointing to their production URLs (Altru, Lumana, JR+)
- **Preview** — snapshots of WIP repos mirrored into subfolders, refreshed weekly via `sync-wip.sh`

## Weekly sync

To pull the latest state of each WIP project into this repo:

```bash
./sync-wip.sh
git status                                          # review changes
git add -A && git commit -m "weekly WIP sync" && git push
```

The script shallow-clones each WIP repo from `derrick-pixel/*` and copies its contents into the matching subfolder, removing `.git` and `.github` so they don't nest as submodules.

## Deploy

Served via GitHub Pages from `main`. Custom domain `derrickteo.com` routed through Cloudflare (DNS-only, orange cloud off).
