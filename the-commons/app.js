/* ============================================
   THE COMMONS — App JavaScript
   ============================================ */

// --- Navbar scroll behavior ---
const navbar = document.getElementById('navbar');
if (navbar && navbar.classList.contains('transparent')) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.remove('transparent');
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
      navbar.classList.add('transparent');
    }
  });
}

// --- Mobile Menu ---
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
}

// --- Auth Modal ---
function openAuthModal(type) {
  const modal = document.getElementById('authModal');
  const title = document.getElementById('authTitle');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  if (!modal) return;

  modal.classList.add('open');
  if (type === 'signup') {
    title.textContent = 'Create Your Account';
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  } else {
    title.textContent = 'Welcome Back';
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('open');
}

function handleAuth() {
  // Read email (and name, if present) from whichever form is visible
  const modal = document.getElementById('authModal');
  if (!modal) return;
  const visibleForm = modal.querySelector('#signupForm[style*="block"], #signupForm:not([style*="none"])')
    || modal.querySelector('#loginForm');
  const emailEl = visibleForm && visibleForm.querySelector('input[type="email"]');
  const nameEl = visibleForm && visibleForm.querySelector('input[type="text"]');
  const email = emailEl ? emailEl.value.trim() : '';
  const name = nameEl ? nameEl.value.trim() : '';

  if (window.TCStore && email) {
    TCStore.setCurrentUser({ name: name || email.split('@')[0], email: email });
  }

  closeAuthModal();
  showToast(email ? 'Welcome, ' + (name || email.split('@')[0]) + '!' : 'Welcome to The Commons!', 'success');
  // Refresh dashboards if present
  if (typeof renderDashboard === 'function') renderDashboard();
}

// --- Toast Notification ---
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast ' + type + ' show';
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// --- Scroll Fade-in Animation ---
function initFadeIn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => observer.observe(el));
}

// --- Events Page: Category Filter ---
let activeCategory = 'all';

function setCategory(btn, category) {
  document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = category;
  filterEvents();
}

function filterEvents() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput ? searchInput.value.toLowerCase() : '';
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.event-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cat = card.dataset.category || '';
    const text = card.textContent.toLowerCase();
    const matchCategory = activeCategory === 'all' || cat === activeCategory;
    const matchSearch = !query || text.includes(query);

    if (matchCategory && matchSearch) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const counter = document.getElementById('resultsCount');
  if (counter) counter.textContent = `Showing ${visibleCount} event${visibleCount !== 1 ? 's' : ''}`;
}

// --- Marketplace: Provider Filter ---
let activeProviderCategory = 'all';

function setProviderCategory(btn, category) {
  document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  activeProviderCategory = category;
  filterProviders();
}

function filterProviders() {
  const searchInput = document.getElementById('providerSearch');
  const query = searchInput ? searchInput.value.toLowerCase() : '';
  const grid = document.getElementById('providersGrid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.provider-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cat = card.dataset.category || '';
    const text = card.textContent.toLowerCase();
    const matchCategory = activeProviderCategory === 'all' || cat === activeProviderCategory;
    const matchSearch = !query || text.includes(query);

    if (matchCategory && matchSearch) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const counter = document.getElementById('providerCount');
  if (counter) counter.textContent = `Showing ${visibleCount} provider${visibleCount !== 1 ? 's' : ''}`;
}

// --- Create Event: Multi-step Form ---
let currentStep = 1;

function goToStep(step) {
  // Hide all steps
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById('step' + i);
    if (el) el.style.display = 'none';
  }

  // Show target step
  const target = document.getElementById('step' + step);
  if (target) target.style.display = 'block';

  // Update step indicator
  document.querySelectorAll('#stepIndicator .step').forEach(s => {
    const stepNum = parseInt(s.dataset.step);
    s.classList.remove('active', 'completed');
    if (stepNum < step) s.classList.add('completed');
    if (stepNum === step) s.classList.add('active');
  });

  currentStep = step;

  // If step 3, update review summary
  if (step === 3) updateReviewSummary();

  // Scroll to top
  window.scrollTo({ top: 150, behavior: 'smooth' });
}

function updateReviewSummary() {
  const name = document.getElementById('eventName');
  const category = document.getElementById('eventCategory');
  const date = document.getElementById('eventDate');
  const time = document.getElementById('eventTime');
  const location = document.getElementById('eventLocation');
  const cost = document.getElementById('totalCost');
  const maxAttendees = document.getElementById('maxAttendees');

  if (document.getElementById('reviewName'))
    document.getElementById('reviewName').textContent = name ? name.value || '—' : '—';
  if (document.getElementById('reviewCategory'))
    document.getElementById('reviewCategory').textContent = category ? (category.options[category.selectedIndex]?.text || '—') : '—';
  if (document.getElementById('reviewDate'))
    document.getElementById('reviewDate').textContent = date && date.value ? `${date.value} ${time ? time.value : ''}` : '—';
  if (document.getElementById('reviewLocation'))
    document.getElementById('reviewLocation').textContent = location ? location.value || '—' : '—';
  if (document.getElementById('reviewCost'))
    document.getElementById('reviewCost').textContent = cost && cost.value ? `$${cost.value}` : '—';
  if (document.getElementById('reviewMax'))
    document.getElementById('reviewMax').textContent = maxAttendees ? maxAttendees.value || '—' : '—';

  const milestones = document.querySelectorAll('.milestone-amount');
  if (document.getElementById('reviewMilestones'))
    document.getElementById('reviewMilestones').textContent = `${milestones.length} milestones`;
}

// --- Milestone Management ---
let milestoneCount = 3;

function addMilestone() {
  milestoneCount++;
  const colors = ['var(--coral)', 'var(--ocean)', 'var(--pink)', 'var(--palm)', 'var(--fuchsia)'];
  const color = colors[(milestoneCount - 1) % colors.length];
  const html = `
    <div class="milestone-item" style="background: white; border-radius: var(--radius-sm); padding: 20px; margin-bottom: 12px; border-left: 4px solid ${color};">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <strong>Milestone ${milestoneCount}</strong>
        <button class="btn btn-sm" style="color: var(--coral); font-size: 0.8rem; padding: 4px 8px;" onclick="removeMilestone(this)">Remove</button>
      </div>
      <div class="form-row">
        <div class="form-group" style="margin-bottom: 0;">
          <label style="font-size: 0.8rem;">Amount ($)</label>
          <input type="number" placeholder="0" class="milestone-amount" oninput="updateMilestonePreview()">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label style="font-size: 0.8rem;">Due Date</label>
          <input type="date" class="milestone-date">
        </div>
      </div>
    </div>
  `;
  const list = document.getElementById('milestonesList');
  if (list) list.insertAdjacentHTML('beforeend', html);
}

function removeMilestone(btn) {
  const item = btn.closest('.milestone-item');
  if (item) item.remove();
  updateMilestonePreview();
}

function updateMilestonePreview() {
  const amounts = document.querySelectorAll('.milestone-amount');
  const totalInput = document.getElementById('totalCost');
  const total = totalInput ? parseFloat(totalInput.value) || 0 : 0;

  let milestoneSum = 0;
  amounts.forEach(input => {
    milestoneSum += parseFloat(input.value) || 0;
  });

  const display = document.getElementById('milestoneTotal');
  if (display) {
    display.textContent = `$${milestoneSum} / $${total}`;
    display.style.color = milestoneSum === total && total > 0 ? '#059669' : milestoneSum > total ? '#EF4444' : 'inherit';
  }
}

// --- Service tags ---
function toggleService(btn) {
  btn.classList.toggle('active');
}

// --- Publish Event ---
function publishEvent() {
  const successModal = document.getElementById('successModal');
  if (successModal) successModal.classList.add('open');
}

function copyShareLink() {
  const input = document.getElementById('shareLink');
  if (input) {
    input.select();
    document.execCommand('copy');
    showToast('Link copied to clipboard!', 'success');
  }
}

// --- RSVP Modal ---
function openRSVPModal() {
  const modal = document.getElementById('rsvpModal');
  if (modal) modal.classList.add('open');
  backToRSVPForm();
}

function closeRSVPModal() {
  const modal = document.getElementById('rsvpModal');
  if (modal) modal.classList.remove('open');
}

function backToRSVPForm() {
  const step1 = document.getElementById('rsvpStepForm');
  const step2 = document.getElementById('rsvpStepPayNow');
  if (step1) step1.style.display = 'block';
  if (step2) step2.style.display = 'none';
}

// Build PayNow QR for the RSVP deposit step.
// opts: { amount, eventTitle, balanceDue, refPrefix, eventId }
function proceedToPayNow(opts) {
  opts = opts || {};
  const agreeEl = document.getElementById('rsvp-agree');
  if (agreeEl && !agreeEl.checked) {
    showToast('Please agree to the escrow terms first.', 'error');
    return;
  }

  // Read form fields (if present)
  const nameEl = document.getElementById('rsvp-name');
  const emailEl = document.getElementById('rsvp-email');
  const phoneEl = document.getElementById('rsvp-phone');
  const name = nameEl ? nameEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';
  const phone = phoneEl ? phoneEl.value.trim() : '';

  if (!name || !email) {
    showToast('Please fill in your name and email.', 'error');
    return;
  }

  // Set as current user (simulated login via first RSVP)
  if (window.TCStore) TCStore.setCurrentUser({ name: name, email: email });

  // Resolve event context — from opts, or fall back to URL param on event.html
  const ev = (opts.eventId && window.TCStore && TCStore.eventById(opts.eventId))
    || (window.TCStore && TCStore.findEventParam())
    || null;

  const amount = opts.amount || (ev ? ev.depositAmount : 50);
  const reference = (window.TCPayNow && TCPayNow.makeReference(opts.refPrefix || 'TC-RSVP')) || 'TC-RSVP';

  // Write RSVP + pending transaction to store immediately (will verify via admin)
  let rsvpRecord = null, txnRecord = null;
  if (window.TCStore && ev) {
    rsvpRecord = TCStore.createRSVP({
      eventId: ev.id, name: name, email: email, phone: phone,
      status: 'pending_verification', amountPaid: 0
    });
    const firstMilestone = (ev.milestones && ev.milestones[0]) || { id: 'm1' };
    txnRecord = TCStore.createTransaction({
      type: 'rsvp_deposit', amount: amount, reference: reference,
      eventId: ev.id, rsvpId: rsvpRecord.id, milestoneId: firstMilestone.id,
      payerName: name, payerEmail: email,
      status: 'pending_verification'
    });
  }

  // Update on-screen details
  const amtFmt = '$' + amount.toFixed(2) + ' SGD';
  const amtShort = '$' + amount.toFixed(2);
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('payAmount', amtFmt);
  setText('payAmountInline', amtShort);
  setText('payReference', reference);
  setText('payRefInline', reference);

  const host = document.getElementById('paynowQrHost');
  if (host && window.TCPayNow) {
    TCPayNow.render(host, { amount: amount, reference: reference });
  }

  const step1 = document.getElementById('rsvpStepForm');
  const step2 = document.getElementById('rsvpStepPayNow');
  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'block';

  window._tcRSVPPending = {
    amount: amount, reference: reference,
    eventTitle: opts.eventTitle || (ev && ev.title) || 'Event',
    rsvpId: rsvpRecord && rsvpRecord.id,
    txnId: txnRecord && txnRecord.id
  };
}

function confirmRSVP() {
  const p = window._tcRSVPPending || { amount: 50, reference: '—' };
  closeRSVPModal();
  showToast('Payment logged. Your seat is reserved. Ref ' + p.reference + ' (pending admin verification).', 'success');
  window._tcRSVPPending = null;
  // Refresh event detail page progress if we're on one
  if (typeof renderEventDetailPage === 'function') renderEventDetailPage();
}

// --- Booking Modal (marketplace) ---
function openBookingModal(name, price) {
  const modal = document.getElementById('bookingModal');
  const title = document.getElementById('bookingTitle');
  const priceEl = document.getElementById('bookingPrice');
  if (title) title.textContent = `Book ${name}`;
  if (priceEl) priceEl.textContent = price;
  if (modal) modal.classList.add('open');
  backToBookingForm();
  window._tcBookingMeta = { name: name, price: price };
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.remove('open');
}

function backToBookingForm() {
  const step1 = document.getElementById('bookingStepForm');
  const step2 = document.getElementById('bookingStepPayNow');
  if (step1) step1.style.display = 'block';
  if (step2) step2.style.display = 'none';
}

// Parse price like "$300", "$25/pax", "$300-500" — returns number best-effort.
function _parsePriceSGD(price) {
  if (!price) return 0;
  const m = String(price).match(/\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

function proceedToBookingPayNow(opts) {
  opts = opts || {};
  const meta = window._tcBookingMeta || { name: 'Provider', price: '$0' };
  const amount = opts.amount != null ? opts.amount : _parsePriceSGD(meta.price);
  const reference = (window.TCPayNow && TCPayNow.makeReference('TC-BOOK')) || 'TC-BOOK';

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('bookPayAmount', '$' + amount.toFixed(2) + ' SGD');
  setText('bookPayAmountInline', '$' + amount.toFixed(2));
  setText('bookPayReference', reference);
  setText('bookPayRefInline', reference);
  setText('bookPayProvider', meta.name);

  const host = document.getElementById('bookingPaynowQrHost');
  if (host && window.TCPayNow) {
    TCPayNow.render(host, { amount: amount, reference: reference });
  }

  const step1 = document.getElementById('bookingStepForm');
  const step2 = document.getElementById('bookingStepPayNow');
  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'block';

  window._tcBookingPending = { amount: amount, reference: reference, name: meta.name };
}

function confirmBooking() {
  const p = window._tcBookingPending || { amount: 0, reference: '—', name: 'Provider' };

  // Write booking + pending transaction to store
  if (window.TCStore && p.amount && p.reference) {
    const user = TCStore.currentUser() || { name: 'Guest', email: '' };
    const booking = TCStore.createBooking({
      providerName: p.name, amount: p.amount, reference: p.reference,
      eventId: null, notes: '',
      payerName: user.name, payerEmail: user.email,
      status: 'pending_verification'
    });
    TCStore.createTransaction({
      type: 'booking_deposit', amount: p.amount, reference: p.reference,
      bookingId: booking.id, eventId: null,
      payerName: user.name, payerEmail: user.email,
      status: 'pending_verification'
    });
  }

  closeBookingModal();
  showToast('Booking request logged with ' + p.name + '. Ref ' + p.reference + ' (pending verification).', 'success');
  window._tcBookingPending = null;
}

// --- Provider Signup Modal ---
function openProviderSignupModal() {
  const modal = document.getElementById('providerSignupModal');
  if (modal) modal.classList.add('open');
}

function closeProviderSignupModal() {
  const modal = document.getElementById('providerSignupModal');
  if (modal) modal.classList.remove('open');
}

function submitProviderApp() {
  closeProviderSignupModal();
  showToast('Application submitted! We\'ll review within 48 hours.', 'success');
}

// --- Dashboard Tab Switching ---
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('[id^="tab-"]').forEach(tab => {
    tab.style.display = 'none';
  });

  // Show selected tab
  const target = document.getElementById('tab-' + tabName);
  if (target) target.style.display = 'block';

  // Update sidebar active state
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  event.target.closest('a').classList.add('active');
}

// --- Close modals on overlay click ---
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
    }
  });
});

// --- Close modals on Escape ---
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

// --- FAQ Accordion ---
function toggleFAQ(item) {
  const wasOpen = item.classList.contains('open');
  // Close all FAQs
  document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('open'));
  // Open the clicked one if it wasn't already open
  if (!wasOpen) item.classList.add('open');
}

// ==========================================================
//  STORE-DRIVEN RENDERERS (v1 flow)
// ==========================================================

// Utility: safe DOM creator (no innerHTML)
function _el(tag, attrs, children) {
  const e = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach(k => {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (k === 'html') {} // intentionally not supported
      else if (k.startsWith('on') && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
      else if (k.startsWith('data-')) e.setAttribute(k, attrs[k]);
      else if (k === 'style') e.setAttribute('style', attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
  }
  if (children) {
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null) return;
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    });
  }
  return e;
}

function _clear(el) { while (el && el.firstChild) el.removeChild(el.firstChild); }

function _fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function _fmtMonthDay(iso) {
  if (!iso) return { month: '—', day: '—' };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { month: '—', day: '—' };
  return {
    month: d.toLocaleDateString('en-SG', { month: 'short' }),
    day: d.getDate().toString()
  };
}
function _initials(name) {
  return String(name || '?').split(/\s+/).slice(0, 2).map(s => s[0] || '').join('').toUpperCase() || '?';
}
function _categoryBadge(cat) {
  const map = {
    yacht: { cls: 'badge-ocean', label: 'Yacht' },
    festival: { cls: 'badge-coral', label: 'Festival' },
    hike: { cls: 'badge-green', label: 'Outdoor' },
    party: { cls: 'badge-pink', label: 'Party' },
    travel: { cls: 'badge-ocean', label: 'Travel' },
    food: { cls: 'badge-coral', label: 'Food' },
    learn: { cls: 'badge-ocean', label: 'Learn' },
    sport: { cls: 'badge-green', label: 'Sports' }
  };
  return map[cat] || { cls: 'badge-coral', label: (cat || 'event').charAt(0).toUpperCase() + (cat || 'event').slice(1) };
}
function _bgClass(cat) {
  const map = { yacht: 'bg-yacht', festival: 'bg-festival', hike: 'bg-hike', party: 'bg-party', travel: 'bg-travel', food: 'bg-food', learn: 'bg-learn', sport: 'bg-party' };
  return map[cat] || 'bg-party';
}
function _gradientFor(str) {
  const grads = ['var(--sunset-gradient)', 'var(--ocean-gradient)', 'var(--party-gradient)'];
  let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return grads[h % grads.length];
}

// ── Events grid renderer (events.html) ─────────────────
function renderEventsGrid() {
  const grid = document.getElementById('eventsGrid');
  if (!grid || grid.getAttribute('data-tc-render') !== 'events-grid') return;
  if (!window.TCStore) return;

  const events = TCStore.listEvents().slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  _clear(grid);

  events.forEach(ev => {
    const stats = TCStore.eventStats(ev.id);
    const verifiedRsvps = stats.verifiedRsvps;
    const total = stats.rsvpCount;
    const expectedRevenue = (ev.costPerPerson || 0) * (ev.maxGuests || 1);
    const funded = expectedRevenue ? Math.min(100, Math.round((stats.collected / expectedRevenue) * 100)) : 0;
    const md = _fmtMonthDay(ev.date);
    const cat = _categoryBadge(ev.category);

    const card = _el('a', {
      class: 'event-card fade-in visible',
      href: 'event.html?slug=' + encodeURIComponent(ev.slug),
      'data-category': ev.category || '',
      'data-price': String(ev.costPerPerson || 0)
    }, [
      _el('div', { class: 'event-card-img' }, [
        _el('div', { class: 'img-placeholder ' + _bgClass(ev.category), text: ev.emoji || '🎉' }),
        _el('div', { class: 'event-date-badge' }, [
          _el('div', { class: 'month', text: md.month }),
          _el('div', { class: 'day', text: md.day })
        ]),
        _el('span', { class: 'badge ' + cat.cls + ' event-category', text: cat.label })
      ]),
      _el('div', { class: 'event-card-body' }, [
        _el('h4', { text: ev.title }),
        _el('div', { class: 'event-card-meta' }, [
          _el('span', { text: '📍 ' + (ev.location || 'TBA') }),
          _el('span', { text: '👥 ' + verifiedRsvps + '/' + (ev.maxGuests || '?') + ' joined' })
        ]),
        _el('div', { style: 'margin-bottom: 12px;' }, [
          _el('div', { class: 'progress-label' }, [
            _el('span', { text: 'Funded' }),
            _el('span', { text: funded + '%' })
          ]),
          _el('div', { class: 'progress-bar' }, [
            _el('div', { class: 'progress-fill', style: 'width: ' + funded + '%;' })
          ])
        ]),
        _el('div', { class: 'event-card-footer' }, [
          _el('div', { class: 'price' }, [
            document.createTextNode('$' + (ev.costPerPerson || 0) + ' '),
            _el('span', { text: '/ person' })
          ]),
          _el('div', { class: 'avatar-stack' }, [
            _el('div', { class: 'avatar avatar-sm', style: 'background: ' + _gradientFor(ev.id), text: _initials(ev.organiser && ev.organiser.name) }),
            total > 1 ? _el('div', { class: 'avatar avatar-sm', style: 'background: var(--sunset-gradient);', text: '+' + (total - 1) }) : null
          ])
        ])
      ])
    ]);
    grid.appendChild(card);
  });

  const counter = document.getElementById('resultsCount');
  if (counter) counter.textContent = 'Showing ' + events.length + ' event' + (events.length === 1 ? '' : 's');
}

// ── Event detail renderer (event.html) ─────────────────
function renderEventDetailPage() {
  const hook = document.querySelector('[data-tc-render="event-detail"]');
  if (!hook || !window.TCStore) return;

  const ev = TCStore.findEventParam() || TCStore.eventBySlug('sunset-yacht-party');
  if (!ev) return;

  const setText = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };

  setText('ev-title', ev.title);
  setText('ev-subtitle', ev.location);
  setText('ev-date-full', _fmtDate(ev.date) + (ev.time ? ' · ' + ev.time : ''));
  setText('ev-location', ev.location);
  setText('ev-duration', ev.time ? 'Starting ' + ev.time : 'TBA');
  setText('ev-about', ev.description || '');
  setText('ev-cost', '$' + (ev.costPerPerson || 0));
  setText('ev-deposit', '$' + (ev.depositAmount || 0));
  setText('ev-balance-due', '$' + Math.max(0, (ev.costPerPerson || 0) - (ev.depositAmount || 0)));
  setText('rsvpm-cost', '$' + (ev.costPerPerson || 0));
  setText('rsvpm-deposit', '$' + (ev.depositAmount || 0));
  setText('rsvpm-balance', '$' + Math.max(0, (ev.costPerPerson || 0) - (ev.depositAmount || 0)));
  setText('ev-organiser-name', ev.organiser && ev.organiser.name);
  setText('ev-emoji', ev.emoji || '🎉');

  const md = _fmtMonthDay(ev.date);
  setText('ev-month', md.month);
  setText('ev-day', md.day);

  const catBadge = _categoryBadge(ev.category);
  const catLabelEl = document.getElementById('ev-category-label');
  if (catLabelEl) catLabelEl.textContent = catBadge.label;

  const heroEmojiEl = document.getElementById('ev-hero-emoji');
  if (heroEmojiEl) heroEmojiEl.textContent = ev.emoji || '🎉';

  const heroBg = document.getElementById('ev-hero-bg');
  if (heroBg) heroBg.className = _bgClass(ev.category) + ' ev-hero-bg';

  // Providers
  const provHost = document.getElementById('ev-providers');
  if (provHost) {
    _clear(provHost);
    (ev.providers || []).forEach(p => {
      provHost.appendChild(_el('div', { class: 'provider-row', style: 'display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--sand-dark);' }, [
        _el('span', { text: '⭐ ' + p.name }),
        _el('strong', { text: '$' + p.amount })
      ]));
    });
    if (!ev.providers || ev.providers.length === 0) {
      provHost.appendChild(_el('div', { style: 'color: var(--slate); font-size: 0.86rem;', text: 'No providers booked yet.' }));
    }
  }

  // Attendees list
  const attendees = TCStore.listRSVPs(ev.id);
  const attendeesHost = document.getElementById('ev-attendees');
  if (attendeesHost) {
    _clear(attendeesHost);
    attendees.slice(0, 12).forEach(r => {
      const a = _el('div', { class: 'avatar avatar-sm', style: 'background: ' + _gradientFor(r.id), text: _initials(r.name), title: r.name });
      attendeesHost.appendChild(a);
    });
    if (attendees.length > 12) {
      attendeesHost.appendChild(_el('div', { class: 'avatar avatar-sm', style: 'background: var(--sunset-gradient);', text: '+' + (attendees.length - 12) }));
    }
  }

  // Stats
  const stats = TCStore.eventStats(ev.id);
  const expected = (ev.costPerPerson || 0) * (ev.maxGuests || 1);
  const fundedPct = expected ? Math.min(100, Math.round((stats.collected / expected) * 100)) : 0;
  setText('ev-stat-rsvps', stats.verifiedRsvps + '/' + (ev.maxGuests || '?'));
  setText('ev-stat-collected', '$' + Math.round(stats.collected));
  setText('ev-stat-pending', '$' + Math.round(stats.pendingAmount));
  setText('ev-stat-funded-pct', fundedPct + '%');
  const fundBar = document.getElementById('ev-funded-bar');
  if (fundBar) fundBar.style.width = fundedPct + '%';

  // Update RSVP modal context so proceedToPayNow knows the event id + amount
  window._tcEventContext = { eventId: ev.id, amount: ev.depositAmount, eventTitle: ev.title };
  // Tag the RSVP Continue button with the event context
  const rsvpBtn = document.getElementById('rsvpContinueBtn');
  if (rsvpBtn) rsvpBtn.setAttribute('data-event-id', ev.id);

  document.title = ev.title + ' — The Commons';
}

// ── Create event form submission (create.html) ─────────
function handleCreateEventSubmit() {
  const f = document.getElementById('createEventForm');
  if (!f || !window.TCStore) return;

  const v = (name) => { const el = f.querySelector('[name="' + name + '"]'); return el ? el.value.trim() : ''; };
  const vNum = (name) => Number(v(name)) || 0;

  const title = v('title');
  if (!title) { showToast('Please give your event a title.', 'error'); return; }

  const m1 = vNum('m1_amount'), m2 = vNum('m2_amount'), m3 = vNum('m3_amount');
  const deposit = m1 || vNum('deposit');
  const cost = vNum('cost');
  const milestones = [];
  if (m1) milestones.push({ id: 'm1', label: 'Deposit', amount: m1, dueOffset: 0 });
  if (m2) milestones.push({ id: 'm2', label: '2nd Payment', amount: m2, dueOffset: 14 });
  if (m3) milestones.push({ id: 'm3', label: 'Final Payment', amount: m3, dueOffset: 2 });

  // Organiser: current user, else prompt
  let organiser = TCStore.currentUser();
  if (!organiser) {
    const n = v('organiser_name') || prompt('Your name (as organiser):');
    const e = v('organiser_email') || prompt('Your email:');
    if (!n || !e) { showToast('Please provide your name + email as organiser.', 'error'); return; }
    organiser = TCStore.setCurrentUser({ name: n, email: e });
  }

  const ev = TCStore.createEvent({
    title: title,
    emoji: v('emoji') || '🎉',
    category: v('category') || 'party',
    description: v('description') || '',
    date: v('date') || TCStore.addDaysISO(14),
    time: v('time') || '19:00',
    location: v('location') || 'TBA',
    costPerPerson: cost,
    depositAmount: deposit,
    maxGuests: vNum('max_guests') || 20,
    milestones: milestones,
    providers: [],
    organiser: organiser
  });

  showToast('Event "' + ev.title + '" created. Redirecting…', 'success');
  setTimeout(() => { location.href = 'event.html?slug=' + encodeURIComponent(ev.slug); }, 700);
}

// ── Dashboard renderer (dashboard.html) ────────────────
function renderDashboard() {
  const hook = document.querySelector('[data-tc-render="dashboard"]');
  if (!hook || !window.TCStore) return;

  const user = TCStore.currentUser();
  const setText = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };

  if (user) {
    setText('dash-user-name', user.name);
    setText('dash-user-email', user.email);
    const ini = document.getElementById('dash-user-initials');
    if (ini) ini.textContent = _initials(user.name);
  } else {
    setText('dash-user-name', 'Guest (not signed in)');
    setText('dash-user-email', 'RSVP an event or create one to begin');
  }

  // Events organised by current user
  const mine = user ? TCStore.eventsByOrganiser(user.email) : [];
  setText('dash-mine-count', String(mine.length));

  const mineHost = document.getElementById('dash-mine-list');
  if (mineHost) {
    _clear(mineHost);
    if (!mine.length) {
      mineHost.appendChild(_el('div', { class: 'card', style: 'padding: 32px; text-align: center; color: var(--slate);' }, [
        _el('div', { style: 'font-size: 2rem; margin-bottom: 8px;', text: '✨' }),
        _el('div', { style: 'font-weight: 700; color: var(--navy); margin-bottom: 4px;', text: 'You haven\'t organised any events yet.' }),
        _el('div', { style: 'font-size: 0.88rem; margin-bottom: 14px;', text: 'Create your first one — it takes 3 minutes.' }),
        _el('a', { class: 'btn btn-primary', href: 'create.html', text: 'Create Event →' })
      ]));
    } else {
      mine.forEach(ev => {
        const stats = TCStore.eventStats(ev.id);
        const md = _fmtMonthDay(ev.date);
        const canPayout = stats.escrowAvailable > 0;
        const row = _el('div', { class: 'card', style: 'padding: 20px; margin-bottom: 12px;' }, [
          _el('div', { style: 'display: flex; gap: 16px; align-items: center; flex-wrap: wrap;' }, [
            _el('div', { class: 'event-date-badge', style: 'position: static;' }, [
              _el('div', { class: 'month', text: md.month }),
              _el('div', { class: 'day', text: md.day })
            ]),
            _el('div', { style: 'flex: 1; min-width: 180px;' }, [
              _el('a', { href: 'event.html?slug=' + encodeURIComponent(ev.slug), style: 'text-decoration: none; color: inherit;' }, [
                _el('strong', { style: 'display: block; font-size: 1rem; color: var(--navy); margin-bottom: 4px;', text: ev.title })
              ]),
              _el('div', { style: 'font-size: 0.82rem; color: var(--slate);', text: ev.location + ' · ' + stats.verifiedRsvps + ' / ' + (ev.maxGuests || '?') + ' joined · status: ' + (ev.status || 'live') })
            ]),
            _el('div', { style: 'text-align: right; min-width: 100px;' }, [
              _el('div', { style: 'font-weight: 800; font-size: 1.1rem; color: var(--coral);', text: '$' + Math.round(stats.collected) }),
              _el('div', { style: 'font-size: 0.76rem; color: var(--slate);', text: 'in escrow' })
            ]),
            canPayout ? _el('div', { style: 'text-align: right; min-width: 140px;' }, [
              _el('div', { style: 'font-weight: 800; font-size: 1rem; color: var(--palm);', text: '$' + Math.round(stats.escrowAvailable) + ' released' }),
              _el('button', { class: 'btn btn-primary btn-sm', style: 'margin-top: 6px;', onclick: function () { organiserRequestPayout(ev.id); }, text: 'Request payout' })
            ]) : null
          ])
        ]);
        mineHost.appendChild(row);
      });
    }
  }

  // RSVPs I've made
  const myRSVPs = user ? TCStore.rsvpsByEmail(user.email) : [];
  setText('dash-rsvp-count', String(myRSVPs.length));
  const rsvpHost = document.getElementById('dash-rsvp-list');
  if (rsvpHost) {
    _clear(rsvpHost);
    if (!myRSVPs.length) {
      rsvpHost.appendChild(_el('div', { class: 'card', style: 'padding: 24px; text-align: center; color: var(--slate); font-size: 0.88rem;', text: 'No RSVPs yet — browse events on the Discover page.' }));
    } else {
      myRSVPs.forEach(r => {
        const ev = TCStore.eventById(r.eventId);
        if (!ev) return;
        const md = _fmtMonthDay(ev.date);
        const statusColor = r.status === 'verified' ? 'var(--palm)' : 'var(--mango)';
        const statusText = r.status === 'verified' ? '✓ Confirmed' : '⏳ Pending verification';
        rsvpHost.appendChild(_el('a', { class: 'card', href: 'event.html?slug=' + encodeURIComponent(ev.slug), style: 'display: block; padding: 18px; margin-bottom: 10px; text-decoration: none; color: inherit;' }, [
          _el('div', { style: 'display: flex; gap: 14px; align-items: center;' }, [
            _el('div', { style: 'font-size: 1.8rem;', text: ev.emoji || '🎉' }),
            _el('div', { style: 'flex: 1;' }, [
              _el('strong', { style: 'display: block; color: var(--navy);', text: ev.title }),
              _el('div', { style: 'font-size: 0.8rem; color: var(--slate);', text: md.month + ' ' + md.day + ' · ' + ev.location })
            ]),
            _el('div', { style: 'text-align: right;' }, [
              _el('div', { style: 'font-size: 0.78rem; font-weight: 700; color: ' + statusColor + ';', text: statusText }),
              _el('div', { style: 'font-size: 0.76rem; color: var(--slate); margin-top: 2px;', text: 'Paid $' + r.amountPaid })
            ])
          ])
        ]));
      });
    }
  }

  // Platform snapshot
  const stats = TCStore.platformStats();
  setText('dash-total-escrow', '$' + Math.round(stats.escrowBalance).toLocaleString());
  setText('dash-total-rsvps', String(stats.rsvps));
  setText('dash-pending-verifications', String(stats.pendingVerification));

  // Recent payment activity (last 10 transactions across all events)
  const txnHost = document.getElementById('dash-txn-list');
  if (txnHost) {
    _clear(txnHost);
    const recent = TCStore.listTransactions().slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
    if (!recent.length) {
      txnHost.appendChild(_el('tr', {}, [_el('td', { colspan: '6', style: 'text-align: center; padding: 24px; color: var(--slate);', text: 'No transactions yet.' })]));
    } else {
      recent.forEach(t => {
        const ev = t.eventId ? TCStore.eventById(t.eventId) : null;
        const rowStatus = t.status === 'verified' ? 'badge-green' : (t.status === 'rejected' ? 'badge-coral' : 'badge-ocean');
        const label = t.status === 'verified' ? 'Paid' : (t.status === 'rejected' ? 'Rejected' : 'Pending');
        txnHost.appendChild(_el('tr', {}, [
          _el('td', {}, [
            _el('div', { style: 'display: flex; align-items: center; gap: 10px;' }, [
              _el('div', { class: 'avatar avatar-sm', style: 'background: ' + _gradientFor(t.id), text: _initials(t.payerName) }),
              document.createTextNode(t.payerName || '—')
            ])
          ]),
          _el('td', { text: ev ? ev.title : (t.type || '—') }),
          _el('td', {}, [_el('strong', { text: '$' + Number(t.amount || 0).toFixed(2) })]),
          _el('td', { text: (t.type || '').replace(/_/g, ' ') }),
          _el('td', {}, [_el('span', { class: 'badge ' + rowStatus, text: label })]),
          _el('td', { style: 'font-size: 0.78rem; color: var(--slate);', text: _agoFromNow(t.createdAt) })
        ]));
      });
    }
  }
}

// ── Admin reconciliation renderer (admin.html) ─────────
function renderAdminReconciliation() {
  const hook = document.querySelector('[data-tc-render="admin-reconciliation"]');
  if (!hook || !window.TCStore) return;

  const pending = TCStore.listTransactions().filter(t => t.status === 'pending_verification')
    .sort((a, b) => b.createdAt - a.createdAt);
  const verified = TCStore.listTransactions().filter(t => t.status === 'verified')
    .sort((a, b) => b.createdAt - a.createdAt).slice(0, 20);

  const setText = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  setText('admin-pending-count', String(pending.length));
  setText('admin-pending-amount', '$' + Math.round(pending.reduce((s, t) => s + Number(t.amount || 0), 0)).toLocaleString());
  const stats = TCStore.platformStats();
  setText('admin-escrow-total', '$' + Math.round(stats.escrowBalance).toLocaleString());
  setText('admin-events-count', String(stats.events));
  setText('admin-rsvps-count', String(stats.rsvps));

  const pendingHost = document.getElementById('admin-pending-list');
  if (pendingHost) {
    _clear(pendingHost);
    if (!pending.length) {
      pendingHost.appendChild(_el('tr', {}, [_el('td', { colspan: '6', style: 'text-align: center; padding: 24px; color: var(--slate);', text: 'No pending transactions. Everything is reconciled.' })]));
    } else {
      pending.forEach(t => {
        const ev = t.eventId ? TCStore.eventById(t.eventId) : null;
        const createdAgo = _agoFromNow(t.createdAt);
        const row = _el('tr', {}, [
          _el('td', { style: 'font-family: ui-monospace, monospace; font-size: 0.78rem;', text: t.reference || '—' }),
          _el('td', {}, [
            _el('strong', { text: t.payerName || '—' }),
            _el('div', { style: 'font-size: 0.74rem; color: var(--slate);', text: t.payerEmail || '' })
          ]),
          _el('td', { text: ev ? ev.title : (t.type || '—') }),
          _el('td', { style: 'font-weight: 700; color: var(--coral);', text: '$' + Number(t.amount || 0).toFixed(2) }),
          _el('td', { style: 'font-size: 0.78rem; color: var(--slate);', text: createdAgo }),
          _el('td', {}, [
            _el('button', { class: 'btn btn-primary btn-sm', style: 'margin-right: 6px;', onclick: function () { adminVerifyTxn(t.id); }, text: 'Mark received' }),
            _el('button', { class: 'btn btn-secondary btn-sm', onclick: function () { adminRejectTxn(t.id); }, text: 'Reject' })
          ])
        ]);
        pendingHost.appendChild(row);
      });
    }
  }

  const verifiedHost = document.getElementById('admin-verified-list');
  if (verifiedHost) {
    _clear(verifiedHost);
    if (!verified.length) {
      verifiedHost.appendChild(_el('tr', {}, [_el('td', { colspan: '5', style: 'text-align: center; padding: 24px; color: var(--slate);', text: 'No verified transactions yet.' })]));
    } else {
      verified.forEach(t => {
        const ev = t.eventId ? TCStore.eventById(t.eventId) : null;
        verifiedHost.appendChild(_el('tr', {}, [
          _el('td', { style: 'font-family: ui-monospace, monospace; font-size: 0.78rem;', text: t.reference || '—' }),
          _el('td', { text: t.payerName || '—' }),
          _el('td', { text: ev ? ev.title : (t.type || '—') }),
          _el('td', { style: 'font-weight: 700; color: var(--palm);', text: '$' + Number(t.amount || 0).toFixed(2) }),
          _el('td', { style: 'font-size: 0.78rem; color: var(--slate);', text: _agoFromNow(t.createdAt) })
        ]));
      });
    }
  }
}

function _agoFromNow(ts) {
  const diff = Math.max(0, Date.now() - ts) / 1000;
  if (diff < 60) return Math.round(diff) + 's ago';
  if (diff < 3600) return Math.round(diff / 60) + 'm ago';
  if (diff < 86400) return Math.round(diff / 3600) + 'h ago';
  return Math.round(diff / 86400) + 'd ago';
}

function adminVerifyTxn(id) {
  if (!window.TCStore) return;
  TCStore.updateTransaction(id, { status: 'verified', verifiedAt: Date.now() });
  showToast('Payment verified. Escrow updated.', 'success');
  renderAdminReconciliation();
}
function adminRejectTxn(id) {
  if (!window.TCStore) return;
  if (!confirm('Reject this transaction? The attendee will need to re-submit.')) return;
  TCStore.updateTransaction(id, { status: 'rejected', rejectedAt: Date.now() });
  showToast('Transaction rejected.', 'error');
  renderAdminReconciliation();
}

// ── Organiser actions ──────────────────────────────────
function organiserRequestPayout(eventId) {
  if (!window.TCStore) return;
  const paynow = prompt('Your PayNow mobile / UEN for payout:', '9100 2050');
  if (!paynow) return;
  const p = TCStore.requestPayout(eventId, { paynowTo: paynow });
  if (!p) {
    showToast('No released escrow available for payout yet.', 'error');
    return;
  }
  showToast('Payout of $' + p.amount.toFixed(2) + ' requested. Ref ' + p.reference, 'success');
  renderDashboard();
}

function adminResetDemo() {
  if (!confirm('Wipe all local data (events, RSVPs, transactions, bookings)? Seed demo data will re-populate on next load.')) return;
  TCStore.resetAll();
  showToast('Store reset. Reloading…', 'success');
  setTimeout(() => location.reload(), 500);
}

// ── Admin Lifecycle (release + cancel/refund) ──────────
function renderAdminLifecycle() {
  const hook = document.querySelector('[data-tc-render="admin-lifecycle"]');
  if (!hook || !window.TCStore) return;
  const host = document.getElementById('admin-lifecycle-list');
  if (!host) return;
  _clear(host);
  const events = TCStore.listEvents().slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  events.forEach(ev => {
    const stats = TCStore.eventStats(ev.id);
    const md = _fmtMonthDay(ev.date);
    const statusLabel = ev.status === 'cancelled' ? 'Cancelled'
                      : ev.status === 'released' ? 'Released'
                      : 'Live';
    const statusCls = ev.status === 'cancelled' ? 'badge-coral'
                    : ev.status === 'released' ? 'badge-green'
                    : 'badge-ocean';
    const row = _el('tr', {}, [
      _el('td', {}, [
        _el('strong', { text: ev.title }),
        _el('div', { style: 'font-size: 0.76rem; color: var(--slate);', text: ev.location + ' · ' + (ev.organiser && ev.organiser.name || '') })
      ]),
      _el('td', { style: 'font-family: ui-monospace, monospace; font-size: 0.82rem;', text: md.month + ' ' + md.day }),
      _el('td', {}, [_el('span', { class: 'badge ' + statusCls, text: statusLabel })]),
      _el('td', { text: stats.verifiedRsvps + ' / ' + (ev.maxGuests || '—') }),
      _el('td', { style: 'font-weight: 700; color: var(--coral);', text: '$' + Math.round(stats.collected) }),
      _el('td', { style: 'font-weight: 700; color: var(--palm);', text: '$' + Math.round(stats.released) }),
      _el('td', {}, [
        ev.status === 'live' ? _el('button', {
          class: 'btn btn-primary btn-sm', style: 'margin-right: 6px;',
          onclick: function () { adminReleaseEvent(ev.id); },
          text: 'Release escrow'
        }) : null,
        ev.status !== 'cancelled' ? _el('button', {
          class: 'btn btn-secondary btn-sm',
          onclick: function () { adminCancelEvent(ev.id); },
          text: 'Cancel + refund all'
        }) : null
      ])
    ]);
    host.appendChild(row);
  });
}
function adminReleaseEvent(eventId) {
  const ev = TCStore.eventById(eventId);
  if (!ev) return;
  if (!confirm('Release escrow for "' + ev.title + '"? All verified deposits become available to the organiser for payout.')) return;
  const n = TCStore.releaseEscrow(eventId, 'Manually released by admin');
  showToast(n + ' transaction(s) released.', 'success');
  renderAdminLifecycle();
  renderAdminReconciliation();
}
function adminCancelEvent(eventId) {
  const ev = TCStore.eventById(eventId);
  if (!ev) return;
  const reason = prompt('Reason for cancelling "' + ev.title + '"? (shown in refund ledger)');
  if (reason == null) return;
  const res = TCStore.cancelEventAndRefundAll(eventId, reason);
  showToast('Cancelled: ' + (res ? res.refunded : 0) + ' attendee(s) refunded.', 'success');
  renderAdminLifecycle();
  renderAdminReconciliation();
}

// ── Admin Payouts ──────────────────────────────────────
function renderAdminPayouts() {
  const hook = document.querySelector('[data-tc-render="admin-payouts"]');
  if (!hook || !window.TCStore) return;
  const host = document.getElementById('admin-payouts-list');
  const setText = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  const payouts = TCStore.listPayouts().slice().sort((a, b) => b.createdAt - a.createdAt);

  const requested = payouts.filter(p => p.status === 'requested');
  const sentThisMonth = payouts.filter(p => {
    if (p.status !== 'sent') return false;
    const d = new Date(p.sentAt || 0);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const stats = TCStore.platformStats();
  setText('payouts-pending-count', String(requested.length));
  setText('payouts-pending-amount', '$' + Math.round(requested.reduce((s, p) => s + Number(p.amount || 0), 0)).toLocaleString());
  setText('payouts-sent-count', String(sentThisMonth.length));
  setText('payouts-ready-amount', '$' + Math.round(stats.releasedBalance).toLocaleString());

  if (!host) return;
  _clear(host);
  if (!payouts.length) {
    host.appendChild(_el('tr', {}, [_el('td', { colspan: '7', style: 'text-align: center; padding: 28px; color: var(--slate);', text: 'No payout requests yet.' })]));
    return;
  }
  payouts.forEach(p => {
    const ev = TCStore.eventById(p.eventId);
    const statusCls = p.status === 'sent' ? 'badge-green'
                     : p.status === 'approved' ? 'badge-ocean'
                     : p.status === 'rejected' ? 'badge-coral'
                     : 'badge-pink';
    host.appendChild(_el('tr', {}, [
      _el('td', { style: 'font-family: ui-monospace, monospace; font-size: 0.78rem;', text: p.reference || '—' }),
      _el('td', { text: ev ? ev.title : '—' }),
      _el('td', {}, [
        _el('div', { text: (p.requestedBy && p.requestedBy.name) || '—' }),
        _el('div', { style: 'font-size: 0.74rem; color: var(--slate);', text: (p.requestedBy && p.requestedBy.email) || '' })
      ]),
      _el('td', { style: 'font-weight: 700; color: var(--coral);', text: '$' + Number(p.amount || 0).toFixed(2) }),
      _el('td', {}, [_el('span', { class: 'badge ' + statusCls, text: p.status })]),
      _el('td', { style: 'font-size: 0.78rem; color: var(--slate);', text: _agoFromNow(p.createdAt) }),
      _el('td', {}, [
        p.status === 'requested' ? _el('button', { class: 'btn btn-primary btn-sm', style: 'margin-right: 4px;', onclick: function () { adminApprovePayout(p.id); }, text: 'Approve' }) : null,
        p.status === 'approved' ? _el('button', { class: 'btn btn-primary btn-sm', style: 'margin-right: 4px;', onclick: function () { adminMarkPayoutSent(p.id); }, text: 'Mark sent' }) : null,
        (p.status === 'requested' || p.status === 'approved') ? _el('button', { class: 'btn btn-secondary btn-sm', onclick: function () { adminRejectPayout(p.id); }, text: 'Reject' }) : null
      ])
    ]));
  });
}
function adminApprovePayout(id) {
  TCStore.approvePayout(id, 'admin');
  showToast('Payout approved. Transfer via PayNow then mark sent.', 'success');
  renderAdminPayouts();
}
function adminMarkPayoutSent(id) {
  TCStore.markPayoutSent(id, 'admin');
  showToast('Payout marked as sent.', 'success');
  renderAdminPayouts();
}
function adminRejectPayout(id) {
  const reason = prompt('Reason for rejecting this payout?');
  if (reason == null) return;
  TCStore.rejectPayout(id, reason);
  showToast('Payout rejected.', 'error');
  renderAdminPayouts();
}

// ── Admin Reminders ────────────────────────────────────
function renderAdminReminders() {
  const hook = document.querySelector('[data-tc-render="admin-reminders"]');
  if (!hook || !window.TCStore) return;

  const note = document.getElementById('reminders-transport-note');
  if (note) {
    note.textContent = (window.TCReminders && TCReminders.FORMSPREE_CONFIGURED)
      ? 'Formspree configured — clicking Send delivers a real email.'
      : 'Log-only mode — set TC_FORMSPREE_ID in reminders.js to send real emails.';
  }

  const setText = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  const all = TCStore.listReminders().slice().sort((a, b) => b.createdAt - a.createdAt);
  setText('reminders-queued', String(all.filter(r => r.status === 'queued').length));
  setText('reminders-overdue', String(all.filter(r => r.kind === 'overdue' && (r.status === 'queued' || r.status === 'sent' || r.status === 'sent_local')).length));
  setText('reminders-sent', String(all.filter(r => r.status === 'sent' || r.status === 'sent_local').length));
  setText('reminders-dismissed', String(all.filter(r => r.status === 'dismissed').length));

  const host = document.getElementById('admin-reminders-list');
  if (!host) return;
  _clear(host);
  if (!all.length) {
    host.appendChild(_el('tr', {}, [_el('td', { colspan: '7', style: 'text-align: center; padding: 28px; color: var(--slate);', text: 'No reminders queued. Click "Recompute queue" to scan for due payments.' })]));
    return;
  }
  all.slice(0, 50).forEach(r => {
    const ev = TCStore.eventById(r.eventId);
    const kindCls = r.kind === 'overdue' ? 'badge-coral' : (r.kind === 'due_tomorrow' ? 'badge-pink' : 'badge-ocean');
    const statusCls = r.status === 'sent' || r.status === 'sent_local' ? 'badge-green'
                     : r.status === 'dismissed' ? 'badge-ocean'
                     : r.status === 'failed' ? 'badge-coral'
                     : 'badge-pink';
    host.appendChild(_el('tr', {}, [
      _el('td', {}, [_el('span', { class: 'badge ' + kindCls, text: (r.kind || '').replace(/_/g, ' ') })]),
      _el('td', {}, [
        _el('div', { text: r.toName || '—' }),
        _el('div', { style: 'font-size: 0.74rem; color: var(--slate);', text: r.toEmail || '' })
      ]),
      _el('td', { style: 'font-size: 0.82rem;', text: (ev ? ev.title : '—') }),
      _el('td', { style: 'font-weight: 700; color: var(--coral);', text: '$' + Number(r.amount || 0).toFixed(2) }),
      _el('td', { style: 'font-family: ui-monospace, monospace; font-size: 0.76rem;', text: r.dueDate || '—' }),
      _el('td', {}, [_el('span', { class: 'badge ' + statusCls, text: (r.status || '').replace(/_/g, ' ') })]),
      _el('td', {}, [
        r.status === 'queued' ? _el('button', { class: 'btn btn-primary btn-sm', style: 'margin-right: 4px;', onclick: function () { adminSendReminder(r.id); }, text: 'Send' }) : null,
        r.status === 'queued' ? _el('button', { class: 'btn btn-secondary btn-sm', onclick: function () { adminDismissReminder(r.id); }, text: 'Dismiss' }) : null
      ])
    ]));
  });
}
function adminRecomputeReminders() {
  if (!window.TCReminders) return;
  const r = TCReminders.computeDueReminders();
  showToast('Queued ' + r.queued + ' new reminder(s).', 'success');
  renderAdminReminders();
}
async function adminSendReminder(id) {
  if (!window.TCReminders) return;
  const r = await TCReminders.sendReminder(id);
  const logged = r && (r.status === 'sent_local');
  showToast(logged ? 'Reminder logged locally (Formspree not configured).' : 'Reminder sent.', 'success');
  renderAdminReminders();
}
async function adminSendAllReminders() {
  if (!window.TCReminders) return;
  const res = await TCReminders.sendAllQueued();
  showToast('Sent ' + res.sent + ' / ' + res.total + ' reminder(s).', 'success');
  renderAdminReminders();
}
function adminDismissReminder(id) {
  if (!window.TCReminders) return;
  TCReminders.dismissReminder(id);
  renderAdminReminders();
}

// ── Row-level refund button (wired from reconciliation / lifecycle views) ──
function adminRefundRSVP(rsvpId) {
  const reason = prompt('Reason for refund?');
  if (reason == null) return;
  const t = TCStore.refundRSVP(rsvpId, { reason: reason });
  if (!t) { showToast('Nothing to refund — this RSVP has no verified payments.', 'error'); return; }
  showToast('Refunded $' + t.amount.toFixed(2) + '. Escrow updated.', 'success');
  renderAdminReconciliation();
  renderAdminLifecycle();
}

// ==========================================================
//  v3 ADDITIONS — dark mode, cover images, comments, waitlist,
//  ratings, referrals, admin charts, CSV export, health alerts
// ==========================================================

// ── Dark mode ──────────────────────────────────────────
function initTheme() {
  const saved = (function () { try { return localStorage.getItem('tc:theme'); } catch { return null; } })();
  const system = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = saved || system;
  setTheme(theme, true);
}
function setTheme(theme, silent) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('tc:theme', theme); } catch {}
  document.querySelectorAll('[data-tc-theme-btn]').forEach(b => {
    b.textContent = theme === 'dark' ? '☀️' : '🌙';
    b.title = theme === 'dark' ? 'Switch to light' : 'Switch to dark';
  });
  if (!silent) showToast((theme === 'dark' ? 'Dark' : 'Light') + ' mode on.', 'success');
}
function toggleTheme() {
  const current = document.documentElement.dataset.theme || 'light';
  setTheme(current === 'dark' ? 'light' : 'dark', false);
}
// Inject a theme toggle into any nav that has .nav-actions (but only once)
function injectThemeToggle() {
  document.querySelectorAll('.nav-actions').forEach(host => {
    if (host.querySelector('[data-tc-theme-btn]')) return;
    const btn = _el('button', {
      class: 'theme-toggle', 'data-tc-theme-btn': '1',
      'aria-label': 'Toggle theme',
      onclick: toggleTheme, text: '🌙'
    });
    host.insertBefore(btn, host.firstChild);
  });
  // Update icon to match current theme
  setTheme(document.documentElement.dataset.theme || 'light', true);
}

// ── Cover image helper (upgrades _imgFor that was emoji-only) ──
function _coverUrl(ev, size) {
  if (window.TCImages) return TCImages.coverFor(ev, size);
  return null;
}

// ── Enhanced events-grid renderer: now prepends cover image ─
const _origRenderEventsGrid = typeof renderEventsGrid === 'function' ? renderEventsGrid : null;
function renderEventsGrid() {
  const grid = document.getElementById('eventsGrid');
  if (!grid || grid.getAttribute('data-tc-render') !== 'events-grid') return;
  if (!window.TCStore) return;

  const events = TCStore.listEvents().slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  _clear(grid);

  events.forEach(ev => {
    const stats = TCStore.eventStats(ev.id);
    const verifiedRsvps = stats.verifiedRsvps;
    const total = stats.rsvpCount;
    const expectedRevenue = (ev.costPerPerson || 0) * (ev.maxGuests || 1);
    const funded = expectedRevenue ? Math.min(100, Math.round((stats.collected / expectedRevenue) * 100)) : 0;
    const md = _fmtMonthDay(ev.date);
    const cat = _categoryBadge(ev.category);
    const coverUrl = _coverUrl(ev, 'card');

    const imgNode = coverUrl
      ? _el('img', { class: 'cover-img', src: coverUrl, alt: ev.title, loading: 'lazy' })
      : _el('div', { class: 'img-placeholder ' + _bgClass(ev.category), text: ev.emoji || '🎉' });

    const card = _el('a', {
      class: 'event-card fade-in visible',
      href: 'event.html?slug=' + encodeURIComponent(ev.slug),
      'data-category': ev.category || '',
      'data-price': String(ev.costPerPerson || 0)
    }, [
      _el('div', { class: 'event-card-img' }, [
        imgNode,
        _el('div', { class: 'event-date-badge' }, [
          _el('div', { class: 'month', text: md.month }),
          _el('div', { class: 'day', text: md.day })
        ]),
        _el('span', { class: 'badge ' + cat.cls + ' event-category', text: cat.label })
      ]),
      _el('div', { class: 'event-card-body' }, [
        _el('h4', { text: ev.title }),
        _el('div', { class: 'event-card-meta' }, [
          _el('span', { text: '📍 ' + (ev.location || 'TBA') }),
          _el('span', { text: '👥 ' + verifiedRsvps + '/' + (ev.maxGuests || '?') + ' joined' })
        ]),
        _el('div', { style: 'margin-bottom: 12px;' }, [
          _el('div', { class: 'progress-label' }, [
            _el('span', { text: 'Funded' }),
            _el('span', { text: funded + '%' })
          ]),
          _el('div', { class: 'progress-bar' }, [
            _el('div', { class: 'progress-fill', style: 'width: ' + funded + '%;' })
          ])
        ]),
        _el('div', { class: 'event-card-footer' }, [
          _el('div', { class: 'price' }, [
            document.createTextNode('$' + (ev.costPerPerson || 0) + ' '),
            _el('span', { text: '/ person' })
          ]),
          _el('div', { class: 'avatar-stack' }, [
            _el('div', { class: 'avatar avatar-sm', style: 'background: ' + _gradientFor(ev.id), text: _initials(ev.organiser && ev.organiser.name) }),
            total > 1 ? _el('div', { class: 'avatar avatar-sm', style: 'background: var(--sunset-gradient);', text: '+' + (total - 1) }) : null
          ])
        ])
      ])
    ]);
    grid.appendChild(card);
  });

  const counter = document.getElementById('resultsCount');
  if (counter) counter.textContent = 'Showing ' + events.length + ' event' + (events.length === 1 ? '' : 's');
}

// ── Event detail page extras: cover image, comments, waitlist, rating, referral ──
function enhanceEventDetailPage() {
  if (!window.TCStore) return;
  const ev = TCStore.findEventParam();
  if (!ev) return;

  // 1. Cover image in hero
  const heroBg = document.getElementById('ev-hero-bg');
  if (heroBg) {
    heroBg.classList.add('ev-hero-wrap');
    if (!heroBg.querySelector('.ev-hero-img')) {
      const coverUrl = _coverUrl(ev, 'cover');
      if (coverUrl) {
        const img = _el('img', { class: 'ev-hero-img', src: coverUrl, alt: ev.title });
        heroBg.insertBefore(img, heroBg.firstChild);
      }
    }
  }

  // 2. Analytics: log a view + convert referral if matching
  if (!window._tcViewLogged) {
    TCStore.logEvent('event_view', { eventId: ev.id });
    window._tcViewLogged = true;
    const refCode = new URLSearchParams(location.search).get('ref');
    if (refCode) {
      TCStore.recordReferral({
        refCode: refCode, eventId: ev.id,
        visitorEmail: (TCStore.currentUser() && TCStore.currentUser().email) || null
      });
      showRefBanner(refCode);
    }
  }

  // 3. Waitlist banner if event is full
  const stats = TCStore.eventStats(ev.id);
  const atCapacity = ev.maxGuests && stats.verifiedRsvps >= ev.maxGuests;
  renderWaitlistBanner(ev, atCapacity);

  // 4. Calendar + share actions
  renderCalendarShareRow(ev);

  // 5. Comments/Q&A
  renderComments(ev);

  // 6. Ratings (past events only)
  renderRatings(ev);
}

function showRefBanner(refCode) {
  // Append a banner once, below the atlas top section.
  if (document.querySelector('.ref-banner')) return;
  const container = document.querySelector('.container');
  if (!container) return;
  const b = _el('div', { class: 'ref-banner' }, [
    document.createTextNode('👋 Invited by '),
    _el('strong', { text: refCode }),
    document.createTextNode('. Your RSVP credits them on the referral leaderboard.')
  ]);
  container.insertBefore(b, container.firstChild);
}

function renderWaitlistBanner(ev, atCapacity) {
  let host = document.getElementById('ev-waitlist-banner');
  if (!host) {
    // Insert above the RSVP button if possible
    const priceCard = document.querySelector('.container .card[style*="border: 2px solid var(--coral)"]');
    if (!priceCard) return;
    host = _el('div', { id: 'ev-waitlist-banner' });
    priceCard.parentNode.insertBefore(host, priceCard);
  }
  _clear(host);
  if (!atCapacity) return;

  const waiting = TCStore.listWaitlist(ev.id).filter(w => w.status === 'waiting').length;
  host.appendChild(_el('div', { class: 'waitlist-banner' }, [
    _el('strong', { text: '⏳ This event is full. ' }),
    document.createTextNode((waiting ? waiting + ' on waitlist. ' : '') + 'Join the waitlist and we\'ll notify you if a spot opens up.'),
    _el('div', { style: 'margin-top: 10px;' }, [
      _el('button', {
        class: 'btn btn-primary btn-sm',
        onclick: function () { joinWaitlistForEvent(ev.id); },
        text: 'Join waitlist'
      })
    ])
  ]));
}
function joinWaitlistForEvent(eventId) {
  const user = TCStore.currentUser();
  const name = (user && user.name) || prompt('Your name:');
  const email = (user && user.email) || prompt('Your email:');
  if (!name || !email) return;
  if (!user) TCStore.setCurrentUser({ name: name, email: email });
  const w = TCStore.joinWaitlist(eventId, { name: name, email: email });
  if (!w) { showToast('You\'re already on the waitlist.', 'error'); return; }
  showToast('Added to waitlist — position #' + w.position, 'success');
  const ev = TCStore.eventById(eventId);
  renderWaitlistBanner(ev, true);
}

function renderCalendarShareRow(ev) {
  if (document.getElementById('ev-cal-row')) return;
  const priceCard = document.querySelector('.container .card[style*="border: 2px solid var(--coral)"]');
  if (!priceCard) return;
  const row = _el('div', { id: 'ev-cal-row', style: 'display: flex; gap: 8px; margin-top: 10px;' }, [
    _el('button', {
      class: 'btn btn-secondary btn-sm', style: 'flex: 1;',
      onclick: function () { if (window.TCCalendar) TCCalendar.downloadICS(ev); },
      text: '📅 Add .ics'
    }),
    _el('a', {
      class: 'btn btn-secondary btn-sm', style: 'flex: 1; display: inline-flex; align-items: center; justify-content: center; text-decoration: none;',
      href: window.TCCalendar ? TCCalendar.googleCalUrl(ev) : '#',
      target: '_blank', rel: 'noopener',
      text: 'Google Cal →'
    }),
    _el('button', {
      class: 'btn btn-secondary btn-sm', style: 'flex: 1;',
      onclick: function () { shareEventWhatsApp(ev); },
      text: '💬 WhatsApp'
    })
  ]);
  priceCard.appendChild(row);
}
function shareEventWhatsApp(ev) {
  const user = TCStore.currentUser();
  const refCode = user ? encodeURIComponent(user.email.split('@')[0]) : '';
  const url = location.origin + location.pathname + '?slug=' + encodeURIComponent(ev.slug) + (refCode ? '&ref=' + refCode : '');
  const text = encodeURIComponent('Join me at ' + ev.title + ' — ' + ev.date + '. Escrow-protected RSVP on The Commons: ' + url);
  window.open('https://wa.me/?text=' + text, '_blank');
}

// ── Comments ───────────────────────────────────────────
function renderComments(ev) {
  // Insert a comments card after the About card if not present
  const aboutCard = [].find.call(document.querySelectorAll('.container .card h4'), h => h.textContent.trim() === 'About This Event');
  const parentCard = aboutCard ? aboutCard.closest('.card') : null;
  let host = document.getElementById('ev-comments');
  if (!host) {
    host = _el('div', { class: 'card', id: 'ev-comments', style: 'padding: 28px; margin-top: 24px;' }, [
      _el('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;' }, [
        _el('h4', { text: '💬 Discussion & Q&A' }),
        _el('span', { id: 'ev-comment-count', class: 'badge badge-coral', text: '0' })
      ]),
      _el('div', { id: 'ev-comment-feed', class: 'comment-list' }),
      _el('div', { style: 'margin-top: 16px; display: flex; gap: 10px;' }, [
        _el('textarea', { id: 'ev-comment-input', placeholder: 'Ask a question or share an update…', rows: '2', style: 'flex: 1; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--sand-dark); font-family: inherit; font-size: 0.88rem; resize: vertical;' }),
        _el('button', { class: 'btn btn-primary btn-sm', onclick: function () { submitComment(ev.id); }, text: 'Post' })
      ])
    ]);
    if (parentCard && parentCard.parentNode) parentCard.parentNode.insertBefore(host, parentCard.nextSibling);
    else {
      const container = document.querySelector('.container');
      if (container) container.appendChild(host);
    }
  }

  const feed = document.getElementById('ev-comment-feed');
  const count = document.getElementById('ev-comment-count');
  if (!feed) return;
  _clear(feed);
  const all = TCStore.listComments(ev.id).sort((a, b) => a.createdAt - b.createdAt);
  const roots = all.filter(c => !c.parentId);
  count.textContent = String(all.length);
  if (!all.length) {
    feed.appendChild(_el('div', { style: 'color: var(--slate); font-size: 0.86rem; padding: 16px; text-align: center;', text: 'Be the first to ask a question.' }));
    return;
  }
  roots.forEach(c => {
    feed.appendChild(_renderComment(c));
    const replies = all.filter(r => r.parentId === c.id);
    replies.forEach(r => {
      const n = _renderComment(r);
      n.style.marginLeft = '48px';
      feed.appendChild(n);
    });
  });
}
function _renderComment(c) {
  return _el('div', { class: 'comment' }, [
    _el('div', { class: 'avatar avatar-sm', style: 'background: ' + _gradientFor(c.authorEmail || c.authorName || c.id), text: _initials(c.authorName) }),
    _el('div', { class: 'body' }, [
      _el('div', { class: 'author' }, [
        document.createTextNode(c.authorName || 'Anon'),
        c.isOrganiser ? _el('span', { class: 'tag-organiser', text: 'Organiser' }) : null
      ]),
      _el('div', { class: 'meta', text: _agoFromNow(c.createdAt) + ' · ' + (c.reactions || 0) + ' ❤' }),
      _el('div', { class: 'text', text: c.text || '' }),
      _el('div', { style: 'margin-top: 6px;' }, [
        _el('button', {
          class: 'btn btn-outline btn-sm', style: 'font-size: 0.72rem; padding: 4px 10px;',
          onclick: function () { TCStore.reactToComment(c.id); renderComments(TCStore.findEventParam()); },
          text: '❤ React'
        })
      ])
    ])
  ]);
}
function submitComment(eventId) {
  const input = document.getElementById('ev-comment-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  let user = TCStore.currentUser();
  if (!user) {
    const name = prompt('Your name:');
    const email = prompt('Your email:');
    if (!name || !email) return;
    user = TCStore.setCurrentUser({ name: name, email: email });
  }
  const ev = TCStore.eventById(eventId);
  const isOrg = ev && ev.organiser && ev.organiser.email === user.email;
  TCStore.createComment({
    eventId: eventId, authorName: user.name, authorEmail: user.email,
    isOrganiser: isOrg, text: text
  });
  input.value = '';
  renderComments(ev);
}

// ── Ratings ────────────────────────────────────────────
function renderRatings(ev) {
  // Only show on events that have passed
  if (!ev.date) return;
  const evDate = new Date(ev.date + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isPast = evDate < today;
  if (!isPast) return;

  let host = document.getElementById('ev-ratings');
  if (!host) {
    host = _el('div', { class: 'card', id: 'ev-ratings', style: 'padding: 28px; margin-top: 24px;' });
    const comments = document.getElementById('ev-comments');
    (comments ? comments.parentNode : document.querySelector('.container'))
      .insertBefore(host, comments ? comments.nextSibling : null);
  }

  _clear(host);
  const ratings = TCStore.listRatings(ev.id);
  const avg = ratings.length ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length : 0;

  host.appendChild(_el('h4', { style: 'margin-bottom: 14px;', text: '⭐ Ratings' }));
  if (ratings.length) {
    host.appendChild(_el('div', { style: 'margin-bottom: 12px;' }, [
      _el('span', { style: 'font-size: 1.6rem; font-weight: 800; color: var(--coral);', text: avg.toFixed(1) }),
      _el('span', { style: 'color: var(--slate); margin-left: 8px;', text: ' / 5 · ' + ratings.length + ' review' + (ratings.length === 1 ? '' : 's') })
    ]));
    const feed = _el('div', { style: 'display: grid; gap: 10px; margin-bottom: 20px;' });
    ratings.slice(0, 6).forEach(r => {
      feed.appendChild(_el('div', { style: 'padding: 12px; background: var(--sand); border-radius: 8px;' }, [
        _el('div', { class: 'star-row', text: '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars) }),
        _el('div', { style: 'font-size: 0.82rem; margin-top: 4px; font-style: italic;', text: '"' + (r.text || '') + '"' }),
        _el('div', { style: 'font-size: 0.72rem; color: var(--slate); margin-top: 4px;', text: '— ' + r.name })
      ]));
    });
    host.appendChild(feed);
  }

  // Submit form (one rating per email)
  const form = _el('div', { style: 'border-top: 1px solid var(--sand-dark); padding-top: 16px;' }, [
    _el('div', { style: 'font-weight: 700; margin-bottom: 8px; font-size: 0.92rem;', text: 'Rate this event' }),
    _el('div', { id: 'rating-stars-input', class: 'star-row', style: 'margin-bottom: 10px;' }, [1, 2, 3, 4, 5].map(n =>
      _el('span', { class: 'star', 'data-n': n, onclick: function () { _setRatingInput(n); }, text: '☆' })
    )),
    _el('textarea', { id: 'rating-text-input', placeholder: 'Leave a note (optional)', rows: '2', style: 'width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--sand-dark); font-family: inherit;' }),
    _el('button', { class: 'btn btn-primary btn-sm', style: 'margin-top: 10px;', onclick: function () { submitRating(ev.id); }, text: 'Submit rating' })
  ]);
  host.appendChild(form);
}
function _setRatingInput(n) {
  document.querySelectorAll('#rating-stars-input .star').forEach(s => {
    s.textContent = Number(s.dataset.n) <= n ? '★' : '☆';
  });
  window._tcRatingValue = n;
}
function submitRating(eventId) {
  const stars = window._tcRatingValue;
  if (!stars) { showToast('Pick a star rating first.', 'error'); return; }
  let user = TCStore.currentUser();
  if (!user) {
    const name = prompt('Your name:');
    const email = prompt('Your email:');
    if (!name || !email) return;
    user = TCStore.setCurrentUser({ name: name, email: email });
  }
  const text = document.getElementById('rating-text-input').value.trim();
  TCStore.submitRating({ eventId: eventId, email: user.email, name: user.name, stars: stars, text: text });
  showToast('Thanks for rating!', 'success');
  renderRatings(TCStore.eventById(eventId));
}

// ── Admin Overview (funnel + revenue chart + health + CSV) ──
function renderAdminOverview() {
  if (!window.TCStore) return;
  const ovHost = document.getElementById('admin-overview');
  if (!ovHost) return;

  // Inject a v3 supplemental panel if not already present
  if (!document.getElementById('admin-v3-panel')) {
    const panel = _el('div', { id: 'admin-v3-panel', style: 'margin-top: 32px;' }, [
      _el('h3', { style: 'margin-bottom: 16px;', text: 'Platform Analytics' }),
      _el('div', { class: 'grid-2', style: 'gap: 20px; margin-bottom: 24px;' }, [
        _el('div', { class: 'card', style: 'padding: 24px;' }, [
          _el('h4', { style: 'margin-bottom: 12px;', text: 'Revenue last 14 days' }),
          _el('canvas', { id: 'admin-revenue-chart', style: 'max-height: 220px;' })
        ]),
        _el('div', { class: 'card', style: 'padding: 24px;' }, [
          _el('h4', { style: 'margin-bottom: 12px;', text: 'RSVP Funnel' }),
          _el('div', { id: 'admin-funnel' })
        ])
      ]),
      _el('div', { class: 'card', style: 'padding: 24px; margin-bottom: 24px;' }, [
        _el('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;' }, [
          _el('h4', { text: '⚠ Health alerts' }),
          _el('span', { id: 'admin-alerts-count', class: 'badge badge-coral', text: '0' })
        ]),
        _el('div', { id: 'admin-alerts-list' })
      ]),
      _el('div', { class: 'card', style: 'padding: 24px;' }, [
        _el('h4', { style: 'margin-bottom: 12px;', text: '⬇ Export CSV' }),
        _el('div', { style: 'display: flex; gap: 10px; flex-wrap: wrap;' }, [
          _el('button', { class: 'btn btn-secondary btn-sm', onclick: () => _csvExport('events'), text: 'Events' }),
          _el('button', { class: 'btn btn-secondary btn-sm', onclick: () => _csvExport('rsvps'), text: 'RSVPs' }),
          _el('button', { class: 'btn btn-secondary btn-sm', onclick: () => _csvExport('transactions'), text: 'Transactions' }),
          _el('button', { class: 'btn btn-secondary btn-sm', onclick: () => _csvExport('payouts'), text: 'Payouts' }),
          _el('button', { class: 'btn btn-secondary btn-sm', onclick: () => _csvExport('ratings'), text: 'Ratings' })
        ])
      ])
    ]);
    ovHost.appendChild(panel);
  }

  _renderRevenueChart();
  _renderFunnel();
  _renderHealthAlerts();
}
function _csvExport(table) {
  if (!window.TCExport || !window.TCStore) return;
  const picks = {
    events: TCStore.listEvents(),
    rsvps: TCStore.listRSVPs(),
    transactions: TCStore.listTransactions(),
    payouts: TCStore.listPayouts(),
    ratings: TCStore.listRatings()
  };
  const rows = picks[table];
  if (!rows || !rows.length) { showToast('No ' + table + ' to export.', 'error'); return; }
  const flattened = rows.map(r => {
    const out = {};
    Object.keys(r).forEach(k => {
      if (typeof r[k] === 'object' && r[k] !== null) out[k] = JSON.stringify(r[k]);
      else out[k] = r[k];
    });
    return out;
  });
  TCExport.download('tc-' + table + '-' + new Date().toISOString().slice(0, 10) + '.csv', flattened);
}
function _renderRevenueChart() {
  const canvas = document.getElementById('admin-revenue-chart');
  if (!canvas || typeof Chart === 'undefined') return;
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
    days.push(d.getTime());
  }
  const dayTotals = days.map(ms => {
    const dayStart = ms;
    const dayEnd = ms + 86400000;
    return TCStore.listTransactions()
      .filter(t => (t.status === 'verified' || t.status === 'released') && t.type !== 'refund')
      .filter(t => t.verifiedAt ? (t.verifiedAt >= dayStart && t.verifiedAt < dayEnd) : (t.createdAt >= dayStart && t.createdAt < dayEnd))
      .reduce((s, t) => s + Number(t.amount || 0), 0);
  });
  if (window._tcRevenueChart) window._tcRevenueChart.destroy();
  window._tcRevenueChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: days.map(ms => new Date(ms).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })),
      datasets: [{
        label: 'Verified revenue', data: dayTotals,
        backgroundColor: '#FF6B6B', borderRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + v } } }
    }
  });
}
function _renderFunnel() {
  const host = document.getElementById('admin-funnel');
  if (!host) return;
  _clear(host);
  const f = TCStore.funnelStats();
  const rsvps = TCStore.listRSVPs().length;
  const paid = TCStore.listRSVPs().filter(r => r.status === 'verified').length;
  const steps = [
    { label: 'Event views', n: f.views || rsvps * 4 },
    { label: 'RSVP modal opened', n: f.rsvpOpens || rsvps * 2 },
    { label: 'PayNow QR viewed', n: f.paynowSteps || rsvps },
    { label: 'Payment verified', n: paid }
  ];
  const max = Math.max(1, ...steps.map(s => s.n));
  steps.forEach(s => {
    const pct = Math.round((s.n / max) * 100);
    host.appendChild(_el('div', { style: 'margin-bottom: 12px;' }, [
      _el('div', { style: 'display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;' }, [
        _el('span', { text: s.label }),
        _el('strong', { text: String(s.n) })
      ]),
      _el('div', { class: 'progress-bar' }, [
        _el('div', { class: 'progress-fill', style: 'width: ' + pct + '%;' })
      ])
    ]));
  });
}
function _renderHealthAlerts() {
  const host = document.getElementById('admin-alerts-list');
  const countEl = document.getElementById('admin-alerts-count');
  if (!host) return;
  _clear(host);
  const alerts = [];
  // Low-funded events <2 weeks away
  TCStore.listEvents().forEach(ev => {
    if (ev.status !== 'live' || !ev.date) return;
    const d = new Date(ev.date + 'T00:00:00');
    const days = Math.floor((d - Date.now()) / 86400000);
    if (days < 0 || days > 14) return;
    const stats = TCStore.eventStats(ev.id);
    const expected = (ev.costPerPerson || 0) * (ev.maxGuests || 1);
    const fundedPct = expected ? (stats.collected / expected) * 100 : 0;
    if (fundedPct < 40) {
      alerts.push({
        kind: 'underfunded',
        msg: '"' + ev.title + '" is only ' + fundedPct.toFixed(0) + '% funded with ' + days + ' day(s) to go.',
        href: 'event.html?slug=' + encodeURIComponent(ev.slug)
      });
    }
  });
  // Overdue reminders
  const overdue = TCStore.listReminders().filter(r => r.kind === 'overdue' && r.status === 'queued');
  if (overdue.length > 3) {
    alerts.push({ kind: 'overdue', msg: overdue.length + ' overdue payment reminders queued — send them.', href: '#admin-reminders' });
  }
  // Pending payouts > 3 days old
  TCStore.listPayouts().filter(p => p.status === 'requested').forEach(p => {
    const ageDays = (Date.now() - p.createdAt) / 86400000;
    if (ageDays > 3) {
      alerts.push({ kind: 'payout_stale', msg: 'Payout ' + p.reference + ' has been waiting ' + Math.floor(ageDays) + ' days.', href: '#admin-payouts' });
    }
  });

  if (countEl) countEl.textContent = String(alerts.length);
  if (!alerts.length) {
    host.appendChild(_el('div', { style: 'color: var(--slate); font-size: 0.86rem; padding: 12px; text-align: center;', text: 'All systems healthy. No alerts.' }));
    return;
  }
  alerts.forEach(a => {
    host.appendChild(_el('div', {
      style: 'padding: 10px 14px; margin-bottom: 8px; background: rgba(255,107,107,0.08); border-left: 3px solid var(--coral); border-radius: 6px; font-size: 0.88rem;'
    }, [document.createTextNode('⚠ ' + a.msg)]));
  });
}

// --- Init (v3 wired) ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  injectThemeToggle();
  initFadeIn();
  try {
    renderEventsGrid();
    renderEventDetailPage();
    enhanceEventDetailPage();
    renderDashboard();
    renderAdminReconciliation();
    renderAdminLifecycle();
    renderAdminPayouts();
    renderAdminReminders();
    renderAdminOverview();
  } catch (e) {
    console.error('TC render error:', e);
  }
});
