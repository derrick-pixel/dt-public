// ELIX ONBOARDING — Performance Review Engine

const BATTLE_STATE = {
  round: 1,
  maxRounds: 5,
  playerHP: 80,
  playerMorale: 90,
  bossHP: 100,
  bossMorale: 60,
  outcomeScore: 2,  // 0=PIP, 1=Maintain, 2=Meets, 3=Exceeds, 4=Promote
  playerActed: false,
  bossActed: false,
  battleOver: false,
};

const OUTCOME_LABELS = ['PIP', 'MAINTAIN', 'MEETS', 'EXCEEDS', 'PROMOTE'];
const OUTCOME_IDS    = ['ot-pip','ot-maintain','ot-meets','ot-exceeds','ot-promote'];

// Load character from session
const char = (() => {
  try { return JSON.parse(sessionStorage.getItem('elixonboarding_character')); } catch { return null; }
})();

const PLAYER_STATS = char?.stats || { str: 8, int: 9, cha: 7, dex: 8 };
const PLAYER_NAME  = char?.role?.title ? `${char.role.title}` : 'Staff Engineer';

// ─── MOVES ──────────────────────────────────────────────────────────────────

const PLAYER_MOVES = [
  {
    id: 'present_results',
    name: '📊 Present Results',
    stat: 'INT',
    desc: 'Show your KPI dashboards and quantified achievements.',
    statKey: 'int',
    damage: () => rollDice(10, 20),
    effect: (dmg) => `Outcome improved by ${dmg > 15 ? 'a lot' : 'a little'}`,
    outcomeShift: 1,
    bossReaction: ['Impressive numbers, I\'ll acknowledge that.', 'Your data speaks well.', 'Hmm. The metrics are better than I expected.'],
    logColor: 'log-player',
  },
  {
    id: 'showcase_impact',
    name: '🚀 Showcase Impact',
    stat: 'STR',
    desc: 'Narrate a high-stakes win. Defend your business value.',
    statKey: 'str',
    damage: () => rollDice(8, 18),
    effect: (dmg) => `Review progress reduced by ${dmg}`,
    outcomeShift: 1,
    bossReaction: ['That project did move the needle.', 'Fair point on delivery.', 'I remember that. Well executed.'],
    logColor: 'log-player',
  },
  {
    id: 'raise_the_flag',
    name: '🤝 Request Growth',
    stat: 'CHA',
    desc: 'Diplomatically request promotion or stretch opportunity.',
    statKey: 'cha',
    damage: () => rollDice(5, 15),
    effect: (dmg) => `Raised the promotion possibility`,
    outcomeShift: 1,
    bossReaction: ['I appreciate the ambition. Let\'s see.', 'You make a compelling case.', 'Bold ask. I\'ll take it to calibration.'],
    logColor: 'log-player',
  },
  {
    id: 'counter_feedback',
    name: '💬 Counter Criticism',
    stat: 'CHA + INT',
    desc: 'Push back diplomatically on unfair feedback with evidence.',
    statKey: 'cha',
    damage: () => rollDice(6, 16),
    effect: (dmg) => `Defended your rating`,
    outcomeShift: 0,
    special: (state) => { state.bossHP -= rollDice(5, 15); },
    bossReaction: ['I see your perspective.', 'Fair. I\'ll reconsider that point.', 'You have a point there.'],
    logColor: 'log-player',
  },
  {
    id: 'show_growth_plan',
    name: '📚 Show Growth Plan',
    stat: 'INT + DEX',
    desc: 'Present a concrete learning roadmap and next-level readiness.',
    statKey: 'int',
    damage: () => rollDice(12, 22),
    effect: (dmg) => `Strong signal of readiness`,
    outcomeShift: 2,
    bossReaction: ['That is exactly the kind of initiative I want to see.', 'A clear growth plan. This helps your case.', 'Proactive. I like it.'],
    logColor: 'log-crit',
  },
];

const BOSS_MOVES = [
  { id: 'scope_creep',    name: 'Scope Creep',        effect: 'Raises bar — outcome drops', shift: -1, hp_dmg: 5,  morale_dmg: 8,  msg: ['The scope was larger than what you delivered.', 'I expected you to own more.'] },
  { id: 'compare_peers',  name: 'Peer Comparison',    effect: 'Lowers relative performance', shift: -1, hp_dmg: 8,  morale_dmg: 12, msg: ['Your peer in the other team delivered more with fewer resources.', 'Others at your level are doing more.'] },
  { id: 'calibration',    name: 'Calibration Pressure', effect: 'Budget constraints cited', shift: -1, hp_dmg: 5, morale_dmg: 6,  msg: ['We can only promote so many people this cycle.', 'Budget is tight this year. I had to defend hard.'] },
  { id: 'positive_signal',name: 'Positive Recognition', effect: 'Manager is impressed', shift: 1, hp_dmg: 0, morale_dmg: -10, msg: ['That launch was genuinely impressive.', 'The team feedback on you has been excellent.'] },
  { id: 'nitpick',        name: 'Nitpick',            effect: 'Minor criticism applied', shift: 0, hp_dmg: 10, morale_dmg: 5,  msg: ['Your documentation could have been better.', 'A few stakeholders mentioned communication gaps.'] },
];

// ─── Init ────────────────────────────────────────────────────────────────────

(function init() {
  // Set player info from character
  if (char) {
    document.getElementById('player-name').textContent = char.role?.title || 'Staff Engineer';
    document.getElementById('player-class').textContent =
      `${char.role?.title || 'Staff Engineer'} · LVL ${char.stats ? Math.max(...Object.values(char.stats)) : 7}`;
    document.getElementById('player-avatar').textContent =
      (char.role?.title || 'SE').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  }

  renderActions();
  updateOutcomeTrack();
})();

// ─── Render Actions ──────────────────────────────────────────────────────────

function renderActions(disabled = false) {
  const container = document.getElementById('actions');
  container.innerHTML = PLAYER_MOVES.map(move => `
    <button class="action-btn" onclick="playerMove('${move.id}')" ${disabled ? 'disabled' : ''}>
      <span class="action-name">${move.name}</span>
      <span class="action-stat">${move.stat} CHECK</span>
      <span class="action-effect ${PLAYER_STATS[move.statKey] >= 8 ? 'action-hit' : 'action-miss'}">
        ${PLAYER_STATS[move.statKey] >= 10 ? '★ HIGH CHANCE' : PLAYER_STATS[move.statKey] >= 7 ? '◈ MODERATE' : '◇ RISKY'}
      </span>
    </button>
  `).join('');
}

// ─── Player Turn ─────────────────────────────────────────────────────────────

function playerMove(moveId) {
  if (BATTLE_STATE.playerActed || BATTLE_STATE.battleOver) return;

  const move  = PLAYER_MOVES.find(m => m.id === moveId);
  const stat  = PLAYER_STATS[move.statKey];
  const roll  = rollDice(1, 20);
  const dmg   = move.damage();
  const crit  = roll >= 18;
  const miss  = roll <= 3;

  // Shift outcome
  let shift = miss ? -1 : (crit ? move.outcomeShift + 1 : move.outcomeShift);
  if (move.special) move.special(BATTLE_STATE);

  BATTLE_STATE.outcomeScore = Math.min(4, Math.max(0, BATTLE_STATE.outcomeScore + shift));
  BATTLE_STATE.bossHP = Math.max(0, BATTLE_STATE.bossHP - (miss ? 0 : dmg * 0.5));
  BATTLE_STATE.playerActed = true;

  const reaction = pickRandom(move.bossReaction);
  const rollClass = crit ? 'log-crit' : (miss ? 'log-bad' : 'log-player');

  logEntry(rollClass, `> YOU: ${move.name.split(' ').slice(1).join(' ')} — Roll ${roll}${crit?' 🎯 EXCELLENT!':miss?' ❌ MISS':''}`);
  if (!miss) logEntry('log-player', `  "${reaction}"`);
  else       logEntry('log-bad', `  ❌ Your argument fell flat this round.`);

  floatDamage(crit ? `+${shift+1}` : miss ? '-1' : `+${shift}`, crit ? '#ffd700' : miss ? '#ef5350' : '#00e676', 'player');

  updateBars();
  updateOutcomeTrack();
  renderActions(true); // disable until manager responds

  setTimeout(bossMove, 1400);
}

// ─── Manager Turn ───────────────────────────────────────────────────────────

function bossMove() {
  if (BATTLE_STATE.battleOver) return;

  const move  = BOSS_MOVES[Math.floor(Math.random() * BOSS_MOVES.length)];
  const shift = move.shift;

  BATTLE_STATE.outcomeScore = Math.min(4, Math.max(0, BATTLE_STATE.outcomeScore + shift));
  BATTLE_STATE.playerHP     = Math.max(0, BATTLE_STATE.playerHP - move.hp_dmg);
  BATTLE_STATE.playerMorale = Math.min(100, Math.max(0, BATTLE_STATE.playerMorale - move.morale_dmg));
  BATTLE_STATE.bossMorale   = Math.min(100, BATTLE_STATE.bossMorale + (move.shift > 0 ? 10 : 0));

  logEntry('log-boss', `▶ MANAGER: "${pickRandom(move.msg)}"`);
  if (move.hp_dmg > 0) logEntry('log-bad', `  ${move.name} — Performance score takes a hit.`);
  if (move.shift < 0)  logEntry('log-bad', `  Outcome track drops.`);
  if (move.shift > 0)  logEntry('log-crit', `  Outcome track improves!`);

  floatDamage(shift > 0 ? `+1` : shift < 0 ? '-1' : '±0', shift > 0 ? '#00e676' : shift < 0 ? '#ef5350' : '#a0a0a0', 'boss');

  shakeElement('player-portrait');
  updateBars();
  updateOutcomeTrack();

  BATTLE_STATE.round++;
  document.getElementById('round-label').textContent = `ROUND ${Math.min(BATTLE_STATE.round, BATTLE_STATE.maxRounds)} / ${BATTLE_STATE.maxRounds}`;

  if (BATTLE_STATE.round > BATTLE_STATE.maxRounds || BATTLE_STATE.playerHP <= 0) {
    setTimeout(endBattle, 800);
  } else {
    BATTLE_STATE.playerActed = false;
    renderActions(false);
    logEntry('log-system', `─── Round ${BATTLE_STATE.round} ───`);
  }
}

// ─── End Review ──────────────────────────────────────────────────────────────

function endBattle() {
  BATTLE_STATE.battleOver = true;
  renderActions(true);

  const score = BATTLE_STATE.outcomeScore;
  const outcomes = [
    {
      icon: '⚠️', title: 'PERFORMANCE IMPROVEMENT PLAN',
      sub: 'Critical performance gaps identified. A PIP has been issued.',
      rewards: [
        { k: 'XP GAINED', v: '+50 XP' }, { k: 'OUTCOME', v: 'PIP Issued' },
        { k: 'NEXT STEP', v: '90-day improvement plan' }, { k: 'CONFIDENCE', v: '-20' }
      ],
      color: '#ef5350',
    },
    {
      icon: '😐', title: 'MAINTAINED',
      sub: 'You met the minimum bar. No change in level or compensation.',
      rewards: [
        { k: 'XP GAINED', v: '+150 XP' }, { k: 'OUTCOME', v: 'No change' },
        { k: 'SALARY', v: 'No increase' }, { k: 'CONFIDENCE', v: '-5' }
      ],
      color: '#a0a0a0',
    },
    {
      icon: '✅', title: 'MEETS EXPECTATIONS',
      sub: 'Solid performance. Standard merit increase awarded.',
      rewards: [
        { k: 'XP GAINED', v: '+300 XP' }, { k: 'OUTCOME', v: 'Meets expectations' },
        { k: 'MERIT RAISE', v: '+3% salary' }, { k: 'CONFIDENCE', v: '+5' }
      ],
      color: '#4a9eff',
    },
    {
      icon: '🌟', title: 'EXCEEDS EXPECTATIONS',
      sub: 'Outstanding performance. Significant merit and bonus awarded.',
      rewards: [
        { k: 'XP GAINED', v: '+600 XP' }, { k: 'OUTCOME', v: 'Exceeds expectations' },
        { k: 'MERIT RAISE', v: '+6% salary' }, { k: 'BONUS', v: '1 month' }, { k: 'CONFIDENCE', v: '+15' }
      ],
      color: '#ffd700',
    },
    {
      icon: '🏆', title: 'PROMOTED!',
      sub: `Exceptional performance. You advance to the next level.`,
      rewards: [
        { k: 'XP GAINED', v: '+1,200 XP' }, { k: 'OUTCOME', v: 'PROMOTION' },
        { k: 'LEVEL UP', v: '+1 Level' }, { k: 'RAISE', v: '+15–25% salary' }, { k: 'EQUITY', v: 'New RSU grant' }
      ],
      color: '#00e676',
    },
  ];

  const result = outcomes[score];
  document.getElementById('result-icon').textContent  = result.icon;
  document.getElementById('result-title').textContent = result.title;
  document.getElementById('result-sub').textContent   = result.sub;
  document.getElementById('result-title').style.textShadow = `0 0 30px ${result.color}`;
  document.getElementById('result-rewards').innerHTML = result.rewards.map(r =>
    `<div class="reward-row"><span class="reward-key">${r.k}</span><span class="reward-val">${r.v}</span></div>`
  ).join('');

  setTimeout(() => {
    document.getElementById('result-overlay').classList.remove('hidden');
  }, 600);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rollDice(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pickRandom(arr)    { return arr[Math.floor(Math.random() * arr.length)]; }

function logEntry(cls, msg) {
  const log = document.getElementById('battle-log');
  const div = document.createElement('div');
  div.className = `log-entry ${cls}`;
  div.textContent = msg;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function updateBars() {
  const s = BATTLE_STATE;
  setBar('player-hp',    s.playerHP,    'player-hp-text');
  setBar('player-morale',s.playerMorale,'player-morale-text');
  setBar('boss-hp',      s.bossHP,      'boss-hp-text');
  setBar('boss-morale',  s.bossMorale,  'boss-morale-text');
}

function setBar(barId, val, textId) {
  const el = document.getElementById(barId);
  if (el) el.style.width = `${Math.max(0, Math.min(100, val))}%`;
  const tx = document.getElementById(textId);
  if (tx) tx.textContent = Math.round(Math.max(0, val));
}

function updateOutcomeTrack() {
  OUTCOME_IDS.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('ot-active', i === BATTLE_STATE.outcomeScore);
    if (i === 4) el.classList.toggle('ot-promote', i === BATTLE_STATE.outcomeScore);
    if (i === 0) el.classList.toggle('ot-pip',     i === BATTLE_STATE.outcomeScore);
  });
}

function floatDamage(text, color, side) {
  const el = document.createElement('div');
  el.className = 'dmg-float';
  el.textContent = text;
  el.style.color = color;
  el.style.left = side === 'player' ? '30%' : '70%';
  el.style.top  = '40%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function shakeElement(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}

function restartBattle() {
  BATTLE_STATE.round = 1; BATTLE_STATE.playerHP = 80; BATTLE_STATE.playerMorale = 90;
  BATTLE_STATE.bossHP = 100; BATTLE_STATE.bossMorale = 60; BATTLE_STATE.outcomeScore = 2;
  BATTLE_STATE.playerActed = false; BATTLE_STATE.battleOver = false;
  document.getElementById('result-overlay').classList.add('hidden');
  document.getElementById('battle-log').innerHTML =
    '<div class="log-entry log-system">▶ Annual Performance Review restarted.</div>';
  document.getElementById('round-label').textContent = 'ROUND 1 / 5';
  updateBars(); updateOutcomeTrack(); renderActions(false);
}
