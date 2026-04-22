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
    currentUser: 'tc:currentUser',
    seeded: 'tc:seeded'
  };

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

  // ── Aggregates ─────────────────────────────────────────
  function eventStats(eventId) {
    const rr = listRSVPs(eventId);
    const txns = listTransactions().filter(t => t.eventId === eventId);
    const verified = txns.filter(t => t.status === 'verified');
    const pending = txns.filter(t => t.status === 'pending_verification');
    const collected = verified.reduce((s, t) => s + Number(t.amount || 0), 0);
    const pendingAmount = pending.reduce((s, t) => s + Number(t.amount || 0), 0);
    return {
      rsvpCount: rr.length,
      verifiedRsvps: rr.filter(r => r.status === 'verified').length,
      collected: collected,
      pendingAmount: pendingAmount,
      txnCount: txns.length
    };
  }

  function platformStats() {
    const txns = read(KEYS.transactions);
    const verified = txns.filter(t => t.status === 'verified');
    const pending = txns.filter(t => t.status === 'pending_verification');
    return {
      events: listEvents().length,
      rsvps: read(KEYS.rsvps).length,
      bookings: read(KEYS.bookings).length,
      escrowBalance: verified.reduce((s, t) => s + (t.type === 'refund' ? -t.amount : Number(t.amount || 0)), 0),
      pendingVerification: pending.length,
      pendingAmount: pending.reduce((s, t) => s + Number(t.amount || 0), 0)
    };
  }

  // ── Demo seed (only on first run) ──────────────────────
  function seedIfEmpty() {
    if (localStorage.getItem(KEYS.seeded)) return;
    if (listEvents().length > 0) { localStorage.setItem(KEYS.seeded, '1'); return; }

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
        eventId: 'evt-yacht', rsvpId: rid,
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
    const allRsvps = read(KEYS.rsvps).concat(rsvpsSeed);
    const allTxns = read(KEYS.transactions).concat(txnsSeed);
    const allBookings = read(KEYS.bookings).concat(bookingsSeed);
    write(KEYS.rsvps, allRsvps);
    write(KEYS.transactions, allTxns);
    write(KEYS.bookings, allBookings);

    localStorage.setItem(KEYS.seeded, '1');
  }

  // Auto-seed once DOM is available (no side effects in SSR)
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    seedIfEmpty();
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
    // aggregates
    eventStats: eventStats, platformStats: platformStats,
    // utils
    uid: uid, slugify: slugify, addDaysISO: addDaysISO, todayISO: todayISO,
    // danger: full reset
    resetAll: function () {
      [KEYS.events, KEYS.rsvps, KEYS.bookings, KEYS.transactions, KEYS.currentUser, KEYS.seeded]
        .forEach(k => localStorage.removeItem(k));
      window.dispatchEvent(new CustomEvent('tc:reset'));
    }
  };
})();
