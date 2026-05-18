// page-templates.js — full-bleed compiled report for Elitez Events.
// All DOM built via h() — no innerHTML / template-string injection.
// One narrative, six sections + executive summary, footer with client contacts.
import { h, mount } from '../dom.js';
import { computePageIndex } from './toc.js';

// ── Section registry ──────────────────────────────────────────────
export function buildSections(data) {
  return [
    { id: 'cover',    title: 'Cover',                   render: renderCover,      countPages: () => 1 },
    { id: 'toc',      title: 'Table of Contents',       render: renderTOC,        countPages: () => 1 },
    { id: 'exec',     title: 'Executive Summary',       render: renderExec,       countPages: () => 1 },
    { id: 'land',     title: 'Competitive Landscape',   render: renderLandscape,  countPages: () => 2 },
    { id: 'mkt',      title: 'Market Intelligence',     render: renderMarket,     countPages: () => 2 },
    { id: 'price',    title: 'Pricing Strategy',        render: renderPricing,    countPages: () => 2 },
    { id: 'white',    title: 'Whitespace Atlas',        render: renderWhitespace, countPages: (d) => 3 + countCellAppendixPages(d) },
    { id: 'des',      title: 'Website Design Audit',    render: renderDesign,     countPages: () => 1 },
    { id: 'app',      title: 'Appendix: Competitor Table', render: renderAppendix, countPages: (d) => Math.ceil(d.competitors.competitors.length / 18) },
    { id: 'closing',  title: 'Roadmap & Contact',       render: renderClosing,    countPages: () => 1 },
  ];
}

function countCellAppendixPages(d) {
  const cells = Object.values(d.whitespace.heatmap.cells);
  const decisionCount = cells.filter(c => {
    const count = (c.competitors || []).filter(x => (x.score ?? 0) >= 3).length;
    return count <= 1 || count >= 4;
  }).length;
  return Math.max(1, Math.ceil(decisionCount / 6));
}

export function renderPages(root, sections, data) {
  const idx = computePageIndex(sections, data);
  const ctx = { pageIndex: idx, total: idx._total };
  mount(root);
  for (const s of sections) s.render(root, data, ctx);
}

// ── Helpers ──────────────────────────────────────────────────────
function page(cls = 'pdf-content') {
  return h('div', { class: `pdf-page ${cls}` });
}

function eyebrow(label) {
  return h('span', { class: 'rep-eyebrow' }, label);
}

function footer(pageNum, total, data) {
  return h('div', { class: 'pdf-footer' },
    h('span', { class: 'foot-brand' }, 'ELITEZ EVENTS'),
    h('span', { class: 'foot-mid' }, `Competitive Intelligence · page ${pageNum} of ${total}`),
    h('span', { class: 'foot-date' }, data.competitors.meta.research_date)
  );
}

const fmtSGD_M = (n) => `S$${(n / 1_000_000).toFixed(0)}M`;
const fmtSGD_B = (n) => `S$${(n / 1_000_000_000).toFixed(1)}B`;

// Pull the most useful chunk of an NBA description: try to grab a "floor" line
// if present, otherwise truncate cleanly at the next sentence boundary past 100 chars.
function shortenNBA(s) {
  if (!s) return '';
  // Grab the "NBA floor:" segment if it exists — usually the punchiest summary
  const floorMatch = s.match(/NBA floor:[^.]+\./i);
  if (floorMatch) return floorMatch[0];
  // Otherwise truncate to first ~180 chars at a sentence boundary
  if (s.length <= 200) return s;
  const truncated = s.slice(0, 200);
  const lastPeriod = truncated.lastIndexOf('.');
  return (lastPeriod > 60 ? truncated.slice(0, lastPeriod + 1) : truncated) + '…';
}

// ── 1. Cover ─────────────────────────────────────────────────────
function renderCover(root, data) {
  const el = page('pdf-cover');
  mount(el,
    h('div', { class: 'cover-frame' },
      h('div', { class: 'cover-mark' }, 'EE'),
      h('div', { class: 'cover-eyebrow' }, 'COMPETITIVE INTELLIGENCE  ·  V1.0'),
      h('h1', { class: 'cover-title' }, 'The SG Corporate Events Atlas'),
      h('p', { class: 'cover-sub' }, '35 competitors. 4 personas. 4 attack plans. One narrative.'),
      h('div', { class: 'cover-meta' },
        h('div', {}, h('span', { class: 'k' }, 'Prepared'), h('span', { class: 'v' }, data.competitors.meta.research_date)),
        h('div', {}, h('span', { class: 'k' }, 'Prepared by'), h('span', { class: 'v' }, 'Elitez Events Strategy')),
        h('div', {}, h('span', { class: 'k' }, 'Coverage'), h('span', { class: 'v' }, 'SG corporate events · SAM S$360M'))
      ),
      h('div', { class: 'cover-foot' },
        h('span', {}, 'Elitez Group · Singapore · 2 Kallang Avenue, CT Hub'),
        h('span', {}, 'Sam Neo +65 9727 1292  ·  Eevann Seah +65 8180 0994')
      )
    )
  );
  root.append(el);
}

// ── 2. Table of contents ─────────────────────────────────────────
function renderTOC(root, data, ctx) {
  const el = page('pdf-toc');
  const entries = [
    ['Executive Summary',         ctx.pageIndex.exec],
    ['Competitive Landscape',     ctx.pageIndex.land],
    ['Market Intelligence',       ctx.pageIndex.mkt],
    ['Pricing Strategy',          ctx.pageIndex.price],
    ['Whitespace Atlas',          ctx.pageIndex.white],
    ['Website Design Audit',      ctx.pageIndex.des],
    ['Appendix · Competitor Table', ctx.pageIndex.app],
    ['Roadmap & Contact',         ctx.pageIndex.closing],
  ];
  mount(el,
    h('div', { class: 'toc-frame' },
      eyebrow('NAVIGATION'),
      h('h2', { class: 'toc-title' }, 'Contents'),
      h('p', { class: 'toc-blurb' }, 'A 10-minute read for the busy executive. Each section flows into the next: the landscape proves the wedge, the wedge proves the pricing, the pricing proves the attack.'),
      h('ol', { class: 'toc-list' }, entries.map(([title, p], i) =>
        h('li', {},
          h('span', { class: 'toc-num' }, String(i + 1).padStart(2, '0')),
          h('span', { class: 'toc-name' }, title),
          h('span', { class: 'toc-dots' }),
          h('span', { class: 'toc-page' }, String(p))
        )
      ))
    ),
    footer(ctx.pageIndex.toc, ctx.total, data)
  );
  root.append(el);
}

// ── 3. Executive Summary ─────────────────────────────────────────
function renderExec(root, data, ctx) {
  const c = data.competitors;
  const m = data.market;
  const p = data.pricing;
  const w = data.whitespace;
  const sea = c.competitors.filter(x => x.hq_region === 'SEA').length;
  const seaPct = Math.round(100 * sea / c.competitors.length);
  const tiers = p.recommended_tiers;
  const personas = p.personas.map(x => x.name).join(' · ');

  const el = page('pdf-content pdf-exec');
  mount(el,
    h('div', { class: 'exec-hero' },
      eyebrow('EXECUTIVE SUMMARY'),
      h('h2', {}, 'The wedge: opacity arbitrage, bundled manpower, ESG timing.'),
      h('p', { class: 'exec-thesis' },
        '71% of the SG corporate-events agency segment hides pricing. Zero competitors match Elitez Group’s in-house manpower depth. ESG attestation flips from differentiator to procurement gate by 2027-Q2. Elitez owns the convergence — and the next 12 months are the action window.'
      )
    ),
    h('div', { class: 'exec-grid' },
      h('div', { class: 'exec-card cat' },
        h('span', { class: 'card-tag' }, '01 · The category'),
        h('h3', {}, 'SG corporate events'),
        h('p', {},
          `TAM ${fmtSGD_B(m.market_size.tam_sgd)} · SAM ${fmtSGD_M(m.market_size.sam_sgd)} · SOM ${fmtSGD_M(m.market_size.som_sgd)} (3-yr cumulative).`,
          h('br', {}),
          `${c.competitors.length} competitors mapped. ${seaPct}% SEA-headquartered. 71% pricing-opaque (25 of 35 hide rate cards).`
        )
      ),
      h('div', { class: 'exec-card wedge' },
        h('span', { class: 'card-tag' }, '02 · The wedge'),
        h('h3', {}, 'Three structural moats'),
        h('ul', {},
          h('li', {}, h('strong', {}, 'Opacity arbitrage: '), 'self-serve calculator beats 25 “contact-us” competitors on procurement runway.'),
          h('li', {}, h('strong', {}, 'Bundled manpower: '), 'Elitez Group HR + staffing + security under one P&L — no competitor matches.'),
          h('li', {}, h('strong', {}, 'ESG timing: '), 'ISO 20121 by 2027-Q1 neutralises Visionnaire’s lone moat before procurement gate flips.')
        )
      ),
      h('div', { class: 'exec-card pers' },
        h('span', { class: 'card-tag' }, '03 · Personas × tiers'),
        h('h3', {}, 'Four buyers, four price points'),
        h('p', { class: 'exec-personas' }, personas),
        h('div', { class: 'tier-strip' },
          tiers.map(t =>
            h('div', { class: 'tier-pill' },
              h('span', { class: 'tier-name' }, t.name),
              h('span', { class: 'tier-price' }, `S$${(t.price_sgd / 1000).toFixed(0)}k`)
            )
          )
        )
      ),
      h('div', { class: 'exec-card attack' },
        h('span', { class: 'card-tag' }, '04 · Attack plans'),
        h('h3', {}, 'Four niches, ranked'),
        h('ol', {},
          w.attack_plans.map(ap =>
            h('li', {}, h('strong', {}, `#${ap.rank} `), ap.niche_name, ' — ', h('em', {}, `TAM ${fmtSGD_M(ap.tam_estimate_sgd)}`))
          )
        )
      ),
      h('div', { class: 'exec-card road' },
        h('span', { class: 'card-tag' }, '05 · 12-month roadmap'),
        h('h3', {}, 'Three timed wedges'),
        h('ul', { class: 'road-list' },
          h('li', {}, h('strong', { class: 'q' }, 'Q3 2026'), ' Public pricing calculator + PSG pre-approval'),
          h('li', {}, h('strong', { class: 'q' }, 'Q4 2026'), ' AI photobooth + RSVP triage + sentiment dashboard'),
          h('li', {}, h('strong', { class: 'q' }, 'Q2 2027'), ' ISO 20121 certification live')
        )
      )
    ),
    footer(ctx.pageIndex.exec, ctx.total, data)
  );
  root.append(el);
}

// ── 4. Competitive Landscape ─────────────────────────────────────
function renderLandscape(root, data, ctx) {
  const c = data.competitors;
  const top5 = c.top_five;
  const findById = (id) => c.competitors.find(x => x.id === id);

  // Page 1 — Top 5 cards + opening
  const p1 = page('pdf-content');
  mount(p1,
    eyebrow('SECTION 01'),
    h('h2', { class: 'sec-title' }, 'Competitive Landscape'),
    h('p', { class: 'sec-opening' },
      `Across ${c.competitors.length} tracked competitors (`,
      h('strong', {}, `${Math.round(100 * c.competitors.filter(x => x.hq_region === 'SEA').length / c.competitors.length)}% SEA-weighted`),
      `), Pico anchors the threat list at rank 1 with HKEX listing weight — but the next four threats are split between local specialists and the silent default of “no agency at all.” The field is crowded but winnable, because the real enemy is opacity, not Pico.`
    ),
    h('h3', { class: 'sub' }, 'Top 5 threats'),
    h('div', { class: 'top5-grid' },
      top5.map(t => {
        const comp = findById(t.competitor_id) || { name: t.competitor_id, hq: '', sg_monthly_sgd: null };
        return h('div', { class: 'top5-tile' },
          h('div', { class: 'top5-rank' }, `#${t.rank}`),
          h('div', { class: 'top5-body' },
            h('h4', {}, comp.name),
            h('p', { class: 'top5-meta' }, comp.hq || ''),
            h('p', { class: 'top5-rationale' }, t.rationale)
          )
        );
      })
    ),
    footer(ctx.pageIndex.land, ctx.total, data)
  );
  root.append(p1);

  // Page 2 — Top 10 table + design pattern observations
  const top10 = [...c.competitors].sort((a, b) => (b.threat_level - a.threat_level) || (a.beatability - b.beatability)).slice(0, 10);
  const p2 = page('pdf-content');
  mount(p2,
    h('h3', { class: 'sub' }, 'Top 10 by threat × beatability'),
    h('table', { class: 'pdf-table' },
      h('thead', {}, h('tr', {}, ...['#','Competitor','HQ','Threat','Beat','Pricing'].map(t => h('th', {}, t)))),
      h('tbody', {}, top10.map((c, i) =>
        h('tr', {},
          h('td', { class: 'rank' }, String(i + 1)),
          h('td', {}, h('strong', {}, c.name)),
          h('td', {}, c.hq),
          h('td', {}, h('span', { class: `pill thr-${c.threat_level}` }, String(c.threat_level))),
          h('td', {}, h('span', { class: 'pill' }, String(c.beatability))),
          h('td', { class: 'mono small' }, c.pricing_flag || '—')
        )
      ))
    ),
    h('h3', { class: 'sub mt' }, 'Three design patterns surfaced'),
    h('div', { class: 'pat-grid' },
      h('div', { class: 'pat-card' },
        h('div', { class: 'pat-num' }, '01'),
        h('h4', {}, 'Logo-wall first, pricing last'),
        h('p', {}, 'Get Out! Events leads with 30+ blue-chip logos and a 4.9-star pill above the fold. The pattern works because the buyer’s anxiety is “will they show up?” — social proof beats feature lists in this category.')
      ),
      h('div', { class: 'pat-card' },
        h('div', { class: 'pat-num' }, '02'),
        h('h4', {}, 'Calculator-as-magnet'),
        h('p', {}, 'Get Out’s budget calculator and PartyMojo’s per-station list price are the only two sites that let a buyer self-qualify in 60 seconds. Every other site routes through a contact form. This is the opacity wedge.')
      ),
      h('div', { class: 'pat-card' },
        h('div', { class: 'pat-num' }, '03'),
        h('h4', {}, 'Scope hidden behind “Contact us”'),
        h('p', {}, '15 of the 15 audited sites scored 12–23 of 25 — a low ceiling. None expose tier scope or what-in / what-out. The category’s design floor is so low that above-average is itself a wedge.')
      )
    ),
    footer(ctx.pageIndex.land + 1, ctx.total, data)
  );
  root.append(p2);
}

// ── 5. Market Intelligence ───────────────────────────────────────
function renderMarket(root, data, ctx) {
  const m = data.market;

  const p1 = page('pdf-content');
  mount(p1,
    eyebrow('SECTION 02'),
    h('h2', { class: 'sec-title' }, 'Market Intelligence'),
    h('p', { class: 'sec-opening' },
      `SG TAM of ${fmtSGD_B(m.market_size.tam_sgd)} narrows to a SAM of ${fmtSGD_M(m.market_size.sam_sgd)} — the 100–1,500 PAX agency-served band where Elitez plays. SOM ${fmtSGD_M(m.market_size.som_sgd)} cumulative over 3 years is gated less by buyer intent than by go-to-market mechanics: opacity, manpower inflation, ESG timing. Policy is the bottleneck, not demand.`
    ),
    h('div', { class: 'mkt-rings' },
      h('div', { class: 'ring-card ring-tam' },
        h('div', { class: 'ring-tag' }, 'TAM'),
        h('div', { class: 'ring-val' }, fmtSGD_B(m.market_size.tam_sgd)),
        h('div', { class: 'ring-note' }, '~22,000 SG employers running annual D&D / family day / activations.')
      ),
      h('div', { class: 'ring-card ring-sam' },
        h('div', { class: 'ring-tag' }, 'SAM'),
        h('div', { class: 'ring-val' }, fmtSGD_M(m.market_size.sam_sgd)),
        h('div', { class: 'ring-note' }, 'Elitez 100–1,500 PAX serviceable band. Excludes DIY tiny + MNC enterprise.')
      ),
      h('div', { class: 'ring-card ring-som' },
        h('div', { class: 'ring-tag' }, 'SOM'),
        h('div', { class: 'ring-val' }, fmtSGD_M(m.market_size.som_sgd)),
        h('div', { class: 'ring-note' }, '3-yr cumulative GMV ceiling — 4 BD heads × 8 events/yr × S$80k avg.')
      )
    ),
    h('h3', { class: 'sub mt' }, 'Three timed wedges'),
    h('div', { class: 'wedge-strip' },
      h('div', { class: 'wedge-card' },
        h('div', { class: 'wedge-when' }, 'Q3 2026'),
        h('h4', {}, 'Published-pricing calculator'),
        h('p', {}, '50–60% of mid-market briefs will demand a budget-band quote in 24 hours by 2026-Q4. Self-serve calculator is the dominant inbound mechanism against the 25 “contact us” competitors.')
      ),
      h('div', { class: 'wedge-card' },
        h('div', { class: 'wedge-when' }, 'Q4 2026'),
        h('h4', {}, 'GenAI event features'),
        h('p', {}, 'AI photobooth + RSVP triage + sentiment dashboard ship before IMDA’s expected GenAI SME grant lands in 2027-Q1. First on the pre-approved list captures inbound for free.')
      ),
      h('div', { class: 'wedge-card' },
        h('div', { class: 'wedge-when' }, 'Q2 2027'),
        h('h4', {}, 'ISO 20121 certification'),
        h('p', {}, 'Procurement scoresheets at GLCs, healthcare, listed corporates flip ESG attestation from differentiator to pass/fail. Visionnaire’s lone moat closes; mid-market gala spend opens.')
      )
    ),
    footer(ctx.pageIndex.mkt, ctx.total, data)
  );
  root.append(p1);

  // Page 2 — Policy + cultural signals + country readiness
  const p2 = page('pdf-content');
  mount(p2,
    h('h3', { class: 'sub' }, 'Policy & regulatory map'),
    h('div', { class: 'policy-grid' },
      m.policies.slice(0, 6).map(po =>
        h('div', { class: `policy-row pol-${po.sentiment}` },
          h('div', { class: 'pol-head' },
            h('span', { class: `pol-badge pol-${po.sentiment}` }, po.sentiment.toUpperCase()),
            h('h4', {}, po.title)
          ),
          h('p', { class: 'pol-imp' }, po.implication_for_us)
        )
      )
    ),
    h('h3', { class: 'sub mt' }, 'Cultural signals — demand-side'),
    h('ul', { class: 'signal-list' },
      m.cultural_signals.slice(0, 4).map(s =>
        h('li', {},
          h('strong', {}, s.observation),
          h('span', { class: 'sig-imp' }, ' — ', s.implication_for_us)
        )
      )
    ),
    h('h3', { class: 'sub mt' }, 'SEA country readiness (1–5 scale)'),
    h('table', { class: 'pdf-table compact' },
      h('thead', {}, h('tr', {}, ...['Country','Regulatory','Tech','Price tolerance'].map(t => h('th', {}, t)))),
      h('tbody', {}, m.adoption_patterns.country_readiness.map(r =>
        h('tr', {},
          h('td', {}, h('strong', {}, r.country)),
          h('td', {}, h('span', { class: 'pill score' }, String(r.regulatory))),
          h('td', {}, h('span', { class: 'pill score' }, String(r.tech_maturity))),
          h('td', {}, h('span', { class: 'pill score' }, String(r.price_tolerance)))
        )
      ))
    ),
    footer(ctx.pageIndex.mkt + 1, ctx.total, data)
  );
  root.append(p2);
}

// ── 6. Pricing Strategy ──────────────────────────────────────────
function renderPricing(root, data, ctx) {
  const p = data.pricing;
  const prices = data.competitors.competitors.filter(c => c.sg_monthly_sgd != null).map(c => c.sg_monthly_sgd);
  const minP = prices.length ? Math.min(...prices) : 0;
  const maxP = prices.length ? Math.max(...prices) : 0;
  const maxWTP = Math.max(...p.personas.map(x => x.wtp_band_sgd.upper_stretch));

  const p1 = page('pdf-content');
  mount(p1,
    eyebrow('SECTION 03'),
    h('h2', { class: 'sec-title' }, 'Pricing Strategy'),
    h('p', { class: 'sec-opening' },
      `Against persona willingness-to-pay topping out at S$${maxWTP.toLocaleString()} per engagement, the pricing thesis flows directly from the whitespace finding that 71% of agencies hide their rate card. Pricing here is a perception question, not a dollar comparison — the competitor who publishes wins the 60-second self-qualifier.`
    ),
    h('h3', { class: 'sub' }, 'Four personas × four tiers'),
    h('div', { class: 'persona-grid' },
      p.personas.map((x, i) =>
        h('div', { class: 'persona-card' },
          h('div', { class: 'persona-head' },
            h('span', { class: 'persona-num' }, String(i + 1).padStart(2, '0')),
            h('h4', {}, x.name)
          ),
          h('p', { class: 'persona-icp' }, x.icp.length > 220 ? x.icp.slice(0, 217) + '…' : x.icp),
          h('div', { class: 'persona-wtp' },
            h('span', { class: 'wtp-low' }, `S$${(x.wtp_band_sgd.low_anchor / 1000).toFixed(0)}k`),
            h('span', { class: 'wtp-arrow' }, '→'),
            h('span', { class: 'wtp-mid' }, `S$${(x.wtp_band_sgd.expected / 1000).toFixed(0)}k`),
            h('span', { class: 'wtp-arrow' }, '→'),
            h('span', { class: 'wtp-high' }, `S$${(x.wtp_band_sgd.upper_stretch / 1000).toFixed(0)}k`)
          ),
          h('div', { class: 'persona-nba' },
            h('span', { class: 'nba-label' }, 'NBA'),
            h('span', {}, shortenNBA(x.nba))
          )
        )
      )
    ),
    footer(ctx.pageIndex.price, ctx.total, data)
  );
  root.append(p1);

  // Page 2 — Tiers + elasticity
  const p2 = page('pdf-content');
  mount(p2,
    h('h3', { class: 'sub' }, 'Recommended tier ladder'),
    h('div', { class: 'tier-ladder' },
      p.recommended_tiers.map((t, i) =>
        h('div', { class: `tier-rung tier-${i}` },
          h('div', { class: 'tier-rung-head' },
            h('span', { class: 'tier-rung-name' }, t.name),
            h('span', { class: 'tier-rung-price' }, `S$${(t.price_sgd / 1000).toFixed(0)}k`),
            h('span', { class: 'tier-rung-after' }, t.effective_price_after_psg < t.price_sgd ? `→ S$${(t.effective_price_after_psg / 1000).toFixed(0)}k after grants` : 'Retainer')
          ),
          h('p', { class: 'tier-rung-target' }, h('strong', {}, t.target_persona), ' · ', t.psychological_anchor),
          h('ul', { class: 'tier-rung-in' },
            (t.what_in || []).slice(0, 4).map(line => h('li', {}, line))
          )
        )
      )
    ),
    h('h3', { class: 'sub mt' }, 'Price elasticity by persona'),
    h('table', { class: 'pdf-table compact' },
      h('thead', {}, h('tr', {}, ...['Persona','Band','Why'].map(t => h('th', {}, t)))),
      h('tbody', {}, p.elasticity_heuristics.map(eh =>
        h('tr', {},
          h('td', {}, h('strong', {}, eh.segment)),
          h('td', {}, h('span', { class: `pill elast-${eh.elasticity_band}` }, eh.elasticity_band.toUpperCase())),
          h('td', { class: 'small' }, (eh.evidence.split('.')[0] || eh.evidence).slice(0, 240) + '.')
        )
      ))
    ),
    footer(ctx.pageIndex.price + 1, ctx.total, data)
  );
  root.append(p2);
}

// ── 7. Whitespace Atlas ──────────────────────────────────────────
function renderWhitespace(root, data, ctx) {
  const w = data.whitespace;
  let offset = 0;

  // 7a — Full-bleed orange thesis page
  const p1 = page('pdf-fullbleed');
  mount(p1,
    h('div', { class: 'ws-thesis-frame' },
      h('span', { class: 'rep-eyebrow on-orange' }, 'SECTION 04 · WHITESPACE THESIS'),
      h('h2', { class: 'ws-thesis-title' }, 'The bundled-manpower column is the structural blue ocean.'),
      h('p', { class: 'ws-thesis-body' }, w.strategy_canvas.headline_thesis),
      h('div', { class: 'ws-thesis-stats' },
        h('div', {},
          h('div', { class: 'big' }, '5/5'),
          h('div', { class: 'lbl' }, 'Elitez ecosystem manpower depth')
        ),
        h('div', {},
          h('div', { class: 'big' }, '0'),
          h('div', { class: 'lbl' }, 'Competitors matching that score')
        ),
        h('div', {},
          h('div', { class: 'big' }, '4'),
          h('div', { class: 'lbl' }, 'Vacuum cells in heatmap')
        )
      ),
      h('div', { class: 'ws-thesis-rule' })
    ),
    footer(ctx.pageIndex.white + offset, ctx.total, data)
  );
  root.append(p1);
  offset++;

  // 7b — Strategy canvas (6-axis radar-style bar) + attack plans
  const p2 = page('pdf-content');
  const dims = w.strategy_canvas.dimensions;
  const us = w.strategy_canvas.scores.us;
  // Pick top 3 named competitors for canvas comparison
  const compIds = ['pico_singapore', 'get_out_events', 'visionnaire_pte'];
  const compLabels = ['Pico', 'Get Out!', 'Visionnaire'];
  mount(p2,
    h('h3', { class: 'sub' }, '8-axis strategy canvas'),
    h('p', { class: 'sub-blurb' }, 'Elitez (orange) plotted against three reference competitors. Where the orange line jumps clear of the others is where the wedge lives.'),
    h('div', { class: 'canvas-wrap' },
      h('div', { class: 'canvas-legend' },
        h('span', { class: 'leg us' }, 'Elitez'),
        ...compLabels.map((label, i) => h('span', { class: `leg c${i}` }, label))
      ),
      h('div', { class: 'canvas-grid' },
        dims.map(d => {
          const ourS = us[d.key] ?? 0;
          const compScores = compIds.map(id => (w.strategy_canvas.scores[id] || {})[d.key] ?? 0);
          return h('div', { class: 'canvas-row' },
            h('div', { class: 'canvas-axis' }, d.label),
            h('div', { class: 'canvas-bars' },
              h('div', { class: 'cbar bar-us', style: { width: `${ourS * 18}%` } }, h('span', {}, String(ourS))),
              ...compScores.map((s, i) =>
                h('div', { class: `cbar bar-c${i}`, style: { width: `${s * 18}%` } }, h('span', {}, String(s)))
              )
            )
          );
        })
      )
    ),
    h('h3', { class: 'sub mt' }, 'Four attack plans, ranked'),
    h('div', { class: 'attack-grid' },
      w.attack_plans.map(ap =>
        h('div', { class: 'attack-tile' },
          h('div', { class: 'attack-head' },
            h('span', { class: 'attack-rank' }, `#${ap.rank}`),
            h('h4', {}, ap.niche_name)
          ),
          h('p', { class: 'attack-tam' }, h('strong', {}, `TAM ${fmtSGD_M(ap.tam_estimate_sgd)}`), ' · ', ap.icp.slice(0, 140) + '…'),
          h('p', { class: 'attack-pitch' }, h('em', {}, '“'), ap.gtm.pitch, h('em', {}, '”'))
        )
      )
    ),
    footer(ctx.pageIndex.white + offset, ctx.total, data)
  );
  root.append(p2);
  offset++;

  // 7c — Heatmap visualisation
  const p3 = page('pdf-content');
  const segs = w.heatmap.segments;
  const needs = w.heatmap.needs;
  mount(p3,
    h('h3', { class: 'sub' }, 'Segment × need heatmap'),
    h('p', { class: 'sub-blurb' }, 'Each cell counts competitors scoring ≥3 on that segment-need pairing. Green (≤1) = whitespace to attack. Red (≥4) = avoid head-on. The bundled-manpower column reveals the structural blue ocean.'),
    h('div', { class: 'hm-wrap' },
      h('div', { class: 'hm-grid', style: { gridTemplateColumns: `160px repeat(${needs.length}, 1fr)` } },
        h('div', { class: 'hm-corner' }, 'Segment × need'),
        ...needs.map(n => h('div', { class: 'hm-need' }, n.short)),
        ...segs.flatMap(seg => [
          h('div', { class: 'hm-seg' }, seg.name),
          ...needs.map(n => {
            const cell = w.heatmap.cells[`${seg.id}:${n.id}`] || { competitors: [], our_score: 0 };
            const count = (cell.competitors || []).filter(x => (x.score ?? 0) >= 3).length;
            const band = count <= 1 ? 'g' : count <= 3 ? 'a' : 'r';
            return h('div', { class: `hm-cell hm-${band}` },
              h('div', { class: 'hm-count' }, String(count)),
              h('div', { class: 'hm-our' }, `us ${cell.our_score ?? 0}`)
            );
          })
        ])
      ),
      h('div', { class: 'hm-legend' },
        h('span', {}, h('span', { class: 'sw sw-g' }), 'Whitespace (≤1 competitor)'),
        h('span', {}, h('span', { class: 'sw sw-a' }), 'Contested (2–3)'),
        h('span', {}, h('span', { class: 'sw sw-r' }), 'Crowded (≥4)')
      )
    ),
    footer(ctx.pageIndex.white + offset, ctx.total, data)
  );
  root.append(p3);
  offset++;

  // 7d+ — Cell detail appendix (decision-grade only)
  const entries = [];
  for (const seg of segs) for (const need of needs) {
    const cell = w.heatmap.cells[`${seg.id}:${need.id}`];
    if (!cell) continue;
    const count = (cell.competitors || []).filter(x => (x.score ?? 0) >= 3).length;
    if (count <= 1 || count >= 4) {
      entries.push({ seg, need, cell, count, band: count <= 1 ? 'green' : 'red' });
    }
  }
  for (let i = 0; i < entries.length; i += 6) {
    const chunk = entries.slice(i, i + 6);
    const pp = page('pdf-content');
    mount(pp,
      h('h3', { class: 'sub' }, i === 0 ? 'Decision-grade cells — attack & avoid' : 'Decision-grade cells (cont.)'),
      h('div', { class: 'cell-appendix' }, chunk.map(({ seg, need, cell, count, band }) =>
        h('div', { class: `cell-row cell-${band}` },
          h('div', { class: 'cell-row-head' },
            h('span', { class: `cell-verdict cell-verdict-${band}` }, band === 'green' ? 'WHITESPACE · ATTACK' : 'CROWDED · AVOID'),
            h('h4', {}, `${seg.name} × ${need.name}`),
            h('span', { class: 'cell-stats' }, `count ${count} · our score ${cell.our_score ?? 0}`)
          ),
          (cell.competitors || []).length
            ? h('ul', { class: 'cell-comps' }, [...(cell.competitors || [])].sort((a, b) => b.score - a.score).slice(0, 5).map(c =>
                h('li', {}, h('strong', {}, c.name), ` (${c.score}) — `, c.specialisation_for_cell || '')
              ))
            : h('p', { class: 'cell-empty' }, 'No competitor scores ≥3 here. The cell belongs to whoever moves first.')
        )
      )),
      footer(ctx.pageIndex.white + offset, ctx.total, data)
    );
    root.append(pp);
    offset++;
  }
}

// ── 8. Website Design Audit ──────────────────────────────────────
function renderDesign(root, data, ctx) {
  const audited = data.competitors.competitors
    .filter(c => c.website_design_rating != null)
    .sort((a, b) => (b.website_design_rating ?? 0) - (a.website_design_rating ?? 0));
  const median = audited.length ? audited[Math.floor(audited.length / 2)].website_design_rating : 0;

  const el = page('pdf-content');
  mount(el,
    eyebrow('SECTION 05'),
    h('h2', { class: 'sec-title' }, 'Website Design Audit'),
    h('p', { class: 'sec-opening' },
      `Of the ${audited.length} audited sites, median score is ${median}/25 — the category’s design floor is low enough that above-average is itself a wedge. The leaders (Get Out!, Pico) clear 23/25 by combining marquee logos with self-qualifying tools (calculator, pricelist). The bottom half (12–15/25) hide pricing entirely and compete on referrals only.`
    ),
    h('h3', { class: 'sub' }, `${audited.length} audited competitor sites`),
    h('div', { class: 'des-grid' },
      audited.map((c, i) => {
        const r = c.website_design_rating ?? 0;
        const tier = r >= 20 ? 'high' : r >= 16 ? 'mid' : 'low';
        return h('div', { class: `des-tile des-${tier}` },
          h('div', { class: 'des-rank' }, String(i + 1).padStart(2, '0')),
          h('div', { class: 'des-body' },
            h('div', { class: 'des-name' }, c.name),
            h('div', { class: 'des-score' }, `${r}/25`),
            h('p', { class: 'des-notes' }, (c.website_design_notes || '').slice(0, 220))
          )
        );
      })
    ),
    footer(ctx.pageIndex.des, ctx.total, data)
  );
  root.append(el);
}

// ── 9. Appendix ──────────────────────────────────────────────────
function renderAppendix(root, data, ctx) {
  const comps = [...data.competitors.competitors].sort((a, b) => (b.threat_level - a.threat_level));
  const perPage = 18;
  for (let i = 0; i < comps.length; i += perPage) {
    const chunk = comps.slice(i, i + perPage);
    const el = page('pdf-content');
    mount(el,
      i === 0 ? eyebrow('APPENDIX') : null,
      h('h2', { class: 'sec-title' }, i === 0 ? 'Full competitor table' : 'Full competitor table (cont.)'),
      i === 0 ? h('p', { class: 'sec-opening' }, `All ${comps.length} tracked competitors, sorted by threat level. Beat = beatability (how easily Elitez displaces them on a contested deal). HQ shows the parent’s base of operations.`) : null,
      h('table', { class: 'pdf-table compact' },
        h('thead', {}, h('tr', {}, ...['#','Competitor','HQ','Category','Threat','Beat','Pricing'].map(t => h('th', {}, t)))),
        h('tbody', {}, chunk.map((c, j) =>
          h('tr', {},
            h('td', { class: 'rank' }, String(i + j + 1)),
            h('td', {}, h('strong', {}, c.name)),
            h('td', { class: 'small' }, c.hq),
            h('td', { class: 'small' }, c.category),
            h('td', {}, h('span', { class: `pill thr-${c.threat_level}` }, String(c.threat_level))),
            h('td', {}, h('span', { class: 'pill' }, String(c.beatability))),
            h('td', { class: 'mono small' }, c.pricing_flag || '—')
          )
        ))
      ),
      footer(ctx.pageIndex.app + (i / perPage), ctx.total, data)
    );
    root.append(el);
  }
}

// ── 10. Closing — Roadmap & Contact ──────────────────────────────
function renderClosing(root, data, ctx) {
  const el = page('pdf-fullbleed');
  mount(el,
    h('div', { class: 'closing-frame' },
      h('span', { class: 'rep-eyebrow on-orange' }, 'NEXT 12 MONTHS'),
      h('h2', { class: 'closing-title' }, 'The roadmap is the product.'),
      h('p', { class: 'closing-lede' }, 'Three timed wedges, each defensible the moment Elitez ships first. Miss the window and the moat closes — not because competitors copy, but because the procurement gates flip and the laggards lose access entirely.'),
      h('div', { class: 'closing-road' },
        h('div', { class: 'road-row' },
          h('div', { class: 'road-q' }, 'Q3 2026'),
          h('div', { class: 'road-what' },
            h('h4', {}, 'Public pricing calculator + PSG pre-approval'),
            h('p', {}, 'Self-serve quote in 60s. Standard D&D published at S$130/pax (S$50k list / S$35k post-PSG). The 71% opacity wall becomes the inbound moat.')
          )
        ),
        h('div', { class: 'road-row' },
          h('div', { class: 'road-q' }, 'Q4 2026'),
          h('div', { class: 'road-what' },
            h('h4', {}, 'GenAI event features ship'),
            h('p', {}, 'AI photobooth, RSVP triage, sentiment dashboard — bundled in Standard tier (no premium SKU yet). Priority is being on IMDA’s pre-approved vendor list when 2027-Q1 GenAI grant lands.')
          )
        ),
        h('div', { class: 'road-row' },
          h('div', { class: 'road-q' }, 'Q1–Q2 2027'),
          h('div', { class: 'road-what' },
            h('h4', {}, 'ISO 20121 audit live + WSG WDG(JR+) consulting'),
            h('p', {}, 'Visionnaire’s sole-vendor moat closes. ESG-screened GLC RFPs open at mid-market price points. WDG(JR+) subsidises 70% of the engagement-team workflow redesign that gets the audit through.')
          )
        )
      ),
      h('div', { class: 'closing-contact' },
        h('div', { class: 'cc-block' },
          h('div', { class: 'cc-name' }, 'Sam Neo'),
          h('div', { class: 'cc-role' }, 'Assistant Manager'),
          h('a', { href: 'mailto:sam.neo@elitez.asia', class: 'cc-mail' }, 'sam.neo@elitez.asia'),
          h('div', { class: 'cc-phone' }, '+65 9727 1292')
        ),
        h('div', { class: 'cc-block' },
          h('div', { class: 'cc-name' }, 'Eevann Seah'),
          h('div', { class: 'cc-role' }, 'Associate Director'),
          h('a', { href: 'mailto:eevann.seah@elitez.asia', class: 'cc-mail' }, 'eevann.seah@elitez.asia'),
          h('div', { class: 'cc-phone' }, '+65 8180 0994')
        ),
        h('div', { class: 'cc-addr' },
          h('div', {}, 'Elitez Group'),
          h('div', {}, '2 Kallang Avenue · CT Hub'),
          h('div', {}, 'Singapore 188613'),
          h('div', {}, 'elitez-events.com')
        )
      )
    ),
    footer(ctx.pageIndex.closing, ctx.total, data)
  );
  root.append(el);
}
