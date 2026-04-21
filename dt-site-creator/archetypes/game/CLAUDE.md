# Game Archetype Playbook (v1 thin)

Goal-driven play with scoring, levels, or character progression. Examples: elixcraft.

## Inherits from
`archetypes/static-informational/CLAUDE.md`.

## Additional v1 rules

1. **Save format must be versioned.** `{ "schema_version": 1, ... }` so future updates can migrate.
2. **Canvas loops must pause on tab hide.** Use `document.visibilitychange` to stop `requestAnimationFrame` when hidden.
3. **Onboarding before faction/class pick.** Never dump a new player on a choice screen cold.
4. **XP curves get playtested.** Plot target progression times (minutes to level 2, 5, 10). Adjust to remove soft-locks.
5. **Trademark hygiene.** No Starcraft faction names, Halo fonts, Pokemon sprites. Inspired-by, not copy-of.

## Deferred to v2
- Full game-loop conventions
- Save-slot UI patterns
- Sound/music handling
- Mobile controls
