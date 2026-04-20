# Elitez_MRI · AEVUM

**A specialist preventative diagnostic imaging clinic in Johor Bahru.**
A brand of Elitez Group of Companies.

🔗 Live: https://derrick-pixel.github.io/Elitez_MRI/
📦 GitHub: https://github.com/derrick-pixel/Elitez_MRI

---

## Current state · v0.4

The site at the root URL is the **chosen direction** (Style VII — The Radiologist's Office, light medical navy + sage). Polished from v0.3 with:

- **FAQ section** addressing the six most common pre-booking questions (safety, incidental findings, comparison to Prenuvo/Function, why Johor Bahru, GP referrals, scan cadence)
- **Longitudinal-benefit section** explaining the 12-month re-read protocol — the discipline the clinical evidence actually supports
- **Floating WhatsApp concierge button** (bottom-right, always visible)
- **Sun/moon theme toggle** (light default, dark optional, persisted via localStorage)
- **Refreshed OG image** — medical card aesthetic with real MRI scan, full trust bar, "From RM 1,999 →"

## Site map

| File | Purpose |
|---|---|
| `index.html` | **Primary site** — Style VII polished, the chosen direction |
| `selector.html` | Style chooser — every direction explored to date (v0.1–v0.3) |
| `admin.html` | Competitor research panel (30+ competitors, sentiment, market sizing) |
| `admin-insights.html` | Pricing strategy panel (8 models, 4 personas, WTP triangulation) |
| `style-clinic.html` | Original Style VII (preserved, also accessible via selector) |
| `style-atlas.html`, `style-evidence.html` | Other v0.3 directions, archived |
| `style-twilight.html`, `style-cinematic.html`, `style-console.html` | v0.2 directions, archived |
| `style-editorial.html`, `style-clinical.html`, `style-obsidian.html` | v0.1 directions, archived |
| `og-image.jpg` | WhatsApp/social-share thumbnail (1200×630) |

## What every guest-facing page now includes

1. **Real MRI scan visualization** in the hero (sagittal head SVG with cerebrum, ventricles, cerebellum, annotated leader lines)
2. **Regulatory trust bar directly under the hero** — Act 586 / MDA / FDA-CE / MSQH (not hidden in footer)
3. **Three named consultant radiologists with full credentials** — Dr. A. Lim (FRCR, ex-SGH), Dr. R. Balachandran (MR Neuroradiology, Toronto), Dr. M. Tan (Cardiac MRI, Brisbane). Placeholders pending hires.
4. **Anatomical body diagram** showing scan coverage by region with numbered callouts
5. **Sample diagnostic report excerpt** — what guests literally receive on the day, with watermarked SPECIMEN
6. **Honesty triangle** — "What we claim · what we don't · what the literature says". Engages the ACR / CAR Sept 2025 debate openly, cites Hegenscheid 2013 and Lee 2024.
7. **FAQ accordion** addressing safety, incidental findings, comparison to Prenuvo/Function, location rationale, cadence

## Brand summary

- **Name:** AEVUM (an Elitez Group company)
- **Location:** Nusajaya, Johor Bahru — adjacent to Columbia Asia Hospital
- **Positioning:** Specialist preventative diagnostic imaging; built on named consultants, double-read protocol, in-person 60-min consult, longitudinal 12-month re-read.
- **Packages:** Core RM 1,999 (S$575) → Comprehensive RM 8,699 (S$2,499) → Legacy Ultimate RM 17,499 (S$4,999) → Legacy Platinum RM 24,499 (S$6,999)
- **Hardware:** 2× Siemens MAGNETOM Amira 1.5T + 1× Siemens MAGNETOM Vida 3.0T + low-dose CT (Platinum tier)
- **Regulatory:** Act 586 Ambulatory Care Centre · MDA Reliance Program · MAB-compliant marketing · MSQH accreditation in pursuit (H2 2026)
- **Launch timing:** Q3 2026 soft-launch · Q4 2026 full launch timed to RTS Link opening (5-min Singapore↔JB crossing)

## Tech stack

Vanilla HTML5 + CSS3 + JavaScript. No frameworks, no build steps, no dependencies. Google Fonts via CDN. Static deployment via GitHub Pages.

## Suggested next steps for v0.5

- Real photography (facility renderings, lounge interiors, reception)
- MAB-compliance copy review by a Malaysian healthcare lawyer
- Bahasa Indonesia microsite for the Jakarta HNW market
- Wire the inquiry form to CRM / WhatsApp Business API
- Replace placeholder radiologist names with actual hires once recruited
- Add a "Founders' List" / pre-booking page with deposits

---

© 2026 · Elitez Group of Companies
