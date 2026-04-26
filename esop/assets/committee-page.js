// Committee dashboard page controller.
(function () {
  const { renderTopbar, renderFooter, requireSession, el } = window.ESOPApp;
  const C = window.ESOPCalc;
  const D = window.ESOP_DATA;
  const Store = window.ESOPStore;
  const Committee = window.ESOPCommittee;
  const Auth = window.ESOPAuth;
  const { fmt } = C;

  // Governance lives under the unified Administrator console — show the main
  // nav with "Administrator" active, then the sub-tab strip with Governance.
  renderTopbar("admin");
  if (window.ESOPApp.renderSubTabs) window.ESOPApp.renderSubTabs("governance");
  const session = requireSession("committee");
  if (!session) return;

  if (window.ESOPApp.maybeShowConfidentialityReminder) window.ESOPApp.maybeShowConfidentialityReminder();

  Committee.sweepExpired();

  const root = document.getElementById("content");
  render();

  // Re-render whenever the store changes (votes, new proposals, etc).
  let rerendering = false;
  const NON_STATEFUL = new Set(["document_issued", "login", "scenario_saved", "statements_bulk_issued"]);
  Store.subscribe((ev) => {
    if (rerendering || !ev) return;
    if (NON_STATEFUL.has(ev.type)) return;
    rerendering = true;
    setTimeout(() => {
      while (root.firstChild) root.removeChild(root.firstChild);
      rerendering = false;
      render();
    }, 50);
  });

  renderFooter();

  // =================================================================

  function render() {
    const me = Committee.member(session.member_id);
    const myPending = Committee.pendingFor(session.member_id);
    const allPending = Committee.pending();
    const recentlyClosed = Committee.closed().slice(0, 20);

    root.appendChild(buildHero(me, myPending.length));
    root.appendChild(buildMyPending(myPending, me));
    root.appendChild(buildAllPending(allPending, me));
    root.appendChild(buildRosterPanel(me));
    root.appendChild(buildClosedResolutions(recentlyClosed));
    root.appendChild(buildThresholdPanel(me));
    root.appendChild(buildDangerPanel(me));
  }

  function buildHero(me, myPendingCount) {
    const role = me.role === "major" ? "Major Shareholder" : "Senior Employee";
    return el("section", { class: "hero" }, [
      el("div", null, [
        el("div", { class: "micro", text: `Seat ${me.seat} · ${role}` }),
        el("h1", { style: "margin-top:1rem;", text: me.name }),
        el("p", { class: "lede", style: "margin-top:1rem;" }, [
          myPendingCount ? `${myPendingCount} resolution${myPendingCount === 1 ? "" : "s"} awaiting your vote.`
                         : "No resolutions awaiting your vote. All current business is elsewhere."
        ])
      ]),
      el("div", { class: "panel" }, [
        el("div", { class: "micro", text: "Committee roster" }),
        ...Committee.roster().map(m => el("div", { class: "kv" }, [
          el("div", { class: "k" }, [
            el("span", null, [m.name]),
            m.id === me.id ? el("span", { class: "badge", style: "margin-left:0.6rem; color: var(--brass); border-color: var(--brass);", text: "You" }) : null
          ]),
          el("div", { class: "v" }, [
            el("span", { class: "badge", style: `color: var(--${m.role === "major" ? "oxblood" : "navy"}); border-color: var(--${m.role === "major" ? "oxblood" : "navy"});`, text: m.role === "major" ? "Major" : "Senior" })
          ])
        ])),
        ...vacantSeats().map(seat => el("div", { class: "kv" }, [
          el("div", { class: "k muted", text: `Seat ${seat} — vacant` }),
          el("div", { class: "v tiny muted", text: "Propose an appointment below" })
        ]))
      ])
    ]);
  }

  function vacantSeats() {
    const filled = new Set(Committee.roster().map(m => m.seat));
    return [1, 2, 3, 4, 5].filter(s => !filled.has(s));
  }

  // ---------------------------------------------------------------
  function buildMyPending(myPending, me) {
    const header = el("header", null, [
      el("h2", { text: "Awaiting your vote" })
    ]);
    // Batch-vote controls appear only when there are >=2 resolutions waiting.
    // Votes still run through Committee.vote one at a time, but alerts are
    // suppressed and a single summary is shown at the end.
    if (myPending.length >= 2) {
      header.appendChild(buildBatchVoteControls(myPending, me));
    }
    const section = el("section", { class: "block" }, [header]);
    if (!myPending.length) {
      section.appendChild(el("div", { class: "panel", style: "text-align:center; padding:2rem 1rem; font-style:italic; color: var(--muted);", text: "Nothing to vote on right now." }));
      return section;
    }
    myPending.forEach(r => section.appendChild(buildResolutionCard(r, me, true)));
    return section;
  }

  function buildBatchVoteControls(resolutions, me) {
    const wrap = el("div", { style: "display:flex; align-items:center; gap:0.6rem;" });
    wrap.appendChild(el("span", { class: "micro", style: "margin-right: 0.4rem;", text: `${resolutions.length} pending` }));

    // Group resolutions by type so the user can batch-approve only same-type items if they want.
    const byType = {};
    resolutions.forEach(r => { (byType[r.type] = byType[r.type] || []).push(r); });
    const onlyOneType = Object.keys(byType).length === 1;

    const filterSelect = el("select", { style: "padding: 0.35rem 0.6rem; font-size: 0.74rem; font-family: var(--sans); border: 1px solid var(--line-strong); background: var(--paper);" });
    filterSelect.appendChild(el("option", { value: "all", text: `All types (${resolutions.length})` }));
    Object.entries(byType).forEach(([t, rs]) => {
      const label = (Committee.thresholdFor(t) || {}).label || t;
      filterSelect.appendChild(el("option", { value: t, text: `${label} (${rs.length})` }));
    });
    if (!onlyOneType) wrap.appendChild(filterSelect);

    const approveBtn = el("button", { type: "button", class: "btn btn--brass", style: "font-size: 0.72rem; padding: 0.45rem 1rem;" }, ["Approve all"]);
    approveBtn.onclick = () => {
      const which = filterSelect.value === "all" ? resolutions : byType[filterSelect.value];
      if (!which || !which.length) { alert("Nothing to vote on for that filter."); return; }
      const msg = `Cast APPROVE vote on ${which.length} resolution${which.length === 1 ? "" : "s"}?\n\nThis records your vote on each. Other members still need to vote for resolutions to execute (unless your vote is the last one needed).`;
      if (!confirm(msg)) return;
      const comment = "Batch approval via Governance console";
      let ok = 0, err = 0; const errors = [];
      which.forEach(r => {
        const res = Committee.vote(r.id, "approve", comment);
        if (res.error) { err++; errors.push(res.error); }
        else ok++;
      });
      alert(`Batch complete: ${ok} approved${err ? `, ${err} errored (${errors.slice(0, 3).join(", ")}${errors.length > 3 ? "…" : ""})` : ""}.`);
    };
    wrap.appendChild(approveBtn);
    return wrap;
  }

  function buildAllPending(allPending, me) {
    const notMine = allPending.filter(r => (r.votes || {})[me.id] || (r.recused || []).includes(me.id));
    const section = el("section", { class: "block" }, [
      el("header", null, [
        el("h2", { text: "All open resolutions" }),
        el("div", { class: "micro", text: `${allPending.length} pending` })
      ])
    ]);
    if (!notMine.length) {
      section.appendChild(el("div", { class: "panel muted", style: "text-align:center; padding:1rem;", text: "Nothing else pending." }));
      return section;
    }
    notMine.forEach(r => section.appendChild(buildResolutionCard(r, me, false)));
    return section;
  }

  function buildResolutionCard(r, me, isVotable) {
    const t = r.threshold || Committee.thresholdFor(r.type);
    const tally = Committee.tallyVotes(r);
    const recused = (r.recused || []).includes(me.id);
    const alreadyVoted = (r.votes || {})[me.id];

    const panel = el("div", { class: "panel", style: "margin-top:1rem;" });

    // Header
    panel.appendChild(el("div", { class: "row-between" }, [
      el("div", null, [
        el("div", { class: "micro", text: `${(t && t.label) || r.type} · proposed by ${r.proposer_name || r.proposer_id} · ${fmt.date(r.proposed_at.slice(0, 10))}` }),
        el("h3", { style: "margin-top:0.3rem;", text: summarisePayload(r.type, r.payload) })
      ]),
      el("div", { style: "text-align:right;" }, [
        el("div", { class: "tiny muted", text: `Threshold ${t.total_needed}/${tally.eligible_count}, majors ${t.majors_needed}/${tally.eligible_majors}` }),
        el("div", { class: "tiny muted", text: `Expires ${fmt.date((r.expires_at || "").slice(0, 10))}` })
      ])
    ]));

    panel.appendChild(el("div", { class: "rule" }));

    // Tally bar
    panel.appendChild(buildTallyDisplay(r, tally, t));

    // Votes list
    const votes = r.votes || {};
    if (Object.keys(votes).length) {
      const voteList = el("div", { style: "margin-top:0.8rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.6rem;" });
      Object.entries(votes).forEach(([mid, v]) => {
        const mem = Committee.member(mid) || { name: mid, role: "unknown" };
        const color = v.vote === "approve" ? "var(--good)" : v.vote === "object" ? "var(--bad)" : "var(--muted)";
        voteList.appendChild(el("div", { style: "font-size:0.85rem; padding:0.5rem 0.7rem; border: 1px solid var(--line); background: var(--cream);" }, [
          el("span", { class: "badge", style: `color: ${color}; border-color: ${color}; margin-right: 0.4rem;`, text: v.vote.toUpperCase() }),
          el("span", { text: mem.name }),
          v.comment ? el("div", { class: "tiny muted", style: "margin-top:0.3rem;", text: v.comment }) : null
        ]));
      });
      panel.appendChild(voteList);
    }

    // Recusal badges
    if ((r.recused || []).length) {
      panel.appendChild(el("div", { class: "alert alert--warn", style: "margin-top:0.6rem;" }, [
        el("strong", { text: "Recusals: " }),
        document.createTextNode(r.recused.map(id => Committee.member(id)?.name || id).join(", "))
      ]));
    }

    // Voting controls
    if (isVotable && !alreadyVoted && !recused) {
      const commentInput = el("input", { type: "text", placeholder: "Optional comment for the record", style: "margin: 0.8rem 0;" });
      const row = el("div", { style: "display:flex; gap:0.4rem; margin-top:0.4rem; flex-wrap: wrap;" });
      ["approve", "object", "abstain"].forEach(v => {
        const btn = el("button", { type: "button", class: `btn ${v === "approve" ? "btn--brass" : "btn--ghost"}`, style: "padding: 0.5rem 1.2rem;" }, [ v.charAt(0).toUpperCase() + v.slice(1) ]);
        if (v === "object") { btn.style.borderColor = "var(--bad)"; btn.style.color = "var(--bad)"; }
        btn.onclick = () => {
          const res = Committee.vote(r.id, v, commentInput.value.trim());
          if (res.error) alert("Vote rejected: " + res.error);
        };
        row.appendChild(btn);
      });
      panel.appendChild(commentInput);
      panel.appendChild(row);
    } else if (recused) {
      panel.appendChild(el("div", { class: "alert alert--warn", style: "margin-top:0.8rem;", text: "You are recused from this decision." }));
    } else if (alreadyVoted) {
      panel.appendChild(el("div", { class: "alert", style: "margin-top:0.8rem;", text: `You voted ${alreadyVoted.vote}. ${alreadyVoted.comment || ""}` }));
    }

    return panel;
  }

  function buildTallyDisplay(r, tally, t) {
    const voted = tally.approves + tally.objects + tally.abstains;
    const totalEligible = tally.eligible_count;
    const wrap = el("div", { style: "margin-top:0.6rem;" });
    wrap.appendChild(el("div", { class: "tiny muted", style: "margin-bottom:0.4rem;", text:
      `${tally.approves} approve · ${tally.objects} object · ${tally.abstains} abstain · ${tally.remaining} pending` +
      (tally.eligible_majors ? ` · Majors: ${tally.major_approves}/${tally.eligible_majors} approve (need ${t.majors_needed})` : "")
    }));
    const bar = el("div", { style: "height: 8px; background: rgba(14,26,44,0.08); display: flex; width: 100%; overflow: hidden;" });
    const approvePct = (tally.approves / Math.max(1, totalEligible)) * 100;
    const objectPct = (tally.objects / Math.max(1, totalEligible)) * 100;
    const abstainPct = (tally.abstains / Math.max(1, totalEligible)) * 100;
    bar.appendChild(el("div", { style: `background: var(--good); width: ${approvePct}%;` }));
    bar.appendChild(el("div", { style: `background: var(--bad); width: ${objectPct}%;` }));
    bar.appendChild(el("div", { style: `background: var(--muted); width: ${abstainPct}%;` }));
    wrap.appendChild(bar);
    return wrap;
  }

  function summarisePayload(type, payload) {
    payload = payload || {};
    switch (type) {
      case "grant_approval":
        return `Approve ${payload.fy || ""} grant for ${holderName(payload.holder_id)} · grant date ${payload.grant_date}`;
      case "grant_rejection":
        return `Reject ${payload.fy || ""} draft for ${holderName(payload.holder_id)}${payload.reason ? " — " + payload.reason : ""}`;
      case "allocation_commit":
        return `Commit ${payload.scenario_name || "allocation"} — ${(payload.changes || []).length} holder changes`;
      case "valuation_add":
        return `Record ${payload.fy} valuation · EBITDA ${fmt.sgd(payload.ebitda)} × ${payload.multiple} → FMV ${fmt.sgd(payload.fmv, 4)}`;
      case "valuation_activate":
        return `Activate ${payload.fy} as current FMV`;
      case "leaver_determination":
        return `Determine ${payload.holder_id || holderName(payload.holder_id)} as ${payload.type === "good" ? "Good" : "Bad"} Leaver (as of ${payload.as_of})`;
      case "window_open":
        return `Open trading window "${payload.name}" · ${payload.opens} → ${payload.closes}`;
      case "window_close":
        return `Close trading window "${payload.name}" and commit ${(payload.trades || []).length} trades`;
      case "special_dividend":
        return `Declare special dividend · ${fmt.sgd(payload.per_share, 4)} per share`;
      case "roster_appoint":
        return `Appoint ${payload.name} (${payload.email}) to seat ${payload.seat} as ${payload.role === "major" ? "Major" : "Senior"}`;
      case "roster_remove":
        return `Remove Committee member ${payload.id}`;
      case "threshold_change":
        return `Amend threshold for "${payload.action_type}" → ${payload.total_needed}/5 total, ${payload.majors_needed}/3 Majors`;
      case "state_reset":
        return `Reset all persisted platform state to seed (destructive)`;
      case "state_import":
        return `Authorise import of external state JSON`;
      default:
        return type + " · " + JSON.stringify(payload).slice(0, 120);
    }
  }

  function holderName(id) {
    if (id == null) return "—";
    const h = D.holders.find(x => x.id === id);
    return h ? h.name : ("holder#" + id);
  }

  // ---------------------------------------------------------------
  function buildRosterPanel(me) {
    const section = el("section", { class: "block" }, [
      el("header", null, [
        el("h2", { text: "Roster management" }),
        el("div", { class: "micro", text: "Majors only · all changes via Committee resolution" })
      ])
    ]);
    const panel = el("div", { class: "panel" });

    if (me.role !== "major") {
      panel.appendChild(el("p", { class: "muted", text: "Roster changes can only be proposed by Major Shareholders." }));
      section.appendChild(panel);
      return section;
    }

    // Appoint senior
    const name = el("input", { type: "text", placeholder: "Full name" });
    const email = el("input", { type: "email", placeholder: "email@elitez.asia" });
    const holderLink = el("select");
    holderLink.appendChild(el("option", { value: "", text: "(not an ESOP holder)" }));
    D.holders.forEach(h => holderLink.appendChild(el("option", { value: String(h.id), text: h.name })));
    const seatSel = el("select");
    vacantSeats().forEach(s => seatSel.appendChild(el("option", { value: String(s), text: `Seat ${s}` })));
    if (!vacantSeats().length) seatSel.appendChild(el("option", { value: "", text: "No vacant seats" }));
    const appointBtn = el("button", { type: "button", class: "btn btn--brass" }, ["Propose appointment"]);
    appointBtn.onclick = () => {
      if (!name.value || !email.value || !seatSel.value) { alert("Fill all fields."); return; }
      const newId = "m" + Date.now().toString(36);
      const res = Committee.act("roster_appoint", {
        id: newId,
        seat: Number(seatSel.value),
        name: name.value.trim(),
        email: email.value.trim(),
        role: "senior",
        holder_id: holderLink.value ? Number(holderLink.value) : null
      });
      announce(res, "Appointment");
    };

    panel.appendChild(el("h3", { text: "Propose a Senior Employee appointment" }));
    panel.appendChild(el("div", { class: "grid grid-2" }, [
      field("Name", name),
      field("Email", email),
      field("Seat", seatSel),
      field("Holder linkage (optional)", holderLink)
    ]));
    panel.appendChild(el("div", { style: "margin-top: 0.6rem;" }, [appointBtn]));

    // Remove senior
    const seniors = Committee.seniors();
    if (seniors.length) {
      panel.appendChild(el("div", { class: "rule" }));
      panel.appendChild(el("h3", { text: "Propose a removal" }));
      const removeSel = el("select");
      seniors.forEach(m => removeSel.appendChild(el("option", { value: m.id, text: `${m.name} — seat ${m.seat}` })));
      const removeBtn = el("button", { type: "button", class: "btn btn--ghost", style: "border-color: var(--bad); color: var(--bad);" }, ["Propose removal"]);
      removeBtn.onclick = () => {
        if (!confirm("Propose removing " + removeSel.options[removeSel.selectedIndex].text + "?")) return;
        const res = Committee.act("roster_remove", { id: removeSel.value });
        announce(res, "Removal");
      };
      panel.appendChild(el("div", { class: "grid grid-2" }, [
        field("Member", removeSel)
      ]));
      panel.appendChild(el("div", { style: "margin-top:0.6rem;" }, [removeBtn]));
    }

    section.appendChild(panel);
    return section;
  }

  function buildClosedResolutions(closed) {
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Recent resolutions" }) ])
    ]);
    if (!closed.length) {
      section.appendChild(el("div", { class: "panel muted", style: "text-align:center; padding:1rem;", text: "No closed resolutions yet." }));
      return section;
    }
    const tbl = el("table", { class: "data" });
    tbl.appendChild(el("thead", null, [ el("tr", null, [
      th("Closed"), th("Type"), th("Summary"), th("Outcome"), th("Tally")
    ]) ]));
    const tbody = el("tbody");
    closed.forEach(r => {
      const t = r.threshold || {};
      const tally = Committee.tallyVotes(r);
      const outcomeColor = r.outcome === "approved" ? "var(--good)" : r.outcome === "defeated" ? "var(--bad)" : "var(--muted)";
      tbody.appendChild(el("tr", null, [
        td((r.closed_at || "").slice(0, 10)),
        td((t.label || r.type)),
        td(summarisePayload(r.type, r.payload).slice(0, 80)),
        td(null, false, el("span", { class: "badge", style: `color: ${outcomeColor}; border-color: ${outcomeColor};`, text: (r.outcome || "closed").toUpperCase() })),
        td(`${tally.approves}–${tally.objects}–${tally.abstains}`)
      ]));
    });
    tbl.appendChild(tbody);
    section.appendChild(el("div", { class: "panel panel--flush" }, [tbl]));
    return section;
  }

  function buildThresholdPanel(me) {
    const all = Committee.allThresholds();
    const section = el("section", { class: "block" }, [
      el("header", null, [
        el("h2", { text: "Threshold rules" }),
        el("div", { class: "micro", text: "3/3 Majors required to change" })
      ])
    ]);
    const panel = el("div", { class: "panel panel--flush" });
    const tbl = el("table", { class: "data" });
    tbl.appendChild(el("thead", null, [ el("tr", null, [
      th("Action"), th("Total needed", true), th("Majors needed", true), th("Action")
    ]) ]));
    const tbody = el("tbody");
    Object.entries(all).forEach(([k, v]) => {
      const editBtn = el("button", { type: "button", class: "btn btn--ghost", style: "padding:0.3rem 0.8rem; font-size:0.72rem;" }, ["Propose change"]);
      editBtn.onclick = () => {
        if (me.role !== "major") { alert("Only Majors can propose threshold changes."); return; }
        const totalStr = prompt("Total votes needed (0 = operational):", v.total_needed);
        if (totalStr === null) return;
        const majorsStr = prompt("Majors needed:", v.majors_needed);
        if (majorsStr === null) return;
        const res = Committee.act("threshold_change", {
          action_type: k,
          total_needed: Number(totalStr),
          majors_needed: Number(majorsStr),
          label: v.label
        });
        announce(res, "Threshold change");
      };
      tbody.appendChild(el("tr", null, [
        td(v.label + " (" + k + ")"),
        td(String(v.total_needed), true),
        td(String(v.majors_needed), true),
        td(null, false, editBtn)
      ]));
    });
    tbl.appendChild(tbody);
    panel.appendChild(tbl);
    section.appendChild(panel);
    return section;
  }

  function buildDangerPanel(me) {
    const section = el("section", { class: "block" }, [
      el("header", null, [
        el("h2", { text: "Destructive operations" }),
        el("div", { class: "micro", text: "Require unanimous Majors" })
      ])
    ]);
    const panel = el("div", { class: "panel" });
    const state = Store.state();

    const resetBtn = el("button", { type: "button", class: "btn btn--ghost", style: "border-color: var(--bad); color: var(--bad);" }, ["Propose state reset"]);
    resetBtn.onclick = () => {
      if (me.role !== "major") { alert("Only Majors can propose a reset."); return; }
      const reason = prompt("Reason for reset (recorded):", "");
      if (reason === null) return;
      const res = Committee.act("state_reset", { reason });
      announce(res, "State reset");
    };
    panel.appendChild(el("p", { class: "muted", text: "Reset wipes all events — grants revert to seed, resolutions and passwords are lost. Requires 3/3 Majors. Once approved, click the final reset button to execute." }));
    panel.appendChild(resetBtn);

    if (state.state_reset_pending) {
      const executeBtn = el("button", { type: "button", class: "btn", style: "margin-left:0.8rem; background: var(--bad); border-color: var(--bad);" }, ["Execute authorised reset"]);
      executeBtn.onclick = () => Store.reset({ authorised: true });
      panel.appendChild(el("div", { class: "alert alert--bad", style: "margin-top:1rem;" }, [
        el("strong", { text: "Reset authorised." }),
        el("span", { text: " Click below within 10 minutes to execute." })
      ]));
      panel.appendChild(executeBtn);
    }

    section.appendChild(panel);
    return section;
  }

  // ---------------- helpers ----------------------------------------
  function announce(res, label) {
    if (res.error) { alert((label || "Action") + " failed: " + res.error + (res.note ? "\n" + res.note : "")); return; }
    if (res.status === "executed") alert((label || "Action") + " executed."); 
    else if (res.status === "proposed") alert((label || "Action") + " proposed — awaiting votes.");
    else if (res.status === "existing") alert("A pending resolution already exists for this exact action.");
  }

  function field(label, control) {
    return el("div", { class: "field", style: "margin:0;" }, [
      el("label", { text: label }),
      control
    ]);
  }
  function th(text, numeric) { const n = el("th", { text }); if (numeric) n.className = "num"; return n; }
  function td(text, numeric, child) {
    const n = el("td");
    if (numeric) n.className = "num";
    if (child) n.appendChild(child); else if (text !== undefined) n.textContent = text ?? "";
    return n;
  }
})();
