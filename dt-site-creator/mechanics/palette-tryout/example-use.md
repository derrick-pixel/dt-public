# palette-tryout — Example usage

Every dt-site-creator project includes `colors.html` in the first build. Examples:

- **lumana** (warm teal aged-care): 5 variants spanned warm-cream-editorial, cool-teal-aged-care, vibrant-coral-lifestyle, dark-violet-premium, muted-sage-clinical. Human picked cool-teal-aged-care.
- **elix-eor** (Fire Extinguisher palette EOR site): 5 variants spanned fire-red-corporate, dark-obsidian-finance, warm-cream-trust, cool-blue-tech, vibrant-coral-startup. Human picked fire-red-corporate.
- **xinceai** (warm obsidian HUD AI): 5 variants spanned obsidian-amber-hud, dark-cyan-tech, warm-cream-editorial, neon-purple-future, muted-sage-clinical. Human picked obsidian-amber-hud.

## Generation flow

1. Agent 2 reads `brief.json.domain` and `archetype`.
2. Picks 5 variants spanning ≥4 diametric axes (per its handbook).
3. Generates `palette.json` with all 5 variants and `chosen: null`.
4. Generates `colors.html` using `snippet.html` template.
5. Commits and pushes — colors.html is live on GitHub Pages.
6. Sends URL to human: `https://derrick-pixel.github.io/<project>/colors.html`.
7. Human reviews, picks one variant id.
8. Agent 2 (or downstream automation) updates `palette.json.chosen` to picked id.
9. Agent 4 reads `palette.json.chosen.tokens` for `:root` block.
10. After site ships, optional cleanup: delete colors.html OR exclude from sitemap.xml.

## Sourced from

Codified from Section F of the legacy `masterprompt.txt` (v1, retired). Every project since 2026-03 has shipped a colors.html — this mechanic formalizes the pattern.
