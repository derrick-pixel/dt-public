import { swapMarkup, esc } from "../common.js?v=1";

// Tier table from the deck. Interpreted as step-function bands:
// revenue ≤ cap → use that row's cost + percentage.
const TIERS = [
  { cap: 1500,      hours: 20,  cost: 400,  pct: 0.20 },
  { cap: 3000,      hours: 40,  cost: 800,  pct: 0.22 },
  { cap: 5000,      hours: 65,  cost: 1300, pct: 0.22 },
  { cap: 7500,      hours: 90,  cost: 1800, pct: 0.25 },
  { cap: Infinity,  hours: 100, cost: 2000, pct: 0.25 }
];

export function computeCommission({ revenue = 0, upsellValue = 0 } = {}) {
  let tier = TIERS.length - 1;
  for (let i = 0; i < TIERS.length; i++) {
    if (revenue <= TIERS[i].cap) { tier = i; break; }
  }
  const t = TIERS[tier];
  const gp = Math.max(0, revenue - t.cost);
  const commission = Math.round(gp * t.pct);
  const upsellBonus = Math.round(upsellValue * 0.03);
  const monthlyBonus = revenue >= 13000 ? 800 : revenue >= 8000 ? 300 : 0;
  return {
    tier,
    gp,
    commission,
    upsellBonus,
    monthlyBonus,
    total: commission + upsellBonus + monthlyBonus
  };
}

export async function render(root) {
  const initial = `
    <h1>Commission Calculator</h1>
    <p class="subtle" style="margin-bottom:20px;">Enter a rep's closed monthly revenue — calculator applies the tiered commission + bonuses from the deck.</p>
    <div class="grid grid--3" style="gap:16px; margin-bottom:24px;">
      <label>Rep name <input type="text" id="rep" placeholder="e.g. Derrick" style="width:100%; margin-top:6px;"></label>
      <label>Monthly revenue closed (SGD) <input type="number" id="rev" value="0" style="width:100%; margin-top:6px;"></label>
      <label>Upsell value (SGD) <input type="number" id="ups" value="0" style="width:100%; margin-top:6px;"></label>
    </div>
    <div id="result" style="background:var(--white); border:2px solid var(--ink); border-radius:var(--radius-lg); padding:24px; box-shadow: var(--shadow-sticker);"></div>

    <h2 style="margin-top:40px;">Tier reference</h2>
    <table class="tbl" style="margin-top:12px;">
      <thead><tr><th>Band</th><th>Hours</th><th>Cost</th><th>GP (at cap)</th><th>Commission %</th><th>Commission (at cap)</th></tr></thead>
      <tbody id="tier-rows"></tbody>
    </table>`;
  swapMarkup(root, initial);

  // Populate reference table via DOM to avoid dynamic innerHTML with computed numbers
  const rowsHost = document.getElementById("tier-rows");
  const tierRows = TIERS.map((t, i) => {
    const band = t.cap === Infinity ? "> SGD 7,500" : `≤ SGD ${t.cap.toLocaleString()}`;
    const capForCalc = t.cap === Infinity ? 10000 : t.cap;
    const gpAtCap = Math.max(0, capForCalc - t.cost);
    return `<tr>
      <td>${esc(band)}</td>
      <td>${t.hours}</td>
      <td>SGD ${t.cost.toLocaleString()}</td>
      <td>SGD ${gpAtCap.toLocaleString()}</td>
      <td>${(t.pct * 100).toFixed(0)}%</td>
      <td>SGD ${Math.round(gpAtCap * t.pct).toLocaleString()}</td>
    </tr>`;
  }).join("");
  swapMarkup(rowsHost, tierRows);

  const rev = document.getElementById("rev");
  const ups = document.getElementById("ups");
  const result = document.getElementById("result");

  function recalc() {
    const r = computeCommission({ revenue: Number(rev.value), upsellValue: Number(ups.value) });
    const tpl = `
      <div class="grid grid--3" style="gap:20px;">
        <div><span class="mono subtle">Tier</span><div style="font-size:28px; font-weight:900;">${r.tier + 1} / ${TIERS.length}</div></div>
        <div><span class="mono subtle">GP</span><div style="font-size:28px; font-weight:900;">SGD ${r.gp.toLocaleString()}</div></div>
        <div><span class="mono subtle">Base commission</span><div style="font-size:28px; font-weight:900; color:var(--coral);">SGD ${r.commission.toLocaleString()}</div></div>
        <div><span class="mono subtle">Upsell bonus (+3%)</span><div style="font-size:20px; font-weight:700;">SGD ${r.upsellBonus.toLocaleString()}</div></div>
        <div><span class="mono subtle">Monthly performance bonus</span><div style="font-size:20px; font-weight:700;">SGD ${r.monthlyBonus.toLocaleString()}</div></div>
        <div><span class="mono subtle">Total payout</span><div style="font-size:28px; font-weight:900; color:var(--violet);">SGD ${r.total.toLocaleString()}</div></div>
      </div>`;
    swapMarkup(result, tpl);
  }
  rev.addEventListener("input", recalc);
  ups.addEventListener("input", recalc);
  recalc();
}
