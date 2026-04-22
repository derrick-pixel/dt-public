/* ==========================================================
   THE COMMONS — CSV export helper
   ---------------------------------------------------------
   RFC 4180 quoting. Fields with comma/quote/newline get
   wrapped in "…" and embedded quotes doubled.
   ========================================================== */

(function () {
  'use strict';

  function _escape(v) {
    if (v == null) return '';
    const s = String(v);
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function toCSV(rows, columns) {
    if (!rows || !rows.length) return '';
    const keys = columns || Object.keys(rows[0]);
    const header = keys.map(_escape).join(',');
    const body = rows.map(r => keys.map(k => _escape(r[k])).join(',')).join('\r\n');
    return header + '\r\n' + body;
  }

  function download(filename, rows, columns) {
    const csv = toCSV(rows, columns);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  window.TCExport = { toCSV: toCSV, download: download };
})();
