// Elitez ESOP — Supabase client + sync engine.
// Source of truth: Supabase. localStorage is a read-through cache.
// On disagreement, Supabase wins (bump CACHE_VERSION on any schema change).
(function () {
  const CACHE_PREFIX = "elitez_esop_cache_v4_";  // bump on schema change
  const CACHE_VERSION = 4;

  const SUPA_URL = window.ESOP_CONFIG?.supabase_url;
  const SUPA_KEY = window.ESOP_CONFIG?.supabase_anon_key;
  if (!SUPA_URL || !SUPA_KEY || SUPA_URL.includes("<project-ref>")) {
    console.warn("ESOPSupa: ESOP_CONFIG not set; running without backend.");
    return;
  }
  if (!window.supabase || !window.supabase.createClient) {
    console.error("ESOPSupa: @supabase/supabase-js not loaded.");
    return;
  }

  const supa = window.supabase.createClient(SUPA_URL, SUPA_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });

  const subs = new Set();

  // DATA-P0-3 fix: cache must be scoped by user id, otherwise the events
  // an admin viewed yesterday remain on disk and get hydrated when a
  // holder logs into the same browser today (RLS only protects fresh
  // server fetches, not cached blobs). Cache key includes auth uid; on
  // sign-out we proactively purge it.
  let currentUserId = null;
  function cacheKey() {
    return CACHE_PREFIX + (currentUserId || "anon");
  }
  function loadCache() {
    try {
      const c = JSON.parse(localStorage.getItem(cacheKey()));
      if (!c || c.version !== CACHE_VERSION) return { events: [], cursor: null };
      return c;
    } catch { return { events: [], cursor: null }; }
  }
  function saveCache(c) {
    localStorage.setItem(cacheKey(), JSON.stringify({ ...c, version: CACHE_VERSION }));
  }
  function purgeAllCaches() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) localStorage.removeItem(k);
    }
  }

  // Track user id from auth state. When it changes, wipe any cache that
  // wasn't ours so a shared-machine handoff doesn't leak.
  supa.auth.getSession().then(({ data }) => {
    currentUserId = data?.session?.user?.id || null;
  });
  supa.auth.onAuthStateChange((event, session) => {
    const newUid = session?.user?.id || null;
    if (event === "SIGNED_OUT" || newUid !== currentUserId) {
      // Different user (or none) — drop every legacy cache.
      purgeAllCaches();
    }
    currentUserId = newUid;
  });

  // DATA-P0-2 fix: paginate by seq (bigserial, strictly monotonic) instead
  // of `gt(id)` under `order by at`. With random-UUID ids, the previous
  // cursor would skip events whose id sorted lower than the cursor —
  // pagination became non-deterministic once tables grew past one batch.
  //
  // SEC-P1 fix (migration 0021): read from events_for_holders when the
  // user is a holder. The view strips counterparty fields from trade
  // payloads + nulls IP/UA. Committee/admin keep reading the base table.
  async function fetchSince(cursorSeq) {
    const source = await holderSafeSource();
    let q = supa.from(source).select("*").order("seq", { ascending: true }).limit(1000);
    if (cursorSeq != null) q = q.gt("seq", cursorSeq);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  // Decide which events surface a holder should see. Admin / committee
  // keep direct table access (need IP/UA for audit). Anon (e.g. landing
  // page) gets the view but RLS returns nothing.
  async function holderSafeSource() {
    try {
      const { data: { session } } = await supa.auth.getSession();
      if (!session) return "events_for_holders";
      const { data: profile } = await supa
        .from("profiles").select("role").eq("id", session.user.id).single();
      if (!profile) return "events_for_holders";
      return (profile.role === "admin" || profile.role === "committee")
        ? "events"
        : "events_for_holders";
    } catch {
      return "events_for_holders";
    }
  }

  async function syncAll() {
    const cache = loadCache();
    while (true) {
      const batch = await fetchSince(cache.cursor);
      if (!batch.length) break;
      cache.events.push(...batch);
      cache.cursor = batch[batch.length - 1].seq;
      saveCache(cache);
      if (batch.length < 1000) break;
    }
    return cache.events;
  }

  async function appendEvent(type, payload) {
    const { data, error } = await supa.rpc("append_event", { p_type: type, p_payload: payload || {} });
    if (error) throw error;
    const cache = loadCache();
    cache.events.push(data);
    cache.cursor = data.seq;
    saveCache(cache);
    notify(data);
    return data;
  }

  function notify(ev) {
    subs.forEach(fn => { try { fn(ev); } catch (e) { console.error(e); } });
  }
  function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }

  function startRealtime() {
    supa.channel("events-stream")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, (payload) => {
        const ev = payload.new;
        const cache = loadCache();
        if (cache.events.some((x) => x.id === ev.id)) return;
        cache.events.push(ev);
        cache.cursor = ev.id;
        saveCache(cache);
        notify(ev);
      })
      .subscribe();
  }

  window.ESOPSupa = { client: supa, syncAll, appendEvent, subscribe, startRealtime, loadCache };
})();
