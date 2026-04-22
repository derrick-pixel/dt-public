/* ═══════════════════════════════════════════════════════════
   Altru — Shared Application Logic
   ═══════════════════════════════════════════════════════════ */

/* ─── Mobile Menu ──────────────────────────────────────────── */
function toggleMenu() {
  const nav    = document.getElementById('mainNav');
  const toggle = document.getElementById('menuToggle');
  if (!nav || !toggle) return;
  nav.classList.toggle('open');
  toggle.classList.toggle('open');
}

// Close menu when a nav link is clicked (mobile)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#mainNav a').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('mainNav')?.classList.remove('open');
      document.getElementById('menuToggle')?.classList.remove('open');
    });
  });

  // Highlight active page
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#mainNav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
});

/* ─── IPC Charities ────────────────────────────────────────── */
const IPC_CHARITIES = [
  {
    id: "spirit-of-enterprise", name: "Spirit of Enterprise", icon: "🚀",
    desc: "Empowering entrepreneurs & local enterprises",
    beneficiary: "Aspiring and early-stage entrepreneurs in Singapore — providing recognition, mentorship, and resources to help local businesses grow and inspire the next generation.",
    ipcNo: "IPC000906",
    uen: "200301515E",
    website: "https://soe.org.sg",
  },
  {
    id: "singapore-cancer-society", name: "Singapore Cancer Society", icon: "🎗️",
    desc: "Cancer prevention, care & patient support",
    beneficiary: "Cancer patients and their families — providing financial assistance, transportation, counselling, home care nursing, and cancer screening programmes island-wide.",
    ipcNo: "IPC000050",
    uen: "S65SS0033F",
    website: "https://www.singaporecancersociety.org.sg",
  },
  {
    id: "community-chest", name: "Community Chest", icon: "🤝",
    desc: "Supporting social service agencies across Singapore",
    beneficiary: "Over 80 social service agencies helping vulnerable families, seniors, persons with disabilities, and children in need across Singapore.",
    ipcNo: "IPC000072",
    uen: "T08GB0034K",
    website: "https://www.comchest.gov.sg",
  },
  {
    id: "singapore-red-cross", name: "Singapore Red Cross", icon: "🏥",
    desc: "Humanitarian aid & emergency relief",
    beneficiary: "Disaster survivors, blood donation recipients, the elderly, and vulnerable communities both locally and internationally.",
    ipcNo: "IPC000080",
    uen: "S86CC0370E",
    website: "https://www.redcross.sg",
  },
  {
    id: "childrens-cancer", name: "Children's Cancer Foundation", icon: "🎗️",
    desc: "Supporting children & families battling cancer",
    beneficiary: "Children aged 0–19 diagnosed with cancer, and their families — providing financial aid, counselling, and home nursing support.",
    ipcNo: "IPC000438",
    uen: "201934434R",
    website: "https://www.ccf.org.sg",
  },
  {
    id: "spca", name: "SPCA Singapore", icon: "🐾",
    desc: "Prevention of cruelty to animals",
    beneficiary: "Stray, abandoned, and mistreated animals in Singapore — providing rescue, shelter, veterinary care, and rehoming services.",
    ipcNo: "IPC000351",
    uen: "S61SS0060B",
    website: "https://www.spca.org.sg",
  },
  {
    id: "minds", name: "MINDS", icon: "💙",
    desc: "Caring for the intellectually disabled",
    beneficiary: "Persons with intellectual disabilities and their caregivers — offering education, training, employment support, and residential care.",
    ipcNo: "IPC000367",
    uen: "202235654G",
    website: "https://www.minds.org.sg",
  },
  {
    id: "nkf", name: "National Kidney Foundation", icon: "🫀",
    desc: "Kidney care & dialysis services",
    beneficiary: "Over 6,000 kidney failure patients receiving subsidised dialysis treatment across NKF centres, regardless of ability to pay.",
    ipcNo: "IPC000108",
    uen: "200104750M",
    website: "https://www.nkfs.org",
  },
  {
    id: "sg-childrens-society", name: "Singapore Children's Society", icon: "👶",
    desc: "Child protection & family services",
    beneficiary: "At-risk children and youth aged 0–18, including abuse victims, children from low-income families, and those with special needs.",
    ipcNo: "IPC000387",
    uen: "S62SS0057G",
    website: "https://www.childrensociety.org.sg",
  },
  {
    id: "aware", name: "AWARE Singapore", icon: "♀️",
    desc: "Gender equality & support services",
    beneficiary: "Women facing workplace discrimination, sexual violence survivors, and individuals seeking gender equality support and legal guidance.",
    ipcNo: "IPC000653",
    uen: "S85SS0089B",
    website: "https://www.aware.org.sg",
  },
  {
    id: "dementia-sg", name: "Dementia Singapore", icon: "🧠",
    desc: "Dementia care & caregiver support",
    beneficiary: "Persons living with dementia and their caregivers — providing day care, home care, counselling, and caregiver training.",
    ipcNo: "IPC000440",
    uen: "202111519K",
    website: "https://dementia.org.sg",
  },
  {
    id: "make-a-wish", name: "Make-A-Wish Foundation Singapore", icon: "⭐",
    desc: "Granting wishes to critically ill children",
    beneficiary: "Children aged 3–18 with life-threatening medical conditions — granting heartfelt wishes to bring joy and hope to their lives.",
    ipcNo: "IPC000867",
    uen: "200201965D",
    website: "https://www.makeawish.org.sg",
  },
  {
    id: "couple-choice",
    name: "Let the Couple Decide",
    icon: "💑",
    desc: "The couple will choose their own IPC charity when they accept the gift",
    beneficiary: "Any IPC-registered charity of the couple's choosing. They will select it when they receive and accept your gift.",
    ipcNo: "Chosen by couple",
    uen: null,
    website: "https://www.charities.gov.sg/pages/ipcs",
    coupleChoice: true,
  },
];

function getCharity(id) {
  return IPC_CHARITIES.find(c => c.id === id) || null;
}

/* ─── Storage Helpers ──────────────────────────────────────── */
const STORE_KEY = 'altru_data';

function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || { gifts: {}, couples: {} }; }
  catch { return { gifts: {}, couples: {} }; }
}

function saveStore(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function saveGift(gift) {
  const store = loadStore();
  store.gifts[gift.id] = gift;
  saveStore(store);
}

function getGift(id) {
  return loadStore().gifts[id] || null;
}

function saveCouple(couple) {
  const store = loadStore();
  store.couples[couple.id] = couple;
  saveStore(store);
}

function getCouple(id) {
  return loadStore().couples[id] || null;
}

/* ─── UUID ─────────────────────────────────────────────────── */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/* ─── Currency ─────────────────────────────────────────────── */
function fmt(amount) {
  return `S$${parseFloat(amount).toFixed(2)}`;
}

function fmtShort(amount) {
  const n = parseFloat(amount);
  return `S$${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

/* ─── URL Helpers ──────────────────────────────────────────── */
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function buildUrl(page, params) {
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]+$/, '/');
  const qs = new URLSearchParams(params).toString();
  return `${base}${page}?${qs}`;
}

/* ─── PayNow QR ────────────────────────────────────────────── */
/*
  Generates an EMVCo-compatible PayNow QR string.
  Payments go to mobile number 98479776.
  Reference encodes gift ID so payment can be matched.
*/
const PAYNOW_MOBILE = "+6598479776";
const PAYNOW_NAME   = "Altru";

function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = ((crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1)) & 0xFFFF;
    }
  }
  return crc;
}

function tlv(tag, value) {
  return `${tag}${String(value.length).padStart(2, '0')}${value}`;
}

/*
  buildPayNowQR — generates an EMVCo PayNow QR string.
  proxyType: '0' = mobile number, '2' = UEN (business/charity)
  proxy: the mobile number (e.g. "+6598479776") or UEN (e.g. "200104750M")
  name: display name shown on payer's banking app (max 25 chars)
*/
function buildPayNowQR({ amount, reference, expiryDate, proxyType = '0', proxy = PAYNOW_MOBILE, name = PAYNOW_NAME }) {
  const merchantInfo =
    tlv('00', 'SG.PAYNOW') +
    tlv('01', proxyType) +
    tlv('02', proxy) +
    tlv('03', '0') +              // amount not editable
    (expiryDate ? tlv('04', expiryDate) : '');

  const addlData = tlv('01', reference.substring(0, 25));

  let payload =
    tlv('00', '01') +
    tlv('01', '12') +
    tlv('26', merchantInfo) +
    tlv('52', '0000') +
    tlv('53', '702') +
    tlv('54', parseFloat(amount).toFixed(2)) +
    tlv('58', 'SG') +
    tlv('59', name.substring(0, 25)) +
    tlv('60', 'Singapore') +
    tlv('62', addlData) +
    '6304';

  const checksum = crc16(payload).toString(16).toUpperCase().padStart(4, '0');
  return payload + checksum;
}

/* Convenience: build a charity PayNow QR using the charity's UEN */
function buildCharityPayNowQR({ charity, amount, reference, expiryDate }) {
  return buildPayNowQR({
    amount,
    reference,
    expiryDate,
    proxyType: '2',
    proxy: charity.uen,
    name: charity.name,
  });
}

/* Convenience: build a mobile PayNow QR (for couple's share) */
function buildMobilePayNowQR({ mobile, name, amount, reference, expiryDate }) {
  return buildPayNowQR({
    amount,
    reference,
    expiryDate,
    proxyType: '0',
    proxy: mobile,
    name,
  });
}

function renderQR(containerId, content, size = 200) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  new QRCode(el, {
    text: content,
    width: size,
    height: size,
    colorDark: '#2D1010',
    colorLight: '#FFFFFF',
    correctLevel: QRCode.CorrectLevel.M,
  });
}

/* ─── Gift Link ────────────────────────────────────────────── */
function createGiftLink(gift) {
  return buildUrl('couple.html', { gift: gift.id });
}

function createAuraLink(coupleId) {
  return buildUrl('giving-aura.html', { couple: coupleId });
}

/* ─── NRIC Validation (Singapore) ─────────────────────────── */
function validateNRIC(nric) {
  const clean = nric.toUpperCase().trim();
  if (!/^[STFGM]\d{7}[A-Z]$/.test(clean)) return false;
  const weights = [2, 7, 6, 5, 4, 3, 2];
  const prefix = clean[0];
  const digits = clean.slice(1, 8).split('').map(Number);
  let sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
  if (['T', 'G'].includes(prefix)) sum += 4;
  if (['M'].includes(prefix)) sum += 3;
  const remainder = sum % 11;
  const ST_table = ['J','Z','I','H','G','F','E','D','C','B','A'];
  const FG_table = ['X','W','U','T','R','Q','P','N','M','L','K'];
  const M_table  = ['X','W','U','T','R','Q','P','N','J','L','K'];
  let expected;
  if (['S','T'].includes(prefix)) expected = ST_table[remainder];
  else if (['F','G'].includes(prefix)) expected = FG_table[remainder];
  else expected = M_table[remainder];
  return clean[8] === expected;
}

function maskNRIC(nric) {
  if (nric.length < 4) return nric;
  return nric[0] + '*'.repeat(nric.length - 4) + nric.slice(-4);
}

/* ─── Toast ────────────────────────────────────────────────── */
function showToast(msg, duration = 2500) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

/* ─── Copy to Clipboard ────────────────────────────────────── */
function copyText(text, successMsg = '✓ Copied!') {
  navigator.clipboard.writeText(text).then(() => showToast(successMsg));
}

/* ─── Share (Web Share API / fallback) ─────────────────────── */
function shareOrCopy(url, title = 'Altru Gift', text = 'A meaningful gift for you') {
  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => copyText(url));
  } else {
    copyText(url, '✓ Link copied! Share it via WhatsApp or SMS.');
  }
}

/* ─── Render Charity Options ───────────────────────────────── */
function renderCharityOptions(containerId, selectedId, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = IPC_CHARITIES.map(c => {
    if (c.coupleChoice) {
      return `
    <div class="charity-option-wrapper charity-option-wrapper--couple-choice">
      <div class="charity-option-row">
        <button type="button" class="charity-option charity-option--couple-choice ${c.id === selectedId ? 'selected' : ''}"
                data-charity="${c.id}" onclick="selectCharity('${c.id}', '${containerId}')">
          <div class="charity-icon">${c.icon}</div>
          <div style="flex:1;">
            <div class="charity-name">${c.name}</div>
            <div class="charity-desc">${c.desc}</div>
          </div>
          <div class="charity-check">${c.id === selectedId ? '✓' : ''}</div>
        </button>
        <button type="button" class="charity-info-btn" onclick="toggleCharityPopup('popup-${c.id}')" title="More info">ℹ</button>
      </div>
      <div class="charity-popup hidden" id="popup-${c.id}">
        <div class="charity-popup-body">
          <div class="charity-popup-row">
            <span class="charity-popup-label">How it works</span>
            <span>${c.beneficiary}</span>
          </div>
          <div class="charity-popup-row">
            <span class="charity-popup-label">IPC Number</span>
            <span class="charity-popup-ipc">${c.ipcNo}</span>
          </div>
          <div class="charity-popup-row">
            <span class="charity-popup-label">Browse charities</span>
            <a href="${c.website}" target="_blank" rel="noopener" class="charity-popup-link">${c.website.replace('https://', '')}</a>
          </div>
        </div>
      </div>
    </div>`;
    }
    return `
    <div class="charity-option-wrapper">
      <div class="charity-option-row">
        <button type="button" class="charity-option ${c.id === selectedId ? 'selected' : ''}"
                data-charity="${c.id}" onclick="selectCharity('${c.id}', '${containerId}')">
          <div class="charity-icon">${c.icon}</div>
          <div style="flex:1;">
            <div class="charity-name">${c.name}</div>
            <div class="charity-desc">${c.desc}</div>
          </div>
          <div class="charity-check">${c.id === selectedId ? '✓' : ''}</div>
        </button>
        <button type="button" class="charity-info-btn" onclick="toggleCharityPopup('popup-${c.id}')" title="More info">ℹ</button>
      </div>
      <div class="charity-popup hidden" id="popup-${c.id}">
        <div class="charity-popup-body">
          <div class="charity-popup-row">
            <span class="charity-popup-label">Beneficiary</span>
            <span>${c.beneficiary}</span>
          </div>
          <div class="charity-popup-row">
            <span class="charity-popup-label">IPC Number</span>
            <span class="charity-popup-ipc">${c.ipcNo}</span>
          </div>
          <div class="charity-popup-row">
            <span class="charity-popup-label">Website</span>
            <a href="${c.website}" target="_blank" rel="noopener" class="charity-popup-link">${c.website.replace('https://', '')}</a>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleCharityPopup(popupId) {
  const popup = document.getElementById(popupId);
  if (!popup) return;
  // Close all other popups first
  document.querySelectorAll('.charity-popup').forEach(p => {
    if (p.id !== popupId) p.classList.add('hidden');
  });
  popup.classList.toggle('hidden');
}

/* Tracks the selected charity ID per container */
const _charitySelections = {};

function selectCharity(id, containerId) {
  _charitySelections[containerId] = id;
  document.querySelectorAll(`#${containerId} .charity-option`).forEach(el => {
    const selected = el.dataset.charity === id;
    el.classList.toggle('selected', selected);
    el.querySelector('.charity-check').textContent = selected ? '✓' : '';
  });
}

function getSelectedCharity(containerId) {
  return _charitySelections[containerId] || null;
}

/* ─── Date Helpers ─────────────────────────────────────────── */
function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0].replace(/-/g, '');
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ─── Authorization helpers ───────────────────────────────── */
const ESCROW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

/* Returns a couple object with authorization-related fields backfilled
   to sensible defaults, so older records still render correctly. */
function coupleWithDefaults(couple) {
  if (!couple) return null;
  return {
    ...couple,
    authorizationStatus: couple.authorizationStatus || 'pending',
    authorizedAt:        couple.authorizedAt        || null,
    authorizedCharityId: couple.authorizedCharityId || null,
    tcAccepted:          couple.tcAccepted          || false,
    escrowDeadline:      couple.escrowDeadline      || computeEscrowDeadline(couple.id) || null,
  };
}

/* Compute escrow deadline from a couple's claimed gifts:
   max(claimedAt) + 14 days. Returns null if no claimed gifts.
   Deadline is monotonic — callers should persist max(current, new). */
function computeEscrowDeadline(coupleId) {
  const couple = getCouple(coupleId);
  if (!couple) return null;
  const claimedAts = (couple.giftIds || [])
    .map(id => getGift(id))
    .filter(g => g && g.status === 'claimed' && g.claimedAt)
    .map(g => g.claimedAt);
  if (!claimedAts.length) return null;
  return Math.max(...claimedAts) + ESCROW_WINDOW_MS;
}

/* Returns the couple's gifts currently in escrow (status === 'claimed').
   Excludes pending, authorized, refunded, auto_refunded. */
function getEscrowedGifts(coupleId) {
  const couple = getCouple(coupleId);
  if (!couple) return [];
  return (couple.giftIds || [])
    .map(id => getGift(id))
    .filter(g => g && g.status === 'claimed');
}

/* Returns the couple's gifts already authorized (status === 'authorized'). */
function getAuthorizedGifts(coupleId) {
  const couple = getCouple(coupleId);
  if (!couple) return [];
  return (couple.giftIds || [])
    .map(id => getGift(id))
    .filter(g => g && g.status === 'authorized');
}

/* Long-form date + time, e.g. "20 Apr 2026, 3:42 PM" */
function formatDateLong(ts) {
  return new Date(ts).toLocaleString('en-SG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

/* ─── Number Formatter ─────────────────────────────────────── */
function animateNumber(el, target, prefix = 'S$', duration = 1000) {
  const start = 0;
  const startTime = performance.now();
  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + (start + (target - start) * ease).toFixed(2);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
