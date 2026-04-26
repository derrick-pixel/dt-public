// Elitez ESOP — admin console sub-tab filter.
// Runs AFTER admin.js and admin-workflow.js so that every section has been
// appended. Reads the URL hash and shows only sections whose data-tab matches.
// Sections without a data-tab attribute remain visible on every tab.

(function () {
  const TABS = ["overview", "holders", "valuations", "documents", "audit"];
  const DEFAULT_TAB = "overview";

  function activeTab() {
    const h = (location.hash || "").replace(/^#/, "").toLowerCase();
    return TABS.includes(h) ? h : DEFAULT_TAB;
  }

  function filter() {
    const tab = activeTab();
    document.querySelectorAll("[data-tab]").forEach(node => {
      const t = node.getAttribute("data-tab");
      // A section can be tagged for multiple tabs via comma separation.
      const tags = t.split(",").map(x => x.trim());
      node.style.display = tags.includes(tab) ? "" : "none";
    });
    // Update the sub-tab strip active state
    document.querySelectorAll(".subtabs a[data-subtab]").forEach(a => {
      a.classList.toggle("active", a.getAttribute("data-subtab") === tab);
    });
    // Scroll to top when switching tabs so users don't land mid-section
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  window.addEventListener("hashchange", filter);
  // Run filter once on load. Sections are already appended by the time
  // this script executes because it is the last <script> in admin.html.
  filter();
})();
