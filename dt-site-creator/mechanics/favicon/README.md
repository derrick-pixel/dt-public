# Favicon Set

The little icon in browser tabs, bookmark lists, phone home screens. It's the smallest piece of brand you ship — and the one users see most often (every tab they open).

## What it does
Serves the right favicon image at the right size for every surface: desktop browser tabs (16/32px), retina Macs (32px), Safari pinned tabs (monochrome SVG), iOS home screen when saved (180px), Android home screen + PWA install (192/512px), and mobile address-bar color.

## When to plug in
**Every site.** This is a mandatory core mechanic across all 5 archetypes. A site without a favicon looks unfinished and eats trust — visitors notice the blank globe in the tab.

## Trade-offs
- **Pro:** One-time generation, zero runtime cost, universal browser support.
- **Pro:** Makes a site feel finished in a way nothing else does for the same effort.
- **Con:** Covering every platform well takes 8 files (listed in the snippet). Tools like realfavicongenerator.net automate this.
- **Con:** Recognition at 16×16 is hard — most "logo"s become unreadable mush at that size. Favicon design is its own craft.

---

## Mix-and-match: 5 factors to decide before generating

Each factor below has 2–4 options. Pick one per factor; the combination defines your favicon's personality.

### Factor 1 — Shape strategy (what's IN the square)

| Option | Example | Works when |
|---|---|---|
| **Monogram** (one letter) | "D" for dt-site, "L" for Lumana | Short names, clean sans-serif works at 16px |
| **Icon mark** (abstract symbol) | 🕊️ dove for Passage, ✈️ plane for aviation | Your brand has a signature symbol |
| **Logo crest** (full logo shrunk) | Tiny company wordmark | Only if the full logo reads at 16×16 — most don't |
| **Emoji** (unicode character) | 🎮 for a game, 🧧 for altru | Quick v1, distinctive, works cross-platform. Cheaper than commissioned icon. |

**Floor test:** Zoom your candidate favicon to 16×16 actual pixels. If you can't tell what it is at arm's length, pick a simpler option.

### Factor 2 — Color strategy

| Option | Description | When to use |
|---|---|---|
| **Solid accent on bg** | Single brand color filling the square | Strong, recognizable brand color (Notion black, Slack purple) |
| **Inverted** (bg = accent, mark = white) | Fills the tab with color — high attention | When you want the tab to SHOUT (Figma, Linear do this) |
| **Gradient** | 2-color gradient fill | Premium feel, tech/consumer brands |
| **Transparent + mark only** | Mark sits on user's browser tab bg | Clean, but loses shape/border — only use if mark is very distinctive |

### Factor 3 — Format coverage

| Option | Files | Covers |
|---|---|---|
| **Minimal** | `favicon.ico` only | Every desktop browser. Skips iOS home-screen, Android PWA, dark mode. Use only for throwaway prototypes. |
| **Standard** | `.ico` + `.svg` + 2 PNG + apple-touch | Desktop + retina + iOS home screen. 95% of sites. |
| **Complete** (recommended) | All 8 files in the snippet | Desktop + retina + iOS + Android + PWA + Safari pinned tab + theme color. Do this once with a generator tool and forget. |

### Factor 4 — Theme support (dark mode awareness)

Browsers now support theme-aware favicons. Two paths:

- **Static (1 favicon everywhere)** — safe default. Pick an icon that works on both light and dark browser tabs (avoid pure black OR pure white).
- **Adaptive (dark + light variants)** — SVG favicon with embedded `@media (prefers-color-scheme)` rules, OR two `<link>` tags each with `media="(prefers-color-scheme: ...)"`. Matches the user's OS theme exactly. ~10 extra minutes to set up.

Adaptive SVG example (save as `favicon.svg`):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>
    .icon { fill: #0d1117; }
    @media (prefers-color-scheme: dark) { .icon { fill: #f0f6fc; } }
  </style>
  <circle class="icon" cx="16" cy="16" r="12" />
</svg>
```

### Factor 5 — Mobile home screen treatment

When users "Add to Home Screen" on iOS/Android, your favicon becomes an app-like icon on their phone. Two extra considerations:

- **Rounded corners** — iOS auto-rounds the corners of your apple-touch-icon. Don't ship pre-rounded — it'll look doubly-rounded.
- **Solid background** — iOS icons aren't transparent. Design for a solid fill edge-to-edge (or add your brand background inside the 180×180).
- **Short name** — set `"short_name"` in `site.webmanifest` to 10–12 characters so Android doesn't truncate under the icon.

---

## Mix-and-match recipes

**Recipe 1 — Tech startup (minimal, modern)**
- Shape: Monogram "N"
- Color: Solid accent (cyan #38bdf8) on dark navy
- Format: Complete (8 files)
- Theme: Static — single cyan-on-navy favicon everywhere
- Mobile: Solid square, "Nexus" as short_name

**Recipe 2 — Consumer / warm brand (playful)**
- Shape: Emoji (🧧 for altru, 🎮 for a game)
- Color: Inverted — the emoji's native color on warm cream bg
- Format: Standard (.ico + svg + touch)
- Theme: Static — emojis render cross-platform already
- Mobile: Large emoji, home-screen-friendly

**Recipe 3 — Premium / editorial (subtle)**
- Shape: Single serif initial ("A") in custom typeface
- Color: Gold (#c8860a) on charcoal
- Format: Complete
- Theme: Adaptive — gold switches to darker mustard on light tabs
- Mobile: Charcoal square with centered gold letter

---

## How to generate (tools)

The fastest path for all 8 files is a generator. Feed it ONE source image (ideally a 512×512 PNG or SVG), it outputs the full set.

1. **realfavicongenerator.net** — the gold standard. Free, generates every format, previews how it'll render on iOS/Android/Safari pinned tab, gives you a ZIP + the exact `<head>` snippet to paste.
2. **favicon.io** — simpler, 3 modes (text → favicon, image → favicon, emoji → favicon). Good for quick iterations.
3. **Figma → export** — if your logo's already in Figma, export 16 / 32 / 180 / 192 / 512 PNG plus SVG. Use an online .ico converter to bundle the ICO.

---

## Testing checklist

Before shipping:
- [ ] Desktop Chrome — tab icon visible at 16×16
- [ ] Mac Safari — tab icon + pinned tab mask-icon both work
- [ ] Firefox — icon renders (Firefox is picky about malformed ICO)
- [ ] iOS — open site in Safari, tap Share → Add to Home Screen. Check the icon looks right.
- [ ] Android — in Chrome, menu → Add to Home screen. PWA install uses 192 + 512 PNGs.
- [ ] Dark mode — toggle OS dark mode, confirm favicon still readable.

## Linked pitfalls
- `universal-stale-og` — when you redesign a site, regenerate the favicon too. The old one will keep showing in cached browser tabs for weeks if you don't bust the filename.

## Sourced from
Standard practice. realfavicongenerator.net has comprehensive generation; this mechanic consolidates the output into a reusable `<head>` snippet for dt-site-creator projects.
