// Elitez ESOP — event-sourced store, now backed by Supabase.
// State is derived by replaying events on the seed data.
// Persistence + realtime live in assets/supa.js; this file is the state
// projection layer plus the legacy emit/state/subscribe API that the rest
// of the codebase already uses.
//
// Page entrypoints must call `await ESOPStore.init()` before reading state().
// Calling state() before init() returns the seed-only projection (no events
// replayed) which is safe but stale.

(function () {
  const META_KEY = "elitez_esop_meta_v1";

  function loadMeta() {
    try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; }
    catch { return {}; }
  }
  function saveMeta(m) { localStorage.setItem(META_KEY, JSON.stringify(m)); }

  let events = [];
  let meta = loadMeta();
  let initialised = false;
  let initPromise = null;
  // Holder identity (name, dept, ic, ...) is no longer shipped in data.json
  // — it's fetched from public.holders_directory after auth. RLS scopes the
  // visible rows: holders see only themselves; admin/committee see all.
  let holdersDirectory = [];
  const subscribers = new Set();

  async function loadHoldersDirectory() {
    if (!window.ESOPSupa || !window.ESOPSupa.client) return [];
    try {
      const { data, error } = await window.ESOPSupa.client
        .from("holders_directory")
        .select("*")
        .order("id");
      if (error) {
        console.warn("ESOPStore: holders_directory fetch failed:", error.message);
        return [];
      }
      return data || [];
    } catch (e) {
      console.warn("ESOPStore: holders_directory fetch threw:", e);
      return [];
    }
  }

  async function init() {
    if (initialised) return;
    if (initPromise) return initPromise;
    if (!window.ESOPSupa) {
      console.warn("ESOPStore.init: ESOPSupa not available; using seed-only state.");
      initialised = true;
      return;
    }
    initPromise = (async () => {
      try {
        const [eventsResult, directoryResult] = await Promise.all([
          window.ESOPSupa.syncAll().catch((e) => { console.error("syncAll failed:", e); return []; }),
          loadHoldersDirectory()
        ]);
        events = eventsResult;
        holdersDirectory = directoryResult;
      } catch (e) {
        console.error("ESOPStore.init failed:", e);
        events = [];
        holdersDirectory = [];
      }
      window.ESOPSupa.subscribe((ev) => {
        if (!ev || events.some((x) => x.id === ev.id)) return;
        events.push(ev);
        const s = state();
        subscribers.forEach((fn) => { try { fn(ev, s); } catch (err) { console.error(err); } });
      });
      window.ESOPSupa.startRealtime();
      initialised = true;
      // Fire one "hydrated" notification so subscribers can refresh.
      const s = state();
      subscribers.forEach((fn) => { try { fn(null, s); } catch (err) { console.error(err); } });
    })();
    return initPromise;
  }

  async function emit(type, payload) {
    if (!window.ESOPSupa) {
      console.error("emit: Supabase not initialised; event dropped.");
      throw new Error("not initialised");
    }
    const ev = await window.ESOPSupa.appendEvent(type, payload || {});
    if (!events.some((x) => x.id === ev.id)) events.push(ev);
    const s = state();
    subscribers.forEach((fn) => { try { fn(ev, s); } catch (err) { console.error(err); } });
    return ev;
  }

  function subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); }

  // --- Derived state (unchanged from pre-Supabase implementation) ---------
  function state() {
    const D = window.ESOP_DATA || { holders: [], valuation_history: [], grants_history: [], special_dividends: [] };
    // Seed holders from holders_directory (Supabase, RLS-scoped) instead of
    // data.json. Each directory row gets an empty grants[] array, populated
    // by replaying grant_approved events below.
    const directorySeed = (holdersDirectory && holdersDirectory.length)
      ? holdersDirectory.filter((h) => h.status === "active").map((h) => ({
          id: h.id,
          name: h.name,
          dept: h.dept,
          title: h.title,
          nat: h.nat,
          ic: h.ic,
          email: h.email,
          grants: [],
          status: h.status
        }))
      : (D.holders || []);
    const leaversSeed = (holdersDirectory && holdersDirectory.length)
      ? holdersDirectory.filter((h) => h.status === "leaver").map((h) => ({ id: h.id, name: h.name, note: h.notes }))
      : (D.leavers || []);
    const s = structuredClone({
      holders: directorySeed,
      leavers: leaversSeed,
      valuation_history: D.valuation_history || [],
      grants_history: D.grants_history || [],
      special_dividends: D.special_dividends || []
    });
    const passwords = {};
    const scenarios = {};
    const orders = [];
    const windows = [];
    const documents = [];
    const login_log = [];
    const leaver_determinations = {};
    const committee_members = {};
    const thresholds = {};
    const resolutions = {};
    let state_reset_pending = null;
    let state_import_pending = null;
    const acceptances = {};
    const exercises = [];
    const beneficial = {};
    const statements_issued = [];
    const acceptKey = (holder_id, fy) => `${holder_id}::${fy}`;

    function seedRosterIfEmpty() {
      if (Object.keys(committee_members).length) return;
      const defaults = (window.ESOPCommittee && window.ESOPCommittee.DEFAULT_MEMBERS) || [];
      defaults.forEach((m) => { committee_members[m.id] = { ...m, appointed_at: null, seeded: true }; });
    }
    seedRosterIfEmpty();

    for (const ev of events) {
      switch (ev.type) {
        case "password_set": passwords[ev.payload.subject] = ev.payload.hash; break;
        case "login": login_log.push({ ...ev.payload, at: ev.at }); break;
        case "grant_approved": {
          const h = s.holders.find((x) => x.id == ev.payload.holder_id);
          if (!h) break;
          let g = h.grants.find((x) => x.fy === ev.payload.fy);
          if (!g) {
            // Pre-seeded data.json used to carry draft entries; now grants
            // are derived purely from events. Create the row if absent.
            g = { fy: ev.payload.fy, status: "active", qty: 0 };
            h.grants.push(g);
          }
          g.status = "active";
          g.grant_date = ev.payload.grant_date;
          g.letter_date = ev.payload.letter_date || ev.payload.grant_date;
          if (ev.payload.qty != null) g.qty = ev.payload.qty;
          break;
        }
        case "grant_rejected": {
          const h = s.holders.find((x) => x.id == ev.payload.holder_id);
          if (h) h.grants = h.grants.filter((g) => g.fy !== ev.payload.fy);
          break;
        }
        case "allocation_changed": {
          const h = s.holders.find((x) => x.id == ev.payload.holder_id);
          if (!h) break;
          let g = h.grants.find((x) => x.fy === ev.payload.fy);
          if (!g) {
            g = { fy: ev.payload.fy, qty: 0, status: ev.payload.status || "draft", grant_date: null };
            h.grants.push(g);
          }
          g.qty = ev.payload.qty;
          if (ev.payload.status) g.status = ev.payload.status;
          break;
        }
        case "scenario_saved":
          scenarios[ev.payload.name] = { allocations: ev.payload.allocations, notes: ev.payload.notes, saved_at: ev.at };
          break;
        case "scenario_committed": {
          const sc = scenarios[ev.payload.name];
          if (!sc) break;
          Object.entries(sc.allocations).forEach(([holderId, qty]) => {
            const h = s.holders.find((x) => x.id == Number(holderId));
            const g = h && h.grants.find((x) => x.status === "draft");
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
          const existing = s.valuation_history.findIndex((v) => v.fy === entry.fy);
          if (existing >= 0) s.valuation_history[existing] = { ...s.valuation_history[existing], ...entry };
          else s.valuation_history.push(entry);
          break;
        }
        case "valuation_activated": {
          s.valuation_history.forEach((v) => { delete v.active; });
          const v = s.valuation_history.find((x) => x.fy === ev.payload.fy);
          if (v) v.active = true;
          break;
        }
        case "order_placed":
          orders.push({
            id: ev.id, side: ev.payload.side, holder_id: ev.payload.holder_id,
            qty: ev.payload.qty, price: ev.payload.price, window: ev.payload.window,
            at: ev.at, status: "open"
          });
          break;
        case "order_cancelled": {
          const o = orders.find((x) => x.id === ev.payload.order_id);
          if (o) o.status = "cancelled";
          break;
        }
        case "window_opened":
          windows.push({ name: ev.payload.name, opens: ev.payload.opens, closes: ev.payload.closes, status: "open", trades: [] });
          break;
        case "window_closed": {
          const w = windows.find((x) => x.name === ev.payload.name);
          if (w) {
            w.status = "closed";
            w.trades = ev.payload.trades;
            w.closed_at = ev.at;
            ev.payload.trades.forEach((t) => {
              t.buy_order_ids?.forEach((oid) => { const o = orders.find((x) => x.id === oid); if (o) o.status = "filled"; });
              t.sell_order_ids?.forEach((oid) => { const o = orders.find((x) => x.id === oid); if (o) o.status = "filled"; });
            });
          }
          break;
        }
        case "document_issued":
          documents.push({ ...ev.payload, at: ev.at, id: ev.id });
          break;
        case "leaver_determined":
          leaver_determinations[ev.payload.holder_id] = { type: ev.payload.type, as_of: ev.payload.as_of, note: ev.payload.note };
          break;
        case "committee_member_appointed": {
          const p = ev.payload;
          committee_members[p.id] = {
            id: p.id, seat: p.seat, name: p.name, email: p.email,
            role: p.role || "senior", note: p.note || "",
            holder_id: p.holder_id || null, appointed_at: ev.at
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
            id: ev.payload.resolution_id, type: ev.payload.type, payload: ev.payload.payload,
            fingerprint: ev.payload.fingerprint, proposer_id: ev.payload.proposer_id,
            proposer_name: ev.payload.proposer_name, recused: ev.payload.recused || [],
            threshold: ev.payload.threshold, expires_at: ev.payload.expires_at,
            proposed_at: ev.at, votes: {}, status: "pending"
          };
          break;
        case "resolution_voted": {
          const r = resolutions[ev.payload.resolution_id];
          if (!r || r.status !== "pending") break;
          r.votes[ev.payload.member_id] = {
            vote: ev.payload.vote, comment: ev.payload.comment || "",
            member_name: ev.payload.member_name, at: ev.at
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
          r.status = "expired"; r.outcome = "expired"; r.closed_at = ev.at;
          break;
        }
        case "state_reset_authorised": state_reset_pending = { at: ev.at }; break;
        case "state_import_authorised": state_import_pending = { at: ev.at }; break;
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
        case "letter_of_offer_signed":
          acceptances[acceptKey(ev.payload.holder_id, ev.payload.fy || "any")] = {
            status: "accepted",
            document_id: ev.payload.document_id,
            accepted_at: ev.at
          };
          break;
        case "exercise_submitted": {
          exercises.push({
            id: ev.payload.exercise_id || ev.id,
            holder_id: ev.payload.holder_id,
            fy: ev.payload.fy || ev.payload.grant_id,
            qty: ev.payload.qty,
            exercise_price: ev.payload.exercise_price,
            fmv_at_submission: ev.payload.fmv_at_submission,
            cost: ev.payload.cost || ev.payload.amount_sgd,
            payment_ref: ev.payload.payment_ref || ev.payload.reference,
            payment_method: ev.payload.payment_method || "paynow",
            signed_name: ev.payload.signed_name,
            status: "submitted",
            submitted_at: ev.at
          });
          break;
        }
        case "exercise_confirmed":
        case "exercise_settled": {
          const exId = ev.payload.exercise_id || ev.payload.payment_id;
          const ex = exercises.find((x) => x.id === exId || x.payment_ref === ev.payload.reference);
          if (!ex) break;
          ex.status = "confirmed";
          ex.confirmed_at = ev.at;
          ex.confirmed_by = ev.payload.confirmed_by;
          ex.confirmed_by_name = ev.payload.confirmed_by_name;
          if (!beneficial[ex.holder_id]) beneficial[ex.holder_id] = { total_shares: 0, lots: [] };
          beneficial[ex.holder_id].total_shares += ex.qty || 0;
          beneficial[ex.holder_id].lots.push({
            fy: ex.fy, shares: ex.qty, fmv: ex.fmv_at_submission,
            exercise_price: ex.exercise_price, at: ev.at, exercise_id: ex.id
          });
          break;
        }
        case "exercise_rejected":
        case "exercise_cancelled": {
          const ex = exercises.find((x) => x.id === ev.payload.exercise_id || x.payment_ref === ev.payload.reference);
          if (!ex) break;
          ex.status = ev.type === "exercise_cancelled" ? "cancelled" : "rejected";
          ex.rejected_at = ev.at;
          ex.rejected_reason = ev.payload.reason;
          break;
        }
        case "holder_added": {
          const h = ev.payload;
          if (h && h.id && !s.holders.find((x) => x.id === h.id)) {
            s.holders.push({
              id: h.id, name: h.name, dept: h.dept || "", title: h.title || "",
              nat: h.nat || "", ic: h.ic || "", email: h.email || "",
              status: "active", grants: h.grants || []
            });
          }
          break;
        }
        case "holder_updated": {
          const h = s.holders.find((x) => x.id == ev.payload.id);
          if (h) Object.assign(h, ev.payload.changes || {});
          break;
        }
        case "holder_archived": {
          const h = s.holders.find((x) => x.id == ev.payload.id);
          if (h) h.status = "archived";
          break;
        }
        case "statements_bulk_issued":
          statements_issued.push({
            doc_type: ev.payload.doc_type, count: ev.payload.count,
            year: ev.payload.year, issued_by: ev.payload.issued_by, at: ev.at
          });
          break;
      }
    }

    return {
      ...s,
      passwords, scenarios, orders, windows, documents, login_log,
      leaver_determinations, committee_members, thresholds, resolutions,
      state_reset_pending, state_import_pending,
      acceptances, exercises, beneficial, statements_issued,
      event_count: events.length
    };
  }

  // --- Export / import (now read from cache; writes deferred to runbook) --
  function exportJSON() {
    return JSON.stringify({
      version: 2,
      exported_at: new Date().toISOString(),
      meta,
      events
    }, null, 2);
  }
  function importJSON() {
    throw new Error("Server-side import not implemented; coordinate with admin to re-seed events.");
  }
  function reset() {
    if (!confirm("Clear the local cache and re-fetch from Supabase?")) return;
    try { localStorage.removeItem("elitez_esop_cache_v3"); } catch {}
    location.reload();
  }
  function history() { return events.slice(); }

  // --- Web Crypto password hashing (legacy compatibility — not used post-Supabase) ----
  async function hashPassword(password, salt = "elitez-esop-v1") {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(salt + ":" + password));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  window.ESOPStore = {
    init, emit, subscribe, state, history,
    exportJSON, importJSON, reset,
    hashPassword,
    meta, saveMeta
  };
})();
