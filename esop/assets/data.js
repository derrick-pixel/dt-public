// Elitez ESOP — transitional shim. Loads assets/data.json synchronously into
// window.ESOP_DATA so existing pages keep working unchanged.
// This file is deleted in Task 27 cleanup once the bootstrap migration has
// seeded the Supabase events table.
(function () {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "assets/data.json", false);
  xhr.send();
  if (xhr.status !== 200 && xhr.status !== 0) {
    console.error("Failed to load assets/data.json:", xhr.status);
    return;
  }
  window.ESOP_DATA = JSON.parse(xhr.responseText);
})();
