/* Elitez LMS — admin-insights.js
   Hydrates /admin-insights.html from:
     • /data/intel/market-intelligence.json
     • /data/intel/pricing-strategy.json
     • /data/intel/whitespace-framework.json
   Uses h() from dom.js — no HTML strings from external data. */

(function () {
  'use strict';

  var DATA_BASE = './data/intel';
  var state = { market: null, pricing: null, whitespace: null };

  Promise.all([
    fetch(DATA_BASE + '/market-intelligence.json').then(function (r) { return r.json(); }),
    fetch(DATA_BASE + '/pricing-strategy.json').then(function (r) { return r.json(); }),
    fetch(DATA_BASE + '/whitespace-framework.json').then(function (r) { return r.json(); })
  ]).then(function (rs) {
    state.market = rs[0]; state.pricing = rs[1]; state.whitespace = rs[2];
    renderAll();
  }).catch(function (err) {
    console.error('admin-insights load failed', err);
    var e = document.getElementById('admin-load-error');
    if (e) e.hidden = false;
  });

  function renderAll() {
    renderFunnel();
    renderPolicies();
    renderCountryReadiness();
    renderPersonas();
    renderNBA();
    renderTiers();
    renderGrants();
    renderHeatmap();
    renderAttackPlans();
    renderTrends();
  }

  // ── Market funnel ────────────────────────────────────────────────────
  function renderFunnel() {
    var host = document.getElementById('market-funnel-host');
    if (!host) return;
    clearNode(host);

    var flow = (state.market.market_size || {}).derivation_flow || {};
    var stages = ['tam', 'sam', 'som'];
    var grid = h('div', { className: 'funnel' });

    stages.forEach(function (key) {
      var s = flow[key];
      if (!s) return;
      var stage = h('article', { className: 'funnel__stage' },
        h('span', { className: 'funnel__stage-label' }, s.stage_label || key.toUpperCase()),
        h('div', { className: 'funnel__stage-result' }, s.result_label || '—'),
        h('p', { className: 'funnel__stage-subtitle' }, s.subtitle || ''),
        s.total_equation ? h('div', { className: 'funnel__stage-equation' }, s.total_equation) : null,
        (s.stacks || []).map(function (stack) {
          return h('div', { className: 'funnel__stack' },
            h('div', { className: 'funnel__stack-name' }, stack.name),
            h('p', { className: 'funnel__stack-source' }, stack.source || ''),
            stack.equation ? h('div', { className: 'funnel__stage-equation' }, stack.equation) : null,
            stack.result_label ? h('div', { className: 'funnel__stage-label' }, '= ' + stack.result_label) : null
          );
        })
      );
      grid.appendChild(stage);
    });
    host.appendChild(grid);
  }

  // ── Policies ─────────────────────────────────────────────────────────
  function renderPolicies() {
    var host = document.getElementById('policies-list-host');
    if (!host) return;
    clearNode(host);
    var grid = h('div', { className: 'feature-grid feature-grid--3' });
    (state.market.policies || []).forEach(function (p) {
      grid.appendChild(h('article', { className: 'feature-card' },
        h('span', { className: 'feature-card__label' }, (p.sentiment || 'neutral').toUpperCase()),
        h('h3', { className: 'feature-card__title' }, p.title),
        h('p', { className: 'feature-card__body' }, p.body),
        p.implication_for_us ? h('p', { className: 'feature-card__body' }, h('strong', null, 'Implication: '), p.implication_for_us) : null,
        p.url ? h('a', { className: 'feature-card__link btn-link', href: p.url, target: '_blank', rel: 'noopener' }, 'Source →') : null
      ));
    });
    host.appendChild(grid);
  }

  // ── Country readiness ────────────────────────────────────────────────
  function renderCountryReadiness() {
    var host = document.getElementById('country-readiness-host');
    if (!host) return;
    clearNode(host);
    var rows = ((state.market.adoption_patterns || {}).country_readiness) || [];
    if (!rows.length) {
      host.appendChild(h('p', { className: 'feature-card__body' }, 'No country-readiness data published in this intel run.'));
      return;
    }
    var cols = Object.keys(rows[0]).filter(function (k) { return k !== 'country'; });

    var table = h('table', { className: 'data-table country-table' },
      h('thead', null,
        h('tr', null,
          h('th', null, 'Country'),
          cols.map(function (c) { return h('th', null, prettyKey(c)); })
        )
      ),
      h('tbody', null,
        rows.map(function (r) {
          return h('tr', null,
            h('td', null, h('strong', null, r.country)),
            cols.map(function (c) {
              var v = r[c];
              if (typeof v === 'number') {
                return h('td', { className: 'mono' }, v + '/5',
                  h('span', { className: 'readiness-bar', 'aria-hidden': 'true' },
                    h('span', { style: { width: (v * 20) + '%' } })
                  )
                );
              }
              return h('td', null, v == null ? '—' : String(v));
            })
          );
        })
      )
    );
    host.appendChild(h('div', { className: 'data-table-wrap' }, table));
  }

  // ── Personas ─────────────────────────────────────────────────────────
  function renderPersonas() {
    var host = document.getElementById('personas-host');
    if (!host) return;
    clearNode(host);
    var grid = h('div', { className: 'persona-grid' });

    (state.pricing.personas || []).forEach(function (p) {
      var wtp = p.wtp_band_sgd || {};
      var nba = p.nba || {};
      grid.appendChild(h('article', { className: 'persona-card' },
        h('h3', { className: 'persona-card__name' }, p.name),
        h('p', { className: 'persona-card__icp' }, p.icp || ''),
        h('div', { className: 'persona-card__section' },
          h('h4', null, 'Pains'),
          h('ul', { className: 'persona-card__pains' },
            (p.pains || []).map(function (x) { return h('li', null, x); })
          )
        ),
        h('div', { className: 'persona-card__section' },
          h('h4', null, 'Current workaround'),
          h('p', { className: 'persona-card__icp' }, p.current_workaround || '—')
        ),
        h('div', { className: 'persona-card__wtp' },
          h('div', { className: 'persona-card__wtp-cell' },
            h('span', { className: 'persona-card__wtp-label' }, 'Low'),
            h('span', { className: 'persona-card__wtp-value' }, fmtSGD(wtp.low_anchor))
          ),
          h('div', { className: 'persona-card__wtp-cell' },
            h('span', { className: 'persona-card__wtp-label' }, 'Expected'),
            h('span', { className: 'persona-card__wtp-value' }, fmtSGD(wtp.expected))
          ),
          h('div', { className: 'persona-card__wtp-cell' },
            h('span', { className: 'persona-card__wtp-label' }, 'Stretch'),
            h('span', { className: 'persona-card__wtp-value' }, fmtSGD(wtp.upper_stretch))
          )
        ),
        h('div', { className: 'persona-card__nba' },
          h('h4', null, 'Next-best-alternative'),
          h('div', { className: 'persona-card__nba-value' }, fmtSGD(nba.monthly_sgd_equivalent) + ' / mo equivalent'),
          h('p', { className: 'persona-card__nba-summary' }, nba.summary || '')
        )
      ));
    });
    host.appendChild(grid);
  }

  // ── NBA summary cards ────────────────────────────────────────────────
  function renderNBA() {
    var host = document.getElementById('nba-cards-host');
    if (!host) return;
    clearNode(host);
    var grid = h('div', { className: 'feature-grid feature-grid--3' });
    (state.pricing.personas || []).forEach(function (p) {
      var nba = p.nba || {};
      grid.appendChild(h('article', { className: 'feature-card' },
        h('span', { className: 'feature-card__label' }, 'METHOD · ' + (nba.method || '—').toUpperCase()),
        h('h3', { className: 'feature-card__title' }, p.name),
        h('p', { className: 'feature-card__body' }, nba.summary || ''),
        h('p', { className: 'feature-card__body' },
          h('strong', null, fmtSGD(nba.monthly_sgd_equivalent) + ' / mo '),
          'next-best-alternative equivalent (confidence ' + (Math.round((nba.confidence || 0) * 100)) + '%)'
        )
      ));
    });
    host.appendChild(grid);
  }

  // ── Tiers ────────────────────────────────────────────────────────────
  function renderTiers() {
    var host = document.getElementById('tiers-host');
    if (!host) return;
    clearNode(host);
    var grid = h('div', { className: 'pricing-grid' });
    (state.pricing.recommended_tiers || []).forEach(function (t) {
      grid.appendChild(renderTierCard(t, { admin: true }));
    });
    host.appendChild(grid);
  }

  // ── Grants ───────────────────────────────────────────────────────────
  // Per the recalibrated brief, pricing-strategy.json.grants is intentionally
  // an empty array — government grants are excluded from the marketing pitch.
  // Render an "empty by design" placeholder when nothing is loaded.
  function renderGrants() {
    var host = document.getElementById('grants-host');
    if (!host) return;
    clearNode(host);
    var grants = state.pricing.grants || [];
    if (!grants.length) {
      host.appendChild(h('article', { className: 'feature-card' },
        h('span', { className: 'feature-card__label' }, 'EMPTY BY DESIGN'),
        h('h3', { className: 'feature-card__title' }, 'No grants surfaced on the marketing site.'),
        h('p', { className: 'feature-card__body' },
          'pricing-strategy.json.grants is intentionally an empty array. Government grants are excluded from the marketing pitch on the recalibrated brief. Mentioned privately in sales conversations if a buyer raises them.'
        )
      ));
      return;
    }
    var grid = h('div', { className: 'feature-grid feature-grid--4' });
    grants.forEach(function (g) {
      grid.appendChild(h('article', { className: 'feature-card' },
        h('span', { className: 'feature-card__label' }, 'COVERAGE · ' + (g.coverage_pct || 0) + '%'),
        h('h3', { className: 'feature-card__title' }, g.name),
        h('p', { className: 'feature-card__body' }, g.eligibility || ''),
        h('p', { className: 'feature-card__body' },
          h('strong', null, 'Cap: '), g.cap_sgd ? fmtSGD(g.cap_sgd) : 'No cap'
        ),
        h('p', { className: 'feature-card__body' },
          h('strong', null, 'Applies to: '), (g.applies_to_tiers || []).join(', ')
        )
      ));
    });
    host.appendChild(grid);
  }

  // ── Heatmap ──────────────────────────────────────────────────────────
  function renderHeatmap() {
    var host = document.getElementById('heatmap-host');
    if (!host) return;
    clearNode(host);
    var hm = state.whitespace.heatmap;
    if (!hm) return;

    var thead = h('thead', null,
      h('tr', null,
        h('th', null, ''),
        hm.needs.map(function (n) { return h('th', null, shortLabel(n.name)); })
      )
    );
    var tbody = h('tbody', null,
      hm.segments.map(function (seg) {
        return h('tr', null,
          h('th', { scope: 'row' }, shortLabel(seg.name)),
          hm.needs.map(function (n) {
            var cellKey = seg.id + ':' + n.id;
            var cell = (hm.cells || {})[cellKey];
            if (!cell) {
              return h('td', null, h('div', { className: 'heatmap-cell', dataset: { score: 0 } }, '—'));
            }
            var topComp = (cell.competitors || [])[0];
            var topName = topComp ? topComp.name + ' ' + topComp.score : 'no rival';
            var note = cell.specialisation_for_cell || (topComp ? topComp.specialisation_for_cell : '');
            return h('td', null,
              h('div', {
                className: 'heatmap-cell heatmap-cell--ours',
                dataset: { score: cell.our_score },
                title: 'Us: ' + cell.our_score + '/5 · Top rival: ' + topName + (note ? '\n' + note : '')
              }, cell.our_score + '/5')
            );
          })
        );
      })
    );
    var table = h('table', { className: 'heatmap' }, thead, tbody);
    var wrap = h('div', { className: 'heatmap-wrap' }, table);

    var key = h('div', { className: 'heatmap-key' },
      h('span', null, h('span', { className: 'heatmap-key__swatch', style: { background: 'var(--accent2)' } }), 'Elitez score (orange) 5 = whitespace win'),
      h('span', null, 'Hover cells for competitor benchmarks · scores 0–5')
    );
    host.appendChild(wrap);
    host.appendChild(key);
  }

  // ── Attack plans ─────────────────────────────────────────────────────
  // The intel "gtm" field can be either a string (legacy) or an object with
  // channel / pitch / pricing / content sub-fields. Render structured when
  // it's an object so the four GTM levers stay visible.
  function renderAttackPlans() {
    var host = document.getElementById('attack-plans-host');
    if (!host) return;
    clearNode(host);
    (state.whitespace.attack_plans || []).forEach(function (plan) {
      var gtmNode;
      if (plan.gtm && typeof plan.gtm === 'object') {
        gtmNode = h('div', { className: 'attack-plan__gtm' },
          plan.gtm.channel ? h('div', null, h('strong', null, 'Channel: '), plan.gtm.channel) : null,
          plan.gtm.pitch ? h('div', null, h('strong', null, 'Pitch: '), plan.gtm.pitch) : null,
          plan.gtm.pricing ? h('div', null, h('strong', null, 'Pricing: '), plan.gtm.pricing) : null,
          plan.gtm.content ? h('div', null, h('strong', null, 'Content: '), plan.gtm.content) : null
        );
      } else {
        gtmNode = h('span', null, plan.gtm || '—');
      }
      var card = h('article', { className: 'attack-plan' },
        h('div', { className: 'attack-plan__rank' }, 'PLAN-0' + plan.rank),
        h('h3', { className: 'attack-plan__title' }, plan.niche_name),
        h('div', { className: 'attack-plan__tam' }, plan.tam_estimate_sgd ? fmtCompact(plan.tam_estimate_sgd) + ' TAM' : ''),
        h('div', { className: 'attack-plan__row' },
          h('strong', null, 'ICP'), h('span', null, plan.icp || '—')
        ),
        h('div', { className: 'attack-plan__row' },
          h('strong', null, 'Why-gap'), h('span', null, plan.why_gap || '—')
        ),
        h('div', { className: 'attack-plan__row' },
          h('strong', null, 'Why-we-win'), h('span', null, plan.why_we_win || '—')
        ),
        h('div', { className: 'attack-plan__row' },
          h('strong', null, 'GTM'), gtmNode
        ),
        plan.tam_reasoning ? h('div', { className: 'attack-plan__row' },
          h('strong', null, 'TAM reasoning'), h('span', null, plan.tam_reasoning)
        ) : null
      );
      host.appendChild(card);
    });
  }

  // ── Trends ───────────────────────────────────────────────────────────
  function renderTrends() {
    var host = document.getElementById('trends-host');
    if (!host) return;
    clearNode(host);
    var grid = h('div', { className: 'feature-grid feature-grid--3' });
    (state.market.trends || []).forEach(function (t) {
      grid.appendChild(h('article', { className: 'feature-card' },
        h('span', { className: 'feature-card__label' }, (t.sentiment || 'SIGNAL').toUpperCase()),
        h('h3', { className: 'feature-card__title' }, t.title || t.name || '—'),
        h('p', { className: 'feature-card__body' }, t.body || t.evidence || t.summary || ''),
        t.implication_for_us ? h('p', { className: 'feature-card__body' },
          h('strong', null, 'Implication: '), t.implication_for_us
        ) : null
      ));
    });
    host.appendChild(grid);
  }

  // ── helpers ──────────────────────────────────────────────────────────
  function clearNode(n) { if (!n) return; while (n.firstChild) n.removeChild(n.firstChild); }
  function shortLabel(s) {
    if (!s) return '';
    var m = s.match(/^([^(]+)/);
    return (m ? m[1] : s).trim();
  }
  function prettyKey(k) {
    return k.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  // Tier-card renderer (shared shape with public pricing — kept in sync).
  // Handles per_user_per_month, platform_flat_plus_per_user (combo) and legacy
  // annual_platform_flat / per_engagement shapes.
  function renderTierCard(t, opts) {
    opts = opts || {};
    var card = h('article', { className: 'tier-card' });

    card.appendChild(h('h3', { className: 'tier-card__name' }, t.name));
    card.appendChild(buildPriceBlock(t));
    if (t.target_persona) card.appendChild(h('p', { className: 'tier-card__persona' }, t.target_persona));
    if (t.min_seats) {
      card.appendChild(h('div', { className: 'tier-card__psg' }, 'Minimum ' + t.min_seats + ' seats'));
    }
    if (t.psychological_anchor) {
      card.appendChild(h('p', { className: 'tier-card__summary' }, t.psychological_anchor));
    }
    if (t.what_in && t.what_in.length) {
      card.appendChild(h('div', { className: 'tier-card__what-heading' }, 'What is in'));
      card.appendChild(h('ul', { className: 'tier-card__what' },
        t.what_in.map(function (x) { return h('li', null, x); })
      ));
    }
    if (t.what_excluded && t.what_excluded.length) {
      card.appendChild(h('div', { className: 'tier-card__what-heading tier-card__what-heading--out' }, 'What is out'));
      card.appendChild(h('ul', { className: 'tier-card__what tier-card__what--out' },
        t.what_excluded.map(function (x) { return h('li', null, x); })
      ));
    }
    return card;
  }

  function fmtPrice(n) {
    if (n == null) return '—';
    if (Number(n) >= 1000) return 'S$' + Number(n).toLocaleString('en-SG');
    return 'S$' + (Number.isInteger(Number(n)) ? Number(n) : Number(n).toFixed(2));
  }

  function buildPriceBlock(t) {
    // Combo tier: platform-flat + per-user — render two-line price block.
    if (t.price_unit === 'platform_flat_plus_per_user' && t.price_sgd_flat != null && t.price_sgd_per_seat != null) {
      return h('div', { className: 'tier-card__price-block tier-card__price-block--combo' },
        h('div', { className: 'tier-card__price-line' },
          h('span', { className: 'tier-card__price' }, fmtPrice(t.price_sgd_flat)),
          h('span', { className: 'tier-card__unit' }, '/mo platform')
        ),
        h('span', { className: 'tier-card__combo-plus', 'aria-hidden': 'true' }, '+'),
        h('div', { className: 'tier-card__price-line' },
          h('span', { className: 'tier-card__price tier-card__price--small' }, fmtPrice(t.price_sgd_per_seat)),
          h('span', { className: 'tier-card__unit' }, '/user/mo')
        )
      );
    }
    // Single-unit tier: per_user_per_month, annual_platform_flat, per_engagement, etc.
    var unitLabel = t.price_unit_label || unitDefault(t.price_unit);
    var price = t.price_sgd;
    var priceStr;
    if (price === 0) priceStr = 'S$0';
    else if (price == null) priceStr = '—';
    else priceStr = fmtPrice(price);
    return h('div', { className: 'tier-card__price-block' },
      h('span', { className: 'tier-card__price' }, priceStr),
      h('span', { className: 'tier-card__unit' }, unitLabel)
    );
  }

  function unitDefault(unit) {
    return ({
      per_user_per_month: '/user/mo',
      per_user_per_year: '/user/yr',
      per_seat_per_year: '/seat/yr',
      annual_platform_flat: '/year flat',
      per_engagement: '/engagement',
      one_time: ' one-time'
    })[unit] || '';
  }
})();
