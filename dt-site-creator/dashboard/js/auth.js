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

  function signInFlow() {
    return new Promise(function(resolve) {
      // Build overlay + dialog
      var overlay = document.createElement('div');
      overlay.className = 'auth-overlay';
      var dialog = document.createElement('div');
      dialog.className = 'auth-dialog';
      overlay.appendChild(dialog);

      var state = { email: '', stage: 'email' };

      function clearDialog() {
        while (dialog.firstChild) dialog.removeChild(dialog.firstChild);
      }

      function renderEmailStage() {
        clearDialog();
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
        clearDialog();
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
        paintHeader();
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

  async function requireAuthThen(fn) {
    if (await isSignedIn()) return fn();
    var r = await signInFlow();
    if (r.ok) return fn();
    return null;
  }

  window.dtsAuth = {
    isSignedIn: isSignedIn,
    getUserEmail: getUserEmail,
    signInFlow: signInFlow,
    requireAuthThen: requireAuthThen,
    signOut: signOut,
    _client: client
  };

  // Header indicator (populated lazily on DOMContentLoaded)
  async function paintHeader() {
    var el = document.getElementById('auth-status');
    if (!el) return;
    var email = await getUserEmail();
    // Safe clear: el.innerHTML='' empties the container; all subsequent writes
    // use textContent or createElement — no user-supplied HTML ever passed to innerHTML.
    if (!email) { el.hidden = true; el.textContent = ''; return; }
    el.hidden = false;
    while (el.firstChild) { el.removeChild(el.firstChild); }
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
