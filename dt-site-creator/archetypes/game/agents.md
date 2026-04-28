# Game — Agent Dispatch

**Sibling fork recommendation:** **SKIP.** Game peers ≠ SaaS competitors. The sibling's rubric (threat × beatability, NBA pricing, whitespace heatmap) doesn't apply cleanly to games. Do reference research separately if needed (game-design conventions, similar mechanics in adjacent titles), but don't fork the sibling.

---

## Dispatch order

```
[1] Sibling fork — SKIP
[2] Agent 1 (Brief & Archetype Router) — sets sibling_intel.fork_status = "skipped"
        ↓
[3] Agents 2 + 3 + 5 in parallel
        ↓
[4] Human picks palette
        ↓
[5] Agent 4 (Stitch / UI Composer)
        ↓
[6] Agent 6 (SEO / OG / Asset Engineer)
        ↓
[7] Agent 7 (QA & Pitfall Curator) — opt-in
```

Additional non-agent step before Agent 4: write `game-design.md` documenting mechanics, progression, win/lose states, onboarding. Non-negotiable for this archetype.

Plus: write `progression-curve.md` — the XP table, gates, rewards. Validates that no soft-locks exist before code lands.

---

## Required pages

| Page | Owner | Notes |
|---|---|---|
| `index.html` | Agents 3 + 4 + 5 | Start screen + lore + "Play" CTA |
| `play.html` | Agents 3 + 4 + 5 | Game itself — can merge into index for single-screen games |
| `leaderboard.html` | Agents 3 + 4 + 5 | Optional |
| `colors.html` | Agent 2 | Transient |

NO admin.html / admin-insights.html by default. Skip them. Add only if there's live-ops / GM tooling.

---

## Mechanics required

| Mechanic | Always? | Notes |
|---|---|---|
| `og-social-meta` | yes | Mandatory |
| `og-thumbnail` | yes | Mandatory — game cover art is the share asset |
| `favicon` | yes | Mandatory |
| `canvas-hero` | yes | Most games have a visual hero / game canvas |
| `localstorage-state` | yes | Save game (versioned schema) |
| `wizard-form` | yes (most) | Onboarding / character creation |
| `palette-tryout` | yes | colors.html |

## Mechanics optional

| Mechanic | When |
|---|---|
| `chartjs-dashboard` | Stats screens, progression visualisation |
| `multi-page-scaffold` | Non-game sections (about, leaderboard, devlog) |
| `admin-auth-gate` | Game master / live-ops tools |
| `pdf-pipeline` | Certificates on completion |
| `formspree-form` | Post-game feedback |

## Mechanics rare

| Mechanic | Why rare |
|---|---|
| `paynow-qr` | Unless monetising — then re-archetype to transactional with game as core |
| `intel-consumer` | Sibling intel skipped |
| `market-funnel` / `persona-cards` / `strategy-canvas-radar` / `segment-need-heatmap` | Sibling intel skipped |
| `meta-tags-generator` | Use directly, but page count is small enough that manual tags may be simpler |

---

## Critical conventions

### Save format versioning (mandatory)
`localstorage-state` save payload has `schema_version` field. On load, if mismatch, run migration or back up + restart. Pitfall `game-save-no-version`: v1.1 schema change broke every returning player.

### Visibility-aware game loop (mandatory)
`requestAnimationFrame` must pause when `document.hidden`. Listen for `visibilitychange` and stop the loop. Pitfall `game-raf-hidden`: phone overheated, battery -30% in 1h because RAF kept running in backgrounded tab.

### Onboarding before choice (mandatory)
Don't drop new players on a cold faction-pick / class-pick screen. Provide 30s narrative onboarding + 1-paragraph preview per choice. Allow re-pick within first 10 minutes. Pitfall `game-no-onboarding`.

### Progression curve playtested (mandatory)
First reward in <5 minutes. Max 15 minutes between rewards. Plot the XP curve in `progression-curve.md` — if it has dead zones (no rewards for 20+ minutes), redesign before code. Pitfall `game-soft-lock`.

### Trademark hygiene (mandatory)
"Inspired by" not "copy of". No Starcraft names, Halo fonts, Pokémon sprites. Pitfall `game-trademark-adjacent`: ElixCraft used Starcraft names directly — Blizzard would flag on commercial traction.

---

## Skip rules

If `brief.constraints[]` includes:
- `monetised` → re-archetype to transactional. Game is the core experience but transaction is the wrapper.
- `multiplayer` → not supported in v1 — flag to human, propose deferring to v2 or external infrastructure.
- `mobile-only` → emphasise touch controls; canvas-hero must be touch-aware; viewport meta with `user-scalable=no`.
- `no-save` → skip localstorage-state; ship as session-only puzzle/arcade.
