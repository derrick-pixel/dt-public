# PDF Pipeline

Capture any DOM element as a multi-page PDF using html2canvas + jsPDF.

## What it does
`html2canvas` rasterizes the target element into a `<canvas>`. `jsPDF` slices that canvas into A4-sized chunks and stitches them into a multi-page PDF with configurable margins. Downloaded via `pdf.save(filename)`.

## When to plug in
- **Simulator / Transactional** (optional): financial analysis reports, invoices, quotations, resumes.
- **Dashboard** (optional): export-as-PDF on data tables / charts.

## Trade-offs
- **Pro:** Client-side, no server. Pixel-perfect reproduction of what the user sees.
- **Pro:** Works with any DOM (complex CSS, Chart.js canvases, images).
- **Con:** ~270KB combined library payload.
- **Con:** Output is rasterized (images, not selectable text). If users need to copy text from the PDF, use a text-based jsPDF approach instead.
- **Con:** Very large reports (50+ pages) slow down the browser.

## How to use (3 steps)

1. Wrap the report content in a single `<div id="report-root">...</div>`.
2. Add a download button: `<button onclick="renderPDF('report-root', { filename: 'q1-report.pdf' })">Download</button>`.
3. **Always test with content that spans 2+ pages** — single-page PDF does not prove multi-page works.

## Options

- `filename` (default `'report.pdf'`)
- `marginMm` (default `10`)

## Linked pitfalls
- `sim-pdf-multipage` — this mechanic handles the slicing correctly, but always test your content at actual page-break boundaries.

## Sourced from
`market-tracker/report-gen.py` (Streamlit/Python equivalent), `studioelitez_quotation_preparer` PDF output.
