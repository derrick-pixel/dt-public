/* Elitez LMS — dom.js
   XSS-safe DOM construction helpers.
   All admin pages use h() to render dynamic data from /data/intel/*.json.
   Never assigns HTML strings to .innerHTML for external data. */
(function (root) {
  'use strict';

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // h(tag, props?, ...children) — JSX-style DOM builder.
  //   • tag: 'div' | 'span' | … (string)
  //   • props: { className, style, onclick, dataset, attrs, ariaXxx, … }
  //   • children: string | number | Node | array (nested OK), null/undef skipped
  // Strings are inserted via createTextNode → escaped automatically.
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props && typeof props === 'object') {
      Object.keys(props).forEach(function (key) {
        var v = props[key];
        if (v === null || v === undefined || v === false) return;
        if (key === 'className' || key === 'class') {
          el.className = v;
        } else if (key === 'style' && typeof v === 'object') {
          Object.assign(el.style, v);
        } else if (key === 'dataset' && typeof v === 'object') {
          Object.keys(v).forEach(function (dk) { el.dataset[dk] = v[dk]; });
        } else if (key === 'attrs' && typeof v === 'object') {
          Object.keys(v).forEach(function (ak) { el.setAttribute(ak, v[ak]); });
        } else if (key.indexOf('on') === 0 && typeof v === 'function') {
          el.addEventListener(key.slice(2).toLowerCase(), v);
        } else {
          // Generic attribute — escapes safely via setAttribute
          el.setAttribute(key, String(v));
        }
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      appendChild(el, arguments[i]);
    }
    return el;
  }

  function appendChild(parent, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) {
      child.forEach(function (c) { appendChild(parent, c); });
      return;
    }
    if (child instanceof Node) {
      parent.appendChild(child);
      return;
    }
    parent.appendChild(document.createTextNode(String(child)));
  }

  // Format SGD with thousands separators
  function fmtSGD(value) {
    if (value === null || value === undefined) return '—';
    var n = Number(value);
    if (!isFinite(n)) return '—';
    return 'S$' + n.toLocaleString('en-SG');
  }

  // Format M / K compact
  function fmtCompact(value) {
    if (value === null || value === undefined) return '—';
    var n = Number(value);
    if (!isFinite(n)) return '—';
    if (n >= 1e9) return 'S$' + (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return 'S$' + (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return 'S$' + (n / 1e3).toFixed(0) + 'k';
    return 'S$' + n.toLocaleString('en-SG');
  }

  // Helper to clear a DOM node before re-rendering (safer than .innerHTML = '')
  function clearNode(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  root.esc = esc;
  root.h = h;
  root.fmtSGD = fmtSGD;
  root.fmtCompact = fmtCompact;
  root.clearNode = clearNode;
})(window);
