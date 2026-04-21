// ── dt-site-creator ── browse.js ──────────────────────────────
// Flat directory view: render all archetypes + all mechanics as
// expandable cards with "Copy" buttons. Zero state, zero wizard.
// Safe DOM only (createElement / textContent / appendChild).

(function() {
  'use strict';

  const ARCHETYPE_IDS = [
    'static-informational',
    'transactional',
    'simulator-educational',
    'game',
    'dashboard-analytics'
  ];

  // ── Assembly selection state (shared with assembly.html via localStorage) ──
  const ASSEMBLY_KEY = 'dtsite:assembly:v1';
  const assembly = {
    archetypeId: null,
    mechanicIds: [],
    projectDescription: ''
  };

  function loadAssembly() {
    try {
      const raw = localStorage.getItem(ASSEMBLY_KEY);
      if (raw) Object.assign(assembly, JSON.parse(raw));
    } catch (e) { /* ignore */ }
    if (!Array.isArray(assembly.mechanicIds)) assembly.mechanicIds = [];
  }
  function saveAssembly() {
    localStorage.setItem(ASSEMBLY_KEY, JSON.stringify(assembly));
  }

  function selectArchetype(id) {
    assembly.archetypeId = (assembly.archetypeId === id) ? null : id;
    saveAssembly();
    refreshSelectionStates();
    updateAssemblyPill();
  }

  function toggleMechanic(id) {
    if (assembly.mechanicIds.includes(id)) {
      assembly.mechanicIds = assembly.mechanicIds.filter(x => x !== id);
    } else {
      assembly.mechanicIds.push(id);
    }
    saveAssembly();
    refreshSelectionStates();
    updateAssemblyPill();
  }

  async function loadData() {
    const [archetypes, mechanics, examples] = await Promise.all([
      fetch('dashboard/data/archetypes.json').then(r => r.json()).then(d => d.archetypes),
      fetch('dashboard/data/mechanics.json').then(r => r.json()).then(d => d.mechanics),
      fetch('dashboard/data/examples.json').then(r => r.json()).then(d => d.examples)
    ]);
    return { archetypes, mechanics, examples };
  }

  // ── Built-with gallery ─────────────────────────────────────
  function buildGalleryCard(example, archetypes) {
    const arch = archetypes.find(a => a.id === example.archetype);
    const status = (example.status || 'wip').toLowerCase();
    const card = document.createElement('article');
    card.className = 'gallery-card gallery-card--' + status;

    // Corner ribbon showing status
    const ribbon = document.createElement('span');
    ribbon.className = 'gallery-card__ribbon ribbon-' + status;
    ribbon.textContent = status === 'live' ? 'LIVE' : (status === 'preview' ? 'PREVIEW' : 'WIP');
    card.appendChild(ribbon);

    if (example.screenshot) {
      const img = document.createElement('img');
      img.className = 'gallery-card__img';
      img.src = example.screenshot;
      img.alt = example.name;
      img.loading = 'lazy';
      img.addEventListener('error', () => { img.style.display = 'none'; });
      card.appendChild(img);
    }

    const body = document.createElement('div');
    body.className = 'gallery-card__body';

    const tag = document.createElement('span');
    tag.className = 'gallery-card__archetype';
    if (arch && arch.color_hint) tag.style.color = arch.color_hint;
    tag.textContent = arch ? arch.name : example.archetype;
    body.appendChild(tag);

    const title = document.createElement('h3');
    title.className = 'gallery-card__title';
    title.textContent = example.name;
    body.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'gallery-card__desc';
    desc.textContent = example.why_it_matches;
    body.appendChild(desc);

    if (example.mechanics && example.mechanics.length) {
      const mechRow = document.createElement('div');
      mechRow.className = 'gallery-card__mechanics';
      example.mechanics.slice(0, 4).forEach(mid => {
        const chip = document.createElement('span');
        chip.className = 'example-chip';
        chip.textContent = mid;
        mechRow.appendChild(chip);
      });
      body.appendChild(mechRow);
    }

    // Status-driven action (status was declared at the top of this function):
    //   live    → "Live site →" button to live_url
    //   preview → "Preview on derrickteo.com →" button to preview_url
    //   wip     → "🚧 Work in progress" badge, no link
    const actions = document.createElement('div');
    actions.className = 'gallery-card__actions';

    if (status === 'live' && example.live_url) {
      const live = document.createElement('a');
      live.href = example.live_url;
      live.target = '_blank';
      live.rel = 'noopener';
      live.className = 'btn-primary btn-sm';
      live.textContent = 'Live site →';
      actions.appendChild(live);
    } else if (status === 'preview' && example.preview_url) {
      const preview = document.createElement('a');
      preview.href = example.preview_url;
      preview.target = '_blank';
      preview.rel = 'noopener';
      preview.className = 'btn-primary btn-sm';
      preview.textContent = 'Preview on derrickteo.com →';
      actions.appendChild(preview);
    } else {
      const wip = document.createElement('span');
      wip.className = 'gallery-card__wip';
      wip.textContent = '🚧 Work in progress';
      actions.appendChild(wip);
    }
    body.appendChild(actions);

    card.appendChild(body);
    return card;
  }

  function renderGallery(examples, archetypes) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    // Show every example with an id. Status drives whether link is clickable.
    // Sort order: live first, preview second, wip last.
    const order = { live: 0, preview: 1, wip: 2 };
    const valid = examples
      .filter(e => e && e.id)
      .sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));
    grid.replaceChildren();
    valid.forEach(e => grid.appendChild(buildGalleryCard(e, archetypes)));
  }

  // ── Toast ──────────────────────────────────────────────────
  function toast(msg, duration = 2200) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), duration);
  }

  function copyToClipboard(text, successMsg) {
    navigator.clipboard.writeText(text)
      .then(() => toast(successMsg))
      .catch(() => toast('Copy failed — select text + Cmd+C'));
  }

  // ── Hamburger ──────────────────────────────────────────────
  function wireHamburger() {
    const hb = document.getElementById('hamburger');
    const menu = document.getElementById('mobile-menu');
    if (!hb || !menu) return;
    hb.addEventListener('click', () => {
      hb.classList.toggle('open');
      menu.classList.toggle('open');
    });
  }

  // ── Fetch raw file content (prompt.md / snippet.html / README.md) ──
  async function fetchText(path) {
    try {
      const resp = await fetch(path);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return await resp.text();
    } catch (err) {
      return '(Failed to load ' + path + ' — ' + err.message + ')';
    }
  }

  // Extract body after "---" horizontal rule (used for prompt.md)
  function extractPromptBody(text) {
    const parts = text.split(/^---\s*$/m);
    return (parts[parts.length - 1] || '').trim() || text.trim();
  }

  // ── Archetype card ─────────────────────────────────────────
  function buildArchetypeCard(archetype) {
    const card = document.createElement('article');
    card.className = 'browse-card archetype-browse-card';
    card.dataset.archetypeId = archetype.id;

    // Header
    const header = document.createElement('header');
    header.className = 'browse-card__header';

    const titleGroup = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.className = 'browse-card__title';
    h3.textContent = archetype.name;
    titleGroup.appendChild(h3);

    const tagline = document.createElement('p');
    tagline.className = 'browse-card__tagline';
    tagline.textContent = archetype.tagline || archetype.description;
    titleGroup.appendChild(tagline);

    header.appendChild(titleGroup);

    // Accent swatch
    const swatch = document.createElement('span');
    swatch.className = 'browse-card__swatch';
    swatch.style.background = archetype.color_hint || '#ffa657';
    header.appendChild(swatch);

    card.appendChild(header);

    // Past examples
    if (archetype.past_examples && archetype.past_examples.length) {
      const chipRow = document.createElement('div');
      chipRow.className = 'browse-card__chips';
      const label = document.createElement('span');
      label.className = 'browse-card__chips-label';
      label.textContent = 'Past projects';
      chipRow.appendChild(label);
      archetype.past_examples.forEach(slug => {
        const chip = document.createElement('span');
        chip.className = 'example-chip';
        chip.textContent = slug;
        chipRow.appendChild(chip);
      });
      card.appendChild(chipRow);
    }

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'browse-card__actions';

    // Select for assembly
    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.className = 'btn-select';
    selectBtn.dataset.kind = 'archetype';
    selectBtn.dataset.id = archetype.id;
    selectBtn.addEventListener('click', () => selectArchetype(archetype.id));
    actions.appendChild(selectBtn);

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn-outline btn-sm';
    toggleBtn.type = 'button';
    toggleBtn.textContent = 'Show prompt ▾';
    actions.appendChild(toggleBtn);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-outline btn-sm';
    copyBtn.type = 'button';
    copyBtn.textContent = '📋 Copy prompt';
    actions.appendChild(copyBtn);

    const repoLink = document.createElement('a');
    repoLink.className = 'browse-card__link';
    repoLink.href = archetype.path + 'CLAUDE.md';
    repoLink.textContent = 'View playbook →';
    repoLink.addEventListener('click', (ev) => {
      ev.preventDefault();
      openDocModal({
        title: archetype.name + ' — Playbook',
        path: archetype.path + 'CLAUDE.md'
      });
    });
    actions.appendChild(repoLink);

    card.appendChild(actions);

    // Expandable content
    const details = document.createElement('div');
    details.className = 'browse-card__details';
    const pre = document.createElement('pre');
    pre.className = 'browse-card__code';
    pre.textContent = 'Loading prompt…';
    details.appendChild(pre);
    card.appendChild(details);

    let loaded = false;
    let promptBody = '';

    async function loadPromptOnce() {
      if (loaded) return promptBody;
      const raw = await fetchText(archetype.path + 'prompt.md');
      promptBody = extractPromptBody(raw);
      pre.textContent = promptBody;
      loaded = true;
      return promptBody;
    }

    toggleBtn.addEventListener('click', async () => {
      await loadPromptOnce();
      card.classList.toggle('expanded');
      toggleBtn.textContent = card.classList.contains('expanded') ? 'Hide prompt ▴' : 'Show prompt ▾';
    });

    copyBtn.addEventListener('click', async () => {
      const body = await loadPromptOnce();
      copyToClipboard(body, 'Copied prompt for ' + archetype.name + ' ✓');
    });

    return card;
  }

  // ── Mechanic card ──────────────────────────────────────────
  function buildMechanicCard(mechanic) {
    const card = document.createElement('article');
    card.className = 'browse-card mechanic-browse-card';
    card.dataset.mechanicId = mechanic.id;

    // Header (icon + name + summary)
    const header = document.createElement('header');
    header.className = 'browse-card__header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'browse-card__title-group';

    const h3 = document.createElement('h3');
    h3.className = 'browse-card__title';
    const iconSpan = document.createElement('span');
    iconSpan.className = 'browse-card__icon';
    iconSpan.textContent = mechanic.icon || '🧩';
    h3.appendChild(iconSpan);
    h3.appendChild(document.createTextNode(' ' + mechanic.name));
    titleGroup.appendChild(h3);

    const summary = document.createElement('p');
    summary.className = 'browse-card__tagline';
    summary.textContent = mechanic.summary;
    titleGroup.appendChild(summary);

    header.appendChild(titleGroup);

    card.appendChild(header);

    // Plain-English + when-use/when-skip
    if (mechanic.details) {
      const d = mechanic.details;
      if (d.plain) {
        const plain = document.createElement('p');
        plain.className = 'mechanic-browse__plain';
        plain.textContent = d.plain;
        card.appendChild(plain);
      }
      const grid = document.createElement('div');
      grid.className = 'mechanic-browse__detail-grid';
      if (d.when_use) {
        grid.appendChild(buildWhenRow('Use when', 'use', d.when_use));
      }
      if (d.when_skip) {
        grid.appendChild(buildWhenRow('Skip when', 'skip', d.when_skip));
      }
      if (grid.childElementCount) card.appendChild(grid);
    }

    // Fit matrix
    if (mechanic.fits) {
      const fitRow = document.createElement('div');
      fitRow.className = 'mechanic-browse__fits';
      const label = document.createElement('span');
      label.className = 'browse-card__chips-label';
      label.textContent = 'Fit per archetype';
      fitRow.appendChild(label);
      ARCHETYPE_IDS.forEach(aid => {
        const fit = mechanic.fits[aid] || 'rare';
        const chip = document.createElement('span');
        chip.className = 'mechanic-browse__fit-chip fit-' + fit;
        const fitName = document.createElement('span');
        fitName.className = 'mechanic-browse__fit-name';
        fitName.textContent = shortArchetype(aid);
        chip.appendChild(fitName);
        chip.appendChild(document.createTextNode(' · '));
        const fitLabel = document.createElement('span');
        fitLabel.className = 'mechanic-browse__fit-label';
        fitLabel.textContent = fit;
        chip.appendChild(fitLabel);
        fitRow.appendChild(chip);
      });
      card.appendChild(fitRow);
    }

    // Past uses
    if (mechanic.past_uses && mechanic.past_uses.length) {
      const chipRow = document.createElement('div');
      chipRow.className = 'browse-card__chips';
      const label = document.createElement('span');
      label.className = 'browse-card__chips-label';
      label.textContent = 'Used in';
      chipRow.appendChild(label);
      mechanic.past_uses.forEach(slug => {
        const chip = document.createElement('span');
        chip.className = 'example-chip';
        chip.textContent = slug;
        chipRow.appendChild(chip);
      });
      card.appendChild(chipRow);
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'browse-card__actions';

    // Select for assembly
    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.className = 'btn-select';
    selectBtn.dataset.kind = 'mechanic';
    selectBtn.dataset.id = mechanic.id;
    selectBtn.addEventListener('click', () => toggleMechanic(mechanic.id));
    actions.appendChild(selectBtn);

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn-outline btn-sm';
    toggleBtn.type = 'button';
    toggleBtn.textContent = 'Show snippet ▾';
    actions.appendChild(toggleBtn);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-outline btn-sm';
    copyBtn.type = 'button';
    copyBtn.textContent = '📋 Copy snippet';
    actions.appendChild(copyBtn);

    const readmeLink = document.createElement('a');
    readmeLink.className = 'browse-card__link';
    readmeLink.href = 'mechanics/' + mechanic.id + '/README.md';
    readmeLink.textContent = 'Full README →';
    readmeLink.addEventListener('click', (ev) => {
      ev.preventDefault();
      openDocModal({
        title: mechanic.name + ' — README',
        path: 'mechanics/' + mechanic.id + '/README.md'
      });
    });
    actions.appendChild(readmeLink);

    card.appendChild(actions);

    // Expandable snippet
    const details = document.createElement('div');
    details.className = 'browse-card__details';
    const pre = document.createElement('pre');
    pre.className = 'browse-card__code';
    pre.textContent = 'Loading snippet…';
    details.appendChild(pre);
    card.appendChild(details);

    let loaded = false;
    let snippet = '';

    async function loadSnippetOnce() {
      if (loaded) return snippet;
      snippet = await fetchText('mechanics/' + mechanic.id + '/snippet.html');
      pre.textContent = snippet;
      loaded = true;
      return snippet;
    }

    toggleBtn.addEventListener('click', async () => {
      await loadSnippetOnce();
      card.classList.toggle('expanded');
      toggleBtn.textContent = card.classList.contains('expanded') ? 'Hide snippet ▴' : 'Show snippet ▾';
    });

    copyBtn.addEventListener('click', async () => {
      const body = await loadSnippetOnce();
      copyToClipboard(body, 'Copied snippet for ' + mechanic.name + ' ✓');
    });

    return card;
  }

  function buildWhenRow(labelText, variant, body) {
    const row = document.createElement('div');
    row.className = 'mechanic-browse__detail-row';
    const label = document.createElement('span');
    label.className = 'mechanic-details__label ' + variant;
    label.textContent = labelText;
    row.appendChild(label);
    const text = document.createElement('span');
    text.className = 'mechanic-browse__detail-text';
    text.textContent = body;
    row.appendChild(text);
    return row;
  }

  function shortArchetype(id) {
    const map = {
      'static-informational':   'Static',
      'transactional':          'Trans',
      'simulator-educational':  'Sim',
      'game':                   'Game',
      'dashboard-analytics':    'Dash'
    };
    return map[id] || id;
  }

  // ── Doc modal (View playbook / Full README) ────────────────
  async function openDocModal({ title, path }) {
    const modal = document.getElementById('doc-modal');
    const titleEl = document.getElementById('doc-modal-title');
    const bodyEl = document.getElementById('doc-modal-body');
    const copyBtn = document.getElementById('doc-modal-copy');
    const externalLink = document.getElementById('doc-modal-external');

    titleEl.textContent = title;
    externalLink.href = path;
    bodyEl.textContent = 'Loading…';
    modal.classList.add('open');
    document.body.classList.add('no-scroll');

    let rawText = '';
    try {
      const resp = await fetch(path);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      rawText = await resp.text();
    } catch (err) {
      bodyEl.textContent = 'Failed to load ' + path + ' — ' + err.message;
      return;
    }

    // Render markdown to HTML, then sanitize via DOMPurify before injecting.
    if (window.marked && window.DOMPurify) {
      const rawHtml = window.marked.parse(rawText);
      const safeHtml = window.DOMPurify.sanitize(rawHtml, {
        ADD_ATTR: ['target', 'rel']
      });
      bodyEl.innerHTML = safeHtml;
    } else {
      // Fallback — plain text if libraries failed to load
      bodyEl.replaceChildren();
      const pre = document.createElement('pre');
      pre.textContent = rawText;
      bodyEl.appendChild(pre);
    }

    bodyEl.scrollTop = 0;
    copyBtn.onclick = () => copyToClipboard(rawText, 'Copied ' + title + ' ✓');
  }

  function closeDocModal() {
    const modal = document.getElementById('doc-modal');
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  function wireDocModal() {
    const modal = document.getElementById('doc-modal');
    const closeBtn = document.getElementById('doc-modal-close');
    if (!modal || !closeBtn) return;

    closeBtn.addEventListener('click', closeDocModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeDocModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeDocModal();
    });
  }

  // ── Assembly selection UI ──────────────────────────────────
  function refreshSelectionStates() {
    // Update all Select buttons
    document.querySelectorAll('.btn-select').forEach(btn => {
      const kind = btn.dataset.kind;
      const id = btn.dataset.id;
      const selected = (kind === 'archetype' && assembly.archetypeId === id) ||
                       (kind === 'mechanic' && assembly.mechanicIds.includes(id));
      btn.classList.toggle('btn-select--selected', selected);
      if (kind === 'archetype') {
        btn.textContent = selected ? '✓ Selected archetype' : '+ Select archetype';
      } else {
        btn.textContent = selected ? '✓ Added' : '+ Add to bundle';
      }
    });
    // Update card outlines
    document.querySelectorAll('[data-archetype-id]').forEach(card => {
      card.classList.toggle('browse-card--selected', card.dataset.archetypeId === assembly.archetypeId);
    });
    document.querySelectorAll('[data-mechanic-id]').forEach(card => {
      card.classList.toggle('browse-card--selected', assembly.mechanicIds.includes(card.dataset.mechanicId));
    });
  }

  function updateAssemblyPill() {
    const pill = document.getElementById('assembly-pill');
    if (!pill) return;
    const n = (assembly.archetypeId ? 1 : 0) + assembly.mechanicIds.length;
    if (n === 0) {
      pill.classList.remove('show');
      pill.setAttribute('aria-hidden', 'true');
    } else {
      pill.classList.add('show');
      pill.removeAttribute('aria-hidden');
      const counter = pill.querySelector('.assembly-pill__count');
      if (counter) counter.textContent = String(n);
    }
  }

  // React to storage changes from other tabs (assembly page removing items)
  function wireStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === ASSEMBLY_KEY) {
        loadAssembly();
        refreshSelectionStates();
        updateAssemblyPill();
      }
    });
  }

  // ── Init ───────────────────────────────────────────────────
  async function init() {
    wireHamburger();
    wireDocModal();
    loadAssembly();
    wireStorageListener();
    try {
      const { archetypes, mechanics, examples } = await loadData();

      // Each page only has some of these containers — guard accordingly.
      const archetypesList = document.getElementById('archetypes-list');
      if (archetypesList) {
        archetypes.forEach(a => archetypesList.appendChild(buildArchetypeCard(a)));
      }

      const mechanicsList = document.getElementById('mechanics-list');
      if (mechanicsList) {
        mechanics.forEach(m => mechanicsList.appendChild(buildMechanicCard(m)));
      }

      if (document.getElementById('gallery-grid')) {
        renderGallery(examples, archetypes);
      }

      refreshSelectionStates();
      updateAssemblyPill();
    } catch (err) {
      console.error('Load failed:', err);
      const archetypesList = document.getElementById('archetypes-list');
      if (archetypesList) {
        archetypesList.textContent = 'Failed to load data. If you opened index.html via file://, run `python3 -m http.server 8000` first.';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
