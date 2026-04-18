// ELIX ONBOARDING — Career Pathway Map (contextualised per role)

let JOBS_DATA   = window.ELIXCRAFT_JOBS;
let SKILLS_DATA = window.ELIXCRAFT_SKILLS;

// PLAYER and currentFaction are resolved after LAYOUT is defined (see bottom of file)

// ─── Role-specific skills mapping (role id → [skill ids from ELIXCRAFT_SKILLS]) ─

const ROLE_SKILLS = {
  // TECHNOLOGY — Software
  se1: ['sw4','sw6','cl2','dt1'],
  se2: ['sw1','sw6','cl2','dt1'],
  se3: ['sw1','sw2','cl5','sw6'],
  se4: ['sw2','cl4','ai7','ls1'],
  se5: ['sw2','ai7','ls2','cl4'],
  se6: ['ls2','ai7','ls3','sw2'],
  // TECHNOLOGY — Data/AI
  da1: ['dt1','dt3','sw4','dt5'],
  da2: ['dt2','dt4','ai2','dt1'],
  da3: ['ai3','ai4','ai2','dt4'],
  da4: ['ai2','ai5','cl3','sw2'],
  da5: ['ai5','ai7','cl4','ls1'],
  da6: ['ai6','ai7','ls2','ls3'],
  // TECHNOLOGY — Cybersec
  cs1: ['cy0','cy4','dt1','cl2'],
  cs2: ['cy2','cy1','cy0','cy4'],
  cs3: ['cy1','cy5','cy4','cy2'],
  cs4: ['cy3','cl4','cy5','cy1'],
  cs5: ['cy3','cy4','ls2','ls1'],
  // TECHNOLOGY — Cloud/Infra
  ci1: ['cl2','cl5','cl3'],
  ci2: ['cl3','cl5','cl4'],
  ci3: ['cl3','cl4','cl5','sw2'],
  ci4: ['cl1','cl4','sw2'],
  // TECHNOLOGY — Mgmt
  em1: ['ls3','sw6','ls1'],
  em2: ['ls3','ls2','ls5'],
  em3: ['ls2','ls5','ls1'],
  em4: ['ls2','ls1','ls5'],
  // OPERATIONS — Operations
  op1: ['op2','sw6','ls4'],
  op2: ['op2','dt5','op4'],
  op3: ['op2','op1','ls3'],
  op4: ['op1','ls2','op5'],
  op5: ['ls2','ls3','ls5'],
  // OPERATIONS — Finance
  fi1: ['fn1','dt1','dt3','fn6'],
  fi2: ['fn1','fn6','ls1','fn4'],
  fi3: ['fn1','fn3','ls2'],
  fi4: ['fn3','cy4','fn2'],
  fi5: ['fn1','fn2','fn5'],
  fi6: ['fn1','ls2','fn4'],
  // OPERATIONS — Procurement
  pr1: ['op3','ls4'],
  pr2: ['op3','fn1','ls1'],
  pr3: ['op3','ls2','fn1'],
  // OPERATIONS — Project Mgmt
  pm1: ['op1','sw6','ls4'],
  pm2: ['op1','sw6','ls3','op2'],
  pm3: ['op1','ls2','ls1','op5'],
  pm4: ['ls2','ls5','ls3'],
  // GROWTH — Sales
  sa1: ['mkt3','ls4','mkt1'],
  sa2: ['mkt3','ls1','mkt5'],
  sa3: ['mkt5','ls1','mkt3'],
  sa4: ['mkt5','ls2','ls1'],
  sa5: ['ls2','ls3','fn1'],
  // GROWTH — Marketing
  mk1: ['mkt1','mkt2','ls4'],
  mk2: ['mkt5','mkt3','dt3'],
  mk3: ['mkt4','mkt5','mkt3','mkt6'],
  mk4: ['ls2','mkt5','ls3'],
  // GROWTH — HR
  hr1: ['hr1','ls4','hr5'],
  hr2: ['hr1','hr2','hr3','hr5'],
  hr3: ['hr4','hr3','hr6','hr5'],
  hr4: ['hr6','hr4','ls1','ls3'],
  hr5: ['ls2','hr6','ls5','hr2'],
  // GROWTH — Product
  pd1: ['sw6','dt3','ls4','op4'],
  pd2: ['sw6','dt5','op4','ls1'],
  pd3: ['sw2','ls1','dt5','ls3'],
  pd4: ['ls2','ls3','sw2'],
};

// ─── Per-role contextualised descriptions ─────────────────────────────────────

const ROLE_DESC = {
  // TECHNOLOGY — Software
  se1:  'Entry-level engineer building features and fixing bugs. Works within Agile sprints, writes unit tests, and participates in code reviews. Common entry point from polytechnic or CS degree.',
  se2:  'Owns features end-to-end. Designs APIs, writes production code, and mentors junior engineers. Expected to work independently with minimal supervision.',
  se3:  'Technical lead for a product area. Drives architectural decisions, reviews design docs, and unblocks the team. Salary benchmarked against Hays SG 2025 IT band.',
  se4:  'Cross-team impact. Defines engineering standards, tackles hardest technical problems, and is consulted on system-wide design. Proxy for company-wide tech health.',
  se5:  'Sets the long-term technical vision for a major domain. Advises CTO-level decisions. Papers and patents expected. Rare role — fewer than 5 per 1,000 engineers in SG.',
  se6:  'Industry-leading engineer. Shapes industry direction. Speaks at conferences, publishes research, and defines what "good engineering" means across the organisation.',
  // TECHNOLOGY — Data/AI
  da1:  'Extracts insights from structured data using SQL and visualisation tools. Supports business decisions with dashboards and ad-hoc reports. Strong entry role via SkillsFuture ICT Framework.',
  da2:  'Builds predictive models and statistical analyses. Partners with engineering to deploy models to production. Python + scikit-learn + feature engineering daily.',
  da3:  'Leads a data science workstream. Owns complex modelling pipelines and mentors junior scientists. Works closely with product and engineering leads.',
  da4:  'Bridges data science and software engineering. Builds the training infrastructure, model serving layer, and monitoring. Kubernetes + MLflow in daily toolkit.',
  da5:  'Leads AI platform or major ML product line. Defines ML architecture, oversees model quality, and reports to Head of AI. GenAI integration now expected.',
  da6:  'Owns the entire data and AI capability. Builds the team, defines strategy, and presents to board. MAS AI governance compliance increasingly important in SG.',
  // TECHNOLOGY — Cybersec
  cs1:  'Monitors SIEM dashboards, triages alerts, and investigates incidents. Entry-level SOC role. CEH certification + MAS TRM Guidelines awareness required in SG financial sector.',
  cs2:  'Conducts authorised penetration tests on web apps, APIs, and networks. Writes detailed reports with CVSS scoring. OSCP certification highly valued.',
  cs3:  'Hunts threats proactively using MITRE ATT&CK. Analyses malware, tracks threat actors, and feeds intelligence into SOC operations.',
  cs4:  'Designs zero-trust security architecture for cloud environments. Bridges security and DevOps — "shift-left" security model across SDLC.',
  cs5:  'Executive accountability for information security. Reports to board. Drives MAS TRM compliance, business continuity planning, and crisis response across the organisation.',
  // TECHNOLOGY — Cloud/Infra
  ci1:  'Provisions and manages cloud infrastructure on AWS/Azure/GCP. Automates deployments, configures networking, and maintains cost governance. AWS SAA common cert pathway.',
  ci2:  'Owns CI/CD pipelines and deployment automation. Bridges Dev and Ops. GitOps, Helm, Docker, and Jenkins in daily use.',
  ci3:  'Ensures production systems meet SLOs. On-call rotation, capacity planning, and post-incident reviews. Google SRE model adapted for Singapore enterprise context.',
  ci4:  'Designs large-scale cloud solution blueprints across business units. Enterprise architecture + cost optimisation + cloud security aligned with MAS guidelines.',
  // TECHNOLOGY — Mgmt
  em1:  'Leads a squad of 4–8 engineers. Balances technical delivery with people management: 1:1s, career growth, performance calibration. Fork from IC track at LVL 7.',
  em2:  'Manages multiple squads or a full product engineering team. Owns headcount planning, hiring, and cross-functional stakeholder relationships.',
  em3:  'Accountable for an entire engineering division. Defines the engineering org strategy, builds culture, and represents engineering at VP level.',
  em4:  'C-suite engineering leader. Partners with CEO and CPO on product strategy. Owns engineering budget, OKRs, and engineering brand in the market.',
  // OPERATIONS — Operations
  op1:  'Coordinates operational workflows, manages schedules, and tracks KPIs. Strong role across logistics, manufacturing, and corporate services in SG.',
  op2:  'Analyses operational data to identify efficiency gaps. Produces management reports and supports process redesign projects using Lean or Six Sigma tools.',
  op3:  'Owns day-to-day operations for a business unit. Manages team performance, implements process improvements, and interfaces with Finance and HR.',
  op4:  'Drives operational excellence across multiple teams. Leads change management initiatives and is a key partner to the COO.',
  op5:  'Sets operational strategy for the entire organisation. Accountable for margins, capacity, and service delivery. Direct report to CEO/COO.',
  // OPERATIONS — Finance
  fi1:  'Builds financial models, prepares management accounts, and supports budgeting cycles. Strong Excel + Python skills expected. MAS regulatory awareness a plus.',
  fi2:  'Embedded in a business unit as the finance partner. Translates numbers into business decisions, advises on investments, and manages the annual budget.',
  fi3:  'Leads corporate finance activities: M&A, capital allocation, investor relations. MAS-regulated deals require deep compliance knowledge.',
  fi4:  'Ensures the organisation meets MAS, SGX, and AML/CFT regulatory requirements. Partners with Legal and Risk. PDPA compliance increasingly in scope.',
  fi5:  'Manages client investment portfolios. MAS Capital Markets Services licence required. Growing demand driven by Singapore\'s wealth management hub status.',
  fi6:  'Owns the full finance function. Reports to board on financial health, drives ESG-linked finance, and leads IPO or bond issuance processes.',
  // OPERATIONS — Procurement
  pr1:  'Raises purchase orders, manages supplier correspondence, and supports tendering. Common entry role in construction, government, and manufacturing sectors.',
  pr2:  'Manages supplier relationships, leads tenders, and negotiates contracts. Category management skills essential. GeBIZ experience valued in public sector roles.',
  pr3:  'Owns the procurement strategy, supplier development, and cost savings programme. Partners with Operations and Finance. ISO 20400 sustainable procurement awareness expected.',
  // OPERATIONS — Project Mgmt
  pm1:  'Supports project planning, scheduling, and status reporting. Jira and MS Project daily tools. Common entry role via SkillsFuture Engineering Services Framework.',
  pm2:  'Owns end-to-end delivery of a project. Manages scope, budget, timeline, and stakeholder communications. PMP certification standard at this level.',
  pm3:  'Leads complex, multi-stakeholder projects. Manages risk, governance, and programme-level reporting. Often embedded in large transformation programmes.',
  pm4:  'Accountable for a portfolio of projects or a major national programme. Interfaces with government agencies, boards, and C-suite. Change leadership critical.',
  // GROWTH — Sales
  sa1:  'Outbound prospecting role — cold calls, LinkedIn outreach, and pipeline qualification. High-velocity, metric-driven. Common entry into SaaS and FMCG sales in SG.',
  sa2:  'Owns full sales cycle from discovery to close. Quota-carrying with commission. CRM hygiene and product demos daily. Strong growth track in Singapore tech sales.',
  sa3:  'Manages larger accounts and complex enterprise deals. Negotiates contracts, manages multiple stakeholders, and mentors SDRs.',
  sa4:  'Drives new market entry and strategic partnerships. Mix of enterprise sales and business development. Often covers ASEAN region from Singapore HQ.',
  sa5:  'Owns the entire revenue function. Builds the sales team, defines GTM strategy, and presents pipeline to board. Reports to CEO.',
  // GROWTH — Marketing
  mk1:  'Executes digital campaigns across search, social, and content. Manages analytics dashboards and optimises ad spend. Strong SEO and SEM fundamentals required.',
  mk2:  'Growth-obsessed marketer owning acquisition metrics. A/B tests channels, optimises funnels, and scales what works. Data-driven, fast-paced role.',
  mk3:  'Owns the full digital marketing function for a brand or product line. Manages agencies, content strategy, and performance marketing budget.',
  mk4:  'Defines brand strategy and marketing vision. Oversees all marketing channels, brand partnerships, and PR. Increasingly responsible for ESG communications in SG.',
  // GROWTH — HR
  hr1:  'Handles recruitment coordination, onboarding, and basic HR administration. Familiar with CPF, MOM Employment Act, and MYCareersFuture postings.',
  hr2:  'Generalist covering the full HR lifecycle: recruitment, performance management, C&B, and employee relations. Key knowledge: Employment Act, TAFEP, and SkillsFuture.',
  hr3:  'Strategic HR partner embedded in a business unit. Advises leaders on org design, performance, and people strategy. Employment Act + TAFEP compliance expertise critical.',
  hr4:  'Senior advisor on complex ER issues, succession planning, and workforce analytics. Leads leadership development programmes aligned to SkillsFuture frameworks.',
  hr5:  'Chief People Officer function. Owns culture, hiring brand, rewards, and L&D strategy. Reports to CEO. MOM Tripartite Guidelines and FWA implementation in scope.',
  // GROWTH — Product
  pd1:  'Supports product discovery and delivery. Writes user stories, manages backlog grooming, and coordinates with engineering and design. Strong growth role via SkillsFuture.',
  pd2:  'Owns a product or feature area. Defines roadmap, prioritises backlog, and ships features. Works daily with engineers, designers, and customers.',
  pd3:  'Leads a product squad. Defines strategy for a product line, manages stakeholders, and is accountable for business metrics (DAU, retention, revenue).',
  pd4:  'Owns the entire product portfolio. Defines product vision, partners with CEO on company strategy, and builds the PM organisation.',
};

// ─── Layout blueprints ────────────────────────────────────────────────────────

const LAYOUT = {
  protoss: [
    { track:'software',   role:'se1', col:0, row:0,   icon:'👨‍💻' },
    { track:'software',   role:'se2', col:1, row:0,   icon:'⚙️'  },
    { track:'software',   role:'se3', col:2, row:0,   icon:'🔧'  },
    { track:'software',   role:'se4', col:3, row:0,   icon:'⚡'  },
    { track:'software',   role:'se5', col:4, row:0,   icon:'🔮'  },
    { track:'software',   role:'se6', col:5, row:0,   icon:'🌟'  },
    { track:'data_ai',    role:'da1', col:0, row:1.5, icon:'📊'  },
    { track:'data_ai',    role:'da2', col:1, row:1.5, icon:'🤖'  },
    { track:'data_ai',    role:'da3', col:2, row:1.5, icon:'🧠'  },
    { track:'data_ai',    role:'da4', col:2, row:2.5, icon:'⚡'  },
    { track:'data_ai',    role:'da5', col:3, row:2,   icon:'🌐'  },
    { track:'data_ai',    role:'da6', col:5, row:1.5, icon:'👑'  },
    { track:'cloud_infra',role:'ci1', col:0, row:4,   icon:'☁️'  },
    { track:'cloud_infra',role:'ci2', col:1, row:4,   icon:'🔄'  },
    { track:'cloud_infra',role:'ci3', col:2, row:4,   icon:'⚙️'  },
    { track:'cloud_infra',role:'ci4', col:3, row:4,   icon:'🏗️'  },
    { track:'cybersec',   role:'cs1', col:0, row:5.5, icon:'🛡️'  },
    { track:'cybersec',   role:'cs2', col:1, row:5.5, icon:'🔍'  },
    { track:'cybersec',   role:'cs3', col:2, row:5.5, icon:'🔍'  },
    { track:'cybersec',   role:'cs4', col:3, row:5.5, icon:'🔐'  },
    { track:'cybersec',   role:'cs5', col:5, row:5.5, icon:'🛡️'  },
    { track:'mgmt_eng',   role:'em1', col:4, row:0.6, icon:'👥'  },
    { track:'mgmt_eng',   role:'em2', col:4, row:1.6, icon:'📋'  },
    { track:'mgmt_eng',   role:'em3', col:5, row:2.5, icon:'🎯'  },
    { track:'mgmt_eng',   role:'em4', col:6, row:1.5, icon:'⭐'  },
  ],
  terran: [
    { track:'operations',  role:'op1', col:0, row:0,   icon:'📦'  },
    { track:'operations',  role:'op2', col:1, row:0,   icon:'📈'  },
    { track:'operations',  role:'op3', col:2, row:0,   icon:'⚙️'  },
    { track:'operations',  role:'op4', col:3, row:0,   icon:'🏗️'  },
    { track:'operations',  role:'op5', col:5, row:0,   icon:'🎯'  },
    { track:'finance',     role:'fi1', col:0, row:1.5, icon:'💹'  },
    { track:'finance',     role:'fi2', col:2, row:1.5, icon:'🤝'  },
    { track:'finance',     role:'fi3', col:5, row:1.5, icon:'🏦'  },
    { track:'finance',     role:'fi4', col:2, row:2.5, icon:'⚖️'  },
    { track:'finance',     role:'fi5', col:3, row:2,   icon:'💰'  },
    { track:'finance',     role:'fi6', col:6, row:1.5, icon:'👑'  },
    { track:'procurement', role:'pr1', col:0, row:3.5, icon:'🛒'  },
    { track:'procurement', role:'pr2', col:2, row:3.5, icon:'📋'  },
    { track:'procurement', role:'pr3', col:4, row:3.5, icon:'🏆'  },
    { track:'project_mgmt',role:'pm1', col:0, row:5,   icon:'📅'  },
    { track:'project_mgmt',role:'pm2', col:1, row:5,   icon:'📊'  },
    { track:'project_mgmt',role:'pm3', col:2, row:5,   icon:'⭐'  },
    { track:'project_mgmt',role:'pm4', col:4, row:5,   icon:'🎖️'  },
  ],
  zerg: [
    { track:'sales',      role:'sa1', col:0, row:0,   icon:'📞'  },
    { track:'sales',      role:'sa2', col:1, row:0,   icon:'🤝'  },
    { track:'sales',      role:'sa3', col:2, row:0,   icon:'💼'  },
    { track:'sales',      role:'sa4', col:3, row:0,   icon:'🚀'  },
    { track:'sales',      role:'sa5', col:5, row:0,   icon:'👑'  },
    { track:'marketing',  role:'mk1', col:0, row:1.5, icon:'📣'  },
    { track:'marketing',  role:'mk2', col:1, row:1.5, icon:'📈'  },
    { track:'marketing',  role:'mk3', col:2, row:1.5, icon:'🎯'  },
    { track:'marketing',  role:'mk4', col:5, row:1.5, icon:'🌟'  },
    { track:'hr_people',  role:'hr1', col:0, row:3,   icon:'🤝'  },
    { track:'hr_people',  role:'hr2', col:1, row:3,   icon:'👥'  },
    { track:'hr_people',  role:'hr3', col:2, row:3,   icon:'⚡'  },
    { track:'hr_people',  role:'hr4', col:3, row:3,   icon:'🏆'  },
    { track:'hr_people',  role:'hr5', col:5, row:3,   icon:'👑'  },
    { track:'product',    role:'pd1', col:0, row:4.5, icon:'🌱'  },
    { track:'product',    role:'pd2', col:1, row:4.5, icon:'📱'  },
    { track:'product',    role:'pd3', col:2, row:4.5, icon:'⭐'  },
    { track:'product',    role:'pd4', col:5, row:4.5, icon:'🚀'  },
  ],
};

// ─── Resolve player state (after LAYOUT is defined) ──────────────────────────

function loadPlayer() {
  let level = 1, faction = 'protoss', currentRole = null, playerName = 'Team Member';
  if (window.GameState && GameState.exists()) {
    const state = GameState.get();
    level       = state.player?.level    || 1;
    faction     = state.player?.faction  || 'protoss';
    currentRole = state.player?.role?.id || null;
    playerName  = state.player?.name    || 'Team Member';
  } else {
    const char = (() => { try { return JSON.parse(sessionStorage.getItem('elixonboarding_character')); } catch { return null; } })();
    if (char) {
      faction     = char.faction      || 'protoss';
      currentRole = char.role?.id     || null;
      playerName  = char.name         || 'Team Member';
      if (window.GameState && char.skills) {
        const xp = char.skills.reduce((a, s) => a + (s.xp || 0), 0);
        level = GameState.xpToLevel(xp);
      }
    } else {
      faction = sessionStorage.getItem('elixonboarding_faction') || 'protoss';
    }
  }
  return { level, faction, currentRole, playerName };
}

const PLAYER = loadPlayer();
let currentFaction = (PLAYER.faction in LAYOUT) ? PLAYER.faction : 'protoss';

const NODE_W = 130, NODE_H = 90, COL_GAP = 160, ROW_GAP = 120, OFFSET_X = 60, OFFSET_Y = 50;

// ─── Build flat skill lookup from ELIXCRAFT_SKILLS ───────────────────────────

function buildSkillLookup() {
  const map = {};
  if (!SKILLS_DATA) return map;
  for (const cat of SKILLS_DATA.categories) {
    for (const sk of cat.skills) {
      map[sk.id] = { ...sk, catName: cat.name, catIcon: cat.icon };
    }
  }
  return map;
}
const SKILL_LOOKUP = buildSkillLookup();

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  // Activate the player's department tab
  document.querySelectorAll('.cm-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.faction === currentFaction);
  });
  renderMap(currentFaction);

  // Auto-show current role detail if player has one
  if (PLAYER.currentRole) {
    setTimeout(() => {
      const node = document.getElementById(`node-${PLAYER.currentRole}`);
      if (node) node.click();
    }, 400);
  }
}

init();

// ─── Map Rendering ────────────────────────────────────────────────────────────

function switchFaction(faction, btn) {
  document.querySelectorAll('.cm-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  currentFaction = faction;
  renderMap(faction);
  clearDetailPanel();
}

function renderMap(faction) {
  const map        = document.getElementById('cm-map');
  const factionData = JOBS_DATA?.factions[faction];
  const layout     = LAYOUT[faction] || [];
  map.innerHTML    = '';

  // Build role lookup from JOBS_DATA
  const roleLookup = {};
  if (factionData) {
    factionData.tracks.forEach(track => {
      track.roles.forEach(role => {
        roleLookup[role.id] = { ...role, trackName: track.name, trackId: track.id, source: track.source };
      });
    });
  }

  const factionColors = { protoss: '#ffd700', terran: '#4a9eff', zerg: '#b44fff' };
  const factionColor  = factionColors[faction];

  map.insertAdjacentHTML('afterbegin', drawConnections(layout, faction));

  layout.forEach(item => {
    const role = roleLookup[item.role];
    if (!role) return;

    const x = OFFSET_X + item.col * COL_GAP;
    const y = OFFSET_Y + item.row * ROW_GAP;

    // Determine node state relative to the viewing player's level
    // If we're viewing our own department, use PLAYER context; otherwise neutral
    const isOwnFaction = faction === currentFaction && faction === PLAYER.faction;
    const playerLevel  = isOwnFaction ? PLAYER.level : 1;

    let state;
    if (isOwnFaction && item.role === PLAYER.currentRole) {
      state = 'active';
    } else if (role.level[0] <= playerLevel) {
      state = 'unlocked';
    } else if (role.level[0] <= playerLevel + 3) {
      state = 'locked';
    } else {
      state = 'fog';
    }

    const salaryStr = role.salary_sgd
      ? `$${(role.salary_sgd[0]/1000).toFixed(0)}k–$${(role.salary_sgd[1]/1000).toFixed(0)}k`
      : '';

    const node = document.createElement('div');
    node.className = `map-node node-${state}`;
    node.id = `node-${item.role}`;
    node.style.cssText = `left:${x}px;top:${y}px;width:${NODE_W}px;`;
    node.style.setProperty('--faction-color', factionColor);
    node.innerHTML = `
      <div class="mn-icon">${item.icon}</div>
      <div class="mn-level">LVL ${role.level[0]}–${role.level[1]}</div>
      <div class="mn-title">${role.title}</div>
      ${salaryStr ? `<div class="mn-salary">${salaryStr}</div>` : ''}
      ${state === 'active'   ? '<div class="mn-badge badge-active">YOU</div>' : ''}
      ${state === 'unlocked' ? '<div class="mn-badge badge-unlocked">✓</div>' : ''}
      ${state === 'locked'   ? '<div class="mn-badge badge-locked">🔒</div>' : ''}
    `;
    if (state !== 'fog') {
      node.onclick = () => showDetail(role, item, state, factionColor, faction);
    }
    map.appendChild(node);
  });

  setTimeout(() => drawFog(layout), 50);
}

function drawConnections(layout, faction) {
  const byTrack = {};
  layout.forEach(item => {
    if (!byTrack[item.track]) byTrack[item.track] = [];
    byTrack[item.track].push(item);
  });

  const lines = [];
  Object.values(byTrack).forEach(items => {
    const sorted = items.sort((a, b) => a.col - b.col || a.row - b.row);
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i], b = sorted[i+1];
      const x1 = OFFSET_X + a.col * COL_GAP + NODE_W;
      const y1 = OFFSET_Y + a.row * ROW_GAP + NODE_H / 2;
      const x2 = OFFSET_X + b.col * COL_GAP;
      const y2 = OFFSET_Y + b.row * ROW_GAP + NODE_H / 2;
      const mx = (x1 + x2) / 2;
      lines.push(`<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}"
        fill="none" stroke="#1a3050" stroke-width="1.5" stroke-dasharray="4,3" />`);
    }
  });

  const maxX = Math.max(...layout.map(n => OFFSET_X + n.col * COL_GAP + NODE_W)) + 60;
  const maxY = Math.max(...layout.map(n => OFFSET_Y + n.row * ROW_GAP + NODE_H)) + 60;
  return `<svg class="cm-connector" style="width:${maxX}px;height:${maxY}px;position:absolute;top:0;left:0;z-index:1">${lines.join('')}</svg>`;
}

function drawFog(layout) {
  const canvas = document.getElementById('fog-canvas');
  const wrap   = document.querySelector('.cm-canvas-wrap');
  if (!canvas || !wrap) return;

  const maxX = Math.max(...layout.map(n => OFFSET_X + n.col * COL_GAP + NODE_W)) + 80;
  const maxY = Math.max(...layout.map(n => OFFSET_Y + n.row * ROW_GAP + NODE_H)) + 80;
  canvas.width  = maxX;
  canvas.height = maxY;
  canvas.style.cssText = `width:${maxX}px;height:${maxY}px;`;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, maxX, maxY);

  layout.forEach(item => {
    if (item.col < 3) return;
    const density = Math.min(0.72, (item.col - 2) * 0.14);
    const x = OFFSET_X + item.col * COL_GAP - 10;
    const y = OFFSET_Y + item.row * ROW_GAP - 10;
    const grad = ctx.createRadialGradient(
      x + NODE_W/2, y + NODE_H/2, 20,
      x + NODE_W/2, y + NODE_H/2, NODE_W * 1.2
    );
    grad.addColorStop(0, `rgba(4,8,16,${density})`);
    grad.addColorStop(1, `rgba(4,8,16,0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(x - 20, y - 20, NODE_W + 40, NODE_H + 40);
  });
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function showDetail(role, item, state, factionColor, faction) {
  const panel = document.getElementById('cdp-body');

  const stateColors = {
    active:   factionColor,
    unlocked: '#00e676',
    locked:   '#ffa726',
    fog:      'var(--text-dim)',
  };
  const stateLabels = {
    active:   '▶ YOUR CURRENT ROLE',
    unlocked: '✓ UNLOCKED',
    locked:   `🔒 LOCKED — REACH LEVEL ${role.level[0]}`,
    fog:      '🌫️ HIDDEN — PATH NOT YET VISIBLE',
  };

  const salaryFmt = role.salary_sgd
    ? `SGD $${role.salary_sgd[0].toLocaleString()} – $${role.salary_sgd[1].toLocaleString()} / month`
    : 'Salary data unavailable';

  // Role-specific skills
  const skillIds   = ROLE_SKILLS[role.id] || [];
  const roleSkills = skillIds
    .map(id => SKILL_LOOKUP[id])
    .filter(Boolean);

  // Role-specific description
  const desc = ROLE_DESC[role.id] || `${role.title} — ${role.trackName} track. Consult SkillsFuture SG and MyCareersFuture for detailed competency requirements.`;

  // XP to next level
  const xpLabel = role.xp_to_next ? `${role.xp_to_next.toLocaleString()} XP to next role` : 'Senior-most role in track';

  panel.innerHTML = `
    <div style="padding:4px 8px;background:rgba(255,255,255,0.05);border-left:3px solid ${stateColors[state]};
      font-family:var(--font-ui);font-size:0.5rem;letter-spacing:0.15em;color:${stateColors[state]};margin-bottom:12px">
      ${stateLabels[state]}
    </div>

    <div class="cdp-role-name">${role.title}</div>
    <div class="cdp-track">${role.trackName}</div>
    <div class="cdp-level" style="color:${factionColor}">Level ${role.level[0]} – ${role.level[1]}</div>
    <div class="cdp-salary">${salaryFmt}</div>
    <div class="cdp-source" style="margin-bottom:2px">Source: ${role.source}</div>
    <div class="cdp-source" style="color:${factionColor}40">⬡ ${xpLabel}</div>

    <div style="margin:12px 0 6px;padding:10px 12px;background:#070d1a;border:1px solid #1a3050;border-radius:3px;font-size:0.7rem;color:#a0b8c8;line-height:1.65">
      ${desc}
    </div>

    ${roleSkills.length ? `
      <div class="cdp-section-title">REQUIRED SKILLS</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${roleSkills.map(sk => `
          <div class="cdp-skill-row" style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:#070d1a;border:1px solid #1a3050;border-radius:2px">
            <span style="font-size:1rem;flex-shrink:0">${sk.catIcon || '⚡'}</span>
            <div style="flex:1;min-width:0">
              <div style="font-size:0.72rem;color:#c8d8e8;font-weight:600">${sk.name}</div>
              <div style="font-size:0.58rem;color:#5a7a9a;margin-top:1px">${sk.catName} · TIER ${sk.tier}</div>
            </div>
            <span style="font-family:'Orbitron',monospace;font-size:0.45rem;color:var(--xp-color, #ffd700);flex-shrink:0">+${sk.xp} XP</span>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <div class="cdp-section-title" style="margin-top:12px">UNLOCK CONDITION</div>
    <div class="cdp-unlock-row" style="font-size:0.7rem;color:#a0b8c8;line-height:1.5">
      ${state === 'active'
        ? `✅ This is your active role (${PLAYER.playerName}). Complete objectives and earn XP to advance. ${xpLabel}.`
        : state === 'unlocked'
        ? `✅ Level requirement met (LVL ${role.level[0]}+). ${roleSkills.length ? 'Add required skills via professional development to maximise your rating.' : ''}`
        : state === 'locked'
        ? `🔒 Reach Level ${role.level[0]} and complete ${roleSkills.slice(0,2).map(s=>s.name).join(' + ')||'prerequisite training'} to unlock.`
        : `🌫️ This path is not yet visible. Keep levelling up to reveal what lies ahead.`
      }
    </div>

    <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px">
      ${state === 'active'
        ? `<button class="cdp-btn" onclick="window.location='boss-battle.html'">📋 START PERFORMANCE REVIEW</button>`
        : state === 'unlocked'
        ? `<button class="cdp-btn" onclick="setTargetRole('${role.id}','${role.title}')">→ SET AS TARGET ROLE</button>`
        : state === 'locked'
        ? `<button class="cdp-btn disabled-btn" disabled>🔒 REACH LEVEL ${role.level[0]} TO UNLOCK</button>`
        : `<button class="cdp-btn disabled-btn" disabled>🌫️ LEVEL UP TO REVEAL</button>`
      }
      ${state !== 'fog' && state !== 'active'
        ? `<button class="cdp-btn" style="background:transparent;border:1px solid #2a4060;color:#5a7a9a;font-size:0.52rem"
             onclick="window.location='boss-battle.html'">📋 RUN PERFORMANCE REVIEW</button>`
        : ''
      }
    </div>
  `;
}

// ─── Target Role ──────────────────────────────────────────────────────────────

function setTargetRole(roleId, roleTitle) {
  sessionStorage.setItem('elixonboarding_target_role', roleId);
  sessionStorage.setItem('elixonboarding_target_role_title', roleTitle);
  const node = document.getElementById(`node-${roleId}`);
  if (node) {
    node.style.boxShadow = '0 0 30px var(--faction-color, #ffd700)';
    setTimeout(() => node.style.boxShadow = '', 1500);
  }
  showLevelUp('TARGET ROLE SET', `${roleTitle} — Complete objectives to unlock this path`);
}

function clearDetailPanel() {
  document.getElementById('cdp-body').innerHTML = `
    <p style="color:var(--text-dim);font-size:0.75rem;line-height:1.6">
      Click any career node on the map to view role details, required skills, salary benchmarks, and unlock conditions.
    </p>
    <div class="cdp-tip">🗺️ Nodes that are hidden represent paths not yet visible. Level up and complete objectives to reveal them.</div>
  `;
}

// ─── Level-up Bar ─────────────────────────────────────────────────────────────

function showLevelUp(title, sub) {
  document.getElementById('lu-title').textContent = title;
  document.getElementById('lu-sub').textContent   = sub;
  document.getElementById('levelup-bar').classList.add('show');
}
function dismissLevelUp() {
  document.getElementById('levelup-bar').classList.remove('show');
}

setTimeout(() => {
  const nextRole = getNextRoleLabel();
  if (nextRole) showLevelUp('NEXT MILESTONE', nextRole);
}, 2000);

function getNextRoleLabel() {
  if (!PLAYER.currentRole || !PLAYER.faction) return null;
  const layout = LAYOUT[PLAYER.faction] || [];
  const factionData = JOBS_DATA?.factions[PLAYER.faction];
  if (!factionData) return null;

  const roleLookup = {};
  factionData.tracks.forEach(t => t.roles.forEach(r => { roleLookup[r.id] = r; }));

  // Find current role's track, then get next role in same track
  const current = layout.find(n => n.role === PLAYER.currentRole);
  if (!current) return null;

  const trackNodes = layout
    .filter(n => n.track === current.track)
    .sort((a, b) => a.col - b.col);

  const idx = trackNodes.findIndex(n => n.role === PLAYER.currentRole);
  if (idx < 0 || idx >= trackNodes.length - 1) return null;

  const next = roleLookup[trackNodes[idx + 1].role];
  if (!next) return null;
  return `${next.title} — Reach Level ${next.level[0]} · ${next.xp_to_next ? next.xp_to_next.toLocaleString() + ' XP' : 'Max tier'}`;
}
