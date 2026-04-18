// Department selection screen logic

const FACTION_DATA = {
  terran:  { name: 'Operations',    color: '#4a9eff', badge: 'OPERATIONS' },
  protoss: { name: 'Engineering',   color: '#ffd700', badge: 'TECHNOLOGY' },
  zerg:    { name: 'Sales & Growth', color: '#b44fff', badge: 'GROWTH' },
};

function selectFaction(faction) {
  const data   = FACTION_DATA[faction];
  const overlay = document.getElementById('transition-overlay');

  // Save to session
  sessionStorage.setItem('elixonboarding_faction', faction);
  sessionStorage.setItem('elixonboarding_faction_badge', data.badge);

  // Flash effect on card
  const card = document.querySelector(`[data-faction="${faction}"]`);
  card.style.boxShadow = `0 0 40px ${data.color}`;

  // Transition to onboarding wizard
  setTimeout(() => {
    overlay.classList.add('active');
    setTimeout(() => {
      window.location.href = 'character-create.html';
    }, 500);
  }, 150);
}

// Keyboard: press 1, 2, 3 to pick department
document.addEventListener('keydown', e => {
  if (e.key === '1') selectFaction('terran');
  if (e.key === '2') selectFaction('protoss');
  if (e.key === '3') selectFaction('zerg');
});
