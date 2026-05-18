// competitor-table.js — DOM-only renderer for the competitor table + pagination.

import { h, mount } from '../dom.js';
import { computePageIndex } from './search.js';

const PAGE_SIZE = 12;

function priceCell(c) {
  if (c.sg_monthly_sgd != null) return `S$${c.sg_monthly_sgd}`;
  return c.pricing_range_published || '—';
}

function buildRow(c) {
  return h('tr', {},
    h('td', {},
      h('a', { href: c.url, target: '_blank', rel: 'noopener noreferrer' }, c.name),
      h('div', { style: { fontSize: '12px', color: 'var(--muted)', marginTop: '2px', maxWidth: '36ch', lineHeight: 1.4 } }, c.primary_value_prop || ''),
    ),
    h('td', {}, h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--muted)' } }, c.category)),
    h('td', {}, c.hq, h('div', { style: { fontSize: '11px', color: 'var(--muted-2)' } }, c.hq_region)),
    h('td', {},
      priceCell(c),
      h('div', { style: { marginTop: '2px' } },
        h('span', { class: `pricing-flag flag-${c.pricing_flag}` }, c.pricing_flag),
      ),
    ),
    h('td', {}, h('span', { class: `threat-badge threat-${c.threat_level}` }, String(c.threat_level))),
    h('td', {}, String(c.beatability ?? '—')),
    h('td', {}, c.website_design_rating != null ? `${c.website_design_rating}/10` : '—'),
  );
}

export function renderCompetitorTable({ tbody, paginationEl, countEl, list, total, onPageChange, currentPage = 0 }) {
  if (!tbody) return;
  const { start, end, totalPages, page } = computePageIndex(list.length, currentPage, PAGE_SIZE);
  const pageRows = list.slice(start, end);
  if (pageRows.length === 0) {
    mount(tbody, h('tr', {}, h('td', { colspan: 7, style: { textAlign: 'center', padding: '32px', color: 'var(--muted)' } }, 'No competitors match.')));
  } else {
    mount(tbody, ...pageRows.map(buildRow));
  }
  if (countEl) countEl.textContent = `Showing ${list.length === 0 ? 0 : start + 1}–${end} of ${list.length} matched · ${total} in database`;

  if (paginationEl) {
    if (totalPages <= 1) {
      mount(paginationEl);
      return;
    }
    const buttons = [];
    buttons.push(h('button', { type: 'button', disabled: page === 0, onClick: () => onPageChange(page - 1) }, '‹'));
    const window4 = 5;
    const half = Math.floor(window4 / 2);
    let from = Math.max(0, page - half);
    let to = Math.min(totalPages, from + window4);
    from = Math.max(0, to - window4);
    if (from > 0) {
      buttons.push(h('button', { type: 'button', onClick: () => onPageChange(0) }, '1'));
      if (from > 1) buttons.push(h('span', { style: { padding: '0 4px', color: 'var(--muted)' } }, '…'));
    }
    for (let i = from; i < to; i++) {
      buttons.push(h('button', { type: 'button', class: i === page ? 'active' : '', onClick: () => onPageChange(i) }, String(i + 1)));
    }
    if (to < totalPages) {
      if (to < totalPages - 1) buttons.push(h('span', { style: { padding: '0 4px', color: 'var(--muted)' } }, '…'));
      buttons.push(h('button', { type: 'button', onClick: () => onPageChange(totalPages - 1) }, String(totalPages)));
    }
    buttons.push(h('button', { type: 'button', disabled: page === totalPages - 1, onClick: () => onPageChange(page + 1) }, '›'));
    mount(paginationEl, ...buttons);
  }
}

export function renderNoResults({ container, query, filters }) {
  if (!container) return;
  const activeFilters = Object.entries(filters || {}).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(', ');
  mount(container,
    h('div', { class: 'no-results' },
      h('strong', {}, 'No competitors match.'),
      h('div', { style: { marginTop: '4px' } },
        query ? `Query: "${query}"` : 'No search query.',
        activeFilters ? ` · Filters: ${activeFilters}` : ''
      )
    )
  );
}

export { PAGE_SIZE };
