import { esc, swapMarkup } from "../common.js?v=1";

const form = document.getElementById("pf");
const preview = document.getElementById("preview");
let packagesData = [];
let capabilitiesData = [];

function getLeadId() {
  return new URLSearchParams(location.search).get("leadId");
}

async function init() {
  const [pkgJson, capJson] = await Promise.all([
    fetch("../data/packages.json?v=1").then(r => r.json()),
    fetch("../data/capabilities.json?v=1").then(r => r.json())
  ]);
  packagesData = pkgJson.tiers;
  capabilitiesData = capJson.capabilities;

  form.elements.date.value = new Date().toISOString().slice(0, 10);

  // Prefill from leadId if present
  const leadId = getLeadId();
  if (leadId) {
    const leads = JSON.parse(localStorage.getItem("ep_leads") || "[]");
    const lead = leads.find(l => l.id === leadId);
    if (lead) prefill(lead);
  }

  // Restore draft if any
  const drafts = JSON.parse(localStorage.getItem("ep_proposals") || "{}");
  if (leadId && drafts[leadId]) {
    Object.entries(drafts[leadId]).forEach(([k, v]) => {
      if (form.elements[k]) form.elements[k].value = v;
    });
  }

  form.addEventListener("input", render);
  document.getElementById("gen-btn").addEventListener("click", generatePdf);
  render();
}

function prefill(lead) {
  form.elements.name.value = lead.name || "";
  form.elements.company.value = lead.company || "";
  form.elements.pkg.value = lead.package || "core";

  const fee = { entry: 799, core: 1499, premium: 2999 }[lead.package || "core"];
  form.elements.fee.value = fee;

  if (lead.answers) {
    const pains = Array.isArray(lead.answers.pains) && lead.answers.pains.length
      ? lead.answers.pains.join(", ")
      : "—";
    form.elements.problem.value =
      `Industry: ${lead.answers.industry || "—"}. Headcount: ${lead.answers.headcount || "—"}. ` +
      `Pain points: ${pains}. Goal: ${lead.answers.goal || "—"}. Deal size: ${lead.answers.dealSize || "—"}.`;
  }
  form.elements.solution.value =
    "Bundled retainer covering content, video, ads, SEO, and creative — priced below premium agencies, structured above freelancers. " +
    "ROI reported monthly against your break-even line.";
}

function saveDraft() {
  const leadId = getLeadId();
  if (!leadId) return;
  const drafts = JSON.parse(localStorage.getItem("ep_proposals") || "{}");
  drafts[leadId] = Object.fromEntries(new FormData(form).entries());
  localStorage.setItem("ep_proposals", JSON.stringify(drafts));
}

function render() {
  const d = Object.fromEntries(new FormData(form).entries());
  const pkg = packagesData.find(p => p.id === d.pkg) || packagesData[1] || { name: "Core", priceFrom: 2000, priceTo: 3000 };

  const fee = Number(d.fee) || 0;
  const setup = Number(d.setup) || 0;
  const term = Number(d.term) || 6;
  const yearTotal = fee * 12 + setup;

  const pagesTpl = `
    <div class="preview-page" data-page="1">
      <span class="sticker sticker--coral">PROPOSAL ✦ 01</span>
      <h1 style="margin-top:20px;">For <span class="hl">${esc(d.company || "—")}</span></h1>
      <p style="font-size:18px; margin-top:8px;">Prepared by <strong>${esc(d.rep || "")}</strong> · ${esc(d.date || "")}</p>
      <p style="margin-top:40px; font-size:16px; max-width:520px;">Thanks for considering Elitez Pulse. This proposal shows exactly what you get, what it costs, and what ROI we're targeting — no reveals, no upsell traps.</p>
      <p style="position:absolute; bottom:32px; left:40px; font-size:12px;" class="mono subtle">elitez-pulse · part of Elitez Group</p>
    </div>

    <div class="preview-page" data-page="2">
      <h2>The problem &amp; the goal</h2>
      <p style="font-size:15px; white-space:pre-wrap; margin-top:16px;">${esc(d.problem || "")}</p>
      <h3 style="margin-top:24px;">How we'll measure success</h3>
      <ul>
        <li>Monthly ROI report vs break-even line</li>
        <li>Qualified leads per month (tracked + attributed)</li>
        <li>Cost per acquired customer</li>
        <li>Content shipped vs. plan</li>
      </ul>
    </div>

    <div class="preview-page" data-page="3">
      <h2>Proposed solution — <span class="hl">${esc(pkg.name)}</span></h2>
      <p class="mono">SGD ${(pkg.priceFrom || 0).toLocaleString()}–${(pkg.priceTo || 0).toLocaleString()} / month</p>
      <p style="margin-top:16px; font-size:15px; white-space:pre-wrap;">${esc(d.solution || "")}</p>
      <h3 style="margin-top:24px;">Included capabilities</h3>
      <div class="grid grid--3" style="margin-top:12px;">
        ${capabilitiesData.slice(0, 5).map(c => `
          <div class="card" style="padding:16px;">
            <h4>${esc(c.name)}</h4>
            <p class="mono subtle" style="font-size:12px;">${esc(c.kpi)}</p>
          </div>`).join("")}
      </div>
    </div>

    <div class="preview-page" data-page="4">
      <h2>Pricing</h2>
      <table class="tbl" style="margin-top:16px; max-width:520px;">
        <tr><td>Monthly fee</td><td style="text-align:right;">SGD ${fee.toLocaleString()}</td></tr>
        <tr><td>Setup / one-off</td><td style="text-align:right;">SGD ${setup.toLocaleString()}</td></tr>
        <tr><td>Term</td><td style="text-align:right;">${term} months</td></tr>
        <tr style="background:var(--mustard);"><td><strong>Total first year (est)</strong></td><td style="text-align:right;"><strong>SGD ${yearTotal.toLocaleString()}</strong></td></tr>
      </table>
      <p class="subtle" style="margin-top:20px;">Monthly billing, 30-day notice cancellation. No auto-renew traps.</p>
    </div>

    <div class="preview-page" data-page="5">
      <h2>Next steps</h2>
      <ol style="font-size:15px;">
        <li>You countersign (30-day cancellation clause included)</li>
        <li>Onboarding week: brand audit, access, tooling setup</li>
        <li>Month 1: first content drop + ad setup + baseline measurement</li>
        <li>Monthly: ROI report against the break-even line</li>
      </ol>
      <p style="margin-top:48px;"><strong>${esc(d.rep || "Pulse Team")}</strong><br>pulse@elitez.asia<br><em>Part of Elitez Group</em></p>
      <span class="sticker sticker--mustard" style="position:absolute; bottom:32px; right:32px;">LET'S SHIP IT ✦</span>
    </div>`;
  swapMarkup(preview, pagesTpl);
  saveDraft();
}

async function generatePdf() {
  if (!window.jspdf || !window.html2canvas) {
    alert("PDF libraries still loading. Try again in a second.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const pages = preview.querySelectorAll(".preview-page");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const canvas = await window.html2canvas(pages[i], { scale: 2, backgroundColor: "#FEF3E7", logging: false });
    const img = canvas.toDataURL("image/png");
    if (i > 0) pdf.addPage();
    const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
    const imgW = canvas.width * ratio;
    const imgH = canvas.height * ratio;
    const offsetX = (pageW - imgW) / 2;
    const offsetY = (pageH - imgH) / 2;
    pdf.addImage(img, "PNG", offsetX, offsetY, imgW, imgH);
  }

  const companyRaw = form.elements.company.value.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "client";
  pdf.save(`Elitez-Pulse-Proposal-${companyRaw}.pdf`);
}

document.addEventListener("DOMContentLoaded", init);
