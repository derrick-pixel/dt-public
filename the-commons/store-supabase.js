/* ==========================================================
   THE COMMONS — Supabase adapter (optional)
   ---------------------------------------------------------
   Loads only if ?backend=supabase is in the URL OR the user has
   set window.TC_BACKEND = 'supabase' before this script runs.
   Replaces window.TCStore with a Supabase-backed implementation
   that exposes the same public API as store.js.

   Setup:
     1. Create a Supabase project.
     2. Run the SQL in BACKEND.md to create the schema.
     3. Set TC_SUPABASE_URL + TC_SUPABASE_ANON_KEY below (or
        expose them via a <script>window.TC_SUPABASE_URL=…</script>
        tag before this file loads).
     4. Include @supabase/supabase-js before this file:
        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

   Until step 3 is done, this file is a no-op (store.js wins).
   ========================================================== */

(function () {
  'use strict';

  const TC_SUPABASE_URL = (typeof window !== 'undefined' && window.TC_SUPABASE_URL)
    || 'REPLACE_WITH_YOUR_SUPABASE_URL';
  const TC_SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.TC_SUPABASE_ANON_KEY)
    || 'REPLACE_WITH_YOUR_ANON_KEY';

  function _enabled() {
    const url = new URLSearchParams(location.search).get('backend');
    const flag = (typeof window !== 'undefined' && window.TC_BACKEND);
    return (url === 'supabase' || flag === 'supabase') &&
           TC_SUPABASE_URL !== 'REPLACE_WITH_YOUR_SUPABASE_URL' &&
           typeof window.supabase !== 'undefined';
  }

  if (typeof window === 'undefined' || !_enabled()) {
    return; // fall through to the localStorage store
  }

  const sb = window.supabase.createClient(TC_SUPABASE_URL, TC_SUPABASE_ANON_KEY);

  // ── Async helpers wrapped in sync-ish cache so renderers continue
  // to work without rewriting them as async. On first paint, they
  // return an empty list; a background fetch populates the cache and
  // re-renders once loaded.
  const CACHE = { events: [], rsvps: [], transactions: [], bookings: [], payouts: [], reminders: [], comments: [], waitlist: [], ratings: [], currentUser: null };

  async function _hydrate() {
    const tables = ['events', 'rsvps', 'transactions', 'bookings', 'payouts', 'reminders', 'comments', 'waitlist', 'ratings'];
    for (const t of tables) {
      const { data } = await sb.from(t).select('*');
      CACHE[t] = data || [];
    }
    const { data: { user } } = await sb.auth.getUser();
    if (user) CACHE.currentUser = { name: user.user_metadata && user.user_metadata.name || user.email.split('@')[0], email: user.email };
    window.dispatchEvent(new CustomEvent('tc:change', { detail: { backend: 'supabase' } }));
  }

  // CRUD → Supabase, updating the cache optimistically.
  async function _insert(table, row) {
    const { data, error } = await sb.from(table).insert([row]).select().single();
    if (error) throw error;
    CACHE[table].push(data);
    window.dispatchEvent(new CustomEvent('tc:change', { detail: { key: table } }));
    return data;
  }
  async function _update(table, id, patch) {
    const { data, error } = await sb.from(table).update(patch).eq('id', id).select().single();
    if (error) throw error;
    const i = CACHE[table].findIndex(r => r.id === id);
    if (i >= 0) CACHE[table][i] = data;
    window.dispatchEvent(new CustomEvent('tc:change', { detail: { key: table } }));
    return data;
  }

  // Public API — mirrors window.TCStore shape but reads from CACHE.
  const TCSupabaseStore = {
    KEYS: { backend: 'supabase' },

    currentUser: () => CACHE.currentUser,
    setCurrentUser: async (u) => {
      // Real auth: call signInWithOtp instead.
      await sb.auth.signInWithOtp({ email: u.email });
      CACHE.currentUser = u;
      return u;
    },
    logout: async () => { await sb.auth.signOut(); CACHE.currentUser = null; },

    listEvents: () => CACHE.events,
    eventById: (id) => CACHE.events.find(e => e.id === id) || null,
    eventBySlug: (slug) => CACHE.events.find(e => e.slug === slug) || null,
    findEventParam: () => {
      const p = new URLSearchParams(location.search);
      const slug = p.get('slug'), id = p.get('id');
      return slug ? TCSupabaseStore.eventBySlug(slug) : (id ? TCSupabaseStore.eventById(id) : null);
    },
    createEvent: (data) => _insert('events', Object.assign({ slug: (data.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-'), status: 'live' }, data)),
    updateEvent: (id, patch) => _update('events', id, patch),
    eventsByOrganiser: (email) => CACHE.events.filter(e => e.organiser && e.organiser.email === email),

    listRSVPs: (eventId) => eventId ? CACHE.rsvps.filter(r => r.eventId === eventId) : CACHE.rsvps,
    rsvpsByEmail: (email) => CACHE.rsvps.filter(r => r.email === email),
    createRSVP: (data) => _insert('rsvps', data),
    updateRSVP: (id, patch) => _update('rsvps', id, patch),

    listTransactions: (filter) => {
      if (!filter) return CACHE.transactions;
      return CACHE.transactions.filter(t => Object.keys(filter).every(k => t[k] === filter[k]));
    },
    createTransaction: (data) => _insert('transactions', data),
    updateTransaction: (id, patch) => _update('transactions', id, patch),

    listBookings: (eventId) => eventId ? CACHE.bookings.filter(b => b.eventId === eventId) : CACHE.bookings,
    createBooking: (data) => _insert('bookings', data),
    updateBooking: (id, patch) => _update('bookings', id, patch),

    listPayouts: (filter) => {
      if (!filter) return CACHE.payouts;
      return CACHE.payouts.filter(p => Object.keys(filter).every(k => p[k] === filter[k]));
    },
    createPayout: (data) => _insert('payouts', data),
    updatePayout: (id, patch) => _update('payouts', id, patch),
    approvePayout: (id, actor) => _update('payouts', id, { status: 'approved', approved_at: new Date().toISOString() }),
    markPayoutSent: (id, actor) => _update('payouts', id, { status: 'sent', sent_at: new Date().toISOString() }),
    rejectPayout: (id, reason) => _update('payouts', id, { status: 'rejected', reject_reason: reason }),

    listReminders: (filter) => {
      if (!filter) return CACHE.reminders;
      return CACHE.reminders.filter(r => Object.keys(filter).every(k => r[k] === filter[k]));
    },
    createReminder: (data) => _insert('reminders', data),
    updateReminder: (id, patch) => _update('reminders', id, patch),

    listComments: (eventId) => eventId ? CACHE.comments.filter(c => c.eventId === eventId) : CACHE.comments,
    createComment: (data) => _insert('comments', data),
    reactToComment: async (id) => {
      const c = CACHE.comments.find(x => x.id === id);
      return _update('comments', id, { reactions: (c.reactions || 0) + 1 });
    },

    listWaitlist: (eventId) => eventId ? CACHE.waitlist.filter(w => w.eventId === eventId) : CACHE.waitlist,
    joinWaitlist: (eventId, payer) => _insert('waitlist', { eventId, email: payer.email, name: payer.name, status: 'waiting' }),
    promoteNextFromWaitlist: async () => null, // implement server-side if needed

    listRatings: (eventId) => eventId ? CACHE.ratings.filter(r => r.eventId === eventId) : CACHE.ratings,
    submitRating: (data) => _insert('ratings', data),
    organiserRatingStats: (email) => {
      const mineIds = CACHE.events.filter(e => e.organiser && e.organiser.email === email).map(e => e.id);
      const mine = CACHE.ratings.filter(r => mineIds.includes(r.eventId));
      if (!mine.length) return { avg: 0, count: 0 };
      return { avg: mine.reduce((s, r) => s + r.stars, 0) / mine.length, count: mine.length };
    },

    // Referrals + analytics are optional server-side; keep a stub.
    listReferrals: () => [],
    recordReferral: () => null,
    convertReferral: () => null,
    referralStats: () => ({ clicks: 0, converted: 0 }),
    logEvent: () => null,
    funnelStats: () => ({ views: 0, rsvpOpens: 0, paynowSteps: 0, confirms: 0 }),

    // Lifecycle
    releaseEscrow: async (eventId) => {
      await sb.from('transactions').update({ status: 'released' }).eq('event_id', eventId).eq('status', 'verified');
      await sb.from('events').update({ status: 'released' }).eq('id', eventId);
      await _hydrate();
      return true;
    },
    autoReleaseIfDue: async () => [],
    refundRSVP: async (id) => {
      return _update('rsvps', id, { status: 'refunded' });
    },
    cancelEventAndRefundAll: async (id) => _update('events', id, { status: 'cancelled' }),
    requestPayout: async (eventId, opts) => _insert('payouts', {
      event_id: eventId, amount: opts && opts.amount, paynow_to: opts && opts.paynowTo, status: 'requested'
    }),

    eventStats: (id) => {
      const rr = CACHE.rsvps.filter(r => r.eventId === id);
      const tx = CACHE.transactions.filter(t => t.eventId === id);
      const collected = tx.filter(t => t.status === 'verified' && t.type !== 'refund').reduce((s, t) => s + Number(t.amount), 0);
      const released = tx.filter(t => t.status === 'released' && t.type !== 'refund').reduce((s, t) => s + Number(t.amount), 0);
      return { rsvpCount: rr.length, verifiedRsvps: rr.filter(r => r.status === 'verified').length, collected, released, escrowAvailable: released, pendingAmount: 0, txnCount: tx.length, refunded: 0 };
    },
    platformStats: () => {
      const tx = CACHE.transactions;
      const escrowBalance = tx.filter(t => t.status === 'verified' && t.type !== 'refund').reduce((s, t) => s + Number(t.amount), 0);
      return { events: CACHE.events.length, rsvps: CACHE.rsvps.length, bookings: CACHE.bookings.length, escrowBalance, releasedBalance: 0, pendingVerification: 0, pendingAmount: 0, pendingPayouts: 0, pendingReminders: 0 };
    },

    uid: () => 'sb-' + Math.random().toString(36).slice(2, 10),
    slugify: (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    addDaysISO: (d) => { const x = new Date(); x.setDate(x.getDate() + (d || 0)); return x.toISOString().slice(0, 10); },
    todayISO: () => new Date().toISOString().slice(0, 10),

    resetAll: () => { /* server-side only; no-op on client */ }
  };

  // Replace local store with Supabase-backed
  window.TCStore = TCSupabaseStore;
  _hydrate().catch(e => console.error('Supabase hydration failed:', e));

  // Realtime: re-render on any change
  ['events', 'rsvps', 'transactions', 'bookings', 'payouts'].forEach(table => {
    sb.channel('tc-' + table)
      .on('postgres_changes', { event: '*', schema: 'public', table: table }, () => _hydrate())
      .subscribe();
  });
})();
