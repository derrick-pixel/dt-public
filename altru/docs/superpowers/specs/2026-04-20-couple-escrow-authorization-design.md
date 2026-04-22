# Couple Escrow Authorization Panel — Design Spec

**Date:** 2026-04-20
**Scope:** `couple.html` dashboard
**Status:** Approved, pending implementation plan

## Problem

Wedding attendees send gifts through Altru, split into a personal portion (to the couple) and a charity portion (held in escrow by Altru Pte Ltd). Currently, the couple's dashboard shows the totals but provides no way for the couple to explicitly authorize — or refuse — the release of the charity portion. We need an explicit approval panel that:

1. Lists the gifts in escrow and the grand total charity amount.
2. Shows the potential 250% IRAS tax deduction the couple would receive if they authorize the donation.
3. Presents two mutually exclusive decisions — authorize the donation to the single chosen charity, or refund the full escrow to each attendee.
4. Auto-refunds if the couple does not decide within 14 days.

## Assumptions (clarified with stakeholder)

- **One charity per wedding.** The couple picks the charity at setup, OR inherits the first attendee's choice if an attendee created the couple's profile first. The couple can override the selection at any time before authorization.
- **Personal portion is independent.** It remains redeemable by the couple regardless of the escrow decision.
- **Decision is permanent.** Once authorized or refunded, no reversal. A 14-day inactivity cutoff auto-refunds the escrow to attendees.
- **State persistence is real, not cosmetic.** Gift and couple records in `localStorage` mutate to reflect the decision, and the rest of the dashboard (Tax Relief Summary, gift list badges) reads from that state.

## Data model

### Couple record — new fields

| Field | Type | Meaning |
|---|---|---|
| `authorizationStatus` | `"pending"` \| `"authorized"` \| `"refunded"` \| `"auto_refunded"` | Decision state. Defaults to `"pending"`. |
| `authorizedAt` | number (ms timestamp) | When the decision was confirmed (by couple or by auto-refund). |
| `authorizedCharityId` | string | Snapshot of the charity ID at the moment of confirmation. Frozen. |
| `tcAccepted` | boolean | Whether the couple ticked the T&C checkbox at confirmation time. |
| `escrowDeadline` | number (ms timestamp) | `max(gift.claimedAt) + 14 days`. Recomputed on every new gift claim; only moves forward. |

### Gift record — extended `status`

Existing values: `"pending"`, `"claimed"`.
New values: `"authorized"`, `"refunded"`, `"auto_refunded"`.

Gift status only flips when the couple (or auto-refund) confirms — individual gifts follow the couple-level decision.

### Backward compatibility

Missing fields on legacy records default to:
- `authorizationStatus` → `"pending"`
- `escrowDeadline` → computed on read from `max(gift.claimedAt) + 14d`, or `Date.now() + 14d` if no claimed gifts yet.
- `authorizedAt`, `authorizedCharityId`, `tcAccepted` → `null`.

## UI

### Placement

New card inside `viewDashboard`, right column, between the Giving Aura share card and the Tax Relief Summary card. Card is **hidden entirely** when the couple has zero gifts.

### State: `pending` (decision required)

```
┌─ 🔐 Authorize Charity Escrow ────────────────┐
│ Deadline: 14 May 2026 · ⏳ 9 days left       │
│                                              │
│ Charity portion in escrow: S$1,800           │
│ Beneficiary: 🤝 ADA (IPC-certified)          │
│                                              │
│ ℹ Your personal portion (S$600) is yours    │
│   regardless of this decision.               │
│                                              │
│ ( ) I have read the Terms & Conditions and  │
│     authorise Altru Pte Ltd to release the  │
│     S$1,800 escrow as a donation to ADA.    │
│                                              │
│ ( ) I decide to refund the full S$1,800     │
│     escrow amount back to each wedding      │
│     attendee.                                │
│                                              │
│ ☐ I agree to the T&Cs [link]                 │
│                                              │
│ [ Confirm decision ]                         │
│                                              │
│ ⚠ Permanent. Cannot be undone.               │
└──────────────────────────────────────────────┘
```

- Confirm button is disabled until **both** a radio option is selected **and** the T&C checkbox is ticked.
- Clicking Confirm triggers a native `confirm()` dialog — "This cannot be undone. Continue?" — before mutating state.
- Radio copy dynamically interpolates the current charity name and the live escrow total.
- Countdown chip shows days remaining; turns red when ≤ 2 days.

### State: `authorized` / `refunded` / `auto_refunded` (resolved)

Panel collapses to a compact receipt:

- `authorized` → `✅ Escrow authorized on 20 Apr 2026 → S$1,800 donated to ADA`
- `refunded` → `💸 Escrow refunded on 20 Apr 2026 → S$1,800 returned to 8 attendees`
- `auto_refunded` → `⏱️ Auto-refunded on 15 May 2026 (14-day inaction cutoff)`

No interactive controls in the resolved state.

### Mixed claimed + unclaimed gifts

Panel title shows `"X of Y gifts in escrow"` when some gifts are still unclaimed. Unclaimed gifts are excluded from the escrow total; they'll count when claimed.

## Terms & Conditions copy

Displayed via a modal overlay (same UX pattern as the existing charity modal). Triggered by clicking the `[T&Cs]` link next to the checkbox.

> **Altru Escrow Authorization — Terms & Conditions**
> *(Last updated: 20 April 2026)*
>
> By checking the agreement box and confirming your decision, you ("the Couple") acknowledge and agree to the following terms with **Altru Pte Ltd** ("Altru"):
>
> 1. **Escrow service.** Altru holds the charity portion of each wedding gift (the "Escrow Amount") on your behalf in a segregated account until you record an authorization decision or the 14-day deadline passes.
> 2. **Your decision.** You may either (a) authorize donation — instruct Altru to release the full Escrow Amount as a single donation to the IPC-certified charity named on your dashboard; or (b) refund to attendees — instruct Altru to return the Escrow Amount to each wedding attendee in proportion to their contribution.
> 3. **Irreversibility.** Your decision is final upon confirmation. Altru will initiate the payment within 3 business days and cannot reverse the transaction thereafter.
> 4. **14-day deadline.** If no decision is recorded within 14 days of the most recent gift being claimed, the entire Escrow Amount is automatically refunded to the respective attendees and no further action will be possible.
> 5. **Tax receipts.** If you authorize the donation, a 250% IRAS tax-deduction receipt will be issued in the name associated with the NRIC/FIN you provided, for the full Escrow Amount. Refunded amounts are not tax-deductible.
> 6. **Personal portion.** The personal portion of each gift (the non-charity share) is not affected by this decision and remains redeemable by you at any time through your dashboard.
> 7. **Charity change.** You may change the beneficiary charity at any time *before* confirming this decision. Once confirmed, the charity recorded at the time of confirmation is final.
> 8. **Fees.** Altru does not charge any fees on the Escrow Amount or on the donation.
> 9. **Data privacy.** Your NRIC/FIN is used solely for IRAS tax-relief filing and is not shared with third parties except as required by law or by IRAS.
> 10. **No guarantee of charity use.** Altru verifies each beneficiary's IPC status at the time of donation but is not liable for how the charity subsequently uses the funds.
> 11. **Governing law.** These terms are governed by the laws of the Republic of Singapore.

## Behaviour

### State transitions

```
pending ──(couple authorize)──▶ authorized   (one-way, final)
pending ──(couple refund)─────▶ refunded     (one-way, final)
pending ──(14d lapse)─────────▶ auto_refunded (one-way, final)
```

### 14-day auto-refund

- `escrowDeadline = max(gift.claimedAt) + 14 days`, recomputed each time a gift's status transitions to `claimed`. Monotonic — never moves backward.
- Since the site is fully static (no backend cron), auto-refund runs **client-side** on `DOMContentLoaded` in `couple.html`, before first render of the dashboard.
- Algorithm: if `authorizationStatus === "pending"` && `Date.now() > escrowDeadline`, flip every `claimed` gift to `auto_refunded`, set couple's `authorizationStatus` to `auto_refunded`, set `authorizedAt = Date.now()`, persist, then render the resolved-state panel with the auto-refund receipt.
- **Known limitation:** if no one ever loads the dashboard, auto-refund never runs. Acceptable for this demo; real production would require a backend scheduler. This is flagged in a code comment at the call site.

### Confirm-decision flow

1. User picks a radio + ticks T&C checkbox → Confirm button enables.
2. User clicks Confirm → `confirm("This decision is permanent. Continue?")`.
3. On OK: flip every `claimed` gift's status, set couple fields (`authorizationStatus`, `authorizedAt`, `authorizedCharityId`, `tcAccepted`), persist to localStorage.
4. Re-render dashboard — panel collapses to resolved receipt, Tax Relief Summary updates to reflect real authorized amounts.
5. Toast: `✅ Escrow authorized` or `💸 Escrow refunded`.

### Tax Relief Summary (downstream update)

- Before authorization: summary shows S$0 with a caption "Pending authorization — values shown are potential totals" and a muted gray preview of what the 250% deduction *would* be.
- After `authorized`: summary counts only `authorized` gifts, shown in normal red/gold.
- After `refunded` / `auto_refunded`: summary shows S$0 with caption "Escrow refunded — no tax deduction applies."

### Gift list (downstream update)

Each gift row shows its status as a badge in its existing badge slot: `claimed` (gray), `authorized` (green), `refunded` (gray with strikethrough total), `auto_refunded` (gray with strikethrough total + ⏱️ icon).

## File-level integration

| File | Changes |
|---|---|
| `couple.html` (`viewDashboard` markup) | Add `<div class="card auth-panel" id="authPanel">…</div>` between Giving Aura share and Tax Relief Summary. Add T&Cs modal markup at the bottom of `<body>`. |
| `couple.html` `<script>` | New functions: `renderAuthorizationPanel(couple)`, `computeEscrowDeadline(couple)`, `runAutoRefundCheckIfDue(couple)`, `submitAuthorization(choice)`, `openTncModal()`, `closeTncModal()`. Hook `runAutoRefundCheckIfDue` into `DOMContentLoaded` before any `showDashboard` call. |
| `js/app.js` | Extend gift/couple schemas: new fields default gracefully on reads. No breaking changes to existing persisted records. |
| `populateDashboard` | Read `couple.authorizationStatus`. Tax Relief Summary reads only `authorized` amounts. Gift list rows reflect new statuses with badge variants. |
| `css/styles.css` | Add `.auth-panel`, `.auth-panel--pending`, `.auth-panel--resolved`, `.countdown-chip`, `.countdown-chip--urgent` (≤ 2 days → red), `.tnc-modal`. |

## Known limitations (demo-only)

- No server-side escrow or payments; all state is client-side localStorage.
- Auto-refund is fired opportunistically on page load, not by a real scheduler.
- Local clock tampering could bypass the deadline — out of scope for a static demo.
- No audit log beyond the single `authorizedAt` timestamp.

## Out of scope

- Backend persistence, real payment rails, actual tax-receipt generation.
- Per-gift selective authorization (explicitly decided against: one charity per wedding means one decision).
- Reversing or appealing a confirmed decision.
- Notifications (email, SMS) around the deadline.

## Testing notes

This is a static HTML/JS project with no test harness. Manual verification checklist (covered in the implementation plan):

- New couple + no gifts → panel hidden.
- Couple + claimed gifts → panel renders in `pending` state with correct totals and deadline.
- Pick radio only → Confirm disabled; tick T&C only → Confirm disabled; both → Confirm enabled.
- Confirm authorize → all gifts flip to `authorized`, Tax Relief Summary updates, panel shows receipt.
- Confirm refund → all gifts flip to `refunded`, Tax Relief Summary zeroes with refund caption.
- Load dashboard with `now > escrowDeadline` and status `pending` → auto-refund runs, panel shows `auto_refunded` receipt.
- Legacy couple record (no new fields) → reads default gracefully, panel renders in `pending`.
