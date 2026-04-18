// ELIXCRAFT — Character Creation Logic
// Data-driven from /data/jobs.json, /data/skills.json, /data/benefits.json

// Data loaded from data/elixcraft-data.js globals (fetch blocked on file://)
let JOBS     = window.ELIXCRAFT_JOBS;
let SKILLS   = window.ELIXCRAFT_SKILLS;
let BENEFITS = window.ELIXCRAFT_BENEFITS;
let currentStep = 1;
const MAX_STEPS  = 6;
const MAX_SKILLS = 3;
const STAT_TOTAL = 30; // sum of all 4 stats
const STAT_MIN   = 1;
const STAT_MAX   = 15;

const character = {
  faction:  null,
  track:    null,
  role:     null,
  stats:    { str: 5, int: 5, cha: 5, dex: 5 },  // 20 base + 10 to allocate
  skills:   [],
  benefit:  null,
  name:     'Commander',
};

const fmtSalary = ([lo, hi]) =>
  `$${lo.toLocaleString()} – $${hi.toLocaleString()}/mo`;

// ─── Bootstrap ──────────────────────────────────────────────────────────────

// Data is already available via window.ELIXCRAFT_* globals from elixcraft-data.js

// ─── Step navigation ────────────────────────────────────────────────────────

function showStep(n) {
  document.querySelectorAll('.cc-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`step-${n}`).classList.add('active');

  document.querySelectorAll('.step').forEach(s => {
    const sn = +s.dataset.step;
    s.classList.toggle('active', sn === n);
    s.classList.toggle('done', sn < n);
  });

  // Populate dynamic steps
  if (n === 2) populateRoles();
  if (n === 4) populateSkills();
  if (n === 5) populateBenefits();
  if (n === 6) populateSummary();

  document.getElementById('cc-back').style.visibility = n === 1 ? 'hidden' : 'visible';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  currentStep = n;
}

function nextStep() { if (currentStep < MAX_STEPS) showStep(currentStep + 1); }
function prevStep() { if (currentStep > 1) showStep(currentStep - 1); }

// ─── Step 1: Faction ────────────────────────────────────────────────────────

const FC_THEME = {
  protoss: { color: '#ffd700', dim: '#6b5300', bg: 'rgba(255,215,0,0.07)',    glow: 'rgba(255,215,0,0.25)'    },
  terran:  { color: '#4a9eff', dim: '#1a3d6e', bg: 'rgba(74,158,255,0.07)',   glow: 'rgba(74,158,255,0.25)'   },
  zerg:    { color: '#b44fff', dim: '#4a1a70', bg: 'rgba(180,79,255,0.07)',   glow: 'rgba(180,79,255,0.25)'   },
};

function applyFactionTheme(faction) {
  const t = FC_THEME[faction] || FC_THEME.protoss;
  const r = document.documentElement.style;
  r.setProperty('--fc',      t.color);
  r.setProperty('--fc-dim',  t.dim);
  r.setProperty('--fc-bg',   t.bg);
  r.setProperty('--fc-glow', t.glow);
}

function pickFaction(faction, el) {
  document.querySelectorAll('.cc-faction-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  character.faction = faction;
  applyFactionTheme(faction);
  document.getElementById('btn-step1').disabled = false;
}

// ─── Step 2: Role ───────────────────────────────────────────────────────────

const FACTION_META = {
  protoss: { icon: '⚡', label: 'PROTOSS', dept: 'Engineering & Technology',  lore: 'ICT · Data/AI · Cloud · Cybersecurity · Engineering Management', color: '#ffd700' },
  terran:  { icon: '🏗️', label: 'TERRAN',  dept: 'Operations & Finance',       lore: 'Operations · Finance · Procurement · Project Management',         color: '#4a9eff' },
  zerg:    { icon: '🦾', label: 'ZERG',    dept: 'Sales, Marketing & People',  lore: 'Sales · Digital Marketing · HR & People · Product Management',    color: '#b44fff' },
};

function populateRoles() {
  if (!JOBS || !character.faction) return;
  const factionData = JOBS.factions[character.faction];
  const container   = document.getElementById('role-columns');
  const meta        = FACTION_META[character.faction];

  // Faction identity banner above tracks
  const banner = `
    <div class="role-faction-banner">
      <div class="rfb-emblem">${meta.icon}</div>
      <div class="rfb-info">
        <div class="rfb-label">${meta.label}</div>
        <div class="rfb-dept">${meta.dept}</div>
        <div class="rfb-lore">${meta.lore}</div>
      </div>
      <div class="rfb-stat">
        <div class="rfb-stat-val">${factionData.tracks.length}</div>
        <div class="rfb-stat-key">TRACKS</div>
      </div>
      <div class="rfb-stat">
        <div class="rfb-stat-val">${factionData.tracks.reduce((a,t)=>a+t.roles.length,0)}</div>
        <div class="rfb-stat-key">ROLES</div>
      </div>
    </div>
  `;

  const tracks = factionData.tracks.map(track => `
    <div class="track-card">
      <div class="track-header">
        <span class="track-name">${track.name}</span>
        <span class="track-source">${track.source}</span>
      </div>
      ${track.roles.map(role => `
        <div class="role-option" data-faction="${character.faction}" data-track="${track.id}" data-role="${role.id}"
             onclick="pickRole('${track.id}','${role.id}','${role.title}',${JSON.stringify(role.salary_sgd)},this)">
          <div class="ro-radio"></div>
          <div class="ro-info">
            <div class="ro-title">${role.title}</div>
            <div class="ro-meta">LVL ${role.level[0]}–${role.level[1]} · Supply: ${role.supply_cost}</div>
            <div class="ro-salary">${fmtSalary(role.salary_sgd)} SGD</div>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');

  container.innerHTML = banner + `<div class="track-grid">${tracks}</div>`;
}

function pickRole(trackId, roleId, title, salary, el) {
  document.querySelectorAll('.role-option').forEach(r => r.classList.remove('selected'));
  el.classList.add('selected');
  character.track   = trackId;
  character.role    = { id: roleId, title, salary };
  document.getElementById('btn-step2').disabled = false;
}

// ─── Step 3: Stats ──────────────────────────────────────────────────────────

function getPtsSpent() {
  return Object.values(character.stats).reduce((a, b) => a + b, 0) - 20; // base 20
}

function adjustStat(stat, delta) {
  const cur  = character.stats[stat];
  const next = cur + delta;
  if (next < STAT_MIN || next > STAT_MAX) return;
  const spent = getPtsSpent();
  if (delta > 0 && spent >= 10) return;
  character.stats[stat] = next;
  document.getElementById(`stat-${stat}`).textContent = next;
  document.getElementById(`bar-${stat}`).style.width  = `${next * 10}%`;
  document.getElementById('pts-remaining').textContent = 10 - getPtsSpent();
}

function applyPreset(preset) {
  const presets = {
    balanced:  { str: 8, int: 8, cha: 7, dex: 7 },
    technical: { str: 5, int: 12, cha: 5, dex: 8 },
    leader:    { str: 10, int: 6, cha: 10, dex: 4 },
    executor:  { str: 6, int: 8, cha: 6, dex: 10 },
  };
  character.stats = { ...presets[preset] };
  ['str','int','cha','dex'].forEach(s => {
    document.getElementById(`stat-${s}`).textContent  = character.stats[s];
    document.getElementById(`bar-${s}`).style.width   = `${character.stats[s] * 10}%`;
  });
  document.getElementById('pts-remaining').textContent = 10 - getPtsSpent();
}

// ─── Step 4: Skills ─────────────────────────────────────────────────────────

function populateSkills() {
  if (!SKILLS || !character.faction) return;
  const grid = document.getElementById('skill-grid');

  const relevantCats = SKILLS.categories.filter(cat =>
    cat.skills.some(sk => sk.factions.includes(character.faction))
  );

  grid.innerHTML = relevantCats.map(cat => {
    const facSkills = cat.skills.filter(sk => sk.factions.includes(character.faction));
    if (!facSkills.length) return '';
    return `
      <div class="skill-cat-label" style="grid-column:1/-1">
        <span style="font-size:1.1rem">${cat.icon}</span>
        ${cat.name}
        <span style="margin-left:auto;color:var(--xp-color);font-size:0.5rem">+${cat.salary_premium_pct}% salary premium</span>
      </div>
      ${facSkills.map(sk => `
        <div class="skill-item" id="sk-${sk.id}" onclick="toggleSkill('${sk.id}','${sk.name}',${sk.xp},this)">
          <div class="skill-chk">✓</div>
          <div class="skill-info">
            <div class="skill-name">${sk.name}</div>
            <div class="skill-desc">${sk.desc}</div>
            <div class="skill-meta">
              <span class="skill-xp">+${sk.xp} XP</span>
              <span class="skill-tier">TIER ${sk.tier}</span>
              ${sk.prereqs.length ? `<span class="skill-tier" style="color:var(--warning)">Prereq: ${sk.prereqs.join(', ')}</span>` : ''}
            </div>
          </div>
        </div>
      `).join('')}
    `;
  }).join('');
}

function toggleSkill(id, name, xp, el) {
  const idx = character.skills.findIndex(s => s.id === id);
  if (idx > -1) {
    character.skills.splice(idx, 1);
    el.classList.remove('selected');
  } else {
    if (character.skills.length >= MAX_SKILLS) {
      showFlash('Max 3 skills for starting loadout!');
      return;
    }
    character.skills.push({ id, name, xp });
    el.classList.add('selected');
  }
  document.getElementById('skill-count').textContent = character.skills.length;
  document.getElementById('skill-names').textContent  = character.skills.map(s => s.name).join(' · ') || '—';
  document.getElementById('btn-step4').disabled = character.skills.length === 0;
}

// ─── Step 5: Benefits ───────────────────────────────────────────────────────

function populateBenefits() {
  if (!BENEFITS) return;
  const container = document.getElementById('benefit-cards');
  // Starting level based on role
  const startLevel = 1;

  container.innerHTML = BENEFITS.packages.map(pkg => {
    const tierClass = pkg.tier.toLowerCase();
    const locked    = pkg.unlock_level > 4; // for new hire, restrict to Bronze/Silver
    return `
      <div class="benefit-card ${tierClass} ${locked ? 'locked' : ''}"
           onclick="${locked ? '' : `pickBenefit('${pkg.id}',this,'${tierClass}')`}">
        <div class="bc-header">
          <div class="bc-tier ${tierClass}">${pkg.tier}</div>
          <div class="bc-name">${pkg.name}</div>
        </div>
        <div class="bc-lore">${pkg.lore}</div>
        ${locked
          ? `<div class="bc-locked-label">🔒 Unlock at Level ${pkg.unlock_level}</div>`
          : `<div class="bc-slots">
              ${pkg.slots.map(s => `
                <div class="bc-slot-row">
                  <span class="bc-slot-icon">${s.icon}</span>
                  <span class="bc-slot-name">${s.name} <span style="color:var(--text-dim);font-size:0.6rem">${s.tier}</span></span>
                  <span class="bc-slot-bonus">${Object.entries(s.stat_bonus).map(([k,v]) => `+${v} ${k.toUpperCase()}`).join(' ')}</span>
                </div>
              `).join('')}
            </div>`
        }
      </div>
    `;
  }).join('');
}

function pickBenefit(id, el, tierClass) {
  document.querySelectorAll('.benefit-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected', tierClass);
  character.benefit = id;
  document.getElementById('btn-step5').disabled = false;
}

// ─── Step 6: Summary ────────────────────────────────────────────────────────

function populateSummary() {
  const pkg    = BENEFITS?.packages.find(p => p.id === character.benefit);
  const fLabel = { protoss: '⚡ PROTOSS · Engineering', terran: '🏗️ TERRAN · Operations', zerg: '🦾 ZERG · Sales & Growth' };
  const container = document.getElementById('summary-card');
  container.innerHTML = `
    <div>
      <div class="summary-section-title">UNIT PROFILE</div>
      <div class="summary-row"><span class="summary-label">FACTION</span><span class="summary-value">${fLabel[character.faction] || '—'}</span></div>
      <div class="summary-row"><span class="summary-label">ROLE</span><span class="summary-value">${character.role?.title || '—'}</span></div>
      <div class="summary-row"><span class="summary-label">SALARY RANGE</span><span class="summary-value">${character.role ? fmtSalary(character.role.salary) + ' SGD' : '—'}</span></div>
      <div class="summary-row"><span class="summary-label">ARMOR</span><span class="summary-value">${pkg?.name || '—'} (${pkg?.tier || '—'})</span></div>

      <div class="summary-section-title" style="margin-top:16px">STATS</div>
      ${Object.entries(character.stats).map(([k,v]) => `
        <div class="summary-row">
          <span class="summary-label">${{str:'⚔️ STR',int:'🧠 INT',cha:'🗣️ CHA',dex:'⚡ DEX'}[k]}</span>
          <span class="summary-value">${v}</span>
        </div>
      `).join('')}
    </div>
    <div>
      <div class="summary-section-title">STARTING SKILLS</div>
      ${character.skills.map(s => `
        <div class="summary-row">
          <span class="summary-label">${s.name}</span>
          <span class="summary-value" style="color:var(--xp-color)">+${s.xp} XP</span>
        </div>
      `).join('') || '<div class="summary-row"><span class="summary-label">No skills selected</span></div>'}

      <div class="summary-section-title" style="margin-top:16px">BENEFITS SLOTS</div>
      ${(pkg?.slots || []).slice(0, 5).map(s => `
        <div class="summary-row">
          <span class="summary-label">${s.icon} ${s.name}</span>
          <span class="summary-value" style="font-size:0.65rem">${s.tier}</span>
        </div>
      `).join('')}

      <div style="margin-top:20px;padding:12px;background:var(--bg-deep);border:1px solid var(--border);border-radius:3px;font-size:0.7rem;color:var(--text-dim);line-height:1.6">
        Starting XP: <strong style="color:var(--xp-color)">${character.skills.reduce((a,s)=>a+s.xp,0)} XP</strong><br>
        Level: <strong style="color:var(--protoss)">1</strong><br>
        Supply cost: <strong>1 unit</strong>
      </div>
    </div>
  `;
}

// ─── Auto-skip Step 1 if faction already chosen on index.html ───────────────
// select.js saves elixcraft_faction to sessionStorage before redirecting here.
// If it exists, pre-select that faction silently and jump straight to Step 2.

(function autoAdvanceFaction() {
  const saved = sessionStorage.getItem('elixcraft_faction');
  if (!saved) return;
  applyFactionTheme(saved);             // colour the whole UI immediately
  const card = document.querySelector(`.cc-faction-card[data-faction="${saved}"]`);
  if (card) pickFaction(saved, card);   // highlight card + set character.faction
  showStep(2);                          // skip faction step entirely
})();

// ─── Deploy ─────────────────────────────────────────────────────────────────

function deployUnit() {
  sessionStorage.setItem('elixcraft_character', JSON.stringify(character));
  sessionStorage.setItem('elixcraft_faction',   character.faction);
  sessionStorage.setItem('elixcraft_faction_badge',
    `${character.faction.toUpperCase()} · ${character.role?.title || 'UNIT'}`);

  // Persist to localStorage via GameState
  if (window.GameState) {
    GameState.create(character);
  }

  // Animate deploy
  const btn = document.querySelector('.deploy-btn');
  btn.textContent = '⚡ DEPLOYING…';
  btn.disabled = true;

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:#000;z-index:999;opacity:0;transition:opacity 0.6s ease;pointer-events:none';
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { overlay.style.opacity = '1'; });
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
}

// ─── Util ────────────────────────────────────────────────────────────────────

function showFlash(msg) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
    background:var(--bg-panel);border:1px solid var(--warning);color:var(--warning);
    font-family:var(--font-ui);font-size:0.65rem;letter-spacing:0.1em;
    padding:10px 20px;border-radius:3px;z-index:200;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}
