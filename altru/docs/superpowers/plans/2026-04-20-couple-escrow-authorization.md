# Couple Escrow Authorization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an explicit authorization panel to the couple dashboard so the couple can either release the escrowed charity portion to their chosen IPC charity or refund the full escrow to attendees, with a 14-day inactivity auto-refund.

**Architecture:** Pure client-side, localStorage-backed. New helpers in `js/app.js` handle defaults and deadline math. `couple.html` gets a new dashboard card, a T&C modal, and a handful of new inline `<script>` functions. Auto-refund runs opportunistically on `DOMContentLoaded` before the dashboard first renders. State is real (gift + couple records mutate); the downstream Tax Relief Summary and gift list reflect that state.

**Tech Stack:** Static HTML / vanilla JS / CSS, no build step, no test runner. Verification is manual in a browser. Spec: `docs/superpowers/specs/2026-04-20-couple-escrow-authorization-design.md`.

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `js/app.js` | Data-layer helpers | Add: `coupleWithDefaults`, `computeEscrowDeadline`, `getEscrowedGifts`, `getAuthorizedGifts`, `formatDateLong`, plus constant `ESCROW_WINDOW_MS`. No changes to existing function signatures. |
| `couple.html` (markup) | Auth panel + T&C modal | Add one new card inside `viewDashboard` right column (above Tax Relief Summary); add T&C modal at end of `<body>`. |
| `couple.html` (`<script>`) | Panel behaviour | Add: `renderAuthorizationPanel`, `renderResolvedReceipt`, `updateConfirmButtonState`, `openTncModal`, `closeTncModal`, `submitAuthorization`, `runAutoRefundCheckIfDue`. Modify: `acceptGift` (stamp `claimedAt`, persist `escrowDeadline`), `populateDashboard` (Tax Relief Summary + gift badges read from authorization state), `DOMContentLoaded` init (call `runAutoRefundCheckIfDue` before first `showDashboard`). |
| `css/styles.css` | Visual styles | Add: `.auth-panel`, `.auth-panel--resolved`, `.auth-panel__*`, `.countdown-chip`, `.countdown-chip--urgent`, `.tnc-modal`, `.tnc-modal__*`, `.gift-item--refunded`, `.badge-green`, `.badge-gray-strike`. |

## Verification model

This project has no automated test harness. Each task ends with a **manual verification step** the engineer runs in a browser. Serve the repo locally:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/couple.html?couple=test-couple-01` after seeding. A seed snippet in **Task 1 Step 4** sets up a reproducible test couple with three claimed gifts so every subsequent task has something visible to check.

**Note on XSS safety:** All new `innerHTML` usages interpolate through the existing `_esc()` helper in `couple.html`, matching the codebase's existing `populateDashboard` pattern. Do not introduce un-escaped user data into any template.

---

## Task 1: Add data-layer helpers to js/app.js

**Files:**
- Modify: `js/app.js` (append new helpers immediately after the `formatDate` function at line 474)

- [ ] **Step 1: Add `ESCROW_WINDOW_MS` constant and `coupleWithDefaults` helper**

Open `js/app.js`. Immediately after the `formatDate` function body (closing `}` near line 474), insert:

```javascript
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
    escrowDeadline:      couple.escrowDeadline      || null,
  };
}
```

- [ ] **Step 2: Add deadline + gift-filter helpers**

Immediately after `coupleWithDefaults`, append:

```javascript
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
```

- [ ] **Step 3: Verify helpers load without syntax errors**

In a terminal at the repo root: `python3 -m http.server 8000`.

Open `http://localhost:8000/couple.html` in a browser. DevTools → Console:

```javascript
console.log(typeof coupleWithDefaults, typeof computeEscrowDeadline,
            typeof getEscrowedGifts, typeof getAuthorizedGifts,
            typeof formatDateLong, typeof ESCROW_WINDOW_MS);
```

Expected output: `function function function function function number`

If any say `undefined`, there's a syntax error. Check the Console panel for the line number and fix.

- [ ] **Step 4: Seed a reproducible test couple**

In the same Console, paste:

```javascript
(() => {
  const now = Date.now();
  const coupleId = 'test-couple-01';
  const charity  = getCharity('singapore-cancer-society');
  const gifts = [
    { donor: 'Auntie May',     total: 388, personal: 100, charity: 288 },
    { donor: 'Cousin Jack',    total: 500, personal: 200, charity: 300 },
    { donor: 'Colleague Lee',  total: 288, personal: 88,  charity: 200 },
  ];
  const giftRecords = gifts.map((g, i) => ({
    id: `test-gift-0${i+1}`,
    donorName: g.donor,
    coupleName: 'Wei Jie & Lin Hui',
    charityId: charity.id,
    charityName: charity.name,
    charityIcon: charity.icon,
    totalAmount: g.total,
    personalAmount: g.personal,
    charityAmount: g.charity,
    status: 'claimed',
    claimedAt: now - (i * 24 * 60 * 60 * 1000),
    createdAt: now - ((i+1) * 24 * 60 * 60 * 1000),
  }));
  giftRecords.forEach(saveGift);
  const couple = {
    id: coupleId,
    coupleName: 'Wei Jie & Lin Hui',
    weddingDate: new Date(now + 30*24*60*60*1000).toISOString().split('T')[0],
    email: 'test@example.com',
    featuredCharityId: charity.id,
    featuredCharityName: charity.name,
    featuredCharityIcon: charity.icon,
    giftIds: giftRecords.map(g => g.id),
    createdAt: now - 10*24*60*60*1000,
    nricMasked: 'S****567A',
    escrowDeadline: now + ESCROW_WINDOW_MS,
  };
  saveCouple(couple);
  localStorage.setItem('altru_coupleId', coupleId);
  console.log('Seeded. Navigate to couple.html?couple=' + coupleId);
})();
```

Expected: `Seeded. Navigate to couple.html?couple=test-couple-01`.

Navigate to `http://localhost:8000/couple.html?couple=test-couple-01`. You should see the existing dashboard with 3 gifts, S$788 to charity, S$388 personal. No auth panel yet.

- [ ] **Step 5: Commit**

```bash
git add js/app.js
git commit -m "Add data-layer helpers for escrow authorization"
```

---

## Task 2: Stamp claimedAt on gift claim + persist escrow deadline

**Files:**
- Modify: `couple.html` `acceptGift` function (around line 497).

Context: `acceptGift` runs when a donor's gift link is opened and the couple claims it. Record `claimedAt` on the gift and update the couple's `escrowDeadline` to `max(existing, now + 14 days)`.

- [ ] **Step 1: Add `claimedAt` to the gift-mutation block**

In `couple.html`, find the block starting `// Mark gift as claimed` (around line 514). Replace:

```javascript
      // Mark gift as claimed
      activeGift.status = 'claimed';
      activeGift.coupleNRIC  = maskNRIC(nric);
      activeGift.coupleEmail = email;
      saveGift(activeGift);
```

with:

```javascript
      // Mark gift as claimed
      activeGift.status      = 'claimed';
      activeGift.claimedAt   = Date.now();
      activeGift.coupleNRIC  = maskNRIC(nric);
      activeGift.coupleEmail = email;
      saveGift(activeGift);
```

- [ ] **Step 2: Initialize escrow fields when creating a new couple**

Still in `acceptGift`, find `if (!couple) {` (around line 524). Replace the entire object literal:

```javascript
      if (!couple) {
        couple = {
          id:           uuid(),
          coupleName:   activeGift.coupleName,
          nricMasked:   maskNRIC(nric),
          email:        email,
          featuredCharityId: activeGift.charityId,
          featuredCharityName: activeGift.charityName,
          featuredCharityIcon: activeGift.charityIcon,
          giftIds:      [activeGift.id],
          createdAt:    Date.now(),
        };
      } else {
```

with:

```javascript
      if (!couple) {
        couple = {
          id:           uuid(),
          coupleName:   activeGift.coupleName,
          nricMasked:   maskNRIC(nric),
          email:        email,
          featuredCharityId: activeGift.charityId,
          featuredCharityName: activeGift.charityName,
          featuredCharityIcon: activeGift.charityIcon,
          giftIds:      [activeGift.id],
          createdAt:    Date.now(),
          authorizationStatus: 'pending',
          escrowDeadline: 0,
        };
      } else {
```

- [ ] **Step 3: Recompute & persist escrow deadline before save**

Still in `acceptGift`, find `saveCouple(couple);` (around line 542). **Immediately before** that line, insert:

```javascript
      // Recompute escrow deadline (monotonic — only moves forward).
      const newDeadline = Date.now() + ESCROW_WINDOW_MS;
      couple.escrowDeadline = Math.max(couple.escrowDeadline || 0, newDeadline);
```

- [ ] **Step 4: Manual verification**

In DevTools → Application → Local Storage, delete `altru_data` and `altru_coupleId` to reset. Reload the page. In Console:

```javascript
(() => {
  const charity = getCharity('singapore-cancer-society');
  const gift = {
    id: 'gift-flow-test',
    donorName: 'Flow Tester',
    coupleName: 'Wei Jie & Lin Hui',
    charityId: charity.id,
    charityName: charity.name,
    charityIcon: charity.icon,
    totalAmount: 388, personalAmount: 100, charityAmount: 288,
    status: 'pending',
    createdAt: Date.now(),
  };
  saveGift(gift);
  console.log('Open: couple.html?gift=' + gift.id);
})();
```

Navigate to the printed URL. Enter NRIC `S1234567D` (or any that returns true from `validateNRIC()` in the Console) and email `test@example.com`. Click "Accept Gift". Then:

```javascript
const g = getGift('gift-flow-test');
const c = getCouple(localStorage.getItem('altru_coupleId'));
console.log('claimedAt:', new Date(g.claimedAt).toISOString(),
            'deadline:', new Date(c.escrowDeadline).toISOString());
```

Expected:
- `claimedAt` is within the last minute.
- `deadline` is ~14 days in the future.

- [ ] **Step 5: Commit**

```bash
git add couple.html
git commit -m "Stamp claimedAt + persist 14-day escrow deadline on claim"
```

---

## Task 3: Add CSS for auth panel, countdown chip, T&C modal, status badges

**Files:**
- Modify: `css/styles.css` (append at end).

- [ ] **Step 1: Append all new styles**

Append to `css/styles.css`:

```css
/* ─── Authorization Panel ────────────────────────────────── */
.auth-panel {
  border: 2px solid var(--red);
  background: linear-gradient(135deg, var(--warm-white), var(--red-light));
}
.auth-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.auth-panel__title {
  margin: 0;
  color: var(--red);
  font-size: 1.05rem;
}
.auth-panel__total {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--red);
  margin: 0.5rem 0;
}
.auth-panel__beneficiary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--white);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}
.auth-panel__personal-note {
  background: rgba(201, 151, 58, 0.08);
  border-left: 3px solid var(--gold);
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}
.auth-panel__radio {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  padding: 0.65rem 0.75rem;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  margin-bottom: 0.5rem;
  font-size: 0.88rem;
  line-height: 1.4;
}
.auth-panel__radio input { margin-top: 0.15rem; flex-shrink: 0; }
.auth-panel__radio--selected {
  border-color: var(--red);
  background: var(--red-light);
}
.auth-panel__tnc {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 0.75rem 0;
  font-size: 0.85rem;
}
.auth-panel__warning {
  color: var(--red-dark);
  font-size: 0.8rem;
  margin-top: 0.5rem;
  text-align: center;
}
.auth-panel__receipt {
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 0.75rem;
  background: var(--white);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}
.auth-panel--resolved {
  border-color: var(--border);
  background: var(--white);
}

/* ─── Countdown chip ─────────────────────────────────────── */
.countdown-chip {
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: var(--gold-light);
  color: var(--gold);
  font-weight: 600;
  white-space: nowrap;
}
.countdown-chip--urgent {
  background: var(--red-light);
  color: var(--red-dark);
}

/* ─── T&C Modal ──────────────────────────────────────────── */
.tnc-modal {
  position: fixed;
  inset: 0;
  background: rgba(45, 16, 16, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}
.tnc-modal[hidden] { display: none; }
.tnc-modal__body {
  background: var(--white);
  border-radius: var(--radius);
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 1.5rem;
  position: relative;
  box-shadow: 0 12px 40px rgba(0,0,0,0.25);
}
.tnc-modal__body h3 { color: var(--red); margin-top: 0; }
.tnc-modal__body ol { padding-left: 1.25rem; }
.tnc-modal__body li { margin-bottom: 0.6rem; font-size: 0.9rem; line-height: 1.5; }
.tnc-modal__close {
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
  line-height: 1;
}
.tnc-modal__close:hover { color: var(--red); }

/* ─── Gift status badges (new) ───────────────────────────── */
.badge-green {
  background: rgba(34, 139, 70, 0.12);
  color: #1e7a3e;
  border: 1px solid rgba(34, 139, 70, 0.35);
}
.badge-gray-strike {
  background: var(--bg);
  color: var(--text-muted);
  text-decoration: line-through;
  border: 1px solid var(--border);
}
.gift-item--refunded .gift-total,
.gift-item--refunded .gift-charity-amt {
  text-decoration: line-through;
  color: var(--text-muted);
}
```

- [ ] **Step 2: Manual verification — styles load**

Hard-refresh. Navigate to the test couple dashboard. No visual change yet (markup using these classes doesn't exist). In Console:

```javascript
console.log('Stylesheet loaded?', document.styleSheets.length > 0);
```

Expected: `Stylesheet loaded? true`.

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "Add styles for escrow authorization panel and T&C modal"
```

---

## Task 4: Add auth panel + T&C modal markup to couple.html

**Files:**
- Modify: `couple.html` — card in `viewDashboard` right column; modal before `</body>`.

- [ ] **Step 1: Insert the auth panel card**

In `couple.html`, find `<!-- Tax Relief Summary -->` (around line 305). **Immediately before** that comment, insert:

```html
            <!-- Escrow Authorization Panel -->
            <div class="card auth-panel mb-3" id="authPanel" hidden>
              <div class="card-body" id="authPanelBody">
                <!-- Populated by renderAuthorizationPanel() -->
              </div>
            </div>
```

- [ ] **Step 2: Insert the T&C modal**

Find the closing `</footer>` (around line 349). **Immediately after** `</footer>`, insert:

```html
  <!-- ─── T&C Modal ────────────────────────────────────────── -->
  <div class="tnc-modal" id="tncModal" hidden role="dialog" aria-modal="true" aria-labelledby="tncModalTitle">
    <div class="tnc-modal__body">
      <button type="button" class="tnc-modal__close" onclick="closeTncModal()" aria-label="Close">&times;</button>
      <h3 id="tncModalTitle">Altru Escrow Authorization — Terms &amp; Conditions</h3>
      <p class="caption text-muted">Last updated: 20 April 2026</p>
      <p style="font-size:0.88rem;">By checking the agreement box and confirming your decision, you ("the Couple") acknowledge and agree to the following terms with <strong>Altru Pte Ltd</strong> ("Altru"):</p>
      <ol>
        <li><strong>Escrow service.</strong> Altru holds the charity portion of each wedding gift (the "Escrow Amount") on your behalf in a segregated account until you record an authorization decision or the 14-day deadline passes.</li>
        <li><strong>Your decision.</strong> You may either (a) authorize donation — instruct Altru to release the full Escrow Amount as a single donation to the IPC-certified charity named on your dashboard; or (b) refund to attendees — instruct Altru to return the Escrow Amount to each wedding attendee in proportion to their contribution.</li>
        <li><strong>Irreversibility.</strong> Your decision is final upon confirmation. Altru will initiate the payment within 3 business days and cannot reverse the transaction thereafter.</li>
        <li><strong>14-day deadline.</strong> If no decision is recorded within 14 days of the most recent gift being claimed, the entire Escrow Amount is automatically refunded to the respective attendees and no further action will be possible.</li>
        <li><strong>Tax receipts.</strong> If you authorize the donation, a 250% IRAS tax-deduction receipt will be issued in the name associated with the NRIC/FIN you provided, for the full Escrow Amount. Refunded amounts are not tax-deductible.</li>
        <li><strong>Personal portion.</strong> The personal portion of each gift (the non-charity share) is not affected by this decision and remains redeemable by you at any time through your dashboard.</li>
        <li><strong>Charity change.</strong> You may change the beneficiary charity at any time <em>before</em> confirming this decision. Once confirmed, the charity recorded at the time of confirmation is final.</li>
        <li><strong>Fees.</strong> Altru does not charge any fees on the Escrow Amount or on the donation.</li>
        <li><strong>Data privacy.</strong> Your NRIC/FIN is used solely for IRAS tax-relief filing and is not shared with third parties except as required by law or by IRAS.</li>
        <li><strong>No guarantee of charity use.</strong> Altru verifies each beneficiary's IPC status at the time of donation but is not liable for how the charity subsequently uses the funds.</li>
        <li><strong>Governing law.</strong> These terms are governed by the laws of the Republic of Singapore.</li>
      </ol>
      <div style="text-align:right;margin-top:1rem;">
        <button type="button" class="btn btn-primary btn-sm" onclick="closeTncModal()">Close</button>
      </div>
    </div>
  </div>
```

- [ ] **Step 3: Manual verification**

Hard-refresh. Navigate to the test couple dashboard (re-seed via Task 1 Step 4 if needed). Dashboard should look **unchanged** (both new elements have `hidden` attribute). In Console:

```javascript
console.log(!!document.getElementById('authPanel'), !!document.getElementById('tncModal'));
```

Expected: `true true`.

- [ ] **Step 4: Commit**

```bash
git add couple.html
git commit -m "Add escrow authorization panel and T&C modal markup"
```

---

## Task 5: Implement renderAuthorizationPanel (all four visual states)

**Files:**
- Modify: `couple.html` (`<script>` block) — add functions; call from `populateDashboard`.

- [ ] **Step 1: Add `renderAuthorizationPanel` + supporting functions**

In `couple.html`, find `function changeCharityMode()` (near end of script, around line 683). **Immediately before** that function, insert:

```javascript
    /* ── Authorization Panel Rendering ── */
    function renderAuthorizationPanel(couple) {
      const panel = document.getElementById('authPanel');
      const body  = document.getElementById('authPanelBody');
      if (!panel || !body) return;

      const c       = coupleWithDefaults(couple);
      const escrow  = getEscrowedGifts(c.id);
      const totalInEscrow  = escrow.reduce((s, g) => s + g.charityAmount, 0);
      const totalPersonal  = escrow.reduce((s, g) => s + g.personalAmount, 0);
      const unclaimedCount = (c.giftIds || []).length - escrow.length
                           - (c.giftIds || []).map(id => getGift(id))
                               .filter(g => g && ['authorized','refunded','auto_refunded']
                               .includes(g.status)).length;

      // Hide when pending with nothing in escrow and no resolved status.
      if (c.authorizationStatus === 'pending' && escrow.length === 0) {
        panel.hidden = true;
        return;
      }
      panel.hidden = false;

      // Resolved states → compact receipt.
      if (c.authorizationStatus !== 'pending') {
        panel.classList.add('auth-panel--resolved');
        body.innerHTML = renderResolvedReceipt(c);
        return;
      }

      // Pending → full interactive panel.
      panel.classList.remove('auth-panel--resolved');
      const deadline   = c.escrowDeadline || (Date.now() + ESCROW_WINDOW_MS);
      const daysLeft   = Math.max(0, Math.ceil((deadline - Date.now()) / (24*60*60*1000)));
      const urgent     = daysLeft <= 2;
      const charityName = _esc(c.featuredCharityName || '—');
      const charityIcon = _esc(c.featuredCharityIcon || '🤝');
      const unclaimedNote = unclaimedCount > 0
        ? ` · ${escrow.length} of ${escrow.length + unclaimedCount} gifts in escrow`
        : '';

      body.innerHTML = `
        <div class="auth-panel__header">
          <h4 class="auth-panel__title">🔐 Authorize Charity Escrow</h4>
          <span class="countdown-chip ${urgent ? 'countdown-chip--urgent' : ''}">
            ⏳ ${daysLeft} day${daysLeft === 1 ? '' : 's'} left
          </span>
        </div>
        <div class="caption text-muted" style="margin-bottom:0.5rem;">
          Deadline: ${_esc(formatDate(deadline))}${unclaimedNote}
        </div>
        <div class="auth-panel__total">${fmt(totalInEscrow)}</div>
        <div class="caption text-muted" style="margin-top:-0.25rem;margin-bottom:0.5rem;">
          Charity portion in escrow
        </div>
        <div class="auth-panel__beneficiary">
          <span style="font-size:1.25rem;">${charityIcon}</span>
          <div>
            <div><strong>${charityName}</strong></div>
            <div class="caption text-muted">IPC-certified · 250% tax deductible</div>
          </div>
        </div>
        <div class="auth-panel__personal-note">
          ℹ Your personal portion (${fmt(totalPersonal)}) is yours regardless of this decision.
        </div>

        <label class="auth-panel__radio" id="authChoiceAuthorizeLabel">
          <input type="radio" name="authChoice" value="authorize" onchange="updateConfirmButtonState()" />
          <span>I have read the Terms &amp; Conditions and authorise Altru Pte Ltd to release the <strong>${fmt(totalInEscrow)}</strong> escrow as a donation to <strong>${charityName}</strong>.</span>
        </label>

        <label class="auth-panel__radio" id="authChoiceRefundLabel">
          <input type="radio" name="authChoice" value="refund" onchange="updateConfirmButtonState()" />
          <span>I decide to refund the full <strong>${fmt(totalInEscrow)}</strong> escrow amount back to each wedding attendee.</span>
        </label>

        <div class="auth-panel__tnc">
          <input type="checkbox" id="authTncCheckbox" onchange="updateConfirmButtonState()" />
          <label for="authTncCheckbox">
            I agree to the
            <a href="#" onclick="event.preventDefault(); openTncModal();" style="color:var(--red);">Terms &amp; Conditions</a>
          </label>
        </div>

        <button type="button" class="btn btn-primary btn-full" id="authConfirmBtn" disabled onclick="submitAuthorization()">
          Confirm decision
        </button>
        <div class="auth-panel__warning">⚠ Permanent. Cannot be undone.</div>
      `;
    }

    function renderResolvedReceipt(couple) {
      const charityName = _esc(couple.featuredCharityName || '—');
      const when        = couple.authorizedAt ? _esc(formatDateLong(couple.authorizedAt)) : '—';
      const authorized  = getAuthorizedGifts(couple.id);
      const totalAuth   = authorized.reduce((s, g) => s + g.charityAmount, 0);
      const refunded    = (couple.giftIds || [])
        .map(id => getGift(id))
        .filter(g => g && (g.status === 'refunded' || g.status === 'auto_refunded'));
      const totalRefund = refunded.reduce((s, g) => s + g.charityAmount, 0);

      if (couple.authorizationStatus === 'authorized') {
        return `<div class="auth-panel__receipt">✅ <strong>Escrow authorized</strong> on ${when}<br>${fmt(totalAuth)} donated to ${charityName}.</div>`;
      }
      if (couple.authorizationStatus === 'refunded') {
        return `<div class="auth-panel__receipt">💸 <strong>Escrow refunded</strong> on ${when}<br>${fmt(totalRefund)} returned to ${refunded.length} attendee${refunded.length === 1 ? '' : 's'}.</div>`;
      }
      if (couple.authorizationStatus === 'auto_refunded') {
        return `<div class="auth-panel__receipt">⏱️ <strong>Auto-refunded</strong> on ${when}<br>${fmt(totalRefund)} returned — the 14-day decision window lapsed.</div>`;
      }
      return '';
    }

    function updateConfirmButtonState() {
      const btn     = document.getElementById('authConfirmBtn');
      const choice  = document.querySelector('input[name="authChoice"]:checked');
      const tnc     = document.getElementById('authTncCheckbox');
      if (!btn) return;
      btn.disabled = !(choice && tnc && tnc.checked);

      document.getElementById('authChoiceAuthorizeLabel')?.classList.toggle(
        'auth-panel__radio--selected', choice?.value === 'authorize');
      document.getElementById('authChoiceRefundLabel')?.classList.toggle(
        'auth-panel__radio--selected', choice?.value === 'refund');
    }
```

- [ ] **Step 2: Call `renderAuthorizationPanel` from `populateDashboard`**

In `couple.html`, find the end of `populateDashboard` (the closing `}` just after the `.join('')` gift-list block, around line 663). **Immediately before** that closing `}`, insert:

```javascript
      renderAuthorizationPanel(couple);
```

- [ ] **Step 3: Manual verification — pending state**

Hard-refresh. Navigate to `couple.html?couple=test-couple-01` (re-seed if needed).

Expected:
- New card above Tax Relief Summary titled "🔐 Authorize Charity Escrow".
- Shows `S$788.00` charity portion. Beneficiary "🎗️ Singapore Cancer Society".
- Countdown ≈ 14 days (gold/cream chip, not urgent).
- Two radio options + T&C checkbox + disabled Confirm button.
- Personal-portion note shows `S$388.00`.

Click each radio → selected one highlights red. Tick T&C → Confirm enables. Untick → disables.

- [ ] **Step 4: Manual verification — resolved state**

In Console:

```javascript
const c = getCouple('test-couple-01');
c.authorizationStatus = 'authorized';
c.authorizedAt        = Date.now();
c.authorizedCharityId = c.featuredCharityId;
c.tcAccepted          = true;
saveCouple(c);
getEscrowedGifts(c.id).forEach(g => { g.status = 'authorized'; saveGift(g); });
location.reload();
```

Expected: panel collapses to white receipt: `✅ Escrow authorized on <date, time> — S$788.00 donated to Singapore Cancer Society.`

Reset:

```javascript
const c = getCouple('test-couple-01');
c.authorizationStatus = 'pending';
c.authorizedAt = null;
saveCouple(c);
getAuthorizedGifts(c.id).forEach(g => { g.status = 'claimed'; saveGift(g); });
location.reload();
```

- [ ] **Step 5: Commit**

```bash
git add couple.html
git commit -m "Render authorization panel in pending and resolved states"
```

---

## Task 6: Implement T&C modal open/close

**Files:**
- Modify: `couple.html` (`<script>`) — add two functions + global listeners.

- [ ] **Step 1: Add modal open/close helpers**

In `couple.html`, immediately after `updateConfirmButtonState` (added in Task 5), insert:

```javascript
    function openTncModal() {
      const m = document.getElementById('tncModal');
      if (!m) return;
      m.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    function closeTncModal() {
      const m = document.getElementById('tncModal');
      if (!m) return;
      m.hidden = true;
      document.body.style.overflow = '';
    }

    // Close T&C modal on ESC or backdrop click.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeTncModal();
    });
    document.addEventListener('click', (e) => {
      const m = document.getElementById('tncModal');
      if (m && !m.hidden && e.target === m) closeTncModal();
    });
```

- [ ] **Step 2: Manual verification**

Hard-refresh. On the test dashboard, click the "Terms & Conditions" link in the auth panel.

Expected:
- Dark overlay + white modal with 11-point list appears.
- Click `×` → closes.
- Re-open, press `Esc` → closes.
- Re-open, click dark backdrop → closes.
- Re-open, click inside white body → stays open.

- [ ] **Step 3: Commit**

```bash
git add couple.html
git commit -m "Wire up T&C modal open/close with ESC and backdrop handlers"
```

---

## Task 7: Implement submitAuthorization (state mutation + re-render)

**Files:**
- Modify: `couple.html` (`<script>`) — add function.

- [ ] **Step 1: Add `submitAuthorization`**

Immediately after `closeTncModal` (Task 6), insert:

```javascript
    function submitAuthorization() {
      const choice = document.querySelector('input[name="authChoice"]:checked')?.value;
      const tnc    = document.getElementById('authTncCheckbox')?.checked;
      if (!choice || !tnc) return;

      if (!confirm('This decision is permanent and cannot be undone. Continue?')) return;

      const couple = getCouple(activeCoupleId);
      if (!couple) return;
      const escrow = getEscrowedGifts(couple.id);
      if (escrow.length === 0) {
        showToast('Nothing in escrow to decide.');
        return;
      }

      const now = Date.now();
      const newGiftStatus = (choice === 'authorize') ? 'authorized' : 'refunded';
      escrow.forEach(g => {
        g.status     = newGiftStatus;
        g.resolvedAt = now;
        saveGift(g);
      });

      couple.authorizationStatus = (choice === 'authorize') ? 'authorized' : 'refunded';
      couple.authorizedAt        = now;
      couple.authorizedCharityId = couple.featuredCharityId;
      couple.tcAccepted          = true;
      saveCouple(couple);

      showToast(choice === 'authorize'
        ? '✅ Escrow authorized — donation recorded.'
        : '💸 Escrow refunded to attendees.');

      populateDashboard(getCouple(couple.id));
    }
```

- [ ] **Step 2: Manual verification — authorize**

In Console: `localStorage.removeItem('altru_data'); localStorage.removeItem('altru_coupleId');` then re-seed via Task 1 Step 4.

On the dashboard: select "authorize" radio, tick T&C, click Confirm, click OK.

Expected:
- Toast: "✅ Escrow authorized — donation recorded."
- Panel collapses to authorized receipt.
- `getEscrowedGifts('test-couple-01').length` → `0`.
- `getAuthorizedGifts('test-couple-01').length` → `3`.

- [ ] **Step 3: Manual verification — refund**

Reset + re-seed. Select "refund" + T&C + Confirm.

Expected:
- Toast: "💸 Escrow refunded to attendees."
- Receipt: `💸 Escrow refunded on <now> — S$788.00 returned to 3 attendees.`
- `getCouple('test-couple-01').giftIds.map(id => getGift(id).status)` → `['refunded','refunded','refunded']`.

- [ ] **Step 4: Manual verification — cancel**

Reset + re-seed. Select + T&C + Confirm → click **Cancel** on native dialog.

Expected: no state change. `getCouple('test-couple-01').authorizationStatus` → `'pending'`.

- [ ] **Step 5: Commit**

```bash
git add couple.html
git commit -m "Implement escrow authorization confirm flow with state mutation"
```

---

## Task 8: Implement auto-refund check on page load

**Files:**
- Modify: `couple.html` (`<script>`) — add function + two call sites.

- [ ] **Step 1: Add `runAutoRefundCheckIfDue`**

Immediately after `submitAuthorization` (Task 7), insert:

```javascript
    /*
      Opportunistic auto-refund. Runs before the dashboard first renders.
      If the couple never decided and the 14-day deadline has passed, every
      escrowed gift flips to auto_refunded. Demo limitation: this only fires
      if someone loads the dashboard — real production needs a server cron.
    */
    function runAutoRefundCheckIfDue(coupleId) {
      const couple = coupleWithDefaults(getCouple(coupleId));
      if (!couple) return;
      if (couple.authorizationStatus !== 'pending') return;
      if (!couple.escrowDeadline || Date.now() <= couple.escrowDeadline) return;

      const escrow = getEscrowedGifts(couple.id);
      const now = Date.now();
      escrow.forEach(g => {
        g.status     = 'auto_refunded';
        g.resolvedAt = now;
        saveGift(g);
      });
      couple.authorizationStatus = 'auto_refunded';
      couple.authorizedAt        = now;
      saveCouple(couple);
    }
```

- [ ] **Step 2: Wire into `DOMContentLoaded` init (two branches)**

In `couple.html`, find the `DOMContentLoaded` listener (around line 409). Inside it, find the `else if (coupleId)` branch:

```javascript
      } else if (coupleId) {
        activeCoupleId = coupleId;
        const couple = getCouple(coupleId);
```

Replace with:

```javascript
      } else if (coupleId) {
        activeCoupleId = coupleId;
        runAutoRefundCheckIfDue(coupleId);
        const couple = getCouple(coupleId);
```

Similarly find the `else if (stored)` branch immediately below:

```javascript
      } else if (stored) {
        activeCoupleId = stored;
        const couple = getCouple(stored);
```

Replace with:

```javascript
      } else if (stored) {
        activeCoupleId = stored;
        runAutoRefundCheckIfDue(stored);
        const couple = getCouple(stored);
```

- [ ] **Step 3: Manual verification — deadline lapsed**

Reset + re-seed. In Console:

```javascript
const c = getCouple('test-couple-01');
c.escrowDeadline = Date.now() - 1000;
saveCouple(c);
location.reload();
```

Expected:
- Panel shows `⏱️ Auto-refunded on <now> — S$788.00 returned — the 14-day decision window lapsed.`
- `getCouple('test-couple-01').authorizationStatus` → `'auto_refunded'`.
- All gift statuses → `'auto_refunded'`.

- [ ] **Step 4: Manual verification — deadline not yet reached**

Reset + re-seed. Reload without mutating deadline.

Expected: panel renders in pending state. Status remains `'pending'`.

- [ ] **Step 5: Commit**

```bash
git add couple.html
git commit -m "Opportunistic auto-refund on page load past 14-day deadline"
```

---

## Task 9: Update populateDashboard — Tax Relief Summary + gift list badges

**Files:**
- Modify: `couple.html` `populateDashboard` (around line 598).

Context: Tax Relief Summary must reflect **only authorized** gifts. Gift list badges must show the new statuses: `in escrow` (gold), `authorized` (green), `refunded` / `auto-refunded` (gray, strike-through).

- [ ] **Step 1: Rewrite the Tax block**

In `populateDashboard`, find (around line 635):

```javascript
      // Tax
      const deduction = totalCharity * 2.5;
      const savings   = deduction * 0.22;
      document.getElementById('taxCharity').textContent   = fmt(totalCharity);
      document.getElementById('taxDeduction').textContent = fmt(deduction);
      document.getElementById('taxSavings').textContent   = fmt(savings);
      document.getElementById('dashNRIC').textContent     = couple.nricMasked || 'Not provided';
```

Replace with:

```javascript
      // Tax — reflects only authorized (released) gifts.
      const cDef = coupleWithDefaults(couple);
      const authorized = getAuthorizedGifts(cDef.id);
      const authorizedCharity = authorized.reduce((s, g) => s + g.charityAmount, 0);
      const refundedStates = ['refunded', 'auto_refunded'];
      const isRefunded = refundedStates.includes(cDef.authorizationStatus);

      let taxCharityVal, deduction, savings, caption;
      if (cDef.authorizationStatus === 'authorized') {
        taxCharityVal = authorizedCharity;
        deduction     = taxCharityVal * 2.5;
        savings       = deduction * 0.22;
        caption       = `Donation released on ${formatDate(cDef.authorizedAt)}.`;
      } else if (isRefunded) {
        taxCharityVal = 0;
        deduction     = 0;
        savings       = 0;
        caption       = 'Escrow refunded — no tax deduction applies.';
      } else {
        // pending
        taxCharityVal = 0;
        deduction     = 0;
        savings       = 0;
        const potential = totalCharity * 2.5;
        const potSavings = potential * 0.22;
        caption = `Pending authorization. Potential: ${fmt(potential)} deduction, ${fmt(potSavings)} savings.`;
      }
      document.getElementById('taxCharity').textContent   = fmt(taxCharityVal);
      document.getElementById('taxDeduction').textContent = fmt(deduction);
      document.getElementById('taxSavings').textContent   = fmt(savings);
      document.getElementById('dashNRIC').textContent     = couple.nricMasked || 'Not provided';

      // Append/replace caption in the Tax Relief card body.
      const taxCard = document.getElementById('taxSavings')?.closest('.card-body');
      const existingCaption = taxCard?.querySelector('.auth-tax-caption');
      if (existingCaption) existingCaption.remove();
      if (taxCard) {
        const cap = document.createElement('div');
        cap.className = 'caption text-muted mt-1 auth-tax-caption';
        cap.textContent = caption;
        taxCard.appendChild(cap);
      }
```

- [ ] **Step 2: Rewrite the gift list rendering**

Still in `populateDashboard`, find (around line 648):

```javascript
        listEl.innerHTML = gifts.map(g => `
          <div class="gift-item">
            <div class="gift-avatar">${_esc((g.donorName || '?')[0].toUpperCase())}</div>
            <div class="gift-info">
              <div class="gift-name">${_esc(g.donorName)}</div>
              <div class="gift-meta">${_esc(g.charityIcon)} ${_esc(g.charityName)} &nbsp;·&nbsp; ${_esc(formatDate(g.createdAt))}</div>
            </div>
            <div class="gift-amounts">
              <div class="gift-total">${fmt(g.totalAmount)}</div>
              <div class="gift-charity-amt">❤️ ${fmt(g.charityAmount)} to charity</div>
            </div>
            <span class="badge badge-${g.status==='claimed'?'green':'gray'}" style="margin-left:0.5rem;">${_esc(g.status)}</span>
          </div>
        `).join('');
```

Replace with:

```javascript
        const badgeFor = (status) => {
          switch (status) {
            case 'authorized':    return { cls: 'badge-green',       text: 'authorized' };
            case 'claimed':       return { cls: 'badge-gold',        text: 'in escrow' };
            case 'refunded':      return { cls: 'badge-gray-strike', text: 'refunded' };
            case 'auto_refunded': return { cls: 'badge-gray-strike', text: 'auto-refunded' };
            default:              return { cls: 'badge-gray',        text: _esc(status || 'pending') };
          }
        };
        listEl.innerHTML = gifts.map(g => {
          const b = badgeFor(g.status);
          const refunded = (g.status === 'refunded' || g.status === 'auto_refunded');
          return `
          <div class="gift-item ${refunded ? 'gift-item--refunded' : ''}">
            <div class="gift-avatar">${_esc((g.donorName || '?')[0].toUpperCase())}</div>
            <div class="gift-info">
              <div class="gift-name">${_esc(g.donorName)}</div>
              <div class="gift-meta">${_esc(g.charityIcon)} ${_esc(g.charityName)} &nbsp;·&nbsp; ${_esc(formatDate(g.createdAt))}</div>
            </div>
            <div class="gift-amounts">
              <div class="gift-total">${fmt(g.totalAmount)}</div>
              <div class="gift-charity-amt">❤️ ${fmt(g.charityAmount)} to charity</div>
            </div>
            <span class="badge ${b.cls}" style="margin-left:0.5rem;">${b.text}</span>
          </div>`;
        }).join('');
```

- [ ] **Step 3: Manual verification — pending**

Reset + re-seed. Navigate to `couple.html?couple=test-couple-01`.

Expected:
- Tax Relief Summary: `S$0.00 / S$0.00 / S$0.00`, caption `Pending authorization. Potential: S$1,970.00 deduction, S$433.40 savings.`
- Three gift rows each with gold "in escrow" badge.

- [ ] **Step 4: Manual verification — authorized**

Select "authorize" + T&C + Confirm + OK. Expected:
- Tax Relief: `S$788.00 / S$1,970.00 / S$433.40`, caption `Donation released on <today>.`
- Three gift rows each with green "authorized" badge.

- [ ] **Step 5: Manual verification — refunded**

Reset + re-seed. Select "refund" + T&C + Confirm + OK. Expected:
- Tax Relief: all zeros, caption `Escrow refunded — no tax deduction applies.`
- Three rows with gray strike-through "refunded" badge; `gift-total` / `gift-charity-amt` also struck through.

- [ ] **Step 6: Commit**

```bash
git add couple.html
git commit -m "Wire Tax Relief Summary and gift badges to authorization state"
```

---

## Task 10: Final integration pass + push

**Files:** No code changes. End-to-end verification.

- [ ] **Step 1: Happy-path — authorize**

1. DevTools → Application → Clear site data (localStorage).
2. Re-seed via Task 1 Step 4.
3. Navigate to `couple.html?couple=test-couple-01`.
4. Verify: auth panel pending; countdown ≈ 14 days; S$788 in escrow.
5. Open/close T&C modal via `×`, Esc, backdrop click.
6. Select "authorize" → highlight. Tick T&C → Confirm enables. Click Confirm → OK.
7. Verify toast, receipt, Tax Relief (S$788/S$1,970/S$433.40), three green "authorized" badges.
8. Reload → state persists.

- [ ] **Step 2: Happy-path — refund**

1. Clear + re-seed.
2. Select "refund" + T&C + Confirm + OK.
3. Verify toast, refunded receipt, zero Tax Relief, three gray strike-through rows.

- [ ] **Step 3: Happy-path — auto-refund**

1. Clear + re-seed.
2. Console: `const c = getCouple('test-couple-01'); c.escrowDeadline = Date.now() - 1000; saveCouple(c); location.reload();`.
3. Verify auto-refunded receipt on load; status fields and gift badges reflect `auto_refunded`.

- [ ] **Step 4: Edge — no gifts**

1. Clear localStorage. Navigate to `couple.html` → setup view.
2. Fill name + email + pick any charity → create profile.
3. Dashboard loads. Verify `document.getElementById('authPanel').hidden === true` in Console.

- [ ] **Step 5: Edge — mixed claimed + unclaimed**

1. Clear + re-seed. Then add one unclaimed gift in Console:

```javascript
saveGift({
  id: 'test-gift-04', donorName: 'Unclaimed Cousin',
  coupleName: 'Wei Jie & Lin Hui',
  charityId: 'singapore-cancer-society',
  charityName: 'Singapore Cancer Society',
  charityIcon: '🎗️',
  totalAmount: 200, personalAmount: 50, charityAmount: 150,
  status: 'pending', createdAt: Date.now(),
});
const c = getCouple('test-couple-01');
c.giftIds.push('test-gift-04');
saveCouple(c);
location.reload();
```

2. Verify panel shows `"3 of 4 gifts in escrow"` in the caption; total remains S$788 (the unclaimed one not counted).

- [ ] **Step 6: Cross-page smoke**

From dashboard, click through each nav link (Home, Ang Bao Guide, Venue Guide, Send a Gift, Giving Stories) and back. Verify no JS console errors anywhere.

- [ ] **Step 7: Push**

```bash
git log --oneline -12
git push origin main
```

Cloudflare Workers will redeploy automatically.

---

## Known limitations (documented in spec)

- Auto-refund fires only when someone loads the dashboard.
- Local clock tampering can bypass the deadline.
- No audit log beyond `authorizedAt`.
- All state is in the visitor's `localStorage` — no cross-device sync.

These are acceptable for a demo site and are captured in `docs/superpowers/specs/2026-04-20-couple-escrow-authorization-design.md`.
