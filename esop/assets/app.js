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
    // Nav visibility is gated by auth state:
    //   - Home is always public
    //   - Portfolio / Trading / Plan Rules / Market Intel: any signed-in user
    //   - Administrator: admins and committee only
    // Anyone clicking a private link before signing in would just bounce to
    // the login page anyway, so hiding the links avoids leaking the platform's
    // structure to drive-by visitors and keeps the landing nav minimal.
    const allLinks = [
      { href: "index.html",       label: "Home",          page: "home",    needs: "public" },
      { href: "portal.html",      label: "Portfolio",     page: "portal",  needs: "holder" },
      { href: "trading.html",     label: "Trading",       page: "trading", needs: "holder" },
      { href: "admin.html",       label: "Administrator", page: "admin",   needs: "admin" },
      { href: "scheme.html",      label: "Plan Rules",    page: "scheme",  needs: "auth" },
      { href: "intel/index.html", label: "Market Intel",  page: "intel",   needs: "auth" }
    ];
    const navLinks = allLinks.filter(l => {
      if (l.needs === "public") return true;
      if (!s) return false;
      if (l.needs === "admin")  return s.kind === "admin" || s.kind === "committee";
      if (l.needs === "holder") return s.kind === "holder";
      return true; // l.needs === "auth"
    });

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

    // Help / welcome tour button — always visible (no auth required) so a
    // confused user can re-open the walkthrough any time without hunting
    // through the footer.
    const helpBtn = el("button", {
      type: "button",
      class: "topbar-help",
      title: "Take the welcome tour",
      "aria-label": "Take the welcome tour"
    }, ["?"]);
    helpBtn.addEventListener("click", () => {
      if (window.ESOPTutorial && window.ESOPTutorial.open) {
        window.ESOPTutorial.open();
      } else {
        window.open("onboarding-guide.pdf", "_blank");
      }
    });
    slot.appendChild(helpBtn);

    if (s) {
      const signout = el("button", { type: "button" }, ["Sign out"]);
      signout.addEventListener("click", async () => {
        if (window.ESOPAuth && window.ESOPAuth.logout) {
          await window.ESOPAuth.logout();
        } else {
          clearSession();
          window.location.href = "index.html";
        }
      });
      const chipChildren = [
        el("span", { class: "dot" }),
        el("span", { text: s.label || s.name })
      ];
      // Show which view a dual-capable user is currently in, with a quick
      // toggle to flip to the other view.
      if (s.dual_capable) {
        const otherView = s.kind === "holder" ? "staff" : "holder";
        const otherLabel = otherView === "holder" ? "Switch to Holder" :
          (s.profile_role === "committee" ? "Switch to Committee" : "Switch to Admin");
        const switcher = el("button", { type: "button", class: "view-switcher", text: otherLabel });
        switcher.addEventListener("click", () => {
          if (window.ESOPAuth && window.ESOPAuth.setActiveView) {
            window.ESOPAuth.setActiveView(otherView);
            setTimeout(() => {
              location.href = otherView === "holder" ? "portal.html"
                : s.profile_role === "committee" ? "committee.html" : "admin.html";
            }, 50);
          }
        });
        chipChildren.push(el("span", { class: "view-tag", text: s.kind === "holder" ? "Holder view" : (s.profile_role === "committee" ? "Committee view" : "Admin view") }));
        chipChildren.push(switcher);
      }
      chipChildren.push(signout);
      const chip = el("div", { class: "session-chip" }, chipChildren);
      slot.appendChild(chip);

      // Admin/committee: show 24h failed-login count as a small badge in the topbar.
      if ((s.kind === "admin" || s.kind === "committee") && window.ESOPSupa) {
        const badge = el("button", {
          type: "button",
          class: "badge badge-warning",
          style: "margin-left: 0.6rem; display: none;",
          title: "Failed sign-in attempts (last 24h). Click to filter the Activity Log.",
          text: "0",
        });
        slot.appendChild(badge);
        const refreshBadge = async () => {
          try {
            const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
            const { count } = await window.ESOPSupa.client
              .from("audit_log")
              .select("*", { count: "exact", head: true })
              .eq("action", "login_failed")
              .gte("at", since);
            if (count == null || count === 0) {
              badge.style.display = "none";
            } else {
              badge.textContent = "⚠ " + count + " failed sign-ins (24h)";
              badge.style.display = "inline-block";
            }
          } catch (_e) { /* ignore */ }
        };
        badge.addEventListener("click", () => {
          const dest = (activePage === "committee" ? "committee.html" : "admin.html") + "#activity";
          window.location.href = dest;
        });
        refreshBadge();
        setInterval(refreshBadge, 60000);
      }
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

    // Tour re-trigger — visible on every page that renders the footer.
    const tourLink = el("button", { type: "button", class: "tour-trigger", text: "Take the welcome tour" });
    tourLink.addEventListener("click", () => {
      if (window.ESOPTutorial && window.ESOPTutorial.open) window.ESOPTutorial.open();
    });
    const guidePdf = el("a", { href: "onboarding-guide.pdf", target: "_blank", rel: "noopener", class: "tour-trigger", style: "margin-left: 1rem; text-decoration: underline;", text: "Download the holder guide (PDF)" });
    const helpRow = el("div", { class: "muted tiny", style: "margin-top: 0.6rem;" }, [tourLink, guidePdf]);

    const leftStack = el("div", null, [left, helpRow]);
    const f = el("footer", { class: "site" }, [leftStack, right]);
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
