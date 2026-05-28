/* Elitez LMS — nav.js
   Hamburger toggle, smooth-scroll, FAQ accordion.
   Pure vanilla, no deps. Safe to load on every page. */
(function () {
  'use strict';

  // ── Hamburger ────────────────────────────────────────────────────────
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-nav');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });
    // Close on link click
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      });
    });
  }

  // ── Smooth-scroll for in-page anchors ────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── FAQ accordion ────────────────────────────────────────────────────
  document.querySelectorAll('.accordion-item').forEach(function (item) {
    var btn = item.querySelector('.accordion-header');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = item.classList.contains('is-open');
      item.classList.toggle('is-open', !open);
      btn.setAttribute('aria-expanded', String(!open));
    });
  });
})();
