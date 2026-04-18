# Elitez Security Website — Design Spec

## Overview

Brand authority website for Elitez Security, a business unit of the Elitez Group. Positions the company as a premium, tech-forward security firm serving the full spectrum — from condo MCSTs to large corporates and government. Lead generation is secondary to establishing credibility and commanding presence.

**Tech stack:** Vanilla HTML5/CSS3/JavaScript. No frameworks. GitHub Pages deployment under `derrick-pixel/elitez-security`.

**Design direction:** Dark Authority — surveillance-ops aesthetic, commanding, serious. Near-black palette with steel blue accents. Industrial typography.

## Site Structure

```
elitez-security/
├── index.html              — Main site: hero + services + stats + trust + CTA
├── command-center.html     — Deep-dive: 24/7 surveillance & monitoring
├── robotics.html           — Deep-dive: autonomous patrol & AI detection
├── admin.html              — Competitor analytics (30+ firms)
├── admin-insights.html     — Market & pricing intelligence
├── colors.html             — 5 palette proposals for review
├── css/style.css           — Shared stylesheet
├── js/main.js              — Shared scripts
├── data/
│   ├── competitors.json    — Competitor research data
│   └── services.json       — Service definitions
├── assets/                 — Images, icons
└── og-image.jpg            — 1200x630 social image
```

## Visual Identity

### Color Palette

```css
:root {
  --bg: #0a0f1e;
  --surface: #0f172a;
  --card: #111827;
  --border: rgba(255,255,255,0.06);
  --border2: rgba(59,130,246,0.3);
  --text: #f1f5f9;
  --muted: rgba(255,255,255,0.6);
  --muted2: rgba(255,255,255,0.35);
  --accent: #3b82f6;
  --accent2: #64748b;
}
```

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| h1 | Barlow Condensed | 900 | clamp(2rem, 5vw, 3.5rem) |
| h2 | Barlow Condensed | 800 | clamp(1.5rem, 3.5vw, 2.4rem) |
| h3 | Barlow Condensed | 700 | clamp(1.1rem, 2vw, 1.5rem) |
| body | Barlow | 400 | 14px, line-height 1.6 |
| labels/stats | Share Tech Mono | 400 | 0.65rem, uppercase, letter-spacing 0.1em |

### Logo

- White version on dark backgrounds (primary usage across entire site)
- Black version reserved for any light-background contexts
- Uses standard Elitez logo format

### Navigation

- Fixed top, z-index 200, height 64px
- Background: `rgba(10,15,30,0.92)` + `backdrop-filter: blur(12px)`
- Logo (white) LEFT, nav links CENTER-RIGHT, "Get Assessment" CTA button FAR RIGHT
- Links: Services, Command Center, Robotics, Consultancy, Contact
- Mobile (<768px): Hamburger menu with animated 3-span toggle
- Admin pages visible in nav (no password gate), with shared admin sub-nav

## Page Designs

### index.html — Main Landing Page

**Section 1: Hero**
- Full-width dark background with subtle canvas animation (particle grid or surveillance-grid overlay)
- Headline: "INTEGRATED SECURITY SOLUTIONS" (Barlow Condensed 900, all-caps)
- Subline: "From guard deployment to AI-powered surveillance — protecting Singapore's people and assets."
- Stats strip below hero: "500+ Guards Deployed · 90+ Sites Secured · 24/7 Command Center · 15+ Years Experience" (Share Tech Mono, animated counters on scroll)
- Primary CTA: "Request Security Assessment" (solid accent button)

**Section 2: Services Grid**
- 3×2 grid of service cards, each with:
  - Icon (SVG or emoji placeholder)
  - Service title (Barlow Condensed 700)
  - 2-line description
  - "Learn More →" link (accent color)
- Six services:
  1. **Security Manpower Services** — Trained, licensed security officers for commercial, residential, and industrial sites
  2. **Command Center Surveillance** — 24/7 remote monitoring with real-time incident response → links to command-center.html
  3. **Robotics Patrolling** — Autonomous patrol robots with AI-powered threat detection → links to robotics.html
  4. **Security Consultancy** — Risk assessments, security audits, and compliance advisory
  5. **Traffic Marshall Controls** — Professional traffic management for construction, events, and road works
  6. **Major Event Security** — End-to-end security planning and deployment for large-scale events

**Section 3: Why Elitez**
- 2-column layout
- Left: 4 differentiator cards (icon + title + description):
  - Licensed & Certified (PLRD licensed, DSTA approved)
  - Technology-Enabled (AI, robotics, smart surveillance)
  - Scalable Operations (10 guards to 500+ for major events)
  - 24/7 Response (round-the-clock command center backing)
- Right: Large stat block or trust visual (e.g., "Trusted across 90+ sites in Singapore")

**Section 4: Client Trust**
- "Trusted By" section with logo bar (placeholder logos initially, can be populated later)
- Subtle scroll animation on reveal

**Section 5: CTA Footer**
- Dark gradient background
- Headline: "Secure Your Premises Today"
- Subline: "Get a complimentary security assessment from our consultants."
- CTA button: "Contact Us" or consultation form link
- Contact details: phone, email, address

### command-center.html — Command Center Deep-Dive

**Hero**
- Service-specific headline: "24/7 COMMAND CENTER SURVEILLANCE"
- Subline: "Real-time monitoring, instant response, total visibility."
- Ambient background: subtle radar-sweep or monitoring-grid canvas animation

**Capabilities Grid**
- 4-6 capability cards:
  - Live CCTV Monitoring
  - Incident Alert & Escalation
  - Access Control Integration
  - Video Analytics & AI Detection
  - Remote Guard Tour Verification
  - Incident Reporting & Documentation

**How It Works**
- 3-4 step visual flow (numbered circles with connecting lines):
  1. Cameras & sensors feed to command center
  2. AI flags anomalies, operators verify
  3. Instant dispatch of ground response
  4. Incident documented & reported

**Integration**
- How command center connects with on-ground guards, robotics patrol, and client systems
- Visual diagram or infographic

**CTA**
- "Schedule a Command Center Demo" button

### robotics.html — Robotics Patrolling Deep-Dive

**Hero**
- Headline: "AUTONOMOUS SECURITY PATROL"
- Subline: "AI-powered robots that never tire, never miss, never stop."
- Ambient background: subtle tech-grid or circuit animation

**Capabilities Grid**
- 4-6 capability cards:
  - Autonomous Route Patrol
  - AI Threat & Anomaly Detection
  - License Plate Recognition
  - Thermal & Night Vision
  - Real-Time Video Streaming to Command Center
  - Intrusion Detection & Alerts

**How It Works**
- Visual flow: Robot patrols → AI detects anomaly → Alert to command center → Ground response dispatched

**Fleet Management**
- Route planning, scheduling, battery management
- Integration with command center dashboard

**CTA**
- "Request a Robotics Demo"

### admin.html — Competitor Analytics

Per masterprompt methodology — research 30+ Singapore security companies:

**Data points per competitor:**
- Company name, website URL, years in operation
- Services offered (checkbox matrix)
- Website design quality score (1-10)
- Mobile responsiveness score (1-10)
- Key CTAs used
- Hero messaging/tagline
- Strengths and weaknesses
- Notable clients or certifications
- Market position (budget/mid/premium)

**Key competitors to research (non-exhaustive):**
Certis, Aetos, Prosegur, Soverus, Ademco, Cisco Security (SG), Metropolis Security, Auxiliary Police forces, Centurion, KH Security, Oneberry Technologies (robotics), ADIS, ST Engineering (security division), Certis CISCO, G4S, Securitas, CISCO Certis, Sovereign Security, Alliance Security, Ranger Security, IPS Group, Vigilance Security, Magnum Force Security, Uniforce Security, Ashtree International, TwinCity Security, Absolute Security, Focus Security, Arknight, Smart Security

**Layout:**
- Tab system for filtering by market segment
- Cards with expandable details
- Radar charts for comparative visualization
- Summary insights section at top

### admin-insights.html — Market & Pricing Intelligence

**Sections:**
1. **Market Overview** — SG security industry size, growth rate, regulatory landscape (PLRD requirements)
2. **Pricing Tiers** — Budget / Mid / Premium pricing ranges for:
   - Guard services (per guard per month)
   - Command center monitoring (per camera/site)
   - Event security (per event/per guard)
   - Consultancy (per engagement)
3. **Target Personas** — MCST committees, facility managers, corporate security directors, event organizers, construction site managers
4. **Willingness-to-Pay Analysis** — What each persona values and their price sensitivity
5. **Competitive Gaps** — Where Elitez can differentiate (tech integration, robotics, bundled services)
6. **Next-Best Alternatives** — What prospects use if they don't choose Elitez

## Interactive Features

| Feature | Where | Implementation |
|---------|-------|----------------|
| Canvas particle/grid animation | index.html hero | requestAnimationFrame loop |
| Scroll reveal | All pages | IntersectionObserver + fadeInUp |
| Counter animation | Stats sections | requestAnimationFrame + cubic ease, 1800ms |
| Accordion | FAQ or service details | Single-open, max-height transition |
| Tab system | admin.html competitor categories | Sticky tabs, panel switching |
| Radar charts | admin.html comparisons | Chart.js via CDN |
| Hamburger menu | All pages, mobile | Animated 3-span toggle |
| Glassmorphic nav | All pages | Fixed, blur, semi-transparent |
| Smooth scroll | All pages | anchor click → scrollIntoView |
| Toast notifications | Admin pages | Fixed bottom, auto-dismiss |

## Responsive Breakpoints

- **1024px:** 3-col → 2-col grids
- **768px:** Hamburger activates, 2-col → 1-col, hero text resizes
- **640px:** Fine-tune mobile spacing, full-width cards

## Component Patterns

All components follow dt-site-creator component library:
- Cards: 12px border-radius, 24px padding, hover translateY(-4px) + shadow
- Buttons: 8px border-radius, primary solid accent, outline variant for secondary
- Badges: 100px border-radius, 10% opacity backgrounds
- Modals: backdrop blur, slide-up entrance (if needed for admin)
- Toast: fixed bottom-center, auto-dismiss 2200ms

## Workflow (Masterprompt Execution Order)

1. Create GitHub repo `derrick-pixel/elitez-security`, initialize, first commit + push
2. Research 30+ competitor websites — extract design patterns, CTAs, services, pricing signals
3. Generate `colors.html` with 5 palette proposals (variations on dark authority theme)
4. After palette chosen → apply to full site
5. Create Stitch design system + generate screen mockups
6. Build index.html with all sections
7. Build command-center.html
8. Build robotics.html
9. Build admin.html with competitor analytics
10. Build admin-insights.html with market intelligence
11. Generate og-image.jpg (1200x630) matching site branding
12. Final commit + push, verify GitHub Pages deployment

## Out of Scope

- Client login / portal functionality
- Live CCTV feed integration
- Guard scheduling system
- Payment processing
- Blog / news section (can be added later)
- Multi-language support
