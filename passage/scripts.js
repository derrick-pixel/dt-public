/* =============================================
   PASSAGE — Global Scripts
   ============================================= */

// Mobile nav toggle
function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (!nav) return;
  nav.classList.toggle('open');
}

// Inject nav + footer from snippets, then run page init
document.addEventListener('DOMContentLoaded', () => {
  // Active nav link
  const links = document.querySelectorAll('.nav__links a, .nav__mobile a');
  links.forEach(link => {
    if (link.getAttribute('href') === location.pathname.split('/').pop() ||
        (location.pathname === '/' && link.getAttribute('href') === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Animate on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.animate').forEach(el => observer.observe(el));

  // Smooth counter animation
  document.querySelectorAll('.count-up').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const isFloat = el.dataset.float === 'true';
    let start = 0;
    const duration = 1800;
    const step = timestamp => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    // Only trigger when visible
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { requestAnimationFrame(step); io.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });
});

// FAQ accordion
function initAccordion(selector) {
  document.querySelectorAll(selector).forEach(item => {
    const trigger = item.querySelector('.accordion__trigger');
    const body = item.querySelector('.accordion__body');
    if (!trigger || !body) return;
    trigger.addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll(selector + '.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.accordion__body').style.maxHeight = '0';
      });
      if (!open) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

// Tab system
function initTabs(tabsSelector, panelsSelector) {
  const tabs = document.querySelectorAll(tabsSelector);
  const panels = document.querySelectorAll(panelsSelector);
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      if (panels[i]) panels[i].classList.add('active');
    });
  });
}

// Checkout modal
function openCheckout(name, price, model) {
  const modal = document.getElementById('checkoutModal');
  if (!modal) return;
  document.getElementById('co-model').textContent = name;
  document.getElementById('co-price').textContent = 'S$' + price.toLocaleString();
  document.getElementById('co-input-model').value = model;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCheckout() {
  const modal = document.getElementById('checkoutModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Handle checkout form
function submitCheckout(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  btn.textContent = 'Processing…';
  btn.disabled = true;
  setTimeout(() => {
    document.getElementById('checkoutForm').style.display = 'none';
    document.getElementById('checkoutSuccess').style.display = 'block';
  }, 1400);
  return false;
}
