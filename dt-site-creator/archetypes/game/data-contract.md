# Game — Data Contract

JSON files this archetype produces and consumes, plus game-specific state and design documents.

---

## Produces (standard 7 + game-design.md + progression-curve.md + save state)

Standard 7 from FIELD-DICTIONARY.md.

### Plus: `game-design.md` (project-level documentation)

Written before Agent 4 builds. Documents:
- **Mechanics:** core verbs (collect / fight / craft / negotiate). Win condition. Lose condition.
- **Progression:** XP system, level thresholds, unlock gates. Time-to-first-reward target.
- **Onboarding:** 30s narrative. Choice presentation. Re-pick window.
- **Win/lose states:** what happens on victory / defeat. Save / restart options.
- **UI components specific to game:** HUD, inventory, dialogue boxes, pause menu.
- **Save / load:** what's persisted. What's session-only.

### Plus: `progression-curve.md` (project-level documentation)

A spreadsheet-shaped doc:

```markdown
## Progression curve

| Level | XP threshold | Time to reach (median) | Rewards |
|---|---|---|---|
| 1 | 0 | 0:00 | Starter kit |
| 2 | 100 | 4:30 | First weapon |
| 3 | 250 | 9:00 | Class skill |
| 4 | 500 | 15:30 | Major story beat |
| 5 | 900 | 24:00 | Boss unlock |

Time-to-first-reward: 4:30 (target <5:00 ✅)
Max gap between rewards: 9:00 (target <15:00 ✅)
Dead zones: none ✅
```

If any row violates the targets, redesign before code lands. Pitfall `game-soft-lock` happens when this doc isn't written or violations are ignored.

### Plus: save state (localStorage)

Versioned schema:

```json
{
  "schema_version": 1,
  "player": {
    "name": "string",
    "faction": "protoss-equivalent | terran-equivalent | zerg-equivalent",
    "level": 3,
    "xp": 250
  },
  "world": {
    "current_zone": "starter-zone-1",
    "completed_zones": ["tutorial"],
    "discovered_locations": ["village", "forest"]
  },
  "inventory": {
    "items": [
      { "id": "wooden-sword", "qty": 1 }
    ]
  },
  "story_flags": {
    "met_npc_alpha": true,
    "completed_quest_1": false
  },
  "settings": {
    "music_volume": 0.7,
    "sfx_volume": 1.0
  },
  "saved_at": "2026-04-28T08:30:00Z"
}
```

Schema changes require version bump + migration. On `schema_version` mismatch, run migration or back up the old save file before clearing.

---

## Consumes

**Sibling intel skipped.** No `/data/intel/` directory.

If reference material is gathered (game design conventions, mechanic inspiration), document in `game-design.md` as a "References" section — not as JSON.

---

## Minimum viable shapes

### `brief.json` (additions over baseline)
- `constraints[]` documents any genre tag: `genre: "rpg" | "puzzle" | "arcade" | "simulation" | …`
- `target_geo` defaults to global (not SG-only) unless brief restricts

### `palette.json` (additions over baseline)
- Often dark mode (game UI conventionally dark)
- `--accent` often signals faction colour — pair with `--accent2` for opposing factions if multi-faction

### `sitemap.json` (additions over baseline)
- NO admin pages by default
- Footer link to `game-design.md` if devlog-style transparency is desired

### `design-system.json` (additions over baseline)
- `font_pairing` often Tech/Modern (Orbitron + Exo 2) or Military/Industrial (Barlow Condensed + Barlow)

### `qa-report.json` (additions over baseline)
- `save_migration_audit:` was a v1 → v2 migration tested? Pitfall `game-save-no-version`.
- `raf_visibility_audit:` does the game loop pause when tab hidden? Pitfall `game-raf-hidden`.
- `onboarding_audit:` can a new player reach first meaningful decision in <60s? Pitfall `game-no-onboarding`.
- `progression_audit:` does first reward arrive <5 min? Pitfall `game-soft-lock`.
- `trademark_audit:` zero IP infringement (no Starcraft/Halo/Pokémon names). Pitfall `game-trademark-adjacent`.

---

## Test contract

Agent 7 (QA Curator) verifies for game:

1. **Save migration test:** Manually patch a save file to `schema_version: 0` (one less). Load the game. Migration runs? Or graceful warning? ✅
2. **RAF visibility test:** Open dev tools, switch tabs for 5 minutes. Return — game state matches expectations? CPU usage during tab-hidden was idle? ✅
3. **Onboarding test:** Open in incognito. New player. Time to first meaningful choice — < 60s? ✅
4. **Progression test:** Play first 5 minutes. First reward arrived? Plot vs progression-curve.md targets. ✅
5. **Trademark test:** Search code + assets for known IP names (Starcraft / Halo / etc.). Zero matches. ✅
6. **Mobile test:** If touch-targeted, verify on real phone. Tap targets ≥44px. No accidental scroll-zoom on canvas.

Each adds an entry to `qa-report.json` with pass/fail.
