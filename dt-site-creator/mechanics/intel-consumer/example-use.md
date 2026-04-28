# intel-consumer — Example usage

## Pattern: hydrate admin.html with sibling competitor data

```html
<!-- admin.html -->
<div id="competitor-table"></div>

<script type="module">
import { loadIntel, h, mount } from './assets/js/intel-consumer.js';

const intel = await loadIntel('/data/intel/');

if (intel.warnings.length) {
  document.getElementById('competitor-table').appendChild(
    h('div', { class: 'banner banner-warn' },
      `Partial intel — ${intel.warnings.length} warning(s). See console.`)
  );
  console.warn(intel.warnings);
}

if (intel.competitors?.competitors) {
  const rows = intel.competitors.competitors.map(c =>
    h('tr', {},
      h('td', {}, c.name),
      h('td', {}, c.url),
      h('td', { class: 'num' }, c.threat_level),
      h('td', { class: 'num' }, c.beatability),
      h('td', { class: 'num' }, c.sg_monthly_sgd ? `S$${c.sg_monthly_sgd}` : '—'),
    )
  );

  mount(document.getElementById('competitor-table'),
    h('table', { class: 'compet-table' },
      h('thead', {},
        h('tr', {},
          ...['Competitor', 'URL', 'Threat', 'Beatability', 'S$/mo'].map(t => h('th', {}, t))
        )
      ),
      h('tbody', {}, ...rows)
    )
  );
}
</script>
```

## Pattern: hydrate admin-insights.html with personas + tiers

```html
<div id="personas-grid"></div>
<div id="tier-table"></div>

<script type="module">
import { loadIntel, h, mount } from './assets/js/intel-consumer.js';

const intel = await loadIntel('/data/intel/');

if (intel.pricingStrategy?.personas) {
  mount(document.getElementById('personas-grid'),
    h('div', { class: 'persona-grid' },
      ...intel.pricingStrategy.personas.map(p =>
        h('div', { class: 'persona-card' },
          h('h3', {}, p.name),
          h('p', { class: 'persona-icp' }, p.icp),
          h('div', { class: 'persona-pains' },
            h('h4', {}, 'Pains'),
            h('ul', {}, ...p.pains.map(pain => h('li', {}, pain)))
          ),
          h('div', { class: 'wtp-band' },
            h('span', { class: 'lbl' }, 'WTP'),
            h('span', { class: 'val' }, `S$${p.wtp_band_sgd.expected}`)
          )
        )
      )
    )
  );
}

if (intel.pricingStrategy?.recommended_tiers) {
  // ... similar pattern for tiers
}
</script>
```

## Pattern: graceful fallback when sibling intel absent

```html
<script type="module">
import { loadIntel, h, mount } from './assets/js/intel-consumer.js';

const intel = await loadIntel('/data/intel/');

const container = document.getElementById('competitor-table');

if (!intel.competitors) {
  // No sibling intel — render placeholder
  mount(container,
    h('div', { class: 'banner banner-info' },
      h('h3', {}, 'Competitive analysis coming soon'),
      h('p', {}, 'This site has not yet been paired with a competitor-intel-template fork. Once research is complete, this section will show 30+ competitors with threat scoring, design audit, and 8-D positioning radar.')
    )
  );
} else {
  // Render normally
}
</script>
```

## Sourced from

This mechanic was lifted from `competitor-intel-template/template/assets/js/dom.js` (the `h()` helper) and adapted with the multi-file loader. New mechanic shipped with dt-site-creator v2 (2026-04-28).
