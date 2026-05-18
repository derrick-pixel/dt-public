// app.js — page bootstrap. Loads JSON, applies brand tokens, mounts sample banner.

import { h } from './dom.js';
import { applyBrand, ensureFonts } from './brand-bootstrap.js';

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

export async function loadAppData() {
  const [competitors, market, pricing, whitespace] = await Promise.all([
    loadJSON('data/competitors.json'),
    loadJSON('data/market-intelligence.json'),
    loadJSON('data/pricing-strategy.json'),
    loadJSON('data/whitespace-framework.json'),
  ]);
  const data = { competitors, market, pricing, whitespace };
  window.AppData = data;

  // Hydrate brand tokens before any render fires.
  ensureFonts();
  applyBrand(competitors?.meta?.brand_tokens);

  // Update document title to project name if a placeholder is present.
  const projectName = competitors?.meta?.project_name;
  if (projectName && (document.title.includes('NoteFlow') || document.title.includes('SAMPLE'))) {
    document.title = document.title
      .replace(/NoteFlow/gi, projectName)
      .replace(/\s+SAMPLE/gi, '')
      .replace(/—\s*$/, '')
      .trim();
  }

  return data;
}

export function mountSampleBanner() {
  const existing = document.querySelector('.sample-data-banner');
  if (!window.AppData) {
    if (existing) existing.hidden = true;
    return;
  }
  const anySample = [
    window.AppData.competitors,
    window.AppData.market,
    window.AppData.pricing,
    window.AppData.whitespace,
  ].some(d => d?.meta?.sample_data === true);
  if (!anySample) {
    if (existing) existing.hidden = true;
    return;
  }
  if (existing) {
    existing.hidden = false;
    return;
  }
  const banner = h('div', { class: 'sample-data-banner' }, 'SAMPLE DATA — swap /data before shipping');
  document.body.prepend(banner);
}

// Build a shared admin nav. Pass the page slug ('competitors' | 'insights' | 'whitespace' | 'design' | 'report').
export function renderAdminNav(active) {
  const projectName = window.AppData?.competitors?.meta?.project_name || 'Project';
  const links = [
    { slug: 'competitors', label: 'Competitors', href: 'index.html' },
    { slug: 'insights', label: 'Market & Pricing', href: 'insights.html' },
    { slug: 'whitespace', label: 'Whitespace Atlas', href: 'whitespace.html' },
    { slug: 'design', label: 'Design Audit', href: 'design-audit.html' },
    { slug: 'report', label: 'Report', href: 'report.html' },
  ];
  return h('nav', { class: 'admin-nav', 'aria-label': 'Admin sections' },
    h('span', { class: 'brand' }, projectName),
    ...links.map(l =>
      h('a', { href: l.href, class: l.slug === active ? 'active' : '', 'aria-current': l.slug === active ? 'page' : null }, l.label)
    ),
    h('span', { class: 'spacer' }),
    h('a', { href: '../index.html' }, '← Back to site'),
  );
}
