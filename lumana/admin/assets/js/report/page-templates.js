// page-templates.js — section registry + renderers for the Lumana
// Competitive Intelligence PDF. All DOM built via h() (no HTML-string
// setters). Page backgrounds use brand tokens so they bleed full-bleed
// into the PDF margins (cover is brand-secondary teal, body pages are
// neutral-light cream, the whitespace thesis page is brand-primary teal).
//
// Section order — fixed:
//   1. Cover
//   2. Table of Contents
//   3. Executive Summary
//   4. Market Landscape
//   5. Competitive Set
//   6. Pricing Strategy
//   7. Whitespace & Attack Plans (thesis · heatmap · cell appendix)
//   8. Website Design Audit Highlights
//   9. Appendix (full competitor index · sources · methodology)
//
// The brief calls this an "8-section" report; sections 1 (Cover) and 2 (TOC)
// are scaffolding around the eight content sections (Exec, Market,
// Competitive Set, Pricing, Whitespace, Design, Appendix). The TOC lists the
// eight content sections.

import { h, mount } from '../dom.js';
import { computePageIndex } from './toc.js';
import {
  execOpening, landscapeOpening, marketOpening,
  pricingOpening, whitespaceOpening, designOpening,
} from './openings.js';
import { collectSources } from './sources.js';

const APPENDIX_PER_PAGE = 18;
const CELL_DETAIL_PER_PAGE = 4;

export function buildSections(data) {
  return [
    { id: 'cover',    title: 'Cover',                      render: renderCover,      countPages: () => 1 },
    { id: 'toc',      title: 'Table of Contents',          render: renderTOC,        countPages: () => 1 },
    { id: 'exec',     title: 'Executive Summary',          render: renderExec,       countPages: () => 1 },
    { id: 'market',   title: 'Market Landscape',           render: renderMarket,     countPages: () => 2 },
    { id: 'compset',  title: 'Competitive Set',            render: renderCompset,    countPages: () => 2 },
    { id: 'pricing',  title: 'Pricing Strategy',           render: renderPricing,    countPages: () => 2 },
    { id: 'white',    title: 'Whitespace & Attack Plans',  render: renderWhitespace, countPages: (d) => 3 + countCellDetailPages(d) },
    { id: 'design',   title: 'Website Design Audit',       render: renderDesign,     countPages: () => 2 },
    { id: 'appendix', title: 'Appendix',                   render: renderAppendix,   countPages: (d) => Math.ceil(d.competitors.competitors.length / APPENDIX_PER_PAGE) + 2 },
  ];
}

function countCellDetailPages(d) {
  const cells = Object.values(d.whitespace.heatmap.cells || {});
  const decisionGrade = cells.filter(cell => {
    const count = (cell.competitors || []).filter(x => (x.score ?? 0) >= 3).length;
    return count <= 1 || count >= 4;
  }).length;
  return Math.max(1, Math.ceil(decisionGrade / CELL_DETAIL_PER_PAGE));
}

export function renderPages(root, sections, data) {
  const idx = computePageIndex(sections, data);
  const ctx = { pageIndex: idx, total: idx._total, currentPage: 0 };
  mount(root);
  for (const s of sections) s.render(root, data, ctx);
}

// ──────────────────────────────────────────────────────────────────────
// Page primitives
// ──────────────────────────────────────────────────────────────────────

function page(cls = 'pdf-content') {
  return h('div', { class: `pdf-page ${cls}` });
}

function footer(pageNum, total, data) {
  return h('div', { class: 'pdf-footer' },
    h('span', { class: 'foot-project' }, data.competitors.meta.project_name),
    h('span', { class: 'foot-page' }, `page ${pageNum} of ${total}`),
    h('span', { class: 'foot-date' }, data.competitors.meta.research_date)
  );
}

function sectionHead(kicker, title) {
  return h('header', { class: 'sec-head' },
    h('span', { class: 'sec-kicker' }, kicker),
    h('h2', { class: 'sec-title' }, title),
    h('div', { class: 'sec-rule' })
  );
}

function opening(text) {
  return h('p', { class: 'opening' }, text);
}

// ──────────────────────────────────────────────────────────────────────
// 1. Cover
// ──────────────────────────────────────────────────────────────────────

function renderCover(root, data) {
  const meta = data.competitors.meta;
  const el = page('pdf-cover');
  mount(el,
    h('div', { class: 'cover-mark' }, h('span', { class: 'cover-mark-dot' }), 'Lumana'),
    h('div', { class: 'cover-body' },
      h('p', { class: 'cover-kicker' }, 'Competitive Intelligence Report'),
      h('h1', { class: 'cover-title' }, meta.project_name),
      h('p', { class: 'cover-subtitle' },
        'A field map of the AU/HK/SG ambient aged-care monitoring landscape — competitors, pricing, whitespace, and the attack plans that follow.'
      )
    ),
    h('footer', { class: 'cover-foot' },
      h('div', {},
        h('div', { class: 'cover-foot-label' }, 'Prepared'),
        h('div', { class: 'cover-foot-value' }, meta.research_date)
      ),
      h('div', {},
        h('div', { class: 'cover-foot-label' }, 'Classification'),
        h('div', { class: 'cover-foot-value' }, 'Confidential — Internal Strategy')
      ),
      h('div', {},
        h('div', { class: 'cover-foot-label' }, 'Workstream'),
        h('div', { class: 'cover-foot-value' }, 'Agents 1–6 · compiled by Agent 8')
      )
    )
  );
  root.append(el);
}

// ──────────────────────────────────────────────────────────────────────
// 2. Table of Contents
// ──────────────────────────────────────────────────────────────────────

function renderTOC(root, data, ctx) {
  const entries = [
    ['1', 'Executive Summary',           ctx.pageIndex.exec],
    ['2', 'Market Landscape',            ctx.pageIndex.market],
    ['3', 'Competitive Set',             ctx.pageIndex.compset],
    ['4', 'Pricing Strategy',            ctx.pageIndex.pricing],
    ['5', 'Whitespace & Attack Plans',   ctx.pageIndex.white],
    ['6', 'Website Design Audit',        ctx.pageIndex.design],
    ['7', 'Appendix',                    ctx.pageIndex.appendix],
  ];
  const el = page('pdf-toc');
  mount(el,
    h('div', { class: 'toc-head' },
      h('span', { class: 'toc-kicker' }, 'Contents'),
      h('h2', { class: 'toc-title' }, 'What you’ll find inside')
    ),
    h('ol', { class: 'toc-list' }, entries.map(([num, title, p]) =>
      h('li', { class: 'toc-row' },
        h('span', { class: 'toc-num' }, num),
        h('span', { class: 'toc-title-text' }, title),
        h('span', { class: 'toc-dots' }),
        h('span', { class: 'toc-page' }, String(p))
      )
    )),
    footer(ctx.pageIndex.toc, ctx.total, data)
  );
  root.append(el);
}

// ──────────────────────────────────────────────────────────────────────
// 3. Executive Summary
// ──────────────────────────────────────────────────────────────────────

function renderExec(root, data, ctx) {
  const top3threats = data.competitors.top_five.slice(0, 3).map(t => ({
    name: data.competitors.competitors.find(c => c.id === t.competitor_id)?.name || t.competitor_id,
    rationale: t.rationale,
  }));
  const top3plays = data.whitespace.attack_plans.slice(0, 3).map(p => ({
    rank: p.rank,
    name: p.niche_name,
    why: p.why_we_win || '',
  }));
  const recTier = (data.pricing.recommended_tiers || []).find(t => t.recommended) || data.pricing.recommended_tiers?.[1] || data.pricing.recommended_tiers?.[0];
  const tam = data.market.market_size.tam_sgd;
  const sam = data.market.market_size.sam_sgd;
  const som = data.market.market_size.som_sgd;
  const risks = (data.pricing.top_risks_and_mitigations || []).slice(0, 3);

  const el = page();
  mount(el,
    sectionHead('§1', 'Executive Summary'),
    opening(execOpening(data)),

    h('div', { class: 'exec-grid' },
      h('div', { class: 'exec-block' },
        h('h3', { class: 'exec-h' }, 'Market opportunity'),
        h('p', {}, `TAM A$${(tam / 1e6).toFixed(0)}M · SAM A$${(sam / 1e6).toFixed(0)}M · 5-year SOM A$${(som / 1e6).toFixed(1)}M (AU primary, HK + SG secondary). Aged Care Act 2024 + AN-ACC tailwinds compress the buying window into a 9–12 month procurement cycle.`)
      ),
      h('div', { class: 'exec-block' },
        h('h3', { class: 'exec-h' }, 'Competitive position'),
        h('ol', { class: 'exec-list' }, top3threats.map(t =>
          h('li', {}, h('strong', {}, t.name), ' — ', t.rationale)
        ))
      ),
      h('div', { class: 'exec-block' },
        h('h3', { class: 'exec-h' }, 'Recommended pricing'),
        recTier
          ? h('p', {},
              h('strong', {}, recTier.name),
              ` — ${recTier.currency || 'A$'}${recTier.price_aud ?? recTier.price_sgd}/bed/mo (${recTier.term_months || '—'} mo). `,
              `Effective post-grant: A$${recTier.effective_price_after_psg ?? '—'}. `,
              recTier.psychological_anchor || ''
            )
          : h('p', {}, 'Pricing recommendation pending.')
      ),
      h('div', { class: 'exec-block' },
        h('h3', { class: 'exec-h' }, 'Top 3 attack plays'),
        h('ol', { class: 'exec-list' }, top3plays.map(p =>
          h('li', {}, h('strong', {}, `#${p.rank} ${p.name}`), ' — ', truncate(p.why, 180))
        ))
      ),
      h('div', { class: 'exec-block exec-risks' },
        h('h3', { class: 'exec-h' }, 'Key risks'),
        h('ol', { class: 'exec-list' }, risks.map(r =>
          h('li', {}, h('strong', {}, `R${r.rank}.`), ' ', truncate(r.risk, 220))
        ))
      ),
    ),
    footer(ctx.pageIndex.exec, ctx.total, data)
  );
  root.append(el);
}

// ──────────────────────────────────────────────────────────────────────
// 4. Market Landscape
// ──────────────────────────────────────────────────────────────────────

function renderMarket(root, data, ctx) {
  const m = data.market;
  const tam = m.market_size;

  // Page A — TAM/SAM/SOM + regulatory window
  const p1 = page();
  mount(p1,
    sectionHead('§2', 'Market Landscape'),
    opening(marketOpening(data)),

    h('div', { class: 'market-band' },
      h('div', { class: 'mb-card' },
        h('div', { class: 'mb-label' }, 'TAM'),
        h('div', { class: 'mb-value' }, `A$${(tam.tam_sgd / 1e6).toFixed(0)}M`),
        h('div', { class: 'mb-unit' }, 'addressable / yr')
      ),
      h('div', { class: 'mb-card' },
        h('div', { class: 'mb-label' }, 'SAM'),
        h('div', { class: 'mb-value' }, `A$${(tam.sam_sgd / 1e6).toFixed(0)}M`),
        h('div', { class: 'mb-unit' }, 'serviceable / yr')
      ),
      h('div', { class: 'mb-card' },
        h('div', { class: 'mb-label' }, 'SOM (5-yr)'),
        h('div', { class: 'mb-value' }, `A$${(tam.som_sgd / 1e6).toFixed(1)}M`),
        h('div', { class: 'mb-unit' }, 'capture target')
      ),
    ),

    h('h3', { class: 'mb-h' }, 'How we get here'),
    h('p', { class: 'mb-prose' }, truncate(tam.methodology_appendix || tam.reasoning || '', 700)),
    h('p', { class: 'mb-prose mb-implication' },
      h('strong', {}, 'Implication for Lumana — '),
      truncate(
        // Prefer the structured implications[] (joined), fall back to the legacy single string.
        (Array.isArray(tam.implications) && tam.implications.length
          ? tam.implications.map(i => `${i.headline}: ${i.body}`).join(' · ')
          : tam.implication_for_us) || '',
        600
      )
    ),

    footer(ctx.pageIndex.market, ctx.total, data)
  );
  root.append(p1);

  // Page B — country readiness + policies
  const p2 = page();
  const countries = (m.adoption_patterns?.country_readiness || []).filter(c =>
    ['Australia', 'Hong Kong', 'Singapore', 'AU', 'HK', 'SG'].includes(c.country)
  );
  const allCountries = m.adoption_patterns?.country_readiness || [];
  const useCountries = countries.length ? countries : allCountries;

  mount(p2,
    h('h3', { class: 'mb-h' }, 'Regulatory & buying window'),
    h('div', { class: 'policy-grid' },
      ...(m.policies || []).slice(0, 4).map(p => h('div', { class: `policy-pill policy-${(p.sentiment || 'neutral').toLowerCase()}` },
        h('div', { class: 'pp-head' },
          h('span', { class: 'pp-sent' }, (p.sentiment || 'neutral').toUpperCase()),
          h('span', { class: 'pp-date' }, p.effective_date || p.data_as_of || '')
        ),
        h('div', { class: 'pp-title' }, p.title),
        h('div', { class: 'pp-body' }, truncate(p.body || '', 220)),
        h('div', { class: 'pp-impl' }, h('strong', {}, 'Implication: '), truncate(p.implication_for_us || '', 220))
      ))
    ),

    h('h3', { class: 'mb-h' }, 'Country readiness — AU · HK · SG'),
    h('table', { class: 'data-table' },
      h('thead', {}, h('tr', {}, ...['Country', 'Regulatory', 'Tech maturity', 'Price tolerance'].map(t => h('th', {}, t)))),
      h('tbody', {}, useCountries.map(r =>
        h('tr', {},
          h('td', {}, r.country),
          h('td', {}, scoreCell(r.regulatory)),
          h('td', {}, scoreCell(r.tech_maturity)),
          h('td', {}, scoreCell(r.price_tolerance))
        )
      ))
    ),
    footer(ctx.pageIndex.market + 1, ctx.total, data)
  );
  root.append(p2);
}

function scoreCell(v) {
  if (v == null) return '—';
  return h('span', { class: `score-pill s${v}` }, String(v));
}

// ──────────────────────────────────────────────────────────────────────
// 5. Competitive Set
// ──────────────────────────────────────────────────────────────────────

function renderCompset(root, data, ctx) {
  const c = data.competitors;
  const top5 = c.top_five.map(t => {
    const comp = c.competitors.find(x => x.id === t.competitor_id) || {};
    return { ...t, comp };
  });

  const p1 = page();
  mount(p1,
    sectionHead('§3', 'Competitive Set'),
    opening(landscapeOpening(data)),

    h('h3', { class: 'mb-h' }, 'Top 5 — deep dive'),
    h('div', { class: 'top5-list' }, top5.map(t =>
      h('div', { class: 'top5-row' },
        h('div', { class: 'top5-rank' }, `#${t.rank}`),
        h('div', { class: 'top5-body' },
          h('div', { class: 'top5-title' },
            h('span', { class: 'top5-name' }, t.comp.name || t.competitor_id),
            h('span', { class: 'top5-meta' }, `${t.comp.hq || '—'} · ${t.comp.category || '—'}`)
          ),
          h('p', { class: 'top5-rationale' }, t.rationale),
          h('div', { class: 'top5-stats' },
            stat('Threat', t.comp.threat_level),
            stat('Beatability', t.comp.beatability),
            stat('A$/bed/mo', t.comp.sg_monthly_sgd ?? '—'),
          )
        )
      )
    )),
    footer(ctx.pageIndex.compset, ctx.total, data)
  );
  root.append(p1);

  // Page B — category mix donut + top-10 table
  const cats = {};
  for (const x of c.competitors) {
    const k = x.category || 'unknown';
    cats[k] = (cats[k] || 0) + 1;
  }
  const sortedCats = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const totalN = c.competitors.length;
  const top10 = [...c.competitors].sort((a, b) => (b.threat_level || 0) - (a.threat_level || 0)).slice(0, 10);

  const p2 = page();
  mount(p2,
    h('h3', { class: 'mb-h' }, 'Category mix'),
    h('div', { class: 'catmix' }, sortedCats.map(([cat, n]) => {
      const pct = Math.round((n / totalN) * 100);
      return h('div', { class: 'catmix-row' },
        h('div', { class: 'catmix-label' }, prettyCat(cat)),
        h('div', { class: 'catmix-bar' },
          h('div', { class: 'catmix-fill', style: { width: `${pct}%` } })
        ),
        h('div', { class: 'catmix-num' }, `${n} · ${pct}%`)
      );
    })),

    h('h3', { class: 'mb-h' }, 'Top 10 by threat level'),
    h('table', { class: 'data-table' },
      h('thead', {}, h('tr', {}, ...['Name', 'Category', 'HQ', 'A$/bed/mo', 'Threat', 'Beat'].map(t => h('th', {}, t)))),
      h('tbody', {}, top10.map(comp =>
        h('tr', {},
          h('td', {}, comp.name),
          h('td', {}, prettyCat(comp.category)),
          h('td', {}, comp.hq),
          h('td', {}, comp.sg_monthly_sgd ?? '—'),
          h('td', {}, threatPill(comp.threat_level)),
          h('td', {}, String(comp.beatability ?? '—'))
        )
      ))
    ),
    footer(ctx.pageIndex.compset + 1, ctx.total, data)
  );
  root.append(p2);
}

function stat(label, value) {
  return h('div', { class: 'top5-stat' },
    h('div', { class: 'ts-label' }, label),
    h('div', { class: 'ts-value' }, String(value ?? '—'))
  );
}

function threatPill(v) {
  if (v == null) return '—';
  return h('span', { class: `threat-pill t${v}` }, String(v));
}

function prettyCat(c) {
  if (!c) return 'Unknown';
  return c.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ──────────────────────────────────────────────────────────────────────
// 6. Pricing Strategy
// ──────────────────────────────────────────────────────────────────────

function renderPricing(root, data, ctx) {
  const p = data.pricing;
  const personas = p.personas || [];
  const tiers = p.recommended_tiers || [];

  const p1 = page();
  mount(p1,
    sectionHead('§4', 'Pricing Strategy'),
    opening(pricingOpening(data)),

    h('h3', { class: 'mb-h' }, 'Recommended tiers'),
    h('div', { class: 'tier-grid' }, tiers.map(t =>
      h('div', { class: `tier-card-pdf ${t.recommended ? 'is-recommended' : ''}` },
        t.recommended ? h('span', { class: 'tier-badge' }, 'Recommended') : null,
        h('div', { class: 'tier-name' }, t.name),
        h('div', { class: 'tier-price' },
          `${t.currency || 'A$'}${t.price_aud ?? t.price_sgd ?? '—'}`,
          h('span', { class: 'tier-unit' }, '/bed/mo')
        ),
        h('div', { class: 'tier-target' }, t.target_persona || '—'),
        h('p', { class: 'tier-anchor' }, truncate(t.psychological_anchor || '', 180)),
        h('div', { class: 'tier-foot' }, `Post-grant: A$${t.effective_price_after_psg ?? '—'} · ${t.term_months || '—'} mo`)
      )
    )),
    footer(ctx.pageIndex.pricing, ctx.total, data)
  );
  root.append(p1);

  // Page B — persona-tier map, sensitivity, top 3 risks
  const sens = p.sensitivity_analysis || {};
  const risks = (p.top_risks_and_mitigations || []).slice(0, 3);

  const p2 = page();
  mount(p2,
    h('h3', { class: 'mb-h' }, 'Persona ↔ tier map'),
    h('table', { class: 'data-table' },
      h('thead', {}, h('tr', {}, ...['Persona', 'ICP', 'WTP A$/bed/mo', 'Next-best alt', 'Region'].map(t => h('th', {}, t)))),
      h('tbody', {}, personas.map(x =>
        h('tr', {},
          h('td', {}, x.name),
          h('td', {}, truncate(x.icp || '', 120)),
          h('td', {},
            x.wtp_band_sgd
              ? `${x.wtp_band_sgd.low_anchor ?? '—'}–${x.wtp_band_sgd.upper_stretch ?? '—'}`
              : '—'
          ),
          h('td', {}, truncate(x.nba || '', 80)),
          h('td', {}, (x.regions || []).join(', '))
        )
      ))
    ),

    h('h3', { class: 'mb-h' }, 'Sensitivity'),
    h('p', { class: 'mb-prose' }, truncate(sens.headline || '—', 600)),

    h('h3', { class: 'mb-h' }, 'Top 3 pricing risks'),
    h('div', { class: 'risk-list' }, risks.map(r =>
      h('div', { class: 'risk-row' },
        h('div', { class: 'risk-rank' }, `R${r.rank}`),
        h('div', { class: 'risk-body' },
          h('div', { class: 'risk-text' }, h('strong', {}, 'Risk: '), truncate(r.risk || '', 280)),
          h('div', { class: 'risk-mit' }, h('strong', {}, 'Mitigation: '), truncate(r.mitigation || '', 280))
        )
      )
    )),
    footer(ctx.pageIndex.pricing + 1, ctx.total, data)
  );
  root.append(p2);
}

// ──────────────────────────────────────────────────────────────────────
// 7. Whitespace & Attack Plans (thesis · canvas · heatmap · cells)
// ──────────────────────────────────────────────────────────────────────

function renderWhitespace(root, data, ctx) {
  const w = data.whitespace;
  let offset = 0;

  // 7a — Thesis page (full-bleed teal, brand-primary)
  const p1 = page('pdf-fullbleed');
  mount(p1,
    h('div', { class: 'fb-mark' }, h('span', { class: 'cover-mark-dot' }), 'Lumana · Whitespace Atlas'),
    h('div', { class: 'fb-body' },
      h('p', { class: 'fb-kicker' }, '§5 · Whitespace & Attack Plans'),
      h('h2', { class: 'fb-thesis' }, w.strategy_canvas.headline_thesis),
      h('p', { class: 'fb-opening' }, whitespaceOpening(data)),
    ),
    h('div', { class: 'fb-foot' },
      h('span', {}, data.competitors.meta.project_name),
      h('span', {}, `page ${ctx.pageIndex.white + offset} of ${ctx.total}`),
      h('span', {}, data.competitors.meta.research_date)
    )
  );
  root.append(p1);
  offset++;

  // 7b — Strategy canvas + heatmap summary
  const segments = w.heatmap.segments || [];
  const needs = w.heatmap.needs || [];
  const cells = w.heatmap.cells || {};

  const p2 = page();
  mount(p2,
    h('h3', { class: 'mb-h' }, 'Strategy canvas — eight dimensions'),
    h('div', { class: 'canvas-list' }, (w.strategy_canvas.dimensions || []).map(d => {
      const us = w.strategy_canvas.scores?.us?.[d.key] ?? 0;
      const others = Object.entries(w.strategy_canvas.scores || {})
        .filter(([k]) => k !== 'us')
        .map(([, v]) => v[d.key] ?? 0);
      const otherMax = others.length ? Math.max(...others) : 0;
      return h('div', { class: 'canvas-row' },
        h('div', { class: 'canvas-label' }, d.label),
        h('div', { class: 'canvas-track' },
          h('div', { class: 'canvas-other', style: { width: `${(otherMax / 5) * 100}%` } }),
          h('div', { class: 'canvas-us', style: { width: `${(us / 5) * 100}%` } })
        ),
        h('div', { class: 'canvas-num' }, `Lumana ${us} · best other ${otherMax}`)
      );
    })),
    h('div', { class: 'canvas-legend' },
      h('span', {}, h('span', { class: 'legend-dot us' }), 'Lumana (us)'),
      h('span', {}, h('span', { class: 'legend-dot other' }), 'Best competitor on dimension')
    ),

    h('h3', { class: 'mb-h' }, 'Segment × Need heatmap'),
    h('table', { class: 'heatmap-table' },
      h('thead', {},
        h('tr', {}, h('th', {}, ''), ...needs.map(n => h('th', { class: 'hm-need' }, n.short || n.id)))
      ),
      h('tbody', {}, segments.map(s =>
        h('tr', {},
          h('th', { class: 'hm-seg' }, s.short || s.name),
          ...needs.map(n => {
            const cell = cells[`${s.id}:${n.id}`] || { competitors: [] };
            const count = (cell.competitors || []).filter(x => (x.score ?? 0) >= 3).length;
            const band = count <= 1 ? 'green' : count <= 3 ? 'amber' : 'red';
            return h('td', { class: `hm-cell hm-${band}` }, String(count));
          })
        )
      ))
    ),
    h('div', { class: 'hm-legend' },
      h('span', {}, h('span', { class: 'hm-swatch hm-green' }), '0–1 · WHITESPACE'),
      h('span', {}, h('span', { class: 'hm-swatch hm-amber' }), '2–3 · CONTESTED'),
      h('span', {}, h('span', { class: 'hm-swatch hm-red' }), '4+ · CROWDED')
    ),
    footer(ctx.pageIndex.white + offset, ctx.total, data)
  );
  root.append(p2);
  offset++;

  // 7c — Attack plans page
  const plans = w.attack_plans || [];
  const p3 = page();
  mount(p3,
    h('h3', { class: 'mb-h' }, 'Attack plans — target · wedge · proof · horizon'),
    h('div', { class: 'attack-list' }, plans.map(ap => h('div', { class: 'attack-row' },
      h('div', { class: 'attack-rank' }, `#${ap.rank}`),
      h('div', { class: 'attack-body' },
        h('div', { class: 'attack-name' }, ap.niche_name),
        h('div', { class: 'attack-tam' }, `TAM A$${(ap.tam_estimate_sgd / 1e6).toFixed(1)}M`),
        h('div', { class: 'attack-grid' },
          attackCell('Target', ap.icp),
          attackCell('Wedge', ap.why_we_win),
          attackCell('Proof', ap.why_gap),
          attackCell('Channel & horizon', `${ap.gtm?.channel || '—'} · pitch: ${ap.gtm?.pitch || '—'}`)
        )
      )
    ))),
    footer(ctx.pageIndex.white + offset, ctx.total, data)
  );
  root.append(p3);
  offset++;

  // 7d+ — Cell detail appendix (every green 0-1 + every red 4+)
  const decisionCells = [];
  for (const seg of segments) for (const need of needs) {
    const cell = cells[`${seg.id}:${need.id}`];
    if (!cell) continue;
    const count = (cell.competitors || []).filter(x => (x.score ?? 0) >= 3).length;
    if (count <= 1 || count >= 4) {
      decisionCells.push({ seg, need, cell, count, band: count <= 1 ? 'green' : 'red' });
    }
  }

  // Sort: green first (attack), then red (avoid)
  decisionCells.sort((a, b) => {
    if (a.band !== b.band) return a.band === 'green' ? -1 : 1;
    return b.count - a.count;
  });

  for (let i = 0; i < decisionCells.length; i += CELL_DETAIL_PER_PAGE) {
    const chunk = decisionCells.slice(i, i + CELL_DETAIL_PER_PAGE);
    const pp = page();
    mount(pp,
      h('h3', { class: 'mb-h' }, i === 0 ? 'Cell detail — whitespace (attack) & crowded (avoid)' : 'Cell detail (cont.)'),
      h('div', { class: 'cell-list' }, chunk.map(({ seg, need, cell, count, band }) =>
        h('div', { class: `cell-card cell-${band}` },
          h('div', { class: 'cell-head' },
            h('span', { class: 'cell-band-pill' }, band === 'green' ? 'WHITESPACE · ATTACK' : 'CROWDED · AVOID'),
            h('span', { class: 'cell-meta' }, `count ${count} · our score ${cell.our_score ?? 0}`)
          ),
          h('div', { class: 'cell-pair' }, `${seg.name} × ${need.name}`),
          (cell.competitors || []).length
            ? h('ul', { class: 'cell-competitors' }, [...(cell.competitors || [])].sort((a, b) => b.score - a.score).map(c =>
                h('li', {},
                  h('span', { class: 'cc-name' }, c.name),
                  h('span', { class: 'cc-score' }, ` (${c.score}) `),
                  h('span', { class: 'cc-spec' }, c.specialisation_for_cell || '')
                )
              ))
            : h('p', { class: 'cell-empty' }, 'No competitor scores ≥ 3 here — true whitespace.')
        )
      )),
      footer(ctx.pageIndex.white + offset, ctx.total, data)
    );
    root.append(pp);
    offset++;
  }
}

function attackCell(label, body) {
  return h('div', { class: 'attack-cell' },
    h('div', { class: 'attack-cell-label' }, label),
    h('div', { class: 'attack-cell-body' }, truncate(body || '—', 280))
  );
}

// ──────────────────────────────────────────────────────────────────────
// 8. Website Design Audit Highlights
// ──────────────────────────────────────────────────────────────────────

function renderDesign(root, data, ctx) {
  const audited = data.competitors.competitors
    .filter(c => typeof c.website_design_rating === 'number')
    .sort((a, b) => b.website_design_rating - a.website_design_rating);
  const top3 = audited.slice(0, 3);
  const bot3 = audited.slice(-3).reverse();

  const p1 = page();
  mount(p1,
    sectionHead('§6', 'Website Design Audit Highlights'),
    opening(designOpening(data)),

    h('h3', { class: 'mb-h' }, 'Top of ranking'),
    h('div', { class: 'audit-list' }, top3.map(c => auditCard(c, 'top'))),

    h('h3', { class: 'mb-h' }, 'Bottom of ranking'),
    h('div', { class: 'audit-list' }, bot3.map(c => auditCard(c, 'bot'))),

    footer(ctx.pageIndex.design, ctx.total, data)
  );
  root.append(p1);

  // Page B — "What to steal" / "What to reject"
  const steals = audited
    .map(c => ({ name: c.name, val: c.website_design_notes?.lumana_should_steal }))
    .filter(x => x.val);
  const rejects = audited
    .map(c => ({ name: c.name, val: c.website_design_notes?.lumana_should_reject }))
    .filter(x => x.val);

  const p2 = page();
  mount(p2,
    h('h3', { class: 'mb-h' }, 'What to steal'),
    h('ul', { class: 'steal-list' }, steals.map(s =>
      h('li', { class: 'steal-row steal-yes' },
        h('span', { class: 'steal-from' }, `from ${s.name}`),
        h('span', { class: 'steal-text' }, truncate(s.val, 280))
      )
    )),

    h('h3', { class: 'mb-h' }, 'What to reject'),
    h('ul', { class: 'steal-list' }, rejects.map(s =>
      h('li', { class: 'steal-row steal-no' },
        h('span', { class: 'steal-from' }, `from ${s.name}`),
        h('span', { class: 'steal-text' }, truncate(s.val, 280))
      )
    )),
    footer(ctx.pageIndex.design + 1, ctx.total, data)
  );
  root.append(p2);
}

function auditCard(c, where) {
  const r = c.website_design_rating;
  const cls = r >= 7 ? 'good' : r >= 5 ? 'ok' : 'low';
  const notes = c.website_design_notes || {};
  return h('div', { class: `audit-card-pdf audit-${cls}` },
    h('div', { class: 'audit-head' },
      h('span', { class: 'audit-name' }, c.name),
      h('span', { class: `audit-rating audit-rating-${cls}` }, `${r.toFixed(1)} / 10`)
    ),
    h('div', { class: 'audit-sub' },
      subscore('Modern', notes.modernness),
      subscore('Attract', notes.attractiveness),
      subscore('Coherent', notes.coherence),
      subscore('UI clarity', notes.ui_clarity),
      subscore('A11y', notes.accessibility),
    ),
    h('p', { class: 'audit-verdict' }, truncate(notes.verdict || '', 320))
  );
}

function subscore(label, val) {
  return h('div', { class: 'audit-ss' },
    h('div', { class: 'audit-ss-lbl' }, label),
    h('div', { class: 'audit-ss-val' }, val ?? '—')
  );
}

// ──────────────────────────────────────────────────────────────────────
// 9. Appendix — full competitor index, sources, methodology
// ──────────────────────────────────────────────────────────────────────

function renderAppendix(root, data, ctx) {
  const comps = [...data.competitors.competitors].sort((a, b) => (b.threat_level || 0) - (a.threat_level || 0));
  const totalPages = Math.ceil(comps.length / APPENDIX_PER_PAGE);

  // Pages: full competitor index
  for (let i = 0; i < comps.length; i += APPENDIX_PER_PAGE) {
    const chunk = comps.slice(i, i + APPENDIX_PER_PAGE);
    const pageIdx = i / APPENDIX_PER_PAGE;
    const el = page();
    mount(el,
      pageIdx === 0
        ? sectionHead('§7', 'Appendix — Competitor Index')
        : h('h3', { class: 'mb-h' }, `Appendix — Competitor Index (${pageIdx + 1}/${totalPages})`),
      h('table', { class: 'data-table data-table-tight' },
        h('thead', {}, h('tr', {}, ...['#', 'Name', 'Category', 'HQ', 'A$/bed/mo', 'Threat', 'Beat'].map(t => h('th', {}, t)))),
        h('tbody', {}, chunk.map((c, j) =>
          h('tr', {},
            h('td', {}, String(i + j + 1)),
            h('td', {}, c.name),
            h('td', {}, prettyCat(c.category)),
            h('td', {}, c.hq),
            h('td', {}, c.sg_monthly_sgd ?? '—'),
            h('td', {}, threatPill(c.threat_level)),
            h('td', {}, String(c.beatability ?? '—'))
          )
        ))
      ),
      footer(ctx.pageIndex.appendix + pageIdx, ctx.total, data)
    );
    root.append(el);
  }

  // Sources page
  const sources = collectSources(data);
  const sourcesPage = page();
  mount(sourcesPage,
    h('h3', { class: 'mb-h' }, 'Source citations — master list'),
    h('p', { class: 'src-intro' }, `Primary sources cited across the four upstream data files (${sources.length} unique URLs and notes).`),
    h('ul', { class: 'src-list' }, sources.map(s =>
      h('li', { class: 'src-row' },
        h('span', { class: 'src-label' }, s.label),
        s.url
          ? h('span', { class: 'src-url' }, s.url)
          : h('span', { class: 'src-note' }, s.note || '')
      )
    )),
    footer(ctx.pageIndex.appendix + totalPages, ctx.total, data)
  );
  root.append(sourcesPage);

  // Methodology page
  const methodPage = page();
  mount(methodPage,
    h('h3', { class: 'mb-h' }, 'Methodology note'),
    h('p', { class: 'meth-prose' },
      'This report is the compiled output of a six-agent competitive-intelligence workflow. ',
      'Each agent owns a slice of structured data (JSON) under ',
      h('code', {}, '/template/data/'), '; this PDF re-renders that data deterministically into a single deliverable.'
    ),
    h('table', { class: 'data-table' },
      h('thead', {}, h('tr', {}, ...['Agent', 'Role', 'Owned data file'].map(t => h('th', {}, t)))),
      h('tbody', {},
        methRow('1', 'Competitor research', 'competitors.json'),
        methRow('2', 'Market intelligence (AU/HK/SG)', 'market-intelligence.json'),
        methRow('3', 'Pricing strategy & personas', 'pricing-strategy.json'),
        methRow('4', 'Whitespace & blue-ocean', 'whitespace-framework.json'),
        methRow('5', 'Website design audit', 'inlined on top-10 competitors'),
        methRow('6', 'Data-visualisation engineer', 'chart configs in /assets/js/viz/'),
        methRow('8', 'Report generator (this document)', 'admin/report.html'),
      )
    ),
    h('h3', { class: 'mb-h' }, 'Conventions'),
    h('ul', { class: 'meth-list' },
      h('li', {}, 'All currencies preserved as authored — primary currency is AUD; the schema field ', h('code', {}, '*_sgd'), ' is preserved for template compatibility.'),
      h('li', {}, 'Whitespace heatmap colour bands derive from competitor count at score ≥ 3 (green 0–1, amber 2–3, red 4+).'),
      h('li', {}, 'Top-5 threats are competitor-curated, not formulaic; rationale captured in ', h('code', {}, 'competitors.top_five[].rationale'), '.'),
      h('li', {}, 'PDF is image-based (rasterised via html2canvas + jsPDF). Text is not selectable; this is acceptable for a scan-then-act competitive deliverable.'),
    ),
    h('p', { class: 'meth-foot' },
      h('strong', {}, 'Re-generation: '),
      'Open ', h('code', {}, 'admin/report.html'), ' in any browser and click Generate PDF. No server, no build step. Lumana brand tokens are read live from ',
      h('code', {}, 'competitors.json → meta.brand_tokens'), ' so a future re-skin reflows both the site and this document.'
    ),
    footer(ctx.pageIndex.appendix + totalPages + 1, ctx.total, data)
  );
  root.append(methodPage);
}

function methRow(num, role, file) {
  return h('tr', {},
    h('td', {}, `Agent ${num}`),
    h('td', {}, role),
    h('td', {}, h('code', {}, file))
  );
}

// ──────────────────────────────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────────────────────────────

function truncate(s, n) {
  s = String(s || '');
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + '…';
}
