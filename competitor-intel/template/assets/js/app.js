import { h } from './dom.js';

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

export async function loadAppData() {
  const [competitors, market, pricing, whitespace] = await Promise.all([
    loadJSON('../data/competitors.json'),
    loadJSON('../data/market-intelligence.json'),
    loadJSON('../data/pricing-strategy.json'),
    loadJSON('../data/whitespace-framework.json'),
  ]);
  const data = { competitors, market, pricing, whitespace };
  window.AppData = data;
  return data;
}

export function mountSampleBanner() {
  if (!window.AppData) return;
  const anySample = [window.AppData.competitors, window.AppData.market, window.AppData.pricing, window.AppData.whitespace]
    .some(d => d?.meta?.sample_data === true);
  if (!anySample) return;
  const banner = h('div', { class: 'sample-data-banner' }, 'SAMPLE DATA — swap /data before shipping');
  document.body.prepend(banner);
}
