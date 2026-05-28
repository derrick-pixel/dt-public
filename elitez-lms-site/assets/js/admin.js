/* Elitez LMS — admin.js
   Hydrates /admin.html from:
     • /data/intel/competitors.json
     • /data/intel/whitespace-framework.json
   Uses h() from dom.js — no HTML strings from external data. */

(function () {
  'use strict';

  var DATA_BASE = './data/intel';
  var state = {
    competitors: null,
    whitespace: null,
    selectedComp: 'coursebox_ai',  // for radar overlay — default to closest BYO-content rival
    filterCategory: '',
    filterText: ''
  };

  // ── Load JSON ────────────────────────────────────────────────────────
  Promise.all([
    fetch(DATA_BASE + '/competitors.json').then(function (r) { return r.json(); }),
    fetch(DATA_BASE + '/whitespace-framework.json').then(function (r) { return r.json(); })
  ]).then(function (results) {
    state.competitors = results[0];
    state.whitespace = results[1];
    renderAll();
  }).catch(function (err) {
    console.error('intel-consumer admin: load failed', err);
    var err1 = document.getElementById('admin-load-error');
    if (err1) err1.hidden = false;
  });

  function renderAll() {
    renderTop5();
    renderCompetitorTable();
    renderRadar();
    renderCategoryBreakdown();
  }

  // ── Top-5 threat cards ───────────────────────────────────────────────
  function renderTop5() {
    var host = document.getElementById('top-5-cards-host');
    if (!host) return;
    clearNode(host);

    var byId = indexBy(state.competitors.competitors, 'id');
    var grid = h('div', { className: 'threat-grid' });

    state.competitors.top_five.forEach(function (entry, idx) {
      var comp = byId[entry.competitor_id];
      if (!comp) return;
      var card = h('article', { className: 'threat-card' },
        h('div', { className: 'threat-card__rank' }, 'THREAT-0' + (idx + 1)),
        h('h3', { className: 'threat-card__name' }, comp.name),
        h('div', { className: 'threat-card__category' }, prettyCategory(comp.category)),
        h('p', { className: 'threat-card__rationale' }, entry.rationale),
        h('div', { className: 'threat-card__meta' },
          h('span', null, 'Threat ', h('strong', null, comp.threat_level + '/5')),
          h('span', null, 'Beat ', h('strong', null, comp.beatability + '/5')),
          h('span', null,
            comp.sg_monthly_sgd != null
              ? 'S$' + comp.sg_monthly_sgd + '/mo'
              : 'n/a'
          )
        )
      );
      grid.appendChild(card);
    });
    host.appendChild(grid);
  }

  // ── Competitor table with filters ────────────────────────────────────
  function renderCompetitorTable() {
    var host = document.getElementById('competitor-table-host');
    if (!host) return;
    clearNode(host);

    var categories = unique(state.competitors.competitors.map(function (c) { return c.category; })).sort();

    var filters = h('div', { className: 'table-filters' },
      h('input', {
        type: 'search',
        id: 'comp-search',
        placeholder: 'Search competitors…',
        oninput: function (e) { state.filterText = e.target.value.toLowerCase(); renderTableBody(); }
      }),
      h('select', {
        id: 'comp-category',
        onchange: function (e) { state.filterCategory = e.target.value; renderTableBody(); }
      },
        h('option', { value: '' }, 'All categories'),
        categories.map(function (c) { return h('option', { value: c }, prettyCategory(c)); })
      )
    );

    var table = h('table', { className: 'data-table' },
      h('thead', null,
        h('tr', null,
          h('th', null, 'Competitor'),
          h('th', null, 'Category'),
          h('th', null, 'HQ'),
          h('th', null, 'SG S$/mo'),
          h('th', null, 'Threat'),
          h('th', null, 'Beat')
        )
      ),
      h('tbody', { id: 'comp-table-body' })
    );
    var wrap = h('div', { className: 'data-table-wrap' }, table);
    host.appendChild(filters);
    host.appendChild(wrap);
    renderTableBody();
  }

  function renderTableBody() {
    var tbody = document.getElementById('comp-table-body');
    if (!tbody) return;
    clearNode(tbody);

    state.competitors.competitors
      .filter(function (c) {
        if (state.filterCategory && c.category !== state.filterCategory) return false;
        if (state.filterText) {
          var t = (c.name + ' ' + (c.primary_value_prop || '') + ' ' + (c.target_market || []).join(' ')).toLowerCase();
          if (t.indexOf(state.filterText) === -1) return false;
        }
        return true;
      })
      .sort(function (a, b) { return (b.threat_level || 0) - (a.threat_level || 0); })
      .forEach(function (c) {
        var row = h('tr', { dataset: { competitorId: c.id }, onclick: function () { openDetail(c.id); }, style: { cursor: 'pointer' } },
          h('td', null, h('strong', null, c.name)),
          h('td', null, prettyCategory(c.category)),
          h('td', null, c.hq || '—'),
          h('td', { className: 'mono' }, c.sg_monthly_sgd != null ? 'S$' + c.sg_monthly_sgd : '—'),
          h('td', null, h('span', { className: 'threat-pill threat-pill--' + (c.threat_level || 0) }, (c.threat_level || 0) + '/5')),
          h('td', null, h('span', { className: 'mono' }, (c.beatability || 0) + '/5'))
        );
        tbody.appendChild(row);
      });
  }

  // ── Detail modal ─────────────────────────────────────────────────────
  function openDetail(id) {
    var comp = state.competitors.competitors.find(function (c) { return c.id === id; });
    if (!comp) return;
    var modal = document.getElementById('detail-modal');
    var body = document.getElementById('detail-modal-body');
    clearNode(body);

    body.appendChild(h('button', { className: 'modal__close', 'aria-label': 'Close', onclick: closeDetail }, '×'));
    body.appendChild(h('div', { className: 'modal__eyebrow' }, prettyCategory(comp.category)));
    body.appendChild(h('h3', { className: 'modal__title' }, comp.name));
    body.appendChild(h('p', null, comp.primary_value_prop || ''));

    body.appendChild(h('div', { className: 'modal__meta' },
      h('span', null, h('strong', null, 'HQ: '), comp.hq || '—'),
      h('span', null, h('strong', null, 'Pricing: '), comp.pricing_range_published || '—'),
      h('span', null, h('strong', null, 'Threat: '), (comp.threat_level || 0) + '/5'),
      h('span', null, h('strong', null, 'Beatability: '), (comp.beatability || 0) + '/5'),
      h('span', null, h('strong', null, 'Market share: '), comp.market_share_estimate_pct != null ? comp.market_share_estimate_pct + '%' : '—'),
      h('span', null, h('strong', null, 'Research: '), comp.research_date || '—')
    ));

    if (comp.features && comp.features.length) {
      body.appendChild(h('div', { className: 'modal__col' },
        h('h4', null, 'Features'),
        h('ul', null, comp.features.map(function (f) { return h('li', null, f); }))
      ));
    }
    if (comp.strengths && comp.strengths.length) {
      body.appendChild(h('div', { className: 'modal__col' },
        h('h4', null, 'Strengths'),
        h('ul', null, comp.strengths.map(function (f) { return h('li', null, f); }))
      ));
    }
    if (comp.weaknesses && comp.weaknesses.length) {
      body.appendChild(h('div', { className: 'modal__col' },
        h('h4', null, 'Weaknesses'),
        h('ul', null, comp.weaknesses.map(function (f) { return h('li', null, f); }))
      ));
    }
    if (comp.url) {
      body.appendChild(h('div', { className: 'modal__col' },
        h('a', { href: comp.url, target: '_blank', rel: 'noopener', className: 'btn-link' }, 'Visit website →')
      ));
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeDetail() {
    var modal = document.getElementById('detail-modal');
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  document.addEventListener('click', function (e) {
    if (e.target && e.target.classList && e.target.classList.contains('modal-overlay')) closeDetail();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDetail();
  });

  // ── Strategy radar (SVG) ─────────────────────────────────────────────
  function renderRadar() {
    var host = document.getElementById('strategy-radar-host');
    if (!host) return;
    clearNode(host);
    var sc = state.whitespace.strategy_canvas;
    var dims = sc.dimensions;
    // Whitespace intel uses "us" as the our-scores key (was "elitez_lms" in earlier shape — supported as fallback).
    var us = sc.scores.us || sc.scores.elitez_lms || {};
    var compIds = Object.keys(sc.scores).filter(function (k) { return k !== 'us' && k !== 'elitez_lms'; });
    // Make sure selectedComp exists in the score set; pick first available competitor if not.
    if (compIds.indexOf(state.selectedComp) === -1 && compIds.length) {
      state.selectedComp = compIds[0];
    }

    var size = 360, cx = size / 2, cy = size / 2, max = 5, r = 130;
    var n = dims.length;

    function point(idx, value) {
      var angle = -Math.PI / 2 + (idx / n) * Math.PI * 2;
      var rr = (value / max) * r;
      return [cx + Math.cos(angle) * rr, cy + Math.sin(angle) * rr];
    }

    var SVG_NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.setAttribute('class', 'radar-svg');
    svg.setAttribute('aria-label', '8-dimension strategy canvas: Elitez LMS vs selected competitor');

    // grid rings
    [1, 2, 3, 4, 5].forEach(function (lvl) {
      var pts = dims.map(function (_d, i) {
        var p = point(i, lvl);
        return p[0] + ',' + p[1];
      }).join(' ');
      var poly = document.createElementNS(SVG_NS, 'polygon');
      poly.setAttribute('points', pts);
      poly.setAttribute('class', 'axis-grid');
      svg.appendChild(poly);
    });

    // axis lines + labels
    dims.forEach(function (d, i) {
      var p = point(i, max);
      var line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', cx); line.setAttribute('y1', cy);
      line.setAttribute('x2', p[0]); line.setAttribute('y2', p[1]);
      line.setAttribute('class', 'axis-line');
      svg.appendChild(line);

      var label = document.createElementNS(SVG_NS, 'text');
      var pl = point(i, max + 0.7);
      label.setAttribute('x', pl[0]);
      label.setAttribute('y', pl[1]);
      label.setAttribute('text-anchor', pl[0] < cx - 5 ? 'end' : pl[0] > cx + 5 ? 'start' : 'middle');
      label.setAttribute('dominant-baseline', pl[1] < cy ? 'auto' : 'hanging');
      label.setAttribute('class', 'axis-label');
      label.textContent = shortLabel(d.label);
      svg.appendChild(label);
    });

    var seriesG = document.createElementNS(SVG_NS, 'g');
    seriesG.setAttribute('id', 'radar-series');
    svg.appendChild(seriesG);

    function drawSeries(scores, klass, dotKlass) {
      var pts = dims.map(function (d, i) { return point(i, scores[d.key] || 0); });
      var poly = document.createElementNS(SVG_NS, 'polygon');
      poly.setAttribute('points', pts.map(function (p) { return p.join(','); }).join(' '));
      poly.setAttribute('class', klass);
      seriesG.appendChild(poly);
      pts.forEach(function (p) {
        var c = document.createElementNS(SVG_NS, 'circle');
        c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]); c.setAttribute('r', 3);
        c.setAttribute('class', dotKlass);
        seriesG.appendChild(c);
      });
    }

    function redrawSeries() {
      clearNode(seriesG);
      var compScores = sc.scores[state.selectedComp] || {};
      drawSeries(compScores, 'series-comp', 'series-comp-dot');
      drawSeries(us, 'series-elitez', 'series-elitez-dot');
    }
    redrawSeries();

    // Legend
    var legend = h('div', { className: 'radar-legend' },
      h('div', { className: 'radar-legend__row' },
        h('span', { className: 'radar-legend__swatch radar-legend__swatch--us' }),
        h('strong', null, 'Elitez LMS')
      ),
      h('div', { className: 'radar-legend__row' },
        h('span', { className: 'radar-legend__swatch radar-legend__swatch--them' }),
        h('select', {
          id: 'radar-competitor',
          onchange: function (e) { state.selectedComp = e.target.value; redrawSeries(); renderScoreList(); }
        },
          compIds.map(function (id) {
            return h('option', { value: id, selected: id === state.selectedComp ? true : null }, prettyCompId(id));
          })
        )
      ),
      h('ul', { id: 'radar-scores', className: 'radar-legend__scores' })
    );

    var wrap = h('div', { className: 'radar-wrap' }, svg, legend);
    host.appendChild(wrap);
    renderScoreList();

    function renderScoreList() {
      var ul = document.getElementById('radar-scores');
      if (!ul) return;
      clearNode(ul);
      var compScores = sc.scores[state.selectedComp] || {};
      dims.forEach(function (d) {
        ul.appendChild(h('li', null,
          h('strong', null, shortLabel(d.label)),
          h('span', null, (us[d.key] || 0) + '/5'),
          h('span', null, (compScores[d.key] || 0) + '/5')
        ));
      });
    }
  }

  // ── Category breakdown ───────────────────────────────────────────────
  function renderCategoryBreakdown() {
    var host = document.getElementById('category-breakdown-host');
    if (!host) return;
    clearNode(host);

    var groups = {};
    state.competitors.competitors.forEach(function (c) {
      var k = c.category;
      if (!groups[k]) groups[k] = [];
      groups[k].push(c);
    });

    var grid = h('div', { className: 'feature-grid feature-grid--3' });
    Object.keys(groups).sort().forEach(function (cat) {
      var list = groups[cat];
      var avgThreat = (list.reduce(function (a, c) { return a + (c.threat_level || 0); }, 0) / list.length).toFixed(1);
      grid.appendChild(h('article', { className: 'feature-card' },
        h('span', { className: 'feature-card__label' }, prettyCategory(cat)),
        h('h3', { className: 'feature-card__title' }, list.length + ' competitors · avg threat ' + avgThreat + '/5'),
        h('p', { className: 'feature-card__body' },
          list.slice(0, 4).map(function (c) { return c.name; }).join(', ') + (list.length > 4 ? ', …' : '')
        )
      ));
    });
    host.appendChild(grid);
  }

  // ── helpers ──────────────────────────────────────────────────────────
  function clearNode(n) { if (!n) return; while (n.firstChild) n.removeChild(n.firstChild); }
  function indexBy(arr, key) { var o = {}; arr.forEach(function (x) { o[x[key]] = x; }); return o; }
  function unique(arr) { var s = {}; var out = []; arr.forEach(function (x) { if (!s[x]) { s[x] = 1; out.push(x); } }); return out; }
  function shortLabel(s) {
    if (!s) return '';
    var m = s.match(/^([^(]+)/);
    return (m ? m[1] : s).trim();
  }
  function prettyCategory(c) {
    return ({
      sg_local: 'SG-local',
      regional_challenger: 'Regional challenger',
      global_incumbent: 'Global incumbent',
      big_si: 'Enterprise LXP',
      adjacent: 'Adjacent',
      diy_alternative: 'DIY / incumbent'
    })[c] || (c ? String(c).replace(/_/g, ' ') : '—');
  }
  function prettyCompId(id) {
    return ({
      coursebox_ai: 'Coursebox AI',
      articulate_360: 'Articulate 360',
      ispring_learn: 'iSpring Learn',
      talenox_learn: 'Talenox Learn',
      diy_sharepoint_forms: 'DIY SharePoint + Forms',
      docebo: 'Docebo',
      disprz: 'Disprz',
      talentlms: 'TalentLMS',
      cornerstone_learn: 'Cornerstone Learn',
      synthesia: 'Synthesia',
      heygen_academy: 'HeyGen (Academy)',
      sana: 'Sana',
      tovuti: 'Tovuti',
      learndash: 'LearnDash',
      skillgrasp: 'Skillgrasp',
      knowbe4: 'KnowBe4',
      coursera_skillsfuture: 'Coursera (SG)',
      bamboohr_learning: 'BambooHR Learning',
      deel_engage: 'Deel Engage',
      multiplier_learning: 'Multiplier Learning'
    })[id] || (id ? String(id).replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }) : id);
  }
})();
