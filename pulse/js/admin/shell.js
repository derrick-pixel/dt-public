const TABS = ["leads", "commission", "packages", "competitors", "insights", "templates", "settings"];

async function loadTab(id) {
  if (!TABS.includes(id)) id = "leads";
  document.querySelectorAll(".admin-rail__tab").forEach(t => {
    t.classList.toggle("active", t.dataset.tab === id);
  });
  const main = document.getElementById("main");
  main.textContent = "Loading...";
  try {
    const mod = await import(`./${id}.js?v=1`);
    await mod.render(main);
    history.replaceState(null, "", `#${id}`);
  } catch (e) {
    main.textContent = `Error: ${e.message}`;
    console.error(e);
  }
}

document.querySelectorAll(".admin-rail__tab").forEach(tab => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    loadTab(tab.dataset.tab);
  });
});

document.getElementById("drawer-close")?.addEventListener("click", () => {
  document.getElementById("drawer")?.classList.remove("open");
});

const initial = location.hash.slice(1) || "leads";
loadTab(initial);
