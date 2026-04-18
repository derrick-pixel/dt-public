// ELIXCRAFT — Game State Manager (localStorage persistence)
// All game state lives in localStorage under key 'elixcraft_save'

// ─── Role-Based Onboarding Quest Templates ───────────────────────────────────
const ROLE_QUEST_TEMPLATES = {
  protoss: [
    { id: 'ob1', name: 'Complete Pre-Deployment Briefing',        type: 'ONBOARDING', status: 'active',    progress: 0, deadline: 'Day 1',       reward: '+185 XP, Deployment Clearance' },
    { id: 'ob2', name: 'Set Up Dev Environment & Access',         type: 'ONBOARDING', status: 'available', progress: 0, deadline: 'Day 3',        reward: '+30 XP, +5 INT' },
    { id: 'ob3', name: 'Complete Codebase Architecture Review',   type: 'TRAINING',   status: 'available', progress: 0, deadline: 'Day 7',        reward: '+40 XP, Tech Tree unlock' },
    { id: 'ob4', name: 'Ship First Pull Request',                 type: 'MILESTONE',  status: 'available', progress: 0, deadline: 'Day 14',       reward: '+60 XP, +5 DEX' },
    { id: 'ob5', name: 'Complete 30-Day Engineering Review',      type: 'BOSS',       status: 'available', progress: 0, deadline: 'Day 30',       reward: '+100 XP, LVL up eligible' },
    { id: 'q2',  name: 'Deliver Q2 Sprint Goals',                 type: 'MILESTONE',  status: 'available', progress: 0, deadline: 'Jun 2026',     reward: '+3% salary increment' },
    { id: 'q4',  name: 'SkillsFuture Certification',              type: 'TRAINING',   status: 'available', progress: 0, deadline: 'Dec 2026',     reward: '+30 XP, +8 INT' },
    { id: 'q5',  name: 'Annual Performance Review',               type: 'BOSS',       status: 'available', progress: 0, deadline: 'Q4 2026',      reward: 'Promotion + +15% raise' },
  ],
  terran: [
    { id: 'ob1', name: 'Complete Pre-Deployment Briefing',        type: 'ONBOARDING', status: 'active',    progress: 0, deadline: 'Day 1',       reward: '+185 XP, Deployment Clearance' },
    { id: 'ob2', name: 'Map Current Operational Processes',       type: 'ONBOARDING', status: 'available', progress: 0, deadline: 'Day 5',        reward: '+30 XP, +5 STR' },
    { id: 'ob3', name: 'Shadow Cross-Functional Team Meeting',    type: 'TRAINING',   status: 'available', progress: 0, deadline: 'Day 7',        reward: '+25 XP, +5 CHA' },
    { id: 'ob4', name: 'Deliver First Process Improvement Report',type: 'MILESTONE',  status: 'available', progress: 0, deadline: 'Day 14',       reward: '+50 XP, +5 INT' },
    { id: 'ob5', name: 'Complete 30-Day Operations Review',       type: 'BOSS',       status: 'available', progress: 0, deadline: 'Day 30',       reward: '+100 XP, LVL up eligible' },
    { id: 'q2',  name: 'Deliver Q2 OKR Milestones',              type: 'MILESTONE',  status: 'available', progress: 0, deadline: 'Jun 2026',     reward: '+3% salary increment' },
    { id: 'q4',  name: 'SkillsFuture Certification',              type: 'TRAINING',   status: 'available', progress: 0, deadline: 'Dec 2026',     reward: '+30 XP, +8 STR' },
    { id: 'q5',  name: 'Annual Performance Review',               type: 'BOSS',       status: 'available', progress: 0, deadline: 'Q4 2026',      reward: 'Promotion + +15% raise' },
  ],
  zerg: [
    { id: 'ob1', name: 'Complete Pre-Deployment Briefing',        type: 'ONBOARDING', status: 'active',    progress: 0, deadline: 'Day 1',       reward: '+185 XP, Deployment Clearance' },
    { id: 'ob2', name: 'Learn Product & Pitch Playbook',          type: 'ONBOARDING', status: 'available', progress: 0, deadline: 'Day 3',        reward: '+30 XP, +5 CHA' },
    { id: 'ob3', name: 'Shadow 3 Discovery Calls with Sr. AE',   type: 'TRAINING',   status: 'available', progress: 0, deadline: 'Day 7',        reward: '+35 XP, +5 DEX' },
    { id: 'ob4', name: 'Log First 10 Outbound Contacts in CRM',  type: 'MILESTONE',  status: 'available', progress: 0, deadline: 'Day 14',       reward: '+50 XP, Pipeline unlock' },
    { id: 'ob5', name: 'Complete 30-Day Sales Ramp Review',       type: 'BOSS',       status: 'available', progress: 0, deadline: 'Day 30',       reward: '+100 XP, LVL up eligible' },
    { id: 'q2',  name: 'Hit Q2 Pipeline Target',                  type: 'MILESTONE',  status: 'available', progress: 0, deadline: 'Jun 2026',     reward: '+5% commission boost' },
    { id: 'q4',  name: 'SkillsFuture Sales Certification',        type: 'TRAINING',   status: 'available', progress: 0, deadline: 'Dec 2026',     reward: '+30 XP, +8 CHA' },
    { id: 'q5',  name: 'Annual Performance Review',               type: 'BOSS',       status: 'available', progress: 0, deadline: 'Q4 2026',      reward: 'Promotion + +15% raise' },
  ],
};

const GameState = (() => {

  const KEY = 'elixcraft_save';

  const DEFAULT = {
    version: 1,
    createdAt: null,
    updatedAt: null,

    player: {
      name:    'Commander',
      faction: 'protoss',
      track:   null,
      role:    { id: null, title: 'Unit', salary: [0, 0] },
      level:   1,
      xp:      0,
      xpToNext: 100,
      stats:   { str: 5, int: 5, cha: 5, dex: 5 },
      benefit: null,
    },

    resources: {
      minerals: 0,
      gas:      0,
      supply:   1,
    },

    skills: [],   // [{ id, name, xp, equippedAt }]

    quests: [
      { id: 'q1', name: 'Complete Onboarding Module',   type: 'TRAINING',  status: 'active',    progress: 0,  deadline: 'End of Q2 2026', reward: '+50 XP, +$200 minerals' },
      { id: 'q2', name: 'Deliver Q2 Sprint Goals',      type: 'MILESTONE', status: 'available', progress: 0,  deadline: 'Jun 2026',        reward: '+3% salary increment' },
      { id: 'q3', name: 'Mentor a Junior Unit',         type: 'LEADERSHIP',status: 'available', progress: 0,  deadline: 'Ongoing',          reward: '+20 XP, +5 CHA' },
      { id: 'q4', name: 'SkillsFuture Certification',   type: 'TRAINING',  status: 'available', progress: 0,  deadline: 'Dec 2026',         reward: '+30 XP, +8 INT' },
      { id: 'q5', name: 'Annual Performance Review',    type: 'BOSS',      status: 'available', progress: 0,  deadline: 'Q4 2026',          reward: 'Promotion + +15% raise' },
    ],

    roster: [
      { id: 'r1', initials: 'JT', name: 'Jamie Tan',    role: 'Senior Developer',  level: 5, xpPct: 68, str: 7,  int: 12, cha: 6,  dex: 9,  status: 'active',   faction: 'protoss' },
      { id: 'r2', initials: 'ML', name: 'Marcus Lim',   role: 'Operations Lead',   level: 4, xpPct: 45, str: 9,  int: 7,  cha: 10, dex: 8,  status: 'quest',    faction: 'terran'  },
      { id: 'r3', initials: 'PW', name: 'Priya Wong',   role: 'Sales Executive',   level: 3, xpPct: 82, str: 6,  int: 6,  cha: 14, dex: 8,  status: 'training', faction: 'zerg'    },
      { id: 'r4', initials: 'KN', name: 'Kevin Neo',    role: 'Data Analyst',      level: 6, xpPct: 30, str: 5,  int: 13, cha: 5,  dex: 7,  status: 'active',   faction: 'protoss' },
      { id: 'r5', initials: 'SH', name: 'Sophie Ho',    role: 'HR Business Partner',level:4, xpPct: 55, str: 7,  int: 8,  cha: 12, dex: 6,  status: 'active',   faction: 'terran'  },
    ],

    battleHistory: [],
    // [{ date, opponent, outcome, xpGained, round }]

    sectorDeployments: [],
    // [{ sectorId, sectorName, deployedAt }]

    specialisation: null,
    // { sectorId, sectorName, sectorIcon, quadrant, setAt }

    achievements: [],
    // [{ id, name, unlockedAt }]
  };

  // ─── Core API ────────────────────────────────────────────────────────────────

  function get() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function exists() {
    return get() !== null;
  }

  function save(state) {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function create(characterData) {
    const state = JSON.parse(JSON.stringify(DEFAULT)); // deep clone
    state.createdAt = new Date().toISOString();

    if (characterData) {
      state.player.name    = characterData.name    || 'Commander';
      state.player.faction = characterData.faction || 'protoss';
      state.player.track   = characterData.track   || null;
      state.player.role    = characterData.role    || state.player.role;
      state.player.stats   = characterData.stats   || state.player.stats;
      state.player.benefit = characterData.benefit || null;
      state.skills         = (characterData.skills || []).map(s => ({
        ...s, equippedAt: new Date().toISOString()
      }));
      // Starting XP from skills
      state.player.xp = characterData.skills
        ? characterData.skills.reduce((a, s) => a + (s.xp || 0), 0)
        : 0;
      state.player.level = xpToLevel(state.player.xp);

      // Inject role-based onboarding quest chain
      const faction = state.player.faction || 'protoss';
      state.quests = ROLE_QUEST_TEMPLATES[faction]
        ? JSON.parse(JSON.stringify(ROLE_QUEST_TEMPLATES[faction]))
        : JSON.parse(JSON.stringify(DEFAULT.quests));
    }

    save(state);
    return state;
  }

  function update(patch) {
    const state = get();
    if (!state) return null;
    const merged = deepMerge(state, patch);
    save(merged);
    return merged;
  }

  function reset() {
    localStorage.removeItem(KEY);
    // Also clear session
    sessionStorage.removeItem('elixcraft_character');
    sessionStorage.removeItem('elixcraft_faction');
    sessionStorage.removeItem('elixcraft_faction_badge');
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function addXP(amount) {
    const state = get();
    if (!state) return;
    state.player.xp += amount;
    state.player.level = xpToLevel(state.player.xp);
    state.resources.minerals += Math.floor(amount * 10); // XP → minerals
    save(state);
    return state;
  }

  function logBattle(result) {
    // result: { opponent, outcome, xpGained, round }
    const state = get();
    if (!state) return;
    state.battleHistory.unshift({
      date: new Date().toISOString(),
      ...result,
    });
    if (result.xpGained) {
      state.player.xp += result.xpGained;
      state.player.level = xpToLevel(state.player.xp);
    }
    save(state);
    return state;
  }

  function updateQuest(questId, progress, status) {
    const state = get();
    if (!state) return;
    const q = state.quests.find(q => q.id === questId);
    if (q) {
      if (progress !== undefined) q.progress = Math.min(100, Math.max(0, progress));
      if (status)   q.status   = status;
      if (q.progress >= 100) q.status = 'complete';
    }
    save(state);
    return state;
  }

  function setSpecialisation(sectorId, sectorName, sectorIcon, quadrant) {
    const state = get();
    if (!state) return;
    state.specialisation = { sectorId, sectorName, sectorIcon, quadrant, setAt: new Date().toISOString() };
    // Also log as a deployment
    deploySectorOnState(state, sectorId, sectorName);
    save(state);
    return state;
  }

  function deploySectorOnState(state, sectorId, sectorName) {
    const existing = state.sectorDeployments.find(d => d.sectorId === sectorId);
    if (!existing) {
      state.sectorDeployments.push({ sectorId, sectorName, deployedAt: new Date().toISOString() });
    }
  }

  function deploySector(sectorId, sectorName) {
    const state = get();
    if (!state) return;
    deploySectorOnState(state, sectorId, sectorName);
    save(state);
    return state;
  }

  function xpToLevel(xp) {
    // Level thresholds: 100, 250, 500, 900, 1500, 2400, 3800, 6000 …
    const thresholds = [0, 100, 250, 500, 900, 1500, 2400, 3800, 6000, 9500, 15000];
    let level = 1;
    for (let i = 1; i < thresholds.length; i++) {
      if (xp >= thresholds[i]) level = i + 1;
      else break;
    }
    return level;
  }

  function xpForLevel(level) {
    const thresholds = [0, 100, 250, 500, 900, 1500, 2400, 3800, 6000, 9500, 15000];
    return thresholds[Math.min(level, thresholds.length - 1)] || 0;
  }

  function xpProgressPct(xp, level) {
    const current = xpForLevel(level - 1);
    const next    = xpForLevel(level);
    if (next <= current) return 100;
    return Math.min(100, Math.round(((xp - current) / (next - current)) * 100));
  }

  function deepMerge(target, source) {
    const result = Object.assign({}, target);
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  return {
    get, exists, save, create, update, reset,
    addXP, logBattle, updateQuest, deploySector, setSpecialisation,
    xpToLevel, xpForLevel, xpProgressPct,
  };

})();

// Expose globally
window.GameState = GameState;
