// ── Admin auth gate — soft access-code via sessionStorage ──────────────
//
// Internal-stakeholder gate, not a security control. Anyone who reads the
// JS source can see the code; anyone who knows the JSON URL can fetch the
// raw data files directly. The gate exists to prevent casual public eyes
// from landing on the admin views, not to defend against an attacker.
//
// Loads non-module before any other admin script runs. If the user has
// already entered the code in this browser session, returns immediately.
// Otherwise renders a centred modal overlay over the page until the code
// is entered correctly.

(function () {
  'use strict';

  var CODE = 'elitez123';
  var KEY = 'ess-admin-auth';

  if (sessionStorage.getItem(KEY) === CODE) return;

  var STYLES = [
    /* Site Office palette — sharp corners, ink borders, hi-vis safety orange */
    '.gate-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(15, 14, 15, 0.82); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 24px; font-family: \'Inter\', -apple-system, sans-serif; background-image: repeating-linear-gradient(45deg, rgba(255,106,26,0.04) 0 14px, transparent 14px 28px); }',
    '.gate-card { background: #FFFFFF; border: 2px solid #1A1815; border-top: 14px solid transparent; border-image: repeating-linear-gradient(45deg, #FFC400 0 16px, #1A1815 16px 32px) 14; padding: 32px 36px 28px 36px; width: 100%; max-width: 440px; box-shadow: 8px 8px 0 rgba(255, 106, 26, 0.6); }',
    '.gate-mark { font-family: \'JetBrains Mono\', ui-monospace, monospace; font-size: 0.66rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #C24800; margin-bottom: 18px; display: flex; align-items: center; gap: 10px; }',
    '.gate-mark::before { content: ""; width: 8px; height: 8px; background: #FF6A1A; }',
    '.gate-card h2 { font-family: \'Saira Condensed\', sans-serif; font-weight: 800; font-size: 1.7rem; letter-spacing: 0.005em; color: #1A1815; margin: 0 0 8px 0; line-height: 1.05; text-transform: uppercase; }',
    '.gate-card p { color: #5C5A56; font-size: 0.92rem; line-height: 1.6; margin: 0 0 22px 0; }',
    '.gate-input { width: 100%; padding: 12px 14px; font-family: \'JetBrains Mono\', monospace; font-size: 0.95rem; letter-spacing: 0.06em; color: #1A1815; background: #FAF7F1; border: 2px solid #1A1815; border-radius: 0; outline: none; transition: border-color 0.18s, box-shadow 0.18s; }',
    '.gate-input:focus { border-color: #FF6A1A; box-shadow: 4px 4px 0 #FF6A1A; }',
    '.gate-input.error { border-color: #B23A3A; box-shadow: 4px 4px 0 #B23A3A; }',
    '.gate-error { color: #B23A3A; font-family: \'JetBrains Mono\', monospace; font-size: 0.78rem; letter-spacing: 0.08em; margin: 10px 0 0 0; min-height: 1.1em; text-transform: uppercase; }',
    '.gate-row { display: flex; gap: 10px; margin-top: 18px; }',
    '.gate-btn { flex: 1; padding: 13px 18px; font-family: \'Saira Condensed\', sans-serif; font-weight: 700; font-size: 0.92rem; letter-spacing: 0.06em; text-transform: uppercase; background: #FF6A1A; color: #FFFFFF; border: 2px solid #FF6A1A; border-radius: 0; cursor: pointer; transition: all 0.18s; }',
    '.gate-btn:hover { background: #1A1815; color: #FF6A1A; border-color: #1A1815; }',
    '.gate-btn-secondary { flex: 0 0 auto; background: #FFFFFF; color: #1A1815; border: 2px solid #1A1815; }',
    '.gate-btn-secondary:hover { background: #1A1815; color: #FFFFFF; border-color: #1A1815; }',
    '.gate-foot { margin-top: 20px; padding-top: 14px; border-top: 1px solid rgba(26,24,21,0.18); font-family: \'JetBrains Mono\', monospace; font-size: 0.64rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #8A857B; text-align: center; }'
  ].join(' ');

  var styleEl = document.createElement('style');
  styleEl.id = 'gate-styles';
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  function buildGate() {
    var overlay = document.createElement('div');
    overlay.className = 'gate-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'gate-title');

    var card = document.createElement('div');
    card.className = 'gate-card';

    var mark = document.createElement('div');
    mark.className = 'gate-mark';
    mark.textContent = 'Elitez · Site Supervisor · Internal';
    card.appendChild(mark);

    var h2 = document.createElement('h2');
    h2.id = 'gate-title';
    h2.textContent = 'Access code required';
    card.appendChild(h2);

    var p = document.createElement('p');
    p.textContent = 'This area holds confidential strategic and compliance materials. Enter the access code provided by Elitez Group leadership to continue.';
    card.appendChild(p);

    var form = document.createElement('form');
    form.autocomplete = 'off';

    var input = document.createElement('input');
    input.type = 'password';
    input.className = 'gate-input';
    input.placeholder = 'Access code';
    input.setAttribute('aria-label', 'Access code');
    input.autocomplete = 'off';
    input.spellcheck = false;
    form.appendChild(input);

    var err = document.createElement('p');
    err.className = 'gate-error';
    err.setAttribute('role', 'alert');
    err.textContent = '';
    form.appendChild(err);

    var row = document.createElement('div');
    row.className = 'gate-row';

    var submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'gate-btn';
    submit.textContent = 'Continue →';
    row.appendChild(submit);

    var back = document.createElement('button');
    back.type = 'button';
    back.className = 'gate-btn gate-btn-secondary';
    back.textContent = 'Back to public site';
    back.addEventListener('click', function () {
      window.location.href = '../index.html';
    });
    row.appendChild(back);

    form.appendChild(row);
    card.appendChild(form);

    var foot = document.createElement('div');
    foot.className = 'gate-foot';
    foot.textContent = 'Confidential · Strategic Materials';
    card.appendChild(foot);

    overlay.appendChild(card);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var entered = (input.value || '').trim();
      if (entered === CODE) {
        sessionStorage.setItem(KEY, CODE);
        overlay.remove();
        styleEl.remove();
      } else {
        input.classList.add('error');
        err.textContent = 'Incorrect code. Please try again.';
        input.value = '';
        input.focus();
      }
    });

    input.addEventListener('input', function () {
      input.classList.remove('error');
      err.textContent = '';
    });

    return { overlay: overlay, input: input };
  }

  function mount() {
    var gate = buildGate();
    document.body.appendChild(gate.overlay);
    setTimeout(function () { gate.input.focus(); }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
