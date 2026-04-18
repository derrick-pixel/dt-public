# Elitez Security Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Dark Authority brand website for Elitez Security with 3 public pages (index, command center, robotics), 2 admin analytics pages, and a color palette review page.

**Architecture:** Multi-page static site using vanilla HTML/CSS/JS. Shared stylesheet (`css/style.css`) and script (`js/main.js`) across all pages. Data-driven admin pages powered by JSON files. GitHub Pages deployment.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Google Fonts (Barlow Condensed + Barlow + Share Tech Mono), Chart.js (CDN, for admin radar charts only)

---

### Task 1: GitHub Repo Setup & Project Scaffold

**Files:**
- Create: `css/style.css` (empty placeholder)
- Create: `js/main.js` (empty placeholder)
- Create: `data/` directory
- Create: `assets/` directory

- [ ] **Step 1: Create GitHub repo**

```bash
cd /Users/derrickteo/codings/elitez-security
gh repo create derrick-pixel/elitez-security --public --source=. --remote=origin --push
```

If repo already exists, just add remote:
```bash
git remote add origin https://github.com/derrick-pixel/elitez-security.git
```

- [ ] **Step 2: Create project scaffold**

```bash
mkdir -p css js data assets
touch css/style.css js/main.js
```

- [ ] **Step 3: Create .gitignore**

```
.superpowers/
.DS_Store
```

- [ ] **Step 4: Commit and push scaffold**

```bash
git add .
git commit -m "chore: scaffold project structure"
git push -u origin main
```

---

### Task 2: Competitor Research (30+ SG Security Firms)

**Files:**
- Create: `data/competitors.json`

This task uses WebSearch and WebFetch to research 30+ Singapore security companies. No approval needed — go straight from research to building.

- [ ] **Step 1: Research competitors via WebSearch**

Search for Singapore security companies. Target list (non-exhaustive):
Certis, Aetos, Prosegur, Soverus, Ademco, Metropolis Security, Centurion, KH Security, Oneberry Technologies, ADIS, ST Engineering (security), G4S, Securitas, Sovereign Security, Alliance Security, Ranger Security, IPS Group, Vigilance Security, Magnum Force Security, Uniforce Security, Ashtree International, TwinCity Security, Absolute Security, Focus Security, Arknight, Smart Security, Stallion Security, Ademco Security, Cisco Certis, Auxiliary Police, Premier Security, Certis CISCO, CISCO Certis Group, William Security, Security Network, Safe Security, Protect Security, Garrison Security, Bastion Security

For each competitor, capture:
- Company name, website URL, years in operation
- Services offered (guard, tech, events, consultancy, etc.)
- Website design quality (1-10)
- Mobile responsiveness (1-10)
- Hero messaging/tagline
- Key CTAs used
- Strengths and weaknesses
- Notable clients or certifications
- Market position (budget/mid/premium)

- [ ] **Step 2: Fetch and analyze top competitor websites via WebFetch**

Deep-dive the top 10–15 competitor sites. Analyze:
- Layout patterns and information architecture
- Visual design choices (colors, typography, imagery)
- Interactive features and animations
- Conversion flows and CTA placement
- Mobile experience quality

- [ ] **Step 3: Write competitors.json**

Structure:
```json
{
  "competitors": [
    {
      "name": "Certis",
      "url": "https://www.certisgroup.com",
      "years": 10,
      "services": ["guard", "tech", "command_center", "consultancy"],
      "design_score": 8,
      "mobile_score": 7,
      "tagline": "...",
      "ctas": ["Contact Us", "Get Quote"],
      "strengths": ["Strong brand recognition", "Tech integration"],
      "weaknesses": ["Complex navigation", "Slow load time"],
      "clients": ["Changi Airport", "MBS"],
      "certifications": ["PLRD", "ISO 9001"],
      "market_position": "premium",
      "notes": "..."
    }
  ],
  "landscape": {
    "market_size": "...",
    "growth_rate": "...",
    "key_trends": [],
    "regulatory": "...",
    "sea_context": "..."
  },
  "design_insights": {
    "borrowed_ideas": [],
    "improved_weaknesses": [],
    "design_rationale": "..."
  }
}
```

- [ ] **Step 4: Commit research data**

```bash
git add data/competitors.json
git commit -m "research: add 30+ SG security competitor analysis"
git push
```

---

### Task 3: Color Palette Proposals (colors.html)

**Files:**
- Create: `colors.html`

Per masterprompt: 5 diametrically different palette proposals within the Dark Authority direction, with live UI previews.

- [ ] **Step 1: Build colors.html with 5 palette proposals**

All 5 palettes are dark variations but with distinct accent/mood:

**Palette 1 — Steel Command** (steel blue + slate grey)
```css
--bg: #0a0f1e; --surface: #0f172a; --card: #111827;
--accent: #3b82f6; --accent2: #64748b;
```

**Palette 2 — Night Ops** (emerald green + charcoal)
```css
--bg: #0a1210; --surface: #0f1f1a; --card: #111f1a;
--accent: #10b981; --accent2: #6b7280;
```

**Palette 3 — Crimson Alert** (deep red + dark gunmetal)
```css
--bg: #0f0a0a; --surface: #1a0f0f; --card: #1f1414;
--accent: #ef4444; --accent2: #78716c;
```

**Palette 4 — Tactical Gold** (amber/gold + warm grey)
```css
--bg: #0f0d08; --surface: #1a1710; --card: #1f1c14;
--accent: #f59e0b; --accent2: #78716c;
```

**Palette 5 — Arctic Watch** (cyan-white + cold grey)
```css
--bg: #080d12; --surface: #0c1520; --card: #101b28;
--accent: #06b6d4; --accent2: #94a3b8;
```

Each palette section includes:
- Live preview: mock nav bar, hero section, card, buttons, badges, text hierarchy
- All CSS variable values displayed
- "Copy CSS Variables" button (copies to clipboard via `navigator.clipboard`)
- Tab-based switcher for quick A/B comparison

The page uses Barlow Condensed + Barlow fonts and follows the standard page template (OG tags, etc.).

- [ ] **Step 2: Commit and push colors.html**

```bash
git add colors.html
git commit -m "design: add 5 color palette proposals for review"
git push
```

- [ ] **Step 3: Wait for palette selection**

Present colors.html to Derrick for review. Once a palette is chosen (or feedback given), proceed to Task 4.

---

### Task 4: Shared Stylesheet (css/style.css)

**Files:**
- Create: `css/style.css`

Build the complete shared stylesheet based on the chosen palette. This file powers all pages.

- [ ] **Step 1: Write CSS reset and variables**

```css
/* ── Reset ─────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; scroll-padding-top: 80px; }
body {
  font-family: 'Barlow', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }

/* ── CSS Variables ─────────────────────────────────────────────── */
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

- [ ] **Step 2: Write typography styles**

```css
/* ── Typography ────────────────────────────────────────────────── */
h1 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900; letter-spacing: -0.02em; line-height: 1.1; text-transform: uppercase; }
h2 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(1.5rem, 3.5vw, 2.4rem); font-weight: 800; letter-spacing: -0.01em; text-transform: uppercase; }
h3 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(1.1rem, 2vw, 1.5rem); font-weight: 700; }
.label { font-family: 'Share Tech Mono', monospace; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted2); }
.section-subtitle { color: var(--muted); max-width: 600px; margin: 12px auto 0; }
```

- [ ] **Step 3: Write layout styles**

```css
/* ── Layout ────────────────────────────────────────────────────── */
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
section { padding: 80px 0; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.text-center { text-align: center; }
```

- [ ] **Step 4: Write navigation styles**

```css
/* ── Navigation ────────────────────────────────────────────────── */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: 64px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px;
  background: rgba(10,15,30,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.nav-logo { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1.1rem; letter-spacing: 2px; text-transform: uppercase; color: var(--text); }
.nav-links { display: flex; gap: 24px; align-items: center; }
.nav-links a { font-size: 0.72rem; font-weight: 500; text-transform: uppercase; color: var(--muted); transition: color 0.2s; }
.nav-links a:hover, .nav-links a.active { color: var(--accent); }
.nav-cta { background: var(--accent); color: #0a0f1e; padding: 8px 18px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.02em; transition: all 0.2s; }
.nav-cta:hover { filter: brightness(1.15); transform: translateY(-1px); }
.hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 4px; }
.hamburger span { display: block; width: 20px; height: 2px; background: var(--text); transition: 0.3s; }
.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
#mobile-menu { display: none; }
```

- [ ] **Step 5: Write component styles (cards, buttons, badges, toast)**

```css
/* ── Cards ──────────────────────────────────────────────────────── */
.card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 12px; padding: 24px; transition: all 0.2s ease;
}
.card:hover {
  transform: translateY(-4px); border-color: var(--border2);
  box-shadow: 0 12px 32px rgba(0,0,0,0.2);
}
.card-icon { font-size: 2rem; margin-bottom: 12px; }
.card h3 { margin-bottom: 8px; }
.card p { color: var(--muted); font-size: 0.85rem; }
.card-link { display: inline-block; margin-top: 12px; color: var(--accent); font-size: 0.78rem; font-weight: 600; transition: color 0.2s; }
.card-link:hover { filter: brightness(1.2); }

/* ── Buttons ────────────────────────────────────────────────────── */
.btn-primary {
  display: inline-block; background: var(--accent); color: #0a0f1e;
  padding: 12px 24px; border: none; border-radius: 8px;
  font-weight: 700; font-size: 0.78rem; letter-spacing: 0.02em;
  cursor: pointer; transition: all 0.2s; text-decoration: none;
}
.btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
.btn-outline {
  display: inline-block; background: transparent;
  border: 1.5px solid var(--border2); color: var(--muted2);
  padding: 12px 24px; border-radius: 8px;
  font-weight: 700; font-size: 0.78rem; letter-spacing: 0.02em;
  cursor: pointer; transition: all 0.2s; text-decoration: none;
}
.btn-outline:hover { border-color: var(--accent); color: var(--accent); }

/* ── Badges ─────────────────────────────────────────────────────── */
.badge {
  display: inline-block; padding: 3px 10px; border-radius: 100px;
  font-size: 0.6rem; font-weight: 700; letter-spacing: 0.05em;
  text-transform: uppercase;
}
.badge-blue { background: rgba(59,130,246,0.1); color: #3b82f6; }
.badge-green { background: rgba(52,211,153,0.1); color: #34d399; }
.badge-gold { background: rgba(245,158,11,0.1); color: #f59e0b; }

/* ── Toast ──────────────────────────────────────────────────────── */
.toast {
  position: fixed; bottom: 24px; left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--surface); border: 1px solid var(--border2);
  padding: 10px 20px; border-radius: 8px;
  font-size: 0.78rem; color: var(--text);
  opacity: 0; transition: all 0.3s; z-index: 600; pointer-events: none;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
```

- [ ] **Step 6: Write animation styles**

```css
/* ── Animations ─────────────────────────────────────────────────── */
.animate { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
.animate.visible { opacity: 1; transform: translateY(0); }
.animate-delay-1 { transition-delay: 0.1s; }
.animate-delay-2 { transition-delay: 0.2s; }
.animate-delay-3 { transition-delay: 0.3s; }
```

- [ ] **Step 7: Write hero styles**

```css
/* ── Hero ────────────────────────────────────────────────────────── */
.hero {
  position: relative; min-height: 85vh;
  display: flex; align-items: center; justify-content: center;
  text-align: center; padding: 120px 24px 80px;
  overflow: hidden;
}
.hero canvas { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.hero-content { position: relative; z-index: 1; max-width: 800px; }
.hero .label { margin-bottom: 16px; }
.hero h1 { margin-bottom: 16px; }
.hero p { color: var(--muted); font-size: 1.05rem; max-width: 560px; margin: 0 auto 32px; }
.stats-strip {
  display: flex; justify-content: center; gap: 40px;
  margin-top: 40px; padding-top: 32px;
  border-top: 1px solid var(--border);
}
.stat { text-align: center; }
.stat-value { font-family: 'Share Tech Mono', monospace; font-size: 1.8rem; font-weight: 700; color: var(--accent); }
.stat-label { font-family: 'Share Tech Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted2); margin-top: 4px; }
```

- [ ] **Step 8: Write responsive styles**

```css
/* ── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .grid-3 { grid-template-columns: 1fr 1fr; }
  .grid-4 { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  section { padding: 48px 0; }
  .hamburger { display: flex; }
  .nav-links, .nav-cta { display: none; }
  #mobile-menu {
    display: none; position: fixed; top: 64px; left: 0; right: 0;
    background: rgba(10,15,30,0.98); backdrop-filter: blur(12px);
    padding: 24px; border-bottom: 1px solid var(--border);
    flex-direction: column; gap: 16px; z-index: 199;
  }
  #mobile-menu.open { display: flex; }
  #mobile-menu a { font-size: 0.85rem; font-weight: 500; color: var(--muted); padding: 8px 0; }
  #mobile-menu a:hover { color: var(--accent); }
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  .stats-strip { flex-wrap: wrap; gap: 24px; }
  .hero { min-height: 70vh; padding: 100px 24px 60px; }
}
@media (max-width: 640px) {
  .container { padding: 0 16px; }
  .stats-strip { gap: 16px; }
}
```

- [ ] **Step 9: Write step-flow and section-specific styles**

```css
/* ── Steps / How It Works ───────────────────────────────────────── */
.steps { display: flex; gap: 24px; align-items: flex-start; }
.step { flex: 1; text-align: center; position: relative; }
.step-number {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--accent); color: #0a0f1e;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1.2rem;
  margin: 0 auto 16px;
}
.step h3 { margin-bottom: 8px; }
.step p { color: var(--muted); font-size: 0.85rem; }
.step::after {
  content: ''; position: absolute; top: 24px; left: calc(50% + 32px);
  width: calc(100% - 64px); height: 2px;
  background: var(--border2); z-index: 0;
}
.step:last-child::after { display: none; }

/* ── Why Elitez / Differentiators ───────────────────────────────── */
.diff-card { display: flex; gap: 16px; align-items: flex-start; padding: 20px; }
.diff-icon { font-size: 1.5rem; flex-shrink: 0; }
.diff-card h3 { margin-bottom: 4px; font-size: 1rem; }
.diff-card p { color: var(--muted); font-size: 0.85rem; }

/* ── Trust / Logos ──────────────────────────────────────────────── */
.logo-bar { display: flex; gap: 40px; align-items: center; justify-content: center; flex-wrap: wrap; opacity: 0.5; }
.logo-bar img { height: 32px; filter: grayscale(1) brightness(2); }

/* ── CTA Section ────────────────────────────────────────────────── */
.cta-section {
  background: linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%);
  text-align: center; padding: 80px 24px;
  border-top: 1px solid var(--border);
}
.cta-section h2 { margin-bottom: 12px; }
.cta-section p { color: var(--muted); margin-bottom: 28px; }

/* ── Footer ─────────────────────────────────────────────────────── */
footer {
  background: var(--bg); border-top: 1px solid var(--border);
  padding: 32px 24px; text-align: center;
  color: var(--muted2); font-size: 0.75rem;
}

/* ── Admin Tabs ─────────────────────────────────────────────────── */
.admin-nav { display: flex; gap: 16px; margin-bottom: 32px; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
.admin-nav a { font-size: 0.78rem; font-weight: 600; color: var(--muted); padding: 8px 12px; border-bottom: 2px solid transparent; transition: all 0.2s; }
.admin-nav a:hover, .admin-nav a.active { color: var(--accent); border-bottom-color: var(--accent); }

.tab-bar { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
.tab-btn { padding: 6px 16px; border-radius: 100px; border: 1px solid var(--border); background: transparent; color: var(--muted); font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.tab-btn:hover, .tab-btn.active { background: var(--accent); color: #0a0f1e; border-color: var(--accent); }
.tab-panel { display: none; }
.tab-panel.active { display: block; }

@media (max-width: 768px) {
  .steps { flex-direction: column; }
  .step::after { display: none; }
}
```

- [ ] **Step 10: Commit shared stylesheet**

```bash
git add css/style.css
git commit -m "feat: add shared stylesheet with Dark Authority theme"
git push
```

---

### Task 5: Shared JavaScript (js/main.js)

**Files:**
- Create: `js/main.js`

- [ ] **Step 1: Write utility functions**

```javascript
// ── Utilities ─────────────────────────────────────────────────────────────

function esc(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toggleMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
}

function showToast(msg, duration = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}
```

- [ ] **Step 2: Write scroll reveal and counter animations**

```javascript
// ── Scroll Reveal ─────────────────────────────────────────────────────────

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.animate').forEach(el => observer.observe(el));
});

// ── Counter Animation ─────────────────────────────────────────────────────

function animateCounter(el, target, suffix = '') {
  const duration = 1800;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = 'true';
      const target = parseInt(e.target.dataset.target);
      const suffix = e.target.dataset.suffix || '';
      animateCounter(e.target, target, suffix);
    }
  });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));
});
```

- [ ] **Step 3: Write smooth scroll and tab system**

```javascript
// ── Smooth Scroll ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      // Close mobile menu if open
      const menu = document.getElementById('mobile-menu');
      const hamburger = document.getElementById('hamburger');
      if (menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
        hamburger.classList.remove('open');
      }
    });
  });
});

// ── Tab System ────────────────────────────────────────────────────────────

function switchTab(tabGroup, tabId) {
  const group = document.querySelector(`[data-tab-group="${tabGroup}"]`);
  if (!group) return;
  group.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  group.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === tabId);
  });
}
```

- [ ] **Step 4: Write canvas particle animation (for hero sections)**

```javascript
// ── Canvas Particle Grid ──────────────────────────────────────────────────

function initParticleGrid(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const PARTICLE_COUNT = 60;
  const CONNECTION_DIST = 120;

  function resize() {
    w = canvas.width = canvas.parentElement.offsetWidth;
    h = canvas.height = canvas.parentElement.offsetHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59,130,246,${0.12 * (1 - dist / CONNECTION_DIST)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59,130,246,0.3)';
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
}
```

- [ ] **Step 5: Commit shared JavaScript**

```bash
git add js/main.js
git commit -m "feat: add shared JS (scroll reveal, counters, particles, tabs)"
git push
```

---

### Task 6: Main Landing Page (index.html)

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write the HTML document head**

Include: charset, viewport, title, description, full Open Graph tags, Google Fonts link (Barlow Condensed 700;800;900, Barlow 400;500;600, Share Tech Mono 400), link to css/style.css.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Elitez Security — Integrated Security Solutions</title>
  <meta name="description" content="Singapore's trusted security partner. From guard deployment to AI-powered surveillance, command center monitoring, robotics patrolling, and event security." />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://derrick-pixel.github.io/elitez-security/" />
  <meta property="og:title" content="Elitez Security — Integrated Security Solutions" />
  <meta property="og:description" content="From guard deployment to AI-powered surveillance — protecting Singapore's people and assets." />
  <meta property="og:image" content="https://derrick-pixel.github.io/elitez-security/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css" />
</head>
```

- [ ] **Step 2: Write the navigation**

```html
<body>
  <nav>
    <a href="index.html" class="nav-logo">Elitez Security</a>
    <div class="nav-links">
      <a href="#services">Services</a>
      <a href="command-center.html">Command Center</a>
      <a href="robotics.html">Robotics</a>
      <a href="#why">Why Elitez</a>
      <a href="#contact">Contact</a>
      <a href="admin.html">Analytics</a>
    </div>
    <a href="#contact" class="nav-cta">Get Assessment</a>
    <button class="hamburger" id="hamburger" onclick="toggleMenu()" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </nav>
  <div id="mobile-menu">
    <a href="#services" onclick="toggleMenu()">Services</a>
    <a href="command-center.html">Command Center</a>
    <a href="robotics.html">Robotics</a>
    <a href="#why" onclick="toggleMenu()">Why Elitez</a>
    <a href="#contact" onclick="toggleMenu()">Contact</a>
    <a href="admin.html">Analytics</a>
    <a href="admin-insights.html">Insights</a>
  </div>
```

- [ ] **Step 3: Write the hero section with canvas background**

```html
  <main>
    <section class="hero" id="hero">
      <canvas id="hero-canvas"></canvas>
      <div class="hero-content">
        <span class="label">Protecting What Matters</span>
        <h1>Integrated Security Solutions</h1>
        <p>From guard deployment to AI-powered surveillance — protecting Singapore's people and assets.</p>
        <a href="#contact" class="btn-primary">Request Security Assessment</a>
        <div class="stats-strip animate">
          <div class="stat">
            <div class="stat-value" data-counter data-target="500" data-suffix="+">0</div>
            <div class="stat-label">Guards Deployed</div>
          </div>
          <div class="stat">
            <div class="stat-value" data-counter data-target="90" data-suffix="+">0</div>
            <div class="stat-label">Sites Secured</div>
          </div>
          <div class="stat">
            <div class="stat-value">24/7</div>
            <div class="stat-label">Command Center</div>
          </div>
          <div class="stat">
            <div class="stat-value" data-counter data-target="15" data-suffix="+">0</div>
            <div class="stat-label">Years Experience</div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Write the services grid section**

```html
    <section id="services">
      <div class="container">
        <div class="text-center animate">
          <span class="label">What We Do</span>
          <h2>Our Security Services</h2>
          <p class="section-subtitle">Comprehensive security solutions tailored to your needs — from manpower to technology.</p>
        </div>
        <div class="grid-3" style="margin-top:48px;">
          <div class="card animate">
            <div class="card-icon">🛡️</div>
            <h3>Security Manpower</h3>
            <p>Trained, PLRD-licensed security officers for commercial, residential, and industrial sites.</p>
            <a href="#contact" class="card-link">Learn More →</a>
          </div>
          <div class="card animate animate-delay-1">
            <div class="card-icon">📡</div>
            <h3>Command Center Surveillance</h3>
            <p>24/7 remote monitoring with real-time incident detection and rapid response coordination.</p>
            <a href="command-center.html" class="card-link">Learn More →</a>
          </div>
          <div class="card animate animate-delay-2">
            <div class="card-icon">🤖</div>
            <h3>Robotics Patrolling</h3>
            <p>Autonomous patrol robots with AI-powered threat detection and night vision capabilities.</p>
            <a href="robotics.html" class="card-link">Learn More →</a>
          </div>
          <div class="card animate">
            <div class="card-icon">📋</div>
            <h3>Security Consultancy</h3>
            <p>Risk assessments, security audits, and compliance advisory from certified professionals.</p>
            <a href="#contact" class="card-link">Learn More →</a>
          </div>
          <div class="card animate animate-delay-1">
            <div class="card-icon">🚧</div>
            <h3>Traffic Marshall Controls</h3>
            <p>Professional traffic management for construction sites, events, and road works.</p>
            <a href="#contact" class="card-link">Learn More →</a>
          </div>
          <div class="card animate animate-delay-2">
            <div class="card-icon">🏟️</div>
            <h3>Major Event Security</h3>
            <p>End-to-end security planning and deployment for concerts, sports, and large-scale events.</p>
            <a href="#contact" class="card-link">Learn More →</a>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 5: Write the Why Elitez section**

```html
    <section id="why" style="background:var(--surface);">
      <div class="container">
        <div class="grid-2">
          <div class="animate">
            <span class="label">The Elitez Advantage</span>
            <h2>Why Choose Us</h2>
            <div style="margin-top:32px; display:flex; flex-direction:column; gap:20px;">
              <div class="diff-card">
                <div class="diff-icon">✅</div>
                <div>
                  <h3>Licensed & Certified</h3>
                  <p>PLRD licensed, DSTA approved. Every officer meets Singapore's stringent security standards.</p>
                </div>
              </div>
              <div class="diff-card">
                <div class="diff-icon">⚡</div>
                <div>
                  <h3>Technology-Enabled</h3>
                  <p>AI surveillance, autonomous robotics, and smart analytics integrated into every deployment.</p>
                </div>
              </div>
              <div class="diff-card">
                <div class="diff-icon">📈</div>
                <div>
                  <h3>Scalable Operations</h3>
                  <p>From 10 guards for your building to 500+ for a national event — we scale on demand.</p>
                </div>
              </div>
              <div class="diff-card">
                <div class="diff-icon">🔔</div>
                <div>
                  <h3>24/7 Response</h3>
                  <p>Round-the-clock command center backing every deployment with instant incident response.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="animate animate-delay-2" style="display:flex; align-items:center; justify-content:center;">
            <div class="card" style="text-align:center; padding:48px 32px;">
              <div class="stat-value" style="font-size:3rem;" data-counter data-target="90" data-suffix="+">0</div>
              <div style="color:var(--muted); margin-top:8px; font-size:0.85rem;">Sites Secured Across Singapore</div>
              <div style="margin-top:24px; border-top:1px solid var(--border); padding-top:24px;">
                <div class="label" style="margin-bottom:8px;">Trusted By</div>
                <p style="color:var(--muted); font-size:0.8rem;">Commercial · Residential · Industrial · Government · Events</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 6: Write the CTA and footer sections**

```html
    <section class="cta-section" id="contact">
      <div class="container animate">
        <span class="label">Get Started</span>
        <h2>Secure Your Premises Today</h2>
        <p>Get a complimentary security assessment from our consultants.</p>
        <a href="mailto:security@elitez.sg" class="btn-primary">Contact Us</a>
        <div style="margin-top:24px; color:var(--muted2); font-size:0.78rem;">
          <p>📧 security@elitez.sg &nbsp; | &nbsp; 📞 +65 6XXX XXXX</p>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <p>&copy; 2026 Elitez Security Pte Ltd. A business unit of Elitez Group. All rights reserved.</p>
    </div>
  </footer>

  <div class="toast" id="toast"></div>
  <script src="js/main.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      initParticleGrid('hero-canvas');
    });
  </script>
</body>
</html>
```

- [ ] **Step 7: Commit and push index.html**

```bash
git add index.html
git commit -m "feat: build main landing page with hero, services, differentiators, CTA"
git push
```

---

### Task 7: Command Center Deep-Dive Page (command-center.html)

**Files:**
- Create: `command-center.html`

- [ ] **Step 1: Write command-center.html**

Full page with:
- Same `<head>` structure as index.html (OG tags updated for this page)
- Same nav (with "Command Center" link marked `.active`)
- Hero: "24/7 COMMAND CENTER SURVEILLANCE" headline, "Real-time monitoring, instant response, total visibility." subline, canvas animation (reuse `initParticleGrid`)
- Capabilities grid (6 cards in grid-3): Live CCTV Monitoring, Incident Alert & Escalation, Access Control Integration, Video Analytics & AI Detection, Remote Guard Tour Verification, Incident Reporting & Documentation
- How It Works section (4 steps using `.steps` layout): Cameras feed → AI flags → Dispatch response → Document & report
- Integration section: text block explaining how command center connects with ground guards, robotics, and client systems
- CTA: "Schedule a Command Center Demo"
- Same footer as index.html
- Toast div + main.js script

- [ ] **Step 2: Commit and push**

```bash
git add command-center.html
git commit -m "feat: build command center deep-dive page"
git push
```

---

### Task 8: Robotics Patrolling Deep-Dive Page (robotics.html)

**Files:**
- Create: `robotics.html`

- [ ] **Step 1: Write robotics.html**

Full page with:
- Same `<head>` structure (OG tags updated)
- Same nav (with "Robotics" link marked `.active`)
- Hero: "AUTONOMOUS SECURITY PATROL" headline, "AI-powered robots that never tire, never miss, never stop." subline, canvas animation
- Capabilities grid (6 cards in grid-3): Autonomous Route Patrol, AI Threat & Anomaly Detection, License Plate Recognition, Thermal & Night Vision, Real-Time Video Streaming to Command Center, Intrusion Detection & Alerts
- How It Works section (4 steps): Robot patrols → AI detects anomaly → Alert to command center → Ground response dispatched
- Fleet Management section: Route planning, scheduling, battery management, dashboard integration
- CTA: "Request a Robotics Demo"
- Same footer, toast, scripts

- [ ] **Step 2: Commit and push**

```bash
git add robotics.html
git commit -m "feat: build robotics patrolling deep-dive page"
git push
```

---

### Task 9: Competitor Analytics Admin Page (admin.html)

**Files:**
- Create: `admin.html`
- Dependency: `data/competitors.json` (from Task 2)

- [ ] **Step 1: Write admin.html**

Full page with:
- Same `<head>` structure (OG tags updated), plus Chart.js CDN:
  `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>`
- Same main nav + admin sub-nav (`admin-nav` links: "Competitor Analytics" active, "Market Insights" links to admin-insights.html)
- Summary insights section at top: market overview stats (total competitors analyzed, avg design score, top CTAs, market split)
- Tab bar for filtering: All, Premium, Mid-Market, Budget
- Competitor cards rendered from `competitors.json` via JS: name, URL, services badges, design score (bar), mobile score (bar), tagline, strengths/weaknesses, market position badge
- Radar chart (Chart.js): comparative visualization of top 5 competitors across dimensions (design, mobile, tech, scale, brand)
- SG & SEA landscape section: market size, growth, regulatory, trends
- Design rationale section: what we borrowed, what we improved

All competitor data loaded from `data/competitors.json` via `fetch()` and rendered dynamically.

- [ ] **Step 2: Commit and push**

```bash
git add admin.html
git commit -m "feat: build competitor analytics admin dashboard"
git push
```

---

### Task 10: Market & Pricing Insights Admin Page (admin-insights.html)

**Files:**
- Create: `admin-insights.html`

- [ ] **Step 1: Write admin-insights.html**

Full page with:
- Same `<head>` + Chart.js CDN
- Same main nav + admin sub-nav ("Market Insights" active)
- Market Overview section: SG security industry size ($X billion), growth rate, PLRD regulatory landscape, key trends
- Pricing Tiers section: table/cards showing Budget/Mid/Premium ranges for guard services (per guard/month), command center monitoring (per camera/site), event security (per event), consultancy (per engagement)
- Target Personas section: cards for each persona (MCST Committee, Facility Manager, Corporate Security Director, Event Organizer, Construction Site Manager) with demographics, needs, pain points, decision factors
- Willingness-to-Pay Analysis: per-persona price sensitivity, value drivers, competitor benchmarks
- Competitive Gaps section: where Elitez can differentiate (tech integration, robotics, bundled services, command center + guards)
- Next-Best Alternatives section: what prospects use if not Elitez — direct competitors, in-house guards, DIY CCTV, auxiliary police

- [ ] **Step 2: Commit and push**

```bash
git add admin-insights.html
git commit -m "feat: build market & pricing insights admin page"
git push
```

---

### Task 11: OG Image Generation & Final Polish

**Files:**
- Create: `gen-og.js` (Node script for generating OG image)
- Create: `og-image.jpg`

- [ ] **Step 1: Create OG image generator**

Write `gen-og.js` using Node.js canvas (or use a simple HTML-to-image approach). The OG image (1200x630) should feature:
- Dark background matching site palette (#0a0f1e)
- "ELITEZ SECURITY" in Barlow Condensed, white
- "Integrated Security Solutions" subline
- Steel blue accent line/element
- Subtle grid overlay matching the particle theme

```bash
node gen-og.js
```

If Node canvas is not available, create a simple `og-template.html` that can be screenshot-captured, or use a CSS-based approach.

- [ ] **Step 2: Verify all pages**

Open each page in browser and verify:
- Navigation works across all pages
- Mobile hamburger works
- Scroll animations fire
- Counter animations work
- Canvas particle grid renders
- Admin pages load competitor data
- Charts render
- All links work

- [ ] **Step 3: Final commit and push**

```bash
git add .
git commit -m "feat: add OG image and final polish"
git push
```

- [ ] **Step 4: Enable GitHub Pages**

```bash
gh api repos/derrick-pixel/elitez-security/pages -X POST -f source.branch=main -f source.path="/" 2>/dev/null || echo "Pages already enabled"
```

---

### Task 12: Stitch Design System (Optional Enhancement)

**Files:** None (Stitch is external MCP tool)

- [ ] **Step 1: Create Stitch project**

Use `mcp__stitch__create_project` to create an "Elitez Security" project.

- [ ] **Step 2: Create design system**

Use `mcp__stitch__create_design_system` with the Dark Authority palette, Barlow Condensed + Barlow fonts, component styles.

- [ ] **Step 3: Generate screen mockups**

Use `mcp__stitch__generate_screen_from_text` for:
- Homepage hero
- Services grid
- Command center page
- Robotics page

- [ ] **Step 4: Apply design system across screens**

Use `mcp__stitch__apply_design_system` for consistency.

---

## Execution Order Summary

| Task | Description | Dependencies |
|------|-------------|--------------|
| 1 | GitHub repo + scaffold | None |
| 2 | Competitor research (30+ sites) | Task 1 |
| 3 | colors.html (5 palette proposals) | Task 1 |
| 4 | css/style.css (shared stylesheet) | Task 3 (palette chosen) |
| 5 | js/main.js (shared scripts) | None (can parallel with Task 4) |
| 6 | index.html (main landing page) | Tasks 4, 5 |
| 7 | command-center.html | Tasks 4, 5 |
| 8 | robotics.html | Tasks 4, 5 |
| 9 | admin.html (competitor analytics) | Tasks 2, 4, 5 |
| 10 | admin-insights.html (market insights) | Tasks 4, 5 |
| 11 | OG image + final polish | All above |
| 12 | Stitch design system (optional) | Task 4 |

**Parallelizable:** Tasks 4+5, Tasks 6+7+8 (after 4+5), Tasks 9+10 (after 4+5+2)
