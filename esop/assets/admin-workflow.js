// Elitez ESOP — admin-only workflow extensions.
// Runs after admin.js has rendered the read-only dashboard and appends
// write-enabled sections: draft approvals, valuation entry, allocation
// scenarios, document issuance, audit log and state export/import.

(function () {
  const { el, readSession } = window.ESOPApp;
  const C = window.ESOPCalc;
  const D = window.ESOP_DATA;
  const Store = window.ESOPStore;
  const Auth = window.ESOPAuth;
  const Docs = window.ESOPDocs;
  const Committee = window.ESOPCommittee;
  const { fmt } = C;

  const session = readSession();
  if (!session || (session.kind !== "admin" && session.kind !== "committee")) return;

  // Show one-time confidentiality reminder after first successful Committee sign-in.
  if (window.ESOPApp.maybeShowConfidentialityReminder) window.ESOPApp.maybeShowConfidentialityReminder();

  const isLegacy = session.kind === "admin";
  const me = session.kind === "committee" ? Committee.member(session.member_id) : null;

  // Wrap every gated action: if Committee → Committee.act(); if legacy admin → block with message.
  // opts.silent: true suppresses per-call alerts (for batch callers that want one summary).
  function gatedAction(actionType, payload, successLabel, opts) {
    opts = opts || {};
    if (isLegacy) {
      if (!opts.silent) alert("This action requires a Committee session. Legacy admin is read-only. Sign in with your member email instead.");
      return { error: "legacy_read_only" };
    }
    const res = Committee.act(actionType, payload);
    if (opts.silent) return res;
    if (res.error) { alert("Action refused: " + res.error + (res.note ? "\n" + res.note : "")); return res; }
    if (res.status === "executed") { /* silent */ }
    else if (res.status === "proposed") { alert(`${successLabel || actionType} proposed — Resolution ${res.resolution_id.slice(0, 12)}. Other Committee members must vote to reach threshold.`); }
    else if (res.status === "existing") { alert("A matching pending resolution already exists — see the Committee page to vote."); }
    return res;
  }

  const root = document.getElementById("content");

  // Top-of-page workflow ribbon
  const ribbon = el("section", { class: "block", id: "workflow-ribbon", style: "margin-top: -1rem;" }, [
    el("header", null, [
      el("h2", { text: "Administrator workflows" }),
      buildStateControls()
    ])
  ]);
  // Insert just after the hero (first block)
  root.appendChild(ribbon);
  root.appendChild(buildExerciseQueue());
  root.appendChild(buildHolderOnboardingSection());
  root.appendChild(buildDraftsSection());
  root.appendChild(buildValuationSection());
  root.appendChild(buildScenarioSection());
  root.appendChild(buildDocIssuanceSection());
  root.appendChild(buildBulkDocsSection());
  root.appendChild(buildLeaverSection());
  root.appendChild(buildPasswordSection());
  root.appendChild(buildAuditSection());

  // Tag the workflow sections (all sections appended by admin-workflow.js
  // are not yet tagged — admin.js already tagged its own). In render order:
  //   exercise queue · drafts · valuation form · scenarios · doc issuance ·
  //   bulk docs · leaver determinations · password mgmt · audit log.
  // The workflow-ribbon stays untagged so state controls are always visible.
  const WORKFLOW_TABS = [
    "documents",   // exercise queue
    "holders",     // drafts approval
    "valuations",  // valuation form
    "holders",     // allocation scenarios
    "documents",   // doc issuance (single)
    "documents",   // bulk docs console
    "holders",     // leaver determinations
    "audit",       // password management
    "audit"        // audit log
  ];
  const untagged = Array.from(root.querySelectorAll("section.block, section.hero"))
    .filter(s => !s.hasAttribute("data-tab") && s.id !== "workflow-ribbon");
  untagged.forEach((s, i) => {
    if (WORKFLOW_TABS[i]) s.setAttribute("data-tab", WORKFLOW_TABS[i]);
  });

  // Re-render the whole page after events that change rendered state.
  // Skip events that are purely informational (document previews, login log)
  // so opening a PDF preview doesn't blow the page out from under the user.
  let rerendering = false;
  const NON_STATEFUL = new Set([
    "document_issued",
    "login",
    "scenario_saved",
    "statements_bulk_issued"
  ]);
  Store.subscribe((ev) => {
    if (rerendering || !ev) return;
    if (NON_STATEFUL.has(ev.type)) return;
    rerendering = true;
    setTimeout(() => window.location.reload(), 150);
  });

  // =====================================================================

  function buildStateControls() {
    const wrap = el("div", { class: "micro", style: "display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;" });

    // --- Demo time-travel control ---
    const demoActive = C.isDemoDate();
    const demoBadge = demoActive
      ? el("span", { class: "badge", style: "color: var(--bad); border-color: var(--bad); margin-right: 0.4rem;", text: `DEMO: ${C.asOfDate().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` })
      : null;
    if (demoBadge) wrap.appendChild(demoBadge);
    const dtInput = el("input", { type: "date", value: C.asOfDate().toISOString().slice(0, 10), style: "font-size: 0.74rem; padding: 0.35rem 0.5rem; border: 1px solid var(--line-strong); background: var(--paper); font-family: var(--sans);" });
    const dtBtn = el("button", { type: "button", class: "btn btn--ghost", style: "font-size:0.7rem; padding: 0.35rem 0.7rem;" }, [demoActive ? "Update" : "Demo as-of"]);
    dtBtn.onclick = () => {
      if (!dtInput.value) return;
      C.setDemoDate(dtInput.value);
      window.location.reload();
    };
    const dtClear = demoActive ? el("button", { type: "button", class: "btn btn--ghost", style: "font-size:0.7rem; padding: 0.35rem 0.7rem; margin-left: 0.3rem; border-color: var(--bad); color: var(--bad);" }, ["Clear"]) : null;
    if (dtClear) dtClear.onclick = () => { C.setDemoDate(null); window.location.reload(); };

    wrap.appendChild(dtInput);
    wrap.appendChild(dtBtn);
    if (dtClear) wrap.appendChild(dtClear);
    wrap.appendChild(el("span", { style: "width: 1px; height: 20px; background: var(--line-strong); margin: 0 0.4rem;" }));

    // --- State controls ---
    const ex = el("button", { type: "button", class: "btn btn--ghost", style: "font-size:0.7rem; padding: 0.35rem 0.7rem;" }, ["Export"]);
    const im = el("button", { type: "button", class: "btn btn--ghost", style: "font-size:0.7rem; padding: 0.35rem 0.7rem;" }, ["Import"]);
    const rs = el("button", { type: "button", class: "btn btn--ghost", style: "font-size:0.7rem; padding: 0.35rem 0.7rem; border-color: var(--bad); color: var(--bad);" }, ["Reset"]);
    ex.onclick = () => {
      const blob = new Blob([Store.exportJSON()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "elitez-esop-state-" + new Date().toISOString().slice(0, 10) + ".json";
      a.click();
      URL.revokeObjectURL(url);
    };
    im.onclick = () => {
      const state = Store.state();
      if (!state.state_import_pending) {
        gatedAction("state_import", { reason: "Import state JSON" }, "State import authorisation");
        return;
      }
      const input = document.createElement("input");
      input.type = "file"; input.accept = "application/json";
      input.onchange = () => {
        const f = input.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = () => {
          try { Store.importJSON(r.result, { authorised: true }); alert("State imported."); }
          catch (e) { alert("Import failed: " + e.message); }
        };
        r.readAsText(f);
      };
      input.click();
    };
    rs.onclick = () => {
      const state = Store.state();
      if (!state.state_reset_pending) {
        gatedAction("state_reset", { reason: "Full state wipe" }, "State reset authorisation");
        return;
      }
      Store.reset({ authorised: true });
    };
    wrap.appendChild(ex);
    wrap.appendChild(im);
    wrap.appendChild(rs);
    return wrap;
  }

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  function buildHolderOnboardingSection() {
    const section = el("section", { class: "block", "data-tab": "holders" }, [
      el("header", null, [
        el("h2", { text: "Onboard a new holder" }),
        el("div", { class: "micro", text: "Add then propose initial grant" })
      ])
    ]);
    const panel = el("div", { class: "panel" });

    panel.appendChild(el("p", { class: "muted", style: "font-family: var(--serif); font-style: italic; margin-bottom: 1rem;",
      text: "Adds a new Option Holder to the register. The grant itself is a separate Committee resolution — onboarding only creates the person record. Each addition is recorded in the audit log." }));

    const nameI = el("input", { type: "text", placeholder: "e.g. Goh Wei Ming" });
    const titleI = el("input", { type: "text", placeholder: "e.g. Senior Manager" });
    const deptI = el("select");
    ["HR","FIN","SALES","OPS","DHC"].forEach(d => deptI.appendChild(el("option", { value: d, text: d })));
    const natI = el("select");
    ["Singaporean","Malaysian","Chinese","Taiwanese","Other"].forEach(n => natI.appendChild(el("option", { value: n, text: n })));
    const icI = el("input", { type: "text", placeholder: "Last 4 chars + suffix, e.g. 1234A" });
    const emailI = el("input", { type: "email", placeholder: "name@elitez.asia" });

    const addBtn = el("button", { type: "button", class: "btn btn--brass" }, ["Add holder"]);
    const errBox = el("div", { class: "alert alert--bad", style: "margin-top: 0.8rem; display:none;" });

    addBtn.onclick = () => {
      errBox.style.display = "none";
      if (!nameI.value.trim()) { errBox.textContent = "Name required."; errBox.style.display = "block"; return; }
      if (!emailI.value.trim()) { errBox.textContent = "Email required."; errBox.style.display = "block"; return; }
      // Generate a new unique holder id (next integer above current max)
      const existing = C.holders().map(h => h.id || 0);
      const newId = Math.max(0, ...existing) + 1;
      const payload = {
        id: newId,
        name: nameI.value.trim(),
        title: titleI.value.trim(),
        dept: deptI.value,
        nat: natI.value,
        ic: icI.value.trim() || "PENDING",
        email: emailI.value.trim().toLowerCase(),
        grants: []
      };
      const res = gatedAction("holder_added", payload, `Onboard ${payload.name}`);
      if (res && !res.error) {
        nameI.value = ""; titleI.value = ""; icI.value = ""; emailI.value = "";
        alert(`${payload.name} added as holder #${newId}. Propose a draft grant from the FY2025 drafts queue, or via direct allocation.`);
      }
    };

    panel.appendChild(el("div", { class: "grid grid-2" }, [
      field("Full name", nameI),
      field("Email", emailI),
      field("Job title", titleI),
      field("Department", deptI),
      field("Nationality", natI),
      field("ID (last chars)", icI)
    ]));
    panel.appendChild(el("div", { style: "margin-top: 0.8rem;" }, [addBtn]));
    panel.appendChild(errBox);
    section.appendChild(panel);
    return section;
  }

  function buildDraftsSection() {
    const section = el("section", { class: "block" }, [
      el("header", null, [
        el("h2", { text: "FY2025 drafts — approval queue" }),
        el("div", { class: "micro", text: "Committee decisions · individual or batch" })
      ])
    ]);

    const holders = C.holders();
    const drafts = [];
    holders.forEach(h => h.grants.forEach(g => { if (g.status === "draft") drafts.push({ holder: h, grant: g }); }));

    if (!drafts.length) {
      section.appendChild(el("div", { class: "panel", text: "No draft grants outstanding." }));
      return section;
    }

    const batchDate = el("input", { type: "date", value: "2025-07-31" });
    const batchBtn = el("button", { type: "button", class: "btn btn--brass" }, [`Propose approval of all ${drafts.length} drafts at this date`]);
    batchBtn.onclick = () => {
      if (!batchDate.value) { alert("Pick a grant date first."); return; }
      if (!confirm(`Propose Committee resolution to approve ${drafts.length} drafts with grant date ${batchDate.value}?\n\nEach draft is one resolution — you'll see ${drafts.length} entries on the Governance tab for voting.`)) return;

      let proposed = 0, existing = 0, errored = 0;
      const erroredNames = [];
      drafts.forEach(d => {
        const res = gatedAction("grant_approval", {
          holder_id: d.holder.id,
          fy: d.grant.fy,
          grant_date: batchDate.value,
          letter_date: batchDate.value
        }, `Grant approval for ${d.holder.name}`, { silent: true });
        if (res.error) { errored++; erroredNames.push(d.holder.name); }
        else if (res.status === "proposed") proposed++;
        else if (res.status === "existing") existing++;
      });

      const lines = [
        `Batch propose complete for ${drafts.length} drafts dated ${batchDate.value}.`,
        "",
        `  ${proposed} new resolutions created`,
        `  ${existing} already-pending (skipped)`,
        errored ? `  ${errored} errored: ${erroredNames.slice(0, 5).join(", ")}${erroredNames.length > 5 ? "…" : ""}` : null,
        "",
        "Open Governance to vote. The page will reload now to refresh the queue."
      ].filter(Boolean);
      alert(lines.join("\n"));
    };

    const batchPanel = el("div", { class: "panel", style: "display: flex; gap: 1rem; align-items: end;" }, [
      el("div", { style: "flex:1;" }, [
        el("div", { class: "micro", text: "Batch approve" }),
        el("p", { class: "muted tiny", text: "Set one common grant date for all drafts and approve in one go. Use individual approve below for per-holder dates or to reject specific drafts." })
      ]),
      el("div", { class: "field", style: "margin:0; min-width: 220px;" }, [
        el("label", { text: "Common grant date" }),
        batchDate
      ]),
      batchBtn
    ]);
    section.appendChild(batchPanel);

    const tbl = el("table", { class: "data" });
    tbl.appendChild(el("thead", null, [ el("tr", null, [
      th("Holder"), th("Title"), th("Dept"), th("Draft qty", true),
      th("Proposed grant date"), th("Action")
    ]) ]));
    const tbody = el("tbody");
    drafts.forEach(({ holder, grant }) => {
      const dateInput = el("input", { type: "date", value: "2025-07-31" });
      const approveBtn = el("button", { type: "button", class: "btn", style: "padding: 0.4rem 0.9rem; font-size:0.72rem;" }, ["Approve"]);
      const rejectBtn = el("button", { type: "button", class: "btn btn--ghost", style: "padding: 0.4rem 0.9rem; font-size:0.72rem; margin-left:0.4rem; border-color: var(--bad); color: var(--bad);" }, ["Reject"]);
      approveBtn.onclick = () => {
        gatedAction("grant_approval", {
          holder_id: holder.id,
          fy: grant.fy,
          grant_date: dateInput.value,
          letter_date: dateInput.value
        }, `Approve ${holder.name} · ${grant.fy}`);
      };
      rejectBtn.onclick = () => {
        const reason = prompt("Reason for rejecting this draft?");
        if (reason === null) return;
        gatedAction("grant_rejection", { holder_id: holder.id, fy: grant.fy, reason }, `Reject ${holder.name} · ${grant.fy}`);
      };
      tbody.appendChild(el("tr", null, [
        td(holder.name),
        td(holder.title),
        td(holder.dept),
        td(fmt.num(grant.qty), true),
        td(null, false, dateInput),
        td(null, false, el("span", null, [approveBtn, rejectBtn]))
      ]));
    });
    tbl.appendChild(tbody);
    section.appendChild(el("div", { class: "panel panel--flush", style: "margin-top:1rem;" }, [tbl]));
    return section;
  }

  // ---------------------------------------------------------------------
  function buildValuationSection() {
    const section = el("section", { class: "block" }, [
      el("header", null, [
        el("h2", { text: "Valuation committee" }),
        el("div", { class: "micro", text: "Record new annual valuation · change active FY" })
      ])
    ]);

    const fyInput = el("input", { type: "text", value: "FY2026", placeholder: "FY2026" });
    const ebitdaInput = el("input", { type: "number", value: "5500000", step: "1" });
    const ntaInput = el("input", { type: "number", value: "0", step: "1" });
    const multInput = el("input", { type: "number", value: "6", step: "0.1" });
    const effectiveInput = el("input", { type: "date", value: "2026-11-30" });
    const committeeInput = el("input", { type: "text", value: "Derrick / Chen / Lim + 2 senior employees" });
    const noteInput = el("input", { type: "text", placeholder: "Optional — rationale" });
    const fmvPreview = el("div", { class: "serif", style: "font-size:1.6rem; margin-top:0.6rem; color: var(--navy);" });

    function recalc() {
      const eb = Number(ebitdaInput.value);
      const nta = Number(ntaInput.value);
      const m = Number(multInput.value);
      const firm = Math.max(eb * m, nta);
      const fmv = firm / D.org.total_outstanding_shares;
      fmvPreview.textContent = `FMV: ${fmt.sgd(fmv, 4)} / share · Firm value ${fmt.sgd(firm, 0)} · Exercise price ${fmt.sgd(fmv * 0.10, 4)}`;
    }
    [ebitdaInput, ntaInput, multInput].forEach(i => i.addEventListener("input", recalc));
    recalc();

    const saveBtn = el("button", { type: "button", class: "btn btn--brass" }, ["Record valuation"]);
    const activateBtn = el("button", { type: "button", class: "btn btn--ghost", style: "margin-left:0.6rem;" }, ["Record & activate as FMV"]);
    function save(activate) {
      const eb = Number(ebitdaInput.value);
      const nta = Number(ntaInput.value);
      const m = Number(multInput.value);
      const firm = Math.max(eb * m, nta);
      const fmv = firm / D.org.total_outstanding_shares;
      const payload = {
        fy: fyInput.value,
        ebitda: eb,
        nta,
        multiple: m,
        fmv: Math.round(fmv * 10000) / 10000,
        committee: committeeInput.value,
        note: noteInput.value,
        effective: effectiveInput.value
      };
      gatedAction("valuation_add", payload, `Record ${payload.fy} valuation`);
      if (activate) gatedAction("valuation_activate", { fy: payload.fy }, `Activate ${payload.fy} as FMV`);
    }
    saveBtn.onclick = () => save(false);
    activateBtn.onclick = () => save(true);

    const form = el("div", { class: "panel" }, [
      el("div", { class: "grid grid-3" }, [
        field("Fiscal year", fyInput),
        field("Effective (audit published)", effectiveInput),
        field("Committee", committeeInput),
        field("EBITDA (SGD)", ebitdaInput),
        field("NTA floor (SGD)", ntaInput),
        field("Multiple (×)", multInput)
      ]),
      el("div", { class: "field" }, [
        el("label", { text: "Note" }),
        noteInput
      ]),
      el("div", { class: "rule" }),
      el("div", { class: "micro", text: "Computed FMV" }),
      fmvPreview,
      el("div", { style: "margin-top:1rem;" }, [ saveBtn, activateBtn ])
    ]);
    section.appendChild(form);

    // Existing valuations with "activate" action
    const vList = el("table", { class: "data" });
    vList.appendChild(el("thead", null, [ el("tr", null, [
      th("FY"), th("EBITDA", true), th("Multiple", true), th("FMV", true), th("Active"), th("Action")
    ]) ]));
    const vBody = el("tbody");
    C.valuationHistory().forEach(v => {
      const act = el("button", { type: "button", class: "btn btn--ghost", style: "padding:0.3rem 0.8rem; font-size:0.72rem;" }, [v.active ? "Active" : "Activate"]);
      if (v.active) act.disabled = true;
      act.onclick = () => gatedAction("valuation_activate", { fy: v.fy }, `Activate ${v.fy}`);
      vBody.appendChild(el("tr", null, [
        td(v.fy),
        td(fmt.sgd(v.ebitda, 0), true),
        td(v.multiple + "×", true),
        td(fmt.sgd(v.fmv, 4), true),
        td(null, false, v.active ? badge("Active", "active") : el("span", { class: "muted", text: "—" })),
        td(null, false, act)
      ]));
    });
    vList.appendChild(vBody);
    section.appendChild(el("div", { class: "panel panel--flush", style: "margin-top:1.2rem;" }, [vList]));
    return section;
  }

  // ---------------------------------------------------------------------
  function buildScenarioSection() {
    const section = el("section", { class: "block" }, [
      el("header", null, [
        el("h2", { text: "FY2025 allocation scenarios" }),
        el("div", { class: "micro", text: "Model · save · compare · commit" })
      ])
    ]);

    const alloc = C.allocationDistribution();

    // Working copy of allocations
    const working = {};
    alloc.rows.forEach(r => { working[r.id] = r.shares; });

    const state = Store.state();
    const scenarios = state.scenarios;

    const scenarioName = el("input", { type: "text", placeholder: "Scenario name e.g. Linear-Baseline" });
    const scenarioNotes = el("input", { type: "text", placeholder: "Notes (optional)" });
    const saveBtn = el("button", { type: "button", class: "btn btn--brass" }, ["Save scenario"]);
    const commitBtn = el("button", { type: "button", class: "btn", style: "margin-left:0.6rem;" }, ["Commit working values to drafts"]);

    const summaryLine = el("div", { class: "muted tiny", style: "margin-top:0.6rem;" });

    const totalsBar = el("div", { class: "grid grid-4", style: "margin-bottom:1rem;" });

    function recomputeSummary() {
      while (totalsBar.firstChild) totalsBar.removeChild(totalsBar.firstChild);
      const rows = Object.entries(working).map(([id, shares]) => ({ id: Number(id), shares }));
      const total = rows.reduce((s, r) => s + r.shares, 0);
      const mean = total / rows.length;
      const variance = rows.reduce((s, r) => s + (r.shares - mean) ** 2, 0) / rows.length;
      const stdev = Math.sqrt(variance);
      const sorted = rows.slice().sort((a, b) => b.shares - a.shares);
      const top20 = sorted.slice(0, Math.ceil(rows.length * 0.20)).reduce((s, r) => s + r.shares, 0);
      totalsBar.appendChild(statItem("Total", fmt.num(Math.round(total)), "shares"));
      totalsBar.appendChild(statItem("Mean", fmt.num(Math.round(mean)), "per holder"));
      totalsBar.appendChild(statItem("Stdev", fmt.num(Math.round(stdev)), "target 10–15K"));
      totalsBar.appendChild(statItem("Top 20%", fmt.pct(top20 / total), "target 38–50%"));
      summaryLine.textContent = `Delta vs current drafts: ${fmt.num(Math.round(total - alloc.total))} shares.`;
    }

    // Table of holders with editable allocation
    const tbl = el("table", { class: "data" });
    tbl.appendChild(el("thead", null, [ el("tr", null, [
      th("Holder"), th("Dept"), th("Current draft", true), th("Working", true), th("Delta", true)
    ]) ]));
    const tbody = el("tbody");
    alloc.rows.forEach(r => {
      const input = el("input", { type: "number", value: String(r.shares), step: "100", min: "0", style: "width:110px; text-align:right;" });
      const deltaCell = td("", true);
      function updateDelta() {
        const v = Number(input.value);
        working[r.id] = v;
        const delta = v - r.shares;
        deltaCell.textContent = (delta >= 0 ? "+" : "") + fmt.num(delta);
        deltaCell.style.color = delta === 0 ? "var(--muted)" : (delta > 0 ? "var(--good)" : "var(--bad)");
        recomputeSummary();
      }
      input.addEventListener("input", updateDelta);
      tbody.appendChild(el("tr", null, [
        td(r.name),
        td(r.dept),
        td(fmt.num(r.shares), true),
        td(null, true, input),
        deltaCell
      ]));
    });
    tbl.appendChild(tbody);

    saveBtn.onclick = () => {
      // Scenario save isn't gated — saving a candidate doesn't change state.
      if (!scenarioName.value.trim()) { alert("Give the scenario a name first."); return; }
      Store.emit("scenario_saved", { name: scenarioName.value.trim(), allocations: { ...working }, notes: scenarioNotes.value, saved_by: me ? me.name : "legacy" });
      alert("Saved scenario: " + scenarioName.value.trim());
    };
    commitBtn.onclick = () => {
      if (!confirm("Propose a Committee resolution to commit these working values. Commits go through Committee approval.")) return;
      const changes = [];
      alloc.rows.forEach(r => {
        if (working[r.id] !== r.shares) {
          changes.push({ holder_id: r.id, fy: "FY2025", qty: working[r.id], reason: "Scenario commit" });
        }
      });
      if (!changes.length) { alert("No changes to commit."); return; }
      gatedAction("allocation_commit", {
        scenario_name: scenarioName.value.trim() || "ad-hoc",
        changes
      }, "Allocation commit");
    };

    section.appendChild(el("div", { class: "panel" }, [
      totalsBar,
      summaryLine,
      el("div", { class: "rule" }),
      el("div", { class: "grid grid-2", style: "margin-bottom:1rem;" }, [
        el("div", { class: "field", style: "margin:0;" }, [ el("label", { text: "Scenario name" }), scenarioName ]),
        el("div", { class: "field", style: "margin:0;" }, [ el("label", { text: "Notes" }), scenarioNotes ])
      ]),
      el("div", null, [saveBtn, commitBtn]),
      el("div", { class: "rule" }),
      tbl
    ]));

    // Saved scenarios
    const savedPanel = el("div", { class: "panel", style: "margin-top:1.2rem;" });
    savedPanel.appendChild(el("h3", { text: "Saved scenarios" }));
    const savedKeys = Object.keys(scenarios);
    if (!savedKeys.length) {
      savedPanel.appendChild(el("p", { class: "muted", text: "None yet. Edit allocations above and save a named scenario to compare." }));
    } else {
      const savedTbl = el("table", { class: "data" });
      savedTbl.appendChild(el("thead", null, [ el("tr", null, [th("Name"), th("Saved"), th("Total", true), th("Notes"), th("Actions")] ) ]));
      const sBody = el("tbody");
      savedKeys.forEach(name => {
        const sc = scenarios[name];
        const total = Object.values(sc.allocations).reduce((a, b) => a + b, 0);
        const loadBtn = el("button", { type: "button", class: "btn btn--ghost", style: "padding:0.3rem 0.8rem; font-size:0.72rem;" }, ["Load"]);
        const commitBtn2 = el("button", { type: "button", class: "btn", style: "padding:0.3rem 0.8rem; font-size:0.72rem; margin-left:0.4rem;" }, ["Commit"]);
        loadBtn.onclick = () => {
          Object.entries(sc.allocations).forEach(([id, v]) => { working[id] = v; });
          // Refresh inputs by reloading
          window.location.reload();
        };
        commitBtn2.onclick = () => {
          const sc2 = scenarios[name];
          if (!sc2) return;
          const changes = [];
          alloc.rows.forEach(r => {
            const target = sc2.allocations[r.id];
            if (target != null && target !== r.shares) {
              changes.push({ holder_id: r.id, fy: "FY2025", qty: target, reason: `Scenario "${name}"` });
            }
          });
          if (!changes.length) { alert("No changes in this scenario vs current drafts."); return; }
          if (!confirm(`Propose resolution to commit scenario "${name}" (${changes.length} changes)?`)) return;
          gatedAction("allocation_commit", { scenario_name: name, changes }, `Commit ${name}`);
        };
        sBody.appendChild(el("tr", null, [
          td(name),
          td(fmt.date(sc.saved_at.slice(0, 10))),
          td(fmt.num(total), true),
          td(sc.notes || "—"),
          td(null, false, el("span", null, [loadBtn, commitBtn2]))
        ]));
      });
      savedTbl.appendChild(sBody);
      savedPanel.appendChild(savedTbl);
    }
    section.appendChild(savedPanel);

    recomputeSummary();
    return section;
  }

  // ---------------------------------------------------------------------
  function buildDocIssuanceSection() {
    const section = el("section", { class: "block" }, [
      el("header", null, [
        el("h2", { text: "Document issuance" }),
        el("div", { class: "micro", text: "Letter of Offer · Exercise Invitation · Clawback Notice" })
      ])
    ]);

    const holderSelect = el("select");
    holderSelect.appendChild(el("option", { value: "", text: "Select holder…" }));
    C.holders().forEach(h => holderSelect.appendChild(el("option", { value: String(h.id), text: h.name + " — " + h.title })));

    const grantSelect = el("select", { disabled: "true" });
    holderSelect.addEventListener("change", () => {
      while (grantSelect.firstChild) grantSelect.removeChild(grantSelect.firstChild);
      const h = C.holders().find(x => x.id === Number(holderSelect.value));
      if (!h) { grantSelect.disabled = true; return; }
      grantSelect.disabled = false;
      h.grants.forEach(g => {
        grantSelect.appendChild(el("option", { value: g.fy, text: `${g.fy} — ${fmt.num(g.qty)} options — ${g.status}` }));
      });
    });

    const looBtn = el("button", { type: "button", class: "btn btn--brass", style: "margin-right:0.6rem;" }, ["Letter of Offer"]);
    const eiBtn = el("button", { type: "button", class: "btn", style: "margin-right:0.6rem;" }, ["Exercise Invitation"]);
    const cbGoodBtn = el("button", { type: "button", class: "btn btn--ghost", style: "margin-right:0.6rem;" }, ["Clawback · Good Leaver"]);
    const cbBadBtn = el("button", { type: "button", class: "btn btn--ghost", style: "border-color: var(--bad); color: var(--bad);" }, ["Clawback · Bad Leaver"]);

    looBtn.onclick = () => {
      const h = C.holders().find(x => x.id === Number(holderSelect.value));
      const g = h && h.grants.find(x => x.fy === grantSelect.value);
      if (!h || !g) { alert("Pick holder and grant."); return; }
      if (g.status === "draft") { alert("Grant is still a draft — approve first."); return; }
      const v = C.activeValuation();
      // Docs.present() itself emits the document_issued audit event; no Committee.act needed.
      Docs.present(Docs.letterOfOffer(h, g, v), { title: "Letter of Offer", holder: h, docType: "letter_of_offer", fy: g.fy });
    };
    eiBtn.onclick = () => {
      const h = C.holders().find(x => x.id === Number(holderSelect.value));
      const g = h && h.grants.find(x => x.fy === grantSelect.value);
      if (!h || !g) { alert("Pick holder and grant."); return; }
      if (g.status === "draft") { alert("Grant is still a draft — approve first."); return; }
      const v = C.activeValuation();
      Docs.present(Docs.exerciseInvitation(h, g, v), { title: "Exercise Invitation", holder: h, docType: "exercise_invitation", fy: g.fy });
    };
    function clawback(type) {
      const h = C.holders().find(x => x.id === Number(holderSelect.value));
      if (!h) { alert("Pick holder."); return; }
      const lastDay = prompt("Last day of employment (YYYY-MM-DD)?", D.meta.as_of);
      if (!lastDay) return;
      const v = C.activeValuation();
      // Leaver determination is a gated Committee resolution
      const res = gatedAction("leaver_determination", {
        holder_id: h.id,
        type,
        as_of: lastDay,
        note: "Committee determination via Clawback flow"
      }, `${type === "bad" ? "Bad" : "Good"} Leaver determination for ${h.name}`);
      // Whether resolved-or-pending, let the admin preview the clawback notice itself
      Docs.present(Docs.clawbackNotice(h, type, v, lastDay), {
        title: "Clawback Notice — " + (type === "bad" ? "Bad" : "Good") + " Leaver (preview — will become authoritative once resolution executes)",
        holder: h, docType: "clawback_" + type
      });
    }
    cbGoodBtn.onclick = () => clawback("good");
    cbBadBtn.onclick = () => clawback("bad");

    section.appendChild(el("div", { class: "panel" }, [
      el("div", { class: "grid grid-2" }, [
        field("Holder", holderSelect),
        field("Grant", grantSelect)
      ]),
      el("div", { class: "rule" }),
      el("div", null, [looBtn, eiBtn, cbGoodBtn, cbBadBtn]),
      el("p", { class: "muted tiny", style: "margin-top:0.8rem;", text: "Each issuance is logged in the audit trail. The preview overlay lets you print or download as PDF — suitable for e-signature workflows." })
    ]));
    return section;
  }

  // ---------------------------------------------------------------------
  function buildLeaverSection() {
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Leaver determinations" }) ])
    ]);
    const state = Store.state();
    const panel = el("div", { class: "panel" });
    D.leavers.forEach(l => {
      const goodBtn = el("button", { type: "button", class: "btn btn--ghost", style: "padding:0.3rem 0.8rem; font-size:0.72rem; border-color: var(--good); color: var(--good);" }, ["Good Leaver"]);
      const badBtn = el("button", { type: "button", class: "btn btn--ghost", style: "padding:0.3rem 0.8rem; font-size:0.72rem; border-color: var(--bad); color: var(--bad); margin-left:0.4rem;" }, ["Bad Leaver"]);
      goodBtn.onclick = () => gatedAction("leaver_determination", { holder_id: l.name, type: "good", as_of: D.meta.as_of, note: "Committee determination" }, `Good Leaver · ${l.name}`);
      badBtn.onclick = () => gatedAction("leaver_determination", { holder_id: l.name, type: "bad", as_of: D.meta.as_of, note: "Committee determination" }, `Bad Leaver · ${l.name}`);
      const current = state.leaver_determinations[l.name];
      const row = el("div", { class: "kv" }, [
        el("div", { class: "k" }, [
          el("span", null, [l.name]),
          current ? el("span", { class: "badge", style: `margin-left:0.6rem; color: var(--${current.type === "good" ? "good" : "bad"});`, text: current.type === "good" ? "Good Leaver" : "Bad Leaver" }) : null
        ]),
        el("div", { class: "v" }, [goodBtn, badBtn])
      ]);
      panel.appendChild(row);
    });
    section.appendChild(panel);
    return section;
  }

  // ---------------------------------------------------------------------
  function buildPasswordSection() {
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Holder password management" }) ])
    ]);
    const state = Store.state();
    const holderSelect = el("select");
    holderSelect.appendChild(el("option", { value: "", text: "Select holder…" }));
    C.holders().forEach(h => {
      const set = state.passwords[h.id] ? "set" : "not set";
      holderSelect.appendChild(el("option", { value: String(h.id), text: `${h.name} — password ${set}` }));
    });
    const pwInput = el("input", { type: "text", value: "welcome2026" });
    const resetBtn = el("button", { type: "button", class: "btn btn--brass" }, ["Reset password (Majors only)"]);
    resetBtn.onclick = async () => {
      const id = Number(holderSelect.value);
      if (!id) { alert("Pick a holder."); return; }
      if (!pwInput.value || pwInput.value.length < 6) { alert("Temp password must be ≥ 6 chars."); return; }
      if (isLegacy) { alert("Legacy admin is read-only. Sign in with your Committee member email."); return; }
      if (!me || me.role !== "major") { alert("Only Major Shareholders can reset holder passwords."); return; }
      const hash = await Store.hashPassword(pwInput.value);
      const res = Committee.act("reset_holder_password", { subject: id, hash });
      if (res.error) { alert("Reset refused: " + res.error); return; }
      alert("Password reset. Temp password: " + pwInput.value + "\nShare securely with the holder.");
    };

    // Self-service: change my Committee password
    const oldPw = el("input", { type: "password", placeholder: "Current password" });
    const newPw = el("input", { type: "password", placeholder: "New password (min 6)" });
    const meBtn = el("button", { type: "button", class: "btn" }, ["Change my password"]);
    meBtn.onclick = async () => {
      if (!me) { alert("Sign in as a Committee member."); return; }
      const subject = Auth.committeeSubjectId(me.id);
      const res = await Auth.changePassword(subject, oldPw.value, newPw.value);
      if (!res.ok) { alert("Failed: " + res.reason); return; }
      alert("Your Committee password updated.");
      oldPw.value = ""; newPw.value = "";
    };

    section.appendChild(el("div", { class: "panel" }, [
      el("h3", { text: "Reset a holder's password" }),
      el("div", { class: "grid grid-2" }, [
        field("Holder", holderSelect),
        field("Temp password", pwInput)
      ]),
      el("div", null, [resetBtn]),
      el("div", { class: "rule" }),
      el("h3", { text: "Change my Committee password" }),
      el("div", { class: "grid grid-2" }, [
        field("Current", oldPw),
        field("New", newPw)
      ]),
      el("div", null, [meBtn]),
      el("p", { class: "muted tiny", style: "margin-top:0.8rem;", text: "Hashes are SHA-256 via Web Crypto. Persisted in localStorage for this browser. In production, swap for your IdP." })
    ]));
    return section;
  }

  // ---------------------------------------------------------------------
  function buildAuditSection() {
    const section = el("section", { class: "block" }, [
      el("header", null, [
        el("h2", { text: "Audit log" }),
        el("div", { class: "micro", text: `${Store.history().length} events` })
      ])
    ]);
    const panel = el("div", { class: "panel panel--flush" });
    const tbl = el("table", { class: "data" });
    tbl.appendChild(el("thead", null, [ el("tr", null, [ th("When"), th("Type"), th("Payload") ]) ]));
    const tbody = el("tbody");
    const events = Store.history().slice().reverse();
    if (!events.length) {
      tbody.appendChild(el("tr", null, [
        el("td", { colspan: "3", class: "muted", style: "padding: 1.2rem 0.8rem;", text: "No events recorded yet. Take any admin action above and it will appear here." })
      ]));
    } else {
      events.slice(0, 100).forEach(ev => {
        const when = new Date(ev.at).toLocaleString("en-SG", { dateStyle: "short", timeStyle: "short" });
        const payload = summarizePayload(ev);
        tbody.appendChild(el("tr", null, [
          td(when),
          td(null, false, el("span", { class: "badge", style: "border-color: var(--brass); color: var(--brass);", text: ev.type })),
          td(null, false, el("code", { class: "mono tiny", text: payload }))
        ]));
      });
    }
    tbl.appendChild(tbody);
    panel.appendChild(tbl);
    section.appendChild(panel);
    return section;
  }

  function summarizePayload(ev) {
    try {
      const p = { ...ev.payload };
      if (p.hash) p.hash = p.hash.slice(0, 8) + "…";
      return JSON.stringify(p);
    } catch { return "—"; }
  }

  // ---------- utilities -------------------------------------------------
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
  function badge(text, kind) { return el("span", { class: `badge badge--${kind}`, text }); }
  function statItem(label, value, sub) {
    return el("div", null, [
      el("div", { class: "micro muted", text: label }),
      el("div", { class: "serif", style: "font-size: 1.8rem; margin-top:0.2rem;", text: value }),
      el("div", { class: "tiny muted", text: sub })
    ]);
  }

  // =====================================================================
  // Trustee · Exercise queue
  // =====================================================================
  function buildExerciseQueue() {
    const section = el("section", { class: "block" }, [
      el("header", null, [
        el("h2", { text: "Trustee · exercise queue" }),
        el("div", { class: "micro", text: "Single-signatory (Clause 10.11)" })
      ])
    ]);
    const state = Store.state();
    const pending = (state.exercises || []).filter(x => x.status === "submitted");
    const recent = (state.exercises || []).filter(x => x.status !== "submitted").slice().reverse().slice(0, 10);
    const Docs = window.ESOPDocs;

    if (!pending.length) {
      const empty = el("div", { class: "panel", style: "text-align:center; padding:1.6rem;" }, [
        el("p", { class: "muted", style: "font-family: var(--serif); font-style: italic; margin-bottom: 0.9rem;", text: "No pending exercises. Live exercise windows don't open until Jul 2027 (FY2022 cohort)." }),
        (() => {
          const seedBtn = el("button", { type: "button", class: "btn btn--ghost", style: "font-size:0.72rem; padding: 0.45rem 1rem;" }, ["Seed a demo exercise · Tok Meiting FY2022"]);
          seedBtn.onclick = () => {
            const h = C.holders().find(x => x.id === 1);
            const g = h && h.grants.find(gg => gg.fy === "FY2022");
            if (!h || !g) { alert("Demo holder not found."); return; }
            const v = C.activeValuation();
            const vested = Math.floor(g.qty * C.vestingFor(g.grant_date).vested_pct);
            const cost = vested * v.exercise_price;
            Store.emit("exercise_submitted", {
              exercise_id: "exc_demo_" + Date.now().toString(36),
              holder_id: h.id, fy: g.fy,
              qty: vested,
              exercise_price: v.exercise_price,
              fmv_at_submission: v.fmv,
              cost,
              payment_ref: "DEMO-PAYNOW-" + Date.now().toString().slice(-6),
              payment_method: "paynow",
              signed_name: h.name,
              demo: true
            });
          };
          return seedBtn;
        })()
      ]);
      section.appendChild(empty);
    } else {
      const tbl = el("table", { class: "data" });
      tbl.appendChild(el("thead", null, [ el("tr", null, [
        th("Submitted"), th("Holder"), th("FY"), th("Qty", true), th("Cost", true), th("Payment ref"), th("Actions")
      ]) ]));
      const tbody = el("tbody");
      pending.forEach(x => {
        const h = C.holders().find(hh => hh.id === x.holder_id) || { name: "—", id: x.holder_id };
        const g = h.grants && h.grants.find(gg => gg.fy === x.fy);
        const viewBtn = el("button", { type: "button", class: "btn btn--ghost", style: "padding: 0.3rem 0.7rem; font-size:0.72rem; margin-right:0.4rem;" }, ["Notice"]);
        viewBtn.onclick = () => {
          if (!g) { alert("Grant not found."); return; }
          Docs.present(Docs.noticeOfExercise(h, g, x, C.activeValuation()), { title: "Notice of Exercise", holder: h, docType: "notice_of_exercise", fy: x.fy });
        };
        const confirmBtn = el("button", { type: "button", class: "btn", style: "padding: 0.3rem 0.8rem; font-size:0.72rem; background: var(--good); border-color: var(--good);" }, ["Confirm payment"]);
        confirmBtn.onclick = () => {
          if (!confirm(`Confirm receipt of ${fmt.sgd(x.cost)} from ${h.name} for ${x.fy}?\nThis registers ${fmt.num(x.qty)} shares to the beneficial ownership register.`)) return;
          const res = Committee.act("confirm_exercise", {
            exercise_id: x.id,
            confirmed_by: me ? me.id : "legacy",
            confirmed_by_name: me ? me.name : "Legacy admin"
          });
          if (res.error) { alert("Failed: " + res.error); return; }
          // Issue Appendix 8B as part of the confirmation
          if (g && res.status === "executed") {
            const confirmedEx = Store.state().exercises.find(e => e.id === x.id);
            Store.emit("document_issued", { doc_type: "appendix_8b", holder_id: h.id, fy: x.fy, auto: true });
            setTimeout(() => {
              Docs.present(Docs.appendix8B(h, g, confirmedEx), { title: "Appendix 8B — auto-issued", holder: h, docType: "appendix_8b", fy: x.fy });
            }, 100);
          }
        };
        const rejectBtn = el("button", { type: "button", class: "btn btn--ghost", style: "padding: 0.3rem 0.7rem; font-size:0.72rem; border-color: var(--bad); color: var(--bad); margin-left:0.4rem;" }, ["Reject"]);
        rejectBtn.onclick = () => {
          const reason = prompt("Reason for rejecting this exercise?");
          if (!reason) return;
          Committee.act("reject_exercise", { exercise_id: x.id, reason });
        };
        tbody.appendChild(el("tr", null, [
          td(new Date(x.submitted_at).toLocaleString("en-SG", { dateStyle: "short", timeStyle: "short" })),
          td(h.name),
          td(x.fy),
          td(fmt.num(x.qty), true),
          td(fmt.sgd(x.cost), true),
          td(x.payment_ref || "—"),
          td(null, false, el("span", null, [viewBtn, confirmBtn, rejectBtn]))
        ]));
      });
      tbl.appendChild(tbody);
      section.appendChild(el("div", { class: "panel panel--flush" }, [tbl]));
    }

    // Recent closed exercises
    if (recent.length) {
      const rc = el("div", { class: "panel", style: "margin-top:1rem;" });
      rc.appendChild(el("div", { class: "micro", style: "margin-bottom:0.6rem;", text: "Recent closed exercises" }));
      recent.forEach(x => {
        const h = C.holders().find(hh => hh.id === x.holder_id) || { name: "—" };
        const color = x.status === "confirmed" ? "var(--good)" : "var(--bad)";
        rc.appendChild(el("div", { class: "kv" }, [
          el("div", { class: "k" }, [
            el("span", null, [`${h.name} · ${x.fy} · ${fmt.num(x.qty)} opts`]),
            el("span", { class: "badge", style: `margin-left:0.6rem; color:${color}; border-color:${color};`, text: x.status.toUpperCase() })
          ]),
          el("div", { class: "v tiny muted", text: fmt.date(((x.confirmed_at || x.rejected_at) || "").slice(0, 10)) })
        ]));
      });
      section.appendChild(rc);
    }

    return section;
  }

  // =====================================================================
  // Bulk document console — one PDF per cohort
  // =====================================================================
  function buildBulkDocsSection() {
    const section = el("section", { class: "block" }, [
      el("header", null, [
        el("h2", { text: "Bulk document console" }),
        el("div", { class: "micro", text: "Mass-generate · one multi-page PDF" })
      ])
    ]);
    const Docs = window.ESOPDocs;
    const panel = el("div", { class: "panel" });

    panel.appendChild(el("p", { class: "muted", style: "margin-bottom: 1rem; font-family: var(--serif); font-style: italic; font-size:0.95rem;", text: "Each button packs a document per eligible holder into a single multi-page PDF — ideal for committee review or bulk e-mail distribution." }));

    // Selection scope
    const scope = el("select");
    scope.appendChild(el("option", { value: "all", text: "All 28 active holders" }));
    scope.appendChild(el("option", { value: "fy22", text: "FY2022 cohort (11 holders)" }));
    scope.appendChild(el("option", { value: "fy24", text: "FY2024 cohort (23 holders)" }));
    scope.appendChild(el("option", { value: "fy25", text: "FY2025 draft cohort (28 holders)" }));
    scope.appendChild(el("option", { value: "hr", text: "HR department" }));
    scope.appendChild(el("option", { value: "fin", text: "Finance department" }));
    scope.appendChild(el("option", { value: "sales", text: "Sales department" }));
    scope.appendChild(el("option", { value: "ops", text: "Operations department" }));
    scope.appendChild(el("option", { value: "dhc", text: "DHC subsidiary" }));

    panel.appendChild(el("div", { class: "grid grid-2", style: "margin-bottom: 1.2rem;" }, [
      field("Scope", scope),
      el("div", null, [])
    ]));

    function selectedHolders() {
      const s = scope.value;
      const all = C.holders();
      if (s === "all") return all;
      if (s === "fy22") return all.filter(h => h.grants.some(g => g.fy === "FY2022"));
      if (s === "fy24") return all.filter(h => h.grants.some(g => g.fy === "FY2024"));
      if (s === "fy25") return all.filter(h => h.grants.some(g => g.fy === "FY2025"));
      if (s === "hr") return all.filter(h => h.dept === "HR");
      if (s === "fin") return all.filter(h => h.dept === "FIN");
      if (s === "sales") return all.filter(h => h.dept === "SALES");
      if (s === "ops") return all.filter(h => h.dept === "OPS");
      if (s === "dhc") return all.filter(h => h.dept === "DHC");
      return all;
    }

    function mkBulkBtn(label, onRun) {
      const b = el("button", { type: "button", class: "btn btn--ghost", style: "padding: 0.55rem 1.1rem; margin: 0.25rem 0.4rem 0.25rem 0;" }, [label]);
      b.onclick = async () => {
        const holders = selectedHolders();
        if (!holders.length) { alert("Selected scope has no holders."); return; }
        b.disabled = true;
        const original = b.textContent;
        b.textContent = `Rendering (0 / ${holders.length})…`;
        try {
          await onRun(holders, (i) => { b.textContent = `Rendering (${i + 1} / ${holders.length})…`; });
          if (!isLegacy) Committee.act("bulk_statements", { doc_type: label, count: holders.length, year: new Date().getFullYear(), issued_by: me ? me.name : "legacy" });
        } catch (e) {
          alert("Bulk generation failed: " + e.message);
        } finally {
          b.disabled = false; b.textContent = original;
        }
      };
      return b;
    }

    // --- Letters of Offer (for active grants in scope) ---
    const looBtn = mkBulkBtn("Letters of Offer", async (holders, progress) => {
      const items = [];
      holders.forEach(h => h.grants.forEach(g => {
        if (g.grant_date && g.status !== "draft") items.push({ h, g });
      }));
      if (!items.length) { alert("No active grants in scope."); return; }
      const v = C.activeValuation();
      let i = 0;
      await Docs.bulkPdf(items, (it) => { progress(i++); return Docs.letterOfOffer(it.h, it.g, v); }, "Elitez-ESOP_LettersOfOffer_" + new Date().toISOString().slice(0, 10) + ".pdf");
    });

    // --- Exercise Invitations (for grants with open windows) ---
    const eiBtn = mkBulkBtn("Exercise invitations (eligible)", async (holders, progress) => {
      const items = [];
      holders.forEach(h => h.grants.forEach(g => {
        if (!g.grant_date || g.status === "draft") return;
        const win = C.exerciseWindowStatus(g);
        if (win.eligible || win.upcoming) items.push({ h, g });
      }));
      if (!items.length) { alert("No eligible or upcoming exercise windows in scope."); return; }
      const v = C.activeValuation();
      let i = 0;
      await Docs.bulkPdf(items, (it) => { progress(i++); return Docs.exerciseInvitation(it.h, it.g, v); }, "Elitez-ESOP_ExerciseInvitations_" + new Date().toISOString().slice(0, 10) + ".pdf");
    });

    // --- Annual statements (one per holder) ---
    const asBtn = mkBulkBtn("Annual statements", async (holders, progress) => {
      let i = 0;
      await Docs.bulkPdf(holders, (h) => { progress(i++); return Docs.annualStatement(h); }, "Elitez-ESOP_AnnualStatements_" + new Date().toISOString().slice(0, 10) + ".pdf");
    });

    // --- Beneficial ownership (only those with exercised shares) ---
    const bosBtn = mkBulkBtn("Beneficial ownership statements", async (holders, progress) => {
      const state = Store.state();
      const eligible = holders.filter(h => (state.beneficial || {})[h.id] && state.beneficial[h.id].total_shares > 0);
      if (!eligible.length) { alert("No holders in scope have registered beneficial shares yet. Confirm an exercise first."); return; }
      let i = 0;
      await Docs.bulkPdf(eligible, (h) => { progress(i++); return Docs.beneficialOwnershipStatement(h, state.beneficial[h.id]); }, "Elitez-ESOP_BeneficialOwnership_" + new Date().toISOString().slice(0, 10) + ".pdf");
    });

    // --- Appendix 8Bs (only for confirmed exercises) ---
    const ap8bBtn = mkBulkBtn("Appendix 8B (confirmed exercises)", async (holders, progress) => {
      const state = Store.state();
      const holderIds = new Set(holders.map(h => h.id));
      const items = [];
      (state.exercises || []).filter(x => x.status === "confirmed" && holderIds.has(x.holder_id)).forEach(x => {
        const h = holders.find(hh => hh.id === x.holder_id);
        const g = h && h.grants.find(gg => gg.fy === x.fy);
        if (h && g) items.push({ h, g, x });
      });
      if (!items.length) { alert("No confirmed exercises in scope."); return; }
      let i = 0;
      await Docs.bulkPdf(items, (it) => { progress(i++); return Docs.appendix8B(it.h, it.g, it.x); }, "Elitez-ESOP_Appendix8B_" + new Date().toISOString().slice(0, 10) + ".pdf");
    });

    // --- Special dividend letters (Adept Academy) ---
    const sdivBtn = mkBulkBtn("Special dividend letters (Adept)", async (holders, progress) => {
      const dividend = D.special_dividends[0];
      if (!dividend) { alert("No special dividend recorded."); return; }
      let i = 0;
      await Docs.bulkPdf(holders, (h) => { progress(i++); return Docs.specialDividendLetter(h, dividend); }, "Elitez-ESOP_SpecialDividend_Adept_" + new Date().toISOString().slice(0, 10) + ".pdf");
    });

    const btnWrap = el("div", { style: "display:flex; flex-wrap:wrap;" }, [looBtn, eiBtn, asBtn, bosBtn, ap8bBtn, sdivBtn]);
    panel.appendChild(btnWrap);

    panel.appendChild(el("p", { class: "muted tiny", style: "margin-top: 0.9rem;", text: "PDFs download directly to your browser. For large cohorts (28 holders × dense statements), rendering may take 20–40 seconds — the button will show progress." }));

    section.appendChild(panel);
    return section;
  }
})();
