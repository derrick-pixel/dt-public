// Soft client-side password gate for /admin/*. Not real auth — the page
// source is fully visible to anyone who reads it. Stops casual snooping
// from investors / judges who land on the public site, nothing more.
//
// Auth persists in sessionStorage for the tab's lifetime. Close the tab
// to log out.

(function () {
  const STORAGE_KEY = 'lumanaAdminAuth';
  // SHA-256 of the access code. Update by running:
  //   echo -n "<new-code>" | shasum -a 256
  const PASSWORD_HASH = '957cd684f2b888ebc08ecca0394310de9925cef6bdf9d96ab3a48302a04122d3';

  if (sessionStorage.getItem(STORAGE_KEY) === 'ok') return;

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    body > *:not(#lumana-gate) { visibility: hidden !important; }
    #lumana-gate {
      position: fixed; inset: 0; z-index: 99999;
      background: #FBF8F2;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Manrope', system-ui, -apple-system, sans-serif;
    }
    #lumana-gate .gate-card {
      background: #FFFFFF;
      border: 1px solid #E8E0CF;
      box-shadow: 0 24px 56px rgba(15,36,32,0.12);
      padding: 48px 44px;
      width: min(420px, calc(100vw - 32px));
      border-radius: 4px;
    }
    #lumana-gate .gate-brand {
      font-family: 'Noto Serif', Georgia, serif;
      font-size: 1.4rem; font-weight: 700;
      letter-spacing: 0.18em; color: #0D6B5C;
      margin-bottom: 8px;
    }
    #lumana-gate .gate-tag {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.66rem; font-weight: 700;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: #C8860A; margin-bottom: 24px;
    }
    #lumana-gate h2 {
      font-family: 'Noto Serif', Georgia, serif;
      font-size: 1.4rem; line-height: 1.25; color: #0F2420;
      font-weight: 600; margin-bottom: 8px;
    }
    #lumana-gate p.gate-sub {
      font-size: 0.86rem; color: #55655F;
      margin-bottom: 24px; line-height: 1.55;
    }
    #lumana-gate input[type="password"] {
      width: 100%; padding: 12px 14px;
      border: 1px solid #D6CCB5; background: #FBF8F2;
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 0.95rem; color: #0F2420;
      outline: none; border-radius: 3px;
      transition: border-color 0.15s ease;
    }
    #lumana-gate input[type="password"]:focus { border-color: #0D6B5C; }
    #lumana-gate button {
      width: 100%; margin-top: 14px;
      padding: 12px 16px; background: #0D6B5C; color: #fff;
      border: none; border-radius: 3px;
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 0.78rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
      cursor: pointer; transition: background 0.15s ease;
    }
    #lumana-gate button:hover { background: #08564A; }
    #lumana-gate .gate-error {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.74rem; color: #C7421E; margin-top: 12px;
      min-height: 1em;
    }
    #lumana-gate a.gate-back {
      display: inline-block; margin-top: 18px;
      font-size: 0.74rem; color: #7A8882;
      text-decoration: none; letter-spacing: 0.04em;
    }
    #lumana-gate a.gate-back:hover { color: #0D6B5C; }
  `;
  document.documentElement.appendChild(styleEl);

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null) continue;
        if (k === 'class') node.className = v;
        else node.setAttribute(k, v);
      }
    }
    for (const child of children) {
      if (child == null) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  function mountGate() {
    const errEl = el('div', { class: 'gate-error', id: 'gate-error', role: 'alert' });
    const input = el('input', { type: 'password', id: 'gate-input', placeholder: 'Access code', 'aria-label': 'Access code', autofocus: 'autofocus' });
    const button = el('button', { type: 'submit' }, 'Unlock');
    const form = el('form', { id: 'gate-form', autocomplete: 'off' }, input, button, errEl);

    const card = el('div', { class: 'gate-card', role: 'dialog', 'aria-labelledby': 'gate-title', 'aria-modal': 'true' },
      el('div', { class: 'gate-brand' }, 'LUMANA'),
      el('div', { class: 'gate-tag' }, 'Admin · restricted'),
      el('h2', { id: 'gate-title' }, 'Access code required'),
      el('p', { class: 'gate-sub' }, 'This area contains internal competitor analysis and pricing strategy. Enter the access code to continue.'),
      form,
      el('a', { class: 'gate-back', href: '../index.html' }, '← Back to lumanasolutions.com'),
    );

    const overlay = el('div', { id: 'lumana-gate' }, card);
    document.body.appendChild(overlay);

    async function sha256(str) {
      const buf = new TextEncoder().encode(str);
      const digest = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errEl.textContent = '';
      const guess = input.value;
      if (!guess) return;
      try {
        const hash = await sha256(guess);
        if (hash === PASSWORD_HASH) {
          sessionStorage.setItem(STORAGE_KEY, 'ok');
          overlay.remove();
          styleEl.remove();
        } else {
          errEl.textContent = 'Incorrect code.';
          input.select();
        }
      } catch (err) {
        errEl.textContent = 'Browser does not support secure hashing. Use a modern browser.';
      }
    });
  }

  if (document.body) {
    mountGate();
  } else {
    document.addEventListener('DOMContentLoaded', mountGate, { once: true });
  }
})();
