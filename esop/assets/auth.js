// Elitez ESOP — authentication.
// Three session kinds:
//   - holder     { kind, id, name, label, issued_at, expires_at }
//   - committee  { kind, member_id, name, role, label, issued_at, expires_at }
//   - admin      (legacy shared code — kept for ops-only fallback, discouraged)
//
// All passwords are hashed with SHA-256 via Web Crypto and persisted in the
// event store (localStorage). Per-member Committee sessions enable real
// attribution and voting; shared admin code remains as a demo shortcut and
// can be disabled by setting ESOPAuth.DISABLE_LEGACY_ADMIN = true.

(function () {
  const SESSION_KEY = "elitez_esop_session";
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const DISABLE_LEGACY_ADMIN = false; // flip to true after all members have set passwords

  function readSession() {
    try {
      const s = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      if (!s) return null;
      if (s.expires_at && Date.now() > s.expires_at) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return s;
    } catch { return null; }
  }

  function writeSession(payload) {
    const now = Date.now();
    const s = { ...payload, issued_at: now, expires_at: now + ONE_DAY };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    return s;
  }

  function clearSession() { sessionStorage.removeItem(SESSION_KEY); }

  // ---- Holder login ---------------------------------------------------

  async function loginHolder(holderId, password) {
    const store = window.ESOPStore;
    const st = store.state();
    const existing = st.passwords[holderId];
    const holder = window.ESOP_DATA.holders.find(h => h.id === holderId);
    if (!holder) return { ok: false, reason: "unknown_holder" };
    const hash = await store.hashPassword(password);
    if (!existing) {
      store.emit("password_set", { subject: holderId, hash, bootstrap: true });
      store.emit("login", { kind: "holder", id: holderId, name: holder.name, first_time: true });
      const session = writeSession({ kind: "holder", id: holder.id, name: holder.name, label: holder.name.split(" ")[0] + " · Holder" });
      return { ok: true, session, first_time: true };
    }
    if (existing !== hash) return { ok: false, reason: "bad_password" };
    store.emit("login", { kind: "holder", id: holderId, name: holder.name });
    const session = writeSession({ kind: "holder", id: holder.id, name: holder.name, label: holder.name.split(" ")[0] + " · Holder" });
    return { ok: true, session };
  }

  // ---- Committee login (per-member) -----------------------------------

  function committeeSubjectId(memberId) { return "member:" + memberId; }

  async function loginCommitteeMember(email, password) {
    const store = window.ESOPStore;
    const Committee = window.ESOPCommittee;
    if (!Committee) return { ok: false, reason: "committee_module_missing" };
    const mem = Committee.memberByEmail(email);
    if (!mem) return { ok: false, reason: "unknown_email" };
    const subject = committeeSubjectId(mem.id);
    const st = store.state();
    const existing = st.passwords[subject];
    const hash = await store.hashPassword(password);

    if (!existing) {
      // First-time login for a seeded member — the password typed becomes theirs.
      store.emit("password_set", { subject, hash, bootstrap: true });
      store.emit("login", { kind: "committee", member_id: mem.id, name: mem.name, role: mem.role, first_time: true });
      const session = writeSession({
        kind: "committee", member_id: mem.id, name: mem.name, role: mem.role,
        label: `${mem.name.split(/[,\s]/)[0]} · ${mem.role === "major" ? "Major" : "Senior"}`
      });
      return { ok: true, session, first_time: true };
    }
    if (existing !== hash) return { ok: false, reason: "bad_password" };
    store.emit("login", { kind: "committee", member_id: mem.id, name: mem.name, role: mem.role });
    const session = writeSession({
      kind: "committee", member_id: mem.id, name: mem.name, role: mem.role,
      label: `${mem.name.split(/[,\s]/)[0]} · ${mem.role === "major" ? "Major" : "Senior"}`,
      show_confidentiality_notice: true
    });
    return { ok: true, session };
  }

  // ---- Legacy shared admin (kept for ops, narrow path) ---------------

  async function ensureAdminBootstrap() {
    if (DISABLE_LEGACY_ADMIN) return;
    const store = window.ESOPStore;
    const st = store.state();
    if (!st.passwords["admin"]) {
      const hash = await store.hashPassword("elitez2026");
      store.emit("password_set", { subject: "admin", hash, bootstrap: true });
    }
  }

  async function loginAdmin(password) {
    if (DISABLE_LEGACY_ADMIN) return { ok: false, reason: "legacy_admin_disabled" };
    const store = window.ESOPStore;
    await ensureAdminBootstrap();
    const st = store.state();
    const hash = await store.hashPassword(password);
    if (st.passwords["admin"] !== hash) return { ok: false, reason: "bad_password" };
    store.emit("login", { kind: "admin", name: "Committee (legacy)" });
    const session = writeSession({ kind: "admin", name: "Committee", label: "Legacy admin · read-only" });
    return { ok: true, session };
  }

  // ---- Password maintenance ------------------------------------------

  async function changePassword(subject, oldPw, newPw) {
    const store = window.ESOPStore;
    const st = store.state();
    const oldHash = await store.hashPassword(oldPw);
    if (st.passwords[subject] && st.passwords[subject] !== oldHash) return { ok: false, reason: "bad_old_password" };
    if (!newPw || newPw.length < 6) return { ok: false, reason: "weak_password" };
    const newHash = await store.hashPassword(newPw);
    store.emit("password_set", { subject, hash: newHash });
    return { ok: true };
  }

  async function adminResetHolderPassword(holderId, tempPassword) {
    const store = window.ESOPStore;
    const hash = await store.hashPassword(tempPassword);
    store.emit("password_set", { subject: holderId, hash, reset_by_admin: true });
  }

  async function resetCommitteeMemberPassword(memberId, tempPassword) {
    const store = window.ESOPStore;
    const hash = await store.hashPassword(tempPassword);
    store.emit("password_set", { subject: committeeSubjectId(memberId), hash, reset_by_admin: true });
  }

  // ---- Route guard ---------------------------------------------------

  function requireSession(kind) {
    const s = readSession();
    if (!s) {
      const p = new URLSearchParams({ return: location.pathname.split("/").pop(), required: kind || "any" });
      location.href = "index.html?" + p.toString();
      return null;
    }
    // Committee sessions are "stronger" than plain admin; they satisfy admin-kind guards.
    const committeeSatisfiesAdmin = kind === "admin" && s.kind === "committee";
    if (kind && s.kind !== kind && !committeeSatisfiesAdmin && !(kind === "holder" && (s.kind === "admin" || s.kind === "committee"))) {
      const p = new URLSearchParams({ return: location.pathname.split("/").pop(), required: kind });
      location.href = "index.html?" + p.toString();
      return null;
    }
    return s;
  }

  window.ESOPAuth = {
    DISABLE_LEGACY_ADMIN,
    readSession, writeSession, clearSession,
    ensureAdminBootstrap,
    loginHolder, loginCommitteeMember, loginAdmin,
    changePassword, adminResetHolderPassword, resetCommitteeMemberPassword,
    requireSession,
    committeeSubjectId
  };
})();
