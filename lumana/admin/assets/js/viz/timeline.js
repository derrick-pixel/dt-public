// timeline.js — DOM-only vertical timeline of policies sorted by effective_date.

import { h, mount } from '../dom.js';

const fmt = (iso) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' });
};

export function renderPolicyTimeline({ container, policies }) {
  if (!container) return;
  const sorted = [...policies].sort((a, b) => (a.effective_date || '').localeCompare(b.effective_date || ''));
  const items = sorted.map(p => {
    const sentiment = p.sentiment || 'neutral';
    return h('div', { class: `timeline-item s-${sentiment}` },
      h('span', { class: 'date' }, fmt(p.effective_date)),
      h('h4', {}, p.title),
      h('p', {}, p.body),
      p.implication_for_us
        ? h('p', { style: { color: 'var(--brand-secondary)', fontWeight: 500 } },
            h('strong', {}, 'Implication: '), p.implication_for_us)
        : null,
      p.url
        ? h('p', { style: { fontSize: '12px', marginTop: '4px' } },
            h('a', { href: p.url, target: '_blank', rel: 'noopener' }, 'Source ↗'))
        : null,
    );
  });
  const wrap = h('div', { class: 'timeline' }, ...items);
  mount(container, wrap);
}
