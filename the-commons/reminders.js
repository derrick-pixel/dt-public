/* ==========================================================
   THE COMMONS — Reminder system (log + optional Formspree)
   ---------------------------------------------------------
   Two surfaces:
     1. computeDueReminders()  — sweeps events + milestones and
        queues a reminder row for any attendee with a payment
        due within the next 7 days OR overdue.
     2. sendReminder(id)       — marks queued → sent. If
        TC_FORMSPREE_ID is set, POSTs to Formspree; otherwise
        log-only (status becomes 'sent_local').

   All reminder rows are stored in tc:reminders by store.js.
   ========================================================== */

(function () {
  'use strict';

  // Toggle by replacing with a real Formspree ID (e.g. 'mzdyjjag').
  // While the sentinel stays here, sends are local-only logs.
  const TC_FORMSPREE_ID = 'YOUR_FORMSPREE_ID';
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/' + TC_FORMSPREE_ID;

  const DUE_WINDOW_DAYS = 7;

  function _daysUntil(isoDate) {
    if (!isoDate) return Infinity;
    const d = new Date(isoDate + 'T00:00:00');
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.floor((d - now) / 86400000);
  }

  function _addDaysISO(iso, days) {
    const d = iso ? new Date(iso + 'T00:00:00') : new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  // Compute a milestone's due date from the event date and the milestone's
  // dueOffset (days before event). E.g. dueOffset=14 → due 14 days before event.
  function milestoneDueDate(ev, m) {
    if (!ev || !ev.date) return null;
    return _addDaysISO(ev.date, -Math.abs(Number(m.dueOffset || 0)));
  }

  // For each upcoming event, for each RSVP, for each milestone whose due date
  // is within DUE_WINDOW_DAYS OR overdue, queue a reminder row.
  function computeDueReminders() {
    if (!window.TCStore) return { queued: 0 };
    let queued = 0;

    TCStore.listEvents().forEach(ev => {
      if (ev.status === 'cancelled' || ev.status === 'released') return;
      const rsvps = TCStore.listRSVPs(ev.id).filter(r => r.status !== 'refunded');
      if (!rsvps.length) return;

      (ev.milestones || []).forEach(m => {
        const due = milestoneDueDate(ev, m);
        if (!due) return;
        const days = _daysUntil(due);
        if (days > DUE_WINDOW_DAYS || days < -30) return; // far future or too stale

        rsvps.forEach(r => {
          // Has this RSVP already paid this milestone?
          const txns = TCStore.listTransactions().filter(t =>
            t.rsvpId === r.id && t.milestoneId === m.id);
          const paid = txns.some(t => t.status === 'verified' || t.status === 'released');
          if (paid) return;

          const kind = days < 0 ? 'overdue' : (days <= 1 ? 'due_tomorrow' : 'upcoming');
          const before = TCStore.listReminders().length;
          TCStore.createReminder({
            eventId: ev.id, rsvpId: r.id, milestoneId: m.id,
            amount: m.amount, kind: kind, dueDate: due,
            toName: r.name, toEmail: r.email, toPhone: r.phone || '',
            subject: 'Payment reminder — ' + ev.title + ' (' + m.label + ')',
            body: 'Hi ' + (r.name || 'there') + ', this is a friendly reminder that the ' +
                  m.label + ' of S$' + m.amount + ' for "' + ev.title + '" is ' +
                  (days < 0 ? (-days) + ' day(s) overdue' : 'due on ' + due) + '.' +
                  '\n\nPay via PayNow to 9100 2050 with reference TC-RSVP-<your-ref>.' +
                  '\n\n— The Commons',
            status: 'queued'
          });
          if (TCStore.listReminders().length > before) queued++;
        });
      });
    });

    return { queued: queued };
  }

  // Send a single reminder. If Formspree is configured, POSTs; else logs.
  async function sendReminder(id) {
    if (!window.TCStore) return null;
    const r = TCStore.listReminders().find(x => x.id === id);
    if (!r) return null;
    if (r.status === 'sent' || r.status === 'sent_local') return r;

    if (TC_FORMSPREE_ID === 'YOUR_FORMSPREE_ID') {
      // Log-only mode
      return TCStore.updateReminder(id, {
        status: 'sent_local',
        sentAt: Date.now(),
        transport: 'log'
      });
    }

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          to: r.toEmail, name: r.toName, phone: r.toPhone,
          subject: r.subject, body: r.body, kind: r.kind, eventId: r.eventId
        })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return TCStore.updateReminder(id, {
        status: 'sent', sentAt: Date.now(), transport: 'formspree'
      });
    } catch (e) {
      return TCStore.updateReminder(id, {
        status: 'failed', failedAt: Date.now(), error: String(e)
      });
    }
  }

  // Send all queued reminders in sequence (awaits each).
  async function sendAllQueued() {
    if (!window.TCStore) return { sent: 0 };
    const queued = TCStore.listReminders({ status: 'queued' });
    let sent = 0;
    for (const r of queued) {
      const res = await sendReminder(r.id);
      if (res && (res.status === 'sent' || res.status === 'sent_local')) sent++;
    }
    return { sent: sent, total: queued.length };
  }

  function dismissReminder(id) {
    if (!window.TCStore) return null;
    return TCStore.updateReminder(id, { status: 'dismissed', dismissedAt: Date.now() });
  }

  // Auto-compute on load so the admin sees a queue out of the box.
  if (typeof window !== 'undefined' && window.TCStore) {
    try { computeDueReminders(); } catch (e) { /* noop */ }
  } else if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      try { computeDueReminders(); } catch (e) { /* noop */ }
    });
  }

  window.TCReminders = {
    FORMSPREE_CONFIGURED: TC_FORMSPREE_ID !== 'YOUR_FORMSPREE_ID',
    computeDueReminders: computeDueReminders,
    sendReminder: sendReminder,
    sendAllQueued: sendAllQueued,
    dismissReminder: dismissReminder,
    milestoneDueDate: milestoneDueDate
  };
})();
