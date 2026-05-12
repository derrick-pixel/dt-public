# Ecosystem Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `/ecosystem.html` page to dt-site-creator that visualizes the production stack as a 5-layer architecture diagram with 4 filterable recipe paths.

**Architecture:** Vanilla HTML + CSS + JS. Data-driven from a single `ecosystem.json` file. Inline SVG for connection lines (no external libs). Filter state syncs to URL hash. Adds a 7th nav tab. Matches existing dashboard aesthetic (slate `#0d1117` bg, amber `#ffa657` accent).

**Tech Stack:** HTML, vanilla JS (IIFE pattern matching existing `dashboard/js/*.js`), CSS, SVG. Local static server for testing (`python3 -m http.server 8000`).

**Spec:** `docs/specs/2026-05-12-ecosystem-page-design.md` — full requirements.

**Repo conventions to honor:**
- Commit and push after every meaningful change (GitHub Pages serves the remote, not your disk).
- Run `node --check dashboard/js/<file>.js` after every JS edit.
- After final push, sync dt-public mirror via `cd /Users/derrickteo/codings/dt-public && bash sync-wip.sh && git add -A && git commit && git push`.

---

## File Map

**Create:**
```
ecosystem.html                       page shell, nav, layer containers, filter pills
dashboard/css/ecosystem.css          layer/node/pill/line styles + responsive
dashboard/js/ecosystem.js            fetch + render + filter + SVG line geometry
dashboard/data/ecosystem.json        single source of truth (layers, nodes, paths)
```

**Modify (1-line nav additions each):**
```
index.html, mechanics.html, assembly.html, showcase.html, pitfalls.html, setup.html
```

---

## Task 1: Create `dashboard/data/ecosystem.json`

**Files:** Create `/Users/derrickteo/codings/dt-site-creator/dashboard/data/ecosystem.json`.

The file content is given in full in **`docs/specs/2026-05-12-ecosystem-page-design.md` section 8**. The implementer subagent will have that section embedded in their dispatch prompt.

- [ ] **Step 1: Write the file** with the JSON content from spec §8 (layers, nodes, paths objects).

- [ ] **Step 2: Validate JSON**

```
python3 -c "import json; d = json.load(open('/Users/derrickteo/codings/dt-site-creator/dashboard/data/ecosystem.json')); print('layers:', len(d['layers']), 'nodes:', len(d['nodes']), 'paths:', len(d['paths']))"
```

Expected: `layers: 5 nodes: 18 paths: 4`.

- [ ] **Step 3: Verify all path-referenced node IDs exist**

```
python3 -c "
import json
d = json.load(open('/Users/derrickteo/codings/dt-site-creator/dashboard/data/ecosystem.json'))
node_ids = set(d['nodes'].keys())
for path_id, path in d['paths'].items():
    missing = [n for n in path['nodes'] if n not in node_ids]
    assert not missing, f'{path_id} references unknown nodes: {missing}'
for layer in d['layers']:
    missing = [n for n in layer['nodes'] if n not in node_ids]
    assert not missing, f'layer {layer[\"id\"]} references unknown nodes: {missing}'
print('OK valid')
"
```

Expected: `OK valid`.

- [ ] **Step 4: Commit**

```
git -C /Users/derrickteo/codings/dt-site-creator add dashboard/data/ecosystem.json
git -C /Users/derrickteo/codings/dt-site-creator commit -m "data: ecosystem.json (5 layers, 18 nodes, 4 paths)"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Task 2: Create `ecosystem.html` shell

**Files:** Create `/Users/derrickteo/codings/dt-site-creator/ecosystem.html`.

- [ ] **Step 1: Read the existing `index.html`** for the head + nav block patterns.

```
head -85 /Users/derrickteo/codings/dt-site-creator/index.html
```

- [ ] **Step 2: Write `ecosystem.html`** with:
- Same `<head>` boilerplate as `index.html` (charset, viewport, title, description, OG tags, favicon links, font preloads, JSON-LD), title `Ecosystem — DT Site Creator`, OG description `Live diagram of the production stack — GitHub, Cloudflare, Supabase, Fly.io, Streamlit Cloud, and the 4 integration recipes that bind them together.`, og:url `https://derrick-pixel.github.io/dt-site-creator/ecosystem.html`.
- Two stylesheet links: `<link rel="stylesheet" href="dashboard/css/style.css">` and `<link rel="stylesheet" href="dashboard/css/ecosystem.css?v=1">`.
- Nav with 7 entries (Ecosystem between Showcase and Pitfalls; class="active" on Ecosystem link).
- Mobile menu with same 7 entries.
- Main element with hero section (`<section class="eco-hero">` containing h1 `How it all fits together`, tagline `Each project picks a path. The ecosystem is the library of paths.`, and `<div class="eco-filters" id="eco-filters">` for filter pills) and frame section (`<section class="eco-frame">` containing `<svg class="eco-svg" id="eco-svg" aria-hidden="true"></svg>` and `<div class="eco-canvas" id="eco-canvas"></div>`).
- Scripts at end of body: `<script src="dashboard/js/main.js?v=11"></script>` then `<script src="dashboard/js/ecosystem.js?v=1"></script>`.

The full HTML skeleton:

```
<!DOCTYPE html>
<html lang="en">
<head>
  [Copy ALL head content from index.html, modify title/description/og-url for this page,
   and add the ecosystem.css link AFTER style.css]
</head>
<body>
  <header>
    <nav id="site-nav">
      <a href="index.html" class="nav-logo">DT<span>.</span>site</a>
      <ul class="nav-links">
        <li><a href="index.html">Archetypes</a></li>
        <li><a href="mechanics.html">Mechanics</a></li>
        <li><a href="assembly.html">Prompt Assembly</a></li>
        <li><a href="showcase.html">Showcase</a></li>
        <li><a href="ecosystem.html" class="active">Ecosystem</a></li>
        <li><a href="pitfalls.html">Pitfalls</a></li>
        <li><a href="setup.html">Setup</a></li>
      </ul>
      <div class="nav-right">
        <a class="btn-outline btn-sm" href="assembly.html">Prompt Assembly →</a>
        <button class="hamburger" id="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
    <div id="mobile-menu" class="mobile-menu">
      <a href="index.html">Archetypes</a>
      <a href="mechanics.html">Mechanics</a>
      <a href="assembly.html">Prompt Assembly</a>
      <a href="showcase.html">Showcase</a>
      <a href="ecosystem.html">Ecosystem</a>
      <a href="pitfalls.html">Pitfalls</a>
      <a href="setup.html">Setup guide</a>
    </div>
  </header>

  <main>
    <section class="eco-hero">
      <h1>How it all fits together</h1>
      <p class="eco-tagline">Each project picks a path. The ecosystem is the library of paths.</p>
      <div class="eco-filters" id="eco-filters" role="tablist" aria-label="Recipe path filter"></div>
    </section>

    <section class="eco-frame">
      <svg class="eco-svg" id="eco-svg" aria-hidden="true"></svg>
      <div class="eco-canvas" id="eco-canvas"></div>
    </section>
  </main>

  <script src="dashboard/js/main.js?v=11"></script>
  <script src="dashboard/js/ecosystem.js?v=1"></script>
</body>
</html>
```

- [ ] **Step 3: Validate the HTML loads**

```
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8000/ecosystem.html
curl -s http://localhost:8000/ecosystem.html | grep -c "eco-canvas"
kill $SERVER_PID
```

Expected: `HTTP 200` and grep count `1`.

- [ ] **Step 4: Commit**

```
git -C /Users/derrickteo/codings/dt-site-creator add ecosystem.html
git -C /Users/derrickteo/codings/dt-site-creator commit -m "page: ecosystem.html shell + nav (7th tab between Showcase and Pitfalls)"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Task 3: Create `dashboard/css/ecosystem.css`

**Files:** Create `/Users/derrickteo/codings/dt-site-creator/dashboard/css/ecosystem.css`.

The CSS content is fully specified — about 130 lines. Sections:
1. Hero band (`.eco-hero`, `.eco-tagline`)
2. Filter pills (`.eco-filters`, `.eco-pill`, `.eco-pill.active`)
3. Diagram frame (`.eco-frame`, `.eco-svg`, `.eco-canvas`)
4. Layer card (`.eco-layer`, `.eco-layer-label`, `.eco-layer-nodes`)
5. Node tile (`.eco-node`, hover/focus states)
6. Candidate node distinction (`.eco-node.is-candidate` — dashed border, opacity 0.6, "Candidate" badge via `::after`)
7. Path-active state (`.eco-canvas.has-active-path .eco-node` dims to 0.3; `.is-on-path` overrides to 1 with colored border + glow via `box-shadow`)
8. Tooltip (`.eco-tooltip`, positioned absolute, arrow via `::before`)
9. Responsive (`@media (max-width: 1100px)` and `@media (max-width: 600px)`)

Color vars inherited from `style.css`: `--bg #0d1117`, `--card #1c2128`, `--border rgba(255,255,255,0.08)`, `--border2 rgba(255,255,255,0.16)`, `--text #f0f6fc`, `--accent #ffa657`.

Path-color override uses CSS custom property `--path-color` set inline via JS when a path is active.

Full content per spec §6. Engineer implementing this task should refer to spec section 6 (Visual treatment) and section 7 (Responsive) for exact pixel values and breakpoints.

- [ ] **Step 1: Write the file** per spec §6 + §7 — about 130 lines.

- [ ] **Step 2: Smoke load**

```
cd /Users/derrickteo/codings/dt-site-creator && python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
curl -s -o /dev/null -w "ecosystem.css HTTP %{http_code}\n" http://localhost:8000/dashboard/css/ecosystem.css?v=1
kill $SERVER_PID
```

Expected: `ecosystem.css HTTP 200`.

- [ ] **Step 3: Commit**

```
git -C /Users/derrickteo/codings/dt-site-creator add dashboard/css/ecosystem.css
git -C /Users/derrickteo/codings/dt-site-creator commit -m "css: ecosystem page styles (layers, nodes, pills, tooltip, responsive)"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Task 4: Create `dashboard/js/ecosystem.js` v1 — fetch + render nodes

**Files:** Create `/Users/derrickteo/codings/dt-site-creator/dashboard/js/ecosystem.js`.

- [ ] **Step 1: Inspect existing JS pattern** for consistency.

```
head -30 /Users/derrickteo/codings/dt-site-creator/dashboard/js/pitfalls.js
```

Note the IIFE shape `(function() { 'use strict'; ... })();` and the fetch-then-render flow.

- [ ] **Step 2: Write `dashboard/js/ecosystem.js`** v1 — about 60 lines. Sections:
1. IIFE wrapper with `'use strict'`.
2. Constant `DATA_URL = 'dashboard/data/ecosystem.json'`.
3. Module-scope `let data = null`.
4. Async `init()` that fetches the JSON, errors gracefully (insert friendly error message into `#eco-canvas` if fetch fails), then calls `renderLayers()`.
5. `renderLayers()` that loops `data.layers`, creates `.eco-layer` cards with label and `.eco-layer-nodes` row; for each node in the layer, creates an `<a class="eco-node">` element with `data-node-id`, icon span, label span; if the node is a candidate (`shipped: false`) add `is-candidate` class; if the node has a `link` value set the `href`, else remove the href attribute.
6. DOMContentLoaded check, call `init()`.

Use the existing pitfalls.js as a reference pattern.

- [ ] **Step 3: Parse-check**

```
node --check /Users/derrickteo/codings/dt-site-creator/dashboard/js/ecosystem.js
```

Expected: no output.

- [ ] **Step 4: Commit**

```
git -C /Users/derrickteo/codings/dt-site-creator add dashboard/js/ecosystem.js
git -C /Users/derrickteo/codings/dt-site-creator commit -m "js: ecosystem v1 — fetch + render layered architecture nodes"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Task 5: Add SVG connection lines

**Files:** Modify `/Users/derrickteo/codings/dt-site-creator/dashboard/js/ecosystem.js`.

Goal: between each adjacent layer pair, draw a thin curved SVG path from the bottom-center of each top-layer node to the top-center of its nearest-by-x bottom-layer node. Default style: `stroke: rgba(255,255,255,0.15); stroke-width: 1; fill: none`.

- [ ] **Step 1: Add two helper functions** inside the IIFE, after `renderLayers`:
- `getRelativeRect(el, refEl)` — returns `{x, y, w, h}` of `el` relative to `refEl` using getBoundingClientRect deltas.
- `renderDefaultLines()` — for each adjacent layer pair (i, i+1) in `data.layers`, query each top-layer node's element via `[data-node-id="X"]`, find the closest-by-x bottom-layer node, compute relative rects, and append an SVG path to `#eco-svg`. The path uses a cubic bezier curve: `M sx sy C sx sy+24, dx dy-24, dx dy`.

The SVG element's viewBox is set to `0 0 frame.clientWidth frame.clientHeight` each render.

- [ ] **Step 2: Call `renderDefaultLines()`** from `init()` AFTER `renderLayers()`, wrapped in `requestAnimationFrame` so layout settles first. Also add a window resize listener that re-renders lines.

- [ ] **Step 3: Parse-check**

```
node --check /Users/derrickteo/codings/dt-site-creator/dashboard/js/ecosystem.js
```

- [ ] **Step 4: Commit**

```
git -C /Users/derrickteo/codings/dt-site-creator add dashboard/js/ecosystem.js
git -C /Users/derrickteo/codings/dt-site-creator commit -m "js: ecosystem v2 — default SVG connection lines between adjacent layers"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Task 6: Filter pills + path-active state + path-colored lines

**Files:** Modify `/Users/derrickteo/codings/dt-site-creator/dashboard/js/ecosystem.js`.

- [ ] **Step 1: Add module-scope `let activePath = null;`** and these functions:
- `renderPills()` — populates `#eco-filters` with one "All paths" button + one button per path in `data.paths`. Each path button has `<span>{icon}</span><span>{label}</span>` and sets `--pill-color: {color}` inline. Each button on click calls `setActivePath(...)`.
- `refreshPillsActive()` — toggles the `.active` class on each pill based on `activePath`.
- `setActivePath(pathId)` — sets `activePath`, calls `refreshPillsActive()`, `applyPathToNodes()`, `renderPathLines()`.
- `applyPathToNodes()` — when `activePath` is null, removes `.has-active-path` from canvas and clears `.is-on-path` from all nodes. When set, adds `.has-active-path` to canvas, sets `--path-color: {color}` inline, and adds `.is-on-path` to nodes whose IDs are in `data.paths[activePath].nodes`.
- `renderPathLines()` — when `activePath` is null, calls `renderDefaultLines()`. When set, clears the SVG and draws all-pairs lines between path-nodes in adjacent layers, using `stroke: {color}; stroke-width: 2; opacity: 0.9`.

- [ ] **Step 2: Update `init()`** to call `renderPills()` after `renderLayers()`. The resize listener should call `renderPathLines()` if `activePath` is set, else `renderDefaultLines()`.

- [ ] **Step 3: Parse-check + commit**

```
node --check /Users/derrickteo/codings/dt-site-creator/dashboard/js/ecosystem.js
git -C /Users/derrickteo/codings/dt-site-creator add dashboard/js/ecosystem.js
git -C /Users/derrickteo/codings/dt-site-creator commit -m "js: ecosystem v3 — filter pills + path highlighting + path-colored lines"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Task 7: URL hash sync + hover tooltips

**Files:** Modify `/Users/derrickteo/codings/dt-site-creator/dashboard/js/ecosystem.js`.

- [ ] **Step 1: Add hash-sync helpers**
- `pathFromHash()` — reads `location.hash`, matches `/^#path=([a-z-]+)$/i`, returns the path ID if it exists in `data.paths`, else null.
- A module-scope `let suppressHashListener = false;`.
- Modify `setActivePath(pathId)` to also update the URL hash via `history.replaceState(null, '', '#path=' + pathId)` or clear it when null. Set `suppressHashListener = true` before the change, clear after a `setTimeout(0)`.
- In `init()`, after `renderPills()`, read `pathFromHash()` and if non-null call `setActivePath(initial)`.
- Add a `window.addEventListener('hashchange', ...)` that respects `suppressHashListener` and calls `setActivePath(pathFromHash())` on external hash changes.

- [ ] **Step 2: Add hover tooltips**

After `renderLayers()` in `init()`, create a `<div class="eco-tooltip">` element appended to `document.body`. For each `.eco-node` element, add `mouseenter` and `mouseleave` listeners:
- On mouseenter: read the node ID from `dataset.nodeId`, look up `data.nodes[id]`, set tooltip innerHTML with a primary `<div>` containing `node.summary` and a secondary `<div>` containing `Stack candidate — evaluated, not yet shipped` if `!node.shipped`. Position the tooltip below the hovered element using `getBoundingClientRect()` + `window.scrollX/Y`. Show.
- On mouseleave: hide.

- [ ] **Step 3: Click navigation already works** — `<a>` elements have hrefs set in renderLayers from `node.link`. Default browser behavior opens in same tab. Nodes without `link` (`gh-pages`, `cf-dns`, `fly-logs`, `cf-logs`) have no href, so they don't navigate.

- [ ] **Step 4: Parse-check + commit**

```
node --check /Users/derrickteo/codings/dt-site-creator/dashboard/js/ecosystem.js
git -C /Users/derrickteo/codings/dt-site-creator add dashboard/js/ecosystem.js
git -C /Users/derrickteo/codings/dt-site-creator commit -m "js: ecosystem v4 — URL hash sync + hover tooltips + click nav"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Task 8: Add Ecosystem nav tab to 6 existing HTML pages

**Files:** Modify `index.html`, `mechanics.html`, `assembly.html`, `showcase.html`, `pitfalls.html`, `setup.html` (all under `/Users/derrickteo/codings/dt-site-creator/`).

- [ ] **Step 1: For each of the 6 files**, find the desktop nav `<ul class="nav-links">` block and insert `<li><a href="ecosystem.html">Ecosystem</a></li>` between the Showcase line and the Pitfalls line. Some pages have `class="active"` on Showcase or Pitfalls — adapt the search string per file.

Reference target lines to find:
- Showcase: `<li><a href="showcase.html">Showcase</a></li>` (or with class="active")
- Pitfalls: `<li><a href="pitfalls.html">Pitfalls</a></li>` (or with class="active")

Insertion: between them, add `<li><a href="ecosystem.html">Ecosystem</a></li>`.

- [ ] **Step 2: For each of the 6 files**, find the `<div id="mobile-menu" class="mobile-menu">` block and insert `<a href="ecosystem.html">Ecosystem</a>` between the Showcase line and the Pitfalls line.

- [ ] **Step 3: Sanity-grep**

```
for f in /Users/derrickteo/codings/dt-site-creator/index.html /Users/derrickteo/codings/dt-site-creator/mechanics.html /Users/derrickteo/codings/dt-site-creator/assembly.html /Users/derrickteo/codings/dt-site-creator/showcase.html /Users/derrickteo/codings/dt-site-creator/pitfalls.html /Users/derrickteo/codings/dt-site-creator/setup.html; do
  count=$(grep -c "ecosystem.html" "$f")
  echo "$(basename $f): $count"
done
```

Expected: each shows `2` occurrences (one desktop nav + one mobile menu).

- [ ] **Step 4: Commit**

```
git -C /Users/derrickteo/codings/dt-site-creator add index.html mechanics.html assembly.html showcase.html pitfalls.html setup.html
git -C /Users/derrickteo/codings/dt-site-creator commit -m "nav: add Ecosystem tab to 6 existing pages (desktop + mobile menus)"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Task 9: Smoke test + mirror sync

**Files:** None modified; verification + mirror.

- [ ] **Step 1: Local smoke test via curl**

```
cd /Users/derrickteo/codings/dt-site-creator && python3 -m http.server 8000 &
SERVER_PID=$!
sleep 2

echo "ecosystem.html:" $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ecosystem.html)
echo "ecosystem.css:" $(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/dashboard/css/ecosystem.css?v=1")
echo "ecosystem.js:" $(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/dashboard/js/ecosystem.js?v=1")
echo "ecosystem.json:" $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/dashboard/data/ecosystem.json)

for p in index mechanics assembly showcase pitfalls setup; do
  count=$(curl -s http://localhost:8000/$p.html | grep -c "ecosystem.html")
  echo "$p.html: $count ecosystem links (expected 2)"
done

kill $SERVER_PID
```

All HTTP codes should be 200; each page should show count 2.

- [ ] **Step 2: If any check fails**, fix the issue and re-test before proceeding.

- [ ] **Step 3: Mirror sync**

```
cd /Users/derrickteo/codings/dt-public
bash sync-wip.sh
git -C /Users/derrickteo/codings/dt-public add -A
git -C /Users/derrickteo/codings/dt-public commit -m "mirror: sync dt-site-creator with ecosystem page (7th nav tab)"
git -C /Users/derrickteo/codings/dt-public push
```

- [ ] **Step 4: Browser smoke test (defer to user)**

Tell the user to manually verify by opening `http://localhost:8000/ecosystem.html` and confirming:
1. Hero band + tagline render.
2. 5 filter pills appear (All + 4 paths) with correct icons.
3. 5 layer cards stack vertically with all 18 nodes visible.
4. Candidate nodes (Vercel, Railway, Neon, Upstash, Sentry) show dashed borders + "Candidate" badge.
5. Default state: thin grey connection lines between adjacent layers.
6. Click each path pill → that path's nodes pop, others dim, lines render in path color.
7. URL hash updates on filter click. Loading `ecosystem.html#path=streamlit` directly should show the streamlit filter active.
8. Hover a node → tooltip shows summary; candidate nodes show "Stack candidate" sub-line.
9. Click a shipped node → navigates to its mechanic page in same tab.
10. Click a candidate node → navigates to its stack-candidates.md anchor.
11. Resize browser to <600px → layers and nodes stack vertically; SVG lines hide.

No commit needed for this step.

---

## Self-review checklist

- [ ] `ecosystem.json` validates as JSON; all path-referenced node IDs exist.
- [ ] `ecosystem.html` HTTP 200; nav has 7 tabs.
- [ ] `ecosystem.css` HTTP 200.
- [ ] `node --check dashboard/js/ecosystem.js` passes.
- [ ] All 6 existing HTML pages have Ecosystem in desktop nav AND mobile-menu.
- [ ] Mirror synced; dt-public commit pushed.

---

## Out of scope (per spec §10)

- Archetype-overlay layer (not adding archetype tiles to the diagram).
- Real-time service health checks.
- A "compare two paths side-by-side" mode.
- Mobile reflow beyond what's in CSS (the <600px breakpoint hides SVG lines and stacks nodes).
