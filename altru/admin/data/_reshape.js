#!/usr/bin/env node
// Mechanical reshape: altru/data/whitespace-competitors.json → admin/data/competitors.json (template schema)
// Usage: node _reshape.js
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../../data/whitespace-competitors.json');
const OUT = resolve(__dirname, 'competitors.json');

const META = {
  project_name: 'Altru',
  brand_tokens: {
    primary: '#C8102E',
    secondary: '#9B0B20',
    accent: '#C9973A',
    neutral_dark: '#2D1010',
    neutral_light: '#FFF8F8',
    font_display: 'Playfair Display, Georgia, serif',
    font_body: 'Lato, system-ui, sans-serif',
  },
  research_date: '2026-05-05',
  sample_data: false,
};

// Map old categories → template enum (global_incumbent | sg_local | regional_challenger | diy_alternative | adjacent | big_si)
const CATEGORY_MAP = {
  wedding_registry: (hq) => (/Singapore/i.test(hq) ? 'sg_local' : /United States|UK|Global/i.test(hq) ? 'global_incumbent' : 'adjacent'),
  charity_platform: (hq) => (/Singapore/i.test(hq) ? 'sg_local' : 'adjacent'),
  donor_advised_fund: () => 'adjacent',
  digital_angbao: () => 'diy_alternative',
  wedding_vendor_platform: (hq) => (/Singapore/i.test(hq) ? 'sg_local' : 'adjacent'),
  diy_fundraiser: () => 'diy_alternative',
  recurring_charity_fintech: () => 'adjacent',
  religious_community: () => 'adjacent',
};

const HQ_REGION = (hq) => {
  if (/Singapore|Malaysia|Indonesia|Thailand|Vietnam|Philippines|SEA/i.test(hq)) return 'SEA';
  if (/Hong Kong|Japan|Korea|Taiwan|China|India|Australia|APAC/i.test(hq)) return 'APAC';
  if (/United States|UK|United Kingdom|Canada|Germany|Europe|Global/i.test(hq)) return 'Global';
  return 'Other';
};

const THREAT_MAP = { low: 2, medium: 3, high: 4 };
const BEAT_MAP = { easy: 5, moderate: 3, hard: 1 };

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);

const splitList = (s) =>
  String(s)
    .split(/;|·|•|,(?=\s)|\bwanting\b|\bhosting\b/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 6);

const txnToShare = (range) => null; // we don't have public market-share figures; null per FIELD-DICTIONARY

const src = JSON.parse(readFileSync(SRC, 'utf8'));

const competitors = src.competitors.map((c) => {
  const cat = CATEGORY_MAP[c.category]?.(c.hq) || 'adjacent';
  const region = HQ_REGION(c.hq);
  const id = slugify(c.name);
  const sgMonthly = null; // these are transaction-fee businesses, not monthly subs
  const features = [];
  if (c.wedding_specific) features.push('Wedding-specific UX');
  if (c.has_ipc_tax_relief) features.push('IPC tax-relief routing');
  if (c.has_paynow_native) features.push('PayNow-native');
  if (c.platform_fee_percent != null) features.push(`Platform fee ${c.platform_fee_percent}%`);
  if (c.sg_localisation_score >= 4) features.push('SG-localised');

  return {
    id,
    name: c.name,
    url: c.url,
    category: cat,
    hq: c.hq,
    hq_region: region,
    target_market: splitList(c.target_market),
    countries_covered: region === 'SEA' ? ['SG'] : region === 'Global' ? ['Global'] : [c.hq],
    sg_monthly_sgd: sgMonthly,
    pricing_range_published: c.pricing_notes || (c.platform_fee_percent != null ? `${c.platform_fee_percent}% platform fee` : 'Not published'),
    pricing_flag: c.pricing_flag || 'hidden_estimated',
    primary_value_prop: (c.primary_value_prop || '').slice(0, 120),
    features,
    strengths: c.strengths || [],
    weaknesses: c.weaknesses || [],
    threat_level: THREAT_MAP[c.threat_level_to_altru] ?? 3,
    beatability: BEAT_MAP[c.beatability] ?? 3,
    market_share_estimate_pct: txnToShare(c.estimated_sg_annual_transactions),
    research_date: '2026-04-22',
    website_design_rating: null,
    website_design_notes: '',
    website_screenshot_path: '',
    _legacy: {
      original_category: c.category,
      platform_fee_percent: c.platform_fee_percent,
      has_ipc_tax_relief: c.has_ipc_tax_relief,
      has_paynow_native: c.has_paynow_native,
      wedding_specific: c.wedding_specific,
      sg_localisation_score: c.sg_localisation_score,
      estimated_sg_annual_transactions: c.estimated_sg_annual_transactions,
    },
  };
});

// Pick Top-5: highest threat × wedding_specific × SG presence; tie-break by beatability descending (hardest to beat first)
const topRanked = [...competitors]
  .map((c) => ({
    c,
    score:
      c.threat_level * 10 +
      (c._legacy.wedding_specific ? 5 : 0) +
      (c.hq_region === 'SEA' ? 4 : 0) +
      (c._legacy.has_paynow_native ? 2 : 0) +
      (5 - c.beatability),
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);

const top_five = topRanked.map(({ c }, i) => {
  const reasons = [];
  if (c._legacy.wedding_specific) reasons.push('wedding-native');
  if (c.hq_region === 'SEA') reasons.push('SG/SEA presence');
  if (c._legacy.has_ipc_tax_relief) reasons.push('IPC tax-relief routing');
  if (c._legacy.has_paynow_native) reasons.push('PayNow-native');
  if (c.threat_level >= 4) reasons.push('high direct overlap with Altru positioning');
  return {
    competitor_id: c.id,
    rank: i + 1,
    rationale: (`${c.name}: ${reasons.join(', ')}.`).slice(0, 200),
  };
});

const out = {
  meta: META,
  top_five,
  competitors,
  _categories_legacy: src.categories,
  _methodology_note: src.methodology,
};

writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`Wrote ${competitors.length} competitors → ${OUT}`);
console.log('Top-5:');
top_five.forEach((t) => console.log(`  ${t.rank}. ${t.competitor_id} — ${t.rationale}`));
