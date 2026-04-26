// Administrator (Committee) dashboard.
(function () {
  const { renderTopbar, renderFooter, requireSession, el } = window.ESOPApp;
  const C = window.ESOPCalc;
  const D = window.ESOP_DATA;
  const { fmt } = C;

  renderTopbar("admin");
  const session = requireSession("admin");
  if (!session) return;

  const root = document.getElementById("content");
  const fmv = C.currentFMV();
  const ex = C.currentExercisePrice();
  const pool = C.poolUsage();

  // Aggregate across holders
  const agg = aggregateAll();

  // --- Hero
  root.appendChild(el("section", { class: "hero" }, [
    el("div", null, [
      el("div", { class: "micro", text: "Committee · Trustee" }),
      el("h1", { style: "margin-top:1rem;", text: "Administrator." }),
      el("p", { class: "lede", style: "margin-top:1.2rem;" }, [
        `${C.holders().length} Option Holders · ${fmt.num(agg.totalGranted)} options issued across ${D.grants_history.filter(g => g.total).length} grant cycles · ${fmt.pct(pool.used_pct)} of the ${fmt.num(pool.authorised)}-option pool committed.`
      ])
    ]),
    el("div", { class: "panel" }, [
      el("div", { class: "micro", text: "Company-wide cap table" }),
      buildCapTable(),
      el("div", { class: "rule" }),
      el("div", { class: "kv" }, [ el("div", { class: "k", text: "Total outstanding shares" }), el("div", { class: "v", text: fmt.num(D.org.total_outstanding_shares) }) ]),
      el("div", { class: "kv" }, [ el("div", { class: "k", text: "Pre-ESOP ordinary" }), el("div", { class: "v", text: fmt.num(D.org.pre_esop_shares) }) ]),
      el("div", { class: "kv" }, [ el("div", { class: "k", text: "ESOP pool authorised" }), el("div", { class: "v", text: fmt.num(pool.authorised) }) ]),
      el("div", { class: "kv" }, [ el("div", { class: "k", text: "ESOP pool committed" }), el("div", { class: "v", text: fmt.num(pool.issued + pool.drafted) + " (" + fmt.pct(pool.used_pct) + ")" }) ]),
      el("div", { class: "kv" }, [ el("div", { class: "k", text: "ESOP pool free" }), el("div", { class: "v", text: fmt.num(pool.remaining) }) ])
    ])
  ]));

  // --- Stat bar
  root.appendChild(el("section", { class: "block" }, [
    el("header", null, [ el("h2", { text: "Portfolio at today's FMV" }) ]),
    el("div", { class: "grid grid-4" }, [
      statCard("Options outstanding (active)", fmt.num(agg.totalActive), `${fmt.num(agg.totalDraft)} further in FY2025 draft`),
      statCard("Vested today", fmt.num(agg.totalVested), `${fmt.pct(agg.totalVested / agg.totalActive)} of active pool`),
      statAccent("Aggregate holder value at FMV", fmt.sgd(agg.totalActive * fmv), `Exercise cost would total ${fmt.sgd(agg.totalActive * ex)}`),
      statCard("Upcoming taxable perquisite (FY22 wave)", fmt.sgd(agg.fy22Shares * 0.9 * fmv), `${fmt.num(agg.fy22Shares)} options window Jul 2027`)
    ])
  ]));

  // --- Pool utilisation
  root.appendChild(el("section", { class: "block" }, [
    el("header", null, [ el("h2", { text: "Pool utilisation" }), el("a", { href: "scheme.html#pool", text: "Clause 6 →" }) ]),
    buildPoolPanel()
  ]));

  // --- Holders table
  root.appendChild(el("section", { class: "block" }, [
    el("header", null, [
      el("h2", { text: "Option Holders" }),
      el("div", { class: "micro", text: `${C.holders().length} active · ${D.leavers.length} pending leaver determination` })
    ]),
    el("div", { class: "panel panel--flush" }, [ buildHoldersTable() ])
  ]));

  // --- Valuation history chart + KPMG benchmark
  root.appendChild(buildValuationBlock());

  // --- Grants by FY stacked
  root.appendChild(buildGrantsByFy());

  // --- Allocation distribution (FY2025 draft)
  root.appendChild(buildAllocationBlock());

  // --- Dept / entity breakdown
  root.appendChild(buildDeptBreakdown());

  // --- Annual calendar
  root.appendChild(buildCalendarBlock());

  // --- Special dividend ledger
  root.appendChild(buildDividendLedger());

  // --- Leavers pending
  root.appendChild(buildLeaversBlock());

  // --- Data quality issues
  root.appendChild(buildDataQualityBlock());

  // Tag each section with the sub-tab it belongs to, in render order.
  // admin-tabs.js reads data-tab and shows only matching sections.
  const ADMIN_SECTION_TABS = [
    "overview",    // hero
    "overview",    // stat bar (Portfolio at today's FMV)
    "overview",    // pool utilisation
    "holders",     // holders table
    "valuations",  // valuation trail + KPMG
    "holders",     // grants by FY chart
    "holders",     // allocation distribution
    "overview",    // department breakdown
    "overview",    // plan calendar
    "valuations",  // special dividend ledger
    "holders",     // leavers pending
    "audit"        // data quality
  ];
  const adminSections = root.querySelectorAll("section.hero, section.block");
  adminSections.forEach((s, i) => {
    if (ADMIN_SECTION_TABS[i]) s.setAttribute("data-tab", ADMIN_SECTION_TABS[i]);
  });

  // Render sub-tab strip. Active tab comes from URL hash (admin-tabs.js
  // handles re-filtering on change).
  const activeHash = (location.hash || "").replace(/^#/, "").toLowerCase();
  const validTabs = new Set(["overview", "holders", "valuations", "documents", "audit"]);
  window.ESOPApp.renderSubTabs(validTabs.has(activeHash) ? activeHash : "overview");

  renderFooter();

  // =======================================================

  function aggregateAll() {
    let totalGranted = 0, totalActive = 0, totalDraft = 0, totalVested = 0;
    let fy22Shares = 0;
    C.holders().forEach(h => h.grants.forEach(g => {
      totalGranted += g.qty;
      if (g.status === "draft") totalDraft += g.qty;
      else {
        totalActive += g.qty;
        if (g.fy === "FY2022") fy22Shares += g.qty;
        const v = C.vestingFor(g.grant_date);
        totalVested += Math.floor(g.qty * v.vested_pct);
      }
    }));
    return { totalGranted, totalActive, totalDraft, totalVested, fy22Shares };
  }

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

  function buildCapTable() {
    const bar = el("div", { class: "segbar", style: "margin-top:0.8rem;" });
    const ord = D.org.pre_esop_shares;
    const poolUsed = pool.issued + pool.drafted;
    const poolFree = pool.remaining;
    const total = ord + poolUsed + poolFree;
    const ordPct = (ord / total) * 100;
    const usedPct = (poolUsed / total) * 100;
    const freePct = (poolFree / total) * 100;
    const s1 = el("div", { class: "seg-ordinary", style: `width:${ordPct}%`, text: `Ordinary ${ordPct.toFixed(1)}%` });
    const s2 = el("div", { class: "seg-pool-used", style: `width:${usedPct}%`, text: `ESOP used ${usedPct.toFixed(1)}%` });
    const s3 = el("div", { class: "seg-pool-free", style: `width:${freePct}%`, text: `Pool free ${freePct.toFixed(1)}%` });
    bar.appendChild(s1); bar.appendChild(s2); bar.appendChild(s3);
    return bar;
  }

  function buildPoolPanel() {
    const remainingShares = pool.remaining;
    const panel = el("div", { class: "panel" }, [
      el("div", { class: "grid grid-3" }, [
        el("div", null, [
          el("div", { class: "micro", text: "Authorised" }),
          el("div", { class: "serif", style: "font-size:2rem;", text: fmt.num(pool.authorised) }),
          el("div", { class: "tiny muted", text: "20% of fully-diluted (Clause 6.1)" })
        ]),
        el("div", null, [
          el("div", { class: "micro", text: "Committed" }),
          el("div", { class: "serif", style: "font-size:2rem; color: var(--brass);", text: fmt.num(pool.issued + pool.drafted) }),
          el("div", { class: "tiny muted", text: `${fmt.num(pool.issued)} active + ${fmt.num(pool.drafted)} FY25 draft` })
        ]),
        el("div", null, [
          el("div", { class: "micro", text: "Free" }),
          el("div", { class: "serif", style: "font-size:2rem; color: var(--jade);", text: fmt.num(remainingShares) }),
          el("div", { class: "tiny muted", text: `${fmt.pct(1 - pool.used_pct)} of authorised` })
        ])
      ])
    ]);
    return panel;
  }

  function buildHoldersTable() {
    const tbl = el("table", { class: "data" });
    const thead = el("thead", null, [ el("tr", null, [
      th("Holder"), th("Dept"), th("Nationality"),
      th("Granted", true), th("Vested", true), th("Value @ FMV", true),
      th("Exercise cost", true), th("Status")
    ]) ]);
    tbl.appendChild(thead);
    const tbody = el("tbody");
    const rows = C.holders().slice().sort((a, b) => {
      const aG = a.grants.reduce((s, g) => s + g.qty, 0);
      const bG = b.grants.reduce((s, g) => s + g.qty, 0);
      return bG - aG;
    });
    let totals = { g: 0, v: 0, val: 0, cost: 0 };
    rows.forEach(h => {
      const sum = C.summarizeHolder(h);
      totals.g += sum.total_granted;
      totals.v += sum.total_vested;
      totals.val += sum.value_vested_today;
      totals.cost += sum.exercise_cost_vested_today;
      const draftMark = sum.draft_granted ? el("span", { class: "badge badge--draft", style: "margin-left:0.4rem;", text: "FY25 draft" }) : null;
      const holderCell = td();
      holderCell.appendChild(document.createTextNode(h.name));
      holderCell.appendChild(el("div", { class: "tiny muted", text: h.title }));
      const tr = el("tr", null, [
        holderCell,
        td(h.dept),
        td(h.nat),
        td(fmt.num(sum.total_granted), true),
        td(`${fmt.num(sum.total_vested)} (${fmt.pct(sum.vested_pct)})`, true),
        td(fmt.sgd(sum.value_vested_today), true),
        td(fmt.sgd(sum.exercise_cost_vested_today), true),
        td(null, false, badge("Active", "active"))
      ]);
      if (draftMark) tr.children[0].appendChild(draftMark);
      tbody.appendChild(tr);
    });
    const trt = el("tr", { class: "total" }, [
      td("Total", false),
      td(""),
      td(""),
      td(fmt.num(totals.g), true),
      td(fmt.num(totals.v), true),
      td(fmt.sgd(totals.val), true),
      td(fmt.sgd(totals.cost), true),
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
    if (child) n.appendChild(child); else if (text !== undefined) n.textContent = text ?? "";
    return n;
  }
  function badge(text, kind) { return el("span", { class: `badge badge--${kind}`, text }); }

  function buildValuationBlock() {
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Valuation trail" }), el("a", { href: "scheme.html#fmv", text: "Clause 4 →" }) ])
    ]);
    const grid = el("div", { class: "grid grid-8-12", style: "align-items: stretch;" });

    // Chart panel
    const chartPanel = el("div", { class: "panel" });
    const wrap = el("div", { class: "chart-wrap chart-wrap--tall" });
    const canvas = document.createElement("canvas");
    wrap.appendChild(canvas); chartPanel.appendChild(wrap);

    // KPMG benchmark panel
    const bench = D.kpmg_benchmark;
    const benchPanel = el("div", { class: "panel" }, [
      el("div", { class: "micro", text: "KPMG independent benchmark · Mar 2024" }),
      el("h3", { style: "margin-top:0.4rem;", text: "Internal vs independent" }),
      el("div", { class: "rule" }),
      el("div", { class: "kv" }, [ el("div", { class: "k", text: "KPMG EV/EBITDA range" }), el("div", { class: "v", text: `${bench.ev_multiple_range[0]}× – ${bench.ev_multiple_range[1]}×` }) ]),
      el("div", { class: "kv" }, [ el("div", { class: "k", text: "Internal multiple (active)" }), el("div", { class: "v", text: "6×" }) ]),
      el("div", { class: "kv" }, [ el("div", { class: "k", text: "KPMG equity range" }), el("div", { class: "v", text: `S$${bench.equity_sgdm_range[0]}M – S$${bench.equity_sgdm_range[1]}M` }) ]),
      el("div", { class: "kv" }, [ el("div", { class: "k", text: "Current firm value (FY25)" }), el("div", { class: "v", text: fmt.sgd(C.activeValuation().firm_value, 0) }) ]),
      el("div", { class: "alert", style: "margin-top:1rem;", text: "Conservative internal multiple reduces employee taxable perquisite at exercise but understates optics at exit. Revisit the multiple before the next valuation committee." })
    ]);

    grid.appendChild(chartPanel);
    grid.appendChild(benchPanel);
    section.appendChild(grid);

    setTimeout(() => {
      const ctx = canvas.getContext("2d");
      const labels = C.valuationHistory().map(v => v.fy);
      const fmvData = C.valuationHistory().map(v => v.fmv);
      const ebitdaData = C.valuationHistory().map(v => v.ebitda / 1_000_000);
      new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            { type: "bar", label: "EBITDA (S$M)", data: ebitdaData, backgroundColor: "rgba(28,53,87,0.8)", yAxisID: "y1", order: 2 },
            { type: "line", label: "FMV / share (S$)", data: fmvData, borderColor: "#A8863A", backgroundColor: "transparent", tension: 0.25, yAxisID: "y", order: 1, pointBackgroundColor: "#1C3557", pointRadius: 5 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { color: "#0D1A2C" } } },
          scales: {
            y: { position: "left", ticks: { color: "#A8863A", callback: v => "S$" + v.toFixed(2) }, grid: { color: "rgba(14,26,44,0.06)" } },
            y1: { position: "right", ticks: { color: "#1C3557", callback: v => "S$" + v + "M" }, grid: { display: false } },
            x: { ticks: { color: "#5A6775" }, grid: { display: false } }
          }
        }
      });
    }, 50);
    return section;
  }

  function buildGrantsByFy() {
    const fy = C.fyTotals();
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Grants by fiscal year" }) ])
    ]);
    const panel = el("div", { class: "panel" });
    const wrap = el("div", { class: "chart-wrap" });
    const canvas = document.createElement("canvas");
    wrap.appendChild(canvas);
    panel.appendChild(wrap);
    section.appendChild(panel);
    setTimeout(() => {
      new Chart(canvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: fy.map(f => f.fy),
          datasets: [
            { label: "Active", data: fy.map(f => f.active), backgroundColor: "#1C3557", stack: "a" },
            { label: "Draft", data: fy.map(f => f.draft), backgroundColor: "#A8863A", stack: "a" }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
          scales: {
            y: { stacked: true, ticks: { callback: v => (v / 1000) + "K", color: "#5A6775" }, grid: { color: "rgba(14,26,44,0.06)" } },
            x: { stacked: true, ticks: { color: "#5A6775" }, grid: { display: false } }
          }
        }
      });
    }, 50);
    return section;
  }

  function buildAllocationBlock() {
    const alloc = C.allocationDistribution();
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "FY2025 draft allocation" }), el("div", { class: "micro", text: "Distribution across 28 holders" }) ])
    ]);

    const panel = el("div", { class: "panel" }, [
      el("div", { class: "grid grid-4" }, [
        statItem("Total drafted", fmt.num(alloc.total), "across all drafts"),
        statItem("Mean allocation", fmt.num(Math.round(alloc.mean)), `median-ish fairness`),
        statItem("Std. deviation", fmt.num(Math.round(alloc.stdev)), `target 10,000 – 15,000`),
        statItem("Top 20% of pool", fmt.pct(alloc.top20_pct), "target 38 – 50%")
      ]),
      el("div", { class: "rule rule--strong" }),
      buildAllocHistogram(alloc),
      el("p", { class: "muted tiny", style: "margin-top:1rem;", text: "Per Guidebook, allocation is linear on composite score (Years 15%, Performance 60%, Potential 25%). Guardrails: top 20% takes 38–50% of pool, stdev 10K–15K shares, rounded to nearest 100, soft per-person annual cap 60K." })
    ]);
    section.appendChild(panel);
    return section;
  }

  function buildAllocHistogram(alloc) {
    const wrap = el("div", { class: "chart-wrap" });
    const canvas = document.createElement("canvas");
    wrap.appendChild(canvas);
    setTimeout(() => {
      new Chart(canvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: alloc.rows.map(r => r.name.split(" ").slice(0, 2).join(" ")),
          datasets: [{ label: "FY25 draft (shares)", data: alloc.rows.map(r => r.shares), backgroundColor: alloc.rows.map(r => r.shares > 30000 ? "#6E1A1A" : r.shares > 18000 ? "#A8863A" : "#1C3557") }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: "y",
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { callback: v => (v / 1000) + "K", color: "#5A6775" }, grid: { color: "rgba(14,26,44,0.06)" } },
            y: { ticks: { color: "#5A6775", font: { size: 10 } }, grid: { display: false } }
          }
        }
      });
    }, 50);
    return wrap;
  }

  function statItem(label, value, sub) {
    return el("div", null, [
      el("div", { class: "micro muted", text: label }),
      el("div", { class: "serif", style: "font-size: 1.8rem; margin-top:0.2rem;", text: value }),
      el("div", { class: "tiny muted", text: sub })
    ]);
  }

  function buildDeptBreakdown() {
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Breakdown by department" }) ])
    ]);
    const map = {};
    C.holders().forEach(h => {
      map[h.dept] = map[h.dept] || { dept: h.dept, count: 0, shares: 0 };
      map[h.dept].count += 1;
      h.grants.forEach(g => { map[h.dept].shares += g.qty; });
    });
    const rows = Object.values(map).sort((a, b) => b.shares - a.shares);
    const tbl = el("table", { class: "data" });
    tbl.appendChild(el("thead", null, [ el("tr", null, [
      th("Dept"), th("Holders", true), th("Total options", true), th("Share of pool", true)
    ]) ]));
    const tbody = el("tbody");
    const grand = rows.reduce((s, r) => s + r.shares, 0);
    rows.forEach(r => {
      tbody.appendChild(el("tr", null, [
        td(r.dept),
        td(r.count, true),
        td(fmt.num(r.shares), true),
        td(fmt.pct(r.shares / grand), true)
      ]));
    });
    tbl.appendChild(tbody);
    section.appendChild(el("div", { class: "panel panel--flush" }, [tbl]));
    return section;
  }

  function buildCalendarBlock() {
    const events = [
      ["01 Jan", "Exercise invitations sent (cohorts hitting 5-yr anniversary)"],
      ["14 Jan", "Exercise deadline — 14 days, whole-not-partial"],
      ["16–31 Jan", "Annual trading window — bid/ask, Company ROFR, peer matching"],
      ["30 Jan", "Official shareholder registration for exercised shares"],
      ["30 Apr", "Fiscal year end"],
      ["May", "Notice of new ESOP grants (performance-appraisal driven)"],
      ["Aug", "Final dividend declaration (FY ending April)"],
      ["30 Nov", "Regular dividend payout · FY audit published"],
      ["Dec", "AGM — next valuation, FS adoption, dividend confirmation"]
    ];
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Plan calendar" }) ])
    ]);
    const tbl = el("table", { class: "data" });
    tbl.appendChild(el("thead", null, [ el("tr", null, [ th("When"), th("Event") ]) ]));
    const tbody = el("tbody");
    events.forEach(([when, desc]) => {
      tbody.appendChild(el("tr", null, [
        td(null, false, el("strong", { text: when })),
        td(desc)
      ]));
    });
    tbl.appendChild(tbody);
    section.appendChild(el("div", { class: "panel panel--flush" }, [tbl]));
    return section;
  }

  function buildDividendLedger() {
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Special dividend ledger" }) ])
    ]);
    const div = D.special_dividends[0];
    const panel = el("div", { class: "panel" }, [
      el("div", { class: "row-between" }, [
        el("div", null, [
          el("div", { class: "micro", text: div.declared }),
          el("h3", { style: "margin-top:0.4rem;", text: div.name })
        ]),
        el("span", { class: "badge badge--filled", text: "Adopted" })
      ]),
      el("div", { class: "rule" }),
      el("div", { class: "grid grid-3" }, [
        el("div", null, [
          el("div", { class: "micro muted", text: "Proceeds" }),
          el("div", { class: "kv" }, [ el("div", { class: "k", text: "Gross" }), el("div", { class: "v", text: fmt.sgd(div.gross) }) ]),
          el("div", { class: "kv" }, [ el("div", { class: "k", text: "Broker fee" }), el("div", { class: "v", text: fmt.sgd(div.broker_fee) }) ]),
          el("div", { class: "kv" }, [ el("div", { class: "k", text: "Staff set-aside" }), el("div", { class: "v", text: fmt.sgd(div.staff_set_aside) }) ]),
          el("div", { class: "kv" }, [ el("div", { class: "k", text: "Distributable" }), el("div", { class: "v", text: fmt.sgd(div.distributable) }) ])
        ]),
        el("div", null, [
          el("div", { class: "micro muted", text: "Shareholder splits" }),
          ...div.non_esop_allocations.map(a =>
            el("div", { class: "kv" }, [ el("div", { class: "k", text: `${a.recipient} (${fmt.pct(a.pct)})` }), el("div", { class: "v", text: fmt.sgd(a.amount) }) ])
          ),
          el("div", { class: "kv" }, [ el("div", { class: "k", text: "ESOP pool from EGPL share" }), el("div", { class: "v", text: fmt.sgd(div.esop_pool) }) ])
        ]),
        el("div", null, [
          el("div", { class: "micro muted", text: "ESOP allocation" }),
          el("div", { class: "kv" }, [ el("div", { class: "k", text: "Per-share dividend" }), el("div", { class: "v", text: fmt.sgd(div.per_share, 4) }) ]),
          el("div", { class: "kv" }, [ el("div", { class: "k", text: "Options entitled" }), el("div", { class: "v", text: fmt.num(div.esop_shares_entitled) }) ]),
          el("div", { class: "kv" }, [ el("div", { class: "k", text: "Eligibility" }), el("div", { class: "v", text: "Exercise within 1 month" }) ])
        ])
      ])
    ]);
    section.appendChild(panel);
    return section;
  }

  function buildLeaversBlock() {
    if (!D.leavers.length) return el("div");
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Leavers · determinations outstanding" }) ]),
      el("div", { class: "panel" }, [
        el("p", { class: "muted", text: "The Committee needs to determine Good vs Bad Leaver treatment for each to close the file (even where options have already forfeited in practice)." }),
        el("div", { class: "rule" }),
        ...D.leavers.map(l => el("div", { class: "kv" }, [
          el("div", { class: "k", text: l.name }),
          el("div", { class: "v", text: l.note })
        ]))
      ])
    ]);
    return section;
  }

  function buildDataQualityBlock() {
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Data-quality issues" }), el("div", { class: "micro", text: `${D.data_quality.length} open` }) ])
    ]);
    const high = D.data_quality.filter(d => d.sev === "high").length;
    const med = D.data_quality.filter(d => d.sev === "medium").length;
    const low = D.data_quality.filter(d => d.sev === "low").length;
    const panel = el("div", { class: "panel acc" });
    panel.appendChild(el("div", { class: "grid grid-3", style: "margin-bottom:1rem;" }, [
      statItem("High", String(high), "resolve before go-live"),
      statItem("Medium", String(med), "review in next Committee"),
      statItem("Low", String(low), "flagged but non-blocking")
    ]));
    D.data_quality.forEach(d => {
      const det = document.createElement("details");
      const sum = document.createElement("summary");
      const sevColor = d.sev === "high" ? "var(--bad)" : d.sev === "medium" ? "var(--warn)" : "var(--muted)";
      sum.appendChild(el("span", null, [
        el("span", { class: "badge", style: `color:${sevColor}; border-color:${sevColor}; margin-right:0.8rem;`, text: d.sev.toUpperCase() }),
        document.createTextNode(d.topic)
      ]));
      sum.appendChild(el("span", { class: "plus", text: "+" }));
      det.appendChild(sum);
      det.appendChild(el("p", { text: d.issue }));
      panel.appendChild(det);
    });
    section.appendChild(panel);
    return section;
  }
})();
