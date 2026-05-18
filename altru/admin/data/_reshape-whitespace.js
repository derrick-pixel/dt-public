#!/usr/bin/env node
// Reshape altru/data/whitespace-framework.json + altru/data/whitespace-competitors.json
// → admin/data/whitespace-framework.json (template schema)
// Cells are stubbed (Agent 4 to fill later); canvas scores derived from competitor data.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FW = resolve(__dirname, '../../data/whitespace-framework.json');
const COMP = resolve(__dirname, '../../data/whitespace-competitors.json');
const OUT = resolve(__dirname, 'whitespace-framework.json');

const fw = JSON.parse(readFileSync(FW, 'utf8'));
const comp = JSON.parse(readFileSync(COMP, 'utf8'));

const META = {
  project_name: 'Altru',
  brand_tokens: {
    primary: '#C8102E', secondary: '#9B0B20', accent: '#C9973A',
    neutral_dark: '#2D1010', neutral_light: '#FFF8F8',
    font_display: 'Playfair Display, Georgia, serif',
    font_body: 'Lato, system-ui, sans-serif',
  },
  research_date: '2026-05-05',
  sample_data: false,
};

// canvas dim → key
const slugDim = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const dimensions = fw.canvas_dims.map((label) => ({ key: slugDim(label), label }));

// Build us scores keyed by dim key
const usScores = {};
fw.canvas_dims.forEach((label, i) => {
  usScores[slugDim(label)] = fw.us_scores_canvas[i];
});

// For each competitor, derive a per-dim 0-5 score from their flags
const scoreCompetitor = (c) => {
  const k = (label) => slugDim(label);
  const out = {};
  // Heuristic mapping from existing fields → 0-5 per dimension
  const fee = c.platform_fee_percent ?? 10;
  out[k('Low couple fee (%)')] = fee === 0 ? 5 : fee <= 3 ? 4 : fee <= 5 ? 3 : fee <= 8 ? 2 : 1;
  out[k('250% IRAS tax relief')] = c.has_ipc_tax_relief ? 5 : 0;
  out[k('PayNow native')] = c.has_paynow_native ? 5 : 1;
  out[k('Wedding-specific UX')] = c.wedding_specific ? 5 : 0;
  out[k('IPC charity breadth')] = c.has_ipc_tax_relief ? (c.category === 'charity_platform' ? 5 : 3) : 0;
  out[k('Guest donor experience')] = c.has_paynow_native ? (c.wedding_specific ? 4 : 3) : c.wedding_specific ? 3 : 1;
  out[k('Corporate / company match')] = /Bountie|Whydonate|GiveNation|Community Chest|GiveBack/i.test(c.name) ? 4 : 1;
  out[k('Couple dashboard & analytics')] = c.wedding_specific && c.platform_fee_percent != null ? 4 : 0;
  return out;
};

// Pick 6 competitors to show on radar (most direct + diverse)
const slugify = (n) => n.toLowerCase().replace(/&/g, ' and ').replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48);
const radarPicks = [
  'Wishlist.sg',
  'Honeyfund',
  'Giving.sg',
  'DBS PayLah! Ang Bao / eAngBao',
  'Direct PayNow QR to IPC charity',
  'Community Chest (NCSS)',
];
const scores = { us: usScores };
radarPicks.forEach((name) => {
  const c = comp.competitors.find((x) => x.name === name);
  if (c) scores[slugify(c.name)] = scoreCompetitor(c);
});

// Heatmap segments: keep altru's 8
const segments = fw.segments.map((s) => ({
  id: s.id,
  name: s.label,
  descriptor: s.note,
}));

// Heatmap needs: keep altru's 8, add `short` for cell labels
const needs = fw.needs.map((n) => ({
  id: n.id,
  name: n.label,
  short: n.label.split(/[\s\(]/)[0].slice(0, 12).toUpperCase(),
  axis: n.axis,
}));

// Stub heatmap cells: empty (Agent 4 fills these). Render layer will show neutral cells.
const cells = {};

// Stub attack plans: empty array (Agent 4 fills these)
const attack_plans = [];

const out = {
  meta: META,
  strategy_canvas: {
    headline_thesis:
      'Altru wins the wedding-charity intersection by combining four axes that no single competitor crosses: low couple fee, 250% IRAS tax relief routing, PayNow-native guest experience, and wedding-day-purposed UX. Wedding registries cover the wedding axis but lack tax relief; charity platforms cover tax relief but not the wedding flow; PayNow apps cover the rail but route nothing to IPCs by default.',
    dimensions,
    scores,
  },
  heatmap: {
    segments,
    needs,
    cells,
    _agent_4_pending: true,
  },
  attack_plans,
  _legacy: {
    grid_size: fw.grid_size,
    research_date_initial: fw.research_date,
    notes: fw.notes,
    us_scores_rationale: fw.us_scores_rationale,
  },
};

writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`Wrote ${OUT}`);
console.log(`Canvas: ${dimensions.length} dims, ${Object.keys(scores).length} entities (us + ${radarPicks.length} competitors)`);
console.log(`Heatmap: ${segments.length} segments × ${needs.length} needs = ${segments.length * needs.length} cells (all stubs — Agent 4 to fill)`);
console.log(`Attack plans: 0 (stub — Agent 4 to fill)`);
