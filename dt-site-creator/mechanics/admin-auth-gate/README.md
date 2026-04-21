# Admin Auth Gate

A sessionStorage-backed password gate that blocks page content until the correct password is entered.

## What it does
On load, checks `sessionStorage.getItem('dtsite:admin-authed')`. If absent, shows a modal overlay with a password input. Submitted passwords are SHA-256 hashed and compared to a hard-coded hash in the snippet. On match, sets the flag and reveals the page.

## When to plug in
- Admin pages, internal dashboards, pre-release demos shared with trusted users.
- **Dashboard archetype:** core (every dashboard should be gated).
- **Transactional archetype:** core (admin panels that mutate data must be gated).

## ⚠ NOT production secure
- Hash is in client-side JS — a determined attacker can brute-force offline.
- No rate limiting, no lockout, no audit log.
- For real auth use Supabase RLS, NextAuth, or Auth0.

## Trade-offs
- **Pro:** Zero deps, 2-minute setup, blocks casual snoopers and bots.
- **Con:** Anyone who views source sees the hash.
- **Con:** No multi-user, no role-based access.

## How to use (3 steps)

1. Generate your password hash:
   ```javascript
   await dtAuthGate.hashPassword('your-strong-password')
   ```
2. Paste the returned hex string into `PASSWORD_HASH` in `snippet.html`.
3. Drop the snippet at the top of any page you want gated.

## Logout

Call `dtAuthGate.logout()` in console or from a button to clear and reprompt.

## Linked pitfalls
- `dash-weak-admin-pw` — use ≥16-char random password, not "admin123"
- `static-premature-admin-lock` — don't gate your own admin panel before dogfooding

## Sourced from
`dtws_works/admin.html` gate pattern, hardened with SHA-256.
