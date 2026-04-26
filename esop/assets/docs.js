// Elitez ESOP — document generation (Letter of Offer, Exercise Invitation,
// Clawback Notice, Dividend Notice). Each template renders to a printable
// HTML block and can be downloaded as a PDF via html2canvas + jsPDF.

(function () {
  const D = window.ESOP_DATA;
  const { fmt } = window.ESOPCalc;

  const baseStyles = `
    .doc-sheet { background: #fff; color: #0E2640; font-family: "Fraunces", Georgia, serif; padding: 48px 56px; max-width: 780px; margin: 0 auto; box-shadow: 0 10px 40px rgba(14,38,64,0.14); border: 1px solid #e6d9bf; }
    .doc-sheet header { border-bottom: 2px solid #EE6A1F; padding-bottom: 14px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; }
    .doc-sheet header .brand { font-size: 22px; letter-spacing: 0.04em; display: flex; align-items: center; gap: 12px; }
    .doc-sheet header .brand img { height: 28px; width: auto; display: block; }
    .doc-sheet header .brand .pipe { width: 1px; height: 24px; background: rgba(14,38,64,0.24); }
    .doc-sheet header .brand em { color: #EE6A1F; font-style: italic; font-size: 20px; }
    .doc-sheet header .ref { font-family: "Inter", sans-serif; font-size: 11px; color: #5B6878; letter-spacing: 0.1em; text-transform: uppercase; }
    .doc-sheet h1 { font-size: 24px; margin-bottom: 18px; letter-spacing: -0.01em; font-weight: 500; }
    .doc-sheet h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.14em; color: #EE6A1F; font-family: "Inter", sans-serif; margin: 22px 0 8px; font-weight: 600; }
    .doc-sheet p { margin: 10px 0; font-size: 13.5px; line-height: 1.65; font-family: "Inter", sans-serif; color: #0E2640; }
    .doc-sheet .serif { font-family: "Fraunces", Georgia, serif; }
    .doc-sheet dl { font-family: "Inter", sans-serif; margin: 10px 0; }
    .doc-sheet dl div { display: grid; grid-template-columns: 200px 1fr; gap: 12px; padding: 6px 0; border-bottom: 1px dotted rgba(14,38,64,0.18); font-size: 13px; }
    .doc-sheet dt { color: #5B6878; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10.5px; padding-top: 2px; font-weight: 600; }
    .doc-sheet dd { color: #0E2640; font-variant-numeric: tabular-nums; }
    .doc-sheet footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid rgba(14,38,64,0.15); font-family: "Inter", sans-serif; font-size: 11px; color: #5B6878; display: flex; justify-content: space-between; }
    .doc-sheet .sig { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .doc-sheet .sig > div { border-top: 1px solid #0E2640; padding-top: 8px; font-family: "Inter", sans-serif; font-size: 12px; color: #0E2640; }
    .doc-sheet .sig > div .lbl { color: #5B6878; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
    .doc-sheet table.fig { width: 100%; margin: 14px 0; border-collapse: collapse; font-family: "Inter", sans-serif; font-size: 12.5px; }
    .doc-sheet table.fig th, .doc-sheet table.fig td { padding: 8px 10px; border-bottom: 1px solid rgba(14,38,64,0.12); text-align: left; font-variant-numeric: tabular-nums; }
    .doc-sheet table.fig th { color: #5B6878; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; font-weight: 600; }
    .doc-sheet table.fig td.num, .doc-sheet table.fig th.num { text-align: right; }
    .doc-sheet .seal { position: absolute; right: 56px; top: 160px; opacity: 0.12; font-family: "Fraunces", serif; font-size: 22px; color: #EE6A1F; border: 2px solid #EE6A1F; padding: 14px 18px; transform: rotate(-12deg); letter-spacing: 0.1em; }
    .doc-sheet .stamp { margin-top: 18px; padding: 10px 14px; border: 1px dashed #EE6A1F; color: #8A1F1F; font-family: "Inter", sans-serif; font-size: 12px; background: rgba(238,106,31,0.06); }
  `;

  function injectStyles() {
    if (document.getElementById("esop-doc-styles")) return;
    const s = document.createElement("style");
    s.id = "esop-doc-styles";
    s.textContent = baseStyles;
    document.head.appendChild(s);
  }

  function elt(tag, attrs, ...children) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    children.flat().forEach(c => {
      if (c == null) return;
      if (typeof c === "string") n.appendChild(document.createTextNode(c));
      else n.appendChild(c);
    });
    return n;
  }

  function dlPair(term, desc) {
    return elt("div", null, elt("dt", null, term), elt("dd", null, desc));
  }

  function header(refNo) {
    const brand = elt("div", { class: "brand" });
    const img = document.createElement("img");
    img.src = "assets/brand/elitez-wordmark.png";
    img.alt = "Elitez";
    brand.appendChild(img);
    brand.appendChild(elt("span", { class: "pipe" }));
    brand.appendChild(elt("em", null, "ESOP"));
    return elt("header", null, brand, elt("div", { class: "ref" }, refNo));
  }

  function docFooter() {
    return elt("footer", null,
      elt("div", null, D.org.legal_name),
      elt("div", null, D.org.address),
      elt("div", null, "Confidential — Clause 15")
    );
  }

  // ---------- Letter of Offer ------------------------------------------
  function letterOfOffer(holder, grant, valuation, options) {
    injectStyles();
    options = options || {};
    const fmv = valuation.fmv;
    const ex = valuation.exercise_price || Math.round(fmv * 0.10 * 10000) / 10000;
    const grantDate = grant.grant_date;
    const letterDate = grant.letter_date || grantDate;
    const refNo = `LOO / ${grant.fy} / ${holder.id.toString().padStart(3, "0")} / ${(grantDate || "").replace(/-/g, "")}`;
    const docId = `letter-of-offer-${holder.id}-${grant.fy}`;

    return elt("div", { class: "doc-sheet", id: docId },
      header(refNo),
      elt("h1", null, "Letter of Offer — Employee Share Option"),
      elt("p", null, `Date: ${fmt.date(letterDate)}`),
      elt("p", null, `To: `, elt("strong", null, holder.name), ` (${holder.ic}) — ${holder.title}, ${holder.dept}`),
      elt("p", null, `Dear ${holder.name.split(/[,\s]/)[0]},`),
      elt("p", null,
        "On behalf of ", elt("strong", null, D.org.legal_name), ", and pursuant to ",
        elt("strong", null, "The Elitez Employee Share Option Plan"),
        " (adopted 5 Oct 2025), we are pleased to offer you the following grant of Options under the Plan:"),
      elt("h2", null, "Grant summary"),
      elt("dl", null,
        dlPair("Grant reference", grant.fy),
        dlPair("Grant date", fmt.date(grantDate)),
        dlPair("Options granted", fmt.num(grant.qty) + " Options"),
        dlPair("Underlying shares", "Series A Preference Shares (economic only, 1:1 conversion on Exit/IPO)"),
        dlPair("Grant-date FMV", fmt.sgd(fmv, 4) + " per share"),
        dlPair("Exercise price", fmt.sgd(ex, 4) + " per share (10% of grant-date FMV)"),
        dlPair("Vesting", "12-month cliff at 20%; remaining 80% monthly over 48 months"),
        dlPair("Fully vested", fmt.date(shift(grantDate, 60))),
        dlPair("Exercise window", `14 days from ${fmt.date(shift(grantDate, 60))} (or earlier on Exit Notice)`)
      ),
      elt("h2", null, "Acceptance"),
      elt("p", null,
        "To accept this offer, please sign the Acceptance Form and remit ", elt("strong", null, "S$1"),
        " by PayNow to +65 9663 9634 (Lin Rongjie) with the last 4 digits of your NRIC in the reference. ",
        "Your acceptance confirms you have read the Plan, agree to be bound by its terms, and understand that the information in this letter is ",
        elt("strong", null, "confidential"), " under Clause 15."
      ),
      elt("h2", null, "Key reminders"),
      elt("p", null,
        "Options are personal, non-transferable, and lapse if unvested on termination. Exercising converts Options into Series A Preference Shares, held in trust by ",
        elt("strong", null, "Lim Yong Ciat"),
        " (Trustee). Dividends, exit proceeds and the annual trading window are available to you as beneficial owner."),
      elt("p", null, "Taxation: the spread between FMV and Exercise Price at exercise is treated by IRAS as employment income. Elitez will issue Appendix 8B at the relevant tax year."),
      elt("div", { class: "stamp" }, "Issued under The Elitez Employee Share Option Plan — counter-signed by two Major Shareholders as required under Clause 7.3."),
      elt("div", { class: "sig" },
        elt("div", null, elt("div", { class: "lbl" }, "For and on behalf of Elitez Group Pte. Ltd."), elt("div", null, "Teo Wen Shan, Derrick · CEO")),
        elt("div", null, elt("div", { class: "lbl" }, "Acknowledged and accepted"), elt("div", null, holder.name))
      ),
      docFooter()
    );
  }

  // ---------- Exercise Invitation --------------------------------------
  function exerciseInvitation(holder, grant, valuation) {
    injectStyles();
    const fmv = valuation.fmv;
    const ex = valuation.exercise_price;
    const vested = Math.floor(grant.qty * (window.ESOPCalc.vestingFor(grant.grant_date).vested_pct));
    const sum = window.ESOPCalc.projectGrant(grant, fmv);
    const deadline = shift(sum.vesting.exercise_date, 0, 14);
    const refNo = `EI / ${grant.fy} / ${holder.id.toString().padStart(3, "0")}`;
    const docId = `exercise-invitation-${holder.id}-${grant.fy}`;
    return elt("div", { class: "doc-sheet", id: docId },
      header(refNo),
      elt("h1", null, "Exercise Invitation"),
      elt("p", null, `Date: ${fmt.date(window.ESOPCalc.AS_OF.toISOString().slice(0,10))}`),
      elt("p", null, `To: `, elt("strong", null, holder.name), ` — ${holder.title}, ${holder.dept}`),
      elt("p", null, "Your ", elt("strong", null, grant.fy), " grant has reached its 5-year anniversary. Under Clause 10 of the Plan you are now entitled, in whole and not in part, to exercise all vested Options held under this grant."),
      elt("h2", null, "Your exercise window"),
      elt("dl", null,
        dlPair("Window opens", fmt.date(sum.vesting.exercise_date)),
        dlPair("Window closes", fmt.date(deadline) + " (14 days)"),
        dlPair("Options vested", fmt.num(vested) + " of " + fmt.num(grant.qty) + " granted")
      ),
      elt("h2", null, "Cost and value"),
      elt("table", { class: "fig" },
        elt("tbody", null,
          row(["Current FMV / share", fmt.sgd(fmv, 4)]),
          row(["Exercise price / share (10% of FMV)", fmt.sgd(ex, 4)]),
          row(["Vested Options to exercise", fmt.num(vested)]),
          row(["Total payable to EGPL", fmt.sgd(vested * ex)]),
          row(["Gross value received", fmt.sgd(vested * fmv)]),
          row(["Gross gain (spread)", fmt.sgd(vested * (fmv - ex))])
        )
      ),
      elt("h2", null, "How to exercise"),
      elt("p", null, "Remit by PayNow to ", elt("strong", null, "+65 9663 9634 (Lin Rongjie)"), " with ", elt("strong", null, `LOO-${holder.id}-${grant.fy}`), " in the reference. Cheque or cashier's order to Elitez Group Pte. Ltd. also accepted. Payment must clear by the window close date or the Option lapses (Clause 10.6)."),
      elt("p", null, "Upon successful payment, your Series A Preference Shares will be registered to the Trustee for your beneficial ownership within 10 Business Days (Clause 10.11)."),
      elt("div", { class: "stamp" }, "This is a whole-not-partial exercise. If you do not wish to exercise, you may decline by written reply before the window closes — your Options will then lapse."),
      elt("div", { class: "sig" },
        elt("div", null, elt("div", { class: "lbl" }, "Plan Trustee"), elt("div", null, "Lim Yong Ciat · CFO, EGPL")),
        elt("div", null, elt("div", { class: "lbl" }, "Holder"), elt("div", null, holder.name))
      ),
      docFooter()
    );
  }

  // ---------- Clawback / Leaver Notice ---------------------------------
  function clawbackNotice(holder, leaverType, valuation, lastDay) {
    injectStyles();
    const scen = window.ESOPCalc.leaverScenarios(holder, valuation.fmv);
    const isBad = leaverType === "bad";
    const refNo = `LN / ${holder.id.toString().padStart(3, "0")} / ${(lastDay || "").replace(/-/g, "")}`;
    const docId = `clawback-${holder.id}`;
    const labelName = isBad ? "Bad Leaver" : "Good Leaver";
    return elt("div", { class: "doc-sheet", id: docId },
      header(refNo),
      elt("h1", null, `${labelName} — Option Clawback Notice`),
      elt("p", null, `Date: ${fmt.date(window.ESOPCalc.AS_OF.toISOString().slice(0,10))}`),
      elt("p", null, `To: `, elt("strong", null, holder.name), ` — ${holder.title}, formerly of ${holder.dept}`),
      elt("p", null, `Pursuant to Clause 11 of The Elitez Employee Share Option Plan, this is formal notice that, following your departure on ${fmt.date(lastDay)}, the Committee has determined you to be a `, elt("strong", null, labelName), ". The treatment below applies to your Options and any exercised shares as at today."),
      elt("h2", null, "Unvested Options"),
      elt("p", null, elt("strong", null, "All unvested Options forfeited (Clause 11.1.1)"), ". This is automatic and independent of leaver type."),
      elt("h2", null, "Vested (unexercised) Options"),
      elt("table", { class: "fig" },
        elt("tbody", null,
          row(["Vested at departure", fmt.num(scen.summary.total_vested)]),
          row(["Buyback mechanism", isBad ? "Flat S$1 for ALL vested Options" : "(0.20 × FMV − Exercise Price) per Option"]),
          row(["FMV (reference)", fmt.sgd(valuation.fmv, 4)]),
          row(["Exercise price (reference)", fmt.sgd(valuation.exercise_price, 4)]),
          row(["Per-Option buyback", isBad ? "—" : fmt.sgd(scen.good.per_option, 4)]),
          row(["Total consideration", isBad ? fmt.sgd(1) : fmt.sgd(scen.good.total)])
        )
      ),
      elt("h2", null, "Exercised Employee Shares"),
      elt("p", null, isBad
        ? "Per-share buyback: MIN(10% × FMV, 10% × your original cost per share) — materially below FMV."
        : "Per-share buyback: MAX(FMV, your original cost per share). You keep your gain."),
      elt("h2", null, "Next steps"),
      elt("p", null, "Reply to the Committee within ", elt("strong", null, "14 days"), " to confirm banking details and settlement instructions. Funds will be remitted within 30 days thereafter. You may, within the same 14-day window, appeal the leaver determination in writing to the Committee."),
      elt("div", { class: "stamp" }, "This notice has been issued within 30 days of your last day of employment as required by Clause 11.3. The Committee's determination stands unless successfully appealed."),
      elt("div", { class: "sig" },
        elt("div", null, elt("div", { class: "lbl" }, "For the Committee"), elt("div", null, "Derrick Teo · Chen Zaoxiang · Lim Yong Ciat")),
        elt("div", null, elt("div", { class: "lbl" }, "Acknowledged"), elt("div", null, holder.name))
      ),
      docFooter()
    );
  }

  // ---------- Helpers ---------------------------------------------------
  function row(cells) {
    const tr = elt("tr");
    cells.forEach((c, i) => { const td = elt("td", { class: i === cells.length - 1 ? "num" : "" }, String(c)); tr.appendChild(td); });
    return tr;
  }

  function shift(iso, months, days) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (months) d.setMonth(d.getMonth() + months);
    if (days) d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }

  // Present a document in a modal overlay + download / print controls.
  function present(docElement, { title, holder, docType, fy } = {}) {
    injectStyles();
    const overlay = document.createElement("div");
    overlay.setAttribute("style",
      "position:fixed; inset:0; background: rgba(14,26,44,0.78); z-index: 500; overflow:auto; padding: 40px 20px;");
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close ×";
    closeBtn.setAttribute("style", "position: absolute; top: 16px; right: 24px; background: transparent; border: 1px solid #F3EDDB; color: #F3EDDB; padding: 8px 14px; font-family: 'Inter', sans-serif; letter-spacing: 0.14em; text-transform: uppercase; font-size: 11px; cursor: pointer;");
    closeBtn.onclick = () => overlay.remove();

    const toolbar = document.createElement("div");
    toolbar.setAttribute("style", "max-width: 780px; margin: 0 auto 14px; display: flex; justify-content: space-between; align-items: center; color: #F3EDDB; font-family: 'Inter', sans-serif; font-size: 12px;");
    const ttl = document.createElement("div");
    ttl.textContent = title || "Document preview";
    ttl.setAttribute("style", "letter-spacing: 0.1em; text-transform: uppercase;");
    const actions = document.createElement("div");
    const printBtn = mkToolBtn("Print", () => window.print());
    const pdfBtn = mkToolBtn("Download PDF", async () => {
      pdfBtn.disabled = true; pdfBtn.textContent = "Rendering…";
      try { await saveAsPDF(docElement, buildFilename(docType, holder, fy)); }
      finally { pdfBtn.disabled = false; pdfBtn.textContent = "Download PDF"; }
    });
    actions.appendChild(printBtn); actions.appendChild(pdfBtn);
    toolbar.appendChild(ttl); toolbar.appendChild(actions);

    const sheetWrap = document.createElement("div");
    sheetWrap.setAttribute("style", "position: relative;");
    sheetWrap.appendChild(docElement);

    overlay.appendChild(closeBtn);
    overlay.appendChild(toolbar);
    overlay.appendChild(sheetWrap);
    document.body.appendChild(overlay);

    // Emit document_issued event for audit trail
    if (window.ESOPStore && holder) {
      window.ESOPStore.emit("document_issued", { doc_type: docType, holder_id: holder.id, fy });
    }
  }

  function mkToolBtn(label, onClick) {
    const b = document.createElement("button");
    b.textContent = label;
    b.onclick = onClick;
    b.setAttribute("style", "background: #A8863A; color: #0D1A2C; border: 0; padding: 8px 14px; font-family: 'Inter', sans-serif; letter-spacing: 0.14em; text-transform: uppercase; font-size: 11px; cursor: pointer; margin-left: 8px; font-weight: 600;");
    return b;
  }

  function buildFilename(docType, holder, fy) {
    const parts = ["Elitez-ESOP", docType, holder && holder.name.replace(/\s+/g, "_"), fy].filter(Boolean);
    return parts.join("_") + ".pdf";
  }

  // Tunable for size vs. fidelity on text-heavy documents.
  // JPEG at 0.85 on a 1.6x canvas averages ~80–160 KB per page — readable,
  // dramatically smaller than PNG (which was producing ~13 MB per page).
  const PDF_QUALITY = {
    single: { scale: 1.8, jpegQuality: 0.90 },
    bulk:   { scale: 1.5, jpegQuality: 0.82 }
  };

  async function saveAsPDF(element, filename) {
    if (!window.html2canvas || !(window.jspdf || window.jsPDF)) {
      alert("PDF libraries not loaded.");
      return;
    }
    const q = PDF_QUALITY.single;
    const canvas = await window.html2canvas(element, { scale: q.scale, backgroundColor: "#ffffff", useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", q.jpegQuality);
    const { jsPDF } = window.jspdf || {};
    const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 48;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    if (imgHeight < pageHeight - 48) {
      pdf.addImage(imgData, "JPEG", 24, 24, imgWidth, imgHeight, undefined, "FAST");
    } else {
      let remaining = imgHeight;
      let position = 0;
      let onFirst = true;
      while (remaining > 0) {
        if (!onFirst) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 24, 24 - position, imgWidth, imgHeight, undefined, "FAST");
        remaining -= pageHeight - 48;
        position += pageHeight - 48;
        onFirst = false;
      }
    }
    pdf.save(filename);
  }

  // =====================================================================
  // NEW DOCUMENT GENERATORS (workflow closing-the-loop)
  // =====================================================================

  function acceptanceForm(holder, grant, acceptance, valuation) {
    injectStyles();
    const fmv = (valuation || window.ESOPCalc.activeValuation()).fmv;
    const ex = (valuation || window.ESOPCalc.activeValuation()).exercise_price;
    const refNo = `ACC / ${grant.fy} / ${String(holder.id).padStart(3, "0")}`;
    const docId = `acceptance-${holder.id}-${grant.fy}`;
    return elt("div", { class: "doc-sheet", id: docId },
      header(refNo),
      elt("h1", null, "Acceptance Form — Elitez ESOP"),
      elt("p", null, `Date of acceptance: ${fmt.date((acceptance.accepted_at || "").slice(0, 10))}`),
      elt("p", null, `By: `, elt("strong", null, holder.name), ` (${holder.ic}) — ${holder.title}, ${holder.dept}`),
      elt("h2", null, "Declaration"),
      elt("p", null,
        "I, ", elt("strong", null, holder.name),
        ", having read ", elt("strong", null, "The Elitez Employee Share Option Plan"),
        " (adopted 5 Oct 2025) and the Letter of Offer issued to me in respect of ",
        elt("strong", null, grant.fy), ", hereby unconditionally accept the grant of ",
        elt("strong", null, fmt.num(grant.qty) + " Options"),
        " on the terms set forth therein."
      ),
      elt("h2", null, "Grant details (as accepted)"),
      elt("dl", null,
        dlPair("Grant reference", grant.fy + " · " + fmt.date(grant.grant_date)),
        dlPair("Options granted", fmt.num(grant.qty)),
        dlPair("Underlying", "Series A Preference Shares"),
        dlPair("FMV at grant", fmt.sgd(fmv, 4) + " per share"),
        dlPair("Exercise price", fmt.sgd(ex, 4) + " per share"),
        dlPair("Vesting", "12-month cliff 20%; 48-month monthly thereafter"),
        dlPair("First exercise window", fmt.date(shift(grant.grant_date, 60)))
      ),
      elt("h2", null, "Consideration"),
      elt("p", null,
        "Payment of ", elt("strong", null, "S$1.00"),
        " has been remitted via ",
        acceptance.payment_method === "cheque" ? "cheque" : "PayNow",
        " with reference ",
        elt("strong", null, acceptance.payment_ref || "—"),
        "."
      ),
      elt("h2", null, "Acknowledgements"),
      elt("p", null, "By accepting, I confirm that:"),
      elt("ul", { style: "margin: 8px 0 8px 20px; font-family: Inter, sans-serif; font-size: 13px; line-height: 1.6;" },
        elt("li", null, "I have read and understood the Plan and the Letter of Offer."),
        elt("li", null, "I understand the Options are personal, non-transferable, and lapse if unvested on termination."),
        elt("li", null, "I understand the information disclosed to me is confidential under Clause 15 of the Plan."),
        elt("li", null, "I understand that exercise will create a Singapore taxable employment-income event.")
      ),
      elt("div", { class: "stamp" }, "Digitally signed via the Elitez ESOP platform. This Acceptance Form is recorded in the Plan audit log and, together with the Letter of Offer, constitutes a binding contract between the holder and Elitez Group Pte. Ltd."),
      elt("div", { class: "sig" },
        elt("div", null,
          elt("div", { class: "lbl" }, "Signed by the Holder"),
          elt("div", { style: "font-family: 'Fraunces', serif; font-style: italic; font-size: 20px; color: #0E2640; margin-top: 4px;" }, acceptance.signed_name || holder.name),
          elt("div", { style: "font-size: 10px; color: #5B6878; margin-top: 4px;" }, "Typed signature via platform, " + fmt.date((acceptance.accepted_at || "").slice(0, 10)))
        ),
        elt("div", null,
          elt("div", { class: "lbl" }, "Countersigned for EGPL"),
          elt("div", null, "To be confirmed by the Company Secretary")
        )
      ),
      docFooter()
    );
  }

  function noticeOfExercise(holder, grant, exercise, valuation) {
    injectStyles();
    const v = valuation || window.ESOPCalc.activeValuation();
    const refNo = `NEX / ${grant.fy} / ${String(holder.id).padStart(3, "0")} / ${(exercise.submitted_at || "").slice(0, 10).replace(/-/g, "")}`;
    const docId = `notice-of-exercise-${holder.id}-${grant.fy}`;
    const perq = exercise.qty * (exercise.fmv_at_submission - exercise.exercise_price);
    return elt("div", { class: "doc-sheet", id: docId },
      header(refNo),
      elt("h1", null, "Notice of Exercise"),
      elt("p", null, `Submitted: ${fmt.date((exercise.submitted_at || "").slice(0, 10))}`),
      elt("p", null, `By: `, elt("strong", null, holder.name), ` (${holder.ic}) — ${holder.title}, ${holder.dept}`),
      elt("p", null,
        "Pursuant to Clause 10 of The Elitez Employee Share Option Plan, I hereby give formal notice of my intent to exercise the vested Options from my ",
        elt("strong", null, grant.fy + " grant"),
        ", on the terms set out below, in whole and not in part."
      ),
      elt("h2", null, "Exercise details"),
      elt("table", { class: "fig" },
        elt("tbody", null,
          row(["FY / grant date", grant.fy + " · " + fmt.date(grant.grant_date)]),
          row(["Options being exercised", fmt.num(exercise.qty)]),
          row(["FMV at submission", fmt.sgd(exercise.fmv_at_submission, 4) + " / share"]),
          row(["Exercise price", fmt.sgd(exercise.exercise_price, 4) + " / share"]),
          row(["Total consideration", fmt.sgd(exercise.cost)]),
          row(["Gross value received", fmt.sgd(exercise.qty * exercise.fmv_at_submission)]),
          row(["Taxable perquisite (SG)", fmt.sgd(perq)])
        )
      ),
      elt("h2", null, "Payment"),
      elt("p", null,
        "Payment of ", elt("strong", null, fmt.sgd(exercise.cost)),
        " has been remitted via ",
        exercise.payment_method === "cheque" ? "cheque" : "PayNow",
        " with reference ", elt("strong", null, exercise.payment_ref || "—"),
        ". The Trustee (Lim Yong Ciat) will confirm receipt separately and register the corresponding Series A Preference Shares within 10 Business Days of confirmation, in accordance with Clause 10.11."
      ),
      elt("h2", null, "Tax acknowledgment"),
      elt("p", null,
        "I understand that the sum of ", elt("strong", null, fmt.sgd(perq)),
        " (being 90% of FMV × shares exercised) will be reported as employment income for Singapore tax purposes in respect of the relevant Year of Assessment, and that Elitez Group Pte. Ltd. will issue the corresponding IRAS Appendix 8B."
      ),
      elt("div", { class: "stamp" }, "Submitted and digitally signed via the Elitez ESOP platform. This Notice is whole-not-partial and irrevocable once the Trustee confirms receipt of payment. Status at issuance: " + (exercise.status || "submitted") + "."),
      elt("div", { class: "sig" },
        elt("div", null,
          elt("div", { class: "lbl" }, "Signed by the Holder"),
          elt("div", { style: "font-family: 'Fraunces', serif; font-style: italic; font-size: 20px; color: #0E2640; margin-top: 4px;" }, exercise.signed_name || holder.name),
          elt("div", { style: "font-size: 10px; color: #5B6878; margin-top: 4px;" }, "Via platform, " + fmt.date((exercise.submitted_at || "").slice(0, 10)))
        ),
        elt("div", null,
          elt("div", { class: "lbl" }, "Confirmed by the Trustee"),
          elt("div", null, exercise.confirmed_by_name || "Lim Yong Ciat (pending)")
        )
      ),
      docFooter()
    );
  }

  function appendix8B(holder, grant, exercise) {
    injectStyles();
    const perq = exercise.qty * (exercise.fmv_at_submission - exercise.exercise_price);
    const ya = new Date(exercise.confirmed_at || exercise.submitted_at).getFullYear() + 1;
    const refNo = `8B / ${ya} / ${String(holder.id).padStart(3, "0")}`;
    const docId = `appendix-8b-${holder.id}-${grant.fy}`;
    return elt("div", { class: "doc-sheet", id: docId },
      header(refNo),
      elt("h1", null, "Appendix 8B — Share Option Plan"),
      elt("p", { style: "font-size: 12px; color: #5B6878; margin-top: -8px;" },
        "Information on gains from the exercise of stock options, for the Year of Assessment ",
        elt("strong", null, String(ya)),
        " (for the employee's personal tax return)."
      ),
      elt("h2", null, "Employee"),
      elt("dl", null,
        dlPair("Name", holder.name),
        dlPair("Identification number", holder.ic),
        dlPair("Nationality", holder.nat),
        dlPair("Employer", "Elitez Group Pte. Ltd."),
        dlPair("Position", holder.title + ", " + holder.dept)
      ),
      elt("h2", null, "Plan details"),
      elt("dl", null,
        dlPair("Plan name", "The Elitez Employee Share Option Plan"),
        dlPair("Plan commencement", "5 October 2025"),
        dlPair("Underlying share", "Series A Preference Shares (1:1 to Ordinary on Exit)"),
        dlPair("Grant reference", grant.fy + " · " + fmt.date(grant.grant_date))
      ),
      elt("h2", null, "Exercise particulars"),
      elt("table", { class: "fig" },
        elt("tbody", null,
          row(["Exercise date", fmt.date((exercise.confirmed_at || exercise.submitted_at || "").slice(0, 10))]),
          row(["Number of shares exercised", fmt.num(exercise.qty)]),
          row(["FMV per share at exercise", fmt.sgd(exercise.fmv_at_submission, 4)]),
          row(["Exercise price per share", fmt.sgd(exercise.exercise_price, 4)]),
          row(["Gain per share (FMV − EP)", fmt.sgd(exercise.fmv_at_submission - exercise.exercise_price, 4)]),
          row(["Total taxable gain", fmt.sgd(perq)])
        )
      ),
      elt("h2", null, "Tax treatment"),
      elt("p", null,
        "The total gain of ", elt("strong", null, fmt.sgd(perq)),
        " is taxable as employment income under section 10(1)(b) of the Singapore Income Tax Act. The employee is required to report this gain in the relevant Year of Assessment and any tax payable is due via the normal tax filing process."
      ),
      elt("p", null,
        "This document is provided for the employee's reference. It does not substitute for the filing of IR8A / IR21 by the employer or any return obligations of the employee. For tax advice specific to your circumstances, consult a Singapore-licensed tax advisor."
      ),
      elt("div", { class: "stamp" }, "Issued by Elitez Group Pte. Ltd. as part of post-exercise documentation required under the Singapore employee share plan tax framework."),
      elt("div", { class: "sig" },
        elt("div", null,
          elt("div", { class: "lbl" }, "For the Employer"),
          elt("div", null, "Elitez Group Pte. Ltd. · Finance")
        ),
        elt("div", null,
          elt("div", { class: "lbl" }, "Acknowledged"),
          elt("div", null, holder.name)
        )
      ),
      docFooter()
    );
  }

  function beneficialOwnershipStatement(holder, beneficial) {
    injectStyles();
    const refNo = `BOS / ${String(holder.id).padStart(3, "0")} / ${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;
    const docId = `beneficial-ownership-${holder.id}`;
    const fmv = window.ESOPCalc.currentFMV();
    const totalValue = (beneficial.total_shares || 0) * fmv;
    const costBasis = (beneficial.lots || []).reduce((s, l) => s + l.shares * l.exercise_price, 0);
    const lotRows = (beneficial.lots || []).map(lot =>
      elt("tr", null,
        elt("td", null, lot.fy),
        elt("td", { class: "num" }, fmt.num(lot.shares)),
        elt("td", { class: "num" }, fmt.sgd(lot.fmv, 4)),
        elt("td", { class: "num" }, fmt.sgd(lot.exercise_price, 4)),
        elt("td", { class: "num" }, fmt.sgd(lot.shares * lot.exercise_price)),
        elt("td", null, fmt.date((lot.at || "").slice(0, 10)))
      )
    );
    return elt("div", { class: "doc-sheet", id: docId },
      header(refNo),
      elt("h1", null, "Beneficial Ownership Statement"),
      elt("p", null, `Issued: ${fmt.date(new Date().toISOString().slice(0, 10))}`),
      elt("p", null, `In respect of: `, elt("strong", null, holder.name), ` (${holder.ic})`),
      elt("p", null,
        "This confirms that the holder is the ", elt("strong", null, "beneficial owner"),
        " of ", elt("strong", null, fmt.num(beneficial.total_shares || 0) + " Series A Preference Shares"),
        " in Elitez Group Pte. Ltd., held in trust by ", elt("strong", null, "Lim Yong Ciat (Trustee)"),
        ", pursuant to The Elitez Employee Share Option Plan."
      ),
      elt("h2", null, "Share holdings, by lot"),
      elt("table", { class: "fig" },
        elt("thead", null,
          elt("tr", null,
            elt("th", null, "Lot origin"),
            elt("th", { class: "num" }, "Shares"),
            elt("th", { class: "num" }, "FMV at exercise"),
            elt("th", { class: "num" }, "Exercise price"),
            elt("th", { class: "num" }, "Cost basis"),
            elt("th", null, "Registered")
          )
        ),
        elt("tbody", null, ...lotRows)
      ),
      elt("h2", null, "Current position (at today's FMV " + fmt.sgd(fmv, 4) + ")"),
      elt("dl", null,
        dlPair("Total shares beneficially owned", fmt.num(beneficial.total_shares || 0)),
        dlPair("Total cost basis", fmt.sgd(costBasis)),
        dlPair("Current fair market value", fmt.sgd(totalValue)),
        dlPair("Unrealised gain", fmt.sgd(totalValue - costBasis))
      ),
      elt("h2", null, "Rights attaching to beneficial ownership"),
      elt("ul", { style: "margin: 8px 0 8px 20px; font-family: Inter, sans-serif; font-size: 13px; line-height: 1.6;" },
        elt("li", null, "Dividends: pro-rata entitlement to all dividends declared on Series A Preference Shares."),
        elt("li", null, "Exit proceeds: pro-rata participation in any IPO, Trade Sale or Change of Control (Clause 10)."),
        elt("li", null, "Trading window: entitled to submit bid/ask during the annual 16–31 January window."),
        elt("li", null, "Conversion: automatic 1:1 conversion to Ordinary Shares on Exit Event."),
        elt("li", null, elt("strong", null, "No voting rights"), " — Series A Preference Shares are economic-only (Clause 5.7).")
      ),
      elt("div", { class: "stamp" }, "This statement is issued by the Trustee for the holder's records and is confidential under Clause 15. It does not substitute for the register of members maintained by Elitez Group Pte. Ltd."),
      elt("div", { class: "sig" },
        elt("div", null,
          elt("div", { class: "lbl" }, "Plan Trustee"),
          elt("div", null, "Lim Yong Ciat · CFO, EGPL")
        ),
        elt("div", null,
          elt("div", { class: "lbl" }, "Beneficial Owner"),
          elt("div", null, holder.name)
        )
      ),
      docFooter()
    );
  }

  function annualStatement(holder, asOfDate) {
    injectStyles();
    const C = window.ESOPCalc;
    const asOf = asOfDate || C.AS_OF.toISOString().slice(0, 10);
    const year = asOf.slice(0, 4);
    const refNo = `AS / ${year} / ${String(holder.id).padStart(3, "0")}`;
    const docId = `annual-statement-${holder.id}-${year}`;
    const sum = C.summarizeHolder(holder);
    const fmv = C.currentFMV();
    const ex = C.currentExercisePrice();
    const state = window.ESOPStore ? window.ESOPStore.state() : {};
    const myBenef = (state.beneficial || {})[holder.id] || { total_shares: 0, lots: [] };
    const myExercises = (state.exercises || []).filter(x => x.holder_id === holder.id);
    const grantRows = holder.grants.map(g => {
      const v = g.grant_date ? C.vestingFor(g.grant_date) : null;
      const vested = v ? Math.floor(g.qty * v.vested_pct) : 0;
      return elt("tr", null,
        elt("td", null, g.fy),
        elt("td", null, g.grant_date ? fmt.date(g.grant_date) : "—"),
        elt("td", { class: "num" }, fmt.num(g.qty)),
        elt("td", { class: "num" }, fmt.num(vested)),
        elt("td", { class: "num" }, fmt.sgd(vested * fmv)),
        elt("td", null, g.status === "draft" ? "Draft" : "Active")
      );
    });
    const exRows = myExercises.map(x =>
      elt("tr", null,
        elt("td", null, x.fy),
        elt("td", null, fmt.date((x.submitted_at || "").slice(0, 10))),
        elt("td", { class: "num" }, fmt.num(x.qty)),
        elt("td", { class: "num" }, fmt.sgd(x.cost)),
        elt("td", { class: "num" }, fmt.sgd(x.qty * x.fmv_at_submission)),
        elt("td", null, x.status)
      )
    );
    const nodes = [
      header(refNo),
      elt("h1", null, "Annual Statement — FY" + year),
      elt("p", null, `As at: ${fmt.date(asOf)}`),
      elt("p", null, `For: `, elt("strong", null, holder.name), ` (${holder.ic}) — ${holder.title}, ${holder.dept}`),
      elt("h2", null, "Summary of your position"),
      elt("table", { class: "fig" },
        elt("tbody", null,
          row(["Total options granted (active)", fmt.num(sum.active_granted)]),
          row(["Vested today", fmt.num(sum.total_vested) + ` (${fmt.pct(sum.vested_pct)})`]),
          row(["Unvested", fmt.num(sum.total_unvested)]),
          row(["Cost to exercise vested", fmt.sgd(sum.exercise_cost_vested_today)]),
          row(["Value of vested at current FMV", fmt.sgd(sum.value_vested_today)]),
          row(["Exercised shares held (beneficial)", fmt.num(myBenef.total_shares || 0)])
        )
      ),
      elt("h2", null, "Your grants"),
      elt("table", { class: "fig" },
        elt("thead", null,
          elt("tr", null,
            elt("th", null, "FY"), elt("th", null, "Granted"), elt("th", { class: "num" }, "Qty"),
            elt("th", { class: "num" }, "Vested"), elt("th", { class: "num" }, "FMV value"),
            elt("th", null, "Status")
          )
        ),
        elt("tbody", null, ...grantRows)
      )
    ];
    if (myExercises.length) {
      nodes.push(elt("h2", null, "Exercises in period"));
      nodes.push(elt("table", { class: "fig" },
        elt("thead", null,
          elt("tr", null,
            elt("th", null, "FY"), elt("th", null, "Date"), elt("th", { class: "num" }, "Shares"),
            elt("th", { class: "num" }, "Cost"), elt("th", { class: "num" }, "FMV value"), elt("th", null, "Status")
          )
        ),
        elt("tbody", null, ...exRows)
      ));
    }
    nodes.push(elt("h2", null, "Valuation & Plan highlights this year"));
    nodes.push(elt("ul", { style: "margin: 8px 0 8px 20px; font-family: Inter, sans-serif; font-size: 13px; line-height: 1.6;" },
      elt("li", null, "Current FMV: " + fmt.sgd(fmv, 4) + " per share (FY" + year + " audit)."),
      elt("li", null, "Exercise price: " + fmt.sgd(ex, 4) + " per share (90% discount to FMV)."),
      elt("li", null, "Pool authorised: " + fmt.num(C.D.pool.authorised) + " options; " + fmt.pct(C.poolUsage().used_pct) + " committed."),
      elt("li", null, "Your exercise window opens on the 5-year anniversary of your grant.")
    ));
    nodes.push(elt("div", { class: "stamp" }, "Summary statement. Not a legal register. For authoritative positions, refer to the Trustee's Beneficial Ownership Statement and the Company's register of members."));
    nodes.push(elt("div", { class: "sig" },
      elt("div", null,
        elt("div", { class: "lbl" }, "Issued by the Committee"),
        elt("div", null, "For the Plan — EGPL")
      ),
      elt("div", null,
        elt("div", { class: "lbl" }, "Holder"),
        elt("div", null, holder.name)
      )
    ));
    nodes.push(docFooter());
    return elt("div", { class: "doc-sheet", id: docId }, ...nodes);
  }

  function specialDividendLetter(holder, dividend) {
    injectStyles();
    const activeGranted = holder.grants.filter(g => g.status !== "draft").reduce((s, g) => s + g.qty, 0);
    const entitlement = activeGranted * dividend.per_share;
    const refNo = `SDIV / ${String(holder.id).padStart(3, "0")} / ${(dividend.declared || "").replace(/-/g, "")}`;
    const docId = `special-dividend-${holder.id}`;
    return elt("div", { class: "doc-sheet", id: docId },
      header(refNo),
      elt("h1", null, "Special Dividend — Notice of Entitlement"),
      elt("p", null, `Declared: ${fmt.date(dividend.declared)}`),
      elt("p", null, `To: `, elt("strong", null, holder.name), ` — ${holder.title}, ${holder.dept}`),
      elt("p", null,
        "Further to the Company's sale/disposal described below, the Committee has declared a special dividend. As a current Option Holder, you are entitled to the amount set out overleaf, subject to the condition that you exercise your vested Options within the specified window."
      ),
      elt("h2", null, "Source of dividend"),
      elt("dl", null,
        dlPair("Name", dividend.name),
        dlPair("Declared", fmt.date(dividend.declared)),
        dlPair("Trigger", dividend.trigger),
        dlPair("Gross proceeds", fmt.sgd(dividend.gross)),
        dlPair("Distributable to shareholders", fmt.sgd(dividend.distributable)),
        dlPair("ESOP pool from EGPL share", fmt.sgd(dividend.esop_pool))
      ),
      elt("h2", null, "Your entitlement"),
      elt("table", { class: "fig" },
        elt("tbody", null,
          row(["Per-share dividend", fmt.sgd(dividend.per_share, 4)]),
          row(["Your active options", fmt.num(activeGranted)]),
          row(["Your notional entitlement", fmt.sgd(entitlement, 2)]),
          row(["Eligibility", dividend.condition || "Subject to exercise within stated window."])
        )
      ),
      elt("div", { class: "stamp" }, "This is a notice of entitlement, not a payment advice. Payment will be made to the Trustee upon satisfaction of the eligibility condition and will flow through to you pro-rata."),
      elt("div", { class: "sig" },
        elt("div", null,
          elt("div", { class: "lbl" }, "For the Committee"),
          elt("div", null, "Derrick Teo · Chen Zaoxiang · Lim Yong Ciat")
        ),
        elt("div", null,
          elt("div", { class: "lbl" }, "Holder"),
          elt("div", null, holder.name)
        )
      ),
      docFooter()
    );
  }

  function tradeTicket(trade, windowObj) {
    injectStyles();
    const C = window.ESOPCalc;
    const buyer = trade.buyer === "EGPL_TREASURY"
      ? { name: "Elitez Group Pte. Ltd. (Treasury)", id: "TREASURY" }
      : C.holders().find(h => h.id === trade.buyer) || { name: "Unknown", id: trade.buyer };
    const seller = C.holders().find(h => h.id === trade.seller) || { name: "Unknown", id: trade.seller };
    const refNo = `TRADE / ${windowObj.name.replace(/\s+/g, "")} / ${String(trade.buyer)}-${String(trade.seller)}`;
    const docId = `trade-${trade.buyer}-${trade.seller}`;
    const value = trade.qty * trade.price;
    return elt("div", { class: "doc-sheet", id: docId },
      header(refNo),
      elt("h1", null, "Trade Confirmation"),
      elt("p", null, `Window: ${windowObj.name} · ${fmt.date(windowObj.opens)} to ${fmt.date(windowObj.closes)}`),
      elt("p", null, `Matched via: `, elt("strong", null, trade.via === "rofr" ? "Company right-of-first-refusal (Clause 8.3)" : "Peer-to-peer matching at ask price")),
      elt("h2", null, "Parties"),
      elt("dl", null,
        dlPair("Buyer", buyer.name),
        dlPair("Seller", seller.name),
        dlPair("Trustee", "Lim Yong Ciat (records beneficial ownership transfer)")
      ),
      elt("h2", null, "Trade terms"),
      elt("table", { class: "fig" },
        elt("tbody", null,
          row(["Quantity", fmt.num(trade.qty) + " shares"]),
          row(["Price", fmt.sgd(trade.price, 4) + " per share"]),
          row(["Total consideration", fmt.sgd(value)]),
          row(["Clearing type", trade.via === "rofr" ? "ROFR" : "Peer"])
        )
      ),
      elt("div", { class: "stamp" }, "Trade cleared at window close. Payment settlement follows the standard peer-to-peer settlement instructions (Trustee-facilitated)."),
      elt("div", { class: "sig" },
        elt("div", null,
          elt("div", { class: "lbl" }, "Trustee"),
          elt("div", null, "Lim Yong Ciat")
        ),
        elt("div", null,
          elt("div", { class: "lbl" }, "Authorised by"),
          elt("div", null, "The Committee")
        )
      ),
      docFooter()
    );
  }

  // ======================================================================
  // BULK PDF — stack multiple documents into one multi-page PDF
  // ======================================================================
  async function bulkPdf(items, builder, filename) {
    if (!window.html2canvas || !(window.jspdf || window.jsPDF)) {
      alert("PDF libraries not loaded.");
      return;
    }
    injectStyles();
    const q = PDF_QUALITY.bulk;
    const { jsPDF } = window.jspdf || {};
    const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const offscreen = document.createElement("div");
    offscreen.setAttribute("style", "position: fixed; left: -10000px; top: 0; width: 820px; background: #fff; z-index: -1;");
    document.body.appendChild(offscreen);
    try {
      for (let i = 0; i < items.length; i++) {
        const node = builder(items[i], i);
        if (!node) continue;
        while (offscreen.firstChild) offscreen.removeChild(offscreen.firstChild);
        offscreen.appendChild(node);
        await new Promise(r => setTimeout(r, 60));
        const canvas = await window.html2canvas(node, { scale: q.scale, backgroundColor: "#ffffff", useCORS: true });
        // JPEG + FAST compression = ~100 KB per page vs ~13 MB for PNG.
        // Text remains legible at quality 0.82 on a 1.5x canvas.
        const imgData = canvas.toDataURL("image/jpeg", q.jpegQuality);
        const imgWidth = pageWidth - 48;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        if (i > 0) pdf.addPage();
        if (imgHeight < pageHeight - 48) {
          pdf.addImage(imgData, "JPEG", 24, 24, imgWidth, imgHeight, undefined, "FAST");
        } else {
          let remaining = imgHeight;
          let position = 0;
          let onFirstSlice = true;
          while (remaining > 0) {
            if (!onFirstSlice) pdf.addPage();
            pdf.addImage(imgData, "JPEG", 24, 24 - position, imgWidth, imgHeight, undefined, "FAST");
            remaining -= pageHeight - 48;
            position += pageHeight - 48;
            onFirstSlice = false;
          }
        }
      }
      pdf.save(filename);
    } finally {
      offscreen.remove();
    }
  }

  window.ESOPDocs = {
    letterOfOffer, exerciseInvitation, clawbackNotice,
    acceptanceForm, noticeOfExercise, appendix8B,
    beneficialOwnershipStatement, annualStatement, specialDividendLetter,
    tradeTicket,
    present, bulkPdf, saveAsPDF
  };
})();
