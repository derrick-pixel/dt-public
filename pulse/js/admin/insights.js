import { esc, swapMarkup } from "../common.js?v=2";
import { scoreAnswers } from "../diagnostic-scoring.js";

let DATA = null;
const simAnswers = {
  industry: "B2B Services",
  headcount: "30-60",
  spend: 1500,
  pains: ["No consistent leads"],
  goal: "More qualified leads",
  dealSize: "5K-25K",
  urgency: "This month"
};

export async function render(root) {
  const override = JSON.parse(localStorage.getItem("ep_insightsOverride") || "null");
  DATA = override || await fetch("../data/insights.json?v=2").then(r => r.json());

  const tpl = `
    <h1>Insights</h1>
    <p class="subtle" style="margin-bottom:24px;">Strategic playbook + Diagnostic tuning console. All edits are local; Download JSON when ready to commit.</p>

    <!-- ====== KPI dashboard ====== -->
    <div class="admin-section-head">
      <h2>Strategic KPIs</h2>
      <p>Numbers that anchor every pricing + scope decision. Pulled from the Revenue Engine plan.</p>
    </div>
    <div class="kpis" id="kpis-host"></div>

    <!-- ====== Mental models ====== -->
    <div class="admin-section-head">
      <h2>Mental models</h2>
      <p>Five buyer-psychology rules behind positioning + pricing.</p>
    </div>
    <div id="models-host"></div>

    <!-- ====== Diagnostic simulator ====== -->
    <div class="admin-section-head">
      <h2>Diagnostic simulator</h2>
      <p>Flip any answer, watch the score + package reco change. Useful for verifying weight edits.</p>
    </div>
    <div class="sim" id="sim-host"></div>

    <!-- ====== Benchmark stats ====== -->
    <div class="admin-section-head">
      <h2>Benchmark stats</h2>
      <p>Rendered in the Diagnostic report. 3 numbers; keep them honest.</p>
    </div>
    <div id="benchmarks-host" style="background:var(--white); border:2px solid var(--ink); border-radius:8px; padding:20px;"></div>

    <!-- ====== Scoring weights (sliders) ====== -->
    <div class="admin-section-head">
      <h2>Diagnostic scoring weights</h2>
      <p>Each category sums to the score ceiling for a perfect fit (should total ~100 across all categories).</p>
    </div>
    <div id="weights-host"></div>

    <!-- ====== Package thresholds ====== -->
    <div class="admin-section-head">
      <h2>Package thresholds</h2>
      <p>Minimum spend + deal size a lead must hit to be recommended Core or Premium. Below both Core thresholds → Entry.</p>
    </div>
    <div id="thresholds-host" class="weight-group"></div>

    <!-- ====== Objection playbook ====== -->
    <div class="admin-section-head">
      <h2>Objection playbook</h2>
      <p>When a prospect says X — say Y. Read before every sales call.</p>
    </div>
    <div id="objections-host"></div>

    <!-- ====== Talk tracks ====== -->
    <div class="admin-section-head">
      <h2>Sales talk-tracks</h2>
      <p>Short scripts for the moments that matter.</p>
    </div>
    <div id="tracks-host" class="grid grid--3"></div>

    <!-- ====== Actions ====== -->
    <div style="display:flex; gap:12px; margin-top:40px; flex-wrap:wrap;">
      <button type="button" class="btn btn--primary" id="save" style="padding:10px 18px; font-size:13px;">Save all (browser)</button>
      <button type="button" class="btn btn--outline" id="download" style="padding:10px 18px; font-size:13px;">Download insights.json</button>
      <button type="button" class="btn btn--outline" id="reset" style="padding:10px 18px; font-size:13px;">Reset to default</button>
    </div>`;
  swapMarkup(root, tpl);

  renderKpis();
  renderModels();
  renderSimulator();
  renderBenchmarks();
  renderWeights();
  renderThresholds();
  renderObjections();
  renderTracks();

  document.getElementById("save").addEventListener("click", () => {
    DATA.benchmarkStats = collectBenchmarks();
    localStorage.setItem("ep_insightsOverride", JSON.stringify(DATA));
    alert("Saved. The Diagnostic will use your overrides on next load.");
  });
  document.getElementById("download").addEventListener("click", () => {
    DATA.benchmarkStats = collectBenchmarks();
    const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "insights.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById("reset").addEventListener("click", () => {
    if (confirm("Reset to default insights.json? This clears your browser overrides.")) {
      localStorage.removeItem("ep_insightsOverride");
      render(root);
    }
  });
}

/* ====== KPI tiles ====== */
function renderKpis() {
  const host = document.getElementById("kpis-host");
  const tpl = (DATA.kpis || []).map(k => `
    <div class="kpi">
      <div class="kpi__val">${esc(k.value)}</div>
      <div class="kpi__lbl">${esc(k.label)}</div>
      ${k.note ? `<div class="kpi__note">${esc(k.note)}</div>` : ""}
    </div>`).join("");
  swapMarkup(host, tpl);
}

/* ====== Mental models ====== */
function renderModels() {
  const host = document.getElementById("models-host");
  const tpl = (DATA.mentalModels || []).map((m, i) => `
    <div class="card" style="margin-bottom:14px; padding:24px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:14px; margin-bottom:8px; flex-wrap:wrap;">
        <div>
          <span class="mono subtle" style="font-size:10px; text-transform:uppercase; letter-spacing:0.06em;">Model ${String(i + 1).padStart(2, "0")} · ${esc(m.tag || "")}</span>
          <h4 style="margin-top:4px;">${esc(m.title)}</h4>
        </div>
        <span class="sticker sticker--mustard" style="font-size:10px;">★ RULE</span>
      </div>
      <p style="margin-bottom:12px;">${esc(m.body)}</p>
      <div style="padding:12px 14px; background:var(--cream); border-left:3px solid var(--coral); font-size:13px; font-weight:600;">${esc(m.rule || "")}</div>
    </div>`).join("");
  swapMarkup(host, tpl);
}

/* ====== Diagnostic simulator ====== */
function renderSimulator() {
  const host = document.getElementById("sim-host");
  const painOptions = ["No consistent leads", "Content feels generic", "Website dead", "No team capacity", "No clue what's working"];
  const tpl = `
    <div class="sim__inputs">
      <label>Industry
        <select id="sim-industry">${["B2B Services", "Education", "Professional Services", "Logistics", "HR-Consulting", "Other"].map(v => `<option ${v === simAnswers.industry ? "selected" : ""}>${esc(v)}</option>`).join("")}</select>
      </label>
      <label>Headcount
        <select id="sim-headcount">${["<10", "10-30", "30-60", "60-100", ">100"].map(v => `<option ${v === simAnswers.headcount ? "selected" : ""}>${esc(v)}</option>`).join("")}</select>
      </label>
      <label>Spend (SGD/mo): <span class="mono" id="sim-spend-v">${simAnswers.spend}</span>
        <input type="range" id="sim-spend" min="0" max="5000" step="500" value="${simAnswers.spend}">
      </label>
      <label>Deal size
        <select id="sim-deal">${["<1K", "1K-5K", "5K-25K", "25K+"].map(v => `<option ${v === simAnswers.dealSize ? "selected" : ""}>${esc(v)}</option>`).join("")}</select>
      </label>
      <label>Urgency
        <select id="sim-urgency">${["Yesterday", "This month", "This quarter", "Just exploring"].map(v => `<option ${v === simAnswers.urgency ? "selected" : ""}>${esc(v)}</option>`).join("")}</select>
      </label>
      <label>Primary goal
        <select id="sim-goal">${["More qualified leads", "Better brand/website", "Launch campaigns faster", "Cut costs"].map(v => `<option ${v === simAnswers.goal ? "selected" : ""}>${esc(v)}</option>`).join("")}</select>
      </label>
      <label style="margin-top:14px;">Pains (check all that apply)</label>
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">
        ${painOptions.map(p => `<label style="display:inline-flex; gap:4px; align-items:center; font-size:12px; padding:4px 10px; background:var(--cream); border:1.5px solid var(--ink); border-radius:999px; cursor:pointer;">
          <input type="checkbox" data-pain="${esc(p)}" ${simAnswers.pains.includes(p) ? "checked" : ""} style="margin:0; width:auto;"> ${esc(p)}</label>`).join("")}
      </div>
    </div>
    <div class="sim__result" id="sim-result"></div>`;
  swapMarkup(host, tpl);

  const update = () => {
    simAnswers.industry = document.getElementById("sim-industry").value;
    simAnswers.headcount = document.getElementById("sim-headcount").value;
    simAnswers.spend = Number(document.getElementById("sim-spend").value);
    simAnswers.dealSize = document.getElementById("sim-deal").value;
    simAnswers.urgency = document.getElementById("sim-urgency").value;
    simAnswers.goal = document.getElementById("sim-goal").value;
    simAnswers.pains = [...document.querySelectorAll("[data-pain]:checked")].map(c => c.dataset.pain);
    document.getElementById("sim-spend-v").textContent = simAnswers.spend;
    renderSimResult();
  };
  ["sim-industry", "sim-headcount", "sim-deal", "sim-urgency", "sim-goal", "sim-spend"].forEach(id => document.getElementById(id).addEventListener("input", update));
  document.querySelectorAll("[data-pain]").forEach(cb => cb.addEventListener("change", update));
  renderSimResult();
}

function renderSimResult() {
  const host = document.getElementById("sim-result");
  const result = scoreAnswers(simAnswers, DATA.scoringWeights, DATA.packageThresholds);
  const scoreClass = result.score >= 75 ? "" : result.score >= 50 ? "med" : "low";
  const fitCopy = result.fitFlag === "freelancer-better"
    ? "FREELANCER-BETTER"
    : result.fitFlag === "stretch" ? "STRETCH" : "STRONG FIT";
  const tpl = `
    <span class="mono subtle" style="font-size:10px; text-transform:uppercase; letter-spacing:0.08em;">Simulated score</span>
    <div class="sim__score ${scoreClass}">${result.score}</div>
    <div style="font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">${esc(fitCopy)}</div>
    <div style="padding:12px; background:var(--white); border:1.5px solid var(--ink); border-radius:8px; width:100%; margin-top:8px;">
      <span class="mono subtle" style="font-size:10px; text-transform:uppercase;">Recommended package</span>
      <div style="font-size:20px; font-weight:900; color:var(--coral); margin-top:4px;">${esc(result.package.toUpperCase())}</div>
    </div>
    <div style="padding:12px; background:var(--mustard); border-radius:8px; width:100%; font-size:12px;">
      Break-even: <strong>${result.breakEvenDeals ?? "?"}</strong> deal${result.breakEvenDeals === 1 ? "" : "s"}/mo · ${result.realistic ? "realistic ✓" : "stretch"}
    </div>
    <div style="width:100%; padding-top:8px;">
      <span class="mono subtle" style="font-size:10px; text-transform:uppercase;">Top 3 capabilities</span>
      <div style="font-size:12px; margin-top:4px;">${result.priority.slice(0, 3).map(p => `<span class="pill" style="background:var(--violet); font-size:10px; margin-right:4px; margin-top:4px;">${esc(p)}</span>`).join("")}</div>
    </div>`;
  swapMarkup(host, tpl);
}

/* ====== Benchmark stats ====== */
function renderBenchmarks() {
  const host = document.getElementById("benchmarks-host");
  const tpl = (DATA.benchmarkStats || []).map((s, i) => `
    <div style="display:grid; grid-template-columns:1fr 180px; gap:12px; margin-bottom:10px;">
      <input class="bm-label" data-i="${i}" value="${esc(s.label)}" placeholder="Label">
      <input class="bm-value" data-i="${i}" value="${esc(s.value)}" placeholder="Value">
    </div>`).join("") + `
    <p class="mono subtle" style="font-size:11px; margin-top:8px;">Shown in Diagnostic report. Keep values short — "47", "SGD 42", "6–9 weeks".</p>`;
  swapMarkup(host, tpl);
}

function collectBenchmarks() {
  return [...document.querySelectorAll(".bm-label")].map((el, i) => ({
    label: el.value,
    value: document.querySelector(`.bm-value[data-i="${i}"]`).value
  }));
}

/* ====== Scoring weights ====== */
function renderWeights() {
  const host = document.getElementById("weights-host");
  const groups = Object.entries(DATA.scoringWeights);
  const tpl = groups.map(([groupKey, answers]) => {
    const maxVal = Math.max(...Object.values(answers));
    const rows = Object.entries(answers).map(([ans, val]) => `
      <div class="weight-row">
        <div>${esc(ans)}</div>
        <input type="range" min="0" max="30" value="${val}" data-group="${esc(groupKey)}" data-answer="${esc(ans)}">
        <div class="v" data-v-for="${esc(groupKey)}|${esc(ans)}">${val}</div>
      </div>
    `).join("");
    const sum = Object.values(answers).reduce((a, b) => a + b, 0);
    return `
      <div class="weight-group">
        <h4>${esc(groupKey)} <span style="float:right; font-family:var(--font-mono); font-size:11px; color:var(--coral);" data-sum="${esc(groupKey)}">Σ max = ${maxVal}</span></h4>
        ${rows}
      </div>`;
  }).join("");
  swapMarkup(host, tpl);

  host.querySelectorAll("input[type=range]").forEach(inp => {
    inp.addEventListener("input", () => {
      const g = inp.dataset.group;
      const a = inp.dataset.answer;
      const v = Number(inp.value);
      DATA.scoringWeights[g][a] = v;
      const vCell = host.querySelector(`[data-v-for="${g}|${a}"]`);
      if (vCell) vCell.textContent = String(v);
      const maxVal = Math.max(...Object.values(DATA.scoringWeights[g]));
      const sumCell = host.querySelector(`[data-sum="${g}"]`);
      if (sumCell) sumCell.textContent = `Σ max = ${maxVal}`;
      renderSimResult();
    });
  });
}

/* ====== Package thresholds ====== */
function renderThresholds() {
  const host = document.getElementById("thresholds-host");
  const t = DATA.packageThresholds;
  const tpl = `
    <h4>Premium (minSpend + minDealSize both required)</h4>
    <div class="weight-row">
      <div>Min spend (SGD/mo)</div>
      <input type="range" min="0" max="10000" step="500" value="${t.premium.minSpend || 0}" data-thresh="premium-minSpend">
      <div class="v" data-v="premium-minSpend">${t.premium.minSpend || 0}</div>
    </div>
    <div class="weight-row">
      <div>Min deal size (SGD)</div>
      <input type="range" min="0" max="25000" step="500" value="${t.premium.minDealSize || 0}" data-thresh="premium-minDealSize">
      <div class="v" data-v="premium-minDealSize">${t.premium.minDealSize || 0}</div>
    </div>
    <h4 style="margin-top:24px;">Core (minSpend + minDealSize both required)</h4>
    <div class="weight-row">
      <div>Min spend (SGD/mo)</div>
      <input type="range" min="0" max="10000" step="500" value="${t.core.minSpend || 0}" data-thresh="core-minSpend">
      <div class="v" data-v="core-minSpend">${t.core.minSpend || 0}</div>
    </div>
    <div class="weight-row">
      <div>Min deal size (SGD)</div>
      <input type="range" min="0" max="25000" step="500" value="${t.core.minDealSize || 0}" data-thresh="core-minDealSize">
      <div class="v" data-v="core-minDealSize">${t.core.minDealSize || 0}</div>
    </div>`;
  swapMarkup(host, tpl);
  host.querySelectorAll("input[type=range]").forEach(inp => {
    inp.addEventListener("input", () => {
      const key = inp.dataset.thresh;
      const [pkg, prop] = key.split("-");
      DATA.packageThresholds[pkg][prop] = Number(inp.value);
      host.querySelector(`[data-v="${key}"]`).textContent = inp.value;
      renderSimResult();
    });
  });
}

/* ====== Objections ====== */
function renderObjections() {
  const host = document.getElementById("objections-host");
  const tpl = (DATA.objections || []).map(o => `
    <div class="obj">
      <div class="obj__meta">
        <span>${esc(o.category || "Objection")}</span>
      </div>
      <div class="obj__trigger">${esc(o.trigger)}</div>
      <div class="obj__response"><strong>Response:</strong> ${esc(o.response)}</div>
      ${o.killshot ? `<div class="obj__kill">${esc(o.killshot)}</div>` : ""}
    </div>`).join("");
  swapMarkup(host, tpl);
}

/* ====== Talk tracks ====== */
function renderTracks() {
  const host = document.getElementById("tracks-host");
  const tpl = (DATA.talkTracks || []).map(t => `
    <div class="card">
      <span class="mono subtle" style="font-size:10px; text-transform:uppercase; letter-spacing:0.06em;">When</span>
      <h4 style="margin:4px 0 10px;">${esc(t.situation)}</h4>
      <p style="font-style:italic; opacity:0.85; font-size:14px; margin:0;">"${esc(t.say)}"</p>
    </div>`).join("");
  swapMarkup(host, tpl);
}
