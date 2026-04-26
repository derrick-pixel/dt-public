// Employee portal — personalised view for a specific holder.
(function () {
  const { renderTopbar, renderFooter, requireSession, el } = window.ESOPApp;
  const C = window.ESOPCalc;
  const D = window.ESOP_DATA;
  const { fmt } = C;

  renderTopbar("portal");
  const session = requireSession();
  if (!session) return;

  // Read holder from live (store-overlaid) state so admin-approved drafts,
  // allocation changes and new valuations are reflected immediately.
  const liveHolders = C.holders();
  const holder = session.kind === "admin"
    ? liveHolders[0]
    : liveHolders.find(h => h.id === session.id);

  if (!holder) {
    document.getElementById("content").appendChild(el("div", { class: "alert alert--bad", text: "Could not locate your holder record. Contact HR." }));
    renderFooter();
    return;
  }

  const root = document.getElementById("content");
  const fmv = C.currentFMV();
  const ex = C.currentExercisePrice();
  const sum = C.summarizeHolder(holder);
  const milestone = C.nextExerciseMilestone(holder);

  // --- Hero
  const hero = el("section", { class: "hero" }, [
    el("div", null, [
      el("div", { class: "micro", text: "Your ESOP Portfolio" }),
      el("h1", { style: "margin-top:1rem;", text: holder.name }),
      el("p", { class: "lede", style: "margin-top:1rem;" }, [
        `${holder.title} · ${holder.dept} · ${holder.nat}. `,
        el("span", { class: "muted", style: "font-style: normal;", text: `ID ${holder.ic}` })
      ])
    ]),
    el("div", { class: "panel" }, [
      el("div", { class: "micro", text: "Current valuation" }),
      el("div", { class: "row-between", style: "margin-top:0.8rem;" }, [
        el("div", null, [
          el("div", { class: "tiny muted", text: "FMV / share" }),
          el("div", { class: "serif", style: "font-size: 2rem;", text: fmt.sgd(fmv, 4) })
        ]),
        el("div", null, [
          el("div", { class: "tiny muted", text: "Exercise price / share" }),
          el("div", { class: "serif", style: "font-size: 2rem;", text: fmt.sgd(ex, 4) })
        ])
      ]),
      el("div", { class: "rule" }),
      el("div", { class: "tiny muted", text: `FY2025 audit · EBITDA S$${(4624269).toLocaleString()} × 6 ÷ 32,432,432 shares` })
    ])
  ]);
  root.appendChild(hero);

  // --- Workflow banners (pending offer · exercise window open)
  const banners = buildBanners(holder);
  if (banners) root.appendChild(banners);

  // --- Stat bar
  const stats = el("section", { class: "block" }, [
    el("header", null, [ el("h2", { text: "Your numbers, today" }) ]),
    el("div", { class: "grid grid-4" }, [
      statCard("Shares granted", fmt.num(sum.total_granted), sum.draft_granted ? `incl. ${fmt.num(sum.draft_granted)} FY25 draft` : "all active"),
      statCard("Vested today", fmt.num(sum.total_vested), `of ${fmt.num(sum.active_granted)} active · ${fmt.pct(sum.vested_pct)}`),
      statAccent("Value if exercised now", fmt.sgd(sum.value_vested_today), `cost ${fmt.sgd(sum.exercise_cost_vested_today)} · gain ${fmt.sgd(sum.net_gain_vested_today)}`),
      statCard("Next exercise window", milestone ? fmt.date(milestone.exercise_date) : "—", milestone ? `${milestone.days} days away · ${milestone.grant.fy} (${fmt.num(milestone.grant.qty)} opts)` : "all windows behind")
    ])
  ]);
  root.appendChild(stats);

  // --- Your documents (moved up — highest-value content for holders)
  root.appendChild(buildDocsSection(holder));

  // --- Vesting timeline per active grant
  const vestingSection = el("section", { class: "block" }, [
    el("header", null, [ el("h2", { text: "Vesting, grant by grant" }) ])
  ]);
  holder.grants.filter(g => g.grant_date).forEach(g => {
    vestingSection.appendChild(vestingPanel(g));
  });
  if (holder.grants.some(g => g.status === "draft")) {
    const drafts = holder.grants.filter(g => g.status === "draft");
    const draftPanel = el("div", { class: "panel", style: "margin-top:1.2rem; border-left: 4px solid var(--brass);" }, [
      el("div", { class: "row-between" }, [
        el("div", null, [
          el("div", { class: "micro", text: "FY2025 · Pending" }),
          el("h3", { style: "margin-top:0.4rem;", text: `${fmt.num(drafts.reduce((s, d) => s + d.qty, 0))} options in draft` })
        ]),
        el("span", { class: "badge badge--draft", text: "Draft · not yet granted" })
      ]),
      el("p", { class: "muted", style: "margin-top:0.8rem;", text: "These are pencilled in for the FY2025 cycle as at 25 Dec 2025 and become live once the grant date and Letter of Offer are issued." })
    ]);
    vestingSection.appendChild(draftPanel);
  }
  root.appendChild(vestingSection);

  // --- Grants table
  const grantsTable = el("section", { class: "block" }, [
    el("header", null, [ el("h2", { text: "Your grants" }) ]),
    el("div", { class: "panel panel--flush" }, [ buildGrantsTable(holder, fmv) ])
  ]);
  root.appendChild(grantsTable);

  // --- Exercise calculator
  root.appendChild(buildCalculator(holder));

  // --- Leaver scenarios
  root.appendChild(buildLeaverSection(holder));

  // --- What happens at Exit
  root.appendChild(buildExitSection(holder));

  // --- Dividends history (special)
  root.appendChild(buildDividendSection(holder));

  // --- FMV trend chart
  root.appendChild(buildValuationSection());

  // --- Quick FAQ
  root.appendChild(buildFaqSection());

  // --- Password change
  root.appendChild(buildPasswordSection());

  renderFooter();

  // =========================================================
  // Extended sections
  // =========================================================

  function buildDocsSection(h) {
    const section = el("section", { class: "block" }, [
      el("header", null, [
        el("h2", { text: "Your documents" }),
        el("span", { class: "micro", text: "Print-ready · PDF downloadable" })
      ])
    ]);
    if (!window.ESOPDocs) {
      section.appendChild(el("div", { class: "alert alert--warn", text: "Document module not loaded." }));
      return section;
    }
    const state = window.ESOPStore.state();
    const panel = el("div", { class: "panel" });

    // --- Annual statement (always available) ------------------------
    const asBtn = el("button", { type: "button", class: "btn btn--brass", style: "margin-right:0.6rem; padding: 0.5rem 1rem;" }, ["Annual statement"]);
    asBtn.onclick = () => {
      window.ESOPDocs.present(
        window.ESOPDocs.annualStatement(h),
        { title: "Annual statement", holder: h, docType: "annual_statement" }
      );
    };
    panel.appendChild(el("div", { style: "display:flex; align-items:center; gap:0.6rem; margin-bottom:1rem;" }, [
      asBtn,
      el("span", { class: "muted tiny", text: "Year-end brokerage-style summary of your position." })
    ]));

    // --- Beneficial ownership statement (if has exercised shares) ---
    const myBen = (state.beneficial || {})[h.id];
    if (myBen && myBen.total_shares > 0) {
      const bosBtn = el("button", { type: "button", class: "btn btn--brass", style: "margin-right:0.6rem; padding: 0.5rem 1rem;" }, ["Beneficial ownership statement"]);
      bosBtn.onclick = () => {
        window.ESOPDocs.present(
          window.ESOPDocs.beneficialOwnershipStatement(h, myBen),
          { title: "Beneficial ownership statement", holder: h, docType: "beneficial_ownership_statement" }
        );
      };
      panel.appendChild(el("div", { style: "display:flex; align-items:center; gap:0.6rem; margin-bottom:1rem;" }, [
        bosBtn,
        el("span", { class: "muted tiny", text: `You beneficially own ${fmt.num(myBen.total_shares)} shares.` })
      ]));
    }

    // --- Per-grant docs ----------------------------------------------
    panel.appendChild(el("div", { class: "rule" }));
    panel.appendChild(el("div", { class: "micro", style: "margin-bottom:0.8rem;", text: "Per-grant documents" }));
    h.grants.forEach(g => {
      if (!g.grant_date || g.status === "draft") return;
      const v = C.activeValuation();
      const vest = C.vestingFor(g.grant_date);
      const now = new Date();
      const eligible = now >= new Date(vest.exercise_date);
      const accRec = (state.acceptances || {})[`${h.id}::${g.fy}`];
      const exRec = (state.exercises || []).find(x => x.holder_id === h.id && x.fy === g.fy);

      const row = el("div", { style: "padding: 0.8rem 0; border-bottom: 1px dotted var(--line);" });
      row.appendChild(el("div", { style: "font-family: var(--serif); font-size: 1.1rem; margin-bottom: 0.4rem;", text: `${g.fy} · ${fmt.num(g.qty)} options · granted ${fmt.date(g.grant_date)}` }));
      const btns = el("div", { style: "display:flex; flex-wrap:wrap; gap:0.5rem;" });

      const looBtn = el("button", { type: "button", class: "btn btn--ghost", style: "padding: 0.45rem 0.9rem; font-size:0.72rem;" }, ["Letter of Offer"]);
      looBtn.onclick = () => {
        window.ESOPDocs.present(window.ESOPDocs.letterOfOffer(h, g, v), { title: `Letter of Offer · ${g.fy}`, holder: h, docType: "letter_of_offer", fy: g.fy });
      };
      btns.appendChild(looBtn);

      if (accRec && accRec.status === "accepted") {
        const accBtn = el("button", { type: "button", class: "btn btn--ghost", style: "padding: 0.45rem 0.9rem; font-size:0.72rem; border-color: var(--good); color: var(--good);" }, ["Acceptance form"]);
        accBtn.onclick = () => {
          window.ESOPDocs.present(window.ESOPDocs.acceptanceForm(h, g, accRec, v), { title: `Acceptance form · ${g.fy}`, holder: h, docType: "acceptance_form", fy: g.fy });
        };
        btns.appendChild(accBtn);
      }

      const eiBtn = el("button", { type: "button", class: "btn btn--ghost", style: "padding: 0.45rem 0.9rem; font-size:0.72rem; opacity: " + (eligible ? "1" : "0.45") + ";" }, ["Exercise invitation"]);
      if (!eligible) eiBtn.disabled = true;
      eiBtn.title = eligible ? "" : `Available from ${vest.exercise_date}`;
      eiBtn.onclick = () => {
        window.ESOPDocs.present(window.ESOPDocs.exerciseInvitation(h, g, v), { title: `Exercise invitation · ${g.fy}`, holder: h, docType: "exercise_invitation", fy: g.fy });
      };
      btns.appendChild(eiBtn);

      if (exRec) {
        const noxBtn = el("button", { type: "button", class: "btn btn--ghost", style: "padding: 0.45rem 0.9rem; font-size:0.72rem;" }, ["Notice of exercise"]);
        noxBtn.onclick = () => {
          window.ESOPDocs.present(window.ESOPDocs.noticeOfExercise(h, g, exRec, v), { title: `Notice of exercise · ${g.fy}`, holder: h, docType: "notice_of_exercise", fy: g.fy });
        };
        btns.appendChild(noxBtn);

        if (exRec.status === "confirmed") {
          const ap8bBtn = el("button", { type: "button", class: "btn btn--ghost", style: "padding: 0.45rem 0.9rem; font-size:0.72rem; border-color: var(--accent); color: var(--accent);" }, ["Appendix 8B (tax)"]);
          ap8bBtn.onclick = () => {
            window.ESOPDocs.present(window.ESOPDocs.appendix8B(h, g, exRec), { title: `Appendix 8B · ${g.fy}`, holder: h, docType: "appendix_8b", fy: g.fy });
          };
          btns.appendChild(ap8bBtn);
        }
      }

      row.appendChild(btns);
      panel.appendChild(row);
    });
    section.appendChild(panel);
    return section;
  }

  // =========================================================
  // Workflow banners (pending acceptance · exercise window open)
  // =========================================================

  function buildBanners(h) {
    const section = el("section", { class: "block", style: "margin-bottom: 2rem;" });
    let any = false;

    C.pendingAcceptances(h).forEach(g => {
      any = true;
      const v = C.activeValuation();
      const b = el("div", {
        style: "padding: 1.2rem 1.6rem; margin-bottom: 0.8rem; background: var(--ink); color: var(--paper); border-left: 4px solid var(--accent); display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap;"
      });
      const left = el("div", { style: "flex:1; min-width:260px;" }, [
        el("div", { class: "micro", style: "color: var(--accent); margin-bottom:0.35rem;", text: "Action required · Letter of Offer" }),
        el("div", { class: "serif", style: "font-size:1.3rem; font-style:italic; margin-bottom:0.2rem;", text: `${fmt.num(g.qty)} options, ${g.fy} grant — please review and accept.` }),
        el("div", { style: "color: rgba(245,239,220,0.75); font-size:0.88rem;", text: `At ${fmt.sgd(v.fmv, 4)}/share FMV. S$1 acceptance consideration due with signed form.` })
      ]);
      const actBtn = el("button", { type: "button", class: "btn btn--brass" }, ["Review & accept"]);
      actBtn.onclick = () => openAcceptanceFlow(h, g, v);
      b.appendChild(left); b.appendChild(actBtn);
      section.appendChild(b);
    });

    C.exercisableGrants(h).forEach(ex => {
      any = true;
      const v = C.activeValuation();
      const existing = C.exerciseForGrant(h, ex.grant.fy);
      if (existing) return; // already submitted — handled below
      const b = el("div", {
        style: "padding: 1.2rem 1.6rem; margin-bottom: 0.8rem; background: var(--accent); color: var(--paper); border-left: 4px solid var(--ink); display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap;"
      });
      const vested = Math.floor(ex.grant.qty * C.vestingFor(ex.grant.grant_date).vested_pct);
      const left = el("div", { style: "flex:1; min-width:260px;" }, [
        el("div", { class: "micro", style: "color: var(--paper); opacity: 0.85; margin-bottom:0.35rem;", text: `Exercise window OPEN · closes in ${ex.window.days_to_close} days` }),
        el("div", { class: "serif", style: "font-size:1.3rem; font-style:italic; margin-bottom:0.2rem;", text: `${ex.grant.fy}: ${fmt.num(vested)} vested options ready to exercise.` }),
        el("div", { style: "color: rgba(255,255,255,0.88); font-size:0.88rem;", text: `Cost: ${fmt.sgd(vested * v.exercise_price)} at ${fmt.sgd(v.exercise_price, 4)} / share. Whole-not-partial.` })
      ]);
      const actBtn = el("button", { type: "button", class: "btn", style: "background: var(--paper); color: var(--ink); border-color: var(--paper);" }, ["Exercise now"]);
      actBtn.onclick = () => openExerciseFlow(h, ex.grant, v);
      b.appendChild(left); b.appendChild(actBtn);
      section.appendChild(b);
    });

    // Pending submitted exercises (awaiting Trustee)
    C.exercisesForHolder(h).filter(x => x.status === "submitted").forEach(x => {
      any = true;
      const b = el("div", { class: "alert", style: "margin-bottom: 0.8rem;" });
      b.textContent = `Your exercise notice for ${x.fy} (${fmt.num(x.qty)} options, ${fmt.sgd(x.cost)}) is awaiting Trustee confirmation of payment. Submitted ${new Date(x.submitted_at).toLocaleString("en-SG", { dateStyle: "medium", timeStyle: "short" })}.`;
      section.appendChild(b);
    });

    // Upcoming windows (< 60 days)
    C.upcomingExerciseGrants(h).forEach(up => {
      any = true;
      const b = el("div", { class: "alert", style: "margin-bottom: 0.8rem; border-left-color: var(--warn); background: rgba(182,90,31,0.08);" });
      b.textContent = `Your ${up.grant.fy} exercise window opens in ${up.window.days_to_open} days (${fmt.date(up.window.opens_at)}). You'll have 14 days to decide.`;
      section.appendChild(b);
    });

    return any ? section : null;
  }

  // =========================================================
  // Acceptance flow (modal)
  // =========================================================

  function openAcceptanceFlow(h, grant, valuation) {
    const Docs = window.ESOPDocs;
    const looDoc = Docs.letterOfOffer(h, grant, valuation);

    const overlay = document.createElement("div");
    overlay.setAttribute("style", "position:fixed; inset:0; background: rgba(14,38,64,0.82); z-index: 500; overflow:auto; padding: 36px 20px;");

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close ×";
    closeBtn.setAttribute("style", "position: absolute; top: 16px; right: 24px; background: transparent; border: 1px solid #F5EFDC; color: #F5EFDC; padding: 8px 14px; font-family: 'Inter', sans-serif; letter-spacing: 0.14em; text-transform: uppercase; font-size: 11px; cursor: pointer;");
    closeBtn.onclick = () => overlay.remove();
    overlay.appendChild(closeBtn);

    const toolbar = document.createElement("div");
    toolbar.setAttribute("style", "max-width: 780px; margin: 0 auto 14px; color: #F5EFDC; font-family: 'Inter', sans-serif; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;");
    toolbar.textContent = `Letter of Offer · ${h.name} · ${grant.fy}`;
    overlay.appendChild(toolbar);

    overlay.appendChild(looDoc);

    // Acceptance form panel
    const form = el("div", { style: "max-width: 780px; margin: 18px auto 40px; padding: 1.8rem 2rem; background: var(--paper); border: 1px solid var(--line-strong); font-family: var(--sans);" });
    form.appendChild(el("div", { class: "micro", style: "color: var(--accent); margin-bottom: 0.5rem;", text: "Accept the offer" }));
    form.appendChild(el("h3", { style: "font-family: var(--serif); font-size: 1.4rem; font-weight:500; margin-bottom: 0.8rem;", text: "Sign and submit" }));
    form.appendChild(el("p", { class: "muted", style: "font-size: 0.88rem; margin-bottom: 1rem;", text: "Your typed signature below, together with your S$1 PayNow reference, makes this offer binding under Clause 7." }));

    const sigInput = el("input", { type: "text", placeholder: "Type your full legal name", value: h.name });
    const methodSelect = el("select");
    methodSelect.appendChild(el("option", { value: "paynow", text: "PayNow" }));
    methodSelect.appendChild(el("option", { value: "cheque", text: "Cheque / cashier's order" }));
    const refInput = el("input", { type: "text", placeholder: "e.g. 202604231615-XXXX" });
    const ack1 = el("input", { type: "checkbox", id: "ack-plan" });
    const ack2 = el("input", { type: "checkbox", id: "ack-terms" });

    form.appendChild(el("div", { class: "grid grid-2", style: "gap: 1rem;" }, [
      el("div", { class: "field", style: "margin:0;" }, [ el("label", { text: "Signed name (typed signature)" }), sigInput ]),
      el("div", { class: "field", style: "margin:0;" }, [ el("label", { text: "Payment method" }), methodSelect ])
    ]));
    form.appendChild(el("div", { class: "field" }, [
      el("label", { text: "Payment reference (S$1)" }), refInput
    ]));
    form.appendChild(el("label", { style: "display:flex; gap:0.6rem; align-items:flex-start; margin-bottom:0.5rem; font-size:0.88rem;" }, [
      ack1, el("span", { text: "I have read and understood The Elitez Employee Share Option Plan." })
    ]));
    form.appendChild(el("label", { style: "display:flex; gap:0.6rem; align-items:flex-start; margin-bottom:1rem; font-size:0.88rem;" }, [
      ack2, el("span", { text: "I accept the terms of this Letter of Offer and the related grant on the terms set out therein." })
    ]));

    const errBox = el("div", { class: "alert alert--bad", style: "margin-bottom: 0.8rem; display:none;" });
    form.appendChild(errBox);

    const submitBtn = el("button", { type: "button", class: "btn btn--brass" }, ["Submit acceptance"]);
    submitBtn.onclick = () => {
      errBox.style.display = "none";
      if (!sigInput.value.trim()) { errBox.textContent = "Please type your name as a signature."; errBox.style.display = "block"; return; }
      if (!refInput.value.trim()) { errBox.textContent = "Please enter the S$1 payment reference."; errBox.style.display = "block"; return; }
      if (!ack1.checked || !ack2.checked) { errBox.textContent = "Please tick both acknowledgement boxes."; errBox.style.display = "block"; return; }
      window.ESOPStore.emit("grant_accepted", {
        holder_id: h.id,
        fy: grant.fy,
        signed_name: sigInput.value.trim(),
        payment_ref: refInput.value.trim(),
        payment_method: methodSelect.value,
        plan_acknowledged: true,
        terms_accepted: true
      });
      alert("Offer accepted. Your Acceptance Form is now available under Your documents.");
      overlay.remove();
      window.location.reload();
    };
    form.appendChild(submitBtn);

    overlay.appendChild(form);
    document.body.appendChild(overlay);
  }

  // =========================================================
  // Exercise flow (modal)
  // =========================================================

  function openExerciseFlow(h, grant, valuation) {
    const Docs = window.ESOPDocs;
    const vest = C.vestingFor(grant.grant_date);
    const vested = Math.floor(grant.qty * vest.vested_pct);
    const cost = vested * valuation.exercise_price;
    const perq = vested * (valuation.fmv - valuation.exercise_price);

    const eiDoc = Docs.exerciseInvitation(h, grant, valuation);

    const overlay = document.createElement("div");
    overlay.setAttribute("style", "position:fixed; inset:0; background: rgba(14,38,64,0.82); z-index: 500; overflow:auto; padding: 36px 20px;");

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close ×";
    closeBtn.setAttribute("style", "position: absolute; top: 16px; right: 24px; background: transparent; border: 1px solid #F5EFDC; color: #F5EFDC; padding: 8px 14px; font-family: 'Inter', sans-serif; letter-spacing: 0.14em; text-transform: uppercase; font-size: 11px; cursor: pointer;");
    closeBtn.onclick = () => overlay.remove();
    overlay.appendChild(closeBtn);

    const toolbar = document.createElement("div");
    toolbar.setAttribute("style", "max-width: 780px; margin: 0 auto 14px; color: #F5EFDC; font-family: 'Inter', sans-serif; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;");
    toolbar.textContent = `Exercise invitation · ${h.name} · ${grant.fy}`;
    overlay.appendChild(toolbar);
    overlay.appendChild(eiDoc);

    const form = el("div", { style: "max-width: 780px; margin: 18px auto 40px; padding: 1.8rem 2rem; background: var(--paper); border: 1px solid var(--line-strong); font-family: var(--sans);" });
    form.appendChild(el("div", { class: "micro", style: "color: var(--accent); margin-bottom: 0.5rem;", text: "Submit notice of exercise" }));
    form.appendChild(el("h3", { style: "font-family: var(--serif); font-size: 1.4rem; font-weight: 500; margin-bottom: 0.8rem;", text: "Confirm and submit" }));
    form.appendChild(el("p", { class: "muted", style: "font-size: 0.88rem; margin-bottom: 1rem;", text: "Your notice is whole-not-partial and irrevocable once the Trustee confirms receipt of your payment." }));

    form.appendChild(el("div", { class: "grid grid-3", style: "gap: 1rem; margin-bottom: 1rem;" }, [
      el("div", null, [
        el("div", { class: "micro muted", text: "Vested to exercise" }),
        el("div", { class: "serif", style: "font-size:1.4rem; font-style:italic;", text: fmt.num(vested) })
      ]),
      el("div", null, [
        el("div", { class: "micro muted", text: "Total cost" }),
        el("div", { class: "serif", style: "font-size:1.4rem; font-style:italic; color: var(--accent);", text: fmt.sgd(cost) })
      ]),
      el("div", null, [
        el("div", { class: "micro muted", text: "Taxable perquisite (SG)" }),
        el("div", { class: "serif", style: "font-size:1.4rem; font-style:italic;", text: fmt.sgd(perq) })
      ])
    ]));

    const sigInput = el("input", { type: "text", placeholder: "Type your full legal name", value: h.name });
    const methodSelect = el("select");
    methodSelect.appendChild(el("option", { value: "paynow", text: "PayNow · +65 9663 9634 (Lin Rongjie)" }));
    methodSelect.appendChild(el("option", { value: "cheque", text: "Cheque / cashier's order to EGPL" }));
    const refInput = el("input", { type: "text", placeholder: `e.g. NEX-${h.id}-${grant.fy}` });
    const ack = el("input", { type: "checkbox", id: "ack-tax" });

    form.appendChild(el("div", { class: "grid grid-2", style: "gap:1rem;" }, [
      el("div", { class: "field", style: "margin:0;" }, [ el("label", { text: "Signed name" }), sigInput ]),
      el("div", { class: "field", style: "margin:0;" }, [ el("label", { text: "Payment method" }), methodSelect ])
    ]));
    form.appendChild(el("div", { class: "field" }, [ el("label", { text: `Payment reference (${fmt.sgd(cost)})` }), refInput ]));
    form.appendChild(el("label", { style: "display:flex; gap:0.6rem; align-items:flex-start; margin-bottom:1rem; font-size:0.88rem;" }, [
      ack, el("span", { text: `I understand that ${fmt.sgd(perq)} will be reported as Singapore employment income for the relevant Year of Assessment.` })
    ]));

    const errBox = el("div", { class: "alert alert--bad", style: "margin-bottom: 0.8rem; display:none;" });
    form.appendChild(errBox);

    const submitBtn = el("button", { type: "button", class: "btn btn--brass" }, ["Submit notice of exercise"]);
    submitBtn.onclick = () => {
      errBox.style.display = "none";
      if (!sigInput.value.trim()) { errBox.textContent = "Please type your name as a signature."; errBox.style.display = "block"; return; }
      if (!refInput.value.trim()) { errBox.textContent = "Please enter your payment reference."; errBox.style.display = "block"; return; }
      if (!ack.checked) { errBox.textContent = "Please tick the tax acknowledgement."; errBox.style.display = "block"; return; }
      const exercise_id = "exc_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      window.ESOPStore.emit("exercise_submitted", {
        exercise_id,
        holder_id: h.id,
        fy: grant.fy,
        qty: vested,
        exercise_price: valuation.exercise_price,
        fmv_at_submission: valuation.fmv,
        cost,
        payment_ref: refInput.value.trim(),
        payment_method: methodSelect.value,
        signed_name: sigInput.value.trim()
      });
      alert("Notice of exercise submitted. Your Notice of Exercise document is available under Your documents. The Trustee will confirm receipt and register your shares.");
      overlay.remove();
      window.location.reload();
    };
    form.appendChild(submitBtn);

    overlay.appendChild(form);
    document.body.appendChild(overlay);
  }

  function buildPasswordSection() {
    if (session.kind !== "holder") return el("div");
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Change your password" }) ])
    ]);
    const oldPw = el("input", { type: "password", placeholder: "Current password" });
    const newPw = el("input", { type: "password", placeholder: "New password (min 6)" });
    const btn = el("button", { type: "button", class: "btn" }, ["Update password"]);
    const msg = el("div", { class: "alert", style: "margin-top:0.8rem; display:none;" });
    btn.onclick = async () => {
      msg.style.display = "none";
      const res = await window.ESOPAuth.changePassword(session.id, oldPw.value, newPw.value);
      if (!res.ok) {
        msg.className = "alert alert--bad";
        msg.textContent = res.reason === "bad_old_password" ? "Current password is incorrect." : res.reason === "weak_password" ? "New password must be at least 6 characters." : "Failed: " + res.reason;
      } else {
        msg.className = "alert";
        msg.textContent = "Password updated.";
        oldPw.value = ""; newPw.value = "";
      }
      msg.style.display = "block";
    };
    section.appendChild(el("div", { class: "panel" }, [
      el("div", { class: "grid grid-2" }, [
        el("div", { class: "field", style: "margin:0;" }, [ el("label", { text: "Current" }), oldPw ]),
        el("div", { class: "field", style: "margin:0;" }, [ el("label", { text: "New" }), newPw ])
      ]),
      btn,
      msg
    ]));
    return section;
  }

  // =========================================================
  // Builders
  // =========================================================

  function statCard(label, value, sub) {
    return el("div", { class: "stat" }, [
      el("div", { class: "label", text: label }),
      el("div", { class: "value", text: value }),
      el("div", { class: "sub", text: sub })
    ]);
  }

  function statAccent(label, value, sub) {
    return el("div", { class: "stat stat--accent" }, [
      el("div", { class: "label", text: label }),
      el("div", { class: "value", text: value }),
      el("div", { class: "sub", text: sub })
    ]);
  }

  function vestingPanel(g) {
    const v = C.vestingFor(g.grant_date);
    const proj = C.projectGrant(g);
    const panel = el("div", { class: "panel", style: "margin-top:1.2rem;" }, [
      el("div", { class: "row-between" }, [
        el("div", null, [
          el("div", { class: "micro", text: `${g.fy} · Granted ${fmt.date(g.grant_date)}` }),
          el("h3", { style: "margin-top:0.4rem;", text: `${fmt.num(g.qty)} options` })
        ]),
        el("div", { style: "text-align:right;" }, [
          el("div", { class: "micro muted", text: "Vested" }),
          el("div", { class: "serif", style: "font-size:1.8rem; color: var(--jade);", text: fmt.pct(v.vested_pct) })
        ])
      ]),
      el("div", { style: "margin-top:1rem;" }, [ buildTimeline(g, v) ]),
      el("div", { class: "rule" }),
      el("div", { class: "grid grid-4", style: "gap:1rem;" }, [
        kvBlock("Vested shares", fmt.num(proj.vested_shares)),
        kvBlock("Unvested", fmt.num(proj.unvested_shares)),
        kvBlock("Cost to exercise now", fmt.sgd(proj.exercise_cost)),
        kvBlock("Value at today's FMV", fmt.sgd(proj.gross_value))
      ])
    ]);
    return panel;
  }

  function kvBlock(k, v) {
    return el("div", null, [
      el("div", { class: "tiny muted", style: "text-transform:uppercase; letter-spacing:0.14em;", text: k }),
      el("div", { class: "serif", style: "font-size:1.2rem; margin-top:0.2rem;", text: v })
    ]);
  }

  function buildTimeline(g, v) {
    const start = new Date(v.start_date);
    const end = new Date(v.fully_vested_date);
    const today = C.AS_OF;
    const span = end - start;
    const pctToday = Math.min(1, Math.max(0, (today - start) / span));
    const pctCliff = 12 / 60;
    const ticks = [
      { pct: 0, label: "Grant" },
      { pct: pctCliff, label: "Cliff · 20%" },
      { pct: 0.4, label: "Yr 2" },
      { pct: 0.6, label: "Yr 3" },
      { pct: 0.8, label: "Yr 4" },
      { pct: 1, label: "Exercise" }
    ];
    const timeline = el("div", { class: "timeline" });
    const track = el("div", { class: "track" });
    const fill = el("div", { class: "fill", style: `width: ${(v.vested_pct * 100).toFixed(1)}%;` });
    track.appendChild(fill);
    ticks.forEach(t => {
      const tk = el("div", { class: "tick", style: `left: ${t.pct * 100}%;` }, [
        el("div", { class: t.pct === 0 || t.pct === 1 || t.pct === pctCliff ? "pin major" : "pin" }),
        el("div", { class: "label", text: t.label })
      ]);
      track.appendChild(tk);
    });
    const marker = el("div", { class: "marker", style: `left: ${pctToday * 100}%;` }, [
      el("div", { text: "Today" }),
      el("div", { class: "pin" })
    ]);
    track.appendChild(marker);
    timeline.appendChild(track);
    return timeline;
  }

  function buildGrantsTable(holder, fmv) {
    const tbl = el("table", { class: "data" });
    const thead = el("thead", null, [ el("tr", null, [
      th("FY"), th("Grant date"), th("Options"), th("Vested today", true), th("Exercise window"), th("Cost to exercise", true), th("Value at FMV", true), th("Status")
    ]) ]);
    tbl.appendChild(thead);
    const tbody = el("tbody");
    let totals = { qty: 0, vested: 0, cost: 0, value: 0 };
    holder.grants.forEach(g => {
      const isDraft = g.status === "draft";
      const proj = isDraft ? null : C.projectGrant(g, fmv);
      const v = isDraft ? null : C.vestingFor(g.grant_date);
      totals.qty += g.qty;
      if (proj) {
        totals.vested += proj.vested_shares;
        totals.cost += proj.exercise_cost;
        totals.value += proj.gross_value;
      }
      const tr = el("tr", null, [
        td(g.fy),
        td(isDraft ? "—" : fmt.date(g.grant_date)),
        td(fmt.num(g.qty), true),
        td(isDraft ? "—" : `${fmt.num(proj.vested_shares)} (${fmt.pct(v.vested_pct)})`, true),
        td(isDraft ? "—" : `${fmt.short(v.exercise_date)} · 14 days`),
        td(isDraft ? "—" : fmt.sgd(proj.exercise_cost), true),
        td(isDraft ? "—" : fmt.sgd(proj.gross_value), true),
        td(null, false, badge(isDraft ? "Draft" : v.cliff_passed ? "Vesting" : "In cliff", isDraft ? "draft" : "active"))
      ]);
      tbody.appendChild(tr);
    });
    // totals
    const trt = el("tr", { class: "total" }, [
      td("Total", false),
      td(""),
      td(fmt.num(totals.qty), true),
      td(fmt.num(totals.vested), true),
      td(""),
      td(fmt.sgd(totals.cost), true),
      td(fmt.sgd(totals.value), true),
      td("")
    ]);
    tbody.appendChild(trt);
    tbl.appendChild(tbody);
    return tbl;
  }

  function th(text, numeric) { const n = el("th", { text }); if (numeric) n.className = "num"; return n; }
  function td(text, numeric, child) {
    const n = el("td");
    if (numeric) n.className = "num";
    if (child) n.appendChild(child); else n.textContent = text ?? "";
    return n;
  }
  function badge(text, kind) {
    return el("span", { class: `badge badge--${kind}`, text });
  }

  function buildCalculator(holder) {
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "What-if calculator" }), el("div", { class: "micro", text: "Explore · scenario modelling" }) ])
    ]);

    const calc = el("div", { class: "calc" });

    const SNAP_VALUE = fmv;              // e.g. 0.8555
    const SNAP_THRESHOLD = 0.04;         // ±4c grabs the slider home
    const RANGE_MIN = 0.1, RANGE_MAX = 5;
    const snapPct = ((SNAP_VALUE - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100;

    const fmvInput = el("input", {
      type: "range",
      min: String(RANGE_MIN), max: String(RANGE_MAX),
      step: "0.005",
      value: String(fmv),
      style: "width: 100%; display: block; accent-color: var(--accent); outline: none; margin: 0;"
    });

    // Tick marker rendered inside its own band ABOVE the slider.
    // Full stack: [text label] · [marker band 34px] · [slider]
    const marker = el("div", { style: `
      position: absolute;
      left: ${snapPct}%;
      top: 0;
      transform: translateX(-50%);
      text-align: center;
      pointer-events: none;
    ` }, [
      el("div", { style: "font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--accent); font-weight: 600; font-family: var(--sans); white-space: nowrap;", text: `Today · ${fmt.sgd(SNAP_VALUE, 4)}` }),
      el("div", { style: "width: 2px; height: 12px; background: var(--accent); margin: 4px auto 0;" })
    ]);
    const markerBand = el("div", { style: "position: relative; height: 36px;" }, [marker]);

    const fmvLbl = el("div", { class: "lbl", style: "min-width: 0;" }, [
      el("div", { style: "margin-bottom: 0.5rem;", text: "Future FMV per share" }),
      markerBand,
      fmvInput
    ]);

    const fmvVal = el("div", { class: "val" });
    const exCostOut = el("div", { class: "val" });
    const valueOut = el("div", { class: "val" });
    const gainOut = el("div", { class: "val" });
    const taxOut = el("div", { class: "val" });

    function redraw() {
      let f = parseFloat(fmvInput.value);
      // Sticky-snap: once the user's value is inside the threshold band, lock
      // it to the current FMV exactly. Handles slide-in from either direction.
      if (Math.abs(f - SNAP_VALUE) < SNAP_THRESHOLD) {
        f = SNAP_VALUE;
        if (fmvInput.value !== String(SNAP_VALUE)) fmvInput.value = String(SNAP_VALUE);
      }
      const atSnap = f === SNAP_VALUE;
      const s = C.summarizeHolder(holder, f);
      const exAtF = Math.round(f * 0.10 * 10000) / 10000;
      const costFullyVested = s.active_granted * exAtF;
      const valueFullyVested = s.active_granted * f;
      fmvVal.textContent = fmt.sgd(f, 4);
      fmvVal.style.color = atSnap ? "var(--accent)" : "var(--ink)";
      exCostOut.textContent = fmt.sgd(costFullyVested);
      valueOut.textContent = fmt.sgd(valueFullyVested);
      gainOut.textContent = fmt.sgd(valueFullyVested - costFullyVested);
      taxOut.textContent = fmt.sgd(0.90 * f * s.active_granted);
    }
    fmvInput.addEventListener("input", redraw);
    fmvInput.addEventListener("dblclick", () => { fmvInput.value = String(SNAP_VALUE); redraw(); });

    calc.appendChild(el("div", { class: "row" }, [ fmvLbl, fmvVal ]));
    calc.appendChild(el("div", { class: "row" }, [ el("div", { class: "lbl", text: "Cost to exercise (all active, fully vested)" }), exCostOut ]));
    calc.appendChild(el("div", { class: "row" }, [ el("div", { class: "lbl", text: "Gross value received at that FMV" }), valueOut ]));
    calc.appendChild(el("div", { class: "row" }, [ el("div", { class: "lbl", text: "Your gain (value − cost)" }), gainOut ]));
    calc.appendChild(el("div", { class: "row" }, [ el("div", { class: "lbl", text: "SG taxable perquisite at exercise" }), taxOut ]));

    const note = el("p", { class: "muted tiny", style: "margin-top:0.8rem;", text: "Scenario only. Assumes all active grants fully vested and exercise price recalculated at 10% of the scenario FMV. Actual exercise price is set at your specific Exercise Date." });

    section.appendChild(calc);
    section.appendChild(note);
    redraw();
    return section;
  }

  function buildLeaverSection(holder) {
    const scen = C.leaverScenarios(holder);
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "If you leave — three scenarios" }), el("a", { href: "scheme.html#leavers", text: "Clause 9 →" }) ])
    ]);

    const grid = el("div", { class: "grid grid-3" });

    function scenCard(kind, title, scenObj) {
      const c = el("div", { class: `scenario scenario--${kind}` }, [
        el("div", { class: "label", text: title }),
        el("h4", { text: scenObj.label }),
        el("div", { class: "value", text: fmt.sgd(scenObj.total) }),
        scenObj.per_option != null
          ? el("div", { class: "breakdown", text: `${fmt.sgd(scenObj.per_option, 4)} per option × ${fmt.num(scenObj.per_option === scen.exit.per_option ? C.summarizeHolder(holder).total_granted : C.summarizeHolder(holder).total_vested)} options` })
          : el("div", { class: "breakdown", text: scenObj.note }),
        el("div", { class: "breakdown", text: scenObj.note })
      ]);
      return c;
    }

    grid.appendChild(scenCard("bad", "Scenario · fired for cause", scen.bad));
    grid.appendChild(scenCard("good", "Scenario · resign with Board approval", scen.good));
    grid.appendChild(scenCard("exit", "Scenario · IPO or sale", scen.exit));

    section.appendChild(grid);
    section.appendChild(el("div", { class: "alert", style: "margin-top:1rem;", text: "Unvested Options are always forfeited on any termination (Clause 11.1.1). The Committee has 30 days to notify you of clawback on vested Options, and up to 90 days to determine leaver type." }));
    return section;
  }

  function buildExitSection(holder) {
    const fmv = C.currentFMV();
    const ex = C.currentExercisePrice();
    const total = holder.grants.reduce((s, g) => s + g.qty, 0);
    const activeTotal = holder.grants.filter(g => g.status !== "draft").reduce((s, g) => s + g.qty, 0);
    const gainPerOpt = Math.max(0, fmv - ex);
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "If Elitez is sold or lists" }), el("a", { href: "scheme.html#exit", text: "Clause 10 →" }) ])
    ]);
    const panel = el("div", { class: "panel" }, [
      el("div", { class: "grid grid-2", style: "gap:2rem;" }, [
        el("div", null, [
          el("h3", { text: "100% acceleration" }),
          el("p", { class: "muted", style: "margin-top:0.4rem;", text: "On a qualifying Exit Event — an IPO, a Change of Control, or a Trade Sale — all of your unvested Options immediately vest and become exercisable." }),
          el("div", { class: "rule" }),
          el("div", { class: "kv" }, [ el("div", { class: "k", text: "Active options accelerated" }), el("div", { class: "v", text: fmt.num(activeTotal) }) ]),
          el("div", { class: "kv" }, [ el("div", { class: "k", text: "Gain per option at today's FMV" }), el("div", { class: "v", text: fmt.sgd(gainPerOpt, 4) }) ]),
          el("div", { class: "kv" }, [ el("div", { class: "k", text: "Your gross proceeds (illustrative)" }), el("div", { class: "v serif", style:"font-size:1.2rem;", text: fmt.sgd(activeTotal * gainPerOpt) }) ])
        ]),
        el("div", null, [
          el("h3", { text: "Drag or Tag" }),
          el("p", { class: "muted", style: "margin-top:0.4rem;", text: "On a Trade Sale, the Company can drag you in (forcing participation at the purchaser's price) or waive drag, in which case you can tag along on the same terms." }),
          el("ul", { style: "margin-top:1rem; margin-left:1.2rem; line-height:1.8;" }, [
            el("li", { text: "Drag-along: 30 days notice. Consideration: purchaser price − exercise price (if unexercised)." }),
            el("li", { text: "Tag-along: 5 days reply window. Same pricing as drag." }),
            el("li", { text: "On IPO: your Employee Shares auto-convert 1:1 to Ordinary Shares via a Mandatory Conversion Notice." })
          ])
        ])
      ])
    ]);
    section.appendChild(panel);
    return section;
  }

  function buildDividendSection(holder) {
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Dividend history (special)" }), el("a", { href: "scheme.html#dividends", text: "Clause 8 →" }) ])
    ]);

    const div = D.special_dividends[0];
    const activeGranted = holder.grants.filter(g => g.status !== "draft").reduce((s, g) => s + g.qty, 0);
    const yourShare = div.per_share * activeGranted;

    const panel = el("div", { class: "panel" }, [
      el("div", { class: "row-between" }, [
        el("div", null, [
          el("div", { class: "micro", text: `${div.declared} · Special · ${div.trigger}` }),
          el("h3", { style: "margin-top:0.4rem;", text: div.name })
        ]),
        el("span", { class: "badge badge--filled", text: "Conditional on exercise" })
      ]),
      el("div", { class: "rule" }),
      el("div", { class: "grid grid-4" }, [
        kvBlock("Per-share dividend", fmt.sgd(div.per_share, 4)),
        kvBlock("Your active options", fmt.num(activeGranted)),
        kvBlock("Your notional entitlement", fmt.sgd(yourShare, 2)),
        kvBlock("Eligibility", div.condition)
      ]),
      el("p", { class: "muted tiny", style: "margin-top:1rem;", text: "Dividends on ESOP shares are only paid to beneficial owners who have actually exercised within the condition window. The Plan's regular annual dividend is separately declared each August (FY ending April) and paid by 30 November." })
    ]);
    section.appendChild(panel);
    return section;
  }

  function buildValuationSection() {
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Valuation history" }), el("a", { href: "scheme.html#fmv", text: "Clause 4 →" }) ])
    ]);
    const panel = el("div", { class: "panel" });
    const wrap = el("div", { class: "chart-wrap chart-wrap--tall" });
    const canvas = document.createElement("canvas");
    wrap.appendChild(canvas);
    panel.appendChild(wrap);
    section.appendChild(panel);
    setTimeout(() => {
      const ctx = canvas.getContext("2d");
      const labels = C.valuationHistory().map(v => v.fy);
      const data = C.valuationHistory().map(v => v.fmv);
      new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "FMV per share (S$)",
            data,
            borderColor: "#A8863A",
            backgroundColor: "rgba(168,134,58,0.15)",
            tension: 0.25,
            pointBackgroundColor: "#1C3557",
            pointBorderColor: "#F3EDDB",
            pointRadius: 6,
            pointHoverRadius: 8,
            fill: true
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: {
            label: (c) => `FMV S$${c.parsed.y.toFixed(4)}`
          }}},
          scales: {
            y: { ticks: { callback: v => "S$" + v.toFixed(2), color: "#5A6775" }, grid: { color: "rgba(14,26,44,0.06)" } },
            x: { ticks: { color: "#5A6775" }, grid: { display: false } }
          }
        }
      });
    }, 50);
    return section;
  }

  function buildFaqSection() {
    const faqs = [
      ["When can I actually sell?", "Not until you exercise. And then, only in the next January trading window (16–31 Jan). If you exercise in Jan 2027, you can first list to sell in Jan 2028."],
      ["How is FMV decided?", "Max of (EBITDA × 6) and Net Tangible Assets, divided by 32,432,432 shares. From the audited FY ending 30 April, published by 30 November."],
      ["What's taxed and when?", "At exercise, 90% of FMV × shares exercised is SG employment income. Future gains are generally capital gains for Singapore tax residents — not taxed. Talk to a tax advisor."],
      ["Can I vote?", "No. Series A Preference Shares carry economic rights — dividends and exit proceeds — but no voting rights."],
      ["What if I die?", "For exercised shares: your estate receives MAX(FMV, your original cost per share). For vested options: treated as Good Leaver under Committee discretion."],
      ["Who do I ask?", "HR routes questions to the Committee. For exercise payments, PayNow +65 96639634 (Lin Rongjie) with the last 4 digits of your NRIC in remarks."]
    ];
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Quick answers" }), el("a", { href: "scheme.html", text: "Full plan rules →" }) ]),
      el("div", { class: "panel acc" }, faqs.map(([q, a]) => {
        const d = document.createElement("details");
        const summary = document.createElement("summary");
        summary.appendChild(el("span", { text: q }));
        summary.appendChild(el("span", { class: "plus", text: "+" }));
        d.appendChild(summary);
        d.appendChild(el("p", { text: a }));
        return d;
      }))
    ]);
    return section;
  }
})();
