// pdf-generator.js — rasterise each .pdf-page into a single A4 PDF.
//
// Design constraints from the brief:
//   • Full-bleed: backgroundColor: null so each page's CSS background paints
//     edge-to-edge (no white frame around teal cover or cream body).
//   • ≤ 5 MB on the Lumana data set: scale 1.35 + JPEG 0.78 keeps text crisp
//     while clamping a 20-25 page report to roughly 2-4 MB.
//   • Image position 0,0 with full A4 dimensions (210x297mm) — every mm of
//     the canvas lands on the page, zero gutter.
//
// Depends on global html2canvas and jspdf.jsPDF loaded via <script> tags
// in admin/report.html.

const A4_W_MM = 210;
const A4_H_MM = 297;

export async function generatePDF({ root, filename, onProgress }) {
  // eslint-disable-next-line no-undef
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

  // Wait for fonts so the first page doesn't capture in fallback Arial.
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (_) { /* non-fatal */ }
  }

  const pages = root.querySelectorAll('.pdf-page');
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const pg = pages[i];

    // One event-loop tick lets any in-flight Chart.js render flush.
    await new Promise((r) => requestAnimationFrame(r));

    // eslint-disable-next-line no-undef
    const canvas = await html2canvas(pg, {
      scale: 1.35,
      useCORS: true,
      backgroundColor: null, // full-bleed: preserve element's own background
      logging: false,
      width: pg.offsetWidth,
      height: pg.offsetHeight,
      windowWidth: pg.offsetWidth,
      windowHeight: pg.offsetHeight,
    });

    // JPEG 0.78 — visually indistinguishable from PNG at 1.35x scale,
    // ~10x smaller. White JPEG fill is fine because the canvas already
    // contains the page's full-bleed background.
    const imgData = canvas.toDataURL('image/jpeg', 0.78);

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, A4_H_MM, undefined, 'FAST');
    onProgress?.(i + 1, total);
  }

  pdf.save(filename);
}
