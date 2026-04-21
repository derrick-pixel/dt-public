# LocalStorage State

Namespaced, versioned `localStorage` wrapper with schema migrations.

## What it does
Wraps `localStorage` with a `dtsite:` namespace and a version suffix (`:v1`, `:v2`, …). Provides `get` / `set` / `remove` / `migrate` so saves can be versioned and cleanly upgraded when the schema changes.

## When to plug in
- Any site that needs to persist state across page loads: cart, draft, progress, game save, user preferences.
- Mandatory for game, simulator, and dashboard archetypes.

## Trade-offs
- **Pro:** Zero dependencies, survives reload, 5-10MB storage per origin.
- **Con:** Synchronous API — do NOT call every keystroke on large blobs (debounce first).
- **Con:** Shared across tabs of the same origin. Use with care for concurrent writes.

## How to use (3 steps)

1. Include `snippet.html` on the page.
2. Write: `dtState.set('cart', [{ id: 'A', qty: 2 }]);`
3. Read: `const cart = dtState.get('cart', []);` (second arg is the default when key absent)

## Migrations

When you change a stored object's shape:

```javascript
dtState.migrate('cart', 1, 2, (oldCart) => {
  return oldCart.map(item => ({ ...item, addedAt: Date.now() }));
});
```

## Linked pitfalls
- `sim-progress-lost` — always persist learning state, not just in memory
- `trans-cart-memory-only` — same lesson for e-commerce carts
- `game-save-no-version` — version your save format from day one

## Sourced from
`elixcraft/save-manager.js`, `elix-resume/draft-store.js`, `dtws_works/quiz-progress.js`.
