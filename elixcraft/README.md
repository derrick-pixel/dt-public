# ELIXCRAFT — Employee Lifecycle Command

A gamified HR and employee lifecycle platform built on Singapore's SkillsFuture and MOM frameworks, themed around StarCraft factions (Protoss, Terran, Zerg).

**Live:** [derrick-pixel.github.io/ElixCraft](https://derrick-pixel.github.io/ElixCraft/)

## Concept

Each StarCraft faction maps to a department archetype:

| Faction | Department | Style |
|---|---|---|
| **Protoss** | Engineering & Technology | Elite units, high impact, psionic (tech-driven) |
| **Terran** | Operations & Business | Versatile, adaptable, resource-efficient |
| **Zerg** | Sales & Growth | Fast expansion, swarm tactics, volume-driven |

Employees ("Commanders") progress through career tracks with XP, levels, salary bands, and boss battles — all grounded in real Singapore labor market data from SkillsFuture, MyCareersFuture, and MOM.

## Features

- **Faction Select** — choose your department archetype with animated starfield background
- **Character Creation** — create your Commander with faction-aligned traits
- **Dashboard** — HUD-style overview with XP bar, stats, quests, and faction status
- **Career Map** — visual career progression tree with salary bands and level requirements
- **Industry Map** — Singapore workforce landscape visualization
- **KPI Tracking** — performance metrics tied to game progression
- **Boss Battle** — milestone challenges that gate promotions
- **SitRep** — periodic performance reviews as mission debriefs
- **Leave Management** — MOM-compliant leave tracking
- **Claims** — expense claims system
- **Employee Directory** — team roster
- **Preboarding** — gamified onboarding quest chain
- **Policy QA** — HR policy reference
- **HR Settings** — admin configuration
- **Tutorial** — interactive walkthrough of all systems

## Tech Stack

- Vanilla HTML5, CSS3, JavaScript (no frameworks)
- localStorage for game state persistence
- Google Fonts (Orbitron, Exo 2)
- Static site — open `index.html` or serve with any HTTP server

## Running Locally

```bash
# Option 1: just open the file
open index.html

# Option 2: local server (for fetch() compatibility)
npx serve .
# or
python3 -m http.server 8000
```

## Project Structure

```
├── index.html              # Faction select (entry point)
├── character-create.html   # Commander creation
├── dashboard.html          # Main HUD
├── career-map.html         # Career progression tree
├── industry-map.html       # Workforce landscape
├── kpi-tracking.html       # Performance metrics
├── boss-battle.html        # Promotion challenges
├── sitrep.html             # Performance reviews
├── leave-management.html   # Leave tracking
├── claims.html             # Expense claims
├── employee-directory.html # Team roster
├── preboarding.html        # Onboarding quests
├── policy-qa.html          # HR policies
├── hr-settings.html        # Admin config
├── tutorial.html           # Interactive guide
├── css/
│   ├── style.css           # Global theme & layout
│   ├── boss-battle.css     # Battle animations
│   ├── career-map.css      # Career tree styles
│   ├── character-create.css
│   ├── hr-pages.css        # Shared HR page styles
│   ├── industry-map.css
│   └── sitrep.css
├── js/
│   ├── game-state.js       # Central state management (localStorage)
│   ├── dashboard.js        # Dashboard logic
│   ├── career-map.js       # Career tree rendering
│   ├── character-create.js # Commander creation flow
│   ├── boss-battle.js      # Battle mechanics
│   ├── industry-map.js     # Map visualization
│   ├── sitrep.js           # Review logic
│   ├── select.js           # Faction select logic
│   └── starfield.js        # Canvas starfield animation
└── data/
    ├── elixcraft-data.js   # All game data (jobs, tracks, salary bands, skills, factions)
    ├── jobs.json            # Job definitions
    ├── skills.json          # Skill trees
    └── benefits.json        # Benefits catalog
```

## Data Sources

- SkillsFuture Singapore (ICT, Operations, HR frameworks)
- MyCareersFuture salary data
- Hays Singapore salary guide
- MOM employment regulations
- JobStreet SG market data
