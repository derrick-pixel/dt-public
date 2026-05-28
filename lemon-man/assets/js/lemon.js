/* ============================================================
   LEMON MAN — interaction layer. Vanilla, no deps.
   ============================================================ */
(function () {
  'use strict';

  /* ---- Nav: stuck state + mobile menu ------------------------ */
  var nav = document.getElementById('nav');
  var burger = document.querySelector('.nav__burger');
  var menu = document.querySelector('.mobile-menu');

  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (burger && menu && nav) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      nav.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        nav.classList.remove('menu-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Scroll reveal ----------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Lemon Score band → arc colour ------------------------- */
  // High score = sour = bad. Low score = peach = clean.
  function bandColour(score) {
    if (score < 250) return getCSS('--peach');
    if (score < 550) return getCSS('--lemon-br');
    if (score < 760) return getCSS('--lemon');
    return getCSS('--sour');
  }
  function getCSS(v) {
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#e3a400';
  }

  /* ---- Lemon Score gauge: arc draw + count-up ---------------- */
  document.querySelectorAll('[data-gauge]').forEach(function (g) {
    var target = parseInt(g.getAttribute('data-gauge'), 10) || 0;
    var max = 1000;
    var arc = g.querySelector('.gauge__arc');
    var num = g.querySelector('[data-gauge-num]');
    var len = arc ? arc.getTotalLength() : 0;
    if (arc) {
      arc.style.strokeDasharray = len;
      arc.style.strokeDashoffset = len;
      arc.style.stroke = bandColour(target);
    }

    var fired = false;
    var run = function () {
      if (fired) return; fired = true;
      if (arc) {
        requestAnimationFrame(function () {
          arc.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.2,.7,.2,1)';
          arc.style.strokeDashoffset = len - (len * (target / max));
        });
      }
      var card = g.querySelector('.gauge__card');
      if (num) {
        var start = performance.now(), dur = 1500;
        var tick = function (now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          num.textContent = Math.round(target * eased);
          if (p < 1) { requestAnimationFrame(tick); }
          else if (card) { card.classList.add('is-popped'); }
        };
        requestAnimationFrame(tick);
      }
    };

    if ('IntersectionObserver' in window) {
      var go = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { run(); go.disconnect(); } });
      }, { threshold: 0.4 });
      go.observe(g);
    } else { run(); }
  });

  /* ---- Score-band meter pin ---------------------------------- */
  document.querySelectorAll('[data-meter]').forEach(function (m) {
    var score = parseInt(m.getAttribute('data-meter'), 10) || 0;
    var pin = m.querySelector('.meter__pin');
    if (!pin) return;
    var place = function () { pin.style.left = Math.min(score / 1000 * 100, 100) + '%'; };
    if ('IntersectionObserver' in window) {
      var ob = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            pin.style.transition = 'left 1.5s cubic-bezier(.2,.7,.2,1)';
            place(); ob.disconnect();
          }
        });
      }, { threshold: 0.4 });
      pin.style.left = '0%';
      ob.observe(m);
    } else { place(); }
  });

  /* ---- Confetti burst ---------------------------------------- */
  function confettiBurst(origin) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var host = origin.closest('section') || document.body;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var r = origin.getBoundingClientRect(), h = host.getBoundingClientRect();
    var cx = r.left - h.left + r.width / 2, cy = r.top - h.top + r.height / 2;
    var colours = ['#e3a400', '#ffd23c', '#e6855c', '#f4a983', '#fffdf2'];
    for (var i = 0; i < 22; i++) {
      (function (idx) {
        var p = document.createElement('span'), sz = 7 + Math.random() * 7;
        p.style.cssText = 'position:absolute;left:' + cx + 'px;top:' + cy + 'px;width:' + sz +
          'px;height:' + sz + 'px;background:' + colours[idx % 5] + ';border:1.5px solid #211d12;border-radius:' +
          (Math.random() < 0.5 ? '50%' : '2px') + ';pointer-events:none;z-index:60;';
        host.appendChild(p);
        var ang = Math.random() * 6.283, dist = 70 + Math.random() * 175;
        var a = p.animate(
          [{ transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
           { transform: 'translate(' + (Math.cos(ang) * dist).toFixed(1) + 'px,' +
             (Math.sin(ang) * dist + 220).toFixed(1) + 'px) rotate(' +
             (Math.random() * 800 - 400).toFixed(0) + 'deg)', opacity: 0 }],
          { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' });
        a.onfinish = function () { p.remove(); };
      })(i);
    }
  }

  /* ---- Early-access form (front-end stub) -------------------- */
  document.querySelectorAll('.access-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.parentElement.querySelector('.form-msg');
      var input = form.querySelector('input');
      var val = (input && input.value || '').trim();
      var ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val);
      if (!msg) return;
      if (ok) {
        msg.style.color = 'var(--peach-deep, #c45f3a)';
        msg.textContent = '🍋 Squeezed in. We will be in touch about the pilot.';
        form.reset();
        confettiBurst(form);
      } else {
        msg.style.color = 'var(--flag)';
        msg.textContent = 'That email looks a little sour. Try again.';
      }
    });
  });

  /* ---- Lemon Score calculator -------------------------------- */
  (function () {
    var host = document.getElementById('calc-incidents');
    if (!host) return;

    // base points — identical to the incident table on this page
    var INCIDENTS = [
      { id: 'late',    name: 'Chronically late',                  base: 45  },
      { id: 'q4mc',    name: 'Q4 medical-leave clearing',         base: 90  },
      { id: 'bail',    name: 'Last-minute bail (under 24h)',       base: 130 },
      { id: 'insub',   name: 'Insubordination + disciplinary',    base: 150 },
      { id: 'mc',      name: 'Suspected malingering MC',           base: 160 },
      { id: 'noshow',  name: 'No-show (full shift)',               base: 200 },
      { id: 'abandon', name: 'Contract abandonment',               base: 260 },
      { id: 'cred',    name: 'Credential falsification',           base: 380 },
      { id: 'data',    name: 'Data-secrecy breach (with finding)', base: 420 },
      { id: 'theft',   name: 'Theft (with police report)',         base: 500 }
    ];
    var RIPEN = [
      { id: 'testi',  name: 'Verified good testimonial',      per: 70,  max: 2 },
      { id: 'wsq',    name: 'WSQ course completed',           per: 90,  max: 2 },
      { id: 'volun',  name: 'Certified charity volunteering', per: 50,  max: 20, unit: '8h at an IPC charity' },
      { id: 'donate', name: 'Tax-deductible charity donation',per: 20,  max: 50, unit: 'S$100 to an IPC charity' },
      { id: 'clean',  name: '12+ clean months on record',     per: 200, max: 1 }
    ];
    var MAX_N = 3;

    // corroboration multiplier: 0.25n^2 + 0.75n  ->  m1=1, m2=2.5, m3=4.5
    function corr(n) { return n <= 0 ? 0 : 0.25 * n * n + 0.75 * n; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function band(s) {
      if (s < 0)    return ['🍑 Top peach — premium hire', 'is-topeach'];
      if (s <= 250) return ['Peach — safe hire', 'is-peach'];
      if (s <= 550) return ['A bit zesty', 'is-zest'];
      if (s <= 760) return ['Sour — handle with care', 'is-sour'];
      if (s <= 1000) return ['Pucker up', 'is-sour'];
      return ['🍋 Off the chart sour', 'is-pucker-max'];
    }
    function callout(s) {
      if (s < 0)     return { cls: 'is-topeach',    stamp: '5-star hire',         msg: 'Impressive worker — book on sight! 🍑✨' };
      if (s <= 250)  return { cls: 'is-peach',      stamp: '4-star · safe hire',  msg: 'Clean lemon — squeeze with confidence 🍑' };
      if (s <= 550)  return { cls: 'is-zest',       stamp: '3-star · vet first',  msg: 'Some flags on file — ask the right questions 🍋' };
      if (s <= 760)  return { cls: 'is-sour',       stamp: '2-star · high risk',  msg: 'Backup duties only — tight supervision ⚠️' };
      if (s <= 1000) return { cls: 'is-pucker',     stamp: '1-star · last resort',msg: 'Mutually assured sourness territory 🛑' };
      return                  { cls: 'is-pucker-max', stamp: '0-star · hard pass',  msg: 'Police-blotter tier — walk away 🚫' };
    }
    function mk(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }

    var state = {};
    var syncers = [];
    INCIDENTS.concat(RIPEN).forEach(function (x) { state[x.id] = 0; });

    function makeRow(item, isRipen) {
      var max = isRipen ? item.max : MAX_N;
      var el = mk('div', 'cinc' + (isRipen ? ' cinc--ripen' : ''));
      var info = mk('div');
      info.appendChild(mk('div', 'cinc__name', item.name));
      info.appendChild(mk('div', 'cinc__base', isRipen
        ? ('−' + item.per + (item.unit ? ' per ' + item.unit : ' each'))
        : ('base ' + item.base)));
      var ctl = mk('div', 'cinc__ctl');
      var dec = mk('button', 'cstep', '−');
      var nEl = mk('span', 'cinc__n', '0');
      var inc = mk('button', 'cstep', '+');
      dec.type = inc.type = 'button';
      dec.setAttribute('aria-label', 'Decrease ' + item.name);
      inc.setAttribute('aria-label', 'Increase ' + item.name);
      ctl.appendChild(dec); ctl.appendChild(nEl); ctl.appendChild(inc);
      var outEl = mk('span', 'cinc__out', '0');
      el.appendChild(info); el.appendChild(ctl); el.appendChild(outEl);

      function sync() {
        var n = state[item.id];
        nEl.textContent = n;
        el.classList.toggle('on', n > 0);
        dec.disabled = n <= 0;
        inc.disabled = n >= max;
        outEl.textContent = isRipen
          ? (n > 0 ? '−' + (item.per * n) : '0')
          : String(Math.round(item.base * corr(n)));
      }
      dec.addEventListener('click', function () { state[item.id] = clamp(state[item.id] - 1, 0, max); sync(); recompute(); });
      inc.addEventListener('click', function () { state[item.id] = clamp(state[item.id] + 1, 0, max); sync(); recompute(); });
      syncers.push(sync);
      sync();
      return el;
    }

    INCIDENTS.forEach(function (i) { host.appendChild(makeRow(i, false)); });
    var ripenHost = document.getElementById('calc-ripen');
    if (ripenHost) RIPEN.forEach(function (r) { ripenHost.appendChild(makeRow(r, true)); });

    var elScore   = document.getElementById('calc-score');
    var elVerdict = document.getElementById('calc-verdict');
    var elPin     = document.getElementById('calc-pin');
    var elRaw     = document.getElementById('calc-raw');
    var elRipTot  = document.getElementById('calc-ripen-total');
    var elFinal   = document.getElementById('calc-final');

    var face    = document.getElementById('calc-face');
    var cfBody  = face && face.querySelector('.cf-body');
    var cfMouth = face && face.querySelector('.cf-mouth');
    var FACES = {
      topeach: { fill: '#ffb491', mouth: 'M11.4 19.4 Q16 25.2 20.6 19.4' },
      peach:   { fill: '#e6855c', mouth: 'M12.5 20 Q16 23.6 19.5 20' },
      zest:    { fill: '#ffd23c', mouth: 'M13 20.9 Q16 22.5 19 20.9' },
      sour:    { fill: '#e3a400', mouth: 'M12.5 22.4 Q16 18.8 19.5 22.4' },
      pucker:  { fill: '#a86a00', mouth: 'M12.6 21.2 Q14.3 19.3 16 21.2 Q17.7 23.1 19.4 21.2' },
      max:     { fill: '#7a3a00', mouth: 'M12.6 22 Q14.3 18.5 16 22 Q17.7 25.5 19.4 22' }
    };
    function faceKey(s) {
      if (s < 0)     return 'topeach';
      if (s <= 250)  return 'peach';
      if (s <= 550)  return 'zest';
      if (s <= 760)  return 'sour';
      if (s <= 1000) return 'pucker';
      return 'max';
    }

    var elResult = document.querySelector('#calculator .calc__result');
    var bStamp = null, bMsg = null, elBanner = null;
    if (elResult) {
      elBanner = document.createElement('div');
      elBanner.className = 'calc__hooray';
      elBanner.setAttribute('aria-live', 'polite');
      bStamp = document.createElement('span');
      bStamp.className = 'calc__hooray-stamp';
      bMsg = document.createElement('strong');
      elBanner.appendChild(bStamp);
      elBanner.appendChild(bMsg);
      elResult.appendChild(elBanner);
    }
    var prevNeg = false;
    function fireConfettiOnce(host) {
      if (!host) return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      var colours = ['#e6855c', '#ffb491', '#ffd23c', '#fffdf2', '#f4a983'];
      for (var i = 0; i < 26; i++) {
        (function (idx) {
          var p = document.createElement('span'), sz = 7 + Math.random() * 7;
          p.style.cssText = 'position:absolute;left:50%;top:18%;width:' + sz +
            'px;height:' + sz + 'px;background:' + colours[idx % 5] +
            ';border:1.5px solid #211d12;border-radius:' + (Math.random() < 0.5 ? '50%' : '2px') +
            ';pointer-events:none;z-index:60;';
          host.appendChild(p);
          var ang = Math.random() * 6.283, dist = 60 + Math.random() * 160;
          var a = p.animate(
            [{ transform: 'translate(-50%,0) rotate(0deg)', opacity: 1 },
             { transform: 'translate(' + (Math.cos(ang) * dist - 50).toFixed(1) + '%,' +
               (Math.sin(ang) * dist + 200).toFixed(1) + 'px) rotate(' +
               (Math.random() * 800 - 400).toFixed(0) + 'deg)', opacity: 0 }],
            { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' });
          a.onfinish = function () { p.remove(); };
        })(i);
      }
    }

    function recompute() {
      var raw = 0;
      INCIDENTS.forEach(function (i) { raw += i.base * corr(state[i.id]); });
      raw = Math.round(raw);
      var ripen = 0;
      RIPEN.forEach(function (r) { ripen += r.per * state[r.id]; });
      var score = raw - ripen;
      var b = band(score);
      var pinPct = clamp(score / 1000 * 100, 0, 100);
      if (elScore)   elScore.textContent = score < 0 ? ('−' + Math.abs(score)) : score;
      if (elVerdict) { elVerdict.textContent = b[0]; elVerdict.className = 'calc__verdict ' + b[1]; }
      if (elPin)     elPin.style.left = pinPct + '%';
      if (elRaw)     elRaw.textContent = raw;
      if (elRipTot)  elRipTot.textContent = '−' + ripen;
      if (elFinal)   elFinal.textContent = score < 0 ? ('−' + Math.abs(score)) : score;
      if (cfBody && cfMouth) {
        var f = FACES[faceKey(score)];
        cfBody.setAttribute('fill', f.fill);
        cfMouth.setAttribute('d', f.mouth);
      }
      if (elResult) {
        elResult.classList.toggle('is-topeach', score < 0);
        elResult.classList.toggle('is-overload', score > 1000);
      }
      var co = callout(score);
      if (elBanner) elBanner.className = 'calc__hooray ' + co.cls;
      if (bStamp)   bStamp.textContent = co.stamp;
      if (bMsg)     bMsg.textContent = co.msg;
      var isNeg = score < 0;
      if (isNeg && !prevNeg) { fireConfettiOnce(elResult); }
      prevNeg = isNeg;
    }

    var reset = document.getElementById('calc-reset');
    if (reset) reset.addEventListener('click', function () {
      Object.keys(state).forEach(function (k) { state[k] = 0; });
      syncers.forEach(function (fn) { fn(); });
      prevNeg = false;
      recompute();
    });

    recompute();
  })();

  /* ---- Comprehensive simulator (50 incidents) ---------------- */
  (function () {
    var host = document.getElementById('sim-incidents');
    if (!host) return;

    var SIM_INCIDENTS = [
      // Attendance & reliability
      { cat: 'Attendance & reliability', id: 'late',       name: 'Chronically late (per logged instance)',  base: 45 },
      { cat: 'Attendance & reliability', id: 'leaveear',   name: 'Leaving early without notice',             base: 60 },
      { cat: 'Attendance & reliability', id: 'tardpat',    name: 'Repeated tardiness (3+ in a month)',       base: 90 },
      { cat: 'Attendance & reliability', id: 'unschbreak', name: 'Excessive unscheduled breaks (pattern)',   base: 60 },
      { cat: 'Attendance & reliability', id: 'bail',       name: 'Last-minute bail (under 24h)',             base: 130 },
      { cat: 'Attendance & reliability', id: 'q4mc',       name: 'Q4 medical-leave clearing',                base: 90 },
      { cat: 'Attendance & reliability', id: 'mc',         name: 'Suspected malingering MC',                 base: 160 },
      { cat: 'Attendance & reliability', id: 'sleepsh',    name: 'Sleeping on shift (with finding)',         base: 180 },
      { cat: 'Attendance & reliability', id: 'noshow',     name: 'No-show (full shift)',                     base: 200 },
      { cat: 'Attendance & reliability', id: 'ncns',       name: 'No-call no-show',                          base: 220 },
      { cat: 'Attendance & reliability', id: 'walkoff',    name: 'Walked off post mid-shift',                base: 280 },
      { cat: 'Attendance & reliability', id: 'abandon',    name: 'Contract abandonment',                     base: 260 },

      // Conduct on-site
      { cat: 'Conduct on-site',  id: 'unprof',    name: 'Unprofessional appearance (repeated)',        base: 50 },
      { cat: 'Conduct on-site',  id: 'phone',     name: 'Excessive phone use on duty (disciplined)',   base: 60 },
      { cat: 'Conduct on-site',  id: 'insub',     name: 'Insubordination + disciplinary action',       base: 150 },
      { cat: 'Conduct on-site',  id: 'refuseord', name: 'Refusal of lawful instruction',               base: 180 },
      { cat: 'Conduct on-site',  id: 'clientcom', name: 'Client complaint upheld',                     base: 200 },
      { cat: 'Conduct on-site',  id: 'verbalab',  name: 'Verbal abuse incident (logged)',              base: 260 },
      { cat: 'Conduct on-site',  id: 'sleepduty', name: 'Sleeping on duty (security / medical role)',  base: 260 },
      { cat: 'Conduct on-site',  id: 'reftest',   name: 'Refused drug / alcohol test (where required)',base: 280 },
      { cat: 'Conduct on-site',  id: 'impaired',  name: 'Substance impairment on duty (with finding)', base: 320 },
      { cat: 'Conduct on-site',  id: 'harass',    name: 'Workplace harassment (verified finding)',     base: 350 },

      // Credentials & honesty
      { cat: 'Credentials & honesty', id: 'avail',    name: 'False availability (deliberate double-booking)',base: 120 },
      { cat: 'Credentials & honesty', id: 'misrep',   name: 'Misrepresented experience',                   base: 220 },
      { cat: 'Credentials & honesty', id: 'fakeref',  name: 'Fake or fabricated reference',                base: 260 },
      { cat: 'Credentials & honesty', id: 'falsemc',  name: 'False MC submission (verified)',              base: 280 },
      { cat: 'Credentials & honesty', id: 'cred',     name: 'Credential falsification',                    base: 380 },
      { cat: 'Credentials & honesty', id: 'identity', name: 'Identity misuse',                              base: 400 },

      // Data & security
      { cat: 'Data & security', id: 'confidv',    name: 'Verbal confidentiality breach (with witnesses)',  base: 160 },
      { cat: 'Data & security', id: 'photos',     name: 'Unauthorised photos / recordings of client site', base: 200 },
      { cat: 'Data & security', id: 'rosterleak', name: 'Shared roster / schedule with a competitor',       base: 220 },
      { cat: 'Data & security', id: 'clientlist', name: 'Took client / contact list to next employer',     base: 320 },
      { cat: 'Data & security', id: 'data',       name: 'Data-secrecy breach (with finding)',              base: 420 },

      // Theft & financial
      { cat: 'Theft & financial', id: 'subst',     name: 'Unauthorised substitution (sent another worker)', base: 240 },
      { cat: 'Theft & financial', id: 'expense',   name: 'Expense / claim fraud',                            base: 260 },
      { cat: 'Theft & financial', id: 'pilfer',    name: 'Pilferage (with finding, no police)',              base: 280 },
      { cat: 'Theft & financial', id: 'timefraud', name: 'Time-card fraud (clocked but not present)',        base: 300 },
      { cat: 'Theft & financial', id: 'theft',     name: 'Theft (with police report)',                       base: 500 },

      // Safety
      { cat: 'Safety', id: 'ppe',      name: 'PPE non-compliance (repeated, disciplined)',     base: 80 },
      { cat: 'Safety', id: 'reftrain', name: 'Refused mandatory safety training',              base: 140 },
      { cat: 'Safety', id: 'firebr',   name: 'Fire / safety procedure breach (with finding)',  base: 180 },
      { cat: 'Safety', id: 'unsafe',   name: 'Unsafe work practice causing incident',          base: 220 },
      { cat: 'Safety', id: 'injury',   name: 'Caused workplace injury (negligence finding)',   base: 260 },

      // Performance & process
      { cat: 'Performance & process', id: 'probfail',   name: 'Failed mandatory probation review',           base: 100 },
      { cat: 'Performance & process', id: 'compfail',   name: 'Failed mandatory competency test',            base: 120 },
      { cat: 'Performance & process', id: 'refpip',     name: 'Refused performance improvement plan',         base: 90 },
      { cat: 'Performance & process', id: 'quality',    name: 'Repeated quality failures (3+ documented)',    base: 120 },
      { cat: 'Performance & process', id: 'norehire',   name: 'Client refusal-to-rehire (formal note)',       base: 160 },
      { cat: 'Performance & process', id: 'negligence', name: 'Gross negligence with quantifiable damage',    base: 280 },
      { cat: 'Performance & process', id: 'momcomp',    name: 'MOM complaint substantiated against worker',   base: 320 }
    ];
    var SIM_RIPEN = [
      { id: 'testi',  name: 'Verified good testimonial',      per: 70,  max: 2 },
      { id: 'wsq',    name: 'WSQ course completed',           per: 90,  max: 2 },
      { id: 'volun',  name: 'Certified charity volunteering', per: 50,  max: 20, unit: '8h at an IPC charity' },
      { id: 'donate', name: 'Tax-deductible charity donation',per: 20,  max: 50, unit: 'S$100 to an IPC charity' },
      { id: 'clean',  name: '12+ clean months on record',     per: 200, max: 1 }
    ];
    var MAX_N = 3;
    function corr(n) { return n <= 0 ? 0 : 0.25 * n * n + 0.75 * n; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function bandStr(s) {
      if (s < 0)     return ['🍑 Top peach — premium hire', 'is-topeach'];
      if (s <= 250)  return ['Peach — safe hire', 'is-peach'];
      if (s <= 550)  return ['A bit zesty', 'is-zest'];
      if (s <= 760)  return ['Sour — handle with care', 'is-sour'];
      if (s <= 1000) return ['Pucker up', 'is-sour'];
      return ['🍋 Off the chart sour', 'is-pucker-max'];
    }
    function callout(s) {
      if (s < 0)     return { cls: 'is-topeach',    stamp: '5-star hire',         msg: 'Impressive worker — book on sight! 🍑✨' };
      if (s <= 250)  return { cls: 'is-peach',      stamp: '4-star · safe hire',  msg: 'Clean lemon — squeeze with confidence 🍑' };
      if (s <= 550)  return { cls: 'is-zest',       stamp: '3-star · vet first',  msg: 'Some flags on file — ask the right questions 🍋' };
      if (s <= 760)  return { cls: 'is-sour',       stamp: '2-star · high risk',  msg: 'Backup duties only — tight supervision ⚠️' };
      if (s <= 1000) return { cls: 'is-pucker',     stamp: '1-star · last resort',msg: 'Mutually assured sourness territory 🛑' };
      return                  { cls: 'is-pucker-max', stamp: '0-star · hard pass',  msg: 'Police-blotter tier — walk away 🚫' };
    }
    function faceKey(s) {
      if (s < 0)     return 'topeach';
      if (s <= 250)  return 'peach';
      if (s <= 550)  return 'zest';
      if (s <= 760)  return 'sour';
      if (s <= 1000) return 'pucker';
      return 'max';
    }
    var FACES = {
      topeach: { fill: '#ffb491', mouth: 'M11.4 19.4 Q16 25.2 20.6 19.4' },
      peach:   { fill: '#e6855c', mouth: 'M12.5 20 Q16 23.6 19.5 20' },
      zest:    { fill: '#ffd23c', mouth: 'M13 20.9 Q16 22.5 19 20.9' },
      sour:    { fill: '#e3a400', mouth: 'M12.5 22.4 Q16 18.8 19.5 22.4' },
      pucker:  { fill: '#a86a00', mouth: 'M12.6 21.2 Q14.3 19.3 16 21.2 Q17.7 23.1 19.4 21.2' },
      max:     { fill: '#7a3a00', mouth: 'M12.6 22 Q14.3 18.5 16 22 Q17.7 25.5 19.4 22' }
    };
    function mk(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

    var state = {};
    var syncers = [];
    SIM_INCIDENTS.concat(SIM_RIPEN).forEach(function (x) { state[x.id] = 0; });

    function makeRow(item, isRipen) {
      var max = isRipen ? item.max : MAX_N;
      var el = mk('div', 'cinc' + (isRipen ? ' cinc--ripen' : ''));
      var info = mk('div');
      info.appendChild(mk('div', 'cinc__name', item.name));
      info.appendChild(mk('div', 'cinc__base', isRipen
        ? ('−' + item.per + (item.unit ? ' per ' + item.unit : ' each'))
        : ('base ' + item.base)));
      var ctl = mk('div', 'cinc__ctl');
      var dec = mk('button', 'cstep', '−');
      var nEl = mk('span', 'cinc__n', '0');
      var inc = mk('button', 'cstep', '+');
      dec.type = inc.type = 'button';
      dec.setAttribute('aria-label', 'Decrease ' + item.name);
      inc.setAttribute('aria-label', 'Increase ' + item.name);
      ctl.appendChild(dec); ctl.appendChild(nEl); ctl.appendChild(inc);
      var outEl = mk('span', 'cinc__out', '0');
      el.appendChild(info); el.appendChild(ctl); el.appendChild(outEl);
      function sync() {
        var n = state[item.id];
        nEl.textContent = n;
        el.classList.toggle('on', n > 0);
        dec.disabled = n <= 0;
        inc.disabled = n >= max;
        outEl.textContent = isRipen
          ? (n > 0 ? '−' + (item.per * n) : '0')
          : String(Math.round(item.base * corr(n)));
      }
      dec.addEventListener('click', function () { state[item.id] = clamp(state[item.id] - 1, 0, max); sync(); recompute(); });
      inc.addEventListener('click', function () { state[item.id] = clamp(state[item.id] + 1, 0, max); sync(); recompute(); });
      syncers.push(sync); sync();
      return el;
    }

    var seenCat = {};
    SIM_INCIDENTS.forEach(function (item) {
      if (!seenCat[item.cat]) {
        host.appendChild(mk('div', 'cat-head', item.cat));
        seenCat[item.cat] = true;
      }
      host.appendChild(makeRow(item, false));
    });
    var ripenHost = document.getElementById('sim-ripen');
    if (ripenHost) SIM_RIPEN.forEach(function (r) { ripenHost.appendChild(makeRow(r, true)); });

    var elScore   = document.getElementById('sim-score');
    var elVerdict = document.getElementById('sim-verdict');
    var elPin     = document.getElementById('sim-pin');
    var elRaw     = document.getElementById('sim-raw');
    var elRipTot  = document.getElementById('sim-ripen-total');
    var elFinal   = document.getElementById('sim-final');
    var face      = document.getElementById('sim-face');
    var cfBody    = face && face.querySelector('.cf-body');
    var cfMouth   = face && face.querySelector('.cf-mouth');

    var elResult = document.querySelector('#simulator .calc__result');
    var simBanner = null, simStamp = null, simMsg = null;
    if (elResult) {
      simBanner = document.createElement('div');
      simBanner.className = 'calc__hooray';
      simBanner.setAttribute('aria-live', 'polite');
      simStamp = document.createElement('span');
      simStamp.className = 'calc__hooray-stamp';
      simMsg = document.createElement('strong');
      simBanner.appendChild(simStamp); simBanner.appendChild(simMsg);
      elResult.appendChild(simBanner);
    }
    var prevNeg = false;
    function fireConfettiOnce(host) {
      if (!host) return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      var colours = ['#e6855c', '#ffb491', '#ffd23c', '#fffdf2', '#f4a983'];
      for (var i = 0; i < 26; i++) {
        (function (idx) {
          var p = document.createElement('span'), sz = 7 + Math.random() * 7;
          p.style.cssText = 'position:absolute;left:50%;top:18%;width:' + sz +
            'px;height:' + sz + 'px;background:' + colours[idx % 5] +
            ';border:1.5px solid #211d12;border-radius:' + (Math.random() < 0.5 ? '50%' : '2px') +
            ';pointer-events:none;z-index:60;';
          host.appendChild(p);
          var ang = Math.random() * 6.283, dist = 60 + Math.random() * 160;
          var a = p.animate(
            [{ transform: 'translate(-50%,0) rotate(0deg)', opacity: 1 },
             { transform: 'translate(' + (Math.cos(ang) * dist - 50).toFixed(1) + '%,' +
               (Math.sin(ang) * dist + 200).toFixed(1) + 'px) rotate(' +
               (Math.random() * 800 - 400).toFixed(0) + 'deg)', opacity: 0 }],
            { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' });
          a.onfinish = function () { p.remove(); };
        })(i);
      }
    }

    function recompute() {
      var raw = 0;
      SIM_INCIDENTS.forEach(function (i) { raw += i.base * corr(state[i.id]); });
      raw = Math.round(raw);
      var ripen = 0;
      SIM_RIPEN.forEach(function (r) { ripen += r.per * state[r.id]; });
      var score = raw - ripen;
      var b = bandStr(score);
      var pinPct = clamp(score / 1000 * 100, 0, 100);
      if (elScore)   elScore.textContent = score < 0 ? ('−' + Math.abs(score)) : score;
      if (elVerdict) { elVerdict.textContent = b[0]; elVerdict.className = 'calc__verdict ' + b[1]; }
      if (elPin)     elPin.style.left = pinPct + '%';
      if (elRaw)     elRaw.textContent = raw;
      if (elRipTot)  elRipTot.textContent = '−' + ripen;
      if (elFinal)   elFinal.textContent = score < 0 ? ('−' + Math.abs(score)) : score;
      if (cfBody && cfMouth) {
        var f = FACES[faceKey(score)];
        cfBody.setAttribute('fill', f.fill);
        cfMouth.setAttribute('d', f.mouth);
      }
      if (elResult) {
        elResult.classList.toggle('is-topeach', score < 0);
        elResult.classList.toggle('is-overload', score > 1000);
      }
      var co = callout(score);
      if (simBanner) simBanner.className = 'calc__hooray ' + co.cls;
      if (simStamp)  simStamp.textContent = co.stamp;
      if (simMsg)    simMsg.textContent = co.msg;
      var isNeg = score < 0;
      if (isNeg && !prevNeg) { fireConfettiOnce(elResult); }
      prevNeg = isNeg;
    }

    var reset = document.getElementById('sim-reset');
    if (reset) reset.addEventListener('click', function () {
      Object.keys(state).forEach(function (k) { state[k] = 0; });
      syncers.forEach(function (fn) { fn(); });
      prevNeg = false;
      recompute();
    });

    recompute();
  })();

  /* ---- Boss Confessions carousel ----------------------------- */
  (function () {
    var car = document.getElementById('confess-carousel');
    if (!car) return;
    var stage = car.querySelector('.confess-stage') || car;
    var card  = car.querySelector('.confess-card');
    var prev  = car.querySelector('.cf-nav--prev');
    var next  = car.querySelector('.cf-nav--next');
    var dotsHost = car.querySelector('#cf-dots');
    if (!card) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var FALLBACK = [
      { quote: "Three guys, three MCs, all dated Monday. Always Monday.",             attrib: "F&B owner · Boon Lay",       trait: "malingering MC" },
      { quote: "He claimed bird's nest as 'medication'. I claimed his bonus.",        attrib: "Bank ops · CBD",             trait: "expense fraud" },
      { quote: "Took the deposit. Took the uniform. Took the next day off forever.",  attrib: "Events staffing · Bugis",    trait: "contract abandonment" }
    ];
    var items = [];
    var idx = 0;
    var timer = null;
    var AUTO_MS = 6500;
    var SWAP_MS = 320;

    function clearChildren(el) { while (el.firstChild) el.removeChild(el.firstChild); }

    function render(i, instant) {
      var d = items[i]; if (!d) return;
      var apply = function () {
        card.querySelector('.confess-q').textContent = d.quote;
        card.querySelector('.confess-c').textContent = d.attrib;
        card.querySelector('.confess-t').textContent = d.trait;
        requestAnimationFrame(function () { card.classList.remove('is-swap'); });
      };
      if (instant) { apply(); }
      else { card.classList.add('is-swap'); setTimeout(apply, SWAP_MS); }
      updateDots();
    }

    function updateDots() {
      if (!dotsHost) return;
      var dots = dotsHost.querySelectorAll('button');
      for (var i = 0; i < dots.length; i++) {
        var on = i === idx;
        dots[i].classList.toggle('is-on', on);
        dots[i].setAttribute('aria-current', on ? 'true' : 'false');
      }
    }

    function go(d)   { idx = (idx + d + items.length) % items.length; render(idx); resetAuto(); }
    function goTo(i) { if (i === idx) return; idx = i; render(idx); resetAuto(); }

    function startAuto() { if (reduced || items.length <= 1) return; timer = setInterval(function () { idx = (idx + 1) % items.length; render(idx); }, AUTO_MS); }
    function stopAuto()  { if (timer) { clearInterval(timer); timer = null; } }
    function resetAuto() { stopAuto(); startAuto(); }

    function makeDots() {
      if (!dotsHost) return;
      clearChildren(dotsHost);
      items.forEach(function (_, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'cf-dot';
        b.setAttribute('aria-label', 'Confession ' + (i + 1));
        b.addEventListener('click', function () { goTo(i); });
        dotsHost.appendChild(b);
      });
      updateDots();
    }

    function init(pool) {
      items = pool;
      idx = Math.floor(Math.random() * items.length);
      makeDots();
      render(idx, true);
      if (prev) prev.addEventListener('click', function () { go(-1); });
      if (next) next.addEventListener('click', function () { go(+1); });
      stage.addEventListener('mouseenter', stopAuto);
      stage.addEventListener('mouseleave', startAuto);
      stage.addEventListener('focusin',  stopAuto);
      stage.addEventListener('focusout', startAuto);
      // swipe
      var sx = 0, dragging = false;
      stage.addEventListener('pointerdown', function (e) { sx = e.clientX; dragging = true; });
      stage.addEventListener('pointerup',   function (e) {
        if (!dragging) return;
        dragging = false;
        var dx = e.clientX - sx;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      });
      stage.addEventListener('pointercancel', function () { dragging = false; });
      startAuto();
    }

    fetch('assets/data/confessions.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { init((d && d.length) ? d : FALLBACK); })
      .catch(function () { init(FALLBACK); });
  })();

  /* ---- Year stamp -------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
