import { esc, swapMarkup } from "../common.js?v=1";

const STAGES = ["New", "Qualified", "Proposed", "Won", "Lost"];
const PKG_MIDPOINT = { entry: 1049, core: 1999, premium: 3749 };

function getLeads() { return JSON.parse(localStorage.getItem("ep_leads") || "[]"); }
function setLeads(arr) { localStorage.setItem("ep_leads", JSON.stringify(arr)); }
function pillKey(stage) { return stage.toLowerCase().slice(0, 4); }

function estGp(lead) {
  const mid = PKG_MIDPOINT[lead.package] || 0;
  return Math.round(mid * 0.7 * 3); // 3-month estimated GP @ 70% margin
}

export async function render(root) {
  const leads = getLeads().sort((a, b) => b.ts - a.ts);
  const byStage = Object.fromEntries(STAGES.map(s => [s, 0]));
  leads.forEach(l => { if (byStage[l.stage] != null) byStage[l.stage]++; });
  const potentialGp = leads
    .filter(l => l.stage === "Qualified" || l.stage === "Proposed")
    .reduce((acc, l) => acc + estGp(l), 0);

  const header = `
    <h1>Leads & Pipeline</h1>
    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; align-items:center;">
      ${STAGES.map(s => `<span class="pill pill--${pillKey(s)}">${s}: ${byStage[s]}</span>`).join("")}
      <span class="pill" style="background:var(--ink); color:var(--mustard);">Potential GP: SGD ${potentialGp.toLocaleString()}</span>
      <button type="button" class="btn btn--outline" style="margin-left:auto; padding:8px 14px; font-size:13px;" id="csv-btn">Export CSV</button>
    </div>`;

  const tableOrEmpty = leads.length === 0
    ? `<div class="empty">No leads yet. Contact form + ROI Diagnostic both land here.</div>`
    : `
      <table class="tbl">
        <thead><tr>
          <th>Date</th><th>Name</th><th>Company</th><th>Source</th>
          <th>Score</th><th>Rec'd</th><th>Stage</th>
        </tr></thead>
        <tbody>${leads.map(l => `
          <tr data-id="${esc(l.id)}">
            <td class="mono">${esc(new Date(l.ts).toLocaleDateString())}</td>
            <td>${esc(l.name)}</td>
            <td>${esc(l.company)}</td>
            <td>${esc(l.source)}</td>
            <td>${l.score != null ? l.score : "—"}</td>
            <td>${l.package ? esc(l.package) : "—"}</td>
            <td><span class="pill pill--${pillKey(l.stage || "New")}">${esc(l.stage || "New")}</span></td>
          </tr>`).join("")}
        </tbody>
      </table>`;

  swapMarkup(root, header + tableOrEmpty);

  root.querySelectorAll("tr[data-id]").forEach(tr => {
    tr.addEventListener("click", () => openDrawer(tr.dataset.id));
  });
  document.getElementById("csv-btn")?.addEventListener("click", exportCsv);
}

function openDrawer(id) {
  const leads = getLeads();
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  const body = document.getElementById("drawer-body");

  const answersHtml = lead.answers
    ? `<h4 style="margin-top:20px;">Diagnostic answers</h4>
       <ul>${Object.entries(lead.answers).map(([k, v]) => `
         <li><strong>${esc(k)}:</strong> ${esc(Array.isArray(v) ? (v.join(", ") || "—") : (v == null ? "—" : String(v)))}</li>
       `).join("")}</ul>
       <p><strong>Score:</strong> ${lead.score}/100 · <strong>Fit:</strong> ${esc(lead.fitFlag || "—")} · <strong>Break-even:</strong> ${lead.breakEvenDeals ?? "—"} deals/mo</p>`
    : "";

  const messageHtml = lead.message ? `<h4>Message</h4><p>${esc(lead.message)}</p>` : "";

  const tpl = `
    <h2>${esc(lead.name)} <span class="subtle" style="font-size:14px; font-weight:400;">${esc(lead.company)}</span></h2>
    <p class="mono subtle">${esc(lead.email)} · ${esc(new Date(lead.ts).toLocaleString())} · ${esc(lead.source)}</p>

    <label style="margin-top:20px;">Stage
      <select id="stage-sel" style="width:100%; margin-top:6px;">
        ${STAGES.map(s => `<option value="${esc(s)}" ${lead.stage === s ? "selected" : ""}>${esc(s)}</option>`).join("")}
      </select>
    </label>

    ${answersHtml}
    ${messageHtml}

    <label style="margin-top:20px;">Notes
      <textarea id="notes" style="width:100%; min-height:100px; margin-top:6px;">${esc(lead.notes || "")}</textarea>
    </label>

    <div style="display:flex; gap:10px; margin-top:20px; flex-wrap:wrap;">
      <button type="button" class="btn btn--primary" id="save-btn" style="padding:10px 18px; font-size:13px;">Save</button>
      <a class="btn btn--outline" href="proposal.html?leadId=${esc(lead.id)}" style="padding:10px 18px; font-size:13px;">Generate proposal →</a>
    </div>
  `;
  swapMarkup(body, tpl);
  document.getElementById("drawer").classList.add("open");

  document.getElementById("save-btn").addEventListener("click", () => {
    const currentLeads = getLeads();
    const idx = currentLeads.findIndex(l => l.id === id);
    if (idx < 0) return;
    const newStage = document.getElementById("stage-sel").value;
    const notes = document.getElementById("notes").value;
    if (currentLeads[idx].stage !== newStage) {
      currentLeads[idx].stageHistory = currentLeads[idx].stageHistory || [];
      currentLeads[idx].stageHistory.push({ stage: newStage, ts: Date.now() });
    }
    currentLeads[idx].stage = newStage;
    currentLeads[idx].notes = notes;
    setLeads(currentLeads);
    document.getElementById("drawer").classList.remove("open");
    render(document.getElementById("main"));
  });
}

function exportCsv() {
  const leads = getLeads();
  const headers = ["id", "ts", "source", "name", "company", "email", "stage", "score", "package", "fitFlag", "breakEvenDeals"];
  const rows = [headers.join(",")];
  leads.forEach(l => {
    rows.push(headers.map(h => JSON.stringify(l[h] == null ? "" : l[h])).join(","));
  });
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `elitez-pulse-leads-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
