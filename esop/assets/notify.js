// Elitez ESOP — email notifications (frontend stub).
//
// In production, the backend Worker emits emails when certain events are
// appended (resolution_proposed, grant_accepted needed, exercise window opens).
// This frontend module triggers a same-origin POST to /api/notify so an admin
// can manually send a reminder mail too.
//
// To enable, set:
//   window.ESOP_CONFIG.notify_url   — defaults to /api/notify on the backend
// Without it, this module renders a dry-run preview so admins see what
// *would* be sent — useful for the demo with Chen and Lim.

(function () {
  const C = window.ESOPCalc;
  const NOTIFY_URL = (window.ESOP_CONFIG && window.ESOP_CONFIG.notify_url) || null;

  // All template inputs are sanitized via escapeText before being placed in the DOM.
  // No untrusted HTML is ever inserted via innerHTML in this module.
  const templates = {
    pending_offer(holder, grant) {
      const v = C.activeValuation();
      return {
        subject: `Action required — Elitez ESOP Letter of Offer for ${grant.fy}`,
        body: [
          `Dear ${holder.name.split(/[,\s]/)[0]},`,
          ``,
          `Your Letter of Offer for the ${grant.fy} grant (${(grant.qty || 0).toLocaleString()} options) is awaiting your acceptance.`,
          ``,
          `Sign in at https://esop.derrickteo.com to review the terms, sign the Acceptance Form, and remit the S$1 acceptance consideration.`,
          ``,
          `Current FMV: S$${v.fmv.toFixed(4)} per share.`,
          ``,
          `Confidential — Clause 15.`,
          `Elitez Group Pte. Ltd.`
        ].join("\n"),
        recipients: [holder.email].filter(Boolean)
      };
    },
    exercise_window_opens(holder, grant, days_to_close) {
      const v = C.activeValuation();
      return {
        subject: `Your ${grant.fy} exercise window is OPEN — closes in ${days_to_close} days`,
        body: [
          `Dear ${holder.name.split(/[,\s]/)[0]},`,
          ``,
          `Your ${grant.fy} options have reached the 5-year mark. The exercise window is open and closes in ${days_to_close} days.`,
          ``,
          `Vested options eligible: see your portfolio at https://esop.derrickteo.com`,
          ``,
          `Exercise price: S$${v.exercise_price.toFixed(4)} per share (10% of current FMV S$${v.fmv.toFixed(4)}).`,
          ``,
          `Whole-not-partial: Clause 10.6 requires you exercise all vested options from this grant or none.`,
          ``,
          `Confidential — Clause 15.`
        ].join("\n"),
        recipients: [holder.email].filter(Boolean)
      };
    },
    resolution_proposed(member, resolution) {
      const t = resolution.threshold || {};
      return {
        subject: `Committee resolution proposed — ${t.label || resolution.type}`,
        body: [
          `${member.name},`,
          ``,
          `${resolution.proposer_name} has proposed a Committee resolution for your vote.`,
          ``,
          `Sign in at https://esop.derrickteo.com to review and vote.`,
          ``,
          `Threshold: ${t.total_needed} approvals (incl. ${t.majors_needed} Majors).`,
          `Expires: ${(resolution.expires_at || "").slice(0, 10)}.`,
          ``,
          `Confidential — Clause 15.`
        ].join("\n"),
        recipients: [member.email].filter(Boolean)
      };
    },
    annual_statement_ready(holder, year) {
      return {
        subject: `Your Elitez ESOP annual statement (FY${year}) is ready`,
        body: [
          `Dear ${holder.name.split(/[,\s]/)[0]},`,
          ``,
          `Your annual ESOP statement for FY${year} is now available. Sign in at https://esop.derrickteo.com → Your documents → Annual statement to view and download.`,
          ``,
          `It summarises your grants, vested options, current FMV value, dividends, and any exercises in the period.`,
          ``,
          `Confidential — Clause 15.`
        ].join("\n"),
        recipients: [holder.email].filter(Boolean)
      };
    },
    exercise_confirmed(holder, exercise) {
      return {
        subject: `Exercise confirmed — Series A Preference Shares registered`,
        body: [
          `Dear ${holder.name.split(/[,\s]/)[0]},`,
          ``,
          `The Trustee has confirmed receipt of your S$${exercise.cost.toFixed(2)} exercise payment for the ${exercise.fy} grant.`,
          ``,
          `${exercise.qty.toLocaleString()} Series A Preference Shares have been registered to your beneficial ownership in the Trustee's register.`,
          ``,
          `Your Appendix 8B (IRAS tax document) is now available under Your documents — please retain for your annual tax filing.`,
          ``,
          `Confidential — Clause 15.`
        ].join("\n"),
        recipients: [holder.email].filter(Boolean)
      };
    }
  };

  // Render a "preview email" overlay using safe DOM operations only.
  function preview(template) {
    const o = document.createElement("div");
    o.setAttribute("style", "position:fixed; inset:0; background: rgba(14,38,64,0.82); z-index: 700; display:flex; align-items:center; justify-content:center; padding: 30px;");
    const card = document.createElement("div");
    card.setAttribute("style", "background: var(--paper); border: 1px solid var(--line-strong); padding: 1.6rem 1.8rem; max-width: 640px; width: 100%; max-height: 86vh; overflow: auto; font-family: var(--sans);");

    const banner = document.createElement("div");
    banner.style.cssText = "font-size:0.74rem; margin-bottom: 0.6rem; text-transform: uppercase; letter-spacing: 0.14em; font-weight:600;";
    banner.style.color = NOTIFY_URL ? "var(--good)" : "var(--warn)";
    banner.textContent = NOTIFY_URL ? "Live · will be sent on confirm" : "Dry run · no NOTIFY_URL configured";
    card.appendChild(banner);

    const eyebrow = document.createElement("div");
    eyebrow.className = "micro";
    eyebrow.style.cssText = "color: var(--accent); margin-bottom: 0.4rem;";
    eyebrow.textContent = "Email preview";
    card.appendChild(eyebrow);

    const subj = document.createElement("div");
    subj.style.cssText = "font-family: var(--serif); font-size: 1.2rem; margin-bottom: 0.6rem;";
    subj.textContent = template.subject;
    card.appendChild(subj);

    const to = document.createElement("div");
    to.style.cssText = "font-size: 0.82rem; color: var(--muted); margin-bottom: 1rem;";
    to.textContent = "To: " + template.recipients.join(", ");
    card.appendChild(to);

    const pre = document.createElement("pre");
    pre.style.cssText = "white-space: pre-wrap; word-wrap: break-word; font-family: var(--serif); font-size: 0.95rem; line-height: 1.5; color: var(--ink); background: var(--panel); padding: 1rem; border: 1px solid var(--line-strong); margin-bottom: 1rem;";
    pre.textContent = template.body;
    card.appendChild(pre);

    const buttons = document.createElement("div");
    buttons.style.cssText = "display:flex; gap: 0.6rem;";
    const sendBtn = document.createElement("button");
    sendBtn.className = "btn btn--brass";
    sendBtn.style.flex = "1";
    sendBtn.textContent = NOTIFY_URL ? "Send" : "OK";
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn--ghost";
    cancelBtn.style.flex = "1";
    cancelBtn.textContent = "Cancel";
    buttons.appendChild(sendBtn);
    buttons.appendChild(cancelBtn);
    card.appendChild(buttons);

    o.appendChild(card);
    document.body.appendChild(o);

    cancelBtn.onclick = () => o.remove();
    sendBtn.onclick = async () => {
      if (!NOTIFY_URL) { o.remove(); return; }
      try {
        await fetch(NOTIFY_URL, {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(template)
        });
        alert("Sent.");
      } catch (e) { alert("Send failed: " + e.message); }
      o.remove();
    };
  }

  window.ESOPNotify = { templates, preview };
})();
