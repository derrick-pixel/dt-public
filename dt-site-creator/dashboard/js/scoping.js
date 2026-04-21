// ── dt-site-creator dashboard ── scoping.js ───────────────────
// Stage 2: 4-question wizard with live weighted scoring.
// Depends on: window.main (state + saveState + goToStage)

(function() {
  'use strict';

  const questions = [
    { id: 'q1', text: 'Who visits?', options: [
      { id: 'q1_public', label: 'The general public' },
      { id: 'q1_customers', label: 'Paying customers' },
      { id: 'q1_internal', label: 'Internal team' },
      { id: 'q1_learners', label: 'Learners / trainees' }
    ]},
    { id: 'q2', text: 'Do users give you money or data?', options: [
      { id: 'q2_no_money', label: 'No — content only' },
      { id: 'q2_one_time', label: 'One-time payment or upload' },
      { id: 'q2_recurring', label: 'Recurring (subscription, persistent accounts)' },
      { id: 'q2_escrow', label: 'Complex (escrow, marketplace, multi-party)' }
    ]},
    { id: 'q3', text: 'Is the core experience content, interaction, or a goal-to-win?', options: [
      { id: 'q3_content', label: 'Content (read / browse)' },
      { id: 'q3_interaction', label: 'Interaction (do / calculate)' },
      { id: 'q3_goal', label: 'Goal (win / level up)' }
    ]},
    { id: 'q4', text: 'Does it need a live data layer?', options: [
      { id: 'q4_no_data', label: 'No' },
      { id: 'q4_dashboard', label: 'Yes — dashboard / analytics' },
      { id: 'q4_api', label: 'Yes — external API integration' }
    ]}
  ];

  function buildQuestion(q) {
    const wrap = document.createElement('div');
    wrap.className = 'scoping-q';
    wrap.dataset.q = q.id;

    const h4 = document.createElement('h4');
    h4.textContent = q.text;
    wrap.appendChild(h4);

    const optsDiv = document.createElement('div');
    optsDiv.className = 'scoping-options';

    q.options.forEach(o => {
      const label = document.createElement('label');
      label.className = 'scoping-option';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = q.id;
      radio.value = o.id;
      if (window.main.state.scopingAnswers[q.id] === o.id) radio.checked = true;
      label.appendChild(radio);

      const span = document.createElement('span');
      span.textContent = o.label;
      label.appendChild(span);

      optsDiv.appendChild(label);
    });

    wrap.appendChild(optsDiv);
    return wrap;
  }

  function renderQuestions(archetypes) {
    const container = document.getElementById('scoping-questions');
    container.replaceChildren();
    questions.forEach(q => container.appendChild(buildQuestion(q)));

    container.addEventListener('change', e => {
      if (e.target.matches('input[type="radio"]')) {
        window.main.state.scopingAnswers[e.target.name] = e.target.value;
        window.main.saveState();
        recomputeScores(archetypes);
        checkReady();
      }
    });

    recomputeScores(archetypes);
    checkReady();

    const btn = document.getElementById('btn-see-recommendations');
    btn.addEventListener('click', () => {
      window.main.goToStage(3);
      window.main.renderRecommendations();
    }, { once: true });
  }

  function recomputeScores(archetypes) {
    const scores = {};
    archetypes.forEach(a => { scores[a.id] = 0; });
    Object.values(window.main.state.scopingAnswers).forEach(ans => {
      archetypes.forEach(a => {
        scores[a.id] += a.scoring_weights[ans] || 0;
      });
    });
    window.main.state.archetypeScores = scores;
    window.main.saveState();
    renderMatchMeter(archetypes, scores);
  }

  function renderMatchMeter(archetypes, scores) {
    const max = Math.max(...Object.values(scores), 1);
    const meter = document.getElementById('match-meter');
    meter.replaceChildren();

    archetypes.forEach(a => {
      const pct = Math.round((scores[a.id] / max) * 100);

      const bar = document.createElement('div');
      bar.className = 'match-bar';
      bar.dataset.archetype = a.id;

      const lbl = document.createElement('div');
      lbl.className = 'match-bar-label';
      lbl.textContent = a.name;
      bar.appendChild(lbl);

      const track = document.createElement('div');
      track.className = 'match-bar-track';
      const fill = document.createElement('div');
      fill.className = 'match-bar-fill';
      fill.style.width = pct + '%';
      fill.style.background = a.color_hint;
      track.appendChild(fill);
      bar.appendChild(track);

      const score = document.createElement('div');
      score.className = 'match-bar-score';
      score.textContent = scores[a.id];
      bar.appendChild(score);

      meter.appendChild(bar);
    });
  }

  function checkReady() {
    const answered = Object.keys(window.main.state.scopingAnswers).length;
    const btn = document.getElementById('btn-see-recommendations');
    if (btn) btn.disabled = answered < 4;
  }

  window.scoping = { renderQuestions };
})();
