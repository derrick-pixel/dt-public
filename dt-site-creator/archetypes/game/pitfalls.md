# Game — Pitfalls

```yaml
- id: universal-no-push
  title: "The site that went live but nobody could see"
  severity: high
  phase: shipping
  story: "Edited locally, didn't git push."
  source: "Universal"
  fix: |
    git push after every change.
  lesson: "GitHub Pages serves from remote."
  mechanic: null

- id: universal-dark-default
  title: "Another dark-cyan site"
  severity: medium
  phase: planning
  story: "Defaulted to dark-cyan."
  source: "Universal"
  fix: |
    colors.html first.
  lesson: "Every brand needs personality."
  mechanic: null

- id: universal-stale-og
  title: "The WhatsApp preview showing last week's site"
  severity: medium
  phase: shipping
  story: "Thumbnail stale after redesign."
  source: "Universal"
  fix: |
    Regenerate og-image.jpg.
  lesson: "OG images cache."
  mechanic: og-social-meta

- id: universal-no-competitors
  title: "The generic copy"
  severity: medium
  phase: planning
  story: "Skipped research."
  source: "Universal"
  fix: |
    Research 30+ sites.
  lesson: "See the best to beat the best."
  mechanic: null

- id: game-save-no-version
  title: "The update that deleted everyone's progress"
  severity: critical
  phase: live
  story: "v1.1 changed the save schema. Every returning player's save errored on parse. Silent failure, shown as 'start new game'."
  source: "Hypothetical (avoided in elixcraft by noticing early)"
  fix: |
    1. Every save has schema_version field.
    2. On load, check version and run migration if mismatched.
    3. Fallback: back up the old save before migrating in case migration fails.
  lesson: "Saves are contracts with the player. Version them from day one."
  mechanic: localstorage-state

- id: game-raf-hidden
  title: "The game that cooked the phone"
  severity: high
  phase: shipping
  story: "requestAnimationFrame kept running when tab was backgrounded. User's phone got hot and battery drained 30% in an hour of background."
  source: "elixcraft battle scene prototype"
  fix: |
    1. Listen to document.visibilitychange.
    2. Pause the RAF loop when hidden, resume on visible.
    3. Best practice: use document.hidden check inside the loop itself.
  lesson: "Respect the user's device. Sleep when not watched."
  mechanic: null

- id: game-soft-lock
  title: "The grind that broke the player"
  severity: high
  phase: building
  story: "XP curve required 2 hours to reach level 5, but no meaningful rewards until level 6. Players quit at level 3."
  source: "elixcraft v0 playtests"
  fix: |
    1. Plot target progression in a spreadsheet: minutes to level.
    2. First meaningful reward by minute 5.
    3. No grind longer than 15 minutes between rewards at any level.
  lesson: "Progression must feel rewarded, not earned."
  mechanic: null

- id: game-no-onboarding
  title: "The 10-second bounce"
  severity: high
  phase: building
  story: "New player landed on faction pick screen. Had no idea what Protoss/Terran/Zerg meant for gameplay. Closed the tab."
  source: "elixcraft early UX"
  fix: |
    1. Before any irreversible choice, show a 30-second narrative onboarding.
    2. Each faction choice has a 1-paragraph 'what playing this means' preview.
    3. Allow re-pick within first 10 minutes of play (soft irreversibility).
  lesson: "Games are strangers by default. Introduce yourself."
  mechanic: null

- id: game-trademark-adjacent
  title: "The cease-and-desist"
  severity: critical
  phase: live
  story: "Used Starcraft faction names directly. Blizzard IP would auto-flag if the game got traction with a paying user base."
  source: "elixcraft to elix-onboarding rebrand, Apr 2026"
  fix: |
    1. For any franchise-adjacent game: rename everything.
    2. 'Inspired by' in docs; zero IP lift in code/assets.
    3. Professional-skin clone lives at elix-onboarding/ for commercial use.
  lesson: "Inspiration is free; IP is not."
  mechanic: null
```
