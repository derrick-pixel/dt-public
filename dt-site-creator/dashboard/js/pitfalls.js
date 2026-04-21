// ── dt-site-creator ── pitfalls.js ──────────────────────────
// Aggregates pitfalls from all 5 archetype pitfalls.md files.
// Renders a filterable wall (archetype / severity / phase).
// Depends on: window.yamlMini.

(function() {
  'use strict';

  const archetypeIds = [
    'static-informational',
    'transactional',
    'simulator-educational',
    'game',
    'dashboard-analytics'
  ];
  let allPitfalls = [];

  async function loadAllPitfalls() {
    const results = await Promise.all(archetypeIds.map(async id => {
      try {
        const resp = await fetch('archetypes/' + id + '/pitfalls.md');
        if (!resp.ok) return [];
        const text = await resp.text();
        const yamlMatch = text.match(/```yaml\n([\s\S]*?)\n```/);
        if (!yamlMatch) return [];
        return window.yamlMini.parse(yamlMatch[1]).map(e => ({ ...e, archetype: id }));
      } catch (e) {
        console.error('Pitfalls load failed for', id, e);
        return [];
      }
    }));

    // Dedupe universal pitfalls (they appear in all 5)
    const seen = new Map();
    results.flat().forEach(p => {
      if (!seen.has(p.id)) seen.set(p.id, p);
    });
    allPitfalls = Array.from(seen.values());
    render();
  }

  function buildPitfallCard(p) {
    const card = document.createElement('div');
    card.className = 'pitfall-card severity-' + p.severity;
    card.dataset.id = p.id;

    const front = document.createElement('div');
    front.className = 'pitfall-front';

    // Header: severity badge + archetype tag
    const header = document.createElement('div');
    header.className = 'pitfall-header';
    const sev = document.createElement('span');
    sev.className = 'severity-badge severity-' + p.severity;
    sev.textContent = '⚠ ' + (p.severity || '').toUpperCase();
    header.appendChild(sev);
    const tag = document.createElement('span');
    tag.className = 'archetype-tag';
    tag.textContent = (p.id && p.id.startsWith('universal-')) ? 'universal' : (p.archetype || '');
    header.appendChild(tag);
    front.appendChild(header);

    // Title
    const h3 = document.createElement('h3');
    h3.textContent = p.title || '(untitled)';
    front.appendChild(h3);

    // Story
    const story = document.createElement('p');
    story.className = 'pitfall-story';
    story.textContent = p.story || '';
    front.appendChild(story);

    // Source
    const source = document.createElement('p');
    source.className = 'pitfall-source';
    source.textContent = '— ' + (p.source || 'unknown');
    front.appendChild(source);

    // Fix (collapsible)
    if (p.fix) {
      const details = document.createElement('details');
      details.className = 'pitfall-fix';
      const summary = document.createElement('summary');
      summary.textContent = 'Show the fix ▾';
      details.appendChild(summary);
      const pre = document.createElement('pre');
      pre.textContent = p.fix;
      details.appendChild(pre);
      front.appendChild(details);
    }

    // Linked mechanic
    if (p.mechanic) {
      const link = document.createElement('a');
      link.className = 'linked-mechanic';
      link.href = 'mechanics/' + p.mechanic + '/';
      link.textContent = 'Linked: ' + p.mechanic;
      front.appendChild(link);
    }

    card.appendChild(front);

    // Back (revealed in teaching mode)
    const back = document.createElement('div');
    back.className = 'pitfall-back';
    const h4 = document.createElement('h4');
    h4.textContent = 'LESSON';
    back.appendChild(h4);
    const lessonP = document.createElement('p');
    lessonP.textContent = p.lesson || '';
    back.appendChild(lessonP);
    card.appendChild(back);

    return card;
  }

  function render() {
    const archetypeFilter = document.getElementById('filter-archetype').value;
    const severityFilter = document.getElementById('filter-severity').value;
    const phaseFilter = document.getElementById('filter-phase').value;

    const filtered = allPitfalls.filter(p => {
      // Universal pitfalls pass any archetype filter
      if (archetypeFilter && !(p.id && p.id.startsWith('universal-'))) {
        if (p.archetype !== archetypeFilter) return false;
      }
      if (severityFilter && p.severity !== severityFilter) return false;
      if (phaseFilter && p.phase !== phaseFilter) return false;
      return true;
    });

    // Sort: critical → high → medium → low
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    filtered.sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

    const grid = document.getElementById('pitfalls-grid');
    grid.replaceChildren();

    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No pitfalls match these filters.';
      empty.style.color = 'var(--muted)';
      empty.style.textAlign = 'center';
      empty.style.padding = '48px 0';
      grid.appendChild(empty);
      return;
    }

    filtered.forEach(p => grid.appendChild(buildPitfallCard(p)));
  }

  // Teaching mode toggle (shared w/ main.js but pitfalls.html doesn't load main.js)
  function wireTeachingMode() {
    const TM_KEY = 'dtsite:teaching-mode';
    const toggle = document.getElementById('teaching-toggle');
    const saved = localStorage.getItem(TM_KEY) === '1';
    toggle.checked = saved;
    document.body.classList.toggle('teaching-mode', saved);
    toggle.addEventListener('change', () => {
      localStorage.setItem(TM_KEY, toggle.checked ? '1' : '0');
      document.body.classList.toggle('teaching-mode', toggle.checked);
    });
  }

  function wireHamburger() {
    const hb = document.getElementById('hamburger');
    const menu = document.getElementById('mobile-menu');
    if (!hb || !menu) return;
    hb.addEventListener('click', () => {
      hb.classList.toggle('open');
      menu.classList.toggle('open');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadAllPitfalls();
    ['filter-archetype', 'filter-severity', 'filter-phase'].forEach(id => {
      document.getElementById(id).addEventListener('change', render);
    });
    wireTeachingMode();
    wireHamburger();
  });
})();
