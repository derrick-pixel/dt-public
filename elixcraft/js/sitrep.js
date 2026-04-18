// ELIXCRAFT — SITREP / Analytics Page Logic

const ALL_SECTORS = [
  { id: 'tech',         name: 'Technology',    icon: '💻', quadrant: 'gamma' },
  { id: 'finance',      name: 'Finance',        icon: '📊', quadrant: 'gamma' },
  { id: 'healthcare',   name: 'Healthcare',     icon: '🏥', quadrant: 'delta' },
  { id: 'aviation',     name: 'Aviation',       icon: '✈️',  quadrant: 'delta' },
  { id: 'manufacturing',name: 'Manufacturing',  icon: '🏭', quadrant: 'beta'  },
  { id: 'logistics',    name: 'Logistics',      icon: '🚚', quadrant: 'beta'  },
  { id: 'construction', name: 'Construction',   icon: '🏗️',  quadrant: 'beta'  },
  { id: 'marine',       name: 'Marine',         icon: '⚓', quadrant: 'beta'  },
  { id: 'sales',        name: 'Sales/Retail',   icon: '🛍️',  quadrant: 'alpha' },
  { id: 'fnb',          name: 'F&B',            icon: '🍽️',  quadrant: 'alpha' },
  { id: 'mice',         name: 'MICE',           icon: '🎪', quadrant: 'alpha' },
  { id: 'hr',           name: 'HR/People',      icon: '🤝', quadrant: 'alpha' },
  { id: 'engineering',  name: 'Engineering',    icon: '⚙️',  quadrant: 'gamma' },
  { id: 'education',    name: 'Education',      icon: '📚', quadrant: 'delta' },
  { id: 'security',     name: 'Security',       icon: '🛡️',  quadrant: 'delta' },
  { id: 'government',   name: 'Government',     icon: '🏛️',  quadrant: 'delta' },
];

// ─── Init ────────────────────────────────────────────────────────────────────

(function init() {
  updateClock();
  setInterval(updateClock, 60000);

  const state = GameState.exists() ? GameState.get() : null;

  if (!state) {
    renderNoSave();
    return;
  }

  renderProfile(state);
  renderResources(state);
  renderSkills(state);
  renderQuests(state);
  renderBattles(state);
  renderSectors(state);
  renderRoster(state);
  renderFooter(state);
})();

// ─── Clock ───────────────────────────────────────────────────────────────────

function updateClock() {
  const el = document.getElementById('sitrep-clock');
  if (!el) return;
  const now = new Date();
  const q   = Math.ceil((now.getMonth() + 1) / 3);
  const day = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 86400000);
  el.textContent = `Q${q} ${now.getFullYear()} · DAY ${day}`;
}

// ─── No Save ─────────────────────────────────────────────────────────────────

function renderNoSave() {
  document.querySelector('.sitrep-grid').innerHTML = `
    <div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:80px 20px;text-align:center">
      <div style="font-size:3rem">📭</div>
      <div style="font-family:'Orbitron',monospace;font-size:1rem;letter-spacing:0.2em;color:var(--text-primary)">NO SAVE DATA FOUND</div>
      <div style="font-size:0.8rem;color:var(--text-dim);max-width:360px;line-height:1.6">Deploy a Commander first to begin generating SITREP data.</div>
      <a href="index.html" style="font-family:'Orbitron',monospace;font-size:0.65rem;letter-spacing:0.15em;padding:12px 24px;background:var(--protoss);color:#000;border-radius:3px;text-decoration:none;font-weight:700">
        → SELECT FACTION
      </a>
    </div>
  `;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

function renderProfile(state) {
  const p = state.player;

  // Avatar initials
  const initials = (p.name || 'CO').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('sr-avatar').textContent = initials;

  // Faction colour for avatar
  const fColors = { protoss: '#ffd700', terran: '#4a9eff', zerg: '#b44fff' };
  const fColor  = fColors[p.faction] || '#ffd700';
  const avatarEl = document.getElementById('sr-avatar');
  avatarEl.style.borderColor = fColor;
  avatarEl.style.color       = fColor;
  avatarEl.style.boxShadow   = `0 0 20px ${fColor}33`;

  document.getElementById('sr-name').textContent = p.name || 'Commander';
  const fLabel = { protoss: '⚡ PROTOSS · Engineering', terran: '🏗️ TERRAN · Operations', zerg: '🦾 ZERG · Sales & Growth' };
  document.getElementById('sr-role').textContent = `${p.role?.title || 'Unit'} · ${fLabel[p.faction] || 'Unknown Faction'}`;
  document.getElementById('sr-level').textContent = p.level || 1;
  document.getElementById('sr-level').style.color = fColor;

  const xpPct = GameState.xpProgressPct(p.xp || 0, p.level || 1);
  const xpFill = document.getElementById('sr-xp-fill');
  xpFill.style.background = `linear-gradient(90deg, ${fColor}66, ${fColor})`;
  setTimeout(() => { xpFill.style.width = xpPct + '%'; }, 100);

  document.getElementById('sr-xp-text').textContent = `${p.xp || 0} XP`;
  document.getElementById('sr-xp-text').style.color = fColor;

  // Stats
  const stats = p.stats || { str: 5, int: 5, cha: 5, dex: 5 };
  const statMeta = {
    str: { label: '⚔️ STR — Strength',     cls: 'stat-str' },
    int: { label: '🧠 INT — Intelligence',  cls: 'stat-int' },
    cha: { label: '🗣️ CHA — Charisma',      cls: 'stat-cha' },
    dex: { label: '⚡ DEX — Dexterity',     cls: 'stat-dex' },
  };

  const statsGrid = document.getElementById('sr-stats-grid');
  statsGrid.innerHTML = Object.entries(stats).map(([key, val]) => {
    const m = statMeta[key] || { label: key.toUpperCase(), cls: '' };
    return `
      <div class="sr-stat-row">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
          <span class="sr-stat-label">${m.label}</span>
          <span class="sr-stat-num">${val}</span>
        </div>
        <div class="sr-stat-bar-outer">
          <div class="sr-stat-bar-fill ${m.cls}" style="width:${val * 10}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Resources ───────────────────────────────────────────────────────────────

function renderResources(state) {
  const r = state.resources || {};
  const items = [
    { key: 'minerals', icon: '💎', name: 'MINERALS (SGD)', val: (r.minerals || 0).toLocaleString(), pct: Math.min(100, (r.minerals || 0) / 2000), cls: 'res-minerals' },
    { key: 'gas',      icon: '⛽', name: 'VESPENE GAS',    val: r.gas || 0,                          pct: Math.min(100, (r.gas || 0) * 2),         cls: 'res-gas'      },
    { key: 'supply',   icon: '👥', name: 'SUPPLY (UNITS)', val: r.supply || 0,                       pct: Math.min(100, (r.supply || 0) * 10),     cls: 'res-supply'   },
  ];

  document.getElementById('sr-res-list').innerHTML = items.map(it => `
    <div class="sr-res-item">
      <span class="sr-res-icon">${it.icon}</span>
      <div class="sr-res-info">
        <div class="sr-res-name">${it.name}</div>
        <div class="sr-res-bar-outer">
          <div class="sr-res-bar-fill ${it.cls}" style="width:${it.pct}%"></div>
        </div>
      </div>
      <div class="sr-res-val">${it.val}</div>
    </div>
  `).join('');
}

// ─── Skills ──────────────────────────────────────────────────────────────────

function renderSkills(state) {
  const skills = state.skills || [];
  const el = document.getElementById('sr-skill-list');

  if (!skills.length) {
    el.innerHTML = '<div class="sr-no-data">No skills equipped yet</div>';
    return;
  }

  const skillIcons = ['🤖','☁️','🌀','📐','🛡️','📊','💡','🔧','📱','🌐'];
  el.innerHTML = skills.map((sk, i) => `
    <div class="sr-skill-item">
      <span class="sr-skill-icon">${skillIcons[i % skillIcons.length]}</span>
      <div class="sr-skill-info">
        <div class="sr-skill-name">${sk.name}</div>
        <div class="sr-skill-xp">+${sk.xp} XP · ${sk.equippedAt ? 'Equipped ' + formatDate(sk.equippedAt) : 'Starting skill'}</div>
      </div>
    </div>
  `).join('');
}

// ─── Quests ──────────────────────────────────────────────────────────────────

function renderQuests(state) {
  const quests = state.quests || [];

  const total     = quests.length;
  const complete  = quests.filter(q => q.status === 'complete').length;
  const active    = quests.filter(q => q.status === 'active').length;
  const available = quests.filter(q => q.status === 'available').length;
  const avgProg   = total ? Math.round(quests.reduce((a, q) => a + (q.progress || 0), 0) / total) : 0;

  document.getElementById('sr-quest-summary').innerHTML = `
    <div class="sr-quest-stat"><div class="sr-quest-stat-val" style="color:#4a9eff">${complete}</div><div class="sr-quest-stat-label">COMPLETE</div></div>
    <div class="sr-quest-stat"><div class="sr-quest-stat-val" style="color:var(--protoss)">${active}</div><div class="sr-quest-stat-label">ACTIVE</div></div>
    <div class="sr-quest-stat"><div class="sr-quest-stat-val" style="color:#00e676">${available}</div><div class="sr-quest-stat-label">AVAILABLE</div></div>
    <div class="sr-quest-stat"><div class="sr-quest-stat-val">${avgProg}%</div><div class="sr-quest-stat-label">AVG PROGRESS</div></div>
  `;

  const statusBadge = {
    complete:  ['sq-complete',  '✓ DONE'],
    active:    ['sq-active',    '▶ ACTIVE'],
    available: ['sq-available', '◈ OPEN'],
  };

  document.getElementById('sr-quest-list').innerHTML = quests.map(q => {
    const [cls, label] = statusBadge[q.status] || ['sq-available', q.status.toUpperCase()];
    return `
      <div class="sr-quest-item status-${q.status}">
        <div>
          <div class="sr-quest-name">${q.name}</div>
          <div class="sr-quest-type">${q.type} · ${q.deadline}</div>
        </div>
        <div class="sr-quest-progress-outer">
          <div class="sr-quest-progress-fill" style="width:${q.progress || 0}%"></div>
        </div>
        <div class="sr-quest-pct">${q.progress || 0}%</div>
        <div class="sr-quest-status-badge ${cls}">${label}</div>
      </div>
    `;
  }).join('');
}

// ─── Battles ─────────────────────────────────────────────────────────────────

function renderBattles(state) {
  const battles = state.battleHistory || [];
  const el = document.getElementById('sr-battle-list');

  if (!battles.length) {
    el.innerHTML = '<div class="sr-no-data">No battles recorded yet.<br>Face the Annual Performance Review to begin.</div>';
    return;
  }

  const outcomeIcon = { win: '🏆', loss: '💀', draw: '⚔️' };
  const outcomeClass = { win: 'outcome-win', loss: 'outcome-loss', draw: 'outcome-draw' };

  el.innerHTML = battles.slice(0, 6).map(b => `
    <div class="sr-battle-item">
      <span class="sr-battle-icon">${outcomeIcon[b.outcome] || '⚔️'}</span>
      <div class="sr-battle-info">
        <div class="sr-battle-opponent">${b.opponent || 'Performance Review'}</div>
        <div class="sr-battle-date">${b.date ? formatDate(b.date) : '—'} · Round ${b.round || '?'}</div>
      </div>
      <div class="sr-battle-outcome ${outcomeClass[b.outcome] || 'outcome-draw'}">${(b.outcome || 'draw').toUpperCase()}</div>
      ${b.xpGained ? `<div class="sr-battle-xp">+${b.xpGained} XP</div>` : ''}
    </div>
  `).join('');
}

// ─── Sectors ─────────────────────────────────────────────────────────────────

function renderSectors(state) {
  const deployedIds = (state.sectorDeployments || []).map(d => d.sectorId);
  const el = document.getElementById('sr-sector-grid');

  el.innerHTML = ALL_SECTORS.map(s => {
    const deployed = deployedIds.includes(s.id);
    return `
      <div class="sr-sector-pip ${deployed ? 'deployed' : ''}" title="${s.name}${deployed ? ' — Deployed' : ''}">
        <div class="sr-sector-pip-icon">${s.icon}</div>
        <div class="sr-sector-pip-name">${s.name}</div>
      </div>
    `;
  }).join('');

  // Coverage bar
  const pct = Math.round((deployedIds.length / ALL_SECTORS.length) * 100);
  el.insertAdjacentHTML('afterend', `
    <div class="sr-sector-coverage-bar">
      <span class="sr-coverage-label">COVERAGE</span>
      <div class="sr-coverage-outer">
        <div class="sr-coverage-fill" id="sr-coverage-fill" style="width:0%"></div>
      </div>
      <span class="sr-coverage-pct">${deployedIds.length}/${ALL_SECTORS.length}</span>
    </div>
  `);
  setTimeout(() => {
    const fill = document.getElementById('sr-coverage-fill');
    if (fill) fill.style.width = pct + '%';
  }, 200);
}

// ─── Roster ──────────────────────────────────────────────────────────────────

function renderRoster(state) {
  const roster = state.roster || [];
  const el = document.getElementById('sr-roster-table');

  if (!roster.length) {
    el.innerHTML = '<div class="sr-no-data">Roster is empty</div>';
    return;
  }

  const statusCls = { active: 'rs-active', quest: 'rs-quest', training: 'rs-training', ghost: 'rs-ghost' };
  const statusLabel = { active: '● ACTIVE', quest: '⚡ QUEST', training: '📚 TRAIN', ghost: '○ GHOST' };

  const fColors = { protoss: '#ffd700', terran: '#4a9eff', zerg: '#b44fff' };

  el.innerHTML = roster.map(u => {
    const fColor = fColors[u.faction] || '#5a7a9a';
    return `
      <div class="sr-roster-row">
        <div class="sr-roster-init" style="border-color:${fColor};color:${fColor}">${u.initials}</div>
        <div class="sr-roster-info">
          <div class="sr-roster-name">${u.name}</div>
          <div class="sr-roster-role">${u.role}</div>
        </div>
        <div class="sr-roster-lvl">LVL ${u.level}</div>
        <div class="sr-roster-status ${statusCls[u.status] || 'rs-ghost'}">${statusLabel[u.status] || u.status}</div>
      </div>
    `;
  }).join('');
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function renderFooter(state) {
  const el = document.getElementById('sr-save-date');
  if (el && state.updatedAt) {
    el.textContent = 'LAST SAVED: ' + formatDate(state.updatedAt);
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

function confirmReset() {
  if (!confirm('⚠ This will permanently erase all save data.\nAre you sure you want to reset?')) return;
  GameState.reset();
  window.location.href = 'index.html';
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function formatDate(isoStr) {
  try {
    return new Date(isoStr).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return isoStr;
  }
}
