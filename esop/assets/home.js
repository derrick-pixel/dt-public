// Landing page: key facts + password-based login (holder/admin).
(function () {
  const { renderTopbar, renderFooter, el } = window.ESOPApp;
  const C = window.ESOPCalc;
  const D = window.ESOP_DATA;
  const Auth = window.ESOPAuth;
  const Store = window.ESOPStore;
  const { fmt } = C;

  renderTopbar("home");

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

  // ---- Login panel — single email+password form (post-Supabase) ----
  const slot = document.getElementById("login-slot");
  const params = new URLSearchParams(location.search);
  const returnTo = params.get("return");
  const required = params.get("required");

  const emailInput = el("input", { type: "email", placeholder: "you@elitez.asia", required: true });
  const pwInput = el("input", { type: "password", placeholder: "Password", required: true, minlength: "12" });
  const signInBtn = el("button", { type: "submit", class: "btn btn--brass" }, ["Sign in"]);
  const forgotLink = el("a", { href: "#", class: "muted tiny", text: "Forgot password?" });
  const errBox = el("div", { class: "alert alert--bad", style: "margin-top:1rem; display:none;" });
  const requiredAlert = required
    ? el("div", { class: "alert alert--warn", style: "margin-bottom:1rem;",
        text: "That page requires you to sign in." })
    : null;

  async function attemptLogin() {
    errBox.style.display = "none";
    const email = emailInput.value.trim();
    const password = pwInput.value;
    if (!email || !password) { (email ? pwInput : emailInput).focus(); return; }
    signInBtn.disabled = true; signInBtn.textContent = "Signing in…";
    try {
      const res = await Auth.login(email, password);
      if (!res.ok) {
        errBox.textContent = res.reason === "Invalid login credentials"
          ? "Email or password incorrect."
          : "Sign-in failed: " + res.reason;
        errBox.style.display = "block";
        signInBtn.disabled = false; signInBtn.textContent = "Sign in";
        return;
      }
      const dest = returnTo
        || (res.session.kind === "holder" ? "portal.html"
          : res.session.kind === "admin" ? "admin.html"
          : "committee.html");
      location.href = dest;
    } catch (e) {
      errBox.textContent = "Unexpected error: " + e.message;
      errBox.style.display = "block";
      signInBtn.disabled = false; signInBtn.textContent = "Sign in";
    }
  }

  forgotLink.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim() || prompt("Your work email:");
    if (!email) return;
    const res = await Auth.requestPasswordReset(email);
    alert(res.ok
      ? "Password reset email sent if the address is registered."
      : "Could not send reset: " + res.reason);
  });

  const form = el("form", { class: "login-form" }, [
    requiredAlert,
    el("div", { class: "field" }, [ el("label", { text: "Email" }), emailInput ]),
    el("div", { class: "field" }, [ el("label", { text: "Password" }), pwInput ]),
    signInBtn,
    el("div", { style: "margin-top:0.8rem;" }, [ forgotLink ]),
    errBox
  ]);
  form.addEventListener("submit", (e) => { e.preventDefault(); attemptLogin(); });

  const loginBox = el("div", { class: "login-box" }, [
    el("h3", { text: "Sign in" }),
    el("p", { class: "sub", text: "Confidential — Clause 15 of the Plan." }),
    form
  ]);
  slot.appendChild(loginBox);

  renderFooter();
})();
