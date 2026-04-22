# Video brief — 90-second dt-site-creator walkthrough

Replace the placeholder on `index.html` (hero) once produced.

## Goal

A cold visitor lands on `derrickteo.com/dt-site-creator/` with zero context. After 90 seconds they should understand: this tool turns *one sentence* about their project + *a few clicks* into a complete Claude prompt that builds a working site.

## Format

- **Screen recording** (Mac: Loom / ScreenStudio / QuickTime)
- **1920×1080** or 1280×720, MP4
- **Voice-over** in first person (Derrick, calm, declarative — not salesy)
- **75–90 seconds total**
- **Deliverable:** `.mp4` saved to `dt-site-creator/video/walkthrough.mp4`, OR a Loom URL embedded via iframe

## Script — scene by scene

### [0 – 5s] HOOK
- **On screen:** `derrickteo.com/dt-site-creator/` hero, cursor hovering
- **Voiceover:** *"Every new website starts with the same question — what am I actually building?"*

### [5 – 15s] THE ARCHIVE
- **On screen:** slow scroll past the 5 archetype cards (Static, Transactional, Simulator, Game, Dashboard)
- **Voiceover:** *"I've shipped 22 projects. They fall into five shapes. Each shape has its own prompt — battle-tested, with every pitfall I've hit baked in."*

### [15 – 30s] SELECT
- **On screen:** click `+ Select archetype` on **Transactional**, navigate to `/mechanics.html`, click `+ Add to bundle` on **PayNow QR**, then **LocalStorage State**, then **Wizard Form**. Floating **🧩 Prompt Assembly (4)** pill appears bottom-right.
- **Voiceover:** *"Pick the shape that matches what you're building. Then add building blocks — a payment QR, persistent state, a wizard form. Whatever your project needs."*

### [30 – 50s] ASSEMBLY
- **On screen:** click the floating pill → `/assembly.html`. Type into the textarea: *"A donation site for a wedding — red-packet money to a charity with tax-relief calc."* Prompt populates below in real time.
- **Voiceover:** *"One sentence about your project. That's the only writing you do. The assembly page stitches the design rules, every mechanic's code, and the pitfalls you need to avoid, into one self-contained prompt."*

### [50 – 65s] COPY & PASTE
- **On screen:** click **📋 Copy prompt** → toast appears. Cmd-Tab to a Terminal window already running `claude`. Paste. Claude begins responding — files scroll past, git commands appear.
- **Voiceover:** *"Copy it. Paste into Claude Code. Claude already has your project, your tech stack, every component it needs to build, and every trap it needs to avoid."*

### [65 – 80s] OUTCOME
- **On screen:** fast-forward / time-lapse of Claude working → switch to the finished site in a new browser tab
- **Voiceover:** *"Thirty minutes later — a working site. Shipped. Live. Every project on my portfolio was built this way."*

### [80 – 90s] CTA
- **On screen:** back to `derrickteo.com/dt-site-creator/` hero. Subtle arrow pointing at the floating **🧩 Prompt Assembly** pill. Text overlay fades in: *"Build yours."*
- **Voiceover:** *"Build yours."* [0.8s beat] *"derrickteo dot com slash dt-site-creator."*

## Recording tips (before you hit record)

| Thing | Why |
|---|---|
| Hide bookmarks bar in browser | Keeps viewer focused on content, not your reading list |
| Open a fresh incognito window | No cookies, no personal autofills |
| Turn cursor size up to 150% in Mac settings | Cursor is the visual subject — needs to be visible |
| Close all notification-spawning apps (Slack, Messages, Mail) | No interruptions |
| Set display to 1920×1080 | Matches YouTube/Loom default aspect |
| Read the script aloud once end-to-end first | Voiceover flows smoother on take 2 |

## Tools (pick one)

1. **Loom** — [loom.com](https://loom.com) — free, one click, auto-uploads, gives you a shareable URL to embed via `<iframe src="https://www.loom.com/embed/<ID>">`. Easiest path.
2. **ScreenStudio** — [screen.studio](https://screen.studio) — $29 Mac app, auto-zooms on clicks, smooth cursor animations, broadcast-grade polish. Worth it if you're shipping multiple demo videos.
3. **QuickTime + iMovie** — free, built-in Mac. Manual editing but full control. Export as MP4.

## After recording — how to embed

Replace the `.hero-video--placeholder` block in `index.html` with one of these:

**If you uploaded to Loom:**
```html
<div class="hero-video">
  <iframe src="https://www.loom.com/embed/<LOOM_VIDEO_ID>" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
</div>
```

**If you have an MP4 file:**
```html
<video class="hero-video" controls poster="video/walkthrough-poster.jpg" preload="metadata">
  <source src="video/walkthrough.mp4" type="video/mp4">
</video>
```

CSS is already wired for both — the `.hero-video` container enforces 16:9 aspect and rounded corners.

## Variant — 6-second silent GIF loop (fallback)

If a full 90s video is too much lift for v1, a tiny GIF loop still beats a static placeholder:

- **Content:** one cycle of Select → Assembly → Copy (no voiceover, no paste step)
- **Duration:** 6–8 seconds, looping
- **Size:** 1200×675, <2 MB
- **Tools:** Screen record a 10-second clip, convert via Kap (Mac, free) or ezgif.com. Export as GIF or (better) short MP4 with `muted autoplay loop playsinline`.
- **Embed:**
  ```html
  <video class="hero-video" muted autoplay loop playsinline>
    <source src="video/walkthrough-loop.mp4" type="video/mp4">
  </video>
  ```

## If you want AI to generate the video

A service like Sora / Veo / Runway Gen-3 *won't* produce a screencast of your actual site — they generate abstract footage. The recording approach above is correct for this product. If you still want to experiment, paste this at an AI video tool:

> *"Screen-recording walkthrough of a developer tool called DT Site Creator. Clean dark UI with amber and slate palette. User clicks through archetype cards, adds mechanics to a bundle, types a short project description, copies a generated prompt, pastes into a macOS Terminal running Claude Code. Narrator voice-over, calm and declarative, 90 seconds. No music, subtle UI click sounds. End on text overlay 'Build yours.'"*

This is best for mood-boarding, not final deliverable. Record the real thing.

## Self-contained success criteria

Video is done when:

- [ ] 75–90 seconds
- [ ] Shows all 5 key UI steps (archetype select → mechanic add → assembly populate → copy → paste/paste outcome)
- [ ] Voice-over audible, no filler words, no edits mid-sentence
- [ ] Ends with CTA mentioning the URL
- [ ] Exported to MP4 or hosted on Loom
- [ ] Embedded into `index.html`, replacing the current placeholder block
