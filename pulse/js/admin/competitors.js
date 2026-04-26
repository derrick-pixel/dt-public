import { esc, swapMarkup } from "../common.js?v=2";

let DATA = null;
let filters = { tier: "all", country: "all", q: "" };
let sort = { key: "threat", dir: "desc" };
let scatterChart = null;

const THREAT_RANK = { high: 3, medium: 2, low: 1 };
const TIER_LABEL = {
  freelancer: "Freelancer", micro: "Micro-agency", smb: "SMB", mid: "Mid-tier", premium: "Premium"
};
const TIER_COLOR = {
  freelancer: "#9ca3af",
  micro: "#FFD700",
  smb: "#A78BFA",
  mid: "#3D5AFE",
  premium: "#1A1A1A"
};

export async function render(root) {
  const override = JSON.parse(localStorage.getItem("ep_competitorsOverride") || "null");
  DATA = override || await fetch("../data/competitors.json?v=2").then(r => r.json());

  const byTier = groupCount(DATA.competitors, "tier");
  const byCountry = groupCount(DATA.competitors, "country");
  const avgThreat = DATA.competitors.filter(c => c.threat === "high").length;

  const tpl = `
    <h1>Competitor Intel</h1>
    <p class="subtle" style="margin-bottom:24px;">${esc(DATA.competitors.length)} competitors mapped across SG + MY + global. ${esc(avgThreat)} classed as <strong>high-threat</strong> (regularly shortlisted alongside us). Last review: <span class="mono">${esc(DATA.marketSummary?.lastReviewed || "—")}</span>.</p>

    <div class="kpis">
      <div class="kpi"><div class="kpi__val">${DATA.competitors.length}</div><div class="kpi__lbl">Total mapped</div></div>
      <div class="kpi"><div class="kpi__val">${avgThreat}</div><div class="kpi__lbl">High-threat overlap</div></div>
      <div class="kpi"><div class="kpi__val">${byCountry.SG || 0} / ${byCountry.MY || 0}</div><div class="kpi__lbl">SG / MY presence</div></div>
    </div>

    <div class="admin-section-head">
      <h2>Positioning map</h2>
      <p>Price (x) × structural reliability (y). Our spot is the coral dot. Closer = more head-to-head.</p>
    </div>
    <div class="chart-wrap"><canvas id="scatter"></canvas></div>

    <div class="admin-section-head">
      <h2>Pricing blueprint · assets</h2>
      <p>Market pricing by tier, per service. Where we sit is highlighted coral.</p>
    </div>
    <div id="matrix-assets" class="matrix"></div>

    <div class="admin-section-head">
      <h2>Pricing blueprint · campaigns & retainers</h2>
      <p>Same view for ads, SEO, landing pages, and full retainers.</p>
    </div>
    <div id="matrix-campaigns" class="matrix"></div>

    <div class="admin-section-head">
      <h2>All competitors</h2>
      <p>Click any row for the full battle-card drawer.</p>
    </div>

    <div class="filterbar" id="filters">
      <strong style="font-size:12px; font-family:var(--font-mono); text-transform:uppercase; letter-spacing:0.05em;">Tier:</strong>
      <button type="button" class="chip active" data-filter="tier" data-v="all">All</button>
      <button type="button" class="chip" data-filter="tier" data-v="freelancer">Freelancer</button>
      <button type="button" class="chip" data-filter="tier" data-v="micro">Micro</button>
      <button type="button" class="chip" data-filter="tier" data-v="smb">SMB</button>
      <button type="button" class="chip" data-filter="tier" data-v="mid">Mid</button>
      <button type="button" class="chip" data-filter="tier" data-v="premium">Premium</button>

      <strong style="font-size:12px; font-family:var(--font-mono); text-transform:uppercase; letter-spacing:0.05em; margin-left:18px;">Region:</strong>
      <button type="button" class="chip active" data-filter="country" data-v="all">All</button>
      <button type="button" class="chip" data-filter="country" data-v="SG">SG</button>
      <button type="button" class="chip" data-filter="country" data-v="MY">MY</button>
      <button type="button" class="chip" data-filter="country" data-v="SG+MY">SG+MY</button>

      <input type="search" id="q" placeholder="Search name…" style="margin-left:auto;">
      <button type="button" class="btn btn--outline" style="padding:6px 14px; font-size:12px;" id="download">Download JSON</button>
    </div>

    <div id="table-host"></div>`;
  swapMarkup(root, tpl);

  renderMatrix(document.getElementById("matrix-assets"), DATA.priceMatrix.assets);
  renderMatrix(document.getElementById("matrix-campaigns"), DATA.priceMatrix.campaigns);
  renderScatter();
  renderTable();
  wireFilters();

  document.getElementById("download").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "competitors.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

function groupCount(arr, key) {
  return arr.reduce((acc, x) => ({ ...acc, [x[key]]: (acc[x[key]] || 0) + 1 }), {});
}

function renderMatrix(host, rows) {
  if (!host || !rows) return;
  const allVals = rows.flatMap(r => [r.freelancer, r.us, r.smb, r.premium]).flat();
  const max = Math.max(...allVals);

  const bar = (range, cls, name) => {
    const [lo, hi] = range;
    const start = (lo / max) * 100;
    const end = 100 - (hi / max) * 100;
    return `<div class="matrix__bar ${cls}" style="--start:${start}%; --end:${end}%;"><span>${lo.toLocaleString()}–${hi.toLocaleString()}</span></div>`;
  };

  const rowsTpl = rows.map(r => `
    <div class="matrix__row">
      <div class="matrix__label">${esc(r.service)}</div>
      ${bar(r.freelancer, "freelancer")}
      ${bar(r.us, "is-us")}
      ${bar(r.smb, "smb")}
      ${bar(r.premium, "premium")}
    </div>
  `).join("");

  const header = `
    <div class="matrix__row is-header">
      <div>Service</div>
      <div>Freelancer</div>
      <div>★ Us — Pulse</div>
      <div>SMB agency</div>
      <div>Premium agency</div>
    </div>`;
  swapMarkup(host, header + rowsTpl);
}

function renderScatter() {
  const ctx = document.getElementById("scatter");
  if (!ctx || !window.Chart) return;

  const points = DATA.competitors.map(c => ({
    x: c.priceMid,
    y: c.reliability,
    r: c.threat === "high" ? 14 : c.threat === "medium" ? 10 : 7,
    label: c.name,
    tier: c.tier,
    country: c.country,
    threat: c.threat
  }));

  // Add our own position
  const us = { x: 1999, y: 8, r: 18, label: "Elitez Pulse ★", tier: "us", country: "SG+MY", threat: "us" };

  if (scatterChart) scatterChart.destroy();

  scatterChart = new Chart(ctx, {
    type: "bubble",
    data: {
      datasets: [
        {
          label: "Competitors",
          data: points,
          backgroundColor: points.map(p => TIER_COLOR[p.tier] + "88"),
          borderColor: points.map(p => TIER_COLOR[p.tier]),
          borderWidth: 2
        },
        {
          label: "Elitez Pulse",
          data: [us],
          backgroundColor: "#FF5B39",
          borderColor: "#1A1A1A",
          borderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const p = ctx.raw;
              return `${p.label} · ${p.country || ""} · ${p.tier} · SGD ${p.x.toLocaleString()} · rel ${p.y}/10`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: "Typical price midpoint (SGD/mo equiv)", font: { family: "Inter", weight: "700" } },
          grid: { color: "rgba(0,0,0,0.05)" }
        },
        y: {
          title: { display: true, text: "Structural reliability (0–10)", font: { family: "Inter", weight: "700" } },
          min: 0,
          max: 10,
          grid: { color: "rgba(0,0,0,0.05)" }
        }
      }
    }
  });
}

function renderTable() {
  const host = document.getElementById("table-host");
  let list = DATA.competitors.slice();

  if (filters.tier !== "all") list = list.filter(c => c.tier === filters.tier);
  if (filters.country !== "all") list = list.filter(c => c.country === filters.country);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.positioning.toLowerCase().includes(q));
  }

  list.sort((a, b) => {
    const s = sort.dir === "asc" ? 1 : -1;
    if (sort.key === "threat") return (THREAT_RANK[a.threat] - THREAT_RANK[b.threat]) * s;
    if (sort.key === "priceMid") return (a.priceMid - b.priceMid) * s;
    if (sort.key === "reliability") return (a.reliability - b.reliability) * s;
    if (sort.key === "name") return a.name.localeCompare(b.name) * s;
    return 0;
  });

  if (list.length === 0) {
    swapMarkup(host, `<div class="empty">No competitors match these filters.</div>`);
    return;
  }

  const tpl = `
    <table class="tbl">
      <thead>
        <tr>
          <th data-sort="name" style="cursor:pointer;">Competitor ↕</th>
          <th>Region / Tier</th>
          <th data-sort="priceMid" style="cursor:pointer;">Price (SGD/mo) ↕</th>
          <th data-sort="reliability" style="cursor:pointer;">Reliability ↕</th>
          <th data-sort="threat" style="cursor:pointer;">Threat ↕</th>
          <th>Grade</th>
        </tr>
      </thead>
      <tbody>${list.map((c, i) => `
        <tr data-i="${DATA.competitors.indexOf(c)}">
          <td>
            <strong>${esc(c.name)}</strong>
            <br><span class="mono subtle" style="font-size:11px;">${esc(c.site)}</span>
          </td>
          <td>${esc(c.country)} · ${esc(TIER_LABEL[c.tier] || c.tier)}</td>
          <td class="mono">${esc(c.typicalPrice)}</td>
          <td>
            <span class="reliability-meter" aria-label="${c.reliability} of 10">
              ${Array.from({length: 10}).map((_, idx) => `<span class="${idx < c.reliability ? "on" : ""}"></span>`).join("")}
            </span>
          </td>
          <td><span class="pill threat-${esc(c.threat)}">${esc(c.threat)}</span></td>
          <td><span class="pill" style="background:${c.grade === 'A' ? '#16a34a' : c.grade === 'B' ? 'var(--violet)' : c.grade === 'C' ? 'var(--mustard)' : '#9ca3af'}; color:${c.grade === 'C' ? 'var(--ink)' : 'var(--white)'};">${esc(c.grade)}</span></td>
        </tr>
      `).join("")}</tbody>
    </table>`;
  swapMarkup(host, tpl);

  host.querySelectorAll("tr[data-i]").forEach(tr => {
    tr.addEventListener("click", () => openCard(DATA.competitors[Number(tr.dataset.i)]));
  });
  host.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const k = th.dataset.sort;
      sort.dir = sort.key === k && sort.dir === "desc" ? "asc" : "desc";
      sort.key = k;
      renderTable();
    });
  });
}

function wireFilters() {
  document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      filters[f] = btn.dataset.v;
      document.querySelectorAll(`[data-filter="${f}"]`).forEach(b => b.classList.toggle("active", b.dataset.v === filters[f]));
      renderTable();
    });
  });
  document.getElementById("q")?.addEventListener("input", (e) => {
    filters.q = e.target.value;
    renderTable();
  });
}

function openCard(c) {
  const body = document.getElementById("drawer-body");
  const tpl = `
    <h2>${esc(c.name)}</h2>
    <p class="mono">
      <a href="${esc(c.site)}" target="_blank" rel="noopener">${esc(c.site)}</a>
    </p>
    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
      <span class="pill" style="background:var(--ink); color:var(--cream);">${esc(c.country)}</span>
      <span class="pill" style="background:var(--violet);">${esc(TIER_LABEL[c.tier] || c.tier)}</span>
      <span class="pill threat-${esc(c.threat)}">Threat · ${esc(c.threat)}</span>
      <span class="pill" style="background:${c.grade === 'A' ? '#16a34a' : c.grade === 'B' ? 'var(--violet)' : c.grade === 'C' ? 'var(--mustard)' : '#9ca3af'}; color:${c.grade === 'C' ? 'var(--ink)' : 'var(--white)'};">Grade ${esc(c.grade)}</span>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:20px; background:var(--white); border:2px solid var(--ink); border-radius:8px; padding:16px;">
      <div>
        <span class="mono subtle" style="font-size:10px; text-transform:uppercase; letter-spacing:0.08em;">Typical price</span>
        <div style="font-weight:800; font-size:16px;">${esc(c.typicalPrice)}</div>
      </div>
      <div>
        <span class="mono subtle" style="font-size:10px; text-transform:uppercase; letter-spacing:0.08em;">Reliability</span>
        <div style="font-weight:800; font-size:16px;">${c.reliability} / 10</div>
      </div>
    </div>

    <h4 style="margin-top:20px;">Their positioning</h4>
    <p>${esc(c.positioning)}</p>

    <h4 style="color:#16a34a;">Our advantage</h4>
    <p>${esc(c.ourAdvantage)}</p>

    <h4 style="color:#dc2626;">Our gap</h4>
    <p>${esc(c.ourGap)}</p>

    <h4>Battle-card</h4>
    <div style="padding:14px; background:var(--mustard); border-radius:8px; font-size:14px;">${esc(c.battlecard)}</div>

    ${c.objections && c.objections.length ? `
      <h4 style="margin-top:20px;">Common objections (and our replies)</h4>
      <ul>${c.objections.map(o => `<li>${esc(o)}</li>`).join("")}</ul>
    ` : ""}

    <p class="mono subtle" style="font-size:11px; margin-top:24px;">Last reviewed: ${esc(c.lastReviewed || "—")}</p>`;
  swapMarkup(body, tpl);
  document.getElementById("drawer").classList.add("open");
}
