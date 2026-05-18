// Tutorial / first-time tour for holders. Auto-launches once per browser
// (gated by localStorage flag `esop_tutorial_seen`). Anyone can re-open
// the tour via the "Take the tour" link the topbar/footer renders.
//
// Design: one modal overlay, 5 cards, prev/next/skip controls. Each card
// is self-contained text + an icon — no DOM-element pointing or
// scroll-targeting (that's brittle across pages). The tour is content-
// first; users who want a deeper walk can open the PDF guide.

(function () {
  const FLAG = "esop_tutorial_seen";

  const STEPS = [
    {
      icon: "👋",
      title: "Welcome to your ESOP portal",
      body: "This is a quick tour — under a minute. It walks through what each section does and what your day-to-day looks like as an option holder.",
    },
    {
      icon: "📊",
      title: "Portfolio — your numbers, today",
      body: "Your grants by FY, vesting %, value if exercised now, and your next exercise date all live on the Portfolio tab. Numbers refresh as the latest FY audit and any Committee actions land.",
    },
    {
      icon: "📚",
      title: "Plan Rules — the binding terms",
      body: "Vesting, exercise mechanics, FMV, leavers, exit events, trading windows — all in plain English on the Plan Rules tab, with footnotes pointing to the exact clauses in the legal document.",
    },
    {
      icon: "💳",
      title: "Exercise flow — when your window opens",
      body: 'At your 5-year anniversary, a green "Exercise window OPEN" banner appears. Sign the notice, submit, and a PayNow QR pops up: pay UEN 201010223H with the pre-filled amount and reference. Once the Trustee confirms, your shares are allotted.',
    },
    {
      icon: "📄",
      title: "Your documents — always downloadable",
      body: "Letter of Offer, Acceptance Form, Exercise Notice, Appendix 8B (for SG taxes), and your Annual Statement — all generated as PDFs you can grab whenever you need. Stored under Your documents on the Portfolio tab.",
    },
  ];

  let overlay = null;
  let cursor = 0;

  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === "text") e.textContent = v;
        else if (k === "class") e.className = v;
        else if (v != null) e.setAttribute(k, String(v));
      }
    }
    if (children) for (const c of children) {
      if (c == null) continue;
      if (typeof c === "string" || typeof c === "number") {
        e.appendChild(document.createTextNode(String(c)));
      } else {
        e.appendChild(c);
      }
    }
    return e;
  }

  function render() {
    const step = STEPS[cursor];
    const total = STEPS.length;

    overlay.replaceChildren();

    const card = el("div", { class: "tutorial__card" });

    // dots
    const dots = el("div", { class: "tutorial__dots" });
    for (let i = 0; i < total; i++) {
      dots.appendChild(el("span", { class: "tutorial__dot" + (i === cursor ? " is-active" : "") }));
    }
    card.appendChild(dots);

    // icon + step label
    card.appendChild(el("div", { class: "tutorial__icon", text: step.icon }));
    card.appendChild(el("div", { class: "tutorial__step-label", text: `Step ${cursor + 1} of ${total}` }));

    // title + body
    card.appendChild(el("h2", { class: "tutorial__title", text: step.title }));
    card.appendChild(el("p", { class: "tutorial__body", text: step.body }));

    // controls
    const controls = el("div", { class: "tutorial__controls" });

    const skipBtn = el("button", { type: "button", class: "tutorial__btn tutorial__btn--ghost" }, ["Skip tour"]);
    skipBtn.addEventListener("click", close);

    const right = el("div", { class: "tutorial__controls-right" });
    if (cursor > 0) {
      const prevBtn = el("button", { type: "button", class: "tutorial__btn tutorial__btn--ghost" }, ["Back"]);
      prevBtn.addEventListener("click", () => { cursor--; render(); });
      right.appendChild(prevBtn);
    }
    const isLast = cursor === total - 1;
    const nextBtn = el("button", { type: "button", class: "tutorial__btn tutorial__btn--brass" }, [isLast ? "Got it" : "Next →"]);
    nextBtn.addEventListener("click", () => {
      if (isLast) close();
      else { cursor++; render(); }
    });
    right.appendChild(nextBtn);

    controls.appendChild(skipBtn);
    controls.appendChild(right);
    card.appendChild(controls);

    // PDF link
    const pdfLink = el("a", { href: "onboarding-guide.pdf", target: "_blank", rel: "noopener", class: "tutorial__pdf" }, [
      "Prefer the full 2-page PDF guide? Open it →"
    ]);
    card.appendChild(pdfLink);

    overlay.appendChild(card);
  }

  function open() {
    if (overlay) return;
    cursor = 0;
    overlay = el("div", { class: "tutorial-overlay" });
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);
    document.addEventListener("keydown", onKey);
    render();
  }

  function close() {
    try { localStorage.setItem(FLAG, "1"); } catch {}
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
    document.removeEventListener("keydown", onKey);
  }

  function onKey(e) {
    if (!overlay) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") {
      if (cursor < STEPS.length - 1) { cursor++; render(); } else close();
    }
    if (e.key === "ArrowLeft") {
      if (cursor > 0) { cursor--; render(); }
    }
  }

  function maybeAutoLaunch() {
    try {
      if (localStorage.getItem(FLAG)) return;
    } catch { /* private mode: just launch */ }
    // Defer slightly so the page can paint before the modal lands.
    setTimeout(open, 350);
  }

  window.ESOPTutorial = { open, maybeAutoLaunch };
})();
