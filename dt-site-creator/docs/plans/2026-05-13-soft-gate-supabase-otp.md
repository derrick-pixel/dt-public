# Soft Gate (Supabase OTP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire an email + 6-digit-OTP soft gate (Supabase Auth + Resend SMTP) onto dt-site-creator's full-prompt surfaces. Browse stays public; clicking through to full content opens the OTP modal.

**Architecture:** Three new files (`auth-config.js`, `auth.js`, `auth.css`) plus script-tag additions on all 7 HTML pages plus three JS files wrapped with `dtsAuth.requireAuthThen(...)`. Supabase JS via CDN. Session persists in localStorage by Supabase default. Modal HTML is injected from JS so we don't duplicate markup across 7 pages.

**Tech Stack:** Vanilla JS IIFE pattern. Supabase JS SDK v2 from CDN. CSS scoped under `.auth-*`. No build step.

**Spec:** `docs/specs/2026-05-13-soft-gate-supabase-otp-design.md` — read for full requirements.

**Repo conventions:**
- Commit + push after every meaningful change (GH Pages serves remote).
- `node --check dashboard/js/<file>.js` after every JS edit.
- After final push, sync dt-public mirror via `bash sync-wip.sh`.
- dt-site-creator is PUBLIC. Supabase anon keys are designed to be public-safe (RLS is the boundary). Real Supabase URL + anon key go in committed `auth-config.js`.

**User prerequisite (parallel to code work):** Create the Supabase project + connect Resend SMTP + set redirect URLs per spec §7-§8. The placeholder `auth-config.js` shipped in Task 1 will fail at runtime until the real URL + anon key are filled in.

---

## File Map

**Create:**
```
dashboard/js/auth-config.js     Supabase URL + anon key constants (placeholder, user fills in)
dashboard/js/auth.js            Supabase client wrapper + signInFlow + requireAuthThen + sign-out
dashboard/css/auth.css          Modal + header signed-in indicator styles
docs/RUN-AUTH-SETUP.md          Manual Supabase + Resend dashboard setup runbook
```

**Modify (script-tag + header-indicator on each):**
```
index.html, mechanics.html, assembly.html, showcase.html, ecosystem.html, pitfalls.html, setup.html
```

**Modify (wrap fetch in requireAuthThen):**
```
dashboard/js/browse.js          mechanic doc-modal: View snippet / Full README
dashboard/js/assembly.js        compose() — fetches CLAUDE.md + snippet.html files
dashboard/js/main.js            archetype View playbook (if button exists)
```

---

## Task 1: Create `auth-config.js` + `auth.js` core (no modal)

**Files:**
- Create: `/Users/derrickteo/codings/dt-site-creator/dashboard/js/auth-config.js`
- Create: `/Users/derrickteo/codings/dt-site-creator/dashboard/js/auth.js`

- [ ] **Step 1: Write `auth-config.js`** with placeholder values that the user will replace with real Supabase project URL + anon key:

```
// dashboard/js/auth-config.js
// Supabase project URL + anon key. Anon keys are designed to be public-safe;
// security is enforced by RLS policies in Postgres, not by hiding the key.
// REPLACE these placeholder values with real ones from your Supabase dashboard
// (Project Settings → API).

window.SUPABASE_URL = 'https://REPLACE_ME.supabase.co';
window.SUPABASE_ANON_KEY = 'REPLACE_ME_ANON_KEY';
```

- [ ] **Step 2: Write `auth.js` v1** — Supabase client wrapper, no modal yet. Just exposes `dtsAuth.isSignedIn`, `getUserEmail`, `signOut`, and a stub `signInFlow` + `requireAuthThen` that prompt via `alert()` until Task 3 replaces them with a real modal:

```
// dashboard/js/auth.js
// Soft-gate auth wrapper around Supabase. Exposes window.dtsAuth.
// v1: session-check helpers + stub modal (alert-based). Task 3 swaps in real modal.

(function() {
  'use strict';

  if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.warn('auth.js: missing supabase SDK or config. Auth disabled.');
    window.dtsAuth = {
      isSignedIn: function() { return Promise.resolve(false); },
      getUserEmail: function() { return Promise.resolve(null); },
      signInFlow: function() { return Promise.resolve({ ok: false, reason: 'auth-not-configured' }); },
      requireAuthThen: function(fn) { return fn(); },
      signOut: function() { return Promise.resolve(); }
    };
    return;
  }

  var client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  async function isSignedIn() {
    var r = await client.auth.getSession();
    return !!(r.data && r.data.session);
  }

  async function getUserEmail() {
    var r = await client.auth.getSession();
    return r.data && r.data.session ? r.data.session.user.email : null;
  }

  async function signOut() {
    await client.auth.signOut();
  }

  // STUB: real modal lands in Task 3. v1 uses prompt() so manual testing works.
  async function signInFlow() {
    var email = window.prompt('Sign in (v1 stub). Enter email:');
    if (!email) return { ok: false, reason: 'cancelled' };
    var r1 = await client.auth.signInWithOtp({ email: email, options: { shouldCreateUser: true } });
    if (r1.error) { window.alert('Send-code failed: ' + r1.error.message); return { ok: false, reason: r1.error.message }; }
    var code = window.prompt('Enter the 6-digit code emailed to ' + email + ':');
    if (!code) return { ok: false, reason: 'cancelled' };
    var r2 = await client.auth.verifyOtp({ email: email, token: code, type: 'email' });
    if (r2.error) { window.alert('Verify failed: ' + r2.error.message); return { ok: false, reason: r2.error.message }; }
    return { ok: true, email: email };
  }

  async function requireAuthThen(fn) {
    if (await isSignedIn()) return fn();
    var r = await signInFlow();
    if (r.ok) return fn();
    return null;
  }

  // Expose
  window.dtsAuth = {
    isSignedIn: isSignedIn,
    getUserEmail: getUserEmail,
    signInFlow: signInFlow,
    requireAuthThen: requireAuthThen,
    signOut: signOut,
    _client: client  // for debugging only
  };

  // Header indicator (populated lazily on DOMContentLoaded)
  async function paintHeader() {
    var el = document.getElementById('auth-status');
    if (!el) return;
    var email = await getUserEmail();
    if (!email) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = '';
    var span = document.createElement('span');
    span.className = 'auth-status-email';
    span.textContent = email;
    el.appendChild(span);
    var sep = document.createElement('span'); sep.textContent = ' · ';
    el.appendChild(sep);
    var out = document.createElement('a');
    out.href = '#';
    out.textContent = 'sign out';
    out.className = 'auth-status-signout';
    out.addEventListener('click', async function(ev) {
      ev.preventDefault();
      await signOut();
      window.location.reload();
    });
    el.appendChild(out);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paintHeader);
  } else {
    paintHeader();
  }
})();
```

- [ ] **Step 3: Parse-check both JS files**

```
node --check /Users/derrickteo/codings/dt-site-creator/dashboard/js/auth-config.js
node --check /Users/derrickteo/codings/dt-site-creator/dashboard/js/auth.js
```

Expected: no output.

- [ ] **Step 4: Commit**

```
git -C /Users/derrickteo/codings/dt-site-creator add dashboard/js/auth-config.js dashboard/js/auth.js
git -C /Users/derrickteo/codings/dt-site-creator commit -m "auth: v1 Supabase wrapper (auth-config + auth.js with stub modal)"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Task 2: Create `dashboard/css/auth.css`

**Files:**
- Create: `/Users/derrickteo/codings/dt-site-creator/dashboard/css/auth.css`

- [ ] **Step 1: Write the full stylesheet** — modal overlay + dialog + signed-in header indicator. Scoped under `.auth-*`. Inherits color vars from `style.css`.

```
/* ── auth.css ────────────────────────────────────────────────
   Soft-gate auth modal + header indicator.
   Inherits color vars from style.css.
─────────────────────────────────────────────────────────────── */

/* Header signed-in indicator */
.auth-status {
  font-size: 13px;
  color: rgba(240, 246, 252, 0.7);
  margin-right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.auth-status-email { color: var(--text); }
.auth-status-signout {
  color: var(--accent);
  text-decoration: none;
  cursor: pointer;
}
.auth-status-signout:hover { text-decoration: underline; }

/* Modal overlay (full-screen scrim) */
.auth-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Modal dialog */
.auth-dialog {
  background: var(--card);
  border: 1px solid var(--border2);
  border-radius: 14px;
  max-width: 420px;
  width: 100%;
  padding: 28px 28px 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  color: var(--text);
}
.auth-dialog h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 6px;
}
.auth-dialog p {
  color: rgba(240, 246, 252, 0.7);
  font-size: 14px;
  margin: 0 0 18px;
}
.auth-dialog input[type="email"],
.auth-dialog input[type="text"] {
  width: 100%;
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border2);
  border-radius: 8px;
  color: var(--text);
  font-size: 15px;
  font-family: inherit;
  box-sizing: border-box;
}
.auth-dialog input[type="email"]:focus,
.auth-dialog input[type="text"]:focus {
  outline: none;
  border-color: var(--accent);
}
.auth-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}
.auth-btn {
  padding: 10px 18px;
  background: var(--accent);
  color: #0d1117;
  border: 1px solid var(--accent);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.1s, opacity 0.15s;
}
.auth-btn:hover { transform: translateY(-1px); }
.auth-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.auth-link {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  padding: 0;
}
.auth-link:hover { text-decoration: underline; }
.auth-error {
  color: #f87171;
  font-size: 13px;
  margin-top: 10px;
  min-height: 18px;
}
.auth-note {
  color: rgba(240, 246, 252, 0.5);
  font-size: 12px;
  margin-top: 14px;
}
```

- [ ] **Step 2: Smoke load via curl**

```
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
curl -s -o /dev/null -w "auth.css HTTP %{http_code}\n" "http://localhost:8000/dashboard/css/auth.css?v=1"
kill $SERVER_PID 2>/dev/null
```

Expected: `HTTP 200`.

- [ ] **Step 3: Commit**

```
git -C /Users/derrickteo/codings/dt-site-creator add dashboard/css/auth.css
git -C /Users/derrickteo/codings/dt-site-creator commit -m "css: auth modal + header signed-in indicator"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Task 3: Replace `auth.js` stub modal with real modal

**Files:** Modify `/Users/derrickteo/codings/dt-site-creator/dashboard/js/auth.js`.

Goal: replace the `prompt()`/`alert()`-based `signInFlow` with a real DOM-injected modal that opens an overlay, takes email, sends OTP, takes the 6-digit code, verifies, closes. UX matches spec §5.

- [ ] **Step 1: Read the current auth.js**

```
cat /Users/derrickteo/codings/dt-site-creator/dashboard/js/auth.js
```

- [ ] **Step 2: Replace the existing `signInFlow` function** with this real-modal implementation. The function returns a Promise that resolves `{ ok: true, email }` on verify or `{ ok: false, reason }` on cancel/error.

```
  function signInFlow() {
    return new Promise(function(resolve) {
      // Build overlay + dialog
      var overlay = document.createElement('div');
      overlay.className = 'auth-overlay';
      var dialog = document.createElement('div');
      dialog.className = 'auth-dialog';
      overlay.appendChild(dialog);

      var state = { email: '', stage: 'email' };

      function renderEmailStage() {
        dialog.innerHTML = '';
        var h2 = document.createElement('h2');
        h2.textContent = 'Sign in to view full prompts';
        dialog.appendChild(h2);
        var p = document.createElement('p');
        p.textContent = "We'll email you a 6-digit code. No password. No spam.";
        dialog.appendChild(p);

        var input = document.createElement('input');
        input.type = 'email';
        input.placeholder = 'your.email@domain.com';
        input.value = state.email;
        dialog.appendChild(input);

        var err = document.createElement('div');
        err.className = 'auth-error';
        dialog.appendChild(err);

        var actions = document.createElement('div');
        actions.className = 'auth-actions';
        var cancel = document.createElement('button');
        cancel.type = 'button';
        cancel.className = 'auth-link';
        cancel.textContent = 'Cancel';
        cancel.addEventListener('click', function() { close({ ok: false, reason: 'cancelled' }); });
        var submit = document.createElement('button');
        submit.type = 'button';
        submit.className = 'auth-btn';
        submit.textContent = 'Send code';
        submit.addEventListener('click', async function() {
          var em = input.value.trim();
          if (!em || em.indexOf('@') === -1) { err.textContent = 'Please enter a valid email.'; return; }
          submit.disabled = true; submit.textContent = 'Sending…';
          var r = await client.auth.signInWithOtp({ email: em, options: { shouldCreateUser: true } });
          if (r.error) {
            err.textContent = 'Send failed: ' + r.error.message;
            submit.disabled = false; submit.textContent = 'Send code';
            return;
          }
          state.email = em; state.stage = 'otp';
          renderOtpStage();
        });
        input.addEventListener('keydown', function(ev) {
          if (ev.key === 'Enter') submit.click();
        });
        actions.appendChild(cancel);
        actions.appendChild(submit);
        dialog.appendChild(actions);

        var note = document.createElement('div');
        note.className = 'auth-note';
        note.textContent = 'We keep your email so we can let you know when this archive ships new mechanics or recipes. No third-party sharing.';
        dialog.appendChild(note);

        setTimeout(function() { input.focus(); }, 50);
      }

      function renderOtpStage() {
        dialog.innerHTML = '';
        var h2 = document.createElement('h2');
        h2.textContent = 'Check your inbox';
        dialog.appendChild(h2);
        var p = document.createElement('p');
        p.textContent = 'We sent a 6-digit code to ' + state.email + '.';
        dialog.appendChild(p);

        var input = document.createElement('input');
        input.type = 'text';
        input.inputMode = 'numeric';
        input.autocomplete = 'one-time-code';
        input.placeholder = '123456';
        input.maxLength = 6;
        dialog.appendChild(input);

        var err = document.createElement('div');
        err.className = 'auth-error';
        dialog.appendChild(err);

        var actions = document.createElement('div');
        actions.className = 'auth-actions';
        var back = document.createElement('button');
        back.type = 'button';
        back.className = 'auth-link';
        back.textContent = 'Wrong email? Start over';
        back.addEventListener('click', function() { state.stage = 'email'; renderEmailStage(); });
        var verify = document.createElement('button');
        verify.type = 'button';
        verify.className = 'auth-btn';
        verify.textContent = 'Verify';
        verify.addEventListener('click', async function() {
          var code = input.value.trim();
          if (!code) { err.textContent = 'Please enter the 6-digit code.'; return; }
          verify.disabled = true; verify.textContent = 'Verifying…';
          var r = await client.auth.verifyOtp({ email: state.email, token: code, type: 'email' });
          if (r.error) {
            err.textContent = 'Verify failed: ' + r.error.message;
            verify.disabled = false; verify.textContent = 'Verify';
            return;
          }
          close({ ok: true, email: state.email });
        });
        input.addEventListener('keydown', function(ev) {
          if (ev.key === 'Enter') verify.click();
        });
        actions.appendChild(back);
        actions.appendChild(verify);
        dialog.appendChild(actions);

        setTimeout(function() { input.focus(); }, 50);
      }

      function close(result) {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        // Repaint header to reflect new auth state
        var headerEl = document.getElementById('auth-status');
        if (headerEl) {
          // call paintHeader if exposed (it isn't), so trigger via a small inline re-read
          getUserEmail().then(function(em) {
            if (em) {
              headerEl.hidden = false;
              headerEl.innerHTML = '';
              var s = document.createElement('span');
              s.className = 'auth-status-email';
              s.textContent = em;
              headerEl.appendChild(s);
              var sep = document.createElement('span'); sep.textContent = ' · '; headerEl.appendChild(sep);
              var out = document.createElement('a');
              out.href = '#'; out.textContent = 'sign out'; out.className = 'auth-status-signout';
              out.addEventListener('click', async function(ev) { ev.preventDefault(); await signOut(); window.location.reload(); });
              headerEl.appendChild(out);
            }
          });
        }
        resolve(result);
      }

      // Click on backdrop closes (with cancel)
      overlay.addEventListener('click', function(ev) {
        if (ev.target === overlay) close({ ok: false, reason: 'cancelled' });
      });

      renderEmailStage();
      document.body.appendChild(overlay);
    });
  }
```

The earlier `requireAuthThen`, `isSignedIn`, `getUserEmail`, `signOut`, and `paintHeader` stay as-is from Task 1.

- [ ] **Step 3: Parse-check**

```
node --check /Users/derrickteo/codings/dt-site-creator/dashboard/js/auth.js
```

- [ ] **Step 4: Commit**

```
git -C /Users/derrickteo/codings/dt-site-creator add dashboard/js/auth.js
git -C /Users/derrickteo/codings/dt-site-creator commit -m "auth: real 2-stage modal (email → OTP) replaces prompt-based stub"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Task 4: Wire script tags + header indicator into 7 HTML pages

**Files:** Modify all 7 page HTML files under `/Users/derrickteo/codings/dt-site-creator/`:
`index.html`, `mechanics.html`, `assembly.html`, `showcase.html`, `ecosystem.html`, `pitfalls.html`, `setup.html`.

- [ ] **Step 1: For each of the 7 files**, add inside `<head>` (after the existing `<link rel="stylesheet" href="dashboard/css/style.css" />` line):

```
<link rel="stylesheet" href="dashboard/css/auth.css?v=1" />
```

If the page already has another stylesheet link (e.g., ecosystem.html has `dashboard/css/ecosystem.css?v=1`), add the auth.css line after style.css and before any page-specific stylesheet.

- [ ] **Step 2: For each of the 7 files**, find the `<div class="nav-right">` block (which currently has `<a class="btn-outline btn-sm" href="assembly.html">Prompt Assembly →</a>` and `<button class="hamburger">`) and insert this just before the `<a class="btn-outline">` line:

```
<span id="auth-status" class="auth-status" hidden></span>
```

- [ ] **Step 3: For each of the 7 files**, find the closing `</body>` tag and add these three script lines AS THE FIRST script lines inside body (before any existing `<script src="dashboard/js/...">`). They must load BEFORE other JS:

```
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="dashboard/js/auth-config.js?v=1"></script>
<script src="dashboard/js/auth.js?v=1"></script>
```

If existing scripts are at end of body (typical), insert these BEFORE the existing `<script src="dashboard/js/main.js">` (or whichever existing script appears first).

- [ ] **Step 4: Sanity-grep all 7 pages have auth.js + auth-status + auth.css**

```
for f in /Users/derrickteo/codings/dt-site-creator/index.html /Users/derrickteo/codings/dt-site-creator/mechanics.html /Users/derrickteo/codings/dt-site-creator/assembly.html /Users/derrickteo/codings/dt-site-creator/showcase.html /Users/derrickteo/codings/dt-site-creator/ecosystem.html /Users/derrickteo/codings/dt-site-creator/pitfalls.html /Users/derrickteo/codings/dt-site-creator/setup.html; do
  c1=$(grep -c "auth\.js" "$f")
  c2=$(grep -c "auth-status" "$f")
  c3=$(grep -c "auth\.css" "$f")
  echo "$(basename $f): auth.js=$c1 auth-status=$c2 auth.css=$c3"
done
```

Expected: each file shows `auth.js=1 auth-status=1 auth.css=1`.

- [ ] **Step 5: Commit**

```
git -C /Users/derrickteo/codings/dt-site-creator add index.html mechanics.html assembly.html showcase.html ecosystem.html pitfalls.html setup.html
git -C /Users/derrickteo/codings/dt-site-creator commit -m "auth: load Supabase SDK + auth.js + auth.css on all 7 pages; add header indicator"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Task 5: Wire `requireAuthThen` into the 3 gated surfaces

**Files:**
- Modify: `/Users/derrickteo/codings/dt-site-creator/dashboard/js/browse.js` — mechanic doc-modal fetch.
- Modify: `/Users/derrickteo/codings/dt-site-creator/dashboard/js/assembly.js` — `compose()` entry.
- Modify: `/Users/derrickteo/codings/dt-site-creator/dashboard/js/main.js` — archetype "View playbook" if it exists.

- [ ] **Step 1: Locate the existing doc-modal fetch in `browse.js`**

```
grep -n "fetchText\|snippet\.html\|README\.md\|doc-modal\|Full README\|View playbook" /Users/derrickteo/codings/dt-site-creator/dashboard/js/browse.js | head -20
```

The doc-modal triggers when the user clicks "View snippet" or "Full README". The current code likely calls `fetchText('mechanics/' + id + '/snippet.html')` etc. inside a click handler.

- [ ] **Step 2: Wrap the doc-modal trigger in `browse.js`** with `window.dtsAuth.requireAuthThen(...)`. Find the click handler that calls `fetchText(...)` and `openModal(...)` and convert it from:

```
btn.addEventListener('click', function() {
  fetchText('mechanics/' + id + '/snippet.html').then(render);
});
```

To:

```
btn.addEventListener('click', function() {
  window.dtsAuth.requireAuthThen(function() {
    fetchText('mechanics/' + id + '/snippet.html').then(render);
  });
});
```

Apply this pattern to ALL doc-modal triggers that fetch full prompt content (snippet.html, README.md, prompt.md, playbook content). The doc-modal might be opened by multiple buttons — wrap each.

- [ ] **Step 3: Locate `compose()` call in `assembly.js`**

```
grep -n "function compose\|compose()\|btn-copy\|btn-generate\|Generate\|assembled-prompt" /Users/derrickteo/codings/dt-site-creator/dashboard/js/assembly.js | head -15
```

`compose()` fetches CLAUDE.md + snippet.html files and stitches them into the assembled prompt. It's triggered by some button (likely "Generate" or "Copy" or runs automatically when selections change).

- [ ] **Step 4: Wrap the `compose()` trigger in `assembly.js`** so the gate fires before the fetch chain. If `compose()` is called automatically on every selection change (no explicit trigger button), add a "Reveal assembled prompt" button to the UI and wire it through `requireAuthThen`. Otherwise, wrap the existing trigger:

```
generateBtn.addEventListener('click', function() {
  window.dtsAuth.requireAuthThen(compose);
});
```

If `compose()` is called from multiple paths, wrap each. If it auto-fires on initial page load, replace the auto-fire with a "Reveal" button — show a placeholder ("Generate prompt to view") in the assembled-prompt area until the user clicks.

- [ ] **Step 5: Locate "View playbook" trigger in `main.js`** (if it exists)

```
grep -n "View playbook\|CLAUDE\.md\|playbook\|archetypes/" /Users/derrickteo/codings/dt-site-creator/dashboard/js/main.js | head -15
```

If there's a button or link that fetches `archetypes/<id>/CLAUDE.md` and displays it (e.g., in a modal or expanded panel), wrap that trigger in `requireAuthThen`. If no such button exists, skip — note in commit message.

- [ ] **Step 6: Parse-check all three files**

```
node --check /Users/derrickteo/codings/dt-site-creator/dashboard/js/browse.js
node --check /Users/derrickteo/codings/dt-site-creator/dashboard/js/assembly.js
node --check /Users/derrickteo/codings/dt-site-creator/dashboard/js/main.js
```

- [ ] **Step 7: Commit**

```
git -C /Users/derrickteo/codings/dt-site-creator add dashboard/js/browse.js dashboard/js/assembly.js dashboard/js/main.js
git -C /Users/derrickteo/codings/dt-site-creator commit -m "auth: gate full-prompt surfaces (browse modal + assembly compose + main playbook)"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Task 6: Write `docs/RUN-AUTH-SETUP.md`

**Files:** Create `/Users/derrickteo/codings/dt-site-creator/docs/RUN-AUTH-SETUP.md`.

- [ ] **Step 1: Write the runbook** for the manual Supabase + Resend setup steps. Future-Derrick (and future agents) will follow this when re-establishing the auth setup or migrating projects.

Content:

```
# Auth Setup Runbook (Supabase + Resend)

dt-site-creator uses Supabase OTP + Resend SMTP to gate full prompts.
This file documents the one-time dashboard setup that lives OUTSIDE the repo.

## 1. Create the Supabase project

1. Go to https://supabase.com/dashboard.
2. New project. Name: `dt-site-creator-soft-gate`. Region: closest to your users.
3. Wait for provisioning (~2 min).
4. Project Settings → API → copy the Project URL and anon (public) key.
5. Paste both into `/Users/derrickteo/codings/dt-site-creator/dashboard/js/auth-config.js`:
   - Replace `https://REPLACE_ME.supabase.co` with the real URL.
   - Replace `REPLACE_ME_ANON_KEY` with the real anon key.
6. Commit + push the updated auth-config.js. (Anon keys are public-safe per Supabase docs.)

## 2. Configure Supabase Auth

1. Authentication → Providers → Email — enable. Disable password sign-in (we're OTP-only).
2. Authentication → URL Configuration — add these to "Redirect URLs":
   - https://derrickteo.com/dt-site-creator/**
   - https://derrick-pixel.github.io/dt-site-creator/**
   - http://localhost:8000/**

## 3. Connect Resend SMTP

1. In Resend (https://resend.com), verify the sender domain `elitezaviation.com` if not already verified.
2. Create or confirm an API key with "Send emails" permission.
3. In Supabase → Authentication → SMTP Settings:
   - Host: smtp.resend.com
   - Port: 587
   - Username: resend
   - Password: <your Resend API key>
   - Sender email: prompts@elitezaviation.com
   - Sender name: DT Site Creator
4. Save. Send a test email to your own inbox to verify delivery.

## 4. (Optional) Verify locally

```
cd /Users/derrickteo/codings/dt-site-creator
python3 -m http.server 8000
```

Open http://localhost:8000/mechanics.html in an incognito window. Click a mechanic card's "View snippet" button. Expected:
- The auth modal opens.
- Enter your email, click "Send code".
- A 6-digit code arrives in your inbox (from prompts@elitezaviation.com).
- Enter the code, click "Verify".
- Modal closes; the snippet renders.
- Header shows "signed in as you@email · sign out".

## 5. Pull the lead list

In Supabase SQL Editor:

```sql
select email, created_at, last_sign_in_at
from auth.users
order by created_at desc;
```

Export to CSV from the dashboard.

## Future iterations (not yet wired)

- Webhook to Slack / Google Sheet on new sign-up.
- Re-engagement email when new mechanics ship.
- CF Access path-scoped on derrickteo.com (edge-level lockdown — separate work).
```

- [ ] **Step 2: Commit**

```
git -C /Users/derrickteo/codings/dt-site-creator add docs/RUN-AUTH-SETUP.md
git -C /Users/derrickteo/codings/dt-site-creator commit -m "docs: runbook for Supabase + Resend manual setup"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Task 7: Smoke test + mirror sync

**Files:** None modified; verification + mirror.

- [ ] **Step 1: Local curl smoke test**

```
cd /Users/derrickteo/codings/dt-site-creator && python3 -m http.server 8000 &
SERVER_PID=$!
sleep 2

echo "=== Asset HTTP codes ==="
for url in \
  "http://localhost:8000/dashboard/js/auth-config.js?v=1" \
  "http://localhost:8000/dashboard/js/auth.js?v=1" \
  "http://localhost:8000/dashboard/css/auth.css?v=1"; do
  echo "$(curl -s -o /dev/null -w "%{http_code}" "$url")  $url"
done

echo ""
echo "=== Each HTML page has auth wiring ==="
for p in index mechanics assembly showcase ecosystem pitfalls setup; do
  has_js=$(curl -s http://localhost:8000/$p.html | grep -c "auth\.js")
  has_css=$(curl -s http://localhost:8000/$p.html | grep -c "auth\.css")
  has_status=$(curl -s http://localhost:8000/$p.html | grep -c "auth-status")
  has_sdk=$(curl -s http://localhost:8000/$p.html | grep -c "supabase-js")
  echo "$p.html: js=$has_js css=$has_css status=$has_status sdk=$has_sdk"
done

kill $SERVER_PID 2>/dev/null
```

All HTTP codes should be 200; each page should show all four counts >= 1.

- [ ] **Step 2: Fix any issue**, then re-test.

- [ ] **Step 3: Browser smoke test (defer to user OR run if you have a browser)**

Tell the user to verify manually:
1. Open http://localhost:8000/mechanics.html in incognito.
2. Click a mechanic card's "View snippet" button → modal opens (or `prompt()` opens if real Supabase URL isn't filled in yet — that's expected if user hasn't done Task 6 setup).
3. With real Supabase URL + key in auth-config.js: enter email → receive code → verify → snippet renders.
4. Header shows "signed in as you@email · sign out".
5. Reload page → still signed in.
6. Click "sign out" → reloads → modal opens again on next gated action.

If the user hasn't completed the Supabase setup (Task 6 runbook), the gate will fail at the `signInWithOtp` call — that's OK; the runbook is the next step.

- [ ] **Step 4: Mirror sync**

```
cd /Users/derrickteo/codings/dt-public
bash sync-wip.sh
git -C /Users/derrickteo/codings/dt-public add -A
git -C /Users/derrickteo/codings/dt-public status --short
```

Confirm dt-site-creator changes are staged. Then:

```
git -C /Users/derrickteo/codings/dt-public commit -m "mirror: sync dt-site-creator with Supabase OTP soft-gate"
git -C /Users/derrickteo/codings/dt-public push
```

---

## Self-review checklist

- [ ] `auth-config.js` exists with placeholder Supabase URL + anon key.
- [ ] `auth.js` exists with real 2-stage modal (not prompt-based stub).
- [ ] `auth.css` exists.
- [ ] All 7 HTML pages load Supabase JS CDN + auth-config + auth.js + auth.css; all 7 have `<span id="auth-status">` in nav-right.
- [ ] `browse.js`, `assembly.js`, `main.js` wrap their gated triggers in `dtsAuth.requireAuthThen(...)`.
- [ ] `docs/RUN-AUTH-SETUP.md` exists with the Supabase + Resend manual setup steps.
- [ ] All modified JS passes `node --check`.
- [ ] Mirror synced.
- [ ] No real Supabase URL or anon key committed yet (placeholders only — user fills in via Task 6 runbook).

## Out of scope (per spec §12)

- CF Access edge gate.
- Disabling GH Pages or privatizing the repo.
- Lead-list export automation.
- Re-engagement emails.
- Multi-tier access.
- Per-content RLS rules.
