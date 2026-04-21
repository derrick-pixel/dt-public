// ── dt-site-creator ── yaml-mini.js ─────────────────────────
// Minimal YAML parser for our pitfalls schema only.
// Handles:
//   - list of objects (each starts with "- id: ...")
//   - scalar values: quoted strings, bare strings, "null"
//   - block scalars indicated by " |" (multiline, 4-space indented)
// Does NOT handle: anchors, references, flow syntax, maps in maps.

(function() {
  'use strict';

  function parse(text) {
    const entries = [];
    let current = null;
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('- id:')) {
        if (current) entries.push(current);
        current = { id: line.split(':', 2)[1].trim() };
      } else if (current && line.match(/^\s+\w+:/)) {
        const m = line.match(/^\s+(\w+):\s*(.*)$/);
        if (m) {
          const key = m[1];
          let val = m[2].trim();

          // Quoted string
          if ((val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          // Null literal
          else if (val === 'null') {
            val = null;
          }
          // Block scalar
          else if (val === '|') {
            val = '';
            while (i + 1 < lines.length && lines[i + 1].match(/^\s{4,}/)) {
              i++;
              val += lines[i].replace(/^\s{4}/, '') + '\n';
            }
            val = val.trimEnd();
          }
          // Bare string (leave as-is)

          current[key] = val;
        }
      }
    }
    if (current) entries.push(current);
    return entries;
  }

  window.yamlMini = { parse };
})();
