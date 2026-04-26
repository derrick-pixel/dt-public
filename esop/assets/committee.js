// Elitez ESOP — Committee logic.
// Resolution lifecycle, threshold rules, recusal, and an executor map
// that emits the underlying events once a resolution is approved.
//
// Public API (window.ESOPCommittee):
//   roster()                         → array of members (fills defaults if empty)
//   member(id)                       → member by id
//   thresholdFor(actionType)         → { total_needed, majors_needed }
//   act(actionType, payload)         → propose resolution OR execute ops action
//   vote(resolution_id, v, comment)  → cast vote
//   sweepExpired()                   → emit resolution_expired for aged-out items
//   findExisting(actionType, payload)→ pending resolution matching this action

(function () {
  const DEFAULT_EXPIRY_DAYS = 14;

  // Default thresholds. These are the Plan-canonical rules but are
  // themselves editable via a "threshold_change" resolution (requires 3/3 Majors).
  const DEFAULT_THRESHOLDS = {
    // { total_needed, majors_needed }
    grant_approval:        { total_needed: 3, majors_needed: 2, label: "Grant approval" },
    grant_rejection:       { total_needed: 3, majors_needed: 2, label: "Grant rejection" },
    allocation_commit:     { total_needed: 3, majors_needed: 2, label: "Allocation commit" },
    valuation_add:         { total_needed: 3, majors_needed: 0, label: "Record valuation" },
    valuation_activate:    { total_needed: 3, majors_needed: 2, label: "Activate valuation (set FMV)" },
    leaver_determination:  { total_needed: 3, majors_needed: 2, label: "Leaver determination" },
    window_open:           { total_needed: 3, majors_needed: 0, label: "Open trading window" },
    window_close:          { total_needed: 3, majors_needed: 0, label: "Close trading window" },
    special_dividend:      { total_needed: 3, majors_needed: 2, label: "Declare special dividend" },
    roster_appoint:        { total_needed: 0, majors_needed: 2, label: "Appoint Senior Employee" },
    roster_remove:         { total_needed: 0, majors_needed: 2, label: "Remove Senior Employee" },
    threshold_change:      { total_needed: 0, majors_needed: 3, label: "Amend threshold rules" },
    state_reset:           { total_needed: 0, majors_needed: 3, label: "Reset platform state" },
    state_import:          { total_needed: 0, majors_needed: 3, label: "Import platform state" },
    // Operational (single-member) — do not route through resolution
    issue_document:        { total_needed: 1, majors_needed: 0, label: "Issue document" },
    reset_holder_password: { total_needed: 1, majors_needed: 1, label: "Reset holder password" },
    // Exercise workflow — Trustee-confirmed receipt of payment is operational (Clause 10.11)
    confirm_exercise:      { total_needed: 1, majors_needed: 0, label: "Confirm exercise receipt" },
    reject_exercise:       { total_needed: 1, majors_needed: 0, label: "Reject exercise" },
    // Bulk statement issuance
    bulk_statements:       { total_needed: 1, majors_needed: 0, label: "Issue bulk statements" }
  };

  // Default seed roster. 3 Majors hard-coded per scheme rules; 2 Senior seats
  // start vacant and must be appointed by the Majors via a resolution.
  const DEFAULT_MEMBERS = [
    { id: "m1", seat: 1, name: "Teo Wen Shan, Derrick", email: "derrick@elitez.asia", role: "major", note: "Co-founder / CEO" },
    { id: "m2", seat: 2, name: "Chen Zaoxiang", email: "wayne@elitez.asia", role: "major", note: "Co-founder / Exec Director" },
    { id: "m3", seat: 3, name: "Lim Yong Ciat", email: "rongjie@elitez.asia", role: "major", note: "CFO · ESOP Trustee" },
    { id: "m4", seat: 4, name: "Yvonne Tan", email: "yvonne@dhc.com.sg", role: "major", note: "Major Shareholder · DHC" }
  ];

  function Store() { return window.ESOPStore; }

  // ------ Roster ------------------------------------------------------

  function roster() {
    const state = Store().state();
    const members = Object.values(state.committee_members || {});
    if (!members.length) return DEFAULT_MEMBERS.slice();
    return members.sort((a, b) => a.seat - b.seat);
  }

  function member(id) {
    return roster().find(m => m.id === id) || null;
  }

  function memberByEmail(email) {
    const e = email.trim().toLowerCase();
    return roster().find(m => m.email.toLowerCase() === e) || null;
  }

  function majors() { return roster().filter(m => m.role === "major"); }
  function seniors() { return roster().filter(m => m.role === "senior"); }

  // Is a member ESOP holder themselves? Optional mapping.
  function memberHolderId(m) { return m && m.holder_id != null ? m.holder_id : null; }

  // ------ Thresholds --------------------------------------------------

  function thresholdFor(actionType) {
    const state = Store().state();
    const overrides = state.thresholds || {};
    return overrides[actionType] || DEFAULT_THRESHOLDS[actionType] || null;
  }

  function allThresholds() {
    const state = Store().state();
    const merged = { ...DEFAULT_THRESHOLDS };
    Object.entries(state.thresholds || {}).forEach(([k, v]) => { merged[k] = v; });
    return merged;
  }

  // ------ Recusal -----------------------------------------------------
  //
  // A member is recused when the resolution payload references their own
  // holder_id (if linked). Recused members don't count towards threshold
  // denominators and cannot vote.

  function computeRecusals(actionType, payload) {
    const recused = new Set();
    const allMembers = roster();

    // Payloads that carry a single holder_id
    const subjectId = payload && payload.holder_id;
    if (subjectId != null) {
      allMembers.forEach(m => {
        if (memberHolderId(m) === subjectId) recused.add(m.id);
      });
    }

    // Scenario commit — an array of { holder_id } changes
    if (actionType === "allocation_commit" && Array.isArray(payload.changes)) {
      const touched = new Set(payload.changes.map(c => c.holder_id));
      allMembers.forEach(m => {
        const hid = memberHolderId(m);
        if (hid != null && touched.has(hid)) recused.add(m.id);
      });
    }

    return Array.from(recused);
  }

  // ------ Fingerprint / dedupe ---------------------------------------

  function fingerprint(actionType, payload) {
    try {
      const canon = JSON.stringify(payload, Object.keys(payload).sort());
      return actionType + "|" + canon;
    } catch { return actionType + "|unhashable"; }
  }

  function findExisting(actionType, payload) {
    const fp = fingerprint(actionType, payload);
    const state = Store().state();
    const resolutions = state.resolutions || {};
    return Object.values(resolutions).find(r =>
      r.status === "pending" && r.fingerprint === fp
    ) || null;
  }

  // ------ Tally / closing --------------------------------------------

  function tallyVotes(resolution) {
    const members = roster();
    const recused = new Set(resolution.recused || []);
    const votes = resolution.votes || {};

    const eligible = members.filter(m => !recused.has(m.id));
    const eligibleMajors = eligible.filter(m => m.role === "major");

    let approves = 0, objects = 0, abstains = 0;
    let majorApproves = 0;

    for (const [mid, v] of Object.entries(votes)) {
      const mem = members.find(mm => mm.id === mid);
      if (!mem || recused.has(mid)) continue;
      if (v.vote === "approve") { approves++; if (mem.role === "major") majorApproves++; }
      else if (v.vote === "object") objects++;
      else if (v.vote === "abstain") abstains++;
    }

    const voted = new Set(Object.keys(votes));
    const remaining = eligible.filter(m => !voted.has(m.id)).length;
    const remainingMajors = eligibleMajors.filter(m => !voted.has(m.id)).length;

    return {
      eligible_count: eligible.length,
      eligible_majors: eligibleMajors.length,
      approves, objects, abstains,
      major_approves: majorApproves,
      remaining, remaining_majors: remainingMajors,
      max_approves: approves + remaining,
      max_major_approves: majorApproves + remainingMajors
    };
  }

  function canExecute(resolution) {
    const t = resolution.threshold || thresholdFor(resolution.type);
    if (!t) return false;
    const tally = tallyVotes(resolution);
    return tally.approves >= t.total_needed && tally.major_approves >= t.majors_needed;
  }

  function isDefeated(resolution) {
    const t = resolution.threshold || thresholdFor(resolution.type);
    if (!t) return false;
    const tally = tallyVotes(resolution);
    return tally.max_approves < t.total_needed || tally.max_major_approves < t.majors_needed;
  }

  function maybeClose(resolution_id) {
    const state = Store().state();
    const r = (state.resolutions || {})[resolution_id];
    if (!r || r.status !== "pending") return;
    if (canExecute(r)) {
      executeAction(r.type, r.payload, { via_resolution: resolution_id });
      Store().emit("resolution_executed", { resolution_id, outcome: "approved" });
      return;
    }
    if (isDefeated(r)) {
      Store().emit("resolution_executed", { resolution_id, outcome: "defeated" });
    }
  }

  // ------ Executors ---------------------------------------------------

  const EXECUTORS = {
    grant_approval: (p, ctx) => Store().emit("grant_approved", { ...p, ...ctx }),
    grant_rejection: (p, ctx) => Store().emit("grant_rejected", { ...p, ...ctx }),
    allocation_commit: (p, ctx) => {
      (p.changes || []).forEach(c => Store().emit("allocation_changed", { ...c, ...ctx }));
      if (p.scenario_name) Store().emit("scenario_committed", { name: p.scenario_name, ...ctx });
    },
    valuation_add: (p, ctx) => Store().emit("valuation_added", { ...p, ...ctx }),
    valuation_activate: (p, ctx) => Store().emit("valuation_activated", { ...p, ...ctx }),
    leaver_determination: (p, ctx) => Store().emit("leaver_determined", { ...p, ...ctx }),
    window_open: (p, ctx) => Store().emit("window_opened", { ...p, ...ctx }),
    window_close: (p, ctx) => Store().emit("window_closed", { ...p, ...ctx }),
    special_dividend: (p, ctx) => Store().emit("special_dividend_declared", { ...p, ...ctx }),
    roster_appoint: (p, ctx) => Store().emit("committee_member_appointed", { ...p, ...ctx }),
    roster_remove: (p, ctx) => Store().emit("committee_member_removed", { ...p, ...ctx }),
    threshold_change: (p, ctx) => Store().emit("threshold_changed", { ...p, ...ctx }),
    state_reset: (p, ctx) => Store().emit("state_reset_authorised", { ...p, ...ctx }),
    state_import: (p, ctx) => Store().emit("state_import_authorised", { ...p, ...ctx }),
    issue_document: (p, ctx) => Store().emit("document_issued", { ...p, ...ctx }),
    reset_holder_password: (p, ctx) => Store().emit("password_set", { ...p, reset_by_admin: true, ...ctx }),
    confirm_exercise: (p, ctx) => Store().emit("exercise_confirmed", { ...p, ...ctx }),
    reject_exercise: (p, ctx) => Store().emit("exercise_rejected", { ...p, ...ctx }),
    bulk_statements: (p, ctx) => Store().emit("statements_bulk_issued", { ...p, ...ctx })
  };

  function executeAction(actionType, payload, ctx) {
    const fn = EXECUTORS[actionType];
    if (!fn) { console.warn("No executor for", actionType); return; }
    fn(payload, ctx || {});
  }

  // ------ Public actions ---------------------------------------------

  function session() {
    const s = window.ESOPAuth.readSession();
    if (!s || s.kind !== "committee") return null;
    return s;
  }

  function randomId() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

  function act(actionType, payload) {
    const sess = session();
    if (!sess) return { error: "not_committee" };
    const mem = member(sess.member_id);
    if (!mem) return { error: "not_a_member" };

    const t = thresholdFor(actionType);
    if (!t) return { error: "unknown_action", actionType };

    // Operational (any 1 member, or any 1 Major)
    if (t.total_needed <= 1 && t.majors_needed <= 1) {
      if (t.majors_needed === 1 && mem.role !== "major") {
        return { error: "majors_only" };
      }
      executeAction(actionType, payload, { actor_id: mem.id, actor_name: mem.name });
      return { status: "executed", actor: mem.name };
    }

    // Dedupe
    const existing = findExisting(actionType, payload);
    if (existing) return { status: "existing", resolution_id: existing.id };

    const recused = computeRecusals(actionType, payload);
    if (recused.includes(mem.id)) {
      return { error: "proposer_recused", note: "You are recused from this decision because it concerns your own holdings." };
    }

    const resolution_id = "res_" + randomId();
    const now = new Date();
    const expires_at = new Date(now.getTime() + DEFAULT_EXPIRY_DAYS * 86400000).toISOString();

    Store().emit("resolution_proposed", {
      resolution_id,
      fingerprint: fingerprint(actionType, payload),
      type: actionType,
      payload,
      proposer_id: mem.id,
      proposer_name: mem.name,
      recused,
      threshold: { total_needed: t.total_needed, majors_needed: t.majors_needed, label: t.label },
      expires_at
    });

    // Proposer automatically votes approve.
    Store().emit("resolution_voted", {
      resolution_id,
      member_id: mem.id,
      member_name: mem.name,
      vote: "approve",
      comment: "Proposed."
    });

    maybeClose(resolution_id);

    return { status: "proposed", resolution_id };
  }

  function vote(resolution_id, voteValue, comment) {
    const sess = session();
    if (!sess) return { error: "not_committee" };
    const mem = member(sess.member_id);
    if (!mem) return { error: "not_a_member" };

    const state = Store().state();
    const r = (state.resolutions || {})[resolution_id];
    if (!r) return { error: "no_such_resolution" };
    if (r.status !== "pending") return { error: "resolution_closed" };
    if ((r.recused || []).includes(mem.id)) return { error: "recused" };

    Store().emit("resolution_voted", {
      resolution_id,
      member_id: mem.id,
      member_name: mem.name,
      vote: voteValue,
      comment: comment || ""
    });
    maybeClose(resolution_id);
    return { status: "voted" };
  }

  function sweepExpired() {
    const state = Store().state();
    const now = Date.now();
    Object.values(state.resolutions || {}).forEach(r => {
      if (r.status === "pending" && r.expires_at && new Date(r.expires_at).getTime() < now) {
        Store().emit("resolution_expired", { resolution_id: r.id });
      }
    });
  }

  function pendingFor(member_id) {
    const state = Store().state();
    return Object.values(state.resolutions || {})
      .filter(r => r.status === "pending")
      .filter(r => !(r.recused || []).includes(member_id))
      .filter(r => !(r.votes || {})[member_id]);
  }

  function pending() {
    const state = Store().state();
    return Object.values(state.resolutions || {}).filter(r => r.status === "pending");
  }

  function closed() {
    const state = Store().state();
    return Object.values(state.resolutions || {})
      .filter(r => r.status !== "pending")
      .sort((a, b) => (b.closed_at || "").localeCompare(a.closed_at || ""));
  }

  window.ESOPCommittee = {
    DEFAULT_EXPIRY_DAYS,
    DEFAULT_THRESHOLDS,
    DEFAULT_MEMBERS,
    roster, member, memberByEmail, majors, seniors,
    thresholdFor, allThresholds,
    act, vote, maybeClose, sweepExpired,
    findExisting, tallyVotes, canExecute, isDefeated,
    pendingFor, pending, closed,
    computeRecusals, executeAction
  };
})();
