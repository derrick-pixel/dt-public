// Elitez ESOP — Supabase client + sync engine.
// Source of truth: Supabase. localStorage is a read-through cache.
// On disagreement, Supabase wins (bump CACHE_VERSION on any schema change).
(function () {
  const CACHE_KEY = "elitez_esop_cache_v3";
  const CACHE_VERSION = 3;

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

  function loadCache() {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (!c || c.version !== CACHE_VERSION) return { events: [], cursor: null };
      return c;
    } catch { return { events: [], cursor: null }; }
  }
  function saveCache(c) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...c, version: CACHE_VERSION }));
  }

  async function fetchSince(cursor) {
    let q = supa.from("events").select("*").order("at", { ascending: true }).limit(1000);
    if (cursor) q = q.gt("id", cursor);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  async function syncAll() {
    const cache = loadCache();
    while (true) {
      const batch = await fetchSince(cache.cursor);
      if (!batch.length) break;
      cache.events.push(...batch);
      cache.cursor = batch[batch.length - 1].id;
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
    cache.cursor = data.id;
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
