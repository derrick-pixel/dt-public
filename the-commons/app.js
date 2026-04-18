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
  closeAuthModal();
  showToast('Welcome to The Commons!', 'success');
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
}

function closeRSVPModal() {
  const modal = document.getElementById('rsvpModal');
  if (modal) modal.classList.remove('open');
}

function confirmRSVP() {
  closeRSVPModal();
  showToast('You\'re in! Deposit of $50 secured in escrow.', 'success');
}

// --- Booking Modal ---
function openBookingModal(name, price) {
  const modal = document.getElementById('bookingModal');
  const title = document.getElementById('bookingTitle');
  const priceEl = document.getElementById('bookingPrice');
  if (title) title.textContent = `Book ${name}`;
  if (priceEl) priceEl.textContent = price;
  if (modal) modal.classList.add('open');
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.remove('open');
}

function confirmBooking() {
  closeBookingModal();
  showToast('Booking request sent! Provider will confirm within 24h.', 'success');
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

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  initFadeIn();
});
