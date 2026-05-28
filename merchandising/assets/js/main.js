/* ──────────────────────────────────────────────────────────────────────────
   Elitez Merchandising — main.js
   - Mobile nav toggle (hamburger ≤768px)
   - Tab strip for /emr-intel.html (Mobile / QuickView / BI)
   - Contact form client-side validation + Formspree submission status
   - prefers-reduced-motion guarded
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Mobile nav toggle ─────────────────────────────────────────────────
  function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const panel = document.querySelector('.mobile-nav');
    if (!toggle || !panel) return;

    function setOpen(isOpen) {
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      panel.classList.toggle('is-open', isOpen);
      panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!isOpen);
    });

    // Close panel when a link inside it is clicked
    panel.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setOpen(false));
    });

    // Close on Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    // Close panel if viewport widens past 920px while open
    const mq = window.matchMedia('(min-width: 920px)');
    const onChange = () => {
      if (mq.matches && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
  }

  // ── Tab strip (EMR-Intel) ─────────────────────────────────────────────
  function initTabStrips() {
    document.querySelectorAll('.tab-strip').forEach((strip) => {
      const buttons = Array.from(strip.querySelectorAll('.tab-strip__btn'));
      const panels = Array.from(strip.querySelectorAll('.tab-strip__panel'));
      if (!buttons.length || !panels.length) return;

      function activate(idx) {
        buttons.forEach((b, i) => {
          const isActive = i === idx;
          b.setAttribute('aria-selected', isActive ? 'true' : 'false');
          b.setAttribute('tabindex', isActive ? '0' : '-1');
        });
        panels.forEach((p, i) => {
          p.classList.toggle('is-active', i === idx);
          p.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
        });
      }

      buttons.forEach((b, i) => {
        b.addEventListener('click', () => activate(i));
        b.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const dir = e.key === 'ArrowRight' ? 1 : -1;
            const next = (i + dir + buttons.length) % buttons.length;
            activate(next);
            buttons[next].focus();
          } else if (e.key === 'Home') {
            e.preventDefault();
            activate(0);
            buttons[0].focus();
          } else if (e.key === 'End') {
            e.preventDefault();
            activate(buttons.length - 1);
            buttons[buttons.length - 1].focus();
          }
        });
      });

      // Initial state: first button or one already marked aria-selected="true"
      const presetIdx = buttons.findIndex(
        (b) => b.getAttribute('aria-selected') === 'true'
      );
      activate(presetIdx >= 0 ? presetIdx : 0);
    });
  }

  // ── Contact form (Formspree-targeted) ─────────────────────────────────
  function initContactForm() {
    const form = document.querySelector('.contact-form form');
    if (!form) return;

    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('[type="submit"]');
    const busyLabel = form.dataset.busyLabel || 'Sending…';
    const successMsg =
      form.dataset.successMsg ||
      'Brief received. Jack Wang will respond within one business day.';
    const errorMsg =
      form.dataset.errorMsg ||
      'Submission did not go through. Please email jack.wang@elitez.asia directly.';

    function setStatus(msg, kind) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.classList.remove('is-success', 'is-error');
      if (kind) statusEl.classList.add('is-' + kind);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setStatus('', null);

      // Native HTML5 validation
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // PDPA consent
      const consent = form.querySelector('[name="consent"]');
      if (consent && !consent.checked) {
        setStatus('PDPA consent is required to process your submission.', 'error');
        return;
      }

      const origLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = busyLabel;
      }

      try {
        const data = new FormData(form);
        const resp = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });
        if (resp.ok) {
          form.reset();
          setStatus(successMsg, 'success');
        } else {
          setStatus(errorMsg, 'error');
        }
      } catch (err) {
        setStatus(errorMsg, 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = origLabel;
        }
      }
    });
  }

  // ── Smooth scroll for in-page anchors (respects reduced motion) ──────
  function initSmoothScroll() {
    if (prefersReducedMotion) return;
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // ── Mark current-year placeholder ─────────────────────────────────────
  function initYearStamp() {
    const y = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = String(y);
    });
  }

  // ── Telemetry ticker (sticky KPI feed on /emr-intel) ─────────────────
  function initTelemetryTicker() {
    const ticker = document.getElementById('telemetry-ticker');
    if (!ticker || !('IntersectionObserver' in window)) return;

    const targetSel = ticker.getAttribute('data-target') || '#kpi-coverage';
    const target = document.querySelector(targetSel);
    if (!target) return;

    const cells = Array.from(target.querySelectorAll('.telemetry-cell'));
    if (!cells.length) return;

    const codeEl = ticker.querySelector('[data-ticker="code"]');
    const valueEl = ticker.querySelector('[data-ticker="value"]');
    const labelEl = ticker.querySelector('[data-ticker="label"]');
    const dotsEl = ticker.querySelector('[data-ticker="dots"]');

    // Build one dot per KPI cell via DOM methods (no innerHTML).
    const dots = [];
    if (dotsEl) {
      cells.forEach(() => {
        const d = document.createElement('span');
        dotsEl.appendChild(d);
        dots.push(d);
      });
    }

    function readCell(cell) {
      const code = cell.querySelector('.telemetry-cell__code');
      const value = cell.querySelector('.telemetry-cell__value');
      const label = cell.querySelector('.telemetry-cell__label');
      // .telemetry-cell__label contains a nested .telemetry-cell__note;
      // extract just the leading text node for the ticker label.
      let labelText = '';
      if (label) {
        const first = label.firstChild;
        labelText = first && first.nodeType === Node.TEXT_NODE
          ? first.nodeValue.trim()
          : label.textContent.trim();
      }
      return {
        code: code ? code.textContent.trim() : '',
        value: value ? value.textContent.trim() : '',
        label: labelText
      };
    }

    function setActiveCell(idx) {
      const data = readCell(cells[idx]);
      if (codeEl) codeEl.textContent = data.code;
      if (valueEl) valueEl.textContent = data.value;
      if (labelEl) labelEl.textContent = data.label;
      dots.forEach((d, i) => d.classList.toggle('is-on', i === idx));
    }

    // Track which cells are intersecting; pick the topmost one in view.
    const visible = new Set();
    const cellObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const i = cells.indexOf(entry.target);
          if (i < 0) return;
          if (entry.isIntersecting) visible.add(i);
          else visible.delete(i);
        });
        if (visible.size) {
          const topmost = Math.min(...visible);
          setActiveCell(topmost);
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 }
    );
    cells.forEach((c) => cellObs.observe(c));

    // Show ticker only when the KPI section is in view (with a generous buffer
    // so it doesn't slam in and out at the edges).
    const sectionObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ticker.classList.toggle('is-active', entry.isIntersecting);
          ticker.setAttribute('aria-hidden', entry.isIntersecting ? 'false' : 'true');
        });
      },
      { rootMargin: '-72px 0px -10% 0px', threshold: 0 }
    );
    sectionObs.observe(target);

    // Seed with the first cell so the bar is meaningful on first show.
    setActiveCell(0);
  }

  // ── Count-up on stat-cell + telemetry-cell numerics ──────────────────
  // Parses "[prefix][digits with commas][suffix]" and animates from 0 to
  // the target integer while preserving prefix + suffix. Skips values with
  // decimals (e.g. "×3.4"), non-numerics (e.g. "∞"), and runs once per
  // element when it enters the viewport. prefers-reduced-motion bypasses
  // the animation entirely.
  function initCountUp() {
    if (prefersReducedMotion) return;
    if (!('IntersectionObserver' in window)) return;

    const targets = document.querySelectorAll('.stat-cell__value, .telemetry-cell__value');
    if (!targets.length) return;

    const seen = new WeakSet();

    function animate(el) {
      if (seen.has(el)) return;
      const raw = el.textContent.trim();
      // Skip decimals — partial digit animation looks broken.
      if (raw.indexOf('.') !== -1) return;
      const m = raw.match(/^([^\d]*)([\d,]+)(.*)$/);
      if (!m) return;
      const prefix = m[1];
      const digits = m[2].replace(/,/g, '');
      const suffix = m[3];
      const target = parseInt(digits, 10);
      if (!Number.isFinite(target) || target <= 0) return;
      seen.add(el);

      const hasComma = m[2].indexOf(',') !== -1;
      function format(n) {
        return hasComma ? n.toLocaleString('en-SG') : String(n);
      }

      const duration = Math.min(1400, 500 + Math.log10(target + 1) * 280);
      const t0 = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - t0) / duration);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        const v = Math.round(target * eased);
        el.textContent = prefix + format(v) + suffix;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = prefix + format(target) + suffix;
      }
      requestAnimationFrame(tick);
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.4 }
    );
    targets.forEach((el) => obs.observe(el));
  }

  // ── Floating mobile CTA pill ─────────────────────────────────────────
  // Shown only on viewports <920px (CSS-gated), and only after the user
  // scrolls past the first hero / page-intro section. Hidden permanently
  // on /contact (body[data-page="contact"]) — CSS gate handles that.
  function initMobileCtaPill() {
    if (document.body.getAttribute('data-page') === 'contact') return;
    if (!('IntersectionObserver' in window)) return;

    // Find the first section on the page — when it scrolls off, show the pill.
    const firstSection = document.querySelector('main > section:first-of-type, main > .hero, .hero');
    if (!firstSection) return;

    const pill = document.createElement('a');
    pill.className = 'mobile-cta-pill';
    pill.href = 'contact.html';
    pill.setAttribute('aria-label', 'Book a 15-minute call with Jack Wang');
    pill.textContent = 'Book a 15-min call';
    document.body.appendChild(pill);

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          // When the hero is no longer intersecting, show the pill.
          pill.classList.toggle('is-visible', !e.isIntersecting);
        });
      },
      { rootMargin: '-72px 0px 0px 0px', threshold: 0 }
    );
    obs.observe(firstSection);
  }

  // ── Boot ─────────────────────────────────────────────────────────────
  function boot() {
    initNavToggle();
    initTabStrips();
    initContactForm();
    initSmoothScroll();
    initYearStamp();
    initTelemetryTicker();
    initCountUp();
    initMobileCtaPill();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
