# LocalStorage State — Past Use

## elixcraft
- **File:** `js/game-state.js`
- **Context:** Save slot holds character faction, XP, unlocked missions. Schema versioned so future updates can migrate old saves forward.

## elix-resume
- **File:** `js/editor.js`
- **Context:** Auto-saves draft every 2 seconds (debounced). Restores on page load. Version bumps when template schema changes.

## dtws_works
- **File:** `js/quiz.js`
- **Context:** Tracks which of 83 questions a user has answered correctly. Persists across sessions so training progress compounds.
