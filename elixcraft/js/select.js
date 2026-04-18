// Faction selection screen logic

const FACTION_DATA = {
  terran:  { name: 'Operations',    color: '#4a9eff', badge: 'TERRAN · OPERATIONS' },
  protoss: { name: 'Engineering',   color: '#ffd700', badge: 'PROTOSS · ENGINEERING' },
  zerg:    { name: 'Sales & Growth', color: '#b44fff', badge: 'ZERG · SALES & GROWTH' },
};

function selectFaction(faction) {
  const data   = FACTION_DATA[faction];
  const overlay = document.getElementById('transition-overlay');

  // Save to session
  sessionStorage.setItem('elixcraft_faction', faction);
  sessionStorage.setItem('elixcraft_faction_badge', data.badge);

  // Flash effect on card
  const card = document.querySelector(`[data-faction="${faction}"]`);
  card.style.boxShadow = `0 0 40px ${data.color}`;

  // Transition to dashboard
  setTimeout(() => {
    overlay.classList.add('active');
    setTimeout(() => {
      window.location.href = 'character-create.html';
    }, 500);
  }, 150);
}

// Keyboard: press 1, 2, 3 to pick faction
document.addEventListener('keydown', e => {
  if (e.key === '1') selectFaction('terran');
  if (e.key === '2') selectFaction('protoss');
  if (e.key === '3') selectFaction('zerg');
});
