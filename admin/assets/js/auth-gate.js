/* ════════════════════════════════════════════════════════════════
   Elitez — Admin / intel auth gate  (canonical, project-agnostic)
   ----------------------------------------------------------------
   Drop-in Supabase email-OTP gate for any admin/ or intel/ page.
   Self-contained: no logo files, no fonts, no per-repo asset paths.

   Wiring — add these two tags before </body> on every gated page:

     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
     <script src="assets/js/auth-gate.js"></script>

   It locks the page behind a full-screen OTP overlay until a
   Supabase session exists, and exposes window._sbReady (a Promise
   resolving to the signed-in client) and window._sb.

   Sign-ups are restricted to elitez.asia / dhc.com.sg by a
   "Before User Created" Postgres hook on the shared Supabase auth
   project (suehogmzjspagcsrqvsw). Email-OTP is delivered via
   Resend SMTP.

   NOTE: on static pages whose data is baked into the HTML, this
   gate hides the rendered view but not the page source. Moving
   that data into Supabase (RLS-gated) is a separate, planned
   effort — until then treat the gate as access control for the
   UI, not as confidentiality for the embedded data.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://suehogmzjspagcsrqvsw.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZWhvZ216anNwYWdjc3JxdnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDgxMTAsImV4cCI6MjA5NDA4NDExMH0.mJHp1pemwzpSJsAUA0ZO8owY7qeDf2EzwxfUq_B1rTw';

  var resolveReady;
  window._sbReady = new Promise(function (res) { resolveReady = res; });

  if (!window.supabase || !window.supabase.createClient) {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.textContent =
        'Auth library failed to load. Check your connection and reload, or contact derrick@elitez.asia.';
    });
    return;
  }

  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage }
  });
  window._sb = sb;

  // ── Tiny DOM builder (no HTML-string setters — XSS-safe) ────
  function mk(tag, props) {
    var n = document.createElement(tag);
    if (props) {
      for (var k in props) {
        if (k === 'text') n.textContent = props[k];
        else if (k === 'html') { /* deliberately unsupported */ }
        else n.setAttribute(k, props[k]);
      }
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return n;
  }

  // ── Styles — Elitez navy (#003a70) + orange (#F26522) accent ──
  var css = '\
#ez-auth-overlay{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;\
background:radial-gradient(ellipse at 50% 0%,#0a4a86 0%,#003a70 45%,#00264a 100%);\
font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;padding:24px}\
#ez-auth-overlay *{box-sizing:border-box}\
.ez-card{width:100%;max-width:400px;background:rgba(0,30,60,.78);border:1px solid rgba(255,255,255,.12);\
border-radius:16px;padding:38px 34px;box-shadow:0 24px 60px rgba(0,0,0,.45)}\
.ez-mark{font-size:12px;letter-spacing:3px;color:#F26522;text-transform:uppercase;font-weight:700;margin-bottom:24px}\
.ez-card h1{font-size:21px;color:#fff;margin:0 0 6px;letter-spacing:.2px;font-weight:600}\
.ez-card p.sub{font-size:13px;color:rgba(220,232,245,.62);margin:0 0 24px;line-height:1.55}\
.ez-card label{display:block;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(220,232,245,.7);margin-bottom:8px}\
.ez-card input{width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18);\
border-radius:9px;color:#fff;font-size:15px;outline:none;transition:border-color .15s}\
.ez-card input:focus{border-color:#F26522}\
.ez-card input::placeholder{color:rgba(220,232,245,.32)}\
#ez-otp{letter-spacing:7px;text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:20px}\
.ez-btn{width:100%;margin-top:18px;padding:13px;background:#F26522;color:#fff;border:none;border-radius:9px;\
font-weight:700;font-size:14px;cursor:pointer;letter-spacing:.3px;transition:opacity .15s}\
.ez-btn:hover{opacity:.9}.ez-btn:disabled{opacity:.5;cursor:not-allowed}\
.ez-link{margin-top:14px;background:none;border:none;color:rgba(220,232,245,.55);font-size:12px;cursor:pointer;\
text-decoration:underline;padding:0}\
.ez-err{color:#ff8a7a;font-size:12.5px;margin-top:12px;min-height:16px;line-height:1.4}\
.ez-echo{color:#F26522;font-weight:600}\
.ez-foot{margin-top:26px;padding-top:18px;border-top:1px solid rgba(255,255,255,.1);\
font-size:11px;color:rgba(220,232,245,.45);line-height:1.55}\
.ez-foot b{color:rgba(220,232,245,.7);font-weight:600}\
body.ez-gate-locked>*:not(#ez-auth-overlay):not(script){display:none!important}';
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── Overlay DOM ─────────────────────────────────────────────
  var emailInput = mk('input', { id: 'ez-email', type: 'email', autocomplete: 'email', placeholder: 'you@elitez.asia' });
  var sendBtn = mk('button', { class: 'ez-btn', id: 'ez-send' }, 'Send code');
  var err1 = mk('div', { class: 'ez-err', id: 'ez-err1' });
  var stageEmail = mk('div', { id: 'ez-stage-email' },
    mk('h1', { text: 'Restricted access' }),
    mk('p', { class: 'sub' }, 'Elitez admin workspace. Sign in with your Elitez email — a 6-digit code will be sent to you.'),
    mk('label', { for: 'ez-email', text: 'Work email' }),
    emailInput, sendBtn, err1
  );

  var echo = mk('span', { class: 'ez-echo', id: 'ez-echo' });
  var otpInput = mk('input', { id: 'ez-otp', type: 'text', inputmode: 'numeric', maxlength: '6', autocomplete: 'one-time-code', placeholder: '••••••' });
  var verifyBtn = mk('button', { class: 'ez-btn', id: 'ez-verify' }, 'Verify & enter');
  var err2 = mk('div', { class: 'ez-err', id: 'ez-err2' });
  var backBtn = mk('button', { class: 'ez-link', id: 'ez-back' }, '← Use a different email');
  var stageOtp = mk('div', { id: 'ez-stage-otp', style: 'display:none' },
    mk('h1', { text: 'Enter code' }),
    mk('p', { class: 'sub' }, 'A 6-digit code was sent to ', echo, '. It expires in a few minutes.'),
    mk('label', { for: 'ez-otp', text: 'Verification code' }),
    otpInput, verifyBtn, err2, backBtn
  );

  var foot = mk('div', { class: 'ez-foot' },
    'Access limited to elitez.asia and dhc.com.sg. Issues? Contact ',
    mk('b', { text: 'derrick@elitez.asia' }), '.'
  );

  var mark = mk('div', { class: 'ez-mark', text: 'Elitez · Admin' });
  var card = mk('div', { class: 'ez-card' }, mark, stageEmail, stageOtp, foot);
  var overlay = mk('div', { id: 'ez-auth-overlay' }, card);

  function whenBody(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  whenBody(function () {
    document.body.classList.add('ez-gate-locked');
    document.body.appendChild(overlay);
    wire();
  });

  function unlock() {
    if (document.body) document.body.classList.remove('ez-gate-locked');
    if (overlay.parentNode) overlay.remove();
    resolveReady(sb);
  }

  // Already-signed-in users skip the form entirely.
  sb.auth.getSession().then(function (r) { if (r.data && r.data.session) unlock(); });
  sb.auth.onAuthStateChange(function (_e, session) { if (session) unlock(); });

  // ── Form wiring ─────────────────────────────────────────────
  function wire() {
    var pendingEmail = '';

    function show(stage) {
      stageEmail.style.display = stage === 'email' ? '' : 'none';
      stageOtp.style.display = stage === 'otp' ? '' : 'none';
    }

    sendBtn.addEventListener('click', async function () {
      var email = (emailInput.value || '').trim().toLowerCase();
      err1.textContent = '';
      if (!email || email.indexOf('@') < 1) { err1.textContent = 'Enter a valid email address.'; return; }
      sendBtn.disabled = true; sendBtn.textContent = 'Sending…';
      var res = await sb.auth.signInWithOtp({ email: email, options: { shouldCreateUser: true } });
      sendBtn.disabled = false; sendBtn.textContent = 'Send code';
      if (res.error) {
        var m = (res.error.message || '').toLowerCase();
        err1.textContent = (m.indexOf('restrict') > -1 || m.indexOf('authoriz') > -1 || m.indexOf('domain') > -1 || m.indexOf('403') > -1)
          ? 'This email domain is not authorized for admin access.'
          : (res.error.message || 'Could not send the code. Try again.');
        return;
      }
      pendingEmail = email;
      echo.textContent = email;
      show('otp');
      otpInput.focus();
    });

    verifyBtn.addEventListener('click', async function () {
      var token = (otpInput.value || '').trim();
      err2.textContent = '';
      if (!/^\d{6}$/.test(token)) { err2.textContent = 'Enter the 6-digit code.'; return; }
      verifyBtn.disabled = true; verifyBtn.textContent = 'Verifying…';
      var res = await sb.auth.verifyOtp({ email: pendingEmail, token: token, type: 'email' });
      verifyBtn.disabled = false; verifyBtn.textContent = 'Verify & enter';
      if (res.error) { err2.textContent = res.error.message || 'Invalid or expired code.'; return; }
      unlock();
    });

    backBtn.addEventListener('click', function () {
      err1.textContent = ''; err2.textContent = ''; otpInput.value = '';
      show('email');
      emailInput.focus();
    });

    emailInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') sendBtn.click(); });
    otpInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') verifyBtn.click(); });
  }
})();

/* ════════════════════════════════════════════════════════════════
   Cross-workspace switcher — appended 2026-05-28
   Renders a top-right "▦ Workspaces" button on every admin/intel
   page once the auth-gate has resolved a session. The dropdown
   lists every Elitez admin/intel destination so an authenticated
   operator can hop between them in one click.
   Each destination requires its own login when crossing domains
   (Supabase session is stored per-origin in localStorage). The
   switcher is purely navigational — it does not transfer auth.
   Self-contained: no dependencies on the auth-gate's internal
   helpers; safe to load before or after auth-gate's IIFE body.
   ════════════════════════════════════════════════════════════════ */
(function workspaceSwitcher() {
  'use strict';
  var WORKSPACES = [
    { n: 'DTWS Works',          u: 'https://derrick-pixel.github.io/dtws_works/admin.html', i: '🛠️' },
    { n: 'derrickteo.com',      u: 'https://derrickteo.com/admin/',                           i: '🏠' },
    { n: 'Altru',               u: 'https://derrick-pixel.github.io/altru/admin/',            i: '🧧' },
    { n: 'AEVUM MRI',           u: 'https://derrick-pixel.github.io/Elitez_MRI/admin/',       i: '🏥' },
    { n: 'Casket (Passage)',    u: 'https://derrick-pixel.github.io/Passage/admin/',          i: '🕊️' },
    { n: 'Command Center',      u: 'https://derrick-pixel.github.io/elitez-command-center/admin.html', i: '🎛️' },
    { n: 'Competitor-Intel',    u: 'https://derrick-pixel.github.io/competitor-intel-template/template/admin/', i: '🧭' },
    { n: 'Discounter',          u: 'https://derrick-pixel.github.io/discounter/admin/',       i: '🛒' },
    { n: 'Elitez Aviation',     u: 'https://elitezaviation.com/admin/',                        i: '✈️' },
    { n: 'Elitez Events',       u: 'https://derrick-pixel.github.io/Elitez-Events/admin/',    i: '🎉' },
    { n: 'Elitez EOR',          u: 'https://derrick-pixel.github.io/elix-eor/admin/',         i: '📝' },
    { n: 'Elitez ESOP',         u: 'https://derrick-pixel.github.io/Elitez-ESOP/intel/',      i: '📜' },
    { n: 'Elitez LMS',          u: 'https://lms.elitez.com.sg/admin/',                         i: '🎓' },
    { n: 'Elitez Pulse',        u: 'https://derrick-pixel.github.io/elitez-pulse/admin/',     i: '📣' },
    { n: 'Elitez Security',     u: 'https://derrick-pixel.github.io/elitez-security/admin/',  i: '🛡️' },
    { n: 'Site Supervisor',     u: 'https://derrick-pixel.github.io/elitez-site-supervisor/admin/', i: '🦺' },
    { n: 'ElitezAI',            u: 'https://derrick-pixel.github.io/elitezai-website/admin/', i: '🤖' },
    { n: 'ElitezShelf',         u: 'https://derrick-pixel.github.io/elitezshelf-frontage/admin/', i: '🏬' },
    { n: 'ElixCraft',           u: 'https://derrick-pixel.github.io/ElixCraft/admin/',        i: '⚔️' },
    { n: 'FlashCart',           u: 'https://derrick-pixel.github.io/flashcart-research/template/admin/', i: '⚡' },
    { n: 'Lemon Man',           u: 'https://derrick-pixel.github.io/lemon-man/admin/',        i: '🍋' },
    { n: 'Lumana',              u: 'https://derrick-pixel.github.io/Lumana/admin/',           i: '🌿' },
    { n: 'Market Tracker',      u: 'https://derrick-pixel.github.io/market-tracker-research/template/admin/', i: '📈' },
    { n: 'Merchandising',       u: 'https://derrick-pixel.github.io/merchandising/intel/',    i: '🛍️' },
    { n: 'The Commons',         u: 'https://derrick-pixel.github.io/the-commons/admin/',      i: '🎪' },
    { n: 'XinceAI',             u: 'https://derrick-pixel.github.io/XinceAI/admin/',          i: '🤖' }
  ];
  function build() {
    if (document.getElementById('elx-ws-switcher-root')) return;
    var root = document.createElement('div');
    root.id = 'elx-ws-switcher-root';
    var btn = document.createElement('button');
    btn.id = 'elx-ws-switcher-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Switch workspace');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '▦';
    var panel = document.createElement('div');
    panel.id = 'elx-ws-switcher-panel';
    panel.hidden = true;
    var heading = document.createElement('div');
    heading.className = 'elx-ws-heading';
    heading.textContent = 'Elitez · workspaces';
    panel.appendChild(heading);
    var here = location.origin + location.pathname;
    WORKSPACES.forEach(function (w) {
      var a = document.createElement('a');
      a.href = w.u;
      a.className = 'elx-ws-item';
      a.rel = 'noopener';
      a.innerHTML = '<span class="elx-ws-icon">' + w.i + '</span><span class="elx-ws-name"></span>';
      a.querySelector('.elx-ws-name').textContent = w.n;
      if (w.u.indexOf(here) === 0 || here.indexOf(w.u) === 0) a.classList.add('current');
      panel.appendChild(a);
    });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!root.contains(e.target)) { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    });
    root.appendChild(btn);
    root.appendChild(panel);
    document.body.appendChild(root);
    var s = document.createElement('style');
    s.textContent = '#elx-ws-switcher-root{font:13px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;}'
      + '#elx-ws-switcher-btn{position:fixed;top:12px;right:12px;z-index:2147483647;width:38px;height:38px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(20,24,32,.92);color:#cbd5e1;font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:saturate(140%) blur(6px);box-shadow:0 4px 14px rgba(0,0,0,.35);}'
      + '#elx-ws-switcher-btn:hover{background:rgba(30,36,48,.98);color:#fff;border-color:rgba(0,212,255,.45);}'
      + '#elx-ws-switcher-panel{position:fixed;top:58px;right:12px;z-index:2147483647;width:280px;max-height:70vh;overflow-y:auto;background:rgba(20,24,32,.98);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:6px;box-shadow:0 16px 48px rgba(0,0,0,.55);}'
      + '#elx-ws-switcher-panel .elx-ws-heading{padding:8px 10px 6px;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:4px;}'
      + '#elx-ws-switcher-panel .elx-ws-item{display:flex;align-items:center;gap:8px;padding:7px 10px;color:#d6dce6;text-decoration:none;border-radius:7px;}'
      + '#elx-ws-switcher-panel .elx-ws-item:hover{background:rgba(255,255,255,.06);color:#fff;}'
      + '#elx-ws-switcher-panel .elx-ws-item.current{background:rgba(0,212,255,.14);color:#00d4ff;}'
      + '#elx-ws-switcher-panel .elx-ws-icon{font-size:15px;width:18px;text-align:center;}'
      + '@media (prefers-color-scheme: light){#elx-ws-switcher-btn{background:#fff;color:#1f2937;border-color:#e5e7eb;}#elx-ws-switcher-panel{background:#fff;color:#0f172a;border-color:#e5e7eb;}#elx-ws-switcher-panel .elx-ws-heading{color:#475569;border-color:#e5e7eb;}#elx-ws-switcher-panel .elx-ws-item{color:#1f2937;}#elx-ws-switcher-panel .elx-ws-item:hover{background:#f1f5f9;}#elx-ws-switcher-panel .elx-ws-item.current{background:rgba(2,132,199,.12);color:#0369a1;}}';
    document.head.appendChild(s);
  }
  function start() {
    var run = function () {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
      } else { build(); }
    };
    if (window._sbReady && typeof window._sbReady.then === 'function') {
      window._sbReady.then(run);
    } else {
      run();
    }
  }
  start();
})();
