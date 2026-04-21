// ── dt-site-creator ── assembly.js ────────────────────────────
// The Prompt Assembly page.
// Reads selections stored in localStorage (set from index.html's Select buttons),
// renders the selected archetype + mechanics, composes the final prompt + CONTEXT.md.
// Shared state key: 'dtsite:assembly:v1' { archetypeId, mechanicIds, projectDescription }

(function() {
  'use strict';

  const STATE_KEY = 'dtsite:assembly:v1';
  const ARCHETYPE_IDS = [
    'static-informational',
    'transactional',
    'simulator-educational',
    'game',
    'dashboard-analytics'
  ];

  const state = {
    archetypeId: null,
    mechanicIds: [],
    projectDescription: ''
  };

  let archetypes = null;
  let mechanics = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) Object.assign(state, JSON.parse(raw));
    } catch (e) { /* ignore */ }
    // URL params override localStorage (so shared URLs work cold)
    applyUrlParams();
    if (!Array.isArray(state.mechanicIds)) state.mechanicIds = [];
    if (typeof state.projectDescription !== 'string') state.projectDescription = '';
  }
  function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    syncUrlToState();
  }

  // ── URL param sync (shareable URLs) ───────────────────────
  //   ?a=<archetypeId>&m=<id1>,<id2>,...&p=<url-encoded-description>
  function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const a = params.get('a');
    const m = params.get('m');
    const p = params.get('p');
    let changed = false;
    if (a !== null) { state.archetypeId = a || null; changed = true; }
    if (m !== null) {
      state.mechanicIds = m ? m.split(',').filter(Boolean) : [];
      changed = true;
    }
    if (p !== null) { state.projectDescription = p; changed = true; }
    if (changed) {
      try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) {}
    }
  }
  function syncUrlToState() {
    const params = new URLSearchParams();
    if (state.archetypeId) params.set('a', state.archetypeId);
    if (state.mechanicIds && state.mechanicIds.length) params.set('m', state.mechanicIds.join(','));
    if (state.projectDescription) params.set('p', state.projectDescription);
    const qs = params.toString();
    const url = window.location.pathname + (qs ? '?' + qs : '');
    window.history.replaceState(null, '', url);
  }
  function buildShareUrl() {
    const params = new URLSearchParams();
    if (state.archetypeId) params.set('a', state.archetypeId);
    if (state.mechanicIds && state.mechanicIds.length) params.set('m', state.mechanicIds.join(','));
    if (state.projectDescription) params.set('p', state.projectDescription);
    return window.location.origin + window.location.pathname + '?' + params.toString();
  }

  async function loadData() {
    const [a, m] = await Promise.all([
      fetch('dashboard/data/archetypes.json').then(r => r.json()).then(d => d.archetypes),
      fetch('dashboard/data/mechanics.json').then(r => r.json()).then(d => d.mechanics)
    ]);
    archetypes = a; mechanics = m;
  }

  // ── Utility ───────────────────────────────────────────────
  function toast(msg, duration = 2200) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), duration);
  }
  window.toast = toast;

  function copyToClipboard(text, successMsg) {
    navigator.clipboard.writeText(text)
      .then(() => toast(successMsg))
      .catch(() => toast('Copy failed — select text + Cmd+C'));
  }

  async function fetchText(path) {
    try {
      const resp = await fetch(path);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return await resp.text();
    } catch (err) {
      console.error('fetchText failed:', path, err);
      return '';
    }
  }

  function extractPromptBody(text) {
    const parts = text.split(/^---\s*$/m);
    return (parts[parts.length - 1] || '').trim() || text.trim();
  }

  function deriveProjectSlug(desc) {
    return (desc || 'your-project').toLowerCase().split(/\s+/).slice(0, 4).join('-').replace(/[^a-z0-9-]/g, '') || 'your-project';
  }

  // ── Rendering ─────────────────────────────────────────────
  function renderSelectedArchetype() {
    const slot = document.getElementById('selected-archetype');
    slot.replaceChildren();

    if (!state.archetypeId) {
      const empty = document.createElement('div');
      empty.className = 'assembly-empty';
      const p = document.createElement('p');
      p.textContent = 'No archetype selected yet.';
      empty.appendChild(p);
      const link = document.createElement('a');
      link.href = 'index.html';
      link.className = 'btn-primary btn-sm';
      link.textContent = 'Pick an archetype →';
      empty.appendChild(link);
      slot.appendChild(empty);
      return;
    }

    const arch = archetypes.find(a => a.id === state.archetypeId);
    if (!arch) {
      state.archetypeId = null; saveState();
      renderSelectedArchetype();
      return;
    }

    const card = document.createElement('div');
    card.className = 'assembly-pick-card';

    const swatch = document.createElement('span');
    swatch.className = 'browse-card__swatch';
    swatch.style.background = arch.color_hint || '#ffa657';
    card.appendChild(swatch);

    const info = document.createElement('div');
    info.className = 'assembly-pick-info';
    const h3 = document.createElement('h3');
    h3.textContent = arch.name;
    info.appendChild(h3);
    const desc = document.createElement('p');
    desc.textContent = arch.tagline || arch.description;
    info.appendChild(desc);
    card.appendChild(info);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-outline btn-sm';
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      state.archetypeId = null; saveState(); rerender();
    });
    card.appendChild(removeBtn);

    slot.appendChild(card);
  }

  function renderSelectedMechanics() {
    const slot = document.getElementById('selected-mechanics');
    slot.replaceChildren();

    if (!state.mechanicIds.length) {
      const empty = document.createElement('div');
      empty.className = 'assembly-empty';
      const p = document.createElement('p');
      p.textContent = 'No mechanics selected yet (optional).';
      empty.appendChild(p);
      const link = document.createElement('a');
      link.href = 'mechanics.html';
      link.className = 'btn-outline btn-sm';
      link.textContent = 'Browse mechanics →';
      empty.appendChild(link);
      slot.appendChild(empty);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'assembly-mechanic-grid';

    state.mechanicIds.forEach(mid => {
      const m = mechanics.find(x => x.id === mid);
      if (!m) return;

      const chip = document.createElement('div');
      chip.className = 'assembly-mechanic-chip';

      const icon = document.createElement('span');
      icon.className = 'assembly-mechanic-chip__icon';
      icon.textContent = m.icon || '🧩';
      chip.appendChild(icon);

      const name = document.createElement('span');
      name.className = 'assembly-mechanic-chip__name';
      name.textContent = m.name;
      chip.appendChild(name);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'assembly-mechanic-chip__remove';
      remove.setAttribute('aria-label', 'Remove ' + m.name);
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        state.mechanicIds = state.mechanicIds.filter(x => x !== mid);
        saveState(); rerender();
      });
      chip.appendChild(remove);

      grid.appendChild(chip);
    });

    slot.appendChild(grid);
  }

  // Strip dt-site-creator internal references that leak repo structure.
  // Users outside the repo shouldn't see things like "archetypes/X/CLAUDE.md".
  function sanitizeInternal(text) {
    if (!text) return '';
    return text
      // Remove explicit archetype file-path references (self-referential when inlined)
      .replace(/archetypes\/[a-z-]+\/CLAUDE\.md/gi, 'the rules above')
      .replace(/archetypes\/[a-z-]+\//gi, '')
      .replace(/mechanics\/[a-z-]+\//gi, '')
      // Neutralize GitHub username references
      .replace(/derrick-pixel\//gi, 'your-github-username/')
      .replace(/under `derrick-pixel`/gi, 'under your GitHub account')
      // Strip "sibling folders" language that doesn't make sense without repo
      .replace(/For other archetypes, see sibling folders in[^.]*\./gi, '')
      // Remove internal meta headers
      .replace(/^# DT Site Creator — .+ Archetype Playbook\s*/gm, '')
      .replace(/^This is the canonical playbook for the[^.]+\.\s*/gm, '')
      .replace(/^You are \*\*dt-site-creator\*\*[^.]+\.\s*This is not a suggestion[^.]+\.\s*/gm, '')
      // Tidy multiple blank lines
      .replace(/\n{4,}/g, '\n\n\n')
      .trim();
  }

  async function renderAssembledPrompt() {
    const promptEl = document.getElementById('assembled-prompt');
    const contextEl = document.getElementById('context-pack');

    if (!state.archetypeId) {
      promptEl.textContent = 'Pick an archetype to generate the prompt…';
      contextEl.textContent = '—';
      return;
    }

    const arch = archetypes.find(a => a.id === state.archetypeId);
    if (!arch) return;

    // Fetch EVERYTHING we need to inline into a self-contained prompt
    const [claudeMdRaw, pitfalls] = await Promise.all([
      fetchText(arch.path + 'CLAUDE.md'),
      fetchFullPitfalls(arch.id)
    ]);
    const designRules = sanitizeInternal(claudeMdRaw);

    const tickedMechs = mechanics.filter(m => state.mechanicIds.includes(m.id));
    const mechanicSnippets = await Promise.all(
      tickedMechs.map(async m => ({
        meta: m,
        snippet: await fetchText('mechanics/' + m.id + '/snippet.html')
      }))
    );

    const projectText = state.projectDescription || '(describe your project here — one sentence is enough)';

    // ── Compose the fully self-contained prompt ──────────────
    let prompt = 'You are helping me build a ' + arch.name.toLowerCase() + ' website. Read everything below, then ask me any clarifying questions before you start writing code.\n\n';

    prompt += '# The project\n\n' + projectText + '\n\n';

    if (designRules) {
      prompt += '# Design rules (follow exactly)\n\n' + designRules + '\n\n';
    }

    if (mechanicSnippets.length) {
      prompt += '# Building blocks to implement\n\n';
      prompt += 'Include each of these mechanics. For each I have pasted the exact code snippet — drop it into the relevant page, adapt the copy and branding, but keep the core logic intact.\n\n';
      mechanicSnippets.forEach((item, i) => {
        prompt += '## ' + (i + 1) + '. ' + item.meta.name + '\n\n';
        prompt += item.meta.summary + '\n\n';
        if (item.meta.details && item.meta.details.plain) {
          prompt += item.meta.details.plain + '\n\n';
        }
        if (item.snippet) {
          prompt += 'Paste this code block:\n\n';
          prompt += '```html\n' + item.snippet.trim() + '\n```\n\n';
        }
      });
    }

    if (pitfalls.length) {
      prompt += '# Pitfalls to avoid (critical + high severity)\n\n';
      prompt += 'These are real failures seen in past projects. Actively steer around them.\n\n';
      pitfalls.forEach((p, i) => {
        prompt += '## ' + (i + 1) + '. ' + (p.title || p.id) + '  [' + (p.severity || '').toUpperCase() + ']\n\n';
        if (p.story) prompt += p.story + '\n\n';
        if (p.fix) prompt += '**Fix:**\n' + p.fix + '\n\n';
        if (p.lesson) prompt += '**Lesson:** ' + p.lesson + '\n\n';
      });
    }

    prompt += '# Process\n\n';
    prompt += '1. Create a new GitHub repo and push your first commit within 5 minutes.\n';
    prompt += '2. Research at least 30 comparable sites in this domain. Analyze layout, design, features, CTAs, mobile UX. Produce a /admin.html page with your competitor analysis and a /admin-insights.html with pricing + personas.\n';
    prompt += '3. Propose 5 distinct color palettes in a /colors.html page for my review. Do not pick one — wait for my input.\n';
    prompt += '4. After I pick a palette, build the main site following the design rules above.\n';
    prompt += '5. Generate a 1200×630 OG image (WhatsApp-shareable preview).\n';
    prompt += '6. Add a favicon set (browser tab, iOS/Android home screens).\n';
    prompt += '7. Commit and push every meaningful iteration.\n\n';

    prompt += '# Before you start\n\n';
    prompt += 'Ask me any questions you have about: the target audience, the desired tone, specific constraints, or trade-offs. It is fine to push back on anything in this spec if you have a concrete better idea.\n';

    promptEl.textContent = prompt;

    // ── Context pack (smaller, for CONTEXT.md in the new repo) ──
    const projectName = deriveProjectSlug(state.projectDescription);
    const mechanicText = tickedMechs.length
      ? tickedMechs.map(m => '- ' + m.name).join('\n')
      : '- (none selected)';
    const topPitfallsSummary = pitfalls.slice(0, 5).map(p => '⚠ ' + (p.title || p.id) + ' — ' + (p.story || '').split('\n')[0]).join('\n');

    const contextPack =
      '# CONTEXT.md — ' + projectName + '\n\n' +
      '**Archetype:** ' + arch.name + '\n' +
      '**Tagline:** ' + (arch.tagline || '') + '\n\n' +
      '**What we\'re building:**\n' + (state.projectDescription || '(not yet described)') + '\n\n' +
      '**Mechanics selected:**\n' + mechanicText + '\n\n' +
      '**Top pitfalls to watch:**\n' + (topPitfallsSummary || '(none)') + '\n';

    contextEl.textContent = contextPack;
  }

  // Returns structured pitfall objects (not a pre-formatted string) so the
  // prompt assembler can inline title + story + fix + lesson individually.
  async function fetchFullPitfalls(archetypeId) {
    try {
      const resp = await fetch('archetypes/' + archetypeId + '/pitfalls.md');
      if (!resp.ok) return [];
      const text = await resp.text();
      const yamlMatch = text.match(/```yaml\n([\s\S]*?)\n```/);
      if (!yamlMatch) return [];
      const entries = parseSimpleYaml(yamlMatch[1]);
      return entries
        .filter(e => e.severity === 'critical' || e.severity === 'high')
        .slice(0, 6);
    } catch (e) { return []; }
  }

  // Same shape as yaml-mini.js (kept inline so assembly.js has zero JS deps)
  function parseSimpleYaml(text) {
    const entries = [];
    let current = null;
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('- id:')) {
        if (current) entries.push(current);
        current = { id: line.split(':', 2)[1].trim() };
      } else if (current && line.match(/^\s+\w+:/)) {
        const m = line.match(/^\s+(\w+):\s*(.*)$/);
        if (m) {
          let val = m[2].trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          } else if (val === 'null') { val = null; }
          else if (val === '|') {
            val = '';
            while (i + 1 < lines.length && lines[i + 1].match(/^\s{4,}/)) {
              i++;
              val += lines[i].replace(/^\s{4}/, '') + '\n';
            }
            val = val.trimEnd();
          }
          current[m[1]] = val;
        }
      }
    }
    if (current) entries.push(current);
    return entries;
  }

  // ── Re-render everything on state change ──────────────────
  async function rerender() {
    renderSelectedArchetype();
    renderSelectedMechanics();
    await renderAssembledPrompt();
  }

  // ── Wire inputs ───────────────────────────────────────────
  function wireProjectDescription() {
    const ta = document.getElementById('project-description');
    ta.value = state.projectDescription || '';
    let debounce = null;
    ta.addEventListener('input', (e) => {
      state.projectDescription = e.target.value;
      saveState();
      clearTimeout(debounce);
      debounce = setTimeout(rerender, 250);
    });
  }

  function wireButtons() {
    document.getElementById('btn-copy-prompt').addEventListener('click', () => {
      const text = document.getElementById('assembled-prompt').textContent;
      if (!text || text.startsWith('Pick an archetype')) {
        toast('Pick an archetype first.');
        return;
      }
      copyToClipboard(text, 'Prompt copied ✓');
    });

    document.getElementById('btn-copy-context').addEventListener('click', () => {
      const text = document.getElementById('context-pack').textContent;
      if (!text || text === '—') {
        toast('No context pack to copy yet.');
        return;
      }
      copyToClipboard(text, 'Context pack copied ✓');
    });

    document.getElementById('btn-clear-selection').addEventListener('click', () => {
      if (!confirm('Clear all selections (archetype, mechanics, project description)?')) return;
      state.archetypeId = null;
      state.mechanicIds = [];
      state.projectDescription = '';
      saveState();
      document.getElementById('project-description').value = '';
      rerender();
      toast('Selection cleared');
    });

    const shareBtn = document.getElementById('btn-share-assembly');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        if (!state.archetypeId && !state.mechanicIds.length) {
          toast('Nothing to share — pick an archetype first.');
          return;
        }
        const url = buildShareUrl();
        copyToClipboard(url, '🔗 Share URL copied — paste anywhere to hand off this exact assembly.');
      });
    }
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

  // React to changes made on other tabs (index.html Select buttons)
  function wireStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === STATE_KEY) {
        loadState();
        rerender();
      }
    });
  }

  // ── Init ──────────────────────────────────────────────────
  async function init() {
    wireHamburger();
    loadState();

    try {
      await loadData();
    } catch (err) {
      console.error('Assembly: data load failed', err);
      toast('Failed to load data. Run `python3 -m http.server 8000` if opening via file://');
      return;
    }

    wireProjectDescription();
    wireButtons();
    wireStorageListener();
    await rerender();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
