import { scoreAnswers } from "./diagnostic-scoring.js";
import { esc, swapMarkup } from "./common.js?v=1";

const state = {
  step: 0,
  answers: {
    industry: null,
    headcount: null,
    spend: 1500,
    pains: [],
    goal: null,
    dealSize: null,
    urgency: null
  },
  contact: null
};
const TOTAL_STEPS = 10;

function renderStep() {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  const el = document.querySelector(`.step[data-step="${state.step}"]`);
  if (el) el.classList.add("active");
  const progress = document.getElementById("progress");
  if (progress) progress.style.width = `${Math.round((state.step / (TOTAL_STEPS - 1)) * 100)}%`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function next() {
  const reqEl = document.querySelector(`.step[data-step="${state.step}"] [data-req]`);
  if (reqEl) {
    const q = reqEl.dataset.req;
    if (!state.answers[q]) {
      alert("Pick an option first ✦");
      return;
    }
  }
  state.step = Math.min(state.step + 1, TOTAL_STEPS - 1);
  renderStep();
}

function prev() {
  state.step = Math.max(state.step - 1, 0);
  renderStep();
}

function wireChips() {
  document.querySelectorAll(".chips").forEach(wrap => {
    const q = wrap.dataset.q;
    const multi = wrap.dataset.multi === "1";
    wrap.querySelectorAll(".chip").forEach(btn => {
      btn.addEventListener("click", () => {
        const v = btn.dataset.v;
        if (multi) {
          const arr = state.answers[q];
          const i = arr.indexOf(v);
          if (i >= 0) arr.splice(i, 1); else arr.push(v);
          btn.classList.toggle("selected", arr.includes(v));
        } else {
          state.answers[q] = v;
          wrap.querySelectorAll(".chip").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
        }
      });
    });
  });
}

function wireSlider() {
  const slider = document.getElementById("spend-slider");
  const val = document.getElementById("spend-val");
  if (!slider) return;
  const fmt = (n) => `SGD ${Number(n).toLocaleString()}${Number(n) >= 5000 ? "+" : ""}`;
  slider.addEventListener("input", () => {
    state.answers.spend = Number(slider.value);
    val.textContent = fmt(slider.value);
  });
  val.textContent = fmt(slider.value);
}

function wireNavButtons() {
  document.querySelectorAll("[data-next]").forEach(b => b.addEventListener("click", next));
  document.querySelectorAll("[data-prev]").forEach(b => b.addEventListener("click", prev));
}

function wireGate() {
  const form = document.getElementById("gate-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const company = String(fd.get("company") || "").trim();
    const email = String(fd.get("email") || "").trim();
    if (!name || !company || !email) {
      alert("Name, company and email are required.");
      return;
    }
    state.contact = { name, company, email };
    await finishAndShowReport();
  });
}

async function finishAndShowReport() {
  const [insights, packages, capabilities] = await Promise.all([
    fetch("data/insights.json?v=1").then(r => r.json()),
    fetch("data/packages.json?v=1").then(r => r.json()),
    fetch("data/capabilities.json?v=1").then(r => r.json())
  ]);

  const result = scoreAnswers(state.answers, insights.scoringWeights, insights.packageThresholds);
  const pickedPkg = packages.tiers.find(p => p.id === result.package) || packages.tiers[1];
  const topCaps = result.priority.slice(0, 3)
    .map(id => capabilities.capabilities.find(c => c.id === id))
    .filter(Boolean);

  const ringClass = result.score >= 75 ? "high" : result.score >= 50 ? "med" : "";
  const fitCopy = result.fitFlag === "freelancer-better"
    ? "We're honest: you'd likely be better served by a $500 freelancer right now. Come back when your ACV or team size grows."
    : result.fitFlag === "stretch"
      ? "Borderline fit. We can work together, but ROI will take longer."
      : "Strong fit. Here's how the maths works out.";

  const host = document.getElementById("report");
  const tpl = `
    <span class="sticker sticker--coral">YOUR REPORT ✦</span>
    <h1 style="margin-top:20px;">Hey ${esc(state.contact.name)} — <span class="scribble">here's the maths.</span></h1>

    <div class="score-ring ${ringClass}">${result.score}</div>
    <p style="text-align:center; font-size:18px;"><strong>ROI Fit Score</strong> · ${esc(fitCopy)}</p>

    <div class="report-card">
      <h3>Recommended package: ${esc(pickedPkg.name)}</h3>
      <p class="mono">SGD ${pickedPkg.priceFrom.toLocaleString()}–${pickedPkg.priceTo.toLocaleString()} / month</p>
      <ul>${pickedPkg.features.slice(0, 4).map(f => `<li>${esc(f)}</li>`).join("")}</ul>
      <span class="sticker sticker--mustard">Most SMEs like you pick ${esc(pickedPkg.name)} ✦</span>
    </div>

    <div class="report-card">
      <h3>Break-even maths</h3>
      <p>${result.breakEvenDeals != null
        ? `You'd need <strong>~${result.breakEvenDeals}</strong> new deal${result.breakEvenDeals > 1 ? "s" : ""} per month to cover our retainer.<br><em>${result.realistic ? "Realistic given your industry." : "Stretch — we'd want to look at your ACV more closely."}</em>`
        : "Tell us your deal size and we can run the maths."}</p>
    </div>

    <div class="report-card">
      <h3>Top 3 capabilities for you</h3>
      <ol>${topCaps.map(c => `<li><strong>${esc(c.name)}</strong> — ${esc(c.tagline)}</li>`).join("")}</ol>
    </div>

    <div class="report-card">
      <h3>Benchmark stats (medians, SGD)</h3>
      <div class="grid grid--3">${insights.benchmarkStats.map(s => `
        <div>
          <span class="mono subtle">${esc(s.label)}</span>
          <div style="font-size:28px; font-weight:900; margin-top:4px;">${esc(s.value)}</div>
        </div>`).join("")}</div>
    </div>

    <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:24px;">
      <a href="contact.html?pkg=${esc(result.package)}" class="btn btn--primary">Book the 20-min deep-dive →</a>
      <button type="button" class="btn btn--outline" id="pdf-btn">Download this report (PDF)</button>
    </div>`;
  swapMarkup(host, tpl);

  // Persist lead
  const lead = {
    id: `ld_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    source: "diagnostic",
    name: state.contact.name,
    company: state.contact.company,
    email: state.contact.email,
    answers: state.answers,
    score: result.score,
    package: result.package,
    fitFlag: result.fitFlag,
    breakEvenDeals: result.breakEvenDeals,
    stage: "New",
    stageHistory: [{ stage: "New", ts: Date.now() }]
  };
  const leads = JSON.parse(localStorage.getItem("ep_leads") || "[]");
  leads.push(lead);
  localStorage.setItem("ep_leads", JSON.stringify(leads));

  state.step = 9;
  renderStep();

  const pdfBtn = document.getElementById("pdf-btn");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", () =>
      generatePdf(lead, pickedPkg, topCaps, result, insights)
    );
  }
}

function generatePdf(lead, pkg, caps, result, insights) {
  if (!window.jspdf) {
    alert("PDF library still loading. Try again in a second.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Elitez Pulse — ROI Report", 40, 60);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`For: ${lead.name} (${lead.company})`, 40, 85);
  doc.text(`Generated: ${new Date(lead.ts).toLocaleDateString()}`, 40, 105);

  doc.setFontSize(16);
  doc.setFont("Helvetica", "bold");
  doc.text(`ROI Fit Score: ${result.score}/100 — ${result.fitFlag}`, 40, 140);

  doc.setFontSize(14);
  doc.text(`Recommended: ${pkg.name} (SGD ${pkg.priceFrom}–${pkg.priceTo}/mo)`, 40, 170);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(11);
  let y = 200;
  pkg.features.forEach(f => { doc.text(`• ${f}`, 50, y); y += 16; });

  y += 10;
  doc.setFont("Helvetica", "bold");
  doc.text("Break-even maths", 40, y);
  y += 18;
  doc.setFont("Helvetica", "normal");
  doc.text(`Deals needed per month to cover retainer: ${result.breakEvenDeals ?? "n/a"}`, 40, y);
  y += 16;
  doc.text(`Realistic for your industry: ${result.realistic ? "Yes" : "Stretch"}`, 40, y);
  y += 24;

  doc.setFont("Helvetica", "bold");
  doc.text("Top 3 capabilities for you", 40, y);
  y += 18;
  doc.setFont("Helvetica", "normal");
  caps.forEach(c => { doc.text(`• ${c.name} — ${c.tagline}`, 50, y); y += 16; });

  y += 20;
  doc.setFont("Helvetica", "bold");
  doc.text("Benchmarks", 40, y);
  y += 18;
  doc.setFont("Helvetica", "normal");
  insights.benchmarkStats.forEach(s => {
    doc.text(`• ${s.label}: ${s.value}`, 50, y);
    y += 16;
  });

  doc.setFontSize(10);
  doc.text("pulse@elitez.asia · part of Elitez Group · elitez-pulse", 40, 780);

  const slug = String(lead.company).replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "client";
  doc.save(`Elitez-Pulse-Report-${slug}.pdf`);
}

document.addEventListener("DOMContentLoaded", () => {
  wireChips();
  wireSlider();
  wireNavButtons();
  wireGate();
  renderStep();
});
