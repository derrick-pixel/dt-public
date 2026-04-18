// Dashboard logic

// ─── Init ───────────────────────────────────────────────────────────────────

(function init() {
  const faction = sessionStorage.getItem('elixonboarding_faction') || 'protoss';
  const badge   = sessionStorage.getItem('elixonboarding_faction_badge') || 'TECHNOLOGY · ENGINEERING';
  const el = document.getElementById('hud-faction-badge');
  if (el) el.textContent = badge;

  // Load save state if available
  if (window.GameState && GameState.exists()) {
    const state = GameState.get();
    loadPlayerIntoCommandCard(state);
    const minerals = state.resources?.minerals || 0;
    const gas      = state.resources?.gas      || 0;
    const supply   = state.resources?.supply   || 1;
    animateCounter('res-minerals', 0, minerals, 1200, v => v.toLocaleString());
    animateCounter('res-gas',      0, gas,      800);
    animateCounter('res-supply',   0, supply,   600);
  } else {
    animateCounter('res-minerals', 0, 124500, 1200, v => v.toLocaleString());
    animateCounter('res-gas',      0, 48,     800);
    animateCounter('res-supply',   0, 34,     600);
  }

  updateClock();
  setInterval(updateClock, 60000);
})();

function loadPlayerIntoCommandCard(state) {
  if (!state?.player) return;
  const p = state.player;

  // Portrait
  const avatarEl = document.querySelector('.portrait-avatar');
  const nameEl   = document.querySelector('.portrait-name');
  const classEl  = document.querySelector('.portrait-class');
  const levelEl  = document.querySelector('.portrait-level');
  if (avatarEl && p.name) avatarEl.textContent = p.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  if (nameEl)  nameEl.textContent  = p.name || 'Team Member';
  if (classEl) classEl.textContent = `${p.role?.title || 'Team Member'} · ${p.faction === 'protoss' ? 'TECHNOLOGY' : p.faction === 'terran' ? 'OPERATIONS' : 'GROWTH'}`;
  if (levelEl) levelEl.textContent = `LEVEL ${p.level || 1}`;

  // Stats
  const stats = p.stats || {};
  ['str','int','cha','dex'].forEach(s => {
    const fill = document.querySelector(`[data-stat-key="${s}"] .stat-fill`);
    const num  = document.querySelector(`[data-stat-key="${s}"] .stat-num`);
    const val  = stats[s] || 5;
    if (fill) fill.style.width = (val * 10) + '%';
    if (num)  num.textContent  = val;
  });

  // XP bar
  if (window.GameState) {
    const pct = GameState.xpProgressPct(p.xp || 0, p.level || 1);
    const xpBar = document.querySelector('.portrait-xp');
    if (xpBar) xpBar.style.width = pct + '%';
  }

  // Specialisation badge under portrait
  const spec = state.specialisation;
  const specEl = document.getElementById('cmd-spec-badge');
  if (specEl && spec) {
    specEl.textContent = `${spec.sectorIcon} ${spec.sectorName}`;
    specEl.style.display = 'block';
  }
}

// ─── Clock ──────────────────────────────────────────────────────────────────

function updateClock() {
  const el = document.getElementById('hud-clock');
  if (!el) return;
  const now = new Date();
  const q   = Math.ceil((now.getMonth() + 1) / 3);
  const day = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 86400000);
  el.textContent = `Q${q} ${now.getFullYear()} · DAY ${day}`;
}

// ─── Animated Counters ──────────────────────────────────────────────────────

function animateCounter(id, from, to, duration, format) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  const fmt   = format || (v => Math.round(v));
  function step(now) {
    const t    = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = fmt(from + (to - from) * ease);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

function switchTab(tabId, btn) {
  document.querySelectorAll('.map-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.map-tab').forEach(el => el.classList.remove('active'));
  document.getElementById(tabId).classList.remove('hidden');
  btn.classList.add('active');
}

// ─── Team Member Selection → updates Profile Card ──────────────────────────────

function selectUnit(el, initials, name, role, level, xpPct, str, int, cha, dex, statusType) {
  // Highlight selected row
  document.querySelectorAll('.unit-item').forEach(u => u.classList.remove('selected-unit'));
  if (el && el.classList) el.classList.add('selected-unit');

  // Update portrait
  document.querySelector('.portrait-avatar').textContent   = initials;
  document.querySelector('.portrait-name').textContent     = name;
  document.querySelector('.portrait-class').textContent    = `${role} · TECHNOLOGY`;
  document.querySelector('.portrait-level').textContent    = `LEVEL ${level}`;

  // Update stats
  const stats = { str, int, cha, dex };
  ['str','int','cha','dex'].forEach(s => {
    const fill = document.querySelector(`[data-stat-key="${s}"] .stat-fill`);
    const num  = document.querySelector(`[data-stat-key="${s}"] .stat-num`);
    if (fill) fill.style.width = stats[s] + '%';
    if (num)  num.textContent  = stats[s];
  });

  // Update XP bar in profile card if present
  const xpRow = document.querySelector('.portrait-xp');
  if (xpRow) xpRow.style.width = xpPct + '%';

  // Toast
  const statusMap = { active:'● ACTIVE', quest:'⚡ ON OBJECTIVE', training:'📚 TRAINING', ghost:'RECRUITING' };
  showToast(`◈ Selected: ${name} — ${statusMap[statusType] || ''}`, '#ffd700');
}

// ─── Org Chart Node Detail ───────────────────────────────────────────────────

function showOrgDetail(title, name, desc, salary, tracks) {
  showDynamicModal(
    `🏗️ ${title}`,
    `
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div style="padding:10px 14px;background:#0a1628;border:1px solid #1a3050;border-radius:3px;">
        <div style="font-size:0.65rem;color:#5a7a9a;letter-spacing:0.15em;font-family:'Orbitron',monospace">DIVISION</div>
        <div style="font-size:1rem;color:#fff;font-weight:700;margin-top:4px">${name}</div>
        <div style="font-size:0.75rem;color:#a0b8c8;margin-top:6px;line-height:1.5">${desc}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div style="padding:10px;background:#0a1628;border:1px solid #1a3050;border-radius:3px;">
          <div style="font-size:0.55rem;color:#5a7a9a;font-family:'Orbitron',monospace;letter-spacing:0.15em">SALARY RANGE</div>
          <div style="font-size:0.8rem;color:#ffd700;margin-top:4px;font-family:'Orbitron',monospace">${salary}</div>
        </div>
        <div style="padding:10px;background:#0a1628;border:1px solid #1a3050;border-radius:3px;">
          <div style="font-size:0.55rem;color:#5a7a9a;font-family:'Orbitron',monospace;letter-spacing:0.15em">TRACKS</div>
          <div style="font-size:0.72rem;color:#c8d8e8;margin-top:4px">${tracks}</div>
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:4px;">
        <button onclick="window.location='career-map.html';closeModal()" style="flex:1;font-family:'Orbitron',monospace;font-size:0.6rem;letter-spacing:0.15em;padding:10px;background:#ffd700;color:#000;border:none;border-radius:2px;cursor:pointer;font-weight:700">
          🗺️ VIEW CAREER PATHWAY
        </button>
        <button onclick="closeModal()" style="flex:1;font-family:'Orbitron',monospace;font-size:0.6rem;letter-spacing:0.15em;padding:10px;background:transparent;color:#5a7a9a;border:1px solid #1a3050;border-radius:2px;cursor:pointer">
          CLOSE
        </button>
      </div>
    </div>
    `
  );
}

// ─── Objective Detail Modal ──────────────────────────────────────────────────

function showQuestDetail(name, type, desc, progress, deadline, reward, status) {
  const statusColors = { active:'#ffd700', available:'#00e676', complete:'#4a9eff', training:'#00e676' };
  const statusLabels = { active:'▶ IN PROGRESS', available:'◈ AVAILABLE', complete:'✓ COMPLETED', training:'📚 TRAINING' };
  const color = statusColors[status] || '#ffd700';

  showDynamicModal(
    `📋 ${name}`,
    `
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div style="padding:4px 10px;background:rgba(255,255,255,0.04);border-left:3px solid ${color};
        font-family:'Orbitron',monospace;font-size:0.5rem;letter-spacing:0.2em;color:${color}">
        ${type} · ${statusLabels[status] || 'ACTIVE'}
      </div>
      <p style="font-size:0.78rem;color:#a0b8c8;line-height:1.6">${desc}</p>
      <div>
        <div style="font-size:0.55rem;color:#5a7a9a;font-family:'Orbitron',monospace;letter-spacing:0.15em;margin-bottom:6px">PROGRESS</div>
        <div style="height:8px;background:#0d1e35;border-radius:4px;overflow:hidden;">
          <div style="width:${progress}%;height:100%;background:${color};border-radius:4px;box-shadow:0 0 8px ${color};transition:width 0.6s ease"></div>
        </div>
        <div style="font-size:0.6rem;color:${color};margin-top:4px;font-family:'Orbitron',monospace">${progress}% complete</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div style="padding:10px;background:#0a1628;border:1px solid #1a3050;border-radius:3px;">
          <div style="font-size:0.55rem;color:#5a7a9a;font-family:'Orbitron',monospace;letter-spacing:0.15em">DEADLINE</div>
          <div style="font-size:0.75rem;color:#c8d8e8;margin-top:4px">${deadline}</div>
        </div>
        <div style="padding:10px;background:#0a1628;border:1px solid #1a3050;border-radius:3px;">
          <div style="font-size:0.55rem;color:#5a7a9a;font-family:'Orbitron',monospace;letter-spacing:0.15em">REWARD</div>
          <div style="font-size:0.72rem;color:#00e676;margin-top:4px">${reward}</div>
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:4px;">
        ${status !== 'complete' ? `
        <button onclick="logQuestProgress('${name}');closeModal()" style="flex:1;font-family:'Orbitron',monospace;font-size:0.6rem;letter-spacing:0.15em;padding:10px;background:${color};color:#000;border:none;border-radius:2px;cursor:pointer;font-weight:700">
          ${status === 'available' ? '▶ START OBJECTIVE' : '+ LOG PROGRESS'}
        </button>` : ''}
        <button onclick="closeModal()" style="flex:1;font-family:'Orbitron',monospace;font-size:0.6rem;letter-spacing:0.15em;padding:10px;background:transparent;color:#5a7a9a;border:1px solid #1a3050;border-radius:2px;cursor:pointer">
          CLOSE
        </button>
      </div>
    </div>
    `
  );
}

function logQuestProgress(name) {
  // Bump matching objective progress in save state
  if (window.GameState && GameState.exists()) {
    const state = GameState.get();
    const q = state.quests.find(q => q.name === name);
    if (q) {
      GameState.updateQuest(q.id, q.progress + 20, q.progress + 20 >= 100 ? 'complete' : 'active');
    }
    GameState.addXP(10);
  }
  showToast(`◈ Progress logged: ${name}`, '#00e676');
}

// ─── Career Pathway Node Detail ───────────────────────────────────────────────

function showTechDetail(title, level, state, salary, skills) {
  const stateColor = { active:'#ffd700', unlocked:'#00e676', locked:'#5a7a9a' }[state] || '#5a7a9a';
  const stateLabel = { active:'▶ CURRENT ROLE', unlocked:'✓ UNLOCKED', locked:'🔒 LOCKED' }[state] || '';

  showDynamicModal(
    `⚡ ${title}`,
    `
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div style="padding:4px 10px;background:rgba(255,255,255,0.04);border-left:3px solid ${stateColor};
        font-family:'Orbitron',monospace;font-size:0.5rem;letter-spacing:0.2em;color:${stateColor}">
        ${stateLabel}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div style="padding:10px;background:#0a1628;border:1px solid #1a3050;border-radius:3px;">
          <div style="font-size:0.55rem;color:#5a7a9a;font-family:'Orbitron',monospace;letter-spacing:0.15em">LEVEL</div>
          <div style="font-size:0.8rem;color:${stateColor};margin-top:4px;font-family:'Orbitron',monospace">${level}</div>
        </div>
        <div style="padding:10px;background:#0a1628;border:1px solid #1a3050;border-radius:3px;">
          <div style="font-size:0.55rem;color:#5a7a9a;font-family:'Orbitron',monospace;letter-spacing:0.15em">SALARY (SGD)</div>
          <div style="font-size:0.72rem;color:#ffd700;margin-top:4px">${salary}</div>
        </div>
      </div>
      <div>
        <div style="font-size:0.55rem;color:#5a7a9a;font-family:'Orbitron',monospace;letter-spacing:0.15em;margin-bottom:8px">
          ${state === 'locked' ? 'UNLOCK REQUIREMENTS' : 'KEY SKILLS'}
        </div>
        ${skills.split(' · ').map(s => `
          <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#0a1628;border:1px solid #1a3050;border-radius:2px;margin-bottom:4px;font-size:0.72rem;color:#c8d8e8">
            <span style="color:${stateColor}">${state === 'locked' ? '🔒' : '⚡'}</span> ${s}
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:10px;margin-top:4px;">
        <button onclick="window.location='career-map.html';closeModal()" style="flex:1;font-family:'Orbitron',monospace;font-size:0.6rem;letter-spacing:0.15em;padding:10px;background:${stateColor};color:#000;border:none;border-radius:2px;cursor:pointer;font-weight:700">
          🗺️ VIEW IN CAREER PATHWAY
        </button>
        ${state === 'active' ? `
        <button onclick="window.location='boss-battle.html';closeModal()" style="flex:1;font-family:'Orbitron',monospace;font-size:0.6rem;letter-spacing:0.15em;padding:10px;background:transparent;color:#ef5350;border:1px solid #ef5350;border-radius:2px;cursor:pointer;font-weight:700">
          📋 PERFORMANCE REVIEW
        </button>` : `
        <button onclick="closeModal()" style="flex:1;font-family:'Orbitron',monospace;font-size:0.6rem;letter-spacing:0.15em;padding:10px;background:transparent;color:#5a7a9a;border:1px solid #1a3050;border-radius:2px;cursor:pointer">
          CLOSE
        </button>`}
      </div>
    </div>
    `
  );
}

// ─── Modal System ────────────────────────────────────────────────────────────

const MODAL_CONTENT = {
  'skill-modal': {
    title: 'ADD SKILL — PROFESSIONAL DEVELOPMENT',
    body: `
      <p style="font-size:0.78rem;color:#a0b8c8;line-height:1.5;margin-bottom:16px">Select a skill to add to your professional development plan. Completing training objectives unlocks higher tiers.</p>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${[
          ['🤖','AI & Machine Learning',  'LVL 5 req · 30 days · +35% salary premium','#ffd700'],
          ['☁️','Cloud Architecture (AWS)','LVL 4 req · 20 days · +25% salary premium','#00e676'],
          ['🌀','Kubernetes & Docker',     'LVL 3 req · 15 days · +25% salary premium','#4a9eff'],
          ['📐','System Design',           'LVL 6 req · 45 days · +15% salary premium','#b44fff'],
          ['🛡️','Cybersecurity (CEH)',     'LVL 4 req · 25 days · +40% salary premium','#ef5350'],
        ].map(([icon, name, meta, color]) => `
          <div onclick="this.style.borderColor='${color}';this.style.background='rgba(255,255,255,0.03)'" style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:#0a1628;border:1px solid #1a3050;border-radius:3px;cursor:pointer;transition:all 0.15s;">
            <span style="font-size:1.2rem">${icon}</span>
            <div style="flex:1">
              <div style="font-size:0.82rem;color:#fff;font-weight:600">${name}</div>
              <div style="font-size:0.62rem;color:#5a7a9a;margin-top:3px">${meta}</div>
            </div>
            <button onclick="event.stopPropagation();addSkillToast('${name}')" style="font-family:'Orbitron',monospace;font-size:0.55rem;padding:7px 14px;background:${color};color:#000;border:none;border-radius:2px;cursor:pointer;letter-spacing:0.1em;font-weight:700">ADD</button>
          </div>
        `).join('')}
      </div>
    `,
  },
  'benefit-modal': {
    title: 'UPGRADE BENEFITS PACKAGE',
    body: `
      <p style="font-size:0.78rem;color:#a0b8c8;line-height:1.5;margin-bottom:4px">Upgrade your benefits package. All tiers comply with MOM Employment Act, CPF Board regulations, and SkillsFuture SG frameworks.</p>
      <p style="font-size:0.6rem;color:#5a7a9a;margin-bottom:14px">Source: MOM Singapore · CPF Board · TAFEP · SkillsFuture SG — 2025</p>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${[
          ['❤️','MediShield Life + IP Rider',   'GOLD → PLATINUM',   'Integrated Shield Plan, private ward A, family coverage (no co-pay)',              '+10 HEALTH'],
          ['🦷','Dental & Vision',               '$500 → $1,000/yr',  'Dental treatment + optical claims. Claimable via Medisave for eligible procedures','+8 HEALTH'],
          ['🏖️','Annual Leave',                  '18 → 21 days',      'Employment Act minimum: 14 days. Enhanced AL boosts Wellbeing & retention stats',  '+15 WELLBEING'],
          ['🤒','Outpatient & Hosp. Leave',      '14d + 60d hosp.',   'MOM statutory: 14 days outpatient sick leave + 60 days hospitalisation per year',  '+12 WELLBEING'],
          ['🏦','CPF Voluntary Top-Up (VC)',      'VC-OA / VC-SA',     'Employer voluntary CPF top-up above mandatory 17%. Grows retirement fund',        '+10 XP'],
          ['📚','SkillsFuture & L&D Budget',     '$1,500 → $3,000',   'Annual learning budget for SkillsFuture-accredited courses, certs & conferences',  '+15 INT'],
          ['🏠','Flexible Work Arrangement',     'Hybrid → Full FWA', 'Under MOM\'s Tripartite FWA Guidelines (effective Dec 2024). Boosts CHA & morale', '+12 CHA'],
          ['📈','Equity / Share Scheme (RSU)',   'New grant',         '4-year vest, 1-year cliff. Performance-accelerated schedule for senior members',    '+15 STR'],
        ].map(([icon, name, tier, desc, bonus]) => `
          <div onclick="this.style.borderColor='#ffd700'" style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:#0a1628;border:1px solid #1a3050;border-radius:3px;cursor:pointer;transition:all 0.15s;">
            <span style="font-size:1.1rem">${icon}</span>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span style="font-size:0.8rem;color:#fff;font-weight:600">${name}</span>
                <span style="font-family:'Orbitron',monospace;font-size:0.45rem;padding:2px 6px;background:rgba(255,215,0,0.15);color:#ffd700;border-radius:2px;white-space:nowrap">${tier}</span>
              </div>
              <div style="font-size:0.6rem;color:#5a7a9a;margin-top:3px;line-height:1.4">${desc}</div>
            </div>
            <button onclick="event.stopPropagation();upgradeBenefitToast('${name}')" style="font-family:'Orbitron',monospace;font-size:0.45rem;padding:6px 10px;background:transparent;color:#ffd700;border:1px solid #ffd700;border-radius:2px;cursor:pointer;letter-spacing:0.08em;white-space:nowrap;flex-shrink:0">
              ${bonus}
            </button>
          </div>
        `).join('')}
      </div>
    `,
  },
  'recruit-modal': {
    title: 'RECRUIT TEAM MEMBER — OPEN POSITIONS',
    body: `
      <p style="font-size:0.78rem;color:#a0b8c8;line-height:1.5;margin-bottom:16px">Add a new team member to your roster. Source: SkillsFuture SG + MyCareersFuture 2025 salary benchmarks.</p>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${[
          ['⚡','Principal Engineer',   'TECHNOLOGY','SGD $13,000–$18,000/mo','Headcount: +1 · ENG track'],
          ['⚙️','Senior Data Scientist','TECHNOLOGY','SGD $9,000–$12,000/mo', 'Headcount: +1 · Data/AI track'],
          ['🏗️','Operations Manager',   'OPERATIONS', 'SGD $5,500–$8,500/mo',  'Headcount: +1 · OPS track'],
          ['🦾','Business Dev Manager', 'GROWTH',   'SGD $8,000–$13,000/mo', 'Headcount: +1 · Sales track'],
          ['🤝','HR Business Partner',  'GROWTH',   'SGD $6,000–$10,000/mo', 'Headcount: +1 · People track'],
        ].map(([icon, name, dept, salary, headcount]) => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:#0a1628;border:1px solid #1a3050;border-radius:3px;">
            <span style="font-size:1.2rem">${icon}</span>
            <div style="flex:1">
              <div style="font-size:0.82rem;color:#fff;font-weight:600">${name}</div>
              <div style="font-size:0.62rem;color:#5a7a9a;margin-top:2px">${dept} · ${headcount}</div>
              <div style="font-size:0.65rem;color:#ffd700;margin-top:2px;font-family:'Orbitron',monospace">${salary}</div>
            </div>
            <button onclick="recruitToast('${name}')" style="font-family:'Orbitron',monospace;font-size:0.55rem;padding:7px 14px;background:#ffd700;color:#000;border:none;border-radius:2px;cursor:pointer;letter-spacing:0.1em;font-weight:700">HIRE</button>
          </div>
        `).join('')}
      </div>
    `,
  },
};

function openModal(id) {
  const data = MODAL_CONTENT[id];
  if (!data) return;
  showDynamicModal(data.title, data.body);
}

function showDynamicModal(title, body) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  content.innerHTML = `<h2 style="font-family:'Orbitron',monospace;font-size:0.85rem;letter-spacing:0.2em;color:#fff;margin-bottom:16px">${title}</h2>${body}`;
  overlay.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function showToast(msg, color = '#00e676') {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed;bottom:150px;left:50%;transform:translateX(-50%);
    background:#0a1628;border:1px solid ${color};color:${color};
    font-family:'Orbitron',monospace;font-size:0.7rem;letter-spacing:0.1em;
    padding:10px 20px;border-radius:3px;z-index:200;
    box-shadow:0 0 20px ${color}40;opacity:0;transition:opacity 0.2s;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.style.opacity = '1');
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 200); }, 2200);
}

function addSkillToast(name)      { showToast(`⚡ Skill added: ${name}`, '#ffd700'); closeModal(); }
function recruitToast(name)       { showToast(`✓ Recruiting started: ${name}`, '#00e676'); closeModal(); }
function upgradeBenefitToast(name){ showToast(`🛡️ Benefits upgraded: ${name}`, '#4a9eff');   closeModal(); }

// ─── Industry Specialisation Tab ─────────────────────────────────────────────

let _industryRendered = false;

function renderIndustryTab() {
  if (_industryRendered) return; // only render once
  _industryRendered = true;

  const industries = window.ELIXCRAFT_INDUSTRIES;
  if (!industries) {
    document.getElementById('industry-tab-inner').innerHTML =
      '<div style="padding:40px;text-align:center;color:var(--text-dim)">Industry data unavailable.</div>';
    return;
  }

  const saved = (window.GameState && GameState.exists()) ? GameState.get() : null;
  const currentSpec = saved?.specialisation?.sectorId || null;

  const factionColors = { protoss: '#ffd700', terran: '#4a9eff', zerg: '#b44fff', multi: '#00e676' };
  const factionLabels = { protoss: '⚡ TECHNOLOGY', terran: '🏗️ OPERATIONS', zerg: '🦾 GROWTH', multi: '◈ ALL' };

  // Build quadrant sections
  const quadrantHTML = industries.quadrants.map(q => {
    const sectors = industries.sectors.filter(s => s.quadrant === q.id);
    return `
      <div class="ind-quadrant">
        <div class="ind-quadrant-header" style="border-color:${q.color}40;color:${q.color}">
          <span class="ind-quadrant-label">${q.label}</span>
          <span class="ind-quadrant-sub">${q.subtitle}</span>
          <span class="ind-quadrant-count">${sectors.length} SECTORS</span>
        </div>
        <div class="ind-sector-grid">
          ${sectors.map(s => {
            const isSelected = s.id === currentSpec;
            const fc = factionColors[s.faction] || '#5a7a9a';
            const fl = factionLabels[s.faction] || s.faction.toUpperCase();
            return `
              <div class="ind-sector-card ${isSelected ? 'ind-selected' : ''}" id="indsec-${s.id}"
                   style="--sector-color:${s.color}"
                   onclick="showIndustryDetail('${s.id}')">
                <div class="ind-sec-glow"></div>
                <div class="ind-sec-top">
                  <span class="ind-sec-icon">${s.icon}</span>
                  <span class="ind-sec-faction" style="color:${fc};border-color:${fc}40">${fl}</span>
                </div>
                <div class="ind-sec-name">${s.name}</div>
                <div class="ind-sec-roles">${s.openRoles} open roles</div>
                ${isSelected ? '<div class="ind-sec-active-badge">◈ YOUR SECTOR</div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  // Current spec banner
  let specBanner = '';
  if (currentSpec) {
    const sec = industries.sectors.find(s => s.id === currentSpec);
    if (sec) {
      specBanner = `
        <div class="ind-spec-banner">
          <span class="ind-spec-icon">${sec.icon}</span>
          <div>
            <div class="ind-spec-label">ACTIVE SPECIALISATION</div>
            <div class="ind-spec-name">${sec.name} — ${sec.fullName}</div>
          </div>
          <span class="ind-spec-change" onclick="showToast('◈ Click any sector to change your specialisation','#ffd700')">CHANGE →</span>
        </div>
      `;
    }
  } else {
    specBanner = `
      <div class="ind-spec-banner ind-spec-empty">
        <span class="ind-spec-icon">⬡</span>
        <div>
          <div class="ind-spec-label">NO SPECIALISATION SET</div>
          <div class="ind-spec-name">Select a sector below to claim your industry expertise</div>
        </div>
      </div>
    `;
  }

  document.getElementById('industry-tab-inner').innerHTML = `
    ${specBanner}
    <div class="ind-grid">${quadrantHTML}</div>
    <div class="ind-footer">Source: ${industries.meta.source} · Updated ${industries.meta.updated}</div>
  `;
}

function showIndustryDetail(sectorId) {
  const industries = window.ELIXCRAFT_INDUSTRIES;
  if (!industries) return;
  const s = industries.sectors.find(s => s.id === sectorId);
  if (!s) return;

  const fmtSalary = ([lo, hi]) => `$${lo.toLocaleString()} – $${hi.toLocaleString()}/mo`;
  const factionColors = { protoss: '#ffd700', terran: '#4a9eff', zerg: '#b44fff', multi: '#00e676' };
  const fc = factionColors[s.faction] || '#5a7a9a';

  const saved = (window.GameState && GameState.exists()) ? GameState.get() : null;
  const isSelected = saved?.specialisation?.sectorId === sectorId;

  showDynamicModal(
    `${s.icon} ${s.fullName}`,
    `
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div style="padding:4px 10px;background:rgba(255,255,255,0.03);border-left:3px solid ${s.color};
           font-family:'Orbitron',monospace;font-size:0.45rem;letter-spacing:0.2em;color:${s.color}">
        ${s.quadrant.toUpperCase()} QUADRANT · ${s.openRoles} OPEN ROLES
      </div>

      <p style="font-size:0.76rem;color:#a0b8c8;line-height:1.6">${s.description}</p>

      <div style="padding:8px 12px;background:rgba(${fc === '#ffd700' ? '255,215,0' : fc === '#4a9eff' ? '74,158,255' : fc === '#b44fff' ? '180,79,255' : '0,230,118'},0.08);
           border:1px solid ${fc}30;border-radius:3px;font-size:0.65rem;color:${fc}">
        ${s.factionBonus}
      </div>

      <div>
        <div style="font-family:'Orbitron',monospace;font-size:0.5rem;letter-spacing:0.15em;color:#5a7a9a;margin-bottom:6px">ROLE LADDER</div>
        ${s.roles.map(r => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#0a1628;border:1px solid #1a3050;border-radius:2px;margin-bottom:3px">
            <span style="font-size:0.72rem;color:#c8d8e8">${r.title}</span>
            <span style="font-family:'Orbitron',monospace;font-size:0.5rem;color:#5a7a9a">LVL ${r.level[0]}–${r.level[1]}</span>
            <span style="font-family:'Orbitron',monospace;font-size:0.55rem;color:#ffd700">${fmtSalary(r.salary)} SGD</span>
          </div>
        `).join('')}
      </div>

      <div>
        <div style="font-family:'Orbitron',monospace;font-size:0.5rem;letter-spacing:0.15em;color:#5a7a9a;margin-bottom:6px">KEY SKILLS</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${s.skills.map(sk => `<span style="font-family:'Orbitron',monospace;font-size:0.45rem;padding:3px 8px;background:${s.color}18;border:1px solid ${s.color}35;color:${s.color};border-radius:2px">${sk}</span>`).join('')}
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:4px">
        ${isSelected
          ? `<div style="flex:1;text-align:center;font-family:'Orbitron',monospace;font-size:0.55rem;padding:10px;background:${s.color}20;border:1px solid ${s.color};color:${s.color};border-radius:2px">◈ ACTIVE SPECIALISATION</div>`
          : `<button onclick="setIndustrySpec('${s.id}','${s.name}','${s.icon}','${s.quadrant}');closeModal()"
               style="flex:1;font-family:'Orbitron',monospace;font-size:0.6rem;letter-spacing:0.12em;padding:10px;background:${s.color};color:#000;border:none;border-radius:2px;cursor:pointer;font-weight:700">
               ⬡ SET AS MY SPECIALISATION
             </button>`
        }
        <button onclick="closeModal()" style="font-family:'Orbitron',monospace;font-size:0.6rem;letter-spacing:0.1em;padding:10px 16px;background:transparent;color:#5a7a9a;border:1px solid #1a3050;border-radius:2px;cursor:pointer">CLOSE</button>
      </div>
    </div>
    `
  );
}

function setIndustrySpec(sectorId, sectorName, sectorIcon, quadrant) {
  if (window.GameState && GameState.exists()) {
    GameState.setSpecialisation(sectorId, sectorName, sectorIcon, quadrant);
    GameState.addXP(25); // bonus XP for setting specialisation
  }
  // Re-render the tab to show updated selection
  _industryRendered = false;
  renderIndustryTab();
  showToast(`${sectorIcon} Specialisation set: ${sectorName} · +25 XP`, '#00e676');
}

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === '1') switchTab('org-map',    document.querySelector('.map-tab'));
  if (e.key === '2') switchTab('quest-board',document.querySelectorAll('.map-tab')[1]);
  if (e.key === '3') switchTab('tech-tree',  document.querySelectorAll('.map-tab')[2]);
});
