// country-readiness.js — DOM-only mini bar comparison across countries.
// Each row is a country; three bars per row (regulatory, tech_maturity, price_tolerance) on a 1-5 scale.

import { h, mount } from '../dom.js';

export function renderCountryReadiness({ container, rows }) {
  if (!container) return;
  const head = [
    h('div', { class: 'head' }, 'COUNTRY'),
    h('div', { class: 'head' }, 'Regulatory'),
    h('div', { class: 'head' }, 'Tech maturity'),
    h('div', { class: 'head' }, 'Price tolerance'),
  ];
  const cells = [];
  for (const r of rows) {
    cells.push(h('div', { class: 'country' }, r.country));
    for (const key of ['regulatory', 'tech_maturity', 'price_tolerance']) {
      const score = r[key] ?? 0;
      const pct = Math.max(0, Math.min(100, (score / 5) * 100));
      cells.push(
        h('div', { class: 'readiness-bar', 'aria-label': `${r.country} ${key.replace('_', ' ')}: ${score} of 5` },
          h('span', { class: `s${score}`, style: { width: `${pct}%` } }),
          h('span', { class: 'label' }, `${score}/5`),
        )
      );
    }
  }
  mount(container, ...head, ...cells);
}
