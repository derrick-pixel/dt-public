// ── dt-site-creator dashboard ── assemble.js ──────────────────
// Stage 5: assemble the prompt + context pack, wire copy / fresh-samples buttons.
// Depends on: window.yamlMini, window.toast.

(function() {
  'use strict';

  async function render(archetype, state, mechanics) {
    // Load the prompt.md template
    let promptTemplate = '';
    try {
      const resp = await fetch('archetypes/' + archetype.id + '/prompt.md');
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      promptTemplate = await resp.text();
    } catch (err) {
      console.error('Failed to load prompt template:', err);
      document.getElementById('assembled-prompt').textContent =
        '(Failed to load prompt template for "' + archetype.id + '". Check console. ' +
        'If you opened index.html via file://, run `python3 -m http.server 8000` first.)';
      document.getElementById('context-pack').textContent = '';
      return;
    }

    // Extract the prompt body (everything after the "---" horizontal rule)
    const parts = promptTemplate.split(/^---\s*$/m);
    const promptBody = (parts[parts.length - 1] || '').trim();

    if (!promptBody) {
      document.getElementById('assembled-prompt').textContent =
        '(Prompt template for "' + archetype.id + '" is empty or malformed.)';
      document.getElementById('context-pack').textContent = '';
      return;
    }

    const tickedMechs = mechanics.filter(m => state.tickedMechanics.includes(m.id));
    const scopingText = formatScopingAnswers(state.scopingAnswers);
    const mechanicText = tickedMechs.length
      ? tickedMechs.map(m => '- ' + m.name + ' (see /mechanics/' + m.id + '/)').join('\n')
      : '- (none selected)';
    const pitfallsText = await fetchTopPitfalls(archetype.id);

    const assembled = promptBody
      .replace('{{project_description}}', state.projectDescription)
      .replace('{{scoping_answers}}', scopingText)
      .replace('{{ticked_mechanics}}', mechanicText)
      .replace('{{pitfalls_warnings}}', pitfallsText);

    document.getElementById('assembled-prompt').textContent = assembled;

    // Context pack — for the new project's repo root
    const projectName = deriveProjectName(state.projectDescription);
    const contextPack =
      '# CONTEXT.md — ' + projectName + '\n\n' +
      '**Archetype:** ' + archetype.name + ' (' + archetype.id + ')\n' +
      '**Source:** Built with dt-site-creator methodology archive.\n\n' +
      '**What we\'re building:**\n' + state.projectDescription + '\n\n' +
      '**Scoping:**\n' + scopingText + '\n\n' +
      '**Mechanics selected:**\n' + mechanicText + '\n\n' +
      '**Top pitfalls to watch:**\n' + pitfallsText + '\n\n' +
      '**Style authority:** dt-site-creator — ' + archetype.name + ' archetype playbook (see derrickteo.com)\n';

    document.getElementById('context-pack').textContent = contextPack;

    wireCopyButtons(assembled, contextPack);
    wireGenerateFreshButton(archetype, state, tickedMechs);
  }

  function formatScopingAnswers(answers) {
    const labels = {
      q1_public: 'public visitors',
      q1_customers: 'paying customers',
      q1_internal: 'internal team',
      q1_learners: 'learners',
      q2_no_money: 'no payment/data',
      q2_one_time: 'one-time payment/upload',
      q2_recurring: 'recurring/persistent',
      q2_escrow: 'complex (escrow/marketplace)',
      q3_content: 'content-centric',
      q3_interaction: 'interaction-centric',
      q3_goal: 'goal-centric',
      q4_no_data: 'no live data layer',
      q4_dashboard: 'dashboard/analytics data',
      q4_api: 'external API integration'
    };
    return Object.values(answers).map(v => '- ' + (labels[v] || v)).join('\n');
  }

  async function fetchTopPitfalls(archetypeId) {
    try {
      const resp = await fetch('archetypes/' + archetypeId + '/pitfalls.md');
      const text = await resp.text();
      const yamlMatch = text.match(/```yaml\n([\s\S]*?)\n```/);
      if (!yamlMatch) return '(none)';
      const entries = window.yamlMini.parse(yamlMatch[1]);
      const top = entries
        .filter(e => e.severity === 'critical' || e.severity === 'high')
        .slice(0, 5);
      if (!top.length) return '(none)';
      return top.map(p => '⚠ ' + p.title + ' — ' + p.story).join('\n');
    } catch (e) {
      return '(none)';
    }
  }

  function deriveProjectName(desc) {
    return desc.toLowerCase().split(/\s+/).slice(0, 4).join('-').replace(/[^a-z0-9-]/g, '');
  }

  function wireCopyButtons(prompt, contextPack) {
    const copyPromptBtn = document.getElementById('btn-copy-prompt');
    copyPromptBtn.onclick = () => {
      navigator.clipboard.writeText(prompt)
        .then(() => window.toast('Prompt copied ✓'))
        .catch(() => window.toast('Copy failed — select + Cmd+C manually'));
    };

    const copyContextBtn = document.getElementById('btn-copy-context');
    copyContextBtn.onclick = () => {
      navigator.clipboard.writeText(contextPack)
        .then(() => window.toast('Context pack copied ✓'))
        .catch(() => window.toast('Copy failed — select + Cmd+C manually'));
    };
  }

  function wireGenerateFreshButton(archetype, state, tickedMechs) {
    const btn = document.getElementById('btn-generate-fresh');
    btn.onclick = () => {
      const slug = deriveProjectName(state.projectDescription) || 'custom';
      const mechNames = tickedMechs.map(m => m.name).join(', ') || '(none)';

      const freshPrompt =
        'Use the frontend-design skill to generate 4 mockup variants for:\n' +
        '- Archetype: ' + archetype.name + '\n' +
        '- Project: "' + state.projectDescription + '"\n' +
        '- Mechanics: ' + mechNames + '\n' +
        '- Constraint: match dt-site-creator archetype rules (see archetypes/' + archetype.id + '/CLAUDE.md)\n' +
        '- Output: 4 HTML files at dashboard/samples/custom/' + slug + '/variant-1.html through variant-4.html\n' +
        '- Each variant explores a different palette direction (bold, muted, warm, cool)\n' +
        '- Append an entry to dashboard/samples/custom/custom-index.json:\n' +
        '  { "id": "' + slug + '", "archetype": "' + archetype.id + '",\n' +
        '    "projectDescription": "' + state.projectDescription.replace(/"/g, '\\"') + '",\n' +
        '    "variants": ["variant-1.html", "variant-2.html", "variant-3.html", "variant-4.html"] }';

      document.getElementById('generate-fresh-prompt').textContent = freshPrompt;
      document.getElementById('modal-generate-fresh').classList.add('open');

      document.getElementById('btn-copy-generate-prompt').onclick = () => {
        navigator.clipboard.writeText(freshPrompt)
          .then(() => window.toast('Fresh-samples prompt copied ✓'))
          .catch(() => window.toast('Copy failed — select + Cmd+C manually'));
      };
      document.getElementById('btn-close-modal').onclick = () => {
        document.getElementById('modal-generate-fresh').classList.remove('open');
      };
    };
  }

  window.assemble = { render };
})();
