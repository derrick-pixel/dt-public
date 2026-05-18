// design-audit.js — DOM-only renderer for the website design audit gallery.
// Handles both string-shaped notes (placeholder) and object-shaped notes
// (modernness/attractiveness/coherence/ui_clarity/accessibility/verdict/lumana_should_*).

import { h, mount } from '../dom.js';

const SUBSCORE_KEYS = [
  ['modernness', 'Modern'],
  ['attractiveness', 'Visual'],
  ['coherence', 'Coherence'],
  ['ui_clarity', 'UI clarity'],
  ['accessibility', 'A11y'],
];

function badgeClass(score) {
  if (score == null) return 'low';
  if (score >= 8) return '';
  if (score >= 6.5) return 'mid';
  return 'low';
}

function renderSubscores(notes) {
  return h('div', { class: 'subscores' },
    SUBSCORE_KEYS.map(([k, label]) => {
      const v = notes?.[k];
      const cls = (v != null && v <= 6) ? 'subscore low' : 'subscore';
      return h('div', { class: cls },
        h('span', { class: 'lbl' }, label),
        h('span', { class: 'val' }, v != null ? String(v) : '—'),
      );
    })
  );
}

function buildScreenshot(c) {
  if (!c.website_screenshot_path) {
    return h('div', { class: 'screenshot' }, 'No screenshot');
  }
  // The image may not exist — use onerror to flip to placeholder (no innerHTML).
  const img = h('img', {
    src: `../${c.website_screenshot_path}`,
    alt: `${c.name} — homepage screenshot`,
    loading: 'lazy',
  });
  img.style.cssText = 'width:100%;border-radius:4px;display:block;aspect-ratio:16/10;object-fit:cover;background:var(--card-soft);';
  img.addEventListener('error', () => {
    const placeholder = h('div', { class: 'screenshot' }, 'Screenshot pending');
    img.replaceWith(placeholder);
  });
  return img;
}

export function renderAuditCard(c) {
  const notes = c.website_design_notes;
  const isObj = notes && typeof notes === 'object';
  const rating = c.website_design_rating;
  const badge = h('span', { class: `score-badge ${badgeClass(rating)}` },
    rating != null ? `${rating}/10` : 'unrated');

  const card = h('article', { class: 'audit-card' },
    h('div', { class: 'heading-row' },
      h('h3', {}, c.name),
      badge,
    ),
    h('p', { class: 'url' }, c.url || ''),
    buildScreenshot(c),
    isObj ? renderSubscores(notes) : null,
    isObj && notes.verdict
      ? h('p', { class: 'verdict-text' }, notes.verdict)
      : (typeof notes === 'string' && notes ? h('p', { class: 'verdict-text' }, notes) : null),
    isObj && notes.lumana_should_steal
      ? h('div', { class: 'takeaway steal' },
          h('strong', {}, 'Steal'),
          notes.lumana_should_steal,
        )
      : null,
    isObj && notes.lumana_should_reject
      ? h('div', { class: 'takeaway reject' },
          h('strong', {}, 'Reject'),
          notes.lumana_should_reject,
        )
      : null,
  );
  return card;
}

export function renderAuditGallery({ container, competitors }) {
  if (!container) return;
  // Sort: rated first by descending score, then unrated alphabetically.
  const rated = competitors.filter(c => c.website_design_rating != null);
  const unrated = competitors.filter(c => c.website_design_rating == null);
  rated.sort((a, b) => (b.website_design_rating ?? 0) - (a.website_design_rating ?? 0));
  unrated.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  mount(container, ...rated.map(renderAuditCard), ...unrated.map(renderAuditCard));
}
