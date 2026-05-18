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
    (C.holders() || []).forEach(h => h.grants.forEach(g => { if (g.grant_date) grants.push(g); }));
    const dates = grants.map(g => C.vestingFor(g.grant_date).exercise_date).sort();
    return dates[0];
  })();

  // Public landing — sensitive metrics redacted. Real figures live behind login (Portal / Committee / Admin).
  const facts = [
    { label: "Fair Market Value", value: "•••••", unit: "/share", sub: "Sign in to view" },
    { label: "Exercise Price", value: "•••••", unit: "/share", sub: "Sign in to view" },
    { label: "Authorised Pool", value: "•••••", unit: "shares", sub: "Sign in to view" },
    { label: "Nearest Exercise", value: "•••••", unit: "", sub: "Sign in to view" }
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
      // Dual-capability accounts get a view picker before redirect.
      const profile = Auth.getProfile && Auth.getProfile();
      if (Auth.hasDualCapability && Auth.hasDualCapability(profile)) {
        showViewPicker(profile);
        return;
      }
      redirectByRole(res.session, returnTo);
    } catch (e) {
      errBox.textContent = "Unexpected error: " + e.message;
      errBox.style.display = "block";
      signInBtn.disabled = false; signInBtn.textContent = "Sign in";
    }
  }

  function redirectByRole(session, ret) {
    const dest = ret
      || (session.kind === "holder" ? "portal.html"
        : session.kind === "admin" ? "admin.html"
        : "committee.html");
    location.href = dest;
  }

  function showViewPicker(profile) {
    const overlay = el("div", { class: "view-picker-overlay" });
    const card = el("div", { class: "view-picker__card" });
    card.appendChild(el("div", { class: "view-picker__welcome", text: "Welcome back, " + (profile.full_name || profile.email).split(" ")[0] + "." }));
    card.appendChild(el("h3", { class: "view-picker__title", text: "How do you want to sign in today?" }));
    card.appendChild(el("p", { class: "view-picker__sub", text: "Your account has access to both views. Pick one — you can switch from the topbar at any time." }));

    const choices = el("div", { class: "view-picker__choices" });

    const holderBtn = el("button", { type: "button", class: "view-picker__choice" });
    holderBtn.appendChild(el("div", { class: "view-picker__choice-icon", text: "👤" }));
    holderBtn.appendChild(el("div", { class: "view-picker__choice-title", text: "Holder" }));
    holderBtn.appendChild(el("div", { class: "view-picker__choice-body", text: "Your personal grants, vesting, value, exercise window." }));
    holderBtn.addEventListener("click", () => {
      Auth.setActiveView("holder");
      setTimeout(() => { location.href = returnTo || "portal.html"; }, 50);
    });

    const staffBtn = el("button", { type: "button", class: "view-picker__choice" });
    staffBtn.appendChild(el("div", { class: "view-picker__choice-icon", text: profile.role === "committee" ? "⚖️" : "🛠️" }));
    staffBtn.appendChild(el("div", { class: "view-picker__choice-title", text: profile.role === "committee" ? "Committee" : "Administrator" }));
    staffBtn.appendChild(el("div", { class: "view-picker__choice-body", text: profile.role === "committee" ? "Resolutions, governance, plan administration." : "Cap table, allocations, valuations, plan admin." }));
    staffBtn.addEventListener("click", () => {
      Auth.setActiveView("staff");
      const dest = profile.role === "committee" ? "committee.html" : "admin.html";
      setTimeout(() => { location.href = returnTo || dest; }, 50);
    });

    choices.appendChild(holderBtn);
    choices.appendChild(staffBtn);
    card.appendChild(choices);

    // HLDR-P1 fix: give the picker an escape hatch. If the user closes the
    // tab mid-picker, their session was alive but no active_view was set,
    // and they'd default to profile.role forever. A "Sign out" button lets
    // them bail cleanly.
    const signOutBtn = el("button", { type: "button", class: "view-picker__signout", text: "Sign out instead" });
    signOutBtn.addEventListener("click", async () => {
      try {
        if (Auth.clearActiveView) Auth.clearActiveView();
        if (Auth.logout) await Auth.logout();
      } catch {}
      overlay.remove();
      // Stay on index.html so the login form remains visible.
    });
    card.appendChild(el("div", { style: "text-align:center; margin-top: 0.8rem;" }, [signOutBtn]));

    card.appendChild(el("p", { class: "view-picker__hint muted tiny", text: "You can switch via \"Switch view\" in the topbar." }));

    overlay.appendChild(card);
    document.body.appendChild(overlay);
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

  const guideLink = el("a", {
    href: "onboarding-guide.pdf",
    target: "_blank",
    rel: "noopener",
    class: "guide-link"
  }, [
    el("span", { class: "guide-link__icon", text: "📖" }),
    el("span", { class: "guide-link__body" }, [
      el("span", { class: "guide-link__title", text: "New here? Read the holder guide" }),
      el("span", { class: "guide-link__sub", text: "2-page PDF · signing in · what you'll see · exercise flow" })
    ])
  ]);

  const loginBox = el("div", { class: "login-box" }, [
    el("h3", { text: "Sign in" }),
    el("p", { class: "sub", text: "Confidential — Clause 15 of the Plan." }),
    form,
    guideLink
  ]);
  slot.appendChild(loginBox);

  renderFooter();
})();
