// Elitez ESOP — admin console sub-tab filter.
// Reads the URL hash and shows only sections whose data-tab attribute
// matches. Sections without a data-tab attribute remain visible on every
// tab (e.g. the workflow ribbon at the top).
//
// Race conditions to handle:
//   1. Some admin modules (admin-roster, admin-payments, activity-log)
//      attach sections in async init() functions that finish AFTER this
//      script runs.
//   2. admin.js appends sections FIRST then sets their data-tab attribute
//      via setAttribute() afterwards, so a node may appear in the DOM
//      momentarily without the tag.
// Both are covered by watching both childList and data-tab attribute
// changes, plus a couple of defensive setTimeouts.

(function () {
  const TABS = ["overview", "holders", "valuations", "documents", "roster", "payments", "activity", "audit"];
  const DEFAULT_TAB = "overview";

  function activeTab() {
    const h = (location.hash || "").replace(/^#/, "").toLowerCase();
    return TABS.includes(h) ? h : DEFAULT_TAB;
  }

  function filter() {
    const tab = activeTab();
    document.querySelectorAll("[data-tab]").forEach(node => {
      const t = node.getAttribute("data-tab");
      const tags = t.split(",").map(x => x.trim());
      node.style.display = tags.includes(tab) ? "" : "none";
    });
    document.querySelectorAll(".subtabs a[data-subtab]").forEach(a => {
      a.classList.toggle("active", a.getAttribute("data-subtab") === tab);
    });
  }

  function filterAndScroll() {
    filter();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  window.addEventListener("hashchange", filterAndScroll);

  // Coalesce bursts of mutations into a single rAF-paced filter pass.
  let pending = false;
  function scheduleFilter() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; filter(); });
  }

  const observer = new MutationObserver(() => scheduleFilter());
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-tab"],
  });

  filter();
  setTimeout(filter, 500);
  setTimeout(filter, 1500);

  window.ESOPAdminTabs = { refresh: filter };
})();
