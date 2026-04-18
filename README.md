# dt-public

Public-facing portfolio for Derrick Teo — **derrickteo.com**.

Curated subset of works ready for public audience. For the full internal index (including WIP), see [dtws_works](https://github.com/derrick-pixel/dtws_works).

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
