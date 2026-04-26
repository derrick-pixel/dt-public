// Elitez ESOP — event-sourced store backed by localStorage.
// Design: every mutation is an event. State is derived from replaying events on seed.
// This gives us a full audit trail for free and a one-click "export state" for
// portability across devices / backups.
//
// Honest caveat: localStorage is per-browser per-origin. For production, swap the
// persistence adapter at the bottom for HTTP calls to a server.

(function () {
  const STORAGE_KEY = "elitez_esop_events_v1";
  const META_KEY = "elitez_esop_meta_v1";

  // BACKEND_MODE: when window.ESOP_CONFIG.backend_url is set, every emit() POSTs
  // to the API and state() replays cached events from there. Without it, we
  // stay in localStorage demo mode (fully functional for one-user demos).
  // Set in index.html / admin.html via:
  //   <script>window.ESOP_CONFIG = { backend_url: "https://esop.derrickteo.com" };</script>
  const BACKEND_URL = (window.ESOP_CONFIG && window.ESOP_CONFIG.backend_url) || null;
  const BACKEND_MODE = !!BACKEND_URL;
  const API = BACKEND_URL ? BACKEND_URL.replace(/\/$/, "") + "/api" : null;

  // --- Event types -------------------------------------------------------
  //
  //   password_set            { holder_id | "admin", hash }
  //   login                   { kind, id, at }
  //   grant_approved          { holder_id, fy, grant_date, letter_date }
  //   grant_rejected          { holder_id, fy, reason }
  //   allocation_changed      { holder_id, fy, qty, reason }
  //   scenario_saved          { name, allocations: { holder_id: qty }, notes }
  //   scenario_committed      { name }
  //   valuation_added         { fy, ebitda, nta, multiple, fmv, note, effective, committee }
  //   valuation_activated     { fy }
  //   order_placed            { side, holder_id, qty, price, at }
  //   order_cancelled         { order_id, by, at }
  //   window_opened           { name, opens, closes, rofr: true }
  //   window_closed           { name, trades: [...] }
  //   document_issued         { doc_type, holder_id, fy?, at }
  //   leaver_determined       { holder_id, type: "good"|"bad", as_of, note }
  //   note                    { text }

  function loadEvents() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }
  function saveEvents(events) { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); }

  function loadMeta() {
    try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; }
    catch { return {}; }
  }
  function saveMeta(meta) { localStorage.setItem(META_KEY, JSON.stringify(meta)); }

  let events = loadEvents();
  let meta = loadMeta();
  const subscribers = new Set();

  function emit(type, payload) {
    const ev = {
      id: "ev_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now(),
      type,
      at: new Date().toISOString(),
      payload: payload || {}
    };
    events.push(ev);
    saveEvents(events);
    subscribers.forEach(fn => { try { fn(ev, state()); } catch (e) { console.error(e); } });

    // Backend mode: fire-and-forget POST. The backend is source-of-truth;
    // local optimistic insert keeps the UI snappy. If the server returns a
    // canonical event with hash etc. we swap it in.
    if (BACKEND_MODE) {
      fetch(API + "/events", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type, payload: ev.payload })
      })
        .then(r => r.json())
        .then(data => {
          if (data && data.event) {
            const idx = events.findIndex(e => e.id === ev.id);
            if (idx >= 0) {
              events[idx] = { ...ev, ...data.event };
              saveEvents(events);
            }
          } else if (data && data.error) {
            console.warn("backend rejected event:", data);
          }
        })
        .catch(err => console.warn("backend emit failed:", err));
    }
    return ev;
  }

  function subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); }

  // Backend hydration: on page load, replace localStorage cache with the
  // authoritative server log. Subscribers are notified so the UI re-renders.
  if (BACKEND_MODE) {
    (async function hydrate() {
      try {
        const r = await fetch(API + "/events", { credentials: "include" });
        if (r.ok) {
          const data = await r.json();
          events = data.events || [];
          saveEvents(events);
          subscribers.forEach(fn => { try { fn(null, state()); } catch (e) { console.error(e); } });
        }
      } catch (e) { console.warn("backend hydrate failed:", e); }
      // Subscribe to live updates via SSE
      try {
        const last = events.length ? events[events.length - 1].at : "";
        const es = new EventSource(API + "/events/sse?since=" + encodeURIComponent(last), { withCredentials: true });
        es.addEventListener("append", (e) => {
          try {
            const ev = JSON.parse(e.data);
            if (!events.find(x => x.id === ev.id)) {
              events.push(ev);
              saveEvents(events);
              subscribers.forEach(fn => { try { fn(ev, state()); } catch (err) { console.error(err); } });
            }
          } catch {}
        });
        // The /sse endpoint closes after 30s; EventSource auto-reconnects.
      } catch (e) { console.warn("SSE setup failed:", e); }
    })();
  }

  // --- Derived state -----------------------------------------------------
  // Replay events over a deep-clone of seed data to produce the current state.
  function state() {
    const D = window.ESOP_DATA;
    const s = structuredClone({
      holders: D.holders,
      valuation_history: D.valuation_history,
      grants_history: D.grants_history,
      special_dividends: D.special_dividends
    });
    const passwords = {};              // "admin" | holder_id | "member:<id>" → hash
    const scenarios = {};              // name → { allocations, notes, saved_at }
    const orders = [];                 // open orders
    const windows = [];                // past & current trading windows
    const documents = [];              // issued docs
    const login_log = [];              // login events
    const leaver_determinations = {};  // holder_id → { type, as_of, note }
    // Committee state
    const committee_members = {};      // member_id → member record
    const thresholds = {};             // actionType → { total_needed, majors_needed, label }
    const resolutions = {};            // resolution_id → record
    // Bootstrap flags for state_reset / state_import resolutions
    let state_reset_pending = null;
    let state_import_pending = null;
    // Grant-acceptance + exercise workflow
    const acceptances = {};     // `${holder_id}::${fy}` → { status, signed_name, payment_ref, accepted_at }
    const exercises = [];       // [{ id, holder_id, fy, qty, payment_ref, status, ... }]
    const beneficial = {};      // holder_id → { total_shares, lots: [{fy, shares, fmv, exercise_price, at}] }
    const statements_issued = [];  // records of when annual statements were generated (for audit)
    const acceptKey = (holder_id, fy) => `${holder_id}::${fy}`;

    // Pre-seed roster if no appointment events exist yet — pulls from
    // ESOPCommittee defaults so identity is stable from first boot.
    function seedRosterIfEmpty() {
      if (Object.keys(committee_members).length) return;
      const defaults = (window.ESOPCommittee && window.ESOPCommittee.DEFAULT_MEMBERS) || [];
      defaults.forEach(m => { committee_members[m.id] = { ...m, appointed_at: null, seeded: true }; });
    }
    seedRosterIfEmpty();

    for (const ev of events) {
      switch (ev.type) {
        case "password_set":
          passwords[ev.payload.subject] = ev.payload.hash;
          break;
        case "login":
          login_log.push({ ...ev.payload, at: ev.at });
          break;
        case "grant_approved": {
          const h = s.holders.find(x => x.id === ev.payload.holder_id);
          const g = h && h.grants.find(x => x.fy === ev.payload.fy);
          if (g) {
            g.status = "active";
            g.grant_date = ev.payload.grant_date;
            g.letter_date = ev.payload.letter_date || ev.payload.grant_date;
          }
          break;
        }
        case "grant_rejected": {
          const h = s.holders.find(x => x.id === ev.payload.holder_id);
          if (h) h.grants = h.grants.filter(g => g.fy !== ev.payload.fy);
          break;
        }
        case "allocation_changed": {
          const h = s.holders.find(x => x.id === ev.payload.holder_id);
          const g = h && h.grants.find(x => x.fy === ev.payload.fy);
          if (g) g.qty = ev.payload.qty;
          break;
        }
        case "scenario_saved":
          scenarios[ev.payload.name] = {
            allocations: ev.payload.allocations,
            notes: ev.payload.notes,
            saved_at: ev.at
          };
          break;
        case "scenario_committed": {
          const sc = scenarios[ev.payload.name];
          if (!sc) break;
          Object.entries(sc.allocations).forEach(([holderId, qty]) => {
            const h = s.holders.find(x => x.id === Number(holderId));
            const g = h && h.grants.find(x => x.status === "draft");
            if (g) g.qty = qty;
          });
          break;
        }
        case "valuation_added": {
          const entry = {
            fy: ev.payload.fy,
            ebitda: ev.payload.ebitda,
            nta: ev.payload.nta || 0,
            multiple: ev.payload.multiple,
            fmv: ev.payload.fmv,
            firm_value: Math.round(Math.max(ev.payload.ebitda * ev.payload.multiple, ev.payload.nta || 0)),
            exercise_price: Math.round(ev.payload.fmv * 0.10 * 10000) / 10000,
            note: ev.payload.note,
            committee: ev.payload.committee,
            effective: ev.payload.effective,
            added_at: ev.at
          };
          const existing = s.valuation_history.findIndex(v => v.fy === entry.fy);
          if (existing >= 0) s.valuation_history[existing] = { ...s.valuation_history[existing], ...entry };
          else s.valuation_history.push(entry);
          break;
        }
        case "valuation_activated": {
          s.valuation_history.forEach(v => { delete v.active; });
          const v = s.valuation_history.find(x => x.fy === ev.payload.fy);
          if (v) v.active = true;
          break;
        }
        case "order_placed":
          orders.push({
            id: ev.id,
            side: ev.payload.side,
            holder_id: ev.payload.holder_id,
            qty: ev.payload.qty,
            price: ev.payload.price,
            window: ev.payload.window,
            at: ev.at,
            status: "open"
          });
          break;
        case "order_cancelled": {
          const o = orders.find(x => x.id === ev.payload.order_id);
          if (o) o.status = "cancelled";
          break;
        }
        case "window_opened":
          windows.push({
            name: ev.payload.name,
            opens: ev.payload.opens,
            closes: ev.payload.closes,
            status: "open",
            trades: []
          });
          break;
        case "window_closed": {
          const w = windows.find(x => x.name === ev.payload.name);
          if (w) {
            w.status = "closed";
            w.trades = ev.payload.trades;
            w.closed_at = ev.at;
            // mark matching orders as filled
            ev.payload.trades.forEach(t => {
              t.buy_order_ids?.forEach(oid => { const o = orders.find(x => x.id === oid); if (o) o.status = "filled"; });
              t.sell_order_ids?.forEach(oid => { const o = orders.find(x => x.id === oid); if (o) o.status = "filled"; });
            });
          }
          break;
        }
        case "document_issued":
          documents.push({ ...ev.payload, at: ev.at, id: ev.id });
          break;
        case "leaver_determined":
          leaver_determinations[ev.payload.holder_id] = {
            type: ev.payload.type,
            as_of: ev.payload.as_of,
            note: ev.payload.note
          };
          break;

        // ---- Committee events ----------------------------------------
        case "committee_member_appointed": {
          const p = ev.payload;
          committee_members[p.id] = {
            id: p.id, seat: p.seat, name: p.name, email: p.email,
            role: p.role || "senior",
            note: p.note || "",
            holder_id: p.holder_id || null,
            appointed_at: ev.at
          };
          break;
        }
        case "committee_member_removed":
          delete committee_members[ev.payload.id];
          break;

        case "threshold_changed":
          thresholds[ev.payload.action_type] = {
            total_needed: ev.payload.total_needed,
            majors_needed: ev.payload.majors_needed,
            label: ev.payload.label || ev.payload.action_type
          };
          break;

        case "resolution_proposed":
          resolutions[ev.payload.resolution_id] = {
            id: ev.payload.resolution_id,
            type: ev.payload.type,
            payload: ev.payload.payload,
            fingerprint: ev.payload.fingerprint,
            proposer_id: ev.payload.proposer_id,
            proposer_name: ev.payload.proposer_name,
            recused: ev.payload.recused || [],
            threshold: ev.payload.threshold,
            expires_at: ev.payload.expires_at,
            proposed_at: ev.at,
            votes: {},
            status: "pending"
          };
          break;

        case "resolution_voted": {
          const r = resolutions[ev.payload.resolution_id];
          if (!r || r.status !== "pending") break;
          r.votes[ev.payload.member_id] = {
            vote: ev.payload.vote,
            comment: ev.payload.comment || "",
            member_name: ev.payload.member_name,
            at: ev.at
          };
          break;
        }

        case "resolution_executed": {
          const r = resolutions[ev.payload.resolution_id];
          if (!r) break;
          r.status = ev.payload.outcome === "approved" ? "executed" : "defeated";
          r.outcome = ev.payload.outcome;
          r.closed_at = ev.at;
          break;
        }

        case "resolution_expired": {
          const r = resolutions[ev.payload.resolution_id];
          if (!r) break;
          r.status = "expired";
          r.outcome = "expired";
          r.closed_at = ev.at;
          break;
        }

        case "state_reset_authorised":
          // Consumed at the application layer (can't truly wipe events from replay)
          state_reset_pending = { at: ev.at };
          break;

        case "state_import_authorised":
          state_import_pending = { at: ev.at };
          break;

        // ---- Grant acceptance workflow ----
        case "grant_accepted":
          acceptances[acceptKey(ev.payload.holder_id, ev.payload.fy)] = {
            status: "accepted",
            signed_name: ev.payload.signed_name,
            payment_ref: ev.payload.payment_ref,
            payment_method: ev.payload.payment_method || "paynow",
            accepted_at: ev.at,
            plan_acknowledged: ev.payload.plan_acknowledged,
            terms_accepted: ev.payload.terms_accepted
          };
          break;
        case "grant_acceptance_reset":
          delete acceptances[acceptKey(ev.payload.holder_id, ev.payload.fy)];
          break;

        // ---- Exercise workflow ----
        case "exercise_submitted": {
          exercises.push({
            id: ev.payload.exercise_id,
            holder_id: ev.payload.holder_id,
            fy: ev.payload.fy,
            qty: ev.payload.qty,
            exercise_price: ev.payload.exercise_price,
            fmv_at_submission: ev.payload.fmv_at_submission,
            cost: ev.payload.cost,
            payment_ref: ev.payload.payment_ref,
            payment_method: ev.payload.payment_method || "paynow",
            signed_name: ev.payload.signed_name,
            status: "submitted",
            submitted_at: ev.at
          });
          break;
        }
        case "exercise_confirmed": {
          const ex = exercises.find(x => x.id === ev.payload.exercise_id);
          if (!ex) break;
          ex.status = "confirmed";
          ex.confirmed_at = ev.at;
          ex.confirmed_by = ev.payload.confirmed_by;
          ex.confirmed_by_name = ev.payload.confirmed_by_name;
          // Register shares to beneficial owner register
          if (!beneficial[ex.holder_id]) beneficial[ex.holder_id] = { total_shares: 0, lots: [] };
          beneficial[ex.holder_id].total_shares += ex.qty;
          beneficial[ex.holder_id].lots.push({
            fy: ex.fy,
            shares: ex.qty,
            fmv: ex.fmv_at_submission,
            exercise_price: ex.exercise_price,
            at: ev.at,
            exercise_id: ex.id
          });
          break;
        }
        case "exercise_rejected": {
          const ex = exercises.find(x => x.id === ev.payload.exercise_id);
          if (!ex) break;
          ex.status = "rejected";
          ex.rejected_at = ev.at;
          ex.rejected_reason = ev.payload.reason;
          break;
        }

        // ---- Holder onboarding ----
        case "holder_added": {
          const h = ev.payload;
          if (!h || !h.id) break;
          if (!s.holders.find(x => x.id === h.id)) {
            s.holders.push({
              id: h.id,
              name: h.name,
              dept: h.dept || "",
              title: h.title || "",
              nat: h.nat || "",
              ic: h.ic || "",
              email: h.email || "",
              status: "active",
              grants: h.grants || []
            });
          }
          break;
        }
        case "holder_updated": {
          const h = s.holders.find(x => x.id === ev.payload.id);
          if (h) Object.assign(h, ev.payload.changes || {});
          break;
        }
        case "holder_archived": {
          const h = s.holders.find(x => x.id === ev.payload.id);
          if (h) h.status = "archived";
          break;
        }

        // ---- Statement issuance (bulk docs) ----
        case "statements_bulk_issued": {
          statements_issued.push({
            doc_type: ev.payload.doc_type,
            count: ev.payload.count,
            year: ev.payload.year,
            issued_by: ev.payload.issued_by,
            at: ev.at
          });
          break;
        }
      }
    }

    return {
      ...s,
      passwords,
      scenarios,
      orders,
      windows,
      documents,
      login_log,
      leaver_determinations,
      committee_members,
      thresholds,
      resolutions,
      state_reset_pending,
      state_import_pending,
      acceptances,
      exercises,
      beneficial,
      statements_issued,
      event_count: events.length
    };
  }

  // --- Export / import ---------------------------------------------------
  function exportJSON() {
    return JSON.stringify({
      version: 1,
      exported_at: new Date().toISOString(),
      meta,
      events
    }, null, 2);
  }
  function importJSON(json, { authorised = false } = {}) {
    const data = JSON.parse(json);
    if (data.version !== 1) throw new Error("Incompatible version");
    if (!authorised) {
      const s = state();
      if (!s.state_import_pending) {
        throw new Error("State import requires an approved Committee resolution (state_import).");
      }
    }
    events = data.events || [];
    meta = data.meta || {};
    saveEvents(events);
    saveMeta(meta);
    subscribers.forEach(fn => fn(null, state()));
  }
  function reset({ authorised = false } = {}) {
    if (!authorised) {
      const s = state();
      if (!s.state_reset_pending) {
        alert("State reset requires an approved Committee resolution (state_reset). Propose one from the Committee page.");
        return;
      }
    }
    if (!confirm("Reset all persisted data (events, passwords, orders, scenarios, resolutions)? This cannot be undone.")) return;
    events = [];
    meta = {};
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(META_KEY);
    subscribers.forEach(fn => fn(null, state()));
  }
  function history() { return events.slice(); }

  // --- Web Crypto password hashing --------------------------------------
  async function hashPassword(password, salt = "elitez-esop-v1") {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(salt + ":" + password));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  window.ESOPStore = {
    emit, subscribe, state, history,
    exportJSON, importJSON, reset,
    hashPassword,
    meta, saveMeta
  };
})();
