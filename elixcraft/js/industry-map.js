// ELIXCRAFT — Industry Command Map
// 16 Sectors across 4 Quadrants · Elitez Group Industry Coverage

const INDUSTRIES = window.ELIXCRAFT_INDUSTRIES;
const QUADRANTS  = INDUSTRIES.quadrants;
const SECTORS    = INDUSTRIES.sectors;

const PLAYER_FACTION = sessionStorage.getItem('elixcraft_faction') || 'protoss';

let selectedSectorId = null;

// ─── Init ─────────────────────────────────────────────────────────────────────

(function init() {
  // Set faction badge
  const badgeMap = {
    protoss: 'PROTOSS · ENGINEERING',
    terran:  'TERRAN · OPERATIONS',
    zerg:    'ZERG · SALES & PEOPLE',
  };
  const badge = document.getElementById('im-faction-badge');
  if (badge) badge.textContent = badgeMap[PLAYER_FACTION] || 'PROTOSS · ENGINEERING';

  // Tally open roles
  const totalOpen = SECTORS.reduce((n, s) => n + s.openRoles, 0);
  document.getElementById('im-open-roles').textContent = totalOpen;
  document.getElementById('im-deployed-count').textContent = SECTORS.filter(s => s.status === 'deployed').length;

  renderGalaxy();
})();

// ─── Render Galaxy Grid ───────────────────────────────────────────────────────

function renderGalaxy() {
  const galaxy = document.getElementById('im-galaxy');
  galaxy.innerHTML = '';

  QUADRANTS.forEach(q => {
    const qSectors = SECTORS.filter(s => s.quadrant === q.id);

    const block = document.createElement('div');
    block.className = 'im-quadrant-block';

    // Quadrant header
    block.innerHTML = `
      <div class="im-quadrant-header" style="--q-color:${q.color}">
        <div class="im-q-label" style="color:${q.color}">${q.label}</div>
        <div class="im-q-sub">— ${q.subtitle}</div>
        <div class="im-q-count">${qSectors.length} SECTORS · ${qSectors.reduce((n,s)=>n+s.openRoles,0)} OPEN ROLES</div>
      </div>
    `;

    // Sector row
    const row = document.createElement('div');
    row.className = 'im-sector-row';

    qSectors.forEach(sector => {
      row.appendChild(buildSectorCard(sector));
    });

    block.appendChild(row);
    galaxy.appendChild(block);
  });
}

function buildSectorCard(sector) {
  const card = document.createElement('div');
  card.className = `im-sector ${sector.status === 'deployed' ? 'sector-active' : ''}`;
  card.id = `sector-${sector.id}`;
  card.style.setProperty('--sector-color', sector.color);

  const statusLabel = { deployed: '● DEPLOYED', available: '◈ AVAILABLE', restricted: '○ RESTRICTED' }[sector.status] || 'AVAILABLE';
  const statusClass = `status-${sector.status}`;

  const affinityClass = `is-affinity-${sector.faction}`;
  const affinityLabel = {
    protoss: '⚡ PROTOSS',
    terran:  '🏗️ TERRAN',
    zerg:    '🦾 ZERG',
    multi:   '◈ MULTI-FACTION',
  }[sector.faction] || sector.faction.toUpperCase();

  card.innerHTML = `
    <div class="is-status ${statusClass}">${statusLabel}</div>
    <div class="is-icon">${sector.icon}</div>
    <div class="is-name">${sector.name}</div>
    <div class="is-roles">${sector.openRoles} open roles · ${sector.roles.length} career tiers</div>
    <div class="is-affinity ${affinityClass}">${affinityLabel}</div>
  `;

  card.addEventListener('click', () => showSectorDetail(sector));
  return card;
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function showSectorDetail(sector) {
  // Deselect previous
  document.querySelectorAll('.im-sector').forEach(c => c.classList.remove('sector-selected'));
  const card = document.getElementById(`sector-${sector.id}`);
  if (card) card.classList.add('sector-selected');
  selectedSectorId = sector.id;

  const panel = document.getElementById('im-detail-inner');

  const affinityClass = `is-affinity-${sector.faction}`;
  const affinityLabel = {
    protoss: '⚡ PROTOSS AFFINITY',
    terran:  '🏗️ TERRAN AFFINITY',
    zerg:    '🦾 ZERG AFFINITY',
    multi:   '◈ ALL-FACTION SECTOR',
  }[sector.faction];

  const salaryMin = Math.min(...sector.roles.map(r => r.salary[0]));
  const salaryMax = Math.max(...sector.roles.map(r => r.salary[1]));

  const isPlayerFaction = sector.faction === PLAYER_FACTION || sector.faction === 'multi';
  const isDeployed = sector.status === 'deployed';

  const statusBarColor = { deployed:'var(--protoss)', available:'var(--success)', restricted:'#ef5350' }[sector.status];

  panel.innerHTML = `
    <div class="imd-sector-bar" style="--sector-color:${sector.color};color:${sector.color}">
      ${sector.quadrant.toUpperCase()} QUADRANT · ${QUADRANTS.find(q=>q.id===sector.quadrant)?.subtitle.toUpperCase()}
    </div>

    <div class="imd-icon">${sector.icon}</div>
    <div class="imd-name">${sector.name}</div>
    <div class="imd-fullname">${sector.fullName}</div>

    <div class="imd-desc">${sector.description}</div>

    <div class="imd-stats-row">
      <div class="imd-stat-box">
        <div class="imd-stat-label">SALARY RANGE (SGD/mo)</div>
        <div class="imd-stat-value" style="color:#ffd700;font-size:0.7rem">
          $${salaryMin.toLocaleString()} – $${salaryMax.toLocaleString()}
        </div>
      </div>
      <div class="imd-stat-box">
        <div class="imd-stat-label">SECTOR STATUS</div>
        <div class="imd-stat-value" style="color:${statusBarColor};font-size:0.7rem">
          ${sector.status.toUpperCase()}
        </div>
      </div>
      <div class="imd-stat-box">
        <div class="imd-stat-label">OPEN ROLES</div>
        <div class="imd-stat-value">${sector.openRoles}</div>
      </div>
      <div class="imd-stat-box">
        <div class="imd-stat-label">CAREER TIERS</div>
        <div class="imd-stat-value">${sector.roles.length}</div>
      </div>
    </div>

    ${isPlayerFaction ? `
    <div class="imd-bonus-box">
      🎖️ ${sector.factionBonus}
    </div>` : `
    <div class="imd-bonus-box" style="border-color:rgba(90,122,154,0.3);color:#5a7a9a;background:rgba(255,255,255,0.02)">
      ⚠️ Deploying here without ${sector.faction.toUpperCase()} affinity costs +25% budget. Recruit ${sector.faction.toUpperCase()} units first.
    </div>`}

    <div class="imd-section-title">AVAILABLE CAREER TIERS</div>
    ${sector.roles.map((r, i) => `
      <div class="imd-role-row" style="${i===0?'border-color:'+sector.color+';':''}" title="LVL ${r.level[0]}–${r.level[1]} · SGD $${r.salary[0].toLocaleString()}–$${r.salary[1].toLocaleString()}/mo">
        <div class="imd-role-lvl">LVL ${r.level[0]}–${r.level[1]}</div>
        <div class="imd-role-title">${r.title}</div>
        <div class="imd-role-salary">$${(r.salary[0]/1000).toFixed(0)}k–$${(r.salary[1]/1000).toFixed(0)}k</div>
      </div>
    `).join('')}

    <div class="imd-section-title">REQUIRED POWER-UPS (SKILLS)</div>
    <div class="imd-skills-wrap">
      ${sector.skills.map(sk => `<div class="imd-skill-pill">⚡ ${sk}</div>`).join('')}
    </div>

    <div class="imd-actions">
      ${isDeployed
        ? `<button class="imd-btn-primary" style="--sector-color:${sector.color}" onclick="window.location='career-map.html'">
             📡 VIEW DEPLOYED ROSTER
           </button>`
        : `<button class="imd-btn-primary" style="--sector-color:${sector.color}" onclick="deployToSector('${sector.id}','${sector.name}')">
             🚀 DEPLOY TO THIS SECTOR
           </button>`
      }
      <button class="imd-btn-secondary" onclick="window.location='character-create.html'">
        + CREATE UNIT FOR THIS SECTOR
      </button>
      <button class="imd-btn-secondary" onclick="window.location='boss-battle.html'">
        ⚔️ RUN SECTOR PERFORMANCE REVIEW
      </button>
    </div>
  `;
}

// ─── Deploy Action ────────────────────────────────────────────────────────────

function deployToSector(id, name) {
  sessionStorage.setItem('elixcraft_target_sector', id);
  sessionStorage.setItem('elixcraft_target_sector_name', name);

  const card = document.getElementById(`sector-${id}`);
  if (card) {
    card.classList.add('sector-active');
    // Flash pulse
    card.style.transition = 'box-shadow 0.1s';
    card.style.boxShadow = `0 0 40px ${SECTORS.find(s=>s.id===id)?.color || '#ffd700'}`;
    setTimeout(() => card.style.boxShadow = '', 800);
  }

  showToast(`🚀 Sector deployed: ${name} — units now routing to this sector`, '#00e676');

  // Re-render panel with deployed state
  const sector = SECTORS.find(s => s.id === id);
  if (sector) {
    sector.status = 'deployed';
    setTimeout(() => showSectorDetail(sector), 900);
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(msg, color = '#00e676') {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed;bottom:60px;left:50%;transform:translateX(-50%);
    background:#0a1628;border:1px solid ${color};color:${color};
    font-family:'Orbitron',monospace;font-size:0.68rem;letter-spacing:0.1em;
    padding:10px 22px;border-radius:3px;z-index:500;
    box-shadow:0 0 20px ${color}40;opacity:0;transition:opacity 0.2s;
    white-space:nowrap;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 220);
  }, 2800);
}
