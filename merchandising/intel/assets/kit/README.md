# @elitez/intel-kit

Canonical front-end modules for Elitez competitor-intelligence sites. Consumed
as a **git submodule** — do not copy these files into a consumer repo.

## Layout
- `js/` — ES2020 modules: `app`, `dom`, `format`, `auth-gate`, `viz/*`, `report/*`
- `vendor/` — pinned UMD bundles: Chart.js, html2canvas, jsPDF

## Use in a consumer repo
    git submodule add https://github.com/derrick-pixel/elitez-intel-kit.git kit

Reference `kit/js/app.js`, `kit/vendor/chart.umd.js`, etc. from your HTML.
CSS is **not** part of the kit — each site keeps its own brand stylesheet.

## Versioning
Semver. v1.0.0 = the competitor-intel-template baseline, verbatim.
Consumers pin a commit; bump deliberately via `git submodule update --remote`.

## Tests
    npm test
