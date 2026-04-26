// Landing page: key facts + password-based login (holder/admin).
(function () {
  const { renderTopbar, renderFooter, el } = window.ESOPApp;
  const C = window.ESOPCalc;
  const D = window.ESOP_DATA;
  const Auth = window.ESOPAuth;
  const Store = window.ESOPStore;
  const { fmt } = C;

  renderTopbar("home");
  // Ensure admin password is bootstrapped so the audit log captures it.
  Auth.ensureAdminBootstrap();

  // ---- Key facts block ----
  const v = C.activeValuation();
  const pool = C.poolUsage();
  const milestone = (() => {
    const grants = [];
    D.holders.forEach(h => h.grants.forEach(g => { if (g.grant_date) grants.push(g); }));
    const dates = grants.map(g => C.vestingFor(g.grant_date).exercise_date).sort();
    return dates[0];
  })();

  const facts = [
    { label: "Fair Market Value", value: fmt.sgd(v.fmv, 4), unit: "/share", sub: `${v.fy} · EBITDA × ${v.multiple}` },
    { label: "Exercise Price", value: fmt.sgd(v.exercise_price, 4), unit: "/share", sub: "90% discount to FMV" },
    { label: "Authorised Pool", value: fmt.num(pool.authorised), unit: "shares", sub: `${fmt.pct(pool.used_pct)} allocated (incl. FY2025 draft)` },
    { label: "Nearest Exercise", value: fmt.date(milestone), unit: "", sub: `${D.grants_history.find(g => g.fy === "FY2022")?.total.toLocaleString()} FY2022 options` }
  ];
  const kf = document.getElementById("keyfacts");
  facts.forEach(f => {
    const stat = el("div", { class: "stat" }, [
      el("div", { class: "label", text: f.label }),
      el("div", null, [
        el("span", { class: "value", text: f.value }),
        el("span", { class: "unit", text: " " + f.unit })
      ]),
      el("div", { class: "sub", text: f.sub })
    ]);
    kf.appendChild(stat);
  });

  // ---- Login panel ----
  const slot = document.getElementById("login-slot");
  const params = new URLSearchParams(location.search);
  const returnTo = params.get("return");
  const required = params.get("required");

  // Holder tab
  const holderSelect = el("select", { id: "holder-select" });
  holderSelect.appendChild(el("option", { value: "", text: "Select your name…" }));
  D.holders.forEach(h => holderSelect.appendChild(el("option", { value: String(h.id), text: `${h.name} — ${h.title}` })));
  const holderPw = el("input", { type: "password", placeholder: "Password", id: "holder-pw" });
  const holderFirstTimeHint = el("p", { class: "muted tiny", style: "margin-top:0.4rem; display:none;", text: "First time signing in? The password you enter now becomes your password for next time." });
  const holderBtn = el("button", { type: "button", class: "btn" }, ["Enter your portfolio"]);
  const holderErr = el("div", { class: "alert alert--bad", style: "margin-top:1rem; display:none;" });

  holderSelect.addEventListener("change", () => {
    if (!holderSelect.value) { holderFirstTimeHint.style.display = "none"; return; }
    const id = Number(holderSelect.value);
    const st = Store.state();
    holderFirstTimeHint.style.display = st.passwords[id] ? "none" : "block";
  });

  holderBtn.addEventListener("click", async () => {
    holderErr.style.display = "none";
    const id = Number(holderSelect.value);
    if (!id) { holderSelect.focus(); return; }
    if (!holderPw.value) { holderPw.focus(); return; }
    holderBtn.disabled = true;
    holderBtn.textContent = "Signing in…";
    try {
      const res = await Auth.loginHolder(id, holderPw.value);
      if (!res.ok) {
        holderErr.textContent = res.reason === "bad_password" ? "Incorrect password. Try again or contact HR to reset." : "Sign-in failed.";
        holderErr.style.display = "block";
        holderBtn.disabled = false; holderBtn.textContent = "Enter your portfolio";
        return;
      }
      location.href = returnTo || "portal.html";
    } catch (e) {
      holderErr.textContent = "Unexpected error: " + e.message;
      holderErr.style.display = "block";
      holderBtn.disabled = false; holderBtn.textContent = "Enter your portfolio";
    }
  });

  const holderPane = el("div", null, [
    el("p", { class: "sub", text: "Pick your name and sign in. On first sign-in, the password you enter becomes your password — remember it, or ask Committee/HR to reset via the admin console." }),
    el("div", { class: "field" }, [ el("label", { text: "Who are you?" }), holderSelect ]),
    el("div", { class: "field" }, [ el("label", { text: "Password" }), holderPw ]),
    holderFirstTimeHint,
    holderBtn,
    holderErr,
    (required === "admin" || required === "committee") ? el("div", { class: "alert alert--warn", style: "margin-top:1rem;", text: "That page requires a Committee session." }) : null
  ]);

  // Committee tab (per-member email + password)
  const committeeEmail = el("input", { type: "email", placeholder: "you@elitez.asia" });
  const committeePw = el("input", { type: "password", placeholder: "Password" });
  const committeeHint = el("p", { class: "muted tiny", style: "margin-top:0.4rem; display:none;", text: "First sign-in for this seat — the password you enter becomes yours." });
  const committeeBtn = el("button", { type: "button", class: "btn btn--brass" }, ["Enter Committee view"]);
  const committeeErr = el("div", { class: "alert alert--bad", style: "margin-top:1rem; display:none;" });

  committeeEmail.addEventListener("blur", () => {
    const Committee = window.ESOPCommittee;
    const mem = Committee && Committee.memberByEmail(committeeEmail.value);
    if (!mem) { committeeHint.style.display = "none"; return; }
    const st = Store.state();
    const subject = Auth.committeeSubjectId(mem.id);
    committeeHint.style.display = st.passwords[subject] ? "none" : "block";
  });

  committeeBtn.addEventListener("click", async () => {
    committeeErr.style.display = "none";
    if (!committeeEmail.value.trim() || !committeePw.value) { committeeEmail.focus(); return; }
    committeeBtn.disabled = true; committeeBtn.textContent = "Signing in…";
    try {
      const res = await Auth.loginCommitteeMember(committeeEmail.value.trim(), committeePw.value);
      if (!res.ok) {
        committeeErr.textContent = res.reason === "unknown_email"
          ? "No Committee seat registered to that email. Check with the Chair."
          : res.reason === "bad_password" ? "Incorrect password."
          : "Sign-in failed: " + res.reason;
        committeeErr.style.display = "block";
        committeeBtn.disabled = false; committeeBtn.textContent = "Enter Committee view";
        return;
      }
      location.href = returnTo || "committee.html";
    } catch (e) {
      committeeErr.textContent = "Unexpected error: " + e.message;
      committeeErr.style.display = "block";
      committeeBtn.disabled = false; committeeBtn.textContent = "Enter Committee view";
    }
  });

  const committeeMembersList = (window.ESOPCommittee ? window.ESOPCommittee.roster() : []).map(m => m.email).join(", ");
  const committeePane = el("div", { style: "display:none;" }, [
    el("p", { class: "sub", text: "Per-member login for the 5-seat Committee (3 Majors + 2 Senior Employees per Clause 5.2). Every vote and decision is attributed to your seat." }),
    el("div", { class: "field" }, [ el("label", { text: "Email" }), committeeEmail ]),
    el("div", { class: "field" }, [ el("label", { text: "Password" }), committeePw ]),
    committeeHint,
    committeeBtn,
    committeeErr,
    committeeMembersList
      ? el("p", { class: "muted tiny", style: "margin-top:0.8rem;" }, [
          "Current seats: ",
          el("code", { text: committeeMembersList })
        ])
      : null,
    required === "committee" ? el("div", { class: "alert alert--warn", style: "margin-top:1rem;", text: "That page requires a Committee session." }) : null
  ]);

  // Legacy shared admin — hidden by default behind a toggle
  const adminPw = el("input", { type: "password", placeholder: "Legacy shared code" });
  const adminBtn = el("button", { type: "button", class: "btn btn--ghost" }, ["Enter legacy admin"]);
  const adminErr = el("div", { class: "alert alert--bad", style: "margin-top:1rem; display:none;" });
  adminBtn.addEventListener("click", async () => {
    adminErr.style.display = "none";
    adminBtn.disabled = true; adminBtn.textContent = "Signing in…";
    try {
      const res = await Auth.loginAdmin(adminPw.value.trim());
      if (!res.ok) {
        adminErr.textContent = "Access code incorrect.";
        adminErr.style.display = "block";
        adminBtn.disabled = false; adminBtn.textContent = "Enter legacy admin";
        return;
      }
      location.href = returnTo || "admin.html";
    } catch (e) {
      adminErr.textContent = "Unexpected error: " + e.message;
      adminErr.style.display = "block";
      adminBtn.disabled = false; adminBtn.textContent = "Enter legacy admin";
    }
  });
  const legacyToggle = el("a", { href: "#", text: "Legacy shared code (read-only) →", style: "font-size:0.78rem; color: var(--muted); margin-top: 0.8rem; display: inline-block;" });
  const legacyPane = el("div", { style: "display:none; margin-top:0.8rem;" }, [
    el("p", { class: "sub muted tiny", text: "Older shortcut from v1 — no vote attribution. Use only for demo / read-only views. Default: elitez2026." }),
    el("div", { class: "field" }, [ el("label", { text: "Access code" }), adminPw ]),
    adminBtn,
    adminErr
  ]);
  legacyToggle.addEventListener("click", (e) => {
    e.preventDefault();
    legacyPane.style.display = legacyPane.style.display === "none" ? "" : "none";
  });

  // Tabs
  const tabHolder = el("button", { type: "button", class: "active" }, ["Holder"]);
  const tabCommittee = el("button", { type: "button" }, ["Committee"]);
  const tabs = el("div", { class: "tabs", style: "margin-bottom:1.6rem;" }, [tabHolder, tabCommittee]);
  tabHolder.addEventListener("click", () => {
    tabHolder.classList.add("active"); tabCommittee.classList.remove("active");
    holderPane.style.display = ""; committeePane.style.display = "none";
    legacyToggle.style.display = "none"; legacyPane.style.display = "none";
  });
  tabCommittee.addEventListener("click", () => {
    tabCommittee.classList.add("active"); tabHolder.classList.remove("active");
    committeePane.style.display = ""; holderPane.style.display = "none";
    legacyToggle.style.display = "inline-block";
  });
  legacyToggle.style.display = "none";

  const loginBox = el("div", { class: "login-box" }, [
    el("h3", { text: "Sign in" }),
    el("p", { class: "sub", text: "Confidential — Clause 15 of the Plan." }),
    tabs,
    holderPane,
    committeePane,
    legacyToggle,
    legacyPane
  ]);
  slot.appendChild(loginBox);

  if (required === "committee") {
    tabCommittee.click();
  }

  // Enter key submits the active pane
  holderPw.addEventListener("keydown", e => { if (e.key === "Enter") holderBtn.click(); });
  committeePw.addEventListener("keydown", e => { if (e.key === "Enter") committeeBtn.click(); });
  adminPw.addEventListener("keydown", e => { if (e.key === "Enter") adminBtn.click(); });

  renderFooter();
})();
