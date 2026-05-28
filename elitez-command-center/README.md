# Elitez Integrated Command Center

A multi-page static **sales-fronting website** for the **Elitez Integrated Command
Center** — a centralised technology node that runs field operations across seven
Elitez Group business units and delivers managed command-centre services to
external clients across Singapore.

The site sells the Command Center to two audiences (internal Elitez business units
and external clients); the **CAPEX** page is the one internal investment view.

## Live site

GitHub Pages: `https://derrick-pixel.github.io/elitez-command-center/`

## Stack

- Semantic HTML5, vanilla ES6+ JavaScript (no framework)
- [Tailwind CSS](https://tailwindcss.com) via CDN — brand tokens in each page's `tailwind.config`
- [Chart.js](https://www.chartjs.org) via CDN — CAPEX doughnut + ROI charts
- `Barlow` (standard width) throughout, Google Fonts
- Interpol "Global Operations" concept — steel-blue + notice-red institutional
  palette, seal logo, utility bar, globe-ring backdrop, squared geometry
- Custom keyframes, scroll-reveal and the video-wall simulation in `styles.css` / `app.js`

## Pages

| File | Status | Purpose |
|------|--------|---------|
| `index.html` | ✅ Built | Sales landing — hero, live video-wall, "For BUs / For Clients" split, services preview, 7-BU grid |
| `services.html` | ✅ Built | Six managed services, the field→dispatch flow, engagement model |
| `capabilities.html` | 🚧 Scaffold | Multi-tenant operations integration — full build deferred to a later phase |
| `manless-security.html` | ✅ Built | FCD Manless Security product — FEDA/DTS, 4-tier licensing, package, cost comparison |
| `ifm.html` | ✅ Built | IFM Command Center — the Integrated Facilities Management expansion thesis (7 service lines) |
| `capex.html` | ✅ Built | Capital expenditure — $650K doughnut, EDG/WDG(JR+)/CCP subsidy bars, $275K net |
| `roi-calculator.html` | ✅ Built | Two-mode calculator — Client Savings + Investment Payback, with live charts |

`app.js` carries the shared data models (services, business units), the video-wall
simulation, the CAPEX charts and the ROI calculator logic.

## Design samples

`design-samples/` holds 13 explored visual flavours (see `design-samples/index.html`).
The live site uses concept 09 — Interpol "Global Operations" — the selected direction.

## Brand colour system

| Token | Hex | Use |
|-------|-----|-----|
| Gold | `#D4AF37` | Core / base accent |
| Charcoal | `#333333` | Dark layout / Elitez Security |
| Royal Blue | `#3498DB` | MSF Safety Division |
| Bold Orange | `#E67E22` | FMCG Operations |
| Active Teal | `#1ABC9C` | Service Delivery Ops |
| Asphalt Grey | `#7F8C8D` | AB Associates |
| Royal Purple | `#8E44AD` | Merchandising BU |
| Aero Blue | `#2980B9` | Elitez Aviation |

## Local preview

No build step. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8080
```

---

© Elitez Group of Companies.
