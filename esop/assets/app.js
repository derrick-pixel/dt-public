// Elitez ESOP — shared chrome: topbar, session, nav, footer.
// Session/auth is delegated to ESOPAuth (assets/auth.js).
(function () {
  function session() { return window.ESOPAuth ? window.ESOPAuth.readSession() : null; }
  function clearSession() { if (window.ESOPAuth) window.ESOPAuth.clearSession(); }

  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k.startsWith("on") && typeof attrs[k] === "function") n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    const flat = (children || []).flat(Infinity);
    flat.forEach(c => {
      if (c == null) return;
      if (typeof c === "string" || typeof c === "number") n.appendChild(document.createTextNode(String(c)));
      else if (c instanceof Node) n.appendChild(c);
      // Silently drop anything else rather than crashing the whole page.
    });
    return n;
  }

  // Once-per-session confidentiality reminder for Committee members.
  // Triggered after successful login (auth.js sets show_confidentiality_notice flag).
  function maybeShowConfidentialityReminder() {
    const s = session();
    if (!s || !s.show_confidentiality_notice || s.kind !== "committee") return;
    // Only once per session
    if (sessionStorage.getItem("elitez_confidentiality_shown") === "1") return;
    sessionStorage.setItem("elitez_confidentiality_shown", "1");
    setTimeout(() => {
      const overlay = document.createElement("div");
      overlay.setAttribute("style", "position:fixed; inset:0; background: rgba(14,38,64,0.85); z-index: 600; display:flex; align-items:center; justify-content:center; padding: 20px;");
      const card = document.createElement("div");
      card.setAttribute("style", "background: var(--paper); border: 1px solid var(--line-strong); padding: 2.2rem 2.4rem; max-width: 520px; font-family: var(--serif);");
      const h = document.createElement("h3");
      h.style.cssText = "font-family: var(--serif); font-size: 1.4rem; font-weight: 500; margin-bottom: 1rem; color: var(--ink);";
      h.textContent = "Confidentiality reminder";
      const eyebrow = document.createElement("div");
      eyebrow.className = "micro";
      eyebrow.style.color = "var(--accent)";
      eyebrow.style.marginBottom = "0.5rem";
      eyebrow.textContent = "Clause 15 · The Elitez Employee Share Option Plan";
      const p1 = document.createElement("p");
      p1.style.cssText = "color: var(--ink-soft); line-height: 1.6; margin-bottom: 1rem; font-style: italic;";
      p1.textContent = "Everything you see on this platform — Plan terms, individual grants, valuations, votes, dividend amounts — is confidential. Don't share, screenshot to chat groups, or discuss outside Committee channels.";
      const p2 = document.createElement("p");
      p2.style.cssText = "color: var(--muted); font-size: 0.88rem; line-height: 1.55; margin-bottom: 1.4rem; font-family: var(--sans); font-style: normal;";
      p2.textContent = "Permitted exceptions: disclosure required by law or tax authority; with written Company consent; to a spouse or licensed advisor in strict confidence.";
      const btn = document.createElement("button");
      btn.className = "btn btn--brass";
      btn.textContent = "Acknowledged";
      btn.style.width = "100%";
      btn.onclick = () => overlay.remove();
      card.appendChild(eyebrow);
      card.appendChild(h);
      card.appendChild(p1);
      card.appendChild(p2);
      card.appendChild(btn);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
    }, 400);
  }

  function renderTopbar(activePage) {
    const s = session();
    const navLinks = [
      { href: "index.html", label: "Home", page: "home" },
      { href: "portal.html", label: "Portfolio", page: "portal" },
      { href: "trading.html", label: "Trading", page: "trading" },
      { href: "admin.html", label: "Administrator", page: "admin" },
      { href: "scheme.html", label: "Plan Rules", page: "scheme" },
      { href: "intel/index.html", label: "Market Intel", page: "intel" }
    ];

    const brand = el("a", { href: "index.html", class: "brand" }, [
      el("img", { class: "wordmark", src: "assets/brand/elitez-wordmark.png", alt: "Elitez" }),
      el("span", { class: "divider" }),
      el("em", { text: "ESOP" })
    ]);
    const nav = el("nav", null, navLinks.map(l => {
      const a = el("a", { href: l.href }, [l.label]);
      if (l.page === activePage) a.classList.add("active");
      return a;
    }));
    const slot = el("div", { id: "session-slot" });

    const bar = el("header", { class: "topbar" }, [brand, nav, slot]);
    document.body.prepend(bar);

    if (s) {
      const signout = el("button", { type: "button" }, ["Sign out"]);
      signout.addEventListener("click", () => { clearSession(); window.location.href = "index.html"; });
      const chip = el("div", { class: "session-chip" }, [
        el("span", { class: "dot" }),
        el("span", { text: s.label || s.name }),
        signout
      ]);
      slot.appendChild(chip);
    } else {
      const dot = el("span", { class: "dot", style: "background: var(--muted);" });
      const chip = el("a", { href: "index.html", class: "session-chip", style: "text-decoration:none;" }, [
        dot, el("span", { text: "Not signed in" })
      ]);
      slot.appendChild(chip);
    }
  }

  function renderFooter() {
    const left = el("div", null, [
      el("span", { class: "mark", text: "Elitez ESOP" }),
      document.createTextNode(" — Operational platform for The Elitez Employee Share Option Plan (adopted 5 Oct 2025). "),
      el("span", { class: "muted", text: "Demo build · data as of 23 Apr 2026." })
    ]);
    const right = el("div", { class: "confidential", text: "Confidential under Clause 15 of the Plan. Your Letter of Offer and the Plan document are the legally binding instruments. This platform summarises, it does not replace them." });
    const f = el("footer", { class: "site" }, [left, right]);
    document.body.appendChild(f);
  }

  function requireSession(kind) {
    if (window.ESOPAuth) return window.ESOPAuth.requireSession(kind);
    return null;
  }

  // Sub-tab strip used on the admin console (and the committee page, which
  // is reached via the Governance sub-tab). Tabs are URL-based so browser
  // back/forward behaves naturally.
  const SUBTABS = [
    { tab: "overview",    label: "Overview",          href: "admin.html#overview" },
    { tab: "holders",     label: "Holders & Grants",  href: "admin.html#holders" },
    { tab: "valuations",  label: "Valuations",        href: "admin.html#valuations" },
    { tab: "documents",   label: "Exercises & Docs",  href: "admin.html#documents" },
    { tab: "governance",  label: "Governance",        href: "committee.html" },
    { tab: "audit",       label: "Audit",             href: "admin.html#audit" }
  ];

  function renderSubTabs(activeTab) {
    if (document.querySelector(".subtabs")) return; // already present
    const strip = el("div", { class: "subtabs" }, SUBTABS.map(t => {
      const a = el("a", { href: t.href, "data-subtab": t.tab }, [t.label]);
      if (t.tab === activeTab) a.classList.add("active");
      return a;
    }));
    const tb = document.querySelector(".topbar");
    if (tb && tb.parentNode) tb.parentNode.insertBefore(strip, tb.nextSibling);
    else document.body.prepend(strip);
  }

  // Back-compat shim for any callers
  function readSession() { return session(); }
  function writeSession(payload) { return window.ESOPAuth ? window.ESOPAuth.writeSession(payload) : null; }

  window.ESOPApp = { readSession, writeSession, clearSession, renderTopbar, renderFooter, renderSubTabs, requireSession, el, SUBTABS, maybeShowConfidentialityReminder };
})();
