# Canvas Hero

Full-bleed animated starfield canvas that sits behind your hero section. Battery-friendly — pauses on tab hidden.

## What it does
Renders ~200 drifting starlike dots on a `<canvas>` sized to its container. Animates via `requestAnimationFrame`. Listens to `document.visibilitychange` and stops the RAF loop when the tab is hidden.

## When to plug in
- **Game** (core): most games want a visual hero / game canvas.
- **Static informational** (optional): tech / defence / aviation / sci-fi brand.
- Skip if your brand is warm / editorial / minimalist.

## Trade-offs
- **Pro:** Immediately premium-looking, no external deps.
- **Pro:** Scales to device via devicePixelRatio.
- **Con:** ~2-5% CPU when visible. Resource-hungry on low-end mobile.
- **Con:** Risk of being overdone — see game-raf-hidden pitfall.

## How to use (3 steps)

1. Drop the snippet where your hero section starts.
2. Replace the `<h1>` / `<p>` inside `.mechanic-canvashero__content` with your actual hero copy.
3. Tune the palette — change `#79c0ff` (star color) and the gradient hex values to your brand.

## Customization

- **Density:** change `Math.round(rect.width * rect.height / 5000)` denominator (smaller = more stars).
- **Motion speed:** adjust `vx` / `vy` ranges in `seedStars`.
- **Geometry:** swap `ctx.arc` for `ctx.rect` (squares), triangles, or images.

## Linked pitfalls
- `game-raf-hidden` — always pause RAF when `document.hidden`. This snippet does it correctly.

## Sourced from
`elixcraft/js/starfield.js`, `vectorsky/js/hero-canvas.js`.
