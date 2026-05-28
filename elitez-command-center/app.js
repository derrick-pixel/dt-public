/* ===================================================================
   Elitez Integrated Command Center — app.js
   Central client-side controller for the sales-fronting site:
   navigation, scroll reveals, the live video-wall simulation, the
   shared service + business-unit data models, the CAPEX charts and
   the two-mode ROI calculator.
   Dependencies: Tailwind + Chart.js (CDN, loaded per page where needed).
   All DOM is built with safe element/textContent APIs — no innerHTML.
   =================================================================== */
'use strict';

/* DOM helper — create an element with classes, text, attrs, style, kids */
function el(tag, opts) {
  opts = opts || {};
  const node = document.createElement(tag);
  if (opts.cls) node.className = opts.cls;
  if (opts.text != null) node.textContent = opts.text;
  if (opts.attrs) for (const k in opts.attrs) node.setAttribute(k, opts.attrs[k]);
  if (opts.style) for (const k in opts.style) node.style.setProperty(k, opts.style[k]);
  if (opts.children) opts.children.forEach(c => c && node.appendChild(c));
  return node;
}

/* Lucide icon catalogue — inner SVG content per name, ISC-licensed.
   Use iconNode(name, size) or iconSVG(name, size) to render. */
const LUCIDE = {
  'bot': '<path d="M12 8V4H8" /> <rect width="16" height="12" x="4" y="8" rx="2" /> <path d="M2 14h2" /> <path d="M20 14h2" /> <path d="M15 13v2" /> <path d="M9 13v2" />',
  'boxes': '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /> <path d="m7 16.5-4.74-2.85" /> <path d="m7 16.5 5-3" /> <path d="M7 16.5v5.17" /> <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /> <path d="m17 16.5-5-3" /> <path d="m17 16.5 4.74-2.85" /> <path d="M17 16.5v5.17" /> <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /> <path d="M12 8 7.26 5.15" /> <path d="m12 8 4.74-2.85" /> <path d="M12 13.5V8" />',
  'brain-circuit': '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /> <path d="M9 13a4.5 4.5 0 0 0 3-4" /> <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" /> <path d="M3.477 10.896a4 4 0 0 1 .585-.396" /> <path d="M6 18a4 4 0 0 1-1.967-.516" /> <path d="M12 13h4" /> <path d="M12 18h6a2 2 0 0 1 2 2v1" /> <path d="M12 8h8" /> <path d="M16 8V5a2 2 0 0 1 2-2" /> <circle cx="16" cy="13" r=".5" /> <circle cx="18" cy="3" r=".5" /> <circle cx="20" cy="21" r=".5" /> <circle cx="20" cy="8" r=".5" />',
  'bug': '<path d="M12 20v-9" /> <path d="M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z" /> <path d="M14.12 3.88 16 2" /> <path d="M21 21a4 4 0 0 0-3.81-4" /> <path d="M21 5a4 4 0 0 1-3.55 3.97" /> <path d="M22 13h-4" /> <path d="M3 21a4 4 0 0 1 3.81-4" /> <path d="M3 5a4 4 0 0 0 3.55 3.97" /> <path d="M6 13H2" /> <path d="m8 2 1.88 1.88" /> <path d="M9 7.13V6a3 3 0 1 1 6 0v1.13" />',
  'cable': '<path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /> <path d="M17 21v-2" /> <path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /> <path d="M21 21v-2" /> <path d="M3 5V3" /> <path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /> <path d="M7 5V3" />',
  'door-closed': '<path d="M10 12h.01" /> <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" /> <path d="M2 20h20" />',
  'door-open': '<path d="M11 20H2" /> <path d="M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z" /> <path d="M11 4H8a2 2 0 0 0-2 2v14" /> <path d="M14 12h.01" /> <path d="M22 20h-3" />',
  'droplets': '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" /> <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />',
  'fence': '<path d="M4 3 2 5v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z" /> <path d="M6 8h4" /> <path d="M6 18h4" /> <path d="m12 3-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z" /> <path d="M14 8h4" /> <path d="M14 18h4" /> <path d="m20 3-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z" />',
  'file-chart-line': '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /> <path d="M14 2v5a1 1 0 0 0 1 1h5" /> <path d="m16 13-3.5 3.5-2-2L8 17" />',
  'gauge': '<path d="m12 14 4-4" /> <path d="M3.34 19a10 10 0 1 1 17.32 0" />',
  'layout-dashboard': '<rect width="7" height="9" x="3" y="3" rx="1" /> <rect width="7" height="5" x="14" y="3" rx="1" /> <rect width="7" height="9" x="14" y="12" rx="1" /> <rect width="7" height="5" x="3" y="16" rx="1" />',
  'layout-grid': '<rect width="7" height="7" x="3" y="3" rx="1" /> <rect width="7" height="7" x="14" y="3" rx="1" /> <rect width="7" height="7" x="14" y="14" rx="1" /> <rect width="7" height="7" x="3" y="14" rx="1" />',
  'lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /> <path d="M9 18h6" /> <path d="M10 22h4" />',
  'lock-keyhole': '<circle cx="12" cy="16" r="1" /> <rect x="3" y="10" width="18" height="12" rx="2" /> <path d="M7 10V7a5 5 0 0 1 10 0v3" />',
  'mouse-pointer-click': '<path d="M14 4.1 12 6" /> <path d="m5.1 8-2.9-.8" /> <path d="m6 12-1.9 2" /> <path d="M7.2 2.2 8 5.1" /> <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" />',
  'network': '<rect x="16" y="16" width="6" height="6" rx="1" /> <rect x="2" y="16" width="6" height="6" rx="1" /> <rect x="9" y="2" width="6" height="6" rx="1" /> <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" /> <path d="M12 12V8" />',
  'paintbrush': '<path d="m14.622 17.897-10.68-2.913" /> <path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z" /> <path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15" />',
  'radar': '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" /> <path d="M4 6h.01" /> <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" /> <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" /> <path d="M12 18h.01" /> <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" /> <circle cx="12" cy="12" r="2" /> <path d="m13.41 10.59 5.66-5.66" />',
  'scan-eye': '<path d="M3 7V5a2 2 0 0 1 2-2h2" /> <path d="M17 3h2a2 2 0 0 1 2 2v2" /> <path d="M21 17v2a2 2 0 0 1-2 2h-2" /> <path d="M7 21H5a2 2 0 0 1-2-2v-2" /> <circle cx="12" cy="12" r="1" /> <path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0" />',
  'scan-face': '<path d="M3 7V5a2 2 0 0 1 2-2h2" /> <path d="M17 3h2a2 2 0 0 1 2 2v2" /> <path d="M21 17v2a2 2 0 0 1-2 2h-2" /> <path d="M7 21H5a2 2 0 0 1-2-2v-2" /> <path d="M8 14s1.5 2 4 2 4-2 4-2" /> <path d="M9 9h.01" /> <path d="M15 9h.01" />',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /> <path d="m9 12 2 2 4-4" />',
  'siren': '<path d="M7 18v-6a5 5 0 1 1 10 0v6" /> <path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" /> <path d="M21 12h1" /> <path d="M18.5 4.5 18 5" /> <path d="M2 12h1" /> <path d="M12 2v1" /> <path d="m4.929 4.929.707.707" /> <path d="M12 12v6" />',
  'sparkles': '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" /> <path d="M20 2v4" /> <path d="M22 4h-4" /> <circle cx="4" cy="20" r="2" />',
  'thermometer-sun': '<path d="M12 2v2" /> <path d="M12 8a4 4 0 0 0-1.645 7.647" /> <path d="M2 12h2" /> <path d="M20 14.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z" /> <path d="m4.93 4.93 1.41 1.41" /> <path d="m6.34 17.66-1.41 1.41" />',
  'trees': '<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z" /> <path d="M7 16v6" /> <path d="M13 19v3" /> <path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5" />',
  'trending-up': '<path d="M16 7h6v6" /> <path d="m22 7-8.5 8.5-5-5L2 17" />',
  'workflow': '<rect width="8" height="8" x="3" y="3" rx="2" /> <path d="M7 11v4a2 2 0 0 0 2 2h4" /> <rect width="8" height="8" x="13" y="13" rx="2" />',
  'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />',
  'zap': '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />'
};

function iconSVG(name, size) {
  size = size || 24;
  const inner = LUCIDE[name] || '';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size +
         '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
         'stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
}
function iconNode(name, size) {
  const tpl = document.createElement('span');
  tpl.style.display = 'inline-flex';
  // DOMParser is safe and avoids the innerHTML hook
  const doc = new DOMParser().parseFromString(iconSVG(name, size), 'image/svg+xml');
  tpl.appendChild(doc.documentElement);
  return tpl.firstChild;
}

/* Legacy single-path SVG helper kept for back-compat */
function svgIcon(d, size) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', size || 24);
  svg.setAttribute('height', size || 24);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', d);
  svg.appendChild(path);
  return svg;
}

/* number formatting */
const SGD = n => '$' + Math.round(n).toLocaleString('en-SG');

/* -------------------------------------------------------------------
   1. SHARED DATA
   ------------------------------------------------------------------- */
const BUSINESS_UNITS = [
  { key:'security', name:'Elitez Security', hex:'#333333', metric:'140 officers · 50 sites',
    blurb:'Virtual guard-house workflows, remote EM-lock release and on-demand mobile dispatch.',
    context:'Elitez Security deploys 140 officers managing physical protection and access control across 50 islandwide sites.',
    integration:'The command centre replaces labour-intensive guard posts with remote virtual guarding — distributed IP cameras stream to the video wall, and IP relays give operators remote control of EM side-doors and vehicle gantry gates.',
    workflow:[
      'A visitor arrives at a manless site and presses a two-way SIP video intercom.',
      'The call routes to the command centre; the visitor’s image and credentials appear on the video wall.',
      'The operator verifies identity and issues a remote IP signal to release the EM door.',
      'On a perimeter breach, an AI intrusion alert pops the live feed — the operator issues an audio challenge and dispatches the nearest mobile officer by GPS.'
    ] },
  { key:'msf', name:'MSF Safety Division', hex:'#3498DB', metric:'Islandwide checkpoints',
    blurb:'GPS safety-officer tracking with AI-automated hazard reporting and compliance audits.',
    context:'MSF deploys safety-check officers across islandwide industrial and commercial checkpoints to audit regulatory safety compliance.',
    integration:'Real-time GPS tracking of officers’ mobile devices, paired with an AI report-generation engine.',
    workflow:[
      'The command centre’s GIS module tracks officer routes and verifies checkpoints are completed on schedule.',
      'On detecting a hazard, the officer captures a photo and logs the details in the mobile app.',
      'The AI engine ingests the inputs, compiling them against historical hazard metrics and regulatory clauses.',
      'A compliant safety-audit report is generated and transmitted to clients and regulators within minutes.'
    ] },
  { key:'fmcg', name:'Elitez FMCG Ops', hex:'#E67E22', metric:'Up to 200 promoters',
    blurb:'Geofenced biometric check-ins and automated weekly campaign report compilation.',
    context:'FMCG Operations manages up to 200 in-store promoters deployed across supermarkets and retail centres islandwide.',
    integration:'Geo-fenced biometric clock-in, real-time campaign status reporting and automated weekly report generation.',
    workflow:[
      'A promoter clocks in at their outlet via facial recognition, cross-referenced against device GPS.',
      'If a promoter is late or fails to clock in, the command centre triggers an automated reminder and alerts the scheduler.',
      'Promoters photograph product displays and input sales metrics directly in the app.',
      'The command centre aggregates the data into weekly sales and campaign-performance reports for brand managers.'
    ] },
  { key:'service', name:'Service Delivery Ops', hex:'#1ABC9C', metric:'150–250 personnel',
    blurb:'Hospital visitor queue management and crowd-density video analytics.',
    context:'Service Delivery directs high-volume, public-facing teams — hospital visitor queues, NEA enforcement patrols and hotel service operations.',
    integration:'Real-time workforce rostering, crowd-density video analytics and incident-focused patrol dispatch.',
    workflow:[
      'Crowd-density analytics track visitor queues at hospital registration points.',
      'When congestion crosses a preset threshold, the command centre alerts the on-site supervisor to deploy additional staff.',
      'For NEA enforcement, patrol teams are tracked live on a GIS map.',
      'Operators route officers to reported littering and smoking hotspots to improve enforcement coverage.'
    ] },
  { key:'ab', name:'AB Associates', hex:'#7F8C8D', metric:'100 painters · 10–20 sites',
    blurb:'Scaffolding hazard detection and structural progress tracking at height.',
    context:'AB Associates deploys 100 professional painters across 10–20 building and estate repainting projects.',
    integration:'High-resolution progress capture, structural safety-compliance monitoring and automated client status reporting.',
    workflow:[
      'Mobile cameras and on-site video streams monitor active painting sites.',
      'Safety analytics scan scaffolding and cradle platforms, flagging any painter operating without a fall-arrest harness or helmet.',
      'Operators capture progress photos at scheduled intervals.',
      'The command centre compiles the imagery against project timelines into weekly structural-progress reports for building owners.'
    ] },
  { key:'merch', name:'Merchandising BU', hex:'#8E44AD', metric:'100–150 merchandisers',
    blurb:'Supermarket shelf-share monitoring and real-time competitor activity tracking.',
    context:'The Merchandising unit deploys 100–150 merchandisers across supermarkets to optimise product visibility and direct in-store campaigns.',
    integration:'Live shelf-share monitoring, real-time competitor tracking and mobile point-of-sale-material audit reporting.',
    workflow:[
      'Merchandisers capture structured images of store shelves — stock levels, shelf share, competitor promotions.',
      'The command centre compares the images against established display guidelines.',
      'If a deviation is detected, the system alerts the on-site merchandiser to adjust product positioning.',
      'Competitor pricing and launches feed live pricing dashboards that support shelf-frontage negotiations.'
    ] },
  { key:'aviation', name:'Elitez Aviation', hex:'#2980B9', metric:'80 → 200 technicians',
    blurb:'Biometric nominal-roll logins for ALSS aircraft maintenance technicians.',
    context:'Elitez Aviation deploys aircraft maintenance technicians under the Aerospace Labour Supply Scheme, scaling from 80 toward 200.',
    integration:'Biometric nominal-roll authentication, certification-compliance tracking and daily shift-attendance reporting.',
    workflow:[
      'Technicians authenticate each shift via facial-recognition kiosks at hangar entry points.',
      'The command centre compares the biometric scans against scheduled shift rosters.',
      'If a technician is absent, the system alerts operations managers within 15 minutes of shift commencement.',
      'Stand-by personnel are deployed quickly, preventing operational delays in aircraft hangars.'
    ] }
];

const SERVICES = [
  { id:'monitoring', n:'01', name:'Remote Site Monitoring', img:'svc-monitoring.webp',
    tag:'Virtual operations', iconName:'scan-eye',
    blurb:'24/7 virtual operations from a central 8-metre video wall — 200 concurrent H.265 feeds, AI-triaged so operators act on what matters.' },
  { id:'analytics', n:'02', name:'AI Video Analytics', img:'svc-analytics.webp',
    tag:'Computer vision', iconName:'brain-circuit',
    blurb:'Parallel computer-vision models for intrusion and line-crossing, PPE compliance, crowd density and gantry access exceptions.' },
  { id:'dispatch', n:'03', name:'Mobile Dispatch & Response', img:'svc-dispatch.webp',
    tag:'Tactical response', iconName:'siren',
    blurb:'Geo-routed dispatch to the nearest officer, patrol or drone the moment an alert fires — closing the loop from detection to action.' },
  { id:'iot', n:'04', name:'IoT Remote Control', img:'svc-iot.webp',
    tag:'Bi-directional control', iconName:'network',
    blurb:'Remote EM-lock release, vehicle gantry strike, two-way SIP intercom and bi-directional control of field IoT devices.' },
  { id:'reporting', n:'05', name:'Automated Reporting', img:'svc-reporting.webp',
    tag:'Compliance', iconName:'file-chart-line',
    blurb:'AI-compiled reports for clients and regulators — formatted, evidenced against historical metrics and delivered in minutes.' },
  { id:'ccaas', n:'06', name:'CCaaS White-Label', img:'svc-ccaas.webp',
    tag:'Command-centre-as-a-service', iconName:'layout-grid',
    blurb:'Command-centre infrastructure leased to boutique security agencies — compliant managed operations, with no capital build.' }
];

/* -------------------------------------------------------------------
   SERVICES_DEEP — bento-drawer content (Singapore-specific market detail)
   ------------------------------------------------------------------- */
const SERVICES_DEEP = {
  monitoring: {
    what: 'A central operations floor watches every connected site live — H.265/H.264 streams from the field flow into a video-wall layout, with AI-triage promoting only the feeds that need a human eye. Operators work to runbooks per site, with two-way audio, talk-down and gantry control wired into the same console. Storage and audit are recorded against SS 558 retention, so every action a buyer or regulator asks about can be replayed.',
    buyers: [
      '<strong>FEDA dormitory operators</strong> — covering Class 2–4 sites under DTS-2030 retrofit obligations.',
      '<strong>Industrial &amp; logistics estates</strong> — replacing static-guard rosters under the 2026–2028 PWM wage steps.',
      '<strong>Commercial MCSTs</strong> — single-site monitoring plus tenant CCTV oversight.',
      '<strong>Internal Elitez business units</strong> — group cost-allocation across captive sites.',
      '<strong>Boutique security agencies</strong> — white-labelled into their own brand under CCaaS.'
    ],
    tech: [
      'VMS layer — Milestone XProtect / Genetec Security Center class platforms',
      'Edge ingest — ONVIF S/T-conformant cameras, RTSP failover, H.265 default',
      'Edge AI — NVIDIA Jetson / Hailo accelerators for line-crossing + PPE pre-filter',
      'Network — primary fibre with 4G/5G cellular failover per site',
      'Audio — SIP intercom + IP PA talk-down on the same workstation',
      'Storage — on-site NVR + cloud cold-tier (SS 558 §6 retention)',
      'Identity — RBAC via the operator workstation, every action audit-logged'
    ],
    slas: [
      'Concurrent streams: <strong>up to 200 H.265 / 4K15</strong> per floor',
      'Alert verification: <strong>≤30 s P95</strong> from analytics fire to operator review',
      'Two-way audio acknowledge: <strong>≤45 s P95</strong>',
      'Recording retention: <strong>30 days minimum</strong>, configurable to 90 (SS 558)',
      'Operator coverage: <strong>24 × 7 × 365</strong>, two redundant shifts',
      'False-alert rate: <strong>&lt;5%</strong> at production thresholds'
    ],
    pricing: 'The Singapore market quotes remote monitoring at <strong>S$80–250 per camera per month</strong> for managed VSaaS plus a per-site coordination retainer. Elitez is sold per-site, not per-camera, so the price is predictable: <strong>Sentinel S$3,200/mo</strong> for one commercial site, <strong>Garrison S$5,500/mo</strong> for a typical 1,000-bed FEDA dormitory. Subscription buyers can apply <strong>PSG (50%, cap S$30k)</strong> once the package secures an IMDA pre-approved listing; capability-transformation projects co-fund 50% under <strong>EDG</strong>.',
    standards: [
      '<strong>PLRD</strong> — Singapore Police Licensing &amp; Regulatory Department licence to operate as a security agency.',
      '<strong>SS 558</strong> — code of practice for security monitoring centres; defines retention, redundancy, response.',
      '<strong>ISO 22301</strong> — business-continuity for the monitoring centre itself.',
      '<strong>ISO 27001</strong> — information-security on the VMS + audit log.',
      '<strong>PDPA</strong> — DPO appointed, video data classified, third-party access logged.'
    ],
    differentiator: 'Certis Mozart and AETOS run command centres at MHA / critical-infrastructure scale; SECOM operates a CAMS-licensed alarm centre since 2009; Ademco runs Asia\'s largest licensed 24/7 monitoring centre (8,000 clients). What Elitez does that they do not: <strong>per-site subscription at SME/dormitory price</strong>, multi-tenant operating model proven across seven different Elitez operations, and the integration into Elitez Security manned response and AB Associates trades — so monitoring resolves into action, not a callback.',
    deployments: [
      '<strong>FEDA 1,200-bed dormitory</strong> — ~48 cameras, 6 gates, two retained gate officers, S$5,500/mo (Garrison tier).',
      '<strong>Single commercial office tower</strong> — ~24 cameras, 2 EM-lock entries, S$3,200/mo (Sentinel tier).',
      '<strong>Multi-site internal Elitez book</strong> — 50 captive sites at S$2,800/site/mo on group cost-allocation; de-risks the S$650K build via captive demand.'
    ]
  },
  analytics: {
    what: 'Parallel computer-vision models run on edge accelerators at each site, evaluating the live feed against that site\'s ruleset and only escalating events that match. The same camera can host an intrusion model, a PPE model and a crowd-density model simultaneously, with thresholds tuned per zone. The output is not "more video" — it is a sparse stream of typed events that the operator and the rules engine can act on.',
    buyers: [
      '<strong>Construction &amp; work-at-height contractors</strong> — PPE compliance for MOM workplace safety.',
      '<strong>FEDA dormitories</strong> — gantry access exceptions, fence intrusion at night.',
      '<strong>Retail / commercial buyers</strong> — queue density, loitering, after-hours intrusion.',
      '<strong>Critical-infrastructure operators</strong> — perimeter and LPR at loading bays.',
      '<strong>Boutique agencies (white-label)</strong> — bidding for outcome-based contracts under MHA OBC.'
    ],
    tech: [
      'Inference — NVIDIA Jetson Orin / Hailo-8 / Ambarella CV-class at the edge',
      'Models — line-crossing, intrusion, PPE (helmet/vest/harness), crowd density, LPR, smoke/fire pre-trigger',
      'Frameworks — DeepStream / ONNX runtime, YOLOv8-class detectors with FP16 quantisation',
      'VMS integration — events emitted over ONVIF / MQTT into the VMS alert queue',
      'Tuning — site-specific ROI zones + scheduled rule profiles (day / night / weekend)',
      'Audit — every fired event stored with the triggering frame for compliance review',
      'Stated precision: <strong>95–99%</strong> at production thresholds'
    ],
    slas: [
      'Detection precision: <strong>95–99%</strong> at production thresholds',
      'End-to-end alert latency: <strong>≤2 s edge to operator</strong>',
      'Models per stream: <strong>up to 4 in parallel</strong> on Jetson Orin class',
      'Stream support: <strong>4K15 H.265</strong> with multi-model inference',
      'Rule profiles per site: <strong>unlimited</strong>, scheduled or geofenced',
      'False-positive rate: <strong>&lt;5%</strong> after the first calibration cycle'
    ],
    pricing: 'AI video analytics sells in Singapore at <strong>S$25–80 per camera per month</strong> as an add-on to VSaaS, or bundled with command-centre services. Elitez bundles analytics into the per-site tier — <strong>included in Sentinel, Garrison and Command Partner</strong> — so the buyer is not pricing software, they are pricing the outcome. Where a buyer requires more than 4 parallel models per stream, an uplift applies. The capability typically qualifies for <strong>PSG 50%</strong> as an IMDA pre-approved productivity solution.',
    standards: [
      '<strong>PDPA</strong> — facial-recognition models classified under "personal data", consent + DPIA required for biometric use.',
      '<strong>MOM Workplace Safety &amp; Health Act</strong> — PPE detection feeds into employer compliance records.',
      '<strong>SS 558</strong> — analytics events count toward incident reporting obligations.',
      '<strong>IMDA Smart Nation</strong> — IoT/AI privacy-by-design references applied to model deployment.',
      '<strong>ISO 27001</strong> — model artefacts and training data treated as classified information.'
    ],
    differentiator: 'Oneberry\'s ARVAS is the closest Singapore analogue and the design-audit benchmark for proof storytelling; Certis Mozart fuses analytics across MHA-scale estates; AETOS runs analytics on 5G into a digital twin. Aspectus markets a 24/7 ICC with analytics. Elitez\'s difference: <strong>analytics is included, not metered</strong>; it pre-filters into the human-in-the-loop workflow rather than auto-actioning; and the same models route into Elitez Security guarding + AB Associates trades for closed-loop response.',
    deployments: [
      '<strong>Construction site (3 active zones)</strong> — 12 cameras × PPE + intrusion models; integrates into the daily MOM safety log.',
      '<strong>Dormitory gantry &amp; fence line</strong> — 4 gantries with LPR + line-crossing, 12 perimeter cameras with intrusion; alert volume tuned to ~6/night.',
      '<strong>Commercial loading bay</strong> — LPR for vehicle access plus crowd analytics on the loading apron during peak hours.'
    ]
  },
  dispatch: {
    what: 'The moment an alert is verified, the dispatch layer routes a response on the shortest viable path — a mobile officer, a marked patrol vehicle, a partner drone or an SOS gantry — selected by live geo-location and current load. The operator authorises, the response is tracked end-to-end, and the eventual close-out feeds the audit log. The "command centre" promise only holds if the centre can <em>act</em>; this is the layer that closes the loop.',
    buyers: [
      '<strong>Building owners under OBC tenders</strong> — outcome-based contracts require a measurable response, not a guard headcount.',
      '<strong>FEDA dormitory operators</strong> — MOM incident-reporting timelines (15 min, 1 h, 24 h).',
      '<strong>Industrial estates</strong> — after-hours response and on-call cover.',
      '<strong>Insurance &amp; claims-driven buyers</strong> — needing time-stamped incident response evidence.',
      '<strong>Group HQ / chief security officers</strong> — wanting a single response SLA across a multi-site portfolio.'
    ],
    tech: [
      'Dispatch engine — geofenced officer pool, real-time GPS, shortest-time routing',
      'Comms — TETRA / 4G push-to-talk + LMR backup for primary response',
      'Field app — mobile dispatch + incident form on Android tablets',
      'Drone integration — partner-operated UAVs (CAAS-compliant zones only)',
      'Two-way audio talk-down at site before officer arrival',
      'Live map — operator view of every responder + active incident',
      'Audit — every dispatch decision, ETA, arrival, close-out timestamped'
    ],
    slas: [
      'Time to dispatch: <strong>≤90 s P95</strong> from operator decision',
      'Arrival at site (urban SG): <strong>≤15 min P95</strong>',
      'Officer roster: <strong>24 × 7</strong>, with mutual-aid cover',
      'Talk-down activation: <strong>&lt;30 s</strong> from verified alert',
      'Incident close-out report: <strong>delivered &lt;60 min</strong> post-resolution',
      'Mutual-aid cover: <strong>≤3 partner agencies</strong> on standby pact'
    ],
    pricing: 'Mobile response in Singapore is quoted as <strong>per-call-out (~S$120–250)</strong> on top of monthly monitoring, or as an unlimited-response retainer band of <strong>S$1,500–4,000/site/month</strong>. Elitez bundles a defined response allowance into Sentinel/Garrison and quotes overflow per-incident. For OBC tenders, Elitez prices the outcome (penalty/bonus on SLA) rather than headcount. <strong>WDG-JR+ (70%)</strong> co-funds the job-redesign from static guard to mobile responder.',
    standards: [
      '<strong>PLRD</strong> — every responder is a licensed Singapore security officer.',
      '<strong>MHA Security ITM / OBC</strong> — outcome-based contract format references this dispatch model.',
      '<strong>SCDF</strong> — fire / hazmat escalation pathway.',
      '<strong>SPF</strong> — police escalation; ?999 protocol on serious-crime trigger.',
      '<strong>PDPA</strong> — incident records classified personal data.'
    ],
    differentiator: 'Aspectus, Soverus and Secura Group all operate licensed agencies with response capability; Certis runs a national-scale dispatch arm. None of them quote a published per-site response retainer at SME/dormitory price. Elitez\'s difference: <strong>monitoring → dispatch is one operator handoff</strong>, the responder is the same Elitez Security officer pool that delivers static guarding, and the OBC pricing model is on the table.',
    deployments: [
      '<strong>Dormitory perimeter breach</strong> — operator verifies, two-way audio talk-down, officer dispatched, ≤12 min arrival.',
      '<strong>Industrial estate after-hours intrusion</strong> — multi-site portfolio with mutual-aid; nearest officer responds across estate boundaries.',
      '<strong>OBC commercial tender</strong> — 6-site portfolio, S$22k/mo retainer, response SLA with monthly bonus/malus on miss rate.'
    ]
  },
  iot: {
    what: 'The command centre does not just watch — it controls. The IoT layer wires the site\'s gates, gantries, EM-locks, lighting, intercoms and M&amp;E sensors into the operator console, so a verified alert can be answered with an action in seconds. The plane is device-agnostic: ONVIF for cameras, BACnet/Modbus for building plant, MQTT for wireless sensors, SIP for intercoms — bring the devices the site already runs, the centre normalises them.',
    buyers: [
      '<strong>FEDA dormitory operators</strong> — gate lockdown, common-area lighting, water-tank and leak sensors (DTS public-health).',
      '<strong>Commercial buildings &amp; MCSTs</strong> — EM-lock release, lift status, HVAC alerts.',
      '<strong>Industrial estates</strong> — boom barriers, vehicle gantries, plant-room telemetry.',
      '<strong>IFM contract holders</strong> — M&amp;E telemetry feeding into work-order generation.',
      '<strong>Critical-infrastructure operators</strong> — multi-zone lockdown, two-person actuation.'
    ],
    tech: [
      'Edge gateway — protocol-agnostic, deployed per site',
      'Protocols — ONVIF, RTSP, MQTT, BACnet/IP, Modbus TCP, LoRaWAN, SIP, OSDP',
      'Actuation classes — gate / gantry / EM-lock / lighting / intercom / strobe / siren',
      'Sensor classes — leak, power, temperature, occupancy, lift status, IAQ',
      'Networking — OT/IT VLAN segmentation, cellular failover for control plane',
      'Safety — fail-safe defaults on comms loss, on-site manual override mandatory',
      'Audit — every actuation attributed to operator + timestamp; two-person for high-risk'
    ],
    slas: [
      'Actuation response: <strong>&lt;3 s</strong> operator click to device action',
      'Fail-safe state assertion: <strong>&lt;5 s</strong> on detected comms loss',
      'Manual override: <strong>always on-site</strong> per device class',
      'Audit log retention: <strong>≥365 days</strong> (PDPA + SS 558)',
      'Two-person actuation: <strong>required</strong> for site-wide lockdown',
      'Supported device classes: <strong>8+</strong> out of the box; new classes added per-site'
    ],
    pricing: 'IoT layered services in Singapore are typically quoted as <strong>S$50–150 per controlled device per month</strong> integrated into a VSaaS contract, or as a project-priced integration on top of monitoring. Elitez sells IoT as a <strong>tier upgrade, not a per-device meter</strong>: Garrison and Command Partner include the standard actuation set; specialised M&amp;E modules (energy, lift, predictive maintenance) priced as modular add-ons. Hardware can be supplied or integrated. <strong>PSG 50%</strong> applies on the integration; equipment grants up to 80% (e.g. dormitory transition tech) where eligible.',
    standards: [
      '<strong>PDPA</strong> — occupancy + access data classified personal data; consent + DPIA required.',
      '<strong>CSA Singapore — Cybersecurity Code of Practice (CCoP)</strong> — OT security baseline for critical sectors.',
      '<strong>ISO 27001</strong> — control-plane treated as production system, change-control mandatory.',
      '<strong>IEC 62443</strong> — industrial OT security framework (where relevant).',
      '<strong>FEDA / DTS</strong> — actuation classes (gate, lighting, leak) map to dormitory licensing requirements.'
    ],
    differentiator: 'Certis Mozart, AETOS and Aspectus integrate IoT at large-estate scale. AETOS notably triages M&amp;E faults (lift, water) through its ICC — the proof of CCaaS-into-IFM. SECOM and Ademco are alarm-centric, less actuation breadth. Elitez\'s difference: <strong>vendor-agnostic — bring your existing devices, no rip-and-replace</strong>, sold at SME/dormitory price point with named modules instead of an enterprise project. Sets up the IFM-fault-triage product nobody offers at the mid-market.',
    deployments: [
      '<strong>FEDA dormitory</strong> — 6 vehicle gates, 12 EM-locks, 8 leak sensors, 1 lockdown switch; ~S$1,200 add-on/mo on top of Garrison monitoring.',
      '<strong>Commercial tower</strong> — lift telemetry, plant-room leak + power, HVAC fault; M&amp;E module priced as part of IFM contract.',
      '<strong>Industrial estate</strong> — 4 boom barriers, multi-site gate lockdown, OT/IT segmented; integration project scope.'
    ]
  },
  reporting: {
    what: 'Every event, dispatch, actuation and shift entry flows into a structured incident store. The reporting layer generates the regulator, client and board reports a buyer needs — formatted to FEDA, DTS, OBC and PDPA expectations, evidenced with the triggering frame, the operator decision, the dispatch ETA and the close-out. Reports compile in minutes, not days. Auditors can replay any event from the source data.',
    buyers: [
      '<strong>FEDA dormitory operators</strong> — MOM dormitory incident reports, occupancy and visitor logs.',
      '<strong>OBC contract holders</strong> — monthly outcome reports against agreed SLA bands.',
      '<strong>MCST &amp; building owners</strong> — quarterly board reports, tenant incident summaries.',
      '<strong>Government &amp; public agencies</strong> — audit-traceable evidence trails for tendered contracts.',
      '<strong>Insurance &amp; claims teams</strong> — reconstructed incident packs with primary evidence.'
    ],
    tech: [
      'Data layer — structured event store (Postgres-class), 1-row-per-event',
      'Generator — templated report engine, PDF + JSON + CSV out',
      'AI summarisation — LLM-assisted prose with citation back to event ID',
      'Evidence binding — every claim linked to source frame, audio clip or actuation log',
      'Distribution — email, secure portal, API for client integration',
      'Versioning — every issued report immutable; corrections re-issued with diff',
      'Retention — reports retained ≥7 years (regulator buyers); shorter for commercial'
    ],
    slas: [
      'Standard report compile: <strong>&lt;5 min</strong> after period close',
      'Custom on-demand report: <strong>&lt;15 min</strong> typical',
      'Evidence link integrity: <strong>100%</strong>; every claim cites an event ID',
      'Retention: <strong>7 years</strong> on regulator-track reports',
      'Audit trail completeness: <strong>≥99.5%</strong> of dispatched incidents have a close-out report',
      'Distribution channels: <strong>3</strong> (email / portal / API) per client tier'
    ],
    pricing: 'Reporting platforms in Singapore sell at <strong>S$200–800 per site per month</strong> as a stand-alone (e.g. iCompass, OneSafe-class), or as a feature of larger VMS suites. Elitez does not sell reporting separately — it is <strong>included in every tier</strong>; the difference is that the reports are generated from the same event store that drove the dispatch, so there is no reconciliation gap. Custom regulator templates and integrations are quoted as a one-off project; ongoing reporting stays in the tier price.',
    standards: [
      '<strong>PDPA</strong> — every personal-data element in a report has a stated legal basis and retention.',
      '<strong>SS 558</strong> — monitoring-centre records and audit trail.',
      '<strong>FEDA / DTS</strong> — defined incident categories MOM requires reported.',
      '<strong>MHA OBC</strong> — outcome scorecards as the contractual reporting format.',
      '<strong>ISO 27001 / 22301</strong> — evidence custody + business-continuity for the report store.'
    ],
    differentiator: 'Certis, AETOS and the larger integrators each generate reports but treat reporting as a back-office consequence. Most boutique agencies still produce reports manually in Word/Excel after the fact — gap between event and report measured in days. Elitez\'s difference: <strong>reports are a first-class product</strong> generated from the same live event store, every claim cited back to the triggering frame, delivered in minutes. For OBC tenders that is the difference between winning and losing.',
    deployments: [
      '<strong>FEDA monthly compliance pack</strong> — incident counts by category, occupancy logs, response timings; auto-delivered to MOM-track operator.',
      '<strong>OBC quarterly outcome scorecard</strong> — SLA achievement, bonus/malus calculation, root-cause summary on misses.',
      '<strong>Tenant-billing report (commercial MCST)</strong> — visitor logs, after-hours access, billable items by tenant unit.'
    ]
  },
  ccaas: {
    what: 'Boutique licensed security agencies need a command centre to compete for outcome-based tenders, but cannot fund the S$650K build. CCaaS White-Label rents the Elitez command-centre infrastructure to them on a managed basis — their brand on the dashboards, their officers in the field, Elitez operators on the floor. They land OBC contracts they could not previously bid for, and Elitez monetises spare capacity on the build.',
    buyers: [
      '<strong>Grade-A / Grade-B PLRD-licensed agencies (30–150 officers)</strong> — under PWM margin compression.',
      '<strong>Niche / vertical security agencies</strong> — wanting tech credibility without the capex.',
      '<strong>Regional agencies in SEA</strong> — entering Singapore via a SG command capability.',
      '<strong>FM contractors with security in-scope</strong> — needing a command layer for outcome bids.',
      '<strong>Government auxiliary partners</strong> — needing surge capacity on a defined contract.'
    ],
    tech: [
      'Multi-tenant VMS — each agency a logical tenant on shared infrastructure',
      'Branded dashboards — the agency\'s logo, colours, terminology',
      'Officer pool — the agency\'s own officers in the field, Elitez operators in the centre',
      'API access — agency\'s own apps integrate with the event store + dispatch',
      'Compliance — agency\'s PLRD licence covers the deployment; SS 558 facility covered by Elitez',
      'Reporting — co-branded reports issued under the agency\'s name',
      'Operator certification — agency operators can be cross-trained on the platform'
    ],
    slas: [
      'Onboarding: <strong>≤30 days</strong> from contract to live tenant',
      'Tenant isolation: <strong>100%</strong> (no cross-tenant data leakage)',
      'Availability: <strong>99.9%</strong> on the shared centre (SS 558 §5)',
      'Sites included in base fee: <strong>10</strong> (Command Partner tier)',
      'Wholesale incremental site: <strong>~S$1,400/site/mo</strong> beyond the base',
      'Co-branding turnaround: <strong>&lt;5 business days</strong> for visual changes'
    ],
    pricing: '<strong>Command Partner tier — S$9,000/month</strong> for 10 sites included, with wholesale incremental at S$1,400/site/month. Build-equivalent cost for the partner: S$650K gross / S$275K net of grants → S$7,600/mo amortised <em>and</em> a 2–3 year delivery risk. The partner wins margin on every contract above S$7.6k effective cost; Elitez wins channel scale without sales cost. <strong>EDG (50%)</strong> co-funds the partner\'s capability-transformation project; <strong>WDG-JR+ (70%)</strong> funds operator re-skilling.',
    standards: [
      '<strong>PLRD</strong> — agency partner holds the deployment licence; Elitez holds the facility licence.',
      '<strong>SS 558</strong> — Elitez-side monitoring centre certified; cited in tender responses.',
      '<strong>ISO 27001 / 22301</strong> — Elitez infrastructure; flow-down to the partner agreement.',
      '<strong>MHA OBC</strong> — the format CCaaS Partners are most often bidding into.',
      '<strong>PDPA</strong> — DPA between partner (data controller) and Elitez (data processor).'
    ],
    differentiator: 'Larger integrators (Certis, AETOS) do not wholesale their command centres to boutique competitors — it would cannibalise their own bids. International CCaaS providers exist but operate from outside Singapore, missing PLRD licensing alignment. Elitez\'s difference: <strong>turns would-be competitors into a distribution channel</strong> at SME-friendly economics, fully PLRD/SS 558-aligned, with shared operator capacity that scales without the partner\'s capex.',
    deployments: [
      '<strong>Boutique Grade-B agency</strong> — 12 client sites under their brand on Elitez infrastructure; S$9k + 2×S$1,400 = S$11,800/mo wholesale.',
      '<strong>Regional agency entering SG</strong> — 6 SG sites under co-branding while the regional licence is sorted; Command Partner tier.',
      '<strong>FM contractor security scope</strong> — 8 sites embedded in their IFM contract; Elitez white-labels, the FM contractor invoices the building owner.'
    ]
  }
};

/* secondary accent palette — rotated across the service catalogue */
const SERVICE_ACCENTS = ['#00337a', '#0e8a9e', '#d98a2b', '#15875a', '#d8232a', '#1e5fa8'];

/* -------------------------------------------------------------------
   FCD SECURITY — feature catalogue (manless-security.html)
   ------------------------------------------------------------------- */
const FCD_FEATURES = [
  { id:'fcd-biometric', n:'Feature 01', name:'Biometric Turnstile Entry',
    tag:'Edge-AI recognition',
    blurb:'Edge-AI facial recognition gantries authenticate residents in under 0.5 seconds.' },
  { id:'fcd-thermal',   n:'Feature 02', name:'Contactless Thermal Screening',
    tag:'Public-health resilience',
    blurb:'Integrated thermal sensors meet DTS public-health resilience requirements.' },
  { id:'fcd-intercom',  n:'Feature 03', name:'Remote Intercom & Gate Strike',
    tag:'Bi-directional response',
    blurb:'One-button video intercom to command-centre operators with remote gate release.' },
  { id:'fcd-patrol',    n:'Feature 04', name:'On-Demand Mobile Patrol',
    tag:'Tactical response',
    blurb:'Tactical patrol dispatched to the facility the moment the VMS flags an incident.' }
];

const FCD_FEATURES_DEEP = {
  'fcd-biometric': {
    what: 'Edge-AI facial-recognition gantries enrol every resident\'s biometric template at induction and authenticate them at the gantry head in under half a second — the camera frames the face, runs a passive liveness check, matches the template locally and releases the turnstile via an ONVIF Profile A access-control event. The matcher runs on the gantry\'s onboard NPU so the gate keeps authenticating even if the dormitory\'s uplink to the Command Centre drops — up to 72 hours of offline cache. Every ingress and egress is timestamped, signed, and streamed to the Command Centre\'s access ledger for MOM audit replay.',
    buyers: [
      '<strong>FEDA Class 3 (300–999 beds) and Class 4 (≥1,000 beds)</strong> — the new MOM Licence Condition on Incident &amp; Dispute Management (1 Oct 2024) requires evidentiary ingress records that swipe cards cannot provide.',
      '<strong>DTS-2030 retrofit operators (1 Mar – 31 Aug 2026 grant window)</strong> — gantry retrofit is a reimbursable line-item under the DTS grant.',
      '<strong>Operators capping bed-hopping &amp; tailgating</strong> — rooms capped at ≤12 residents under DTS; biometric ingress closes headcount-vs-bed-assignment.',
      '<strong>Operators with lost-card / shared-card fraud on RFID-only dorms</strong> — templates defeat it without re-issuing credentials.',
      '<strong>OBC tender bidders (SACE framework)</strong> — gantry telemetry is the most defensible "command, control &amp; communications" evidence layer.'
    ],
    tech: [
      'Gantry head — Suprema BioStation 3 / BioStation 3 Max (dual 2 MP visual + IR cameras, EAL6+ secure element on Max) or Hanwha Vision X-series',
      'Edge inference — NVIDIA Jetson Orin Nano (40–67 TOPS post-Super) or Hailo-8 M.2 (26 TOPS, ~2.5 W typical)',
      'Image quality — ISO/IEC 19794-5 + ICAO portrait conformance check at enrolment',
      'Access bus — ONVIF Profile A + Profile C events over PoE+, OSDP v2.2 Secure Channel to the turnstile controller',
      'Fallback credential — FIDO2 / NFC pass card for cap-and-mask edge cases',
      'Template store — AES-256 at rest, salted per PDPC <em>Guide on the Responsible Use of Biometric Data</em> (May 2022); raw samples discarded post-enrolment',
      'Sync — local SQLite on the gantry, dual-write to Command Centre via mTLS, <strong>72 h offline operation</strong>'
    ],
    slas: [
      'Recognition latency: <strong>≤0.5 s P95</strong> (Suprema BioStation 3 datasheet: 0.2–0.3 s typical)',
      'Throughput: <strong>≥25 residents/minute/gantry lane</strong>, sized for 06:30 shift-change peak',
      'False Acceptance Rate: <strong>&lt; 1 × 10⁻⁶</strong> at production threshold (NIST FRVT 1:N FNIR ≤ 0.3 %)',
      'False Rejection Rate: <strong>&lt; 0.5%</strong> under ICAO-compliant enrolment',
      'Liveness: <strong>ISO/IEC 30107-3:2023 PAD Level 2</strong> — defeats printed photo, video replay, 2D mask',
      'PoE+ <strong>≤30 W</strong> per head; <strong>72 h offline</strong> on local cache; audit-log retention <strong>≥30 days edge / ≥180 days centre</strong>'
    ],
    standards: [
      '<strong>PLRD (SPF)</strong> — Elitez Security licence covers the human-in-the-loop dispatch tier behind the gantry.',
      '<strong>PDPA + PDPC Biometric Guide (May 2022)</strong> — consent at enrolment, template-only storage, sample disposal, salted encryption, DPIA filed.',
      '<strong>MOM FEDA Licence Conditions</strong> — ingress records support the Incident &amp; Dispute Management LC in force 1 Oct 2024.',
      '<strong>ISO/IEC 19794-5</strong> face-image quality + <strong>ISO/IEC 30107-3</strong> PAD Level 2 attestation.',
      '<strong>SCDF Fire Code 2023 Cl. 6.3.8</strong> — fail-safe mag-locks unlock on fire alarm, power failure or component fault; manual override 1.2 m above floor within 1.5 m of door jamb.',
      '<strong>MHA Security ITM 2025 / SACE</strong> — technology-augmented command-and-control credit.'
    ],
    differentiator: 'Certis Mozart runs at MHA, NTU and Jewel scale (ingesting &gt;5,000 sensors and 700 CCTVs at Jewel alone) but bids tendered multi-year IOC contracts, not FCD SKUs. AETOS targets critical-infrastructure on 5G. Aspectus has an ICC but no turnkey gantry-plus-template lifecycle. Suprema and IDEMIA channel partners sell the readers, not a PLRD-licensed monitored service. <strong>Elitez bundles the gantry, the PDPC-compliant template lifecycle, the PLRD-licensed dispatch tier, and the FCD-tuned occupancy reporting into one Garrison-tier subscription — at a fraction of a Mozart deployment.</strong>',
    deployments: [
      '<strong>600-bed FCD (single block)</strong> — 4 main + 1 staff gantry + biometric enrolment kiosk. <strong>Garrison S$5,500/mo</strong> (≈ S$2,750 net after PSG); replaces ~S$19,400/mo of a 2-officer manned post.',
      '<strong>1,000-bed FCD (multi-block)</strong> — 6 gantries (entry + 2 side gates) + secondary enrolment station; <strong>Garrison S$5,500–7,500/mo</strong>.',
      '<strong>8,000-bed PBD campus</strong> — 16–20 gantry lanes across 3 access zones, dual-redundant uplink; custom <strong>Garrison-XL ~S$18–25k/mo</strong>.'
    ]
  },
  'fcd-thermal': {
    what: 'A radiometric thermal sensor co-mounted at the gantry samples the resident\'s inner-canthus (tear-duct) skin temperature during the same half-second face-recognition pass — no second queue, no body-temp checkpoint. An in-scene blackbody reference calibrates the camera every minute so it holds ±0.3 °C lab accuracy in a real dorm lobby (not the ±0.5 °C of uncalibrated thermal cams). Readings above a rolling-mean + 2 σ threshold trigger a "secondary screening" alert to the FCD management office and the Elitez Command Centre, which then dispatches the on-site medic or on-call clinic.',
    buyers: [
      '<strong>DTS public-health resilience operators</strong> — every FEDA dormitory must isolate suspected infectious cases (≥ 1 isolation bed / 100 beds); thermal is the upstream trigger.',
      '<strong>FCD operators under the 2017 contingency-plan obligation</strong> — sick-bay activation needs evidence the trigger is real, not paper.',
      '<strong>Operators carrying pandemic memory (Section 11(D) Covid clusters)</strong> — JTC lessors now ask for a permanent febrile-screening layer, not a deployable kit.',
      '<strong>Outdoor sectors monitoring heat-stress</strong> — anonymised trend feeds into JTC heat-acclimatisation reporting.',
      '<strong>Operators meeting insurer EHS scoring</strong> — captive insurers writing dorm cover require a continuous record.'
    ],
    tech: [
      'Sensor — FLIR / Teledyne A400 / A700-class radiometric (640 × 480 thermal, 17 µm pitch)',
      'Reference — in-scene blackbody target (BB-3000 class, ±0.05 °C reference) for rolling drift correction',
      'Measurement site — face-bounded ROI on the inner medial canthus (not the forehead) per the clinical evidence on tear-duct reliability',
      'Edge fusion — same Jetson Orin Nano / Hailo-8 module as the face matcher, temperature is one tensor head off the same frame',
      'Threshold — rolling-mean + 2 σ over the dorm\'s last-24 h population, <em>not</em> a static 37.5 °C',
      'Health-data partition — PDPC-classified, 7-day default retention, separate from access ledger',
      'Standards alignment — IEC 80601-2-59 referenced for sensor calibration even where SG does not mandate it for dorms'
    ],
    slas: [
      'Temperature accuracy: <strong>±0.3 °C</strong> with in-scene blackbody (vs ±0.5 °C uncalibrated typical)',
      'Screening latency: <strong>≤0.5 s</strong> — runs in-line with the face match, zero added queue time',
      'Throughput: <strong>≥25 residents/minute/lane</strong>',
      'Clinical performance: <strong>sensitivity ≥ 90% / specificity ≥ 80%</strong> vs oral thermometry (published FLIR evidence)',
      'Threshold drift correction: <strong>every 60 s</strong> against blackbody',
      'Operating envelope: <strong>18–32 °C ambient, ≤85% RH</strong> — SG lobby HVAC with margin'
    ],
    standards: [
      '<strong>MOM FEDA / DTS</strong> — isolation-bed and sick-bay contingency requirement; thermal is the upstream trigger.',
      '<strong>PDPA + PDPC Biometric Guide</strong> — body-temperature is health data, purpose-limited, separately retained, deletion on consent withdrawal.',
      '<strong>IEC 80601-2-59</strong> (referenced) — particular requirements for thermal screeners of human febrile temperature.',
      '<strong>HSA guidance</strong> — positioned as <em>secondary screening trigger</em>, not <em>fever diagnosis</em> (no medical-device classification triggered).',
      '<strong>SS 558 / SS 645 / TR 83:2020</strong> — thermal-alarm signalling routed through the same monitored bus as the intruder, fire and remote-alarm stack.',
      '<strong>Smart Nation 2.0 sensor-data hygiene</strong> — aggregation patterns applied.'
    ],
    differentiator: 'Most SG agencies treat thermal as a Covid-era kit they have packed away. Certis and AETOS have the analytics platform but no FCD-priced SKU. SECOM and Ademco\'s CMCC stacks do not include a febrile layer. FLIR / Hikvision channels ship the camera but neither operate the monitored escalation nor file the PDPA / DPIA paperwork. <strong>Elitez ships thermal co-mounted on the gantry (no second checkpoint), runs the blackbody calibration loop as a managed service, and treats the readings as PDPA-classified health data with an isolation-pathway SOP signed off by the dorm\'s appointed doctor — a public-health workflow, not a hardware sale.</strong>',
    deployments: [
      '<strong>600-bed FCD</strong> — 2 thermal lanes co-mounted on the main gantries + 1 blackbody per lane; included in <strong>Garrison S$5,500/mo</strong> (~S$8–12k CapEx amortised in the subscription).',
      '<strong>1,000-bed FCD</strong> — 3–4 thermal lanes with paired blackbody; Garrison tier inclusive.',
      '<strong>Outbreak surge mode</strong> — Elitez deploys 2 additional portable thermal lanes within 24 h on incident declaration; billed as a Command-Centre operational adder, not a CapEx step.'
    ]
  },
  'fcd-intercom': {
    what: 'Every controlled door, vehicle gate and after-hours pedestrian gate in the FCD carries an IP video intercom with a single SOS button. Pressing it opens a full-duplex video / audio call to the Elitez Command Centre — the operator sees the caller\'s face on a 6 MP wide-angle stream, verifies them against the resident roster or visitor log, and releases the mag-lock remotely via an ONVIF Profile A access event over mTLS. The same console can fire a site-wide lockdown or a two-way talk-down through the IP-PA. Every call is recorded with audio, screenshots, gate-strike timestamp and operator ID — an evidentiary pack the dormitory can hand straight to MOM, SPF or its insurer.',
    buyers: [
      '<strong>FEDA Class 3 / 4 operators</strong> — continuous reachable supervision without a permanent night-shift guard at every gate.',
      '<strong>Single-guard-post FCDs under PWM cost pressure</strong> — replaces the second officer of a 2-officer 24/7 post (~S$19,400/mo in 2026).',
      '<strong>OBC bid-track operators</strong> — call log is the OBC audit trail for remote command-and-control evidence.',
      '<strong>Vehicle / contractor / delivery access after-hours</strong> — site agent authorises a one-shot gate release from a phone, not a physical visit.',
      '<strong>Worker-welfare grievance escalation</strong> — the MOM FEDA Incident &amp; Dispute Management LC (1 Oct 2024) requires a recorded grievance channel.'
    ],
    tech: [
      'Door / pedestrian-gate station — Axis A8207-VE Mk II (6 MP, SIP, ONVIF S/G, RFID, IP66 / IK08, PoE) or Hanwha Vision TID-600R (2 MP, 180° H × 114° V, ToF touchless call, SIP 2.0, IP65 / IK08)',
      'Call transport — SIP/TLS + SRTP to the Command Centre\'s licensed SBC; H.264 / H.265 video, Opus audio with AEC and NR',
      'Access bus — ONVIF Profile A (config) + Profile C (events), OSDP v2.2 Secure Channel between the intercom-attached reader and gate controller; relay output to a fail-safe EM-lock (≤12 / 24 VDC)',
      'Fire-alarm interlock — dry-contact tie-in from the SCDF-approved fire panel to drop all monitored mag-locks per Cl. 6.3.8 — Elitez never overrides',
      'VMS — Genetec / Milestone XProtect / Wisenet WAVE with the intercom plug-in for one-click answer, gate-strike, recording and case-file generation',
      'Manual override — SCDF-mandated within 1.5 m of door jamb at 1.2 m above floor — supplied, specified, signage-certified',
      'Resilience — dual-WAN (fibre + 4G/5G failover), 4-hour UPS at every intercom hub, gate-strike falls back to a local "trusted resident card" list during full outage'
    ],
    slas: [
      'Operator call-pickup: <strong>≤10 s P95</strong> (Command Centre manned dispatch SLA)',
      'Button-press → mag-lock release: <strong>≤4 s P95</strong>',
      'Video stream: <strong>≥1080p @ 25 fps</strong>, end-to-end latency <strong>≤300 ms</strong>',
      'Audio: <strong>echo-cancelled full-duplex, SPL ≥85 dB @ 0.5 m</strong> (Hanwha TID-600R spec)',
      'Recording retention: <strong>30 days standard, 180 days on incident flag</strong> (WSH-aligned)',
      'Mag-lock fail-safe release: <strong>≤1 s</strong> on fire alarm or power loss (SCDF Cl. 6.3.8); Command-Centre uptime <strong>≥99.95%</strong> dual-redundant'
    ],
    standards: [
      '<strong>SCDF Fire Code 2023 Cl. 6.3.8</strong> — fail-safe locks unlock on fire alarm / power loss / fault; manual override 1.2 m above floor within 1.5 m of door jamb.',
      '<strong>PLRD (SPF)</strong> — Command Centre operators are PLRD-licensed officers; a software-only intercom vendor cannot legally action the dispatch step.',
      '<strong>SS 558 + TR 83:2020 + SS 645</strong> — the audit standards Ademco\'s CMCC is certified to; Elitez Command Centre operates against the same set.',
      '<strong>PDPA</strong> — call recordings purpose-limited to incident handling, 30 / 180-day retention, named operators logged.',
      '<strong>MOM FEDA — Incident &amp; Dispute Management LC (1 Oct 2024)</strong> — logged-and-recordable escalation channel.',
      '<strong>MHA OBC / SACE</strong> — evidenced remote command-and-control capability.'
    ],
    differentiator: 'SECOM CAMS (licensed since 2009) and Ademco\'s CMCC (the largest in SG, ~8,000 clients across 6 SEA markets) are alarm-led — they answer panels, not video intercoms tied to dormitory door hardware. Certis Mozart and AETOS run video-intercom workflows at govt / critical-infra scale, not at FCD price points. Aspectus and Union Security market 24/7 ICCs but neither publishes an intercom-call SLA or a Cl. 6.3.8-compliant gate-strike workflow. <strong>Elitez is the only PLRD-licensed agency that sells the intercom hardware + Cl. 6.3.8-compliant fail-safe wiring + recorded video gate-strike as a single monthly SKU sized for a 600–1,000-bed FCD.</strong>',
    deployments: [
      '<strong>600-bed FCD</strong> — 6 intercoms (main + 2 side + sick-bay + management office + after-hours pedestrian) + 1 spare; included in <strong>Garrison S$5,500/mo</strong>.',
      '<strong>1,000-bed FCD</strong> — 8–10 intercoms (incl. vehicle and contractor gates); <strong>Garrison S$5,500–7,500/mo</strong>.',
      '<strong>Boutique agency white-label</strong> — same intercom + Command-Centre stack rebadged for a Grade-A/B agency; <strong>Command Partner S$9,000/mo, 10 sites included</strong>.'
    ]
  },
  'fcd-patrol': {
    what: 'The Command Centre\'s VMS continuously runs analytics — loitering, perimeter cross, fight detection, fall-down, vehicle-in-no-vehicle-zone, smoke / fire — across every camera in the FCD. The moment an analytic fires and the operator video-verifies it, a PLRD-licensed mobile patrol team is dispatched from the nearest standby point via a dynamic-deployment console: nearest unit, route, ETA, and live body-cam stream into the same case-file the operator opened. The patrol arrives, video-confirms ground truth back to the centre, and either de-escalates on-site or hands off to SPF 999 / SCDF 995 — every step time-stamped.',
    buyers: [
      '<strong>Operators eliminating the second-officer post</strong> — under PWM 2026 a 24/7 two-officer post costs ~S$19,400/mo and rises ~S$160/mo/yr to 2028.',
      '<strong>FEDA Incident &amp; Dispute Management LC (Oct 2024) compliance</strong> — named, recorded responder per incident; verbal callouts to a freelancer are no longer defensible.',
      '<strong>After-hours dorm-incident clusters (22:00–04:00)</strong> — the exact window where static guarding is thinnest and PWM-cost-heaviest.',
      '<strong>MHA OBC bidders</strong> — patrol-arrival evidence with body-cam is the strongest scorecard input.',
      '<strong>Multi-site operators capped on workforce quota</strong> — patrol pooling covers 6–8 FCDs from one team.'
    ],
    tech: [
      'VMS + analytics — Milestone XProtect / Genetec / Wisenet WAVE with Hanwha / Bosch / Axis edge analytics (object class, intrusion, loitering, fall, fight, fire / smoke)',
      'Dispatch engine — dynamic-dispatch console: input is incident type + camera GPS; output is nearest patrol unit by drive-time, route, ETA, auto case-file pre-fill',
      'Patrol vehicle stack — marked Elitez fleet with Axon-class body-worn cams (1080p, 12-hour battery), dash-cam, bonded 4G / 5G LTE uplink, GPS AVL every 10 s',
      'Edge AI on camera — Hanwha / Axis with Ambarella CV-class SoC or Hailo-8 add-in; false-positive rate low enough for "auto-dispatch on verified detection"',
      'Communications — TETRA or push-to-talk-over-cellular between patrol and Command Centre; case-file IDs synchronised to SPF 999 / SCDF 995 on escalation',
      'PLRD compliance — every patrol officer holds a valid SPF Security Officer / Senior Security Officer licence; Command-Centre supervisor holds a Security Supervisor licence',
      'Reporting — auto-generated incident PDF within 24 h, signed by the Command-Centre supervisor, packaged for MOM / insurer / dorm board'
    ],
    slas: [
      'Detection → operator-verify: <strong>≤30 s P95</strong>',
      'Dispatch decision → patrol roll: <strong>≤60 s P95</strong>',
      'Patrol on-site arrival: <strong>≤20 min P95</strong>; Garrison-tier commit <strong>≤15 min</strong> inside the standby footprint',
      'Body-cam evidence packaged: <strong>within 24 h</strong> for every dispatched incident',
      'False-dispatch rate: <strong>≤5%</strong> sustained by operator-in-the-loop video verification',
      'Patrol-fleet uptime: <strong>≥99%</strong> scheduled availability; <strong>100% PLRD compliance</strong> auditable against the SPF register'
    ],
    standards: [
      '<strong>PLRD (SPF)</strong> — Security Agency licence + individual officer licences are the legal foundation; a pure-VSaaS competitor cannot legally produce this.',
      '<strong>MOM FEDA Incident &amp; Dispute Management LC (1 Oct 2024)</strong> — recorded, named responder.',
      '<strong>MHA OBC / SACE 2025</strong> — technology-augmented dispatch and command-control evidence.',
      '<strong>PDPA</strong> — body-cam footage purpose-limited, 30 / 180-day retention, destruction SOP.',
      '<strong>SS 558 / TR 83:2020</strong> — remote-alarm verification chain that authorises the dispatch.',
      '<strong>PWM / Security ITM 2025</strong> — wage stack auditable (entry gross S$2,475 Jan 2026 → ~S$2,795 by 2028); SCDF Cl. 6.3.8 honoured — patrol does not override fire-released doors.'
    ],
    differentiator: 'Certis runs the largest patrol fleet in SG but bundles it inside MHA / NTU-size IFM contracts, not as a per-incident SKU. AETOS focuses on critical-infra / aviation with 5G ICC scale, not dormitory operators. SECOM dispatches out of CAMS but on alarm triggers, not VMS-analytics triggers, and has no FCD tier. Ademco VerifSuite verifies alarms via video and warns intruders over speakers — the warn-off, not the dispatch, is its core motion. <strong>Elitez closes the loop: VMS-detect → operator-verify → PLRD patrol-dispatch → body-cam evidence → MOM-ready report — as one Garrison-tier subscription, not four procurements.</strong>',
    deployments: [
      '<strong>600-bed FCD inside an Elitez cluster (3–5 dorms within 8 km)</strong> — shared patrol pool, <strong>≤15 min arrival SLA</strong>; included in <strong>Garrison S$5,500/mo</strong>.',
      '<strong>1,000-bed FCD stand-alone</strong> — dedicated standby unit within 5 km, <strong>≤10 min SLA</strong>; <strong>Garrison+ S$7,500/mo</strong>.',
      '<strong>Multi-site operator (6+ FCDs)</strong> — patrol fleet sized to portfolio with cluster standby; structured as <strong>Command Partner CCaaS S$9,000/mo per cluster</strong> (10 sites included), sized against a ~S$650K self-build (~S$275K net of grants ≈ S$7,600/mo amortised).'
    ]
  }
};

/* -------------------------------------------------------------------
   2. NAVIGATION
   ------------------------------------------------------------------- */
function initNav() {
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const openBtn = document.getElementById('navToggle');
  const closeBtn = document.getElementById('drawerClose');
  if (drawer && backdrop) {
    const open = () => { drawer.classList.add('open'); backdrop.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const close = () => { drawer.classList.remove('open'); backdrop.classList.remove('open'); document.body.style.overflow = ''; };
    openBtn && openBtn.addEventListener('click', open);
    closeBtn && closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    drawer.querySelectorAll('a').forEach(a => {
      if (!a.getAttribute('href').startsWith('mailto:')) a.addEventListener('click', close);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    link.classList.toggle('active', href === here);
  });
}

/* -------------------------------------------------------------------
   3. SCROLL REVEAL
   ------------------------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(n => n.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  items.forEach(n => io.observe(n));
}

/* -------------------------------------------------------------------
   4. COMMAND CENTER VIDEO WALL
   ------------------------------------------------------------------- */
const FEED_DEFS = [
  { id:'CAM-01' }, { id:'CAM-02' }, { id:'CAM-03' },
  { id:'CAM-04' }, { id:'CAM-05' }, { id:'CAM-06' }
];
const ALERT_STATES = [
  { text:'AI Intrusion Alert',     cls:'',     icon:'⚠' },
  { text:'Gantry Access Granted',  cls:'ok',   icon:'✓' },
  { text:'PPE Violation Flagged',  cls:'warn', icon:'⚠' },
  { text:'Perimeter Secure',       cls:'ok',   icon:'✓' },
  { text:'Tailgating Detected',    cls:'warn', icon:'⚠' },
  { text:'Line Crossing — Zone 4', cls:'',     icon:'⚠' }
];
function paintBadge(badge, state) {
  badge.className = 'alert-badge ' + state.cls;
  badge.replaceChildren(el('span', { text: state.icon }), el('span', { text: state.text }));
}
function buildVideoWall() {
  const wall = document.getElementById('videoWall');
  if (!wall) return;
  const badges = [];
  FEED_DEFS.forEach((feed, i) => {
    const badge = el('span', { cls:'alert-badge', attrs:{ 'data-feed': i } });
    badges.push(badge);
    wall.appendChild(el('div', { cls:'feed', children:[
      el('span', { cls:'feed-id', text: feed.id }),
      el('span', { cls:'feed-rec', children:[ el('span', { cls:'rec-dot' }), el('span', { text:'REC' }) ] }),
      el('span', { cls:'feed-blip', style:{
        top:(28 + (i*11)%44)+'%', left:(22 + (i*17)%52)+'%', 'animation-delay':(i*0.4)+'s' } }),
      badge
    ] }));
  });
  badges.forEach((b, i) => paintBadge(b, ALERT_STATES[i % ALERT_STATES.length]));
  let tick = 0;
  setInterval(() => {
    paintBadge(badges[tick % badges.length], ALERT_STATES[Math.floor(Math.random() * ALERT_STATES.length)]);
    tick++;
  }, 2200);
}
function initStatusBanner() {
  const net = document.getElementById('netLoad');
  const sla = document.getElementById('slaVal');
  if (!net && !sla) return;
  setInterval(() => {
    if (net) net.textContent = String(352 + Math.floor(Math.random() * 17));
    if (sla) sla.textContent = (99.94 + Math.random() * 0.05).toFixed(2) + '%';
  }, 2600);
}

/* -------------------------------------------------------------------
   5. BUSINESS UNIT GRID
   ------------------------------------------------------------------- */
function buildBuGrid() {
  const grid = document.getElementById('buGrid');
  if (!grid) return;
  BUSINESS_UNITS.forEach((bu, i) => {
    const card = el('article', {
      cls:'bu-card reveal p-6',
      attrs:{ 'data-delay': String(i % 4) }, style:{ '--bu': bu.hex }
    });
    card.appendChild(el('div', { cls:'flex items-center gap-2.5', children:[
      el('span', { cls:'bu-dot' }),
      el('p', { cls:'ref text-[#5a6b85]', text:'Division 0' + (i + 1) })
    ] }));
    card.appendChild(el('h3', { cls:'mt-3 text-lg font-bold text-[#14233b]', text: bu.name }));
    const metric = el('p', { cls:'mt-1 text-xs font-semibold', text: bu.metric });
    metric.style.color = bu.hex === '#333333' ? '#5a6b85' : bu.hex;
    card.appendChild(metric);
    card.appendChild(el('p', { cls:'mt-3 text-sm text-[#5a6b85] leading-relaxed', text: bu.blurb }));
    grid.appendChild(card);
  });
}

/* -------------------------------------------------------------------
   5b. DIVISION PANEL — interactive 7-division view (capabilities page)
   ------------------------------------------------------------------- */
function buildDivisionPanel() {
  const root = document.getElementById('divisionPanel');
  if (!root) return;

  const tabRow = el('div', { cls:'flex flex-wrap gap-2' });
  const detail = el('div', { cls:'mt-6 reveal' });
  const tabBtns = [];

  function render(idx) {
    const bu = BUSINESS_UNITS[idx];
    const accent = bu.hex;
    tabBtns.forEach((b, j) => {
      b.className = 'div-tab' + (j === idx ? ' active' : '');
    });

    const block = (label, body, isList) => {
      const b = el('div', {});
      b.appendChild(el('p', { cls:'ref', style:{ color: accent }, text: label }));
      if (isList) {
        const ol = el('ol', { cls:'mt-3 space-y-3' });
        body.forEach((step, k) => {
          ol.appendChild(el('li', { cls:'flex gap-3 text-sm text-[#5a6b85] leading-relaxed', children:[
            el('span', { cls:'font-bold shrink-0', style:{ color: accent }, text: String(k + 1).padStart(2, '0') }),
            el('span', { text: step })
          ] }));
        });
        b.appendChild(ol);
      } else {
        b.appendChild(el('p', { cls:'mt-3 text-sm text-[#5a6b85] leading-relaxed', text: body }));
      }
      return b;
    };

    const metric = el('span', { cls:'ref', text: bu.metric });
    metric.style.color = accent;
    const header = el('div', { cls:'flex flex-wrap items-baseline gap-x-4 gap-y-1', children:[
      el('h3', { cls:'text-2xl font-bold text-[#14233b]', text: bu.name }),
      metric
    ] });
    const grid = el('div', { cls:'grid lg:grid-cols-3 gap-7 mt-6', children:[
      block('Operational context', bu.context),
      block('Command Center integration', bu.integration),
      block('Operating workflow', bu.workflow, true)
    ] });
    const pad = el('div', { cls:'p-7 sm:p-9', children:[ header, grid ] });

    const card = el('div', { cls:'bg-white border border-line' });
    card.style.borderTop = '3px solid ' + accent;
    card.appendChild(pad);
    detail.replaceChildren(card);
  }

  BUSINESS_UNITS.forEach((bu, i) => {
    const btn = el('button', { cls:'div-tab', attrs:{ type:'button' } });
    btn.style.setProperty('--div', bu.hex);
    btn.appendChild(el('span', { cls:'div-dot' }));
    btn.appendChild(el('span', { text: bu.name }));
    btn.addEventListener('click', () => render(i));
    tabBtns.push(btn);
    tabRow.appendChild(btn);
  });
  root.replaceChildren(tabRow, detail);
  render(0);
}

/* -------------------------------------------------------------------
   6. SERVICE CARDS — home preview (#servicePreview) & services page (#serviceGrid)
   ------------------------------------------------------------------- */
function buildServiceCards(targetId) {
  const grid = document.getElementById(targetId);
  if (!grid) return;
  const withImage = (targetId === 'serviceGrid');
  const clickable = withImage && !!SERVICES_DEEP;   // serviceGrid opens the bento drawer
  SERVICES.forEach((s, i) => {
    const accent = SERVICE_ACCENTS[i % SERVICE_ACCENTS.length];
    const cardAttrs = { 'data-delay': String(i % 3) };
    if (clickable) {
      cardAttrs['data-service'] = s.id;
      cardAttrs['data-accent']  = accent;
      cardAttrs['role']         = 'button';
      cardAttrs['tabindex']     = '0';
      cardAttrs['aria-label']   = 'Open details for ' + s.name;
    }
    const card = el('article', {
      cls:'service-card reveal' + (clickable ? ' is-clickable' : ''),
      attrs: cardAttrs
    });
    card.style.borderTop = '3px solid ' + accent;
    card.style.setProperty('--chase', accent);   // chaser inherits the card's accent
    if (withImage && s.img) {
      const wrap = el('div', { cls:'neon-chase' });
      wrap.appendChild(el('img', { cls:'w-full h-[180px] object-cover block', attrs:{
        src:'assets/photos/' + s.img, alt: s.name, width:'1280', height:'731', loading:'lazy' } }));
      card.appendChild(wrap);
    }
    const body = el('div', { cls:'p-7' });
    const ico = el('div', { cls:'service-ico' });
    ico.style.color = accent;
    ico.style.background = accent + '14';   /* ~8% tint */
    ico.appendChild(s.iconName ? iconNode(s.iconName, 22) : svgIcon(s.icon, 22));
    body.appendChild(ico);
    const label = el('p', { cls:'ref mt-5', text: s.n + ' — ' + s.tag });
    label.style.color = accent;
    body.appendChild(label);
    body.appendChild(el('h3', { cls:'mt-1.5 text-xl font-bold text-[#14233b]', text: s.name }));
    body.appendChild(el('p', { cls:'mt-2.5 text-[15px] text-[#5a6b85] leading-relaxed', text: s.blurb }));
    card.appendChild(body);
    grid.appendChild(card);
  });
}

/* -------------------------------------------------------------------
   7. CAPEX CHARTS (capex.html) — Chart.js doughnut + subsidy bars
   ------------------------------------------------------------------- */
const CAPEX_ITEMS = [
  { label:'VMS & AI Analytics Software', value:170000, color:'#00337a' },
  { label:'Physical Display Wall',       value:110000, color:'#1e5fa8' },
  { label:'Storage & Servers',           value:100000, color:'#4c7fb8' },
  { label:'IoT Integration Hardware',    value: 90000, color:'#15875a' },
  { label:'Control Room Fit-Out',        value: 70000, color:'#d98a2b' },
  { label:'Dashboards & API Integration',value: 60000, color:'#d8232a' },
  { label:'Contingency Reserves',        value: 50000, color:'#8a97ab' }
];
function initCapexChart() {
  const canvas = document.getElementById('capexChart');
  if (!canvas || typeof Chart === 'undefined') return;
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: CAPEX_ITEMS.map(i => i.label),
      datasets: [{
        data: CAPEX_ITEMS.map(i => i.value),
        backgroundColor: CAPEX_ITEMS.map(i => i.color),
        borderColor: '#ffffff', borderWidth: 3, hoverOffset: 10
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '62%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => '  ' + c.label + ': ' + SGD(c.parsed) } }
      }
    }
  });
}
function initSubsidyBars() {
  const bars = document.querySelectorAll('.prog-fill');
  if (!bars.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.style.width = e.target.dataset.pct + '%'; io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  bars.forEach(b => io.observe(b));
}

/* -------------------------------------------------------------------
   8. ROI CALCULATOR (roi-calculator.html) — two modes
   ------------------------------------------------------------------- */
function initRoiCalculator() {
  const root = document.getElementById('roiCalc');
  if (!root) return;

  /* mode toggle */
  const toggle = root.querySelectorAll('.roi-toggle button');
  const modes = root.querySelectorAll('.roi-mode');
  toggle.forEach(btn => btn.addEventListener('click', () => {
    toggle.forEach(b => b.classList.toggle('active', b === btn));
    modes.forEach(m => m.classList.toggle('active', m.dataset.mode === btn.dataset.mode));
    if (btn.dataset.mode === 'payback') paybackCalc(); else savingsCalc();
  }));

  /* generic slider binder */
  function bind(id, fn) {
    const s = document.getElementById(id);
    if (s) s.addEventListener('input', fn);
    return s;
  }
  const setText = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };

  /* ---- CLIENT SAVINGS MODE ---- */
  /* Per-vertical sizing config. divisor = units of size per 1 FO at 8h coverage. */
  const VERTICALS = {
    security: {
      blurb: 'Static guarding — condo, industrial, commercial and dormitory sites.',
      sizeLabel: 'Total guarded square footage',
      sizeMin: 10000, sizeMax: 1000000, sizeStep: 10000, sizeDefault: 400000,
      hint: 'Sizing rule: 1 field officer per 100,000 sqft per 8-hour shift.',
      fmtSize: v => v.toLocaleString() + ' sqft',
      divisor: 100000,
      subPer: 5500, subUnit: 100000,         // S$5,500 per 100k sqft
      hourDefault: 24
    },
    merch: {
      blurb: 'FMCG retail merchandising — shelf compliance, planogram audits, in-store promo execution.',
      sizeLabel: 'Outlets / retail points covered',
      sizeMin: 5, sizeMax: 300, sizeStep: 1, sizeDefault: 40,
      hint: 'Sizing rule: 1 merchandiser per 8 outlets per 8-hour shift.',
      fmtSize: v => v + (v === 1 ? ' outlet' : ' outlets'),
      divisor: 8,
      subPer: 350, subUnit: 1,                // S$350 per outlet
      hourDefault: 8
    },
    serviceops: {
      blurb: 'Service operations — STPs, M&E sites, distributed plant rooms, periodic inspection rounds.',
      sizeLabel: 'Operations points to manage',
      sizeMin: 5, sizeMax: 150, sizeStep: 1, sizeDefault: 30,
      hint: 'Sizing rule: 1 service tech per 6 ops points per 8-hour shift.',
      fmtSize: v => v + (v === 1 ? ' point' : ' ops points'),
      divisor: 6,
      subPer: 700, subUnit: 1,                // S$700 per ops point
      hourDefault: 12
    },
    project: {
      blurb: 'Project work — AB Associates-style work packs, site supervision, multi-trade coordination.',
      sizeLabel: 'Active project sites',
      sizeMin: 1, sizeMax: 30, sizeStep: 1, sizeDefault: 6,
      hint: 'Sizing rule: 1 work-pack lead per project site per 8-hour shift.',
      fmtSize: v => v + (v === 1 ? ' site' : ' sites'),
      divisor: 1,
      subPer: 5500, subUnit: 1,                // S$5,500 per site
      hourDefault: 8
    }
  };

  let currentVertical = 'security';
  let currentHours = 24;
  let subUserTouched = false;
  const selectedServices = new Set(['monitoring', 'analytics', 'dispatch']);

  function autoSub() {
    const cfg = VERTICALS[currentVertical];
    const size = +document.getElementById('cs-size').value;
    const units = size / cfg.subUnit;
    const raw = units * cfg.subPer;
    const subSlider = document.getElementById('cs-sub');
    const max = +subSlider.max;
    return Math.min(max, Math.max(2000, Math.round(raw / 500) * 500));
  }

  const VERTICAL_LABELS = {
    security: 'Security',
    merch: 'FMCG Merchandising',
    serviceops: 'Service Operations',
    project: 'Project Work'
  };

  function applyVertical(v) {
    currentVertical = v;
    const cfg = VERTICALS[v];
    document.getElementById('roiCalc').dataset.v = v;
    document.querySelectorAll('#cs-vertical button').forEach(b => b.classList.toggle('active', b.dataset.v === v));
    document.getElementById('cs-vertical-blurb').textContent = cfg.blurb;
    document.getElementById('cs-size-label').textContent = cfg.sizeLabel;
    document.getElementById('cs-size-hint').textContent = cfg.hint;
    const sizeSlider = document.getElementById('cs-size');
    sizeSlider.min = cfg.sizeMin;
    sizeSlider.max = cfg.sizeMax;
    sizeSlider.step = cfg.sizeStep;
    sizeSlider.value = cfg.sizeDefault;
    /* reset deployment hours to vertical-appropriate default */
    currentHours = cfg.hourDefault;
    document.querySelectorAll('#cs-hours button').forEach(b => b.classList.toggle('active', +b.dataset.h === currentHours));
    /* reset subscription auto-default when vertical changes */
    subUserTouched = false;
    document.getElementById('cs-sub-hint').textContent =
      'Auto-set from vertical + size. Drag to override.';
    /* chart recolour on next render */
    if (savingsChart) {
      const accent = getAccent();
      savingsChart.data.datasets[0].backgroundColor = ['#8a97ab', accent];
      savingsChart.update('none');
    }
  }

  function getAccent() {
    return getComputedStyle(document.getElementById('roiCalc'))
      .getPropertyValue('--accent').trim() || '#00337a';
  }

  let savingsChart = null;
  function savingsCalc() {
    const cfg = VERTICALS[currentVertical];
    const size = +document.getElementById('cs-size').value;
    const foc  = +document.getElementById('cs-foc').value;
    const svcCount = selectedServices.size;
    const subSlider = document.getElementById('cs-sub');
    if (!subUserTouched) subSlider.value = autoSub();
    const sub = +subSlider.value;

    setText('cs-size-v', cfg.fmtSize(size));
    setText('cs-foc-v', SGD(foc) + '/mo');
    setText('cs-sub-v', SGD(sub) + '/mo');
    setText('cs-svc-count', svcCount + ' of 6');
    const shiftSlots = currentHours / 8;
    setText('cs-hours-v', currentHours + 'h · ' + shiftSlots.toFixed(1) + ' shift slot' + (shiftSlots === 1 ? '' : 's'));
    setText('cs-summary',
      VERTICAL_LABELS[currentVertical] + ' · ' + cfg.fmtSize(size) +
      ' · ' + currentHours + 'h coverage · ' + svcCount + ' of 6 services');

    const baseFos = size / cfg.divisor;
    const serviceMult = svcCount <= 1 ? 1 : 1 + 0.15 * (svcCount - 1);
    const rawFos = baseFos * shiftSlots * serviceMult;
    const impliedFos = Math.max(1, Math.ceil(rawFos));

    setText('cs-fos', impliedFos + (impliedFos === 1 ? ' FO' : ' FOs'));
    setText('cs-fos-breakdown',
      'Base ' + baseFos.toFixed(1) + ' FOs × ' + shiftSlots.toFixed(1) +
      ' shift slot' + (shiftSlots === 1 ? '' : 's') +
      ' × ' + serviceMult.toFixed(2) + ' service mix = ' + rawFos.toFixed(1) + ' → rounded up');

    const convMonthly = impliedFos * foc;
    const monthly = Math.max(0, convMonthly - sub);
    const annual  = monthly * 12;
    const pct     = convMonthly > 0 ? (monthly / convMonthly) * 100 : 0;

    setText('cs-monthly', SGD(monthly));
    setText('cs-annual', SGD(annual));
    setText('cs-pct', (pct > 0 ? pct.toFixed(0) : '0') + '%');
    setText('cs-3yr', SGD(annual * 3));

    const convAnnual = convMonthly * 12;
    const subAnnual  = sub * 12;
    const canvas = document.getElementById('savingsChart');
    if (canvas && typeof Chart !== 'undefined') {
      const data = [convAnnual, subAnnual];
      const accent = getAccent();
      if (savingsChart) {
        savingsChart.data.datasets[0].data = data;
        savingsChart.data.datasets[0].backgroundColor = ['#8a97ab', accent];
        savingsChart.update();
      }
      else {
        savingsChart = new Chart(canvas, {
          type: 'bar',
          data: { labels: ['Conventional manning', 'Command Center subscription'],
            datasets: [{ data, backgroundColor: ['#8a97ab', accent], borderRadius: 2, barThickness: 64 }] },
          options: { responsive:true, maintainAspectRatio:false,
            plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:c=>'  '+SGD(c.parsed.y)+' / year' } } },
            scales:{ y:{ beginAtZero:true, ticks:{ callback:v=>'$'+(v/1000)+'k' }, grid:{ color:'#eee' } },
                     x:{ grid:{ display:false } } } }
        });
      }
    }
  }

  /* size + foc sliders */
  ['cs-size','cs-foc'].forEach(id => bind(id, savingsCalc));
  /* sub slider — mark as user-touched on input */
  const subEl = document.getElementById('cs-sub');
  if (subEl) {
    subEl.addEventListener('input', () => {
      subUserTouched = true;
      document.getElementById('cs-sub-hint').textContent = 'Manual override active. Switch vertical to reset.';
      savingsCalc();
    });
  }
  /* vertical segs */
  document.querySelectorAll('#cs-vertical button').forEach(btn => {
    btn.addEventListener('click', () => { applyVertical(btn.dataset.v); savingsCalc(); });
  });
  /* hours segs */
  document.querySelectorAll('#cs-hours button').forEach(btn => {
    btn.addEventListener('click', () => {
      currentHours = +btn.dataset.h;
      document.querySelectorAll('#cs-hours button').forEach(b => b.classList.toggle('active', b === btn));
      savingsCalc();
    });
  });
  /* service chips */
  document.querySelectorAll('#cs-services button').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.s;
      if (selectedServices.has(id)) { selectedServices.delete(id); btn.classList.remove('active'); }
      else { selectedServices.add(id); btn.classList.add('active'); }
      savingsCalc();
    });
  });

  /* ---- INVESTMENT PAYBACK MODE ---- (proposal formulas) */
  let cashChart = null;
  function paybackCalc() {
    const cGross = +document.getElementById('pb-capex').value;
    const sites  = +document.getElementById('pb-sites').value;
    const fcd    = +document.getElementById('pb-fcd').value;
    setText('pb-capex-v', SGD(cGross));
    setText('pb-sites-v', sites + ' sites');
    setText('pb-fcd-v', fcd + ' clients');

    const sEdg = 0.50 * 0.70 * cGross;          // EDG: 50% of 70% core infra
    const sJr  = 105000;                         // SkillsFuture WDG(JR+) rebate
    const sCcp = 45000;                          // SNEF CCP operator rebate
    const sGov = sEdg + sJr + sCcp;
    const cNet = cGross - sGov;

    const H        = sites * 2;                  // physical officers displaced
    const aGross   = H * 7500 * 12;
    const oCc      = 466000;                     // fixed command-centre OpEx
    const bInternal = aGross - oCc;

    const rSaas   = fcd * 5500 * 12;
    const oSaas   = fcd * 7500;
    const bExternal = rSaas - oSaas;

    const bNet = bInternal + bExternal;
    const roi  = cNet > 0 ? (bNet / cNet) * 100 : 0;
    const payback = bNet > 0 ? (cNet / bNet) * 12 : 0;

    setText('pb-funding', SGD(sGov));
    setText('pb-netcapex', SGD(cNet));
    setText('pb-savings', SGD(bNet));
    setText('pb-roi', (roi >= 0 ? roi.toFixed(0) : '0') + '%');
    setText('pb-payback', bNet > 0 ? payback.toFixed(1) + ' mo' : '—');

    const cash = [-cNet, bNet, bNet * 1.25, bNet * 1.65];
    const canvas = document.getElementById('cashChart');
    if (canvas && typeof Chart !== 'undefined') {
      if (cashChart) { cashChart.data.datasets[0].data = cash;
        cashChart.data.datasets[0].backgroundColor = cash.map(v => v < 0 ? '#d8232a' : '#00337a'); cashChart.update(); }
      else {
        cashChart = new Chart(canvas, {
          type: 'bar',
          data: { labels: ['Year 0', 'Year 1', 'Year 2', 'Year 3'],
            datasets: [{ data: cash, backgroundColor: cash.map(v => v < 0 ? '#d8232a' : '#00337a'), borderRadius: 2 }] },
          options: { responsive:true, maintainAspectRatio:false,
            plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:c=>'  '+SGD(c.parsed.y) } } },
            scales:{ y:{ ticks:{ callback:v=>'$'+(v/1000)+'k' }, grid:{ color:'#eee' } },
                     x:{ grid:{ display:false } } } }
        });
      }
    }
  }
  ['pb-capex','pb-sites','pb-fcd'].forEach(id => bind(id, paybackCalc));

  /* initial render */
  savingsCalc();
  paybackCalc();
}

/* -------------------------------------------------------------------
   9. MISC
   ------------------------------------------------------------------- */
function initYear() {
  const n = document.getElementById('year');
  if (n) n.textContent = String(new Date().getFullYear());
}

/* -------------------------------------------------------------------
   10. STAT COUNTERS — count-up on reveal for [data-counters] groups.
   Parses prefix / number / suffix so "S$3.65B", "99.98%", "07" all work.
   ------------------------------------------------------------------- */
function runCounter(node) {
  const raw = node.textContent.trim();
  const m = raw.match(/^(\D*?)([\d][\d.,]*)(.*)$/);
  if (!m) return;
  const prefix = m[1], suffix = m[3];
  const numStr = m[2].replace(/,/g, '');
  const target = parseFloat(numStr);
  if (!isFinite(target)) return;
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  const pad = (!numStr.includes('.') && numStr[0] === '0') ? numStr.length : 0;
  const grouped = m[2].includes(',');
  const dur = 1400, start = performance.now();
  const fmt = v => {
    let s = v.toFixed(decimals);
    if (grouped) s = Number(s).toLocaleString('en-SG');
    if (pad) s = s.padStart(pad, '0');
    return prefix + s + suffix;
  };
  node.textContent = fmt(0);
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    node.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
    else node.textContent = raw;
  }
  requestAnimationFrame(tick);
}
function initCounters() {
  const groups = document.querySelectorAll('[data-counters]');
  if (!groups.length) return;
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      e.target.querySelectorAll('.stat-num').forEach(runCounter);
    });
  }, { threshold: 0.45 });
  groups.forEach(g => io.observe(g));
}

/* -------------------------------------------------------------------
   SERVICE DETAIL DRAWER — slide-in bento card on service-card click
   ------------------------------------------------------------------- */
function initServiceDrawer() {
  const drawer    = document.getElementById('svcDrawer');
  const backdrop  = document.getElementById('svcBackdrop');
  if (!drawer || !backdrop) return;
  const eyebrowEl = document.getElementById('svcDrawerEyebrow');
  const titleEl   = document.getElementById('svcDrawerTitle');
  const summaryEl = document.getElementById('svcDrawerSummary');
  const bodyEl    = document.getElementById('svcDrawerBody');
  const closeBtn  = document.getElementById('svcDrawerClose');

  // safe-ish fragment from a markup string (no innerHTML on a DOM node)
  function frag(htmlStr) {
    return document.createRange().createContextualFragment(htmlStr);
  }
  function tile(label, opts) {
    const t = el('div', { cls: 'tile' + (opts.full ? ' full' : '') });
    t.appendChild(el('span', { cls: 'tile-label', text: label }));
    if (opts.text) {
      const p = el('p');
      p.appendChild(frag(opts.text));
      t.appendChild(p);
    }
    if (opts.list) {
      const ul = el('ul');
      opts.list.forEach(item => {
        const li = el('li');
        li.appendChild(frag(item));
        ul.appendChild(li);
      });
      t.appendChild(ul);
    }
    return t;
  }

  let lastFocused = null;

  function openDrawer(id, accent) {
    // resolve from either SERVICES_DEEP (services.html) or FCD_FEATURES_DEEP (manless-security.html)
    let svc  = SERVICES.find(s => s.id === id);
    let data = svc && typeof SERVICES_DEEP !== 'undefined' && SERVICES_DEEP[id];
    if (!svc) {
      svc  = (typeof FCD_FEATURES !== 'undefined') && FCD_FEATURES.find(s => s.id === id);
      data = svc && typeof FCD_FEATURES_DEEP !== 'undefined' && FCD_FEATURES_DEEP[id];
    }
    if (!data || !svc) return;

    lastFocused = document.activeElement;
    drawer.style.setProperty('--svc-accent', accent || '#1e5fa8');
    eyebrowEl.textContent = svc.n + ' — ' + svc.tag;
    titleEl.textContent   = svc.name;
    summaryEl.textContent = svc.blurb;

    while (bodyEl.firstChild) bodyEl.removeChild(bodyEl.firstChild);
    const bento = el('div', { cls: 'svc-bento' });
    // dynamic numbering: skip any tile whose data is missing on this entry
    const BENTO_DEF = [
      { key:'what',           label:'What it does',                full:true             },
      { key:'buyers',         label:'Who buys it (Singapore)',                  list:true },
      { key:'tech',           label:'The technology underneath',                list:true },
      { key:'slas',           label:'Key SLAs & metrics',                       list:true },
      { key:'pricing',        label:'Pricing in the SG market'                            },
      { key:'standards',      label:'Standards & compliance',                   list:true },
      { key:'differentiator', label:'Differentiator vs the field', full:true             },
      { key:'deployments',    label:'Typical deployments',         full:true,   list:true }
    ];
    let n = 0;
    BENTO_DEF.forEach(def => {
      const val = data[def.key];
      if (!val) return;
      n++;
      const numbered = (n < 10 ? '0' + n : String(n)) + ' — ' + def.label;
      const opts = def.list
        ? { list: val, full: def.full }
        : { text: val, full: def.full };
      bento.appendChild(tile(numbered, opts));
    });
    bodyEl.appendChild(bento);

    const cta = el('div', { cls: 'svc-drawer-cta' });
    cta.appendChild(el('p', { text: 'Map this service onto your sites — a walkthrough takes ~30 minutes.' }));
    const btn = el('a', {
      cls: 'btn-p', text: 'Request a walkthrough →',
      attrs: { href: 'mailto:derrick@elitez.asia?subject=Elitez%20Command%20Center%20%E2%80%94%20' + encodeURIComponent(svc.name) }
    });
    cta.appendChild(btn);
    bodyEl.appendChild(cta);

    bodyEl.scrollTop = 0;
    backdrop.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('svc-drawer-open');
    setTimeout(() => closeBtn.focus(), 240);
  }

  function closeDrawer() {
    if (!drawer.classList.contains('open')) return;
    backdrop.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('svc-drawer-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });

  // event delegation — any element carrying data-service opens the drawer
  document.addEventListener('click', e => {
    const card = e.target.closest('[data-service]');
    if (!card) return;
    openDrawer(card.getAttribute('data-service'), card.getAttribute('data-accent'));
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest && e.target.closest('[data-service]');
    if (!card) return;
    e.preventDefault();
    openDrawer(card.getAttribute('data-service'), card.getAttribute('data-accent'));
  });
}

/* -------------------------------------------------------------------
   COMMAND CENTER FEATURE OVERLAY — desktop-only annotated lightbox
   ------------------------------------------------------------------- */
function initCommandCenterOverlay() {
  const trigger = document.getElementById('ccTrigger');
  const overlay = document.getElementById('ccOverlay');
  if (!trigger || !overlay) return;
  /* Desktop only — bail on narrow viewports */
  const desktop = window.matchMedia('(min-width: 1024px)');
  if (!desktop.matches) return;

  const closeBtn = document.getElementById('ccClose');
  const frame    = document.getElementById('ccFrame');
  const img      = document.getElementById('ccImage');
  const leaders  = document.getElementById('ccLeaders');
  const stage    = overlay.querySelector('.cc-stage');

  function drawLeaders() {
    if (!frame || !leaders || !stage) return;
    const sr = stage.getBoundingClientRect();
    leaders.setAttribute('viewBox', '0 0 ' + sr.width + ' ' + sr.height);
    leaders.setAttribute('width',  sr.width);
    leaders.setAttribute('height', sr.height);
    while (leaders.firstChild) leaders.removeChild(leaders.firstChild);
    const ns = 'http://www.w3.org/2000/svg';
    const fr = frame.getBoundingClientRect();
    frame.querySelectorAll('.cc-pin').forEach(pin => {
      const n = pin.dataset.n;
      const callout = overlay.querySelector('.cc-callout[data-n="' + n + '"]');
      if (!callout) return;
      const pr = pin.getBoundingClientRect();
      const cr = callout.getBoundingClientRect();
      const px = (pr.left + pr.width  / 2) - sr.left;
      const py = (pr.top  + pr.height / 2) - sr.top;
      const calloutOnLeft = cr.right < fr.left + fr.width / 2;
      const cx = (calloutOnLeft ? cr.right : cr.left) - sr.left;
      const cy = (cr.top + cr.height / 2) - sr.top;

      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', cx);
      line.setAttribute('y1', cy);
      line.setAttribute('x2', px);
      line.setAttribute('y2', py);
      leaders.appendChild(line);

      /* terminal dot at the callout-side endpoint */
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', cx);
      dot.setAttribute('cy', cy);
      dot.setAttribute('r', 3);
      dot.setAttribute('class', 'cc-leader-dot');
      leaders.appendChild(dot);
    });
  }

  function open() {
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cc-locked');
    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      setTimeout(drawLeaders, 60);
      setTimeout(drawLeaders, 350);
    });
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('cc-locked');
    overlay.setAttribute('aria-hidden', 'true');
    setTimeout(() => { overlay.hidden = true; trigger.focus({ preventScroll: true }); }, 320);
  }

  trigger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.classList.contains('cc-grid') || e.target.classList.contains('cc-sweep')) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hidden) close();
  });
  let resizeT;
  window.addEventListener('resize', () => {
    if (overlay.hidden) return;
    clearTimeout(resizeT);
    resizeT = setTimeout(drawLeaders, 80);
  });
  if (!img.complete) {
    img.addEventListener('load', () => { if (!overlay.hidden) drawLeaders(); }, { once: true });
  }
}

/* ------------------------------- BOOTSTRAP ------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  buildBuGrid();
  buildDivisionPanel();
  buildServiceCards('servicePreview');
  buildServiceCards('serviceGrid');
  buildVideoWall();
  initStatusBanner();
  initCapexChart();
  initSubsidyBars();
  initRoiCalculator();
  initReveal();
  initCounters();
  initServiceDrawer();
  initCommandCenterOverlay();
  initYear();
});
