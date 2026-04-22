/* ==========================================================
   THE COMMONS — Client-side store (localStorage)
   ---------------------------------------------------------
   Tables (all namespaced under tc:…):
     tc:events        — created events
     tc:rsvps         — ticket holders per event
     tc:bookings      — vendor / provider bookings
     tc:transactions  — ledger (deposits, milestones, refunds, payouts)
     tc:currentUser   — {name, email}
     tc:seeded        — sentinel so we only seed demo data once

   All records carry {id, createdAt}. Transactions have status
   (pending_verification → verified → released / refunded).
   ========================================================== */

(function () {
  'use strict';

  const KEYS = {
    events: 'tc:events',
    rsvps: 'tc:rsvps',
    bookings: 'tc:bookings',
    transactions: 'tc:transactions',
    payouts: 'tc:payouts',
    reminders: 'tc:reminders',
    comments: 'tc:comments',
    waitlist: 'tc:waitlist',
    ratings: 'tc:ratings',
    referrals: 'tc:referrals',
    analytics: 'tc:analytics',
    currentUser: 'tc:currentUser',
    theme: 'tc:theme',
    seeded: 'tc:seeded',
    seededVersion: 'tc:seededVersion'
  };
  const SEED_VERSION = '4';

  // ── IO helpers ─────────────────────────────────────────
  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch (e) { return []; }
  }
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('tc:change', { detail: { key: key } }));
  }
  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  }
  function slugify(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'event';
  }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function addDaysISO(days) {
    const d = new Date(); d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  // ── Current user (simulated auth) ──────────────────────
  function currentUser() {
    try { return JSON.parse(localStorage.getItem(KEYS.currentUser) || 'null'); }
    catch { return null; }
  }
  function setCurrentUser(user) {
    if (!user || !user.email) return null;
    const u = { name: user.name || user.email.split('@')[0], email: user.email };
    localStorage.setItem(KEYS.currentUser, JSON.stringify(u));
    window.dispatchEvent(new CustomEvent('tc:user-change'));
    return u;
  }
  function logout() {
    localStorage.removeItem(KEYS.currentUser);
    window.dispatchEvent(new CustomEvent('tc:user-change'));
  }

  // ── Events ─────────────────────────────────────────────
  function listEvents() { return read(KEYS.events); }
  function eventById(id) { return listEvents().find(e => e.id === id) || null; }
  function eventBySlug(slug) { return listEvents().find(e => e.slug === slug) || null; }
  function findEventParam() {
    const p = new URLSearchParams(location.search);
    const slug = p.get('slug');
    const id = p.get('id');
    if (slug) return eventBySlug(slug);
    if (id) return eventById(id);
    return null;
  }
  function createEvent(data) {
    const evts = listEvents();
    const title = String(data.title || 'Untitled Event').trim();
    const ev = Object.assign({
      id: uid('evt'),
      slug: slugify(title) + '-' + Math.random().toString(36).slice(2, 5),
      title: title,
      emoji: data.emoji || '🎉',
      category: data.category || 'party',
      description: data.description || '',
      date: data.date || addDaysISO(14),
      time: data.time || '19:00',
      location: data.location || 'TBA',
      costPerPerson: Number(data.costPerPerson) || 0,
      depositAmount: Number(data.depositAmount) || 0,
      maxGuests: Number(data.maxGuests) || 20,
      milestones: Array.isArray(data.milestones) ? data.milestones : [],
      providers: Array.isArray(data.providers) ? data.providers : [],
      organiser: data.organiser || currentUser() || { name: 'Organiser', email: 'organiser@example.com' },
      status: data.status || 'live',
      createdAt: Date.now()
    }, data.overrides || {});
    evts.push(ev);
    write(KEYS.events, evts);
    return ev;
  }
  function updateEvent(id, changes) {
    const evts = listEvents();
    const i = evts.findIndex(e => e.id === id);
    if (i < 0) return null;
    evts[i] = Object.assign({}, evts[i], changes);
    write(KEYS.events, evts);
    return evts[i];
  }
  function eventsByOrganiser(email) {
    if (!email) return [];
    return listEvents().filter(e => e.organiser && e.organiser.email === email);
  }

  // ── RSVPs ──────────────────────────────────────────────
  function listRSVPs(eventId) {
    const all = read(KEYS.rsvps);
    return eventId ? all.filter(r => r.eventId === eventId) : all;
  }
  function rsvpsByEmail(email) {
    if (!email) return [];
    return read(KEYS.rsvps).filter(r => r.email === email);
  }
  function createRSVP(data) {
    const list = read(KEYS.rsvps);
    const r = Object.assign({
      id: uid('rsvp'),
      createdAt: Date.now(),
      status: 'pending_verification',
      amountPaid: 0
    }, data);
    list.push(r);
    write(KEYS.rsvps, list);
    return r;
  }
  function updateRSVP(id, changes) {
    const list = read(KEYS.rsvps);
    const i = list.findIndex(r => r.id === id);
    if (i < 0) return null;
    list[i] = Object.assign({}, list[i], changes);
    write(KEYS.rsvps, list);
    return list[i];
  }

  // ── Transactions ───────────────────────────────────────
  function listTransactions(filter) {
    const all = read(KEYS.transactions);
    if (!filter) return all;
    return all.filter(t => Object.keys(filter).every(k => t[k] === filter[k]));
  }
  function createTransaction(data) {
    const list = read(KEYS.transactions);
    const t = Object.assign({
      id: uid('txn'),
      createdAt: Date.now(),
      status: 'pending_verification'
    }, data);
    list.push(t);
    write(KEYS.transactions, list);
    return t;
  }
  function updateTransaction(id, changes) {
    const list = read(KEYS.transactions);
    const i = list.findIndex(t => t.id === id);
    if (i < 0) return null;
    list[i] = Object.assign({}, list[i], changes);
    write(KEYS.transactions, list);
    // Side effect: if this is an RSVP deposit being verified, bump the RSVP too
    if (changes.status === 'verified' && list[i].rsvpId) {
      const rsvpPaid = list.filter(x => x.rsvpId === list[i].rsvpId && x.status === 'verified')
        .reduce((s, x) => s + x.amount, 0);
      updateRSVP(list[i].rsvpId, { amountPaid: rsvpPaid, status: 'verified' });
    }
    return list[i];
  }

  // ── Bookings ───────────────────────────────────────────
  function listBookings(eventId) {
    const all = read(KEYS.bookings);
    return eventId ? all.filter(b => b.eventId === eventId) : all;
  }
  function createBooking(data) {
    const list = read(KEYS.bookings);
    const b = Object.assign({
      id: uid('book'),
      createdAt: Date.now(),
      status: 'pending_verification'
    }, data);
    list.push(b);
    write(KEYS.bookings, list);
    return b;
  }
  function updateBooking(id, changes) {
    const list = read(KEYS.bookings);
    const i = list.findIndex(b => b.id === id);
    if (i < 0) return null;
    list[i] = Object.assign({}, list[i], changes);
    write(KEYS.bookings, list);
    return list[i];
  }

  // ── Payouts ────────────────────────────────────────────
  function listPayouts(filter) {
    const all = read(KEYS.payouts);
    if (!filter) return all;
    return all.filter(p => Object.keys(filter).every(k => p[k] === filter[k]));
  }
  function createPayout(data) {
    const list = read(KEYS.payouts);
    const p = Object.assign({
      id: uid('payout'),
      createdAt: Date.now(),
      status: 'requested'
    }, data);
    list.push(p);
    write(KEYS.payouts, list);
    return p;
  }
  function updatePayout(id, changes) {
    const list = read(KEYS.payouts);
    const i = list.findIndex(p => p.id === id);
    if (i < 0) return null;
    list[i] = Object.assign({}, list[i], changes);
    write(KEYS.payouts, list);
    return list[i];
  }

  // ── Reminders ──────────────────────────────────────────
  function listReminders(filter) {
    const all = read(KEYS.reminders);
    if (!filter) return all;
    return all.filter(r => Object.keys(filter).every(k => r[k] === filter[k]));
  }
  function createReminder(data) {
    const list = read(KEYS.reminders);
    // Dedupe: skip if same {eventId, rsvpId, milestoneId, kind} already queued
    const dup = list.find(r =>
      r.eventId === data.eventId && r.rsvpId === data.rsvpId &&
      r.milestoneId === data.milestoneId && r.kind === data.kind &&
      r.status !== 'sent' && r.status !== 'dismissed'
    );
    if (dup) return dup;
    const r = Object.assign({
      id: uid('rem'),
      createdAt: Date.now(),
      status: 'queued'
    }, data);
    list.push(r);
    write(KEYS.reminders, list);
    return r;
  }
  function updateReminder(id, changes) {
    const list = read(KEYS.reminders);
    const i = list.findIndex(r => r.id === id);
    if (i < 0) return null;
    list[i] = Object.assign({}, list[i], changes);
    write(KEYS.reminders, list);
    return list[i];
  }

  // ── Comments / Q&A ─────────────────────────────────────
  function listComments(eventId) {
    const all = read(KEYS.comments);
    return eventId ? all.filter(c => c.eventId === eventId) : all;
  }
  function createComment(data) {
    const list = read(KEYS.comments);
    const c = Object.assign({
      id: uid('cm'), createdAt: Date.now(),
      parentId: null, reactions: 0
    }, data);
    list.push(c);
    write(KEYS.comments, list);
    return c;
  }
  function reactToComment(id) {
    const list = read(KEYS.comments);
    const i = list.findIndex(c => c.id === id);
    if (i < 0) return null;
    list[i].reactions = (list[i].reactions || 0) + 1;
    write(KEYS.comments, list);
    return list[i];
  }

  // ── Waitlist ───────────────────────────────────────────
  function listWaitlist(eventId) {
    const all = read(KEYS.waitlist);
    return eventId ? all.filter(w => w.eventId === eventId) : all;
  }
  function joinWaitlist(eventId, payer) {
    const list = read(KEYS.waitlist);
    if (list.find(w => w.eventId === eventId && w.email === payer.email)) return null;
    const position = list.filter(w => w.eventId === eventId).length + 1;
    const w = {
      id: uid('wl'), eventId: eventId,
      name: payer.name, email: payer.email, phone: payer.phone || '',
      position: position, createdAt: Date.now(), status: 'waiting'
    };
    list.push(w);
    write(KEYS.waitlist, list);
    return w;
  }
  // Auto-promote: if RSVP count drops below capacity and waitlist is non-empty,
  // mark first position 'promoted' so admin/organiser can trigger the real invite.
  function promoteNextFromWaitlist(eventId) {
    const ev = eventById(eventId);
    if (!ev) return null;
    const live = listRSVPs(eventId).filter(r => r.status !== 'refunded' && r.status !== 'cancelled').length;
    if (live >= (ev.maxGuests || Infinity)) return null;
    const waiters = listWaitlist(eventId).filter(w => w.status === 'waiting')
      .sort((a, b) => a.position - b.position);
    if (!waiters.length) return null;
    const list = read(KEYS.waitlist);
    const idx = list.findIndex(x => x.id === waiters[0].id);
    list[idx].status = 'promoted';
    list[idx].promotedAt = Date.now();
    write(KEYS.waitlist, list);
    return list[idx];
  }

  // ── Ratings ────────────────────────────────────────────
  function listRatings(eventId) {
    const all = read(KEYS.ratings);
    return eventId ? all.filter(r => r.eventId === eventId) : all;
  }
  function submitRating(data) {
    const list = read(KEYS.ratings);
    // One rating per (eventId, email)
    const dup = list.find(r => r.eventId === data.eventId && r.email === data.email);
    if (dup) {
      dup.stars = data.stars;
      dup.text = data.text;
      dup.updatedAt = Date.now();
      write(KEYS.ratings, list);
      return dup;
    }
    const r = Object.assign({
      id: uid('rt'), createdAt: Date.now()
    }, data);
    list.push(r);
    write(KEYS.ratings, list);
    return r;
  }
  function organiserRatingStats(email) {
    const events = eventsByOrganiser(email);
    const eventIds = events.map(e => e.id);
    const allRatings = read(KEYS.ratings).filter(r => eventIds.includes(r.eventId));
    if (!allRatings.length) return { avg: 0, count: 0 };
    const sum = allRatings.reduce((s, r) => s + Number(r.stars || 0), 0);
    return { avg: sum / allRatings.length, count: allRatings.length };
  }

  // ── Referrals ──────────────────────────────────────────
  function listReferrals(filter) {
    const all = read(KEYS.referrals);
    if (!filter) return all;
    return all.filter(r => Object.keys(filter).every(k => r[k] === filter[k]));
  }
  function recordReferral(data) {
    const list = read(KEYS.referrals);
    const r = Object.assign({
      id: uid('ref'), createdAt: Date.now(), converted: false
    }, data);
    list.push(r);
    write(KEYS.referrals, list);
    return r;
  }
  function convertReferral(email, eventId) {
    const list = read(KEYS.referrals);
    // Find latest non-converted referral click for this event + visitor
    const match = list.slice().reverse().find(r =>
      r.eventId === eventId && r.visitorEmail === email && !r.converted
    );
    if (!match) return null;
    match.converted = true;
    match.convertedAt = Date.now();
    write(KEYS.referrals, list);
    return match;
  }
  function referralStats(refCode) {
    const clicks = listReferrals({ refCode: refCode });
    return {
      clicks: clicks.length,
      converted: clicks.filter(r => r.converted).length
    };
  }

  // ── Analytics (funnel) ─────────────────────────────────
  function logEvent(kind, data) {
    const list = read(KEYS.analytics);
    list.push({
      id: uid('a'), kind: kind, at: Date.now(),
      data: data || {}
    });
    // Cap at 2000 to prevent bloat
    if (list.length > 2000) list.splice(0, list.length - 2000);
    write(KEYS.analytics, list);
  }
  function funnelStats() {
    const events = read(KEYS.analytics);
    const views = events.filter(e => e.kind === 'event_view').length;
    const modals = events.filter(e => e.kind === 'rsvp_open').length;
    const paidClicks = events.filter(e => e.kind === 'rsvp_paynow').length;
    const confirms = events.filter(e => e.kind === 'rsvp_confirmed').length;
    return { views: views, rsvpOpens: modals, paynowSteps: paidClicks, confirms: confirms };
  }

  // ── Lifecycle: escrow release ──────────────────────────
  // All verified transactions for an event are marked 'released',
  // meaning the escrow is conceptually available to the organiser
  // (a subsequent payout request moves the money out).
  function releaseEscrow(eventId, note) {
    const txns = read(KEYS.transactions);
    let changed = 0;
    txns.forEach(t => {
      if (t.eventId === eventId && t.status === 'verified') {
        t.status = 'released';
        t.releasedAt = Date.now();
        if (note) t.releaseNote = note;
        changed++;
      }
    });
    write(KEYS.transactions, txns);

    // Flip event status to 'released' so dashboards can filter
    const ev = eventById(eventId);
    if (ev && ev.status !== 'released') {
      updateEvent(eventId, { status: 'released', releasedAt: Date.now() });
    }
    return changed;
  }

  // Sweep: any event with date strictly before today → auto-release.
  // Called once on load. Idempotent.
  function autoReleaseIfDue() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const released = [];
    listEvents().forEach(ev => {
      if (!ev.date || ev.status === 'cancelled' || ev.status === 'released') return;
      const evDate = new Date(ev.date + 'T00:00:00');
      const releaseAfter = new Date(evDate); releaseAfter.setDate(releaseAfter.getDate() + 1);
      if (today >= releaseAfter) {
        const n = releaseEscrow(ev.id, 'Auto-released on ' + today.toISOString().slice(0, 10));
        if (n) released.push({ eventId: ev.id, count: n });
      }
    });
    return released;
  }

  // ── Lifecycle: refund ──────────────────────────────────
  // Refund a single RSVP: creates a negative 'refund' transaction,
  // flips RSVP to 'refunded', and decreases escrow balance.
  function refundRSVP(rsvpId, opts) {
    opts = opts || {};
    const rsvps = read(KEYS.rsvps);
    const r = rsvps.find(x => x.id === rsvpId);
    if (!r) return null;
    // Only refund what was already verified for this RSVP
    const txns = read(KEYS.transactions);
    const verifiedForRSVP = txns.filter(t => t.rsvpId === rsvpId && t.status === 'verified');
    if (!verifiedForRSVP.length && !opts.allowEmpty) return null;
    const refundAmount = opts.amount != null
      ? Number(opts.amount)
      : verifiedForRSVP.reduce((s, t) => s + Number(t.amount || 0), 0);

    const refundTxn = createTransaction({
      type: 'refund',
      amount: refundAmount,
      reference: 'TC-REFUND-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      eventId: r.eventId,
      rsvpId: rsvpId,
      reason: opts.reason || 'Admin-issued refund',
      status: 'verified', // refund is verified immediately when issued
      payerName: r.name,
      payerEmail: r.email
    });
    // Flip original verified txns to 'refunded' so escrow balance excludes them
    verifiedForRSVP.forEach(t => updateTransaction(t.id, { status: 'refunded', refundedAt: Date.now() }));
    // Flip RSVP status
    updateRSVP(rsvpId, { status: 'refunded', refundedAt: Date.now(), amountPaid: 0 });
    return refundTxn;
  }

  // Cancel an event and refund all verified RSVPs.
  function cancelEventAndRefundAll(eventId, reason) {
    const ev = eventById(eventId);
    if (!ev) return null;
    updateEvent(eventId, { status: 'cancelled', cancelledAt: Date.now(), cancelReason: reason || '' });
    const rsvps = listRSVPs(eventId).filter(r => r.status !== 'refunded' && r.status !== 'cancelled');
    let refunded = 0;
    rsvps.forEach(r => {
      const t = refundRSVP(r.id, { reason: 'Event cancelled: ' + (reason || 'no reason given') });
      if (t) refunded++;
    });
    return { eventId: eventId, refunded: refunded };
  }

  // ── Lifecycle: payout ──────────────────────────────────
  // Organiser requests payout of released escrow for an event.
  function requestPayout(eventId, opts) {
    opts = opts || {};
    const ev = eventById(eventId);
    if (!ev) return null;
    // Sum of 'released' transactions minus previous payouts for this event
    const txns = read(KEYS.transactions);
    const releasedSum = txns
      .filter(t => t.eventId === eventId && t.status === 'released' && t.type !== 'refund')
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const previousPayouts = listPayouts({ eventId: eventId })
      .filter(p => p.status === 'sent' || p.status === 'approved')
      .reduce((s, p) => s + Number(p.amount || 0), 0);
    const available = Math.max(0, releasedSum - previousPayouts);
    if (available <= 0) return null;

    return createPayout({
      eventId: eventId,
      amount: opts.amount != null ? Math.min(Number(opts.amount), available) : available,
      paynowTo: opts.paynowTo || (ev.organiser && ev.organiser.paynow) || '',
      requestedBy: ev.organiser || currentUser(),
      status: 'requested',
      reference: 'TC-PAYOUT-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      note: opts.note || ''
    });
  }
  function approvePayout(id, actor) {
    return updatePayout(id, {
      status: 'approved',
      approvedAt: Date.now(),
      approvedBy: actor || 'admin'
    });
  }
  function markPayoutSent(id, actor) {
    return updatePayout(id, {
      status: 'sent',
      sentAt: Date.now(),
      sentBy: actor || 'admin'
    });
  }
  function rejectPayout(id, reason) {
    return updatePayout(id, {
      status: 'rejected',
      rejectedAt: Date.now(),
      rejectReason: reason || ''
    });
  }

  // ── Aggregates ─────────────────────────────────────────
  function eventStats(eventId) {
    const rr = listRSVPs(eventId);
    const txns = listTransactions().filter(t => t.eventId === eventId);
    const verified = txns.filter(t => t.status === 'verified' && t.type !== 'refund');
    const released = txns.filter(t => t.status === 'released' && t.type !== 'refund');
    const refunds = txns.filter(t => t.type === 'refund' && t.status === 'verified');
    const pending = txns.filter(t => t.status === 'pending_verification');
    const collected = verified.reduce((s, t) => s + Number(t.amount || 0), 0);
    const releasedAmt = released.reduce((s, t) => s + Number(t.amount || 0), 0);
    const refundedAmt = refunds.reduce((s, t) => s + Number(t.amount || 0), 0);
    const pendingAmount = pending.reduce((s, t) => s + Number(t.amount || 0), 0);
    const payoutsSent = listPayouts({ eventId: eventId }).filter(p => p.status === 'sent')
      .reduce((s, p) => s + Number(p.amount || 0), 0);
    return {
      rsvpCount: rr.length,
      verifiedRsvps: rr.filter(r => r.status === 'verified').length,
      collected: collected,
      released: releasedAmt,
      refunded: refundedAmt,
      escrowAvailable: Math.max(0, releasedAmt - payoutsSent),
      pendingAmount: pendingAmount,
      txnCount: txns.length
    };
  }

  function platformStats() {
    const txns = read(KEYS.transactions);
    const verified = txns.filter(t => t.status === 'verified' && t.type !== 'refund');
    const released = txns.filter(t => t.status === 'released' && t.type !== 'refund');
    const refunds = txns.filter(t => t.status === 'verified' && t.type === 'refund');
    const pending = txns.filter(t => t.status === 'pending_verification');
    const payoutsSent = read(KEYS.payouts).filter(p => p.status === 'sent').reduce((s, p) => s + Number(p.amount || 0), 0);

    const escrowBalance = verified.reduce((s, t) => s + Number(t.amount || 0), 0)
                         - refunds.reduce((s, t) => s + Number(t.amount || 0), 0);
    const releasedBalance = released.reduce((s, t) => s + Number(t.amount || 0), 0) - payoutsSent;

    return {
      events: listEvents().length,
      rsvps: read(KEYS.rsvps).length,
      bookings: read(KEYS.bookings).length,
      escrowBalance: escrowBalance,
      releasedBalance: releasedBalance,
      pendingVerification: pending.length,
      pendingAmount: pending.reduce((s, t) => s + Number(t.amount || 0), 0),
      pendingPayouts: read(KEYS.payouts).filter(p => p.status === 'requested').length,
      pendingReminders: read(KEYS.reminders).filter(r => r.status === 'queued').length
    };
  }

  // ── Demo seed (only on first run, or if seed version bumped) ───
  function seedIfEmpty() {
    const currentVersion = localStorage.getItem(KEYS.seededVersion);
    if (localStorage.getItem(KEYS.seeded) && currentVersion === SEED_VERSION) return;
    // Fresh seed or version upgrade: wipe and reseed
    if (currentVersion && currentVersion !== SEED_VERSION) {
      [KEYS.events, KEYS.rsvps, KEYS.transactions, KEYS.bookings, KEYS.payouts, KEYS.reminders]
        .forEach(k => localStorage.removeItem(k));
    }

    const events = [
      {
        id: 'evt-yacht',
        slug: 'sunset-yacht-party',
        title: 'Sunset Yacht Party',
        emoji: '⛵',
        category: 'yacht',
        description: 'Join us for the ultimate sunset yacht experience cruising along the Singapore coastline. We\'ll board at ONE°15 Marina and sail past the city skyline as the sun goes down.',
        date: addDaysISO(7),
        time: '17:00',
        location: 'ONE°15 Marina, Sentosa Cove',
        costPerPerson: 180,
        depositAmount: 50,
        maxGuests: 25,
        milestones: [
          { id: 'm1', label: 'Deposit', amount: 50, dueOffset: 0 },
          { id: 'm2', label: '2nd Payment', amount: 65, dueOffset: 14 },
          { id: 'm3', label: 'Final Payment', amount: 65, dueOffset: 2 }
        ],
        providers: [
          { name: 'DJ Maxine', amount: 300 },
          { name: 'Chef Rajan', amount: 625 },
          { name: 'Capture Films', amount: 500 }
        ],
        organiser: { name: 'Jamie Ong', email: 'jamie@thecommons.asia' },
        status: 'live',
        createdAt: Date.now() - 86400000 * 10
      },
      {
        id: 'evt-festival',
        slug: 'neon-nights-festival',
        title: 'Neon Nights Music Festival',
        emoji: '🎪',
        category: 'festival',
        description: 'A one-night indie music festival on Sentosa beach. Three stages, 12 acts, food trucks, and open-air bar.',
        date: addDaysISO(21),
        time: '18:00',
        location: 'Siloso Beach, Sentosa',
        costPerPerson: 95,
        depositAmount: 40,
        maxGuests: 50,
        milestones: [
          { id: 'm1', label: 'Deposit', amount: 40, dueOffset: 0 },
          { id: 'm2', label: 'Final Payment', amount: 55, dueOffset: 7 }
        ],
        providers: [],
        organiser: { name: 'Amara Lim', email: 'amara@thecommons.asia' },
        status: 'live',
        createdAt: Date.now() - 86400000 * 7
      },
      {
        id: 'evt-hike',
        slug: 'macritchie-sunrise-hike',
        title: 'MacRitchie Sunrise Hike + Brunch',
        emoji: '🥾',
        category: 'hike',
        description: '6am start at MacRitchie carpark, hike the TreeTop trail loop, finish with brunch at Brewerkz.',
        date: addDaysISO(14),
        time: '06:00',
        location: 'MacRitchie Reservoir',
        costPerPerson: 35,
        depositAmount: 35,
        maxGuests: 15,
        milestones: [
          { id: 'm1', label: 'Full Payment', amount: 35, dueOffset: 0 }
        ],
        providers: [],
        organiser: { name: 'Wei Ling', email: 'weiling@thecommons.asia' },
        status: 'live',
        createdAt: Date.now() - 86400000 * 3
      },
      {
        id: 'evt-bali',
        slug: 'bali-weekend-escape',
        title: 'Bali Weekend Escape',
        emoji: '🌴',
        category: 'travel',
        description: '3-day villa stay in Canggu. Private pool, group yoga, surf lesson, communal dinners cooked by a local chef.',
        date: addDaysISO(45),
        time: '07:30',
        location: 'Canggu, Bali',
        costPerPerson: 620,
        depositAmount: 200,
        maxGuests: 12,
        milestones: [
          { id: 'm1', label: 'Deposit', amount: 200, dueOffset: 0 },
          { id: 'm2', label: '2nd Payment', amount: 210, dueOffset: 30 },
          { id: 'm3', label: 'Final Payment', amount: 210, dueOffset: 7 }
        ],
        providers: [],
        organiser: { name: 'Jamie Ong', email: 'jamie@thecommons.asia' },
        status: 'live',
        createdAt: Date.now() - 86400000 * 14
      },
      {
        id: 'evt-cooking',
        slug: 'peranakan-cooking-class',
        title: 'Peranakan Cooking Class',
        emoji: '🍲',
        category: 'food',
        description: 'Hands-on Peranakan cooking class with Chef Auntie Nona. Learn ayam buah keluak, babi pongteh, and kueh pie tee. Dinner included.',
        date: addDaysISO(10),
        time: '17:30',
        location: 'Joo Chiat Heritage Kitchen',
        costPerPerson: 120,
        depositAmount: 60,
        maxGuests: 10,
        milestones: [
          { id: 'm1', label: 'Deposit', amount: 60, dueOffset: 0 },
          { id: 'm2', label: 'Final Payment', amount: 60, dueOffset: 3 }
        ],
        providers: [],
        organiser: { name: 'Marcus Tan', email: 'marcus@thecommons.asia' },
        status: 'live',
        createdAt: Date.now() - 86400000 * 5
      },
      {
        id: 'evt-run',
        slug: 'east-coast-5k-sunrise',
        title: 'East Coast 5K Sunrise Run',
        emoji: '🏃',
        category: 'sport',
        description: '5km casual run along East Coast Park, finishing with coffee and kaya toast at a local hawker. Pacers available for all fitness levels.',
        date: addDaysISO(5),
        time: '06:30',
        location: 'East Coast Park, Area D',
        costPerPerson: 20,
        depositAmount: 20,
        maxGuests: 30,
        milestones: [
          { id: 'm1', label: 'Full Payment', amount: 20, dueOffset: 0 }
        ],
        providers: [],
        organiser: { name: 'Amara Lim', email: 'amara@thecommons.asia' },
        status: 'live',
        createdAt: Date.now() - 86400000 * 2
      },
      // A past event so auto-release + payout can be demoed out of the box
      {
        id: 'evt-past',
        slug: 'botanic-gardens-picnic',
        title: 'Botanic Gardens Sunset Picnic',
        emoji: '🧺',
        category: 'party',
        description: 'Bring a blanket. Cheese, wine, strawberries, and live acoustic guitar by the lake.',
        date: addDaysISO(-3),
        time: '17:30',
        location: 'Singapore Botanic Gardens, Lawn G',
        costPerPerson: 45,
        depositAmount: 20,
        maxGuests: 20,
        milestones: [
          { id: 'm1', label: 'Deposit', amount: 20, dueOffset: 0 },
          { id: 'm2', label: 'Final Payment', amount: 25, dueOffset: 2 }
        ],
        providers: [],
        organiser: { name: 'Jamie Ong', email: 'jamie@thecommons.asia' },
        status: 'live',
        createdAt: Date.now() - 86400000 * 14
      }
    ];
    write(KEYS.events, events);

    // Seed RSVPs + matching deposit transactions for the yacht event (18 seats, varied state)
    const rsvpsSeed = [];
    const txnsSeed = [];
    const attendees = [
      { name: 'Wei Jie', email: 'weijie@example.com', verified: true },
      { name: 'Priya Kumar', email: 'priya@example.com', verified: true },
      { name: 'Sarah Koh', email: 'sarah@example.com', verified: true },
      { name: 'Dan Rajan', email: 'dan@example.com', verified: true },
      { name: 'Mei Ling', email: 'mei@example.com', verified: true },
      { name: 'Hafiz Rahman', email: 'hafiz@example.com', verified: true },
      { name: 'Chloe Lee', email: 'chloe@example.com', verified: true },
      { name: 'Javier Tan', email: 'javier@example.com', verified: true },
      { name: 'Nabila Iskandar', email: 'nabila@example.com', verified: true },
      { name: 'Ryan Phua', email: 'ryan@example.com', verified: true },
      { name: 'Hui Min', email: 'huimin@example.com', verified: true },
      { name: 'Alex Oon', email: 'alex@example.com', verified: true },
      { name: 'Siti Nurhaliza', email: 'siti@example.com', verified: true },
      { name: 'Marcus Lim', email: 'marcuslim@example.com', verified: true },
      { name: 'Jenn Yeo', email: 'jenn@example.com', verified: true },
      { name: 'Kevin Ng', email: 'kevin@example.com', verified: true },
      { name: 'Tricia Wong', email: 'tricia@example.com', verified: false },
      { name: 'Aaron Goh', email: 'aaron@example.com', verified: false }
    ];
    attendees.forEach((a, i) => {
      const rid = 'rsvp-yacht-' + i;
      const tid = 'txn-yacht-' + i;
      rsvpsSeed.push({
        id: rid, eventId: 'evt-yacht',
        name: a.name, email: a.email, phone: '',
        createdAt: Date.now() - (86400000 * (10 - i * 0.3)),
        status: a.verified ? 'verified' : 'pending_verification',
        amountPaid: a.verified ? 50 : 0
      });
      txnsSeed.push({
        id: tid, type: 'rsvp_deposit', amount: 50,
        reference: 'TC-RSVP-260422-' + String(1000 + i).slice(1),
        eventId: 'evt-yacht', rsvpId: rid, milestoneId: 'm1',
        createdAt: Date.now() - (86400000 * (10 - i * 0.3)),
        status: a.verified ? 'verified' : 'pending_verification',
        payerName: a.name, payerEmail: a.email
      });
    });

    // Seed a couple of RSVPs for festival + hike so dashboards are non-empty
    rsvpsSeed.push({
      id: 'rsvp-fest-1', eventId: 'evt-festival',
      name: 'Samantha Yeo', email: 'sam@example.com', phone: '',
      createdAt: Date.now() - 86400000 * 2, status: 'verified', amountPaid: 40
    });
    txnsSeed.push({
      id: 'txn-fest-1', type: 'rsvp_deposit', amount: 40,
      reference: 'TC-RSVP-260420-AZ3', eventId: 'evt-festival', rsvpId: 'rsvp-fest-1',
      milestoneId: 'm1',
      createdAt: Date.now() - 86400000 * 2, status: 'verified',
      payerName: 'Samantha Yeo', payerEmail: 'sam@example.com'
    });
    rsvpsSeed.push({
      id: 'rsvp-hike-1', eventId: 'evt-hike',
      name: 'Tom Park', email: 'tom@example.com', phone: '',
      createdAt: Date.now() - 86400000 * 1, status: 'verified', amountPaid: 35
    });
    txnsSeed.push({
      id: 'txn-hike-1', type: 'rsvp_deposit', amount: 35,
      reference: 'TC-RSVP-260421-B4K', eventId: 'evt-hike', rsvpId: 'rsvp-hike-1',
      milestoneId: 'm1',
      createdAt: Date.now() - 86400000 * 1, status: 'verified',
      payerName: 'Tom Park', payerEmail: 'tom@example.com'
    });

    // Seed a booking
    const bookingsSeed = [
      {
        id: 'book-1', eventId: 'evt-yacht',
        providerName: 'DJ Maxine', providerCategory: 'DJ',
        amount: 300, reference: 'TC-BOOK-260418-DJX1',
        notes: 'Sunset deep house set, 2 hours.',
        createdAt: Date.now() - 86400000 * 8,
        status: 'verified', payerName: 'Jamie Ong', payerEmail: 'jamie@thecommons.asia'
      }
    ];

    // Write everything
    // Past event: 8 fully verified deposits + final payments so it's ready to release
    for (let i = 0; i < 8; i++) {
      const rid = 'rsvp-past-' + i;
      rsvpsSeed.push({
        id: rid, eventId: 'evt-past',
        name: ['Gabriel Lim','Yasmin Iskandar','Derek Chua','Pei Wen','Matt Tan','Rohan Das','Serene Ho','Iris Ng'][i],
        email: ['gabe','yasmin','derek','peiwen','matt','rohan','serene','iris'][i] + '@example.com',
        phone: '',
        createdAt: Date.now() - 86400000 * 20 + i * 3600000,
        status: 'verified', amountPaid: 45
      });
      txnsSeed.push({
        id: 'txn-past-d-' + i, type: 'rsvp_deposit', amount: 20,
        reference: 'TC-RSVP-260410-P' + i + 'D',
        eventId: 'evt-past', rsvpId: rid, milestoneId: 'm1',
        createdAt: Date.now() - 86400000 * 20 + i * 3600000,
        status: 'verified', payerName: rsvpsSeed[rsvpsSeed.length - 1].name,
        payerEmail: rsvpsSeed[rsvpsSeed.length - 1].email
      });
      txnsSeed.push({
        id: 'txn-past-f-' + i, type: 'rsvp_milestone', amount: 25,
        reference: 'TC-RSVP-260417-P' + i + 'F',
        eventId: 'evt-past', rsvpId: rid, milestoneId: 'm2',
        createdAt: Date.now() - 86400000 * 7 + i * 3600000,
        status: 'verified', payerName: rsvpsSeed[rsvpsSeed.length - 1].name,
        payerEmail: rsvpsSeed[rsvpsSeed.length - 1].email
      });
    }

    const allRsvps = read(KEYS.rsvps).concat(rsvpsSeed);
    const allTxns = read(KEYS.transactions).concat(txnsSeed);
    const allBookings = read(KEYS.bookings).concat(bookingsSeed);
    write(KEYS.rsvps, allRsvps);
    write(KEYS.transactions, allTxns);
    write(KEYS.bookings, allBookings);
    write(KEYS.payouts, []);
    write(KEYS.reminders, []);
    write(KEYS.analytics, []);
    write(KEYS.referrals, []);

    // Seed a few comments on the yacht event so the Q&A tab isn't empty.
    const commentsSeed = [
      { id: 'cm-1', eventId: 'evt-yacht', authorName: 'Jamie Ong', authorEmail: 'jamie@thecommons.asia', isOrganiser: true,
        text: 'Meeting point confirmed: ONE°15 Marina jetty A3. Please arrive 15 min early for the safety brief!',
        createdAt: Date.now() - 86400000 * 4, parentId: null, reactions: 7 },
      { id: 'cm-2', eventId: 'evt-yacht', authorName: 'Priya Kumar', authorEmail: 'priya@example.com', isOrganiser: false,
        text: 'Any vegetarian BBQ options? Asking for two of us.',
        createdAt: Date.now() - 86400000 * 3, parentId: null, reactions: 2 },
      { id: 'cm-3', eventId: 'evt-yacht', authorName: 'Jamie Ong', authorEmail: 'jamie@thecommons.asia', isOrganiser: true,
        text: 'Yes — grilled portobello + haloumi skewers + chef Rajan is also prepping paneer tikka. DM dietary notes.',
        createdAt: Date.now() - 86400000 * 2, parentId: 'cm-2', reactions: 4 }
    ];
    write(KEYS.comments, commentsSeed);

    // Seed a couple of completed-event ratings for past event so organiser
    // rating stats are non-zero on first load.
    const ratingsSeed = [
      { id: 'rt-1', eventId: 'evt-past', email: 'gabe@example.com', name: 'Gabriel Lim',
        stars: 5, text: 'Perfect golden hour. The picnic spread was thoughtful.', createdAt: Date.now() - 86400000 * 2 },
      { id: 'rt-2', eventId: 'evt-past', email: 'yasmin@example.com', name: 'Yasmin Iskandar',
        stars: 5, text: 'Jamie always runs a tight ship. Already signed up for the next one.', createdAt: Date.now() - 86400000 * 1 },
      { id: 'rt-3', eventId: 'evt-past', email: 'derek@example.com', name: 'Derek Chua',
        stars: 4, text: 'Great vibe. Ran 20 min behind schedule but worth it.', createdAt: Date.now() - 86400000 * 2 }
    ];
    write(KEYS.ratings, ratingsSeed);

    // Seed empty waitlist
    write(KEYS.waitlist, []);

    localStorage.setItem(KEYS.seeded, '1');
    localStorage.setItem(KEYS.seededVersion, SEED_VERSION);
  }

  // Auto-seed once DOM is available (no side effects in SSR)
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    seedIfEmpty();
    // Auto-release any past events on every load (idempotent).
    try { autoReleaseIfDue(); } catch (e) { /* noop */ }
  }

  window.TCStore = {
    KEYS: KEYS,
    // users
    currentUser: currentUser, setCurrentUser: setCurrentUser, logout: logout,
    // events
    listEvents: listEvents, eventById: eventById, eventBySlug: eventBySlug,
    findEventParam: findEventParam, createEvent: createEvent, updateEvent: updateEvent,
    eventsByOrganiser: eventsByOrganiser,
    // rsvps
    listRSVPs: listRSVPs, rsvpsByEmail: rsvpsByEmail,
    createRSVP: createRSVP, updateRSVP: updateRSVP,
    // transactions
    listTransactions: listTransactions, createTransaction: createTransaction,
    updateTransaction: updateTransaction,
    // bookings
    listBookings: listBookings, createBooking: createBooking, updateBooking: updateBooking,
    // lifecycle
    releaseEscrow: releaseEscrow, autoReleaseIfDue: autoReleaseIfDue,
    refundRSVP: refundRSVP, cancelEventAndRefundAll: cancelEventAndRefundAll,
    // payouts
    listPayouts: listPayouts, createPayout: createPayout, updatePayout: updatePayout,
    requestPayout: requestPayout, approvePayout: approvePayout,
    markPayoutSent: markPayoutSent, rejectPayout: rejectPayout,
    // reminders
    listReminders: listReminders, createReminder: createReminder, updateReminder: updateReminder,
    // comments
    listComments: listComments, createComment: createComment, reactToComment: reactToComment,
    // waitlist
    listWaitlist: listWaitlist, joinWaitlist: joinWaitlist, promoteNextFromWaitlist: promoteNextFromWaitlist,
    // ratings
    listRatings: listRatings, submitRating: submitRating, organiserRatingStats: organiserRatingStats,
    // referrals
    listReferrals: listReferrals, recordReferral: recordReferral,
    convertReferral: convertReferral, referralStats: referralStats,
    // analytics
    logEvent: logEvent, funnelStats: funnelStats,
    // aggregates
    eventStats: eventStats, platformStats: platformStats,
    // utils
    uid: uid, slugify: slugify, addDaysISO: addDaysISO, todayISO: todayISO,
    // danger: full reset
    resetAll: function () {
      [KEYS.events, KEYS.rsvps, KEYS.bookings, KEYS.transactions, KEYS.payouts,
       KEYS.reminders, KEYS.comments, KEYS.waitlist, KEYS.ratings, KEYS.referrals,
       KEYS.analytics, KEYS.currentUser, KEYS.seeded, KEYS.seededVersion]
        .forEach(k => localStorage.removeItem(k));
      window.dispatchEvent(new CustomEvent('tc:reset'));
    }
  };
})();
