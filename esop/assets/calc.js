// Elitez ESOP — pure calculations shared by every page.
// Keep this module side-effect free so it can be tested in isolation.

(function () {
  const D = window.ESOP_DATA;
  const SEED_AS_OF = new Date(D.meta.as_of + "T00:00:00");
  const DEMO_DATE_KEY = "elitez_demo_date";

  // Time-travel demo mode: when sessionStorage has elitez_demo_date set
  // (admin-only, set via the demo-date control in the admin ribbon),
  // every calculation treats that date as "today" — without mutating data.
  // Lets you demo the FY2022 exercise flow (1 Jul 2027) without waiting.
  function asOfDate() {
    try {
      const override = sessionStorage.getItem(DEMO_DATE_KEY);
      if (override) {
        const d = new Date(override + "T00:00:00");
        if (!isNaN(d.getTime())) return d;
      }
    } catch {}
    return SEED_AS_OF;
  }
  function isDemoDate() {
    try { return !!sessionStorage.getItem(DEMO_DATE_KEY); } catch { return false; }
  }
  function setDemoDate(iso) {
    try {
      if (iso) sessionStorage.setItem(DEMO_DATE_KEY, iso);
      else sessionStorage.removeItem(DEMO_DATE_KEY);
    } catch {}
  }
  // AS_OF stays a Date object for back-compat callers that read .getTime() etc.
  // It is computed at module load — but `asOfDate()` is the live reader.
  // For correctness, internal helpers default to `asOfDate()`, not AS_OF.
  const AS_OF = asOfDate();

  // When the event store is available, derive mutable data from state.
  // The seed stays as fallback for static / pre-store pages.
  function live() {
    if (window.ESOPStore && window.ESOPStore.state) {
      const s = window.ESOPStore.state();
      return {
        holders: s.holders,
        valuation_history: s.valuation_history,
        grants_history: s.grants_history,
        special_dividends: s.special_dividends
      };
    }
    return {
      holders: D.holders,
      valuation_history: D.valuation_history,
      grants_history: D.grants_history,
      special_dividends: D.special_dividends
    };
  }

  const fmt = {
    sgd: (n, dp = 0) => {
      if (n === null || n === undefined || isNaN(n)) return "—";
      return "S$" + Number(n).toLocaleString("en-SG", { minimumFractionDigits: dp, maximumFractionDigits: dp });
    },
    sgd2: n => fmt.sgd(n, 2),
    sgd4: n => fmt.sgd(n, 4),
    num: (n, dp = 0) => {
      if (n === null || n === undefined || isNaN(n)) return "—";
      return Number(n).toLocaleString("en-SG", { minimumFractionDigits: dp, maximumFractionDigits: dp });
    },
    pct: (n, dp = 1) => {
      if (n === null || n === undefined || isNaN(n)) return "—";
      return (n * 100).toFixed(dp) + "%";
    },
    date: iso => {
      if (!iso) return "—";
      const d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    },
    short: iso => {
      if (!iso) return "—";
      const d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    }
  };

  // Active FMV record
  function activeValuation() {
    const hist = live().valuation_history;
    return hist.find(v => v.active) || hist[hist.length - 1];
  }

  function currentFMV() { return activeValuation().fmv; }
  function currentExercisePrice() {
    const v = activeValuation();
    return v.exercise_price !== undefined ? v.exercise_price : Math.round(v.fmv * (1 - D.exercise.discount) * 10000) / 10000;
  }

  // Given a grant_date (ISO) + as-of date, produce vesting figures.
  // Rules:
  //   - Grant month's first calendar day is the vesting start.
  //   - 0% for 12 months. On month 12 anniversary, 20% vests.
  //   - Months 13..60 each vest 80% / 48 = ~1.667%.
  //   - Fully vested at month 60.
  function vestingFor(grantDate, asOf = asOfDate()) {
    if (!grantDate) return { vested_pct: 0, months_elapsed: 0, cliff_passed: false };
    const g = new Date(grantDate + "T00:00:00");
    const startMonth = new Date(g.getFullYear(), g.getMonth(), 1);
    const ref = new Date(asOf.getFullYear(), asOf.getMonth(), 1);
    const months = (ref.getFullYear() - startMonth.getFullYear()) * 12 + (ref.getMonth() - startMonth.getMonth());
    let pct = 0;
    if (months < D.vesting.cliff_months) pct = 0;
    else if (months >= 60) pct = 1;
    else {
      const postCliff = months - D.vesting.cliff_months;
      pct = D.vesting.cliff_pct + (postCliff / D.vesting.monthly_months) * (1 - D.vesting.cliff_pct);
    }
    return {
      vested_pct: pct,
      months_elapsed: months,
      months_total: 60,
      cliff_passed: months >= D.vesting.cliff_months,
      start_date: toISO(startMonth),
      cliff_date: toISO(addMonths(startMonth, 12)),
      fully_vested_date: toISO(addMonths(startMonth, 60)),
      exercise_date: toISO(addMonths(startMonth, 60))
    };
  }

  function toISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function addMonths(d, n) {
    const nd = new Date(d);
    nd.setMonth(nd.getMonth() + n);
    return nd;
  }

  function daysBetween(a, b) {
    const ms = new Date(b) - new Date(a);
    return Math.round(ms / 86400000);
  }

  // Per-grant projection at current FMV (or an override)
  function projectGrant(grant, fmvOverride) {
    const fmv = fmvOverride ?? currentFMV();
    const ex = currentExercisePrice();
    const v = vestingFor(grant.grant_date);
    const vested = Math.floor(grant.qty * v.vested_pct);
    const cost = vested * ex;
    const value = vested * fmv;
    const perquisite = vested * (fmv - ex); // = 0.9 × fmv × vested
    return {
      vesting: v,
      vested_shares: vested,
      unvested_shares: grant.qty - vested,
      exercise_cost: cost,
      gross_value: value,
      taxable_perquisite: perquisite
    };
  }

  // Holder aggregate: active grants only (drafts shown separately)
  function summarizeHolder(holder, fmvOverride) {
    const fmv = fmvOverride ?? currentFMV();
    const ex = currentExercisePrice();
    let totalGranted = 0, totalActive = 0, totalDraft = 0;
    let totalVested = 0, totalUnvested = 0;
    let totalCost = 0, totalValue = 0, totalGain = 0;

    holder.grants.forEach(g => {
      totalGranted += g.qty;
      if (g.status === "draft") totalDraft += g.qty;
      else {
        totalActive += g.qty;
        const p = projectGrant(g, fmv);
        totalVested += p.vested_shares;
        totalUnvested += p.unvested_shares;
        totalCost += p.exercise_cost;
        totalValue += p.gross_value;
        totalGain += p.taxable_perquisite;
      }
    });

    return {
      fmv_used: fmv,
      exercise_price: ex,
      total_granted: totalGranted,
      active_granted: totalActive,
      draft_granted: totalDraft,
      total_vested: totalVested,
      total_unvested: totalUnvested,
      vested_pct: totalActive ? totalVested / totalActive : 0,
      exercise_cost_if_fully_vested: totalActive * ex,
      exercise_cost_vested_today: totalVested * ex,
      value_if_fully_vested: totalActive * fmv,
      value_vested_today: totalVested * fmv,
      taxable_perquisite_vested_today: totalGain,
      net_gain_vested_today: totalValue - totalCost
    };
  }

  // Leaver scenarios — as of "today" applied against vested-but-unexercised options.
  // Per scheme-rules.md sec 9 + seed clawback_matrix.
  function leaverScenarios(holder, fmvOverride) {
    const s = summarizeHolder(holder, fmvOverride);
    const fmv = s.fmv_used;
    const ex = s.exercise_price;

    // Bad leaver: flat S$1 total for all vested unexercised options
    const bad = { label: "Bad Leaver", total: 1, per_option: null, note: "Flat S$1 total for ALL vested unexercised Options. Unvested always forfeited." };

    // Good leaver: per option = (0.20 × FMV) − Exercise_Price
    const goodPerOpt = Math.max(0, 0.20 * fmv - ex);
    const good = {
      label: "Good Leaver",
      per_option: goodPerOpt,
      total: goodPerOpt * s.total_vested,
      note: "Committee may instead let you retain options until normal 5-yr exercise date."
    };

    // Exit event: (FMV - Exercise_Price) per option — full gain
    const exitPerOpt = Math.max(0, fmv - ex);
    const exit = {
      label: "Exit Event (IPO / Trade Sale)",
      per_option: exitPerOpt,
      total: exitPerOpt * s.total_granted, // on exit, unvested accelerate
      note: "All unvested accelerate and vest. Full spread (FMV − Exercise Price) per option."
    };

    // Death: treated as good leaver for exercised shares; for options follow good leaver.
    return { bad, good, exit, summary: s };
  }

  // Days to first exercise window for any grant the holder has
  function nextExerciseMilestone(holder, asOf = asOfDate()) {
    const upcoming = holder.grants
      .filter(g => g.grant_date)
      .map(g => {
        const v = vestingFor(g.grant_date, asOf);
        return {
          grant: g,
          exercise_date: v.exercise_date,
          days: daysBetween(asOf.toISOString().slice(0, 10), v.exercise_date),
          fully_vested_date: v.fully_vested_date
        };
      })
      .filter(x => x.days > 0)
      .sort((a, b) => a.days - b.days);
    return upcoming[0] || null;
  }

  // Pool usage
  function poolUsage() {
    const holders = live().holders;
    const issued = holders.reduce((sum, h) => sum + h.grants.reduce((s, g) => s + (g.status !== "draft" ? g.qty : 0), 0), 0);
    const drafted = holders.reduce((sum, h) => sum + h.grants.reduce((s, g) => s + (g.status === "draft" ? g.qty : 0), 0), 0);
    const authorised = D.pool.authorised;
    return {
      authorised,
      issued,
      drafted,
      remaining: authorised - issued - drafted,
      used_pct: (issued + drafted) / authorised
    };
  }

  // FY totals across all holders
  function fyTotals() {
    const byFy = {};
    live().holders.forEach(h => h.grants.forEach(g => {
      byFy[g.fy] = byFy[g.fy] || { fy: g.fy, active: 0, draft: 0, count: 0, count_active: 0 };
      byFy[g.fy].count += 1;
      if (g.status === "draft") byFy[g.fy].draft += g.qty;
      else { byFy[g.fy].active += g.qty; byFy[g.fy].count_active += 1; }
    }));
    return Object.values(byFy).sort((a, b) => a.fy.localeCompare(b.fy));
  }

  // Allocation distribution (simplest: use current FY2025 draft as the allocation)
  function allocationDistribution() {
    const rows = live().holders.map(h => {
      const draft = h.grants.find(g => g.status === "draft");
      return draft ? { id: h.id, name: h.name, dept: h.dept, shares: draft.qty } : null;
    }).filter(Boolean).sort((a, b) => b.shares - a.shares);
    const total = rows.reduce((s, r) => s + r.shares, 0);
    const top20Count = Math.ceil(rows.length * 0.20);
    const top20Shares = rows.slice(0, top20Count).reduce((s, r) => s + r.shares, 0);
    const mean = total / rows.length;
    const variance = rows.reduce((s, r) => s + (r.shares - mean) ** 2, 0) / rows.length;
    const stdev = Math.sqrt(variance);
    return { rows, total, top20_pct: top20Shares / total, stdev, mean };
  }

  // Current holder list (live state overlaid on seed)
  function holders() { return live().holders; }
  function valuationHistory() { return live().valuation_history; }

  // --- Workflow helpers ---------------------------------------------

  // Active grants (not draft) that have not yet been accepted by the holder.
  function pendingAcceptances(holder) {
    if (!holder) return [];
    const state = window.ESOPStore ? window.ESOPStore.state() : { acceptances: {} };
    const acc = state.acceptances || {};
    return holder.grants.filter(g => {
      if (!g.grant_date || g.status === "draft") return false;
      const key = `${holder.id}::${g.fy}`;
      return !acc[key] || acc[key].status !== "accepted";
    });
  }

  function hasAcceptedGrant(holder, fy) {
    if (!holder) return false;
    const state = window.ESOPStore ? window.ESOPStore.state() : { acceptances: {} };
    const acc = state.acceptances || {};
    const rec = acc[`${holder.id}::${fy}`];
    return !!(rec && rec.status === "accepted");
  }

  // Grants whose exercise window is currently open (today within 14 days of exercise_date).
  // Also includes "upcoming" with days_to_open for portal banners.
  function exerciseWindowStatus(grant, asOf = asOfDate()) {
    if (!grant || !grant.grant_date) return { eligible: false };
    const v = vestingFor(grant.grant_date, asOf);
    const exDate = new Date(v.exercise_date + "T00:00:00");
    const deadline = new Date(exDate); deadline.setDate(deadline.getDate() + D.exercise.window_days);
    const todayMs = asOf.getTime();
    const daysToOpen = Math.round((exDate - todayMs) / 86400000);
    const daysToClose = Math.round((deadline - todayMs) / 86400000);
    return {
      eligible: todayMs >= exDate.getTime() && todayMs <= deadline.getTime(),
      upcoming: todayMs < exDate.getTime() && daysToOpen <= 60,
      lapsed: todayMs > deadline.getTime(),
      days_to_open: daysToOpen,
      days_to_close: daysToClose,
      opens_at: v.exercise_date,
      closes_at: toISO(deadline)
    };
  }

  function exercisableGrants(holder) {
    if (!holder) return [];
    return holder.grants
      .filter(g => g.grant_date && g.status !== "draft")
      .map(g => ({ grant: g, window: exerciseWindowStatus(g) }))
      .filter(x => x.window.eligible);
  }

  function upcomingExerciseGrants(holder) {
    if (!holder) return [];
    return holder.grants
      .filter(g => g.grant_date && g.status !== "draft")
      .map(g => ({ grant: g, window: exerciseWindowStatus(g) }))
      .filter(x => x.window.upcoming);
  }

  // Look up a holder's exercise submissions
  function exercisesForHolder(holder) {
    if (!window.ESOPStore) return [];
    const state = window.ESOPStore.state();
    return (state.exercises || []).filter(x => x.holder_id === holder.id);
  }

  function pendingExercises() {
    if (!window.ESOPStore) return [];
    const state = window.ESOPStore.state();
    return (state.exercises || []).filter(x => x.status === "submitted");
  }

  function confirmedExercises() {
    if (!window.ESOPStore) return [];
    const state = window.ESOPStore.state();
    return (state.exercises || []).filter(x => x.status === "confirmed");
  }

  // Has the holder already submitted (or exercised) this grant?
  function exerciseForGrant(holder, fy) {
    if (!holder || !window.ESOPStore) return null;
    const state = window.ESOPStore.state();
    return (state.exercises || []).find(x => x.holder_id === holder.id && x.fy === fy) || null;
  }

  // Expose
  window.ESOPCalc = {
    D, AS_OF, fmt,
    asOfDate, isDemoDate, setDemoDate,
    activeValuation, currentFMV, currentExercisePrice,
    vestingFor, projectGrant, summarizeHolder,
    leaverScenarios, nextExerciseMilestone,
    poolUsage, fyTotals, allocationDistribution,
    holders, valuationHistory, live,
    daysBetween, addMonths,
    pendingAcceptances, hasAcceptedGrant,
    exerciseWindowStatus, exercisableGrants, upcomingExerciseGrants,
    exercisesForHolder, pendingExercises, confirmedExercises, exerciseForGrant
  };
})();
