/* Elitez LMS — pricing.js
   Renders the 5 public-pricing tier cards from copy.json (already inlined
   into a <script type="application/json" id="tiers-data"> block to avoid
   an extra fetch and keep the page renderable without JS).

   Handles two tier shapes:
     • Per-seat-only (Starter / Team) — single price_display + price_unit_label.
     • Combo (Pro / Scale / Enterprise) — price_unit === 'platform_flat_plus_per_user',
       with price_sgd_flat + price_sgd_per_seat numbers; rendered as a two-line
       price block. Falls back gracefully to the single-line shape if the combo
       fields are missing.
   */

(function () {
  'use strict';

  var script = document.getElementById('tiers-data');
  var host = document.getElementById('tiers-host');
  if (!script || !host) return;

  var tiers;
  try { tiers = JSON.parse(script.textContent); }
  catch (e) { console.error('pricing.js: tiers JSON parse failed', e); return; }
  if (!Array.isArray(tiers)) return;

  while (host.firstChild) host.removeChild(host.firstChild);
  var grid = h('div', { className: 'pricing-grid' });

  function fmtPrice(n) {
    if (n == null) return '—';
    if (n >= 1000) return 'S$' + Number(n).toLocaleString('en-SG');
    return 'S$' + (Number.isInteger(n) ? n : Number(n).toFixed(2));
  }

  function renderPriceBlock(t) {
    // Combo tier: render two-line price block (each line is one inline pair)
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
    // Single-line tier (Starter / Team / legacy)
    return h('div', { className: 'tier-card__price-block' },
      h('span', { className: 'tier-card__price' }, t.price_display || '—'),
      h('span', { className: 'tier-card__unit' }, t.price_unit_label || '')
    );
  }

  tiers.forEach(function (t) {
    var isFeatured = t.id === 'pro';
    var card = h('article', { className: 'tier-card' + (isFeatured ? ' tier-card--featured' : '') });

    card.appendChild(h('h3', { className: 'tier-card__name' }, t.name));
    card.appendChild(renderPriceBlock(t));

    if (t.target_persona_label) {
      card.appendChild(h('p', { className: 'tier-card__persona' }, t.target_persona_label));
    }

    if (t.psg_label) {
      card.appendChild(h('div', { className: 'tier-card__psg' }, t.psg_label));
    }

    if (t.summary) {
      card.appendChild(h('p', { className: 'tier-card__summary' }, t.summary));
    }

    if (t.what_in && t.what_in.length) {
      card.appendChild(h('div', { className: 'tier-card__what-heading' }, 'What is in'));
      card.appendChild(h('ul', { className: 'tier-card__what' },
        t.what_in.map(function (x) { return h('li', null, x); })
      ));
    }
    if (t.what_out && t.what_out.length) {
      card.appendChild(h('div', { className: 'tier-card__what-heading tier-card__what-heading--out' }, 'What is out'));
      card.appendChild(h('ul', { className: 'tier-card__what tier-card__what--out' },
        t.what_out.map(function (x) { return h('li', null, x); })
      ));
    }

    if (t.cta_label) {
      card.appendChild(h('div', { className: 'tier-card__cta' },
        h('a', { className: 'btn btn--ghost', href: 'contact.html#contact-form' }, t.cta_label)
      ));
    }

    grid.appendChild(card);
  });

  host.appendChild(grid);
})();
