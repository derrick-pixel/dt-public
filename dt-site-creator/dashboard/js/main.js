// ── dt-site-creator dashboard ── main.js ──────────────────────
// App shell, state management, stage routing, stage 3+4 rendering.
// All dynamic DOM is built via createElement / textContent / appendChild.
// No innerHTML with template-literal interpolation (XSS hygiene + teaching purpose).

(function() {
  'use strict';

  // ── Persistent state ──────────────────────────────────────
  const STATE_KEY = 'dtsite:session:v1';
  const state = {
    projectDescription: '',
    scopingAnswers: {},
    archetypeScores: {},
    chosenArchetype: null,
    tickedMechanics: [],
    teachingMode: false,
    currentStage: 1
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) Object.assign(state, JSON.parse(raw));
    } catch (e) { /* reset on parse error */ }
  }
  function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  // ── Data loaders ──────────────────────────────────────────
  let archetypes = null, mechanics = null, examples = null;

  async function loadData() {
    const [a, m, e] = await Promise.all([
      fetch('dashboard/data/archetypes.json').then(r => r.json()),
      fetch('dashboard/data/mechanics.json').then(r => r.json()),
      fetch('dashboard/data/examples.json').then(r => r.json())
    ]);
    archetypes = a.archetypes;
    mechanics = m.mechanics;
    examples = e.examples;
  }

  // ── Stage routing ─────────────────────────────────────────
  function goToStage(n) {
    document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('stage-' + n);
    if (el) el.classList.add('active');
    state.currentStage = n;
    saveState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Stage 1: intent capture ───────────────────────────────
  function wireStage1() {
    const ta = document.getElementById('project-description');
    ta.value = state.projectDescription || '';
    ta.addEventListener('input', e => {
      state.projectDescription = e.target.value;
      saveState();
    });
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        ta.value = chip.dataset.chip;
        state.projectDescription = chip.dataset.chip;
        saveState();
      });
    });
    document.getElementById('btn-find-archetype').addEventListener('click', () => {
      if (!state.projectDescription.trim()) {
        toast("Describe what you're building first.");
        return;
      }
      goToStage(2);
      window.scoping.renderQuestions(archetypes);
    });
  }

  // ── Stage 3: archetype recommendations ────────────────────
  function buildArchetypeCard(archetype, matchPct) {
    const card = document.createElement('div');
    card.className = 'archetype-card';
    card.dataset.archetype = archetype.id;

    const match = document.createElement('div');
    match.className = 'archetype-match';
    match.textContent = matchPct + '%';
    card.appendChild(match);

    const h3 = document.createElement('h3');
    h3.textContent = archetype.name;
    card.appendChild(h3);

    const desc = document.createElement('p');
    desc.textContent = archetype.description;
    card.appendChild(desc);

    const examplesDiv = document.createElement('div');
    examplesDiv.className = 'archetype-examples';
    archetype.past_examples.slice(0, 3).forEach(id => {
      const chip = document.createElement('span');
      chip.className = 'example-chip';
      chip.textContent = id;
      examplesDiv.appendChild(chip);
    });
    card.appendChild(examplesDiv);

    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.textContent = 'Open playbook →';
    btn.addEventListener('click', () => {
      state.chosenArchetype = archetype.id;
      state.tickedMechanics = [];
      saveState();
      renderArchetypeDetail(archetype.id);
      goToStage(4);
    });
    card.appendChild(btn);

    return card;
  }

  function renderRecommendations() {
    const sorted = [...archetypes].sort((a, b) =>
      (state.archetypeScores[b.id] || 0) - (state.archetypeScores[a.id] || 0)
    );
    const top = sorted.slice(0, 3);
    const maxScore = top[0] ? (state.archetypeScores[top[0].id] || 1) : 1;

    const container = document.getElementById('archetype-recommendations');
    container.replaceChildren();
    top.forEach(a => {
      const pct = Math.round((state.archetypeScores[a.id] || 0) / maxScore * 100);
      container.appendChild(buildArchetypeCard(a, pct));
    });
  }

  // ── Stage 4: archetype detail ─────────────────────────────
  function buildExampleCard(e) {
    const card = document.createElement('div');
    card.className = 'example-card';

    if (e.screenshot) {
      const img = document.createElement('img');
      img.src = e.screenshot;
      img.alt = e.name;
      img.loading = 'lazy';
      img.addEventListener('error', () => { img.style.display = 'none'; });
      card.appendChild(img);
    }

    const h4 = document.createElement('h4');
    h4.textContent = e.name;
    card.appendChild(h4);

    const p = document.createElement('p');
    p.textContent = e.why_it_matches;
    card.appendChild(p);

    if (e.live_url) {
      const a = document.createElement('a');
      a.href = e.live_url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Live →';
      card.appendChild(a);
    }

    return card;
  }

  function buildMechanicItem(m, archetypeId) {
    const fit = m.fits[archetypeId] || 'rare';

    // Outer wrapper holds the header row + expandable details
    const wrap = document.createElement('div');
    wrap.className = 'mechanic-wrap mechanic-fit-' + fit;
    if (fit === 'rare') wrap.style.display = 'none';

    // Header row (the visible summary + checkbox)
    const label = document.createElement('label');
    label.className = 'mechanic-item';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.mechanicId = m.id;
    const preChecked = fit === 'core' || state.tickedMechanics.includes(m.id);
    cb.checked = preChecked;
    if (preChecked && !state.tickedMechanics.includes(m.id)) {
      state.tickedMechanics.push(m.id);
    }
    cb.addEventListener('change', () => {
      if (cb.checked && !state.tickedMechanics.includes(m.id)) {
        state.tickedMechanics.push(m.id);
      }
      if (!cb.checked) {
        state.tickedMechanics = state.tickedMechanics.filter(x => x !== m.id);
      }
      saveState();
    });
    label.appendChild(cb);

    const icon = document.createElement('span');
    icon.className = 'mechanic-icon';
    icon.textContent = m.icon;
    label.appendChild(icon);

    const name = document.createElement('span');
    name.className = 'mechanic-name';
    name.textContent = m.name;
    label.appendChild(name);

    const summary = document.createElement('span');
    summary.className = 'mechanic-summary';
    summary.textContent = m.summary;
    label.appendChild(summary);

    const fitLabel = document.createElement('span');
    fitLabel.className = 'mechanic-fit-label fit-' + fit;
    fitLabel.textContent = fit;
    label.appendChild(fitLabel);

    // Expand toggle
    const expandBtn = document.createElement('button');
    expandBtn.type = 'button';
    expandBtn.className = 'mechanic-expand';
    expandBtn.setAttribute('aria-label', 'Show details');
    expandBtn.textContent = '▾';
    label.appendChild(expandBtn);

    wrap.appendChild(label);

    // Expandable details panel
    if (m.details) {
      const panel = document.createElement('div');
      panel.className = 'mechanic-details';

      const plain = document.createElement('p');
      plain.className = 'mechanic-details__plain';
      plain.textContent = m.details.plain;
      panel.appendChild(plain);

      if (m.details.when_use) {
        const whenUse = document.createElement('div');
        whenUse.className = 'mechanic-details__row';
        const useLabel = document.createElement('span');
        useLabel.className = 'mechanic-details__label use';
        useLabel.textContent = 'Use when';
        whenUse.appendChild(useLabel);
        const useText = document.createElement('span');
        useText.textContent = m.details.when_use;
        whenUse.appendChild(useText);
        panel.appendChild(whenUse);
      }

      if (m.details.when_skip) {
        const whenSkip = document.createElement('div');
        whenSkip.className = 'mechanic-details__row';
        const skipLabel = document.createElement('span');
        skipLabel.className = 'mechanic-details__label skip';
        skipLabel.textContent = 'Skip when';
        whenSkip.appendChild(skipLabel);
        const skipText = document.createElement('span');
        skipText.textContent = m.details.when_skip;
        whenSkip.appendChild(skipText);
        panel.appendChild(whenSkip);
      }

      if (m.past_uses && m.past_uses.length) {
        const uses = document.createElement('div');
        uses.className = 'mechanic-details__row mechanic-details__uses';
        const usesLabel = document.createElement('span');
        usesLabel.className = 'mechanic-details__label';
        usesLabel.textContent = 'Used in';
        uses.appendChild(usesLabel);
        m.past_uses.forEach(slug => {
          const chip = document.createElement('span');
          chip.className = 'example-chip';
          chip.textContent = slug;
          uses.appendChild(chip);
        });
        panel.appendChild(uses);
      }

      wrap.appendChild(panel);

      // Toggle — clicking expand button (or header outside checkbox) opens the panel
      expandBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        wrap.classList.toggle('expanded');
      });
    }

    return wrap;
  }

  async function renderArchetypeDetail(archetypeId) {
    const archetype = archetypes.find(a => a.id === archetypeId);
    const archExamples = examples.filter(e => e.archetype === archetypeId);
    const root = document.getElementById('archetype-detail');
    root.replaceChildren();

    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'btn-back';
    backBtn.textContent = '← back to recommendations';
    backBtn.addEventListener('click', () => goToStage(3));
    root.appendChild(backBtn);

    const h2 = document.createElement('h2');
    h2.textContent = archetype.name;
    root.appendChild(h2);

    const lead = document.createElement('p');
    lead.className = 'lead';
    lead.textContent = archetype.description;
    root.appendChild(lead);

    // Past examples
    const examplesHeader = document.createElement('h3');
    examplesHeader.textContent = 'Past examples';
    root.appendChild(examplesHeader);
    const examplesGrid = document.createElement('div');
    examplesGrid.className = 'examples-grid';
    archExamples.forEach(e => examplesGrid.appendChild(buildExampleCard(e)));
    root.appendChild(examplesGrid);

    // Mechanic menu
    const mechHeader = document.createElement('h3');
    mechHeader.textContent = 'Mechanics';
    root.appendChild(mechHeader);

    const menu = document.createElement('div');
    menu.className = 'mechanic-menu';
    mechanics.forEach(m => menu.appendChild(buildMechanicItem(m, archetypeId)));
    root.appendChild(menu);

    const showAllLabel = document.createElement('label');
    showAllLabel.className = 'show-all-mechanics';
    const showAllCb = document.createElement('input');
    showAllCb.type = 'checkbox';
    showAllCb.id = 'show-all-mechanics';
    showAllCb.addEventListener('change', e => {
      document.querySelectorAll('.mechanic-fit-rare').forEach(el => {
        el.style.display = e.target.checked ? 'block' : 'none';
      });
    });
    showAllLabel.appendChild(showAllCb);
    showAllLabel.appendChild(document.createTextNode(' Show all mechanics (including rare)'));
    root.appendChild(showAllLabel);

    // Pitfalls strip
    const pitfallsHeader = document.createElement('h3');
    pitfallsHeader.textContent = '⚠ Pitfalls to avoid';
    pitfallsHeader.style.marginTop = '32px';
    root.appendChild(pitfallsHeader);
    const strip = document.createElement('div');
    strip.className = 'pitfalls-strip';
    strip.id = 'pitfalls-strip-stage4';
    root.appendChild(strip);

    // Assemble button
    const assembleBtn = document.createElement('button');
    assembleBtn.className = 'btn-primary';
    assembleBtn.textContent = 'Assemble my prompt →';
    assembleBtn.style.marginTop = '20px';
    assembleBtn.addEventListener('click', () => {
      goToStage(5);
      window.assemble.render(archetype, state, mechanics);
    });
    root.appendChild(assembleBtn);

    saveState();
    loadPitfallsStrip(archetypeId);
  }

  async function loadPitfallsStrip(archetypeId) {
    try {
      const resp = await fetch('archetypes/' + archetypeId + '/pitfalls.md');
      const text = await resp.text();
      const yamlMatch = text.match(/```yaml\n([\s\S]*?)\n```/);
      if (!yamlMatch) return;
      const entries = window.yamlMini.parse(yamlMatch[1]);
      const top = entries
        .filter(p => p.severity === 'critical' || p.severity === 'high')
        .slice(0, 4);

      const strip = document.getElementById('pitfalls-strip-stage4');
      if (!strip) return;
      strip.replaceChildren();
      top.forEach(p => {
        const card = document.createElement('div');
        card.className = 'pitfall-card-mini severity-' + p.severity;

        const sev = document.createElement('span');
        sev.className = 'severity-badge severity-' + p.severity;
        sev.textContent = '⚠ ' + p.severity.toUpperCase();
        card.appendChild(sev);

        const h4 = document.createElement('h4');
        h4.textContent = p.title;
        card.appendChild(h4);

        const pEl = document.createElement('p');
        pEl.textContent = p.story;
        card.appendChild(pEl);

        strip.appendChild(card);
      });
    } catch (e) {
      console.error('Pitfalls strip load failed:', e);
    }
  }

  // ── Teaching mode ─────────────────────────────────────────
  function wireTeachingMode() {
    const toggle = document.getElementById('teaching-toggle');
    toggle.checked = state.teachingMode;
    document.body.classList.toggle('teaching-mode', state.teachingMode);
    toggle.addEventListener('change', () => {
      state.teachingMode = toggle.checked;
      document.body.classList.toggle('teaching-mode', state.teachingMode);
      saveState();
    });
  }

  // ── Hamburger ─────────────────────────────────────────────
  function wireHamburger() {
    const hb = document.getElementById('hamburger');
    const menu = document.getElementById('mobile-menu');
    if (!hb || !menu) return;
    hb.addEventListener('click', () => {
      hb.classList.toggle('open');
      menu.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hb.classList.remove('open');
        menu.classList.remove('open');
      });
    });
  }

  // ── Toast ─────────────────────────────────────────────────
  function toast(msg, duration = 2200) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), duration);
  }
  window.toast = toast;

  // ── Init ──────────────────────────────────────────────────
  async function init() {
    loadState();
    await loadData();
    wireStage1();
    wireTeachingMode();
    wireHamburger();

    // Expose for other modules
    window.main = {
      state,
      saveState,
      goToStage,
      renderRecommendations,
      renderArchetypeDetail,
      archetypes,
      mechanics,
      examples
    };

    // Resume at last stage if user returns
    if (state.currentStage > 1) goToStage(state.currentStage);
    if (state.currentStage === 3) renderRecommendations();
    if (state.currentStage === 4 && state.chosenArchetype) {
      renderArchetypeDetail(state.chosenArchetype);
    }
    if (state.currentStage === 5 && state.chosenArchetype) {
      const archetype = archetypes.find(a => a.id === state.chosenArchetype);
      if (archetype) window.assemble.render(archetype, state, mechanics);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
