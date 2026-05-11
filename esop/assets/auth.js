// Elitez ESOP — authentication, backed by Supabase Auth.
//
// Session shape (preserved from the legacy implementation so existing
// consumers don't break):
//   { kind, id, name, email, label, member_id?, role?, issued_at, expires_at }
//
// kind: 'holder' | 'committee' | 'admin' (from profiles.role)
// id:   holder_id when kind=holder; profile.id otherwise (for compatibility)
// member_id: profile.id (committee callers used this)
//
// Page entrypoints MUST `await ESOPAuth.ready()` before calling requireSession
// or readSession. Calling them earlier returns null and can mis-trigger a
// redirect to index.html.
(function () {
  if (!window.ESOPSupa) {
    console.warn("ESOPAuth: ESOPSupa not initialized; auth unavailable.");
    return;
  }
  const supa = window.ESOPSupa.client;
  let cachedSession = null;
  let cachedProfile = null;

  async function loadProfile(userId) {
    const { data, error } = await supa.from("profiles").select("*").eq("id", userId).single();
    if (error) return null;
    return data;
  }

  function buildSession(authSession, profile) {
    if (!authSession || !profile) return null;
    return {
      kind: profile.role,
      id: profile.holder_id || profile.id,
      name: profile.full_name,
      email: profile.email,
      label: profile.full_name,
      member_id: profile.id,
      role: profile.committee_seat,
      issued_at: authSession.created_at,
      expires_at: (authSession.expires_at ?? 0) * 1000,
    };
  }

  async function refresh() {
    const { data: { session } } = await supa.auth.getSession();
    if (!session) { cachedSession = null; cachedProfile = null; return null; }
    if (!cachedProfile || cachedProfile.id !== session.user.id) {
      cachedProfile = await loadProfile(session.user.id);
    }
    cachedSession = buildSession(session, cachedProfile);
    return cachedSession;
  }

  const initPromise = refresh();

  supa.auth.onAuthStateChange((_event, session) => {
    if (!session) { cachedSession = null; cachedProfile = null; return; }
    loadProfile(session.user.id).then((p) => {
      cachedProfile = p;
      cachedSession = buildSession(session, p);
    });
  });

  // ---- Public API (legacy-compatible) -------------------------------------

  function readSession() { return cachedSession; }
  function writeSession() { return cachedSession; }
  function clearSession() { cachedSession = null; cachedProfile = null; }

  async function ready() { await initPromise; return cachedSession; }

  function requireSession(kind) {
    const s = cachedSession;
    if (!s) {
      const p = new URLSearchParams({ return: location.pathname.split("/").pop(), required: kind || "any" });
      location.href = "index.html?" + p.toString();
      return null;
    }
    const committeeSatisfiesAdmin = kind === "admin" && s.kind === "committee";
    if (kind && s.kind !== kind && !committeeSatisfiesAdmin &&
        !(kind === "holder" && (s.kind === "admin" || s.kind === "committee"))) {
      const p = new URLSearchParams({ return: location.pathname.split("/").pop(), required: kind });
      location.href = "index.html?" + p.toString();
      return null;
    }
    return s;
  }

  async function login(email, password) {
    const { error } = await supa.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, reason: error.message };
    await refresh();
    return { ok: true, session: cachedSession };
  }

  async function logout() {
    await supa.auth.signOut();
    cachedSession = null; cachedProfile = null;
    location.href = "index.html";
  }

  // Legacy wrappers — accept either an email or a holder_id (the original API
  // accepted an integer holder id from the seed data). Modern callers should
  // pass email. The committee_email signature is the same shape.
  async function loginHolder(emailOrId, password) {
    let email = emailOrId;
    if (typeof emailOrId !== "string" || !emailOrId.includes("@")) {
      const { data } = await supa.from("profiles").select("email")
        .eq("holder_id", String(emailOrId)).maybeSingle();
      if (!data) return { ok: false, reason: "unknown_holder" };
      email = data.email;
    }
    const r = await login(email, password);
    if (!r.ok) return { ok: false, reason: r.reason === "Invalid login credentials" ? "bad_password" : r.reason };
    return { ok: true, session: cachedSession };
  }

  async function loginCommitteeMember(email, password) {
    const r = await login(email, password);
    if (!r.ok) return { ok: false, reason: r.reason === "Invalid login credentials" ? "bad_password" : r.reason };
    return { ok: true, session: cachedSession };
  }

  // Legacy elitez2026 shared code path — REMOVED in this launch.
  async function loginAdmin() {
    return { ok: false, reason: "legacy_admin_disabled" };
  }

  async function changePassword(_subject, oldPw, newPw) {
    if (!cachedSession) return { ok: false, reason: "not_signed_in" };
    if (!newPw || newPw.length < 12) return { ok: false, reason: "weak_password" };
    const { error: e1 } = await supa.auth.signInWithPassword({ email: cachedSession.email, password: oldPw });
    if (e1) return { ok: false, reason: "bad_old_password" };
    const { error: e2 } = await supa.auth.updateUser({ password: newPw });
    if (e2) return { ok: false, reason: e2.message };
    return { ok: true };
  }

  async function requestPasswordReset(email) {
    const { error } = await supa.auth.resetPasswordForEmail(email, {
      redirectTo: location.origin + "/reset-password.html"
    });
    return error ? { ok: false, reason: error.message } : { ok: true };
  }

  // No-ops retained for compatibility. Real reset goes through the magic-link
  // invite path (Edge Function admin-invite, plan task 16).
  async function adminResetHolderPassword() { return; }
  async function resetCommitteeMemberPassword() { return; }
  async function ensureAdminBootstrap() { return; }

  function committeeSubjectId(memberId) { return "member:" + memberId; }

  window.ESOPAuth = {
    DISABLE_LEGACY_ADMIN: true,
    readSession, writeSession, clearSession,
    ensureAdminBootstrap,
    loginHolder, loginCommitteeMember, loginAdmin,
    login, logout,
    changePassword, requestPasswordReset,
    adminResetHolderPassword, resetCommitteeMemberPassword,
    requireSession, ready,
    committeeSubjectId
  };
})();
