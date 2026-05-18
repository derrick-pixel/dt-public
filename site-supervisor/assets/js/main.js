// ── Elitez Site Supervisor — shared interactions ───────────────────────────

(function () {
  'use strict';

  // ── Theme toggle (Site Office <-> Industrial Steel) ────────────────────
  const STORAGE_KEY = 'ess-theme';
  const root = document.documentElement;

  function setTheme(theme) {
    if (theme === 'dark') {
      root.classList.add('theme-dark');
    } else {
      root.classList.remove('theme-dark');
    }
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }

  function currentTheme() {
    return root.classList.contains('theme-dark') ? 'dark' : 'light';
  }

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  });

  // ── Mobile menu toggle ─────────────────────────────────────────────────
  const ham = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (ham && menu) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      menu.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        ham.classList.remove('open');
        menu.classList.remove('open');
      });
    });
  }

  // ── Reveal on scroll ───────────────────────────────────────────────────
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ── Set current year in footer ─────────────────────────────────────────
  const yr = document.getElementById('cur-year');
  if (yr) yr.textContent = new Date().getFullYear();

  // ── Highlight active nav link ──────────────────────────────────────────
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });
})();
