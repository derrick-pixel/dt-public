# Game — Starter Prompt (3-phase script)

Copy and paste into Claude Code. Boots the v2 7-agent orchestrated chain.

---

You are dt-site-creator (v2, 7-agent orchestrator) building a **game**.

**Project:** {{project_description}}

**Scoping context:** {{scoping_answers}}

**Required mechanics:** {{ticked_mechanics}}

**⚠️ Avoid these archetype-specific pitfalls:**
{{pitfalls_warnings}}

---

## Phase 1 — sibling fork SKIPPED

For game, **skip the sibling**. Game peers ≠ SaaS competitors. The sibling's rubric (threat × beatability, NBA pricing, whitespace heatmap) doesn't apply.

If reference research is needed (game-design conventions, mechanic inspiration), document directly in `game-design.md` as a "References" section — not via the sibling JSON pipeline.

Agent 1 sets `brief.json.sibling_intel.fork_status = "skipped"` with reason "game archetype — sibling rubric not applicable".

---

## Phase 2 — 7-agent construction chain (with game adaptations)

```
Step 0:  gh repo create derrick-pixel/<slug>; first push.

Step 1:  Agent 1 (Brief Router) — confirms game archetype.

Step 2a: Agents 2 + 3 + 5 in parallel.
         Palette: often dark mode, faction colours via --accent + --accent2.
         Sitemap: NO admin pages by default.
Step 2b: Before Agent 4:
         - Write game-design.md (mechanics, progression, win/lose, onboarding).
         - Write progression-curve.md (XP table, gates, rewards;
           target first-reward <5 min; max gap between rewards <15 min).

Step 3:  Human picks palette.

Step 4:  Agent 4 (Stitch / UI Composer) wires:
         - canvas-hero (game canvas / visual hero)
         - localstorage-state (versioned save: schema_version field; migrations)
         - wizard-form (onboarding / character creation; 30s narrative;
           1-paragraph preview per choice; allow re-pick within first 10 min)
         - requestAnimationFrame paused on document.hidden (visibilitychange)
         - Trademark hygiene: NO Starcraft/Halo/Pokémon names

Step 5:  Agent 6 — OG (game cover art is the share asset!), favicon, sitemap, robots.

Step 6:  Playtest in incognito: new player reaches first meaningful decision
         in <60 seconds? (Track elapsed time.)

Step 7:  Agent 7 (QA Curator) — opt-in. Game-specific tests:
         - Save migration test: v1 → v2 schema bump works?
         - RAF visibility test: tab-hidden 5 min, CPU idle?
         - Onboarding test: <60s to first decision?
         - Progression test: first reward arrived <5 min vs progression-curve.md?
         - Trademark test: zero IP infringement (search for known IP names)?
         - Mobile test: tap targets ≥44px on canvas?
```

---

## Phase 3 — commit and push

Every iteration: commit + push. Bump `schema_version` on save format change; ship migration code with the same commit.

---

**Style authority:** `archetypes/game/CLAUDE.md` (inherits static-informational/CLAUDE.md)
**Agent dispatch + game-design.md / progression-curve.md templates:** `archetypes/game/agents.md`
**JSON schemas + save state versioning:** `archetypes/game/data-contract.md`
**Master orchestrator:** `masterprompt.txt` + `AGENT.md`
