# semantic-html-audit — example use

This mechanic ships in two surfaces: a browser dev banner (drop-in script tag) and a Node CLI (for batch audits across the shipped fleet).

## Surface 1 — Browser dev banner

Same UX as `a11y-axe-runner`. Activates on `localhost` or `?audit=1`.

```html
<!-- in <head> of every page -->
<script src="/assets/js/semantic-html-audit.js" defer></script>
```

When violations exist:
- Yellow banner pinned to top of viewport: `[semantic-html-audit] 7 violation(s) — score 64 — 2 high, 3 medium — see console`
- Console group: table of violations + stats object

When clean:
- Console: `[semantic-html-audit] 0 violations · score 100`
- No banner.

## Surface 2 — Node CLI

```bash
# one file
node mechanics/semantic-html-audit/cli.js ../lumana/index.html

# one site (walks all .html)
node mechanics/semantic-html-audit/cli.js ../lumana/

# human-readable summary
node mechanics/semantic-html-audit/cli.js ../lumana/ --format=summary
```

Sample output (summary mode, simulated):

```
=== ../lumana/index.html ===
Score: 58 · 7 violation(s)
  [high] seo-no-jsonld — No JSON-LD structured data on page
  [high] seo-multiple-h1 — 2 <h1> elements (should be exactly 1)
  [high] seo-img-no-alt — 4 <img> missing alt attribute
  [medium] seo-img-no-dimensions — 6 <img> missing width/height (CLS risk)
  [medium] seo-no-lang-attr — <html> missing lang attribute
  [medium] seo-thin-content — <main> has 87 words (target ≥100; ≥300 ideal)
  [low] seo-no-internal-links — Only 1 internal link(s) (target ≥3)

=== ../lumana/pricing.html ===
Score: 72 · 4 violation(s)
  [high] seo-no-jsonld — No JSON-LD structured data on page
  [medium] seo-img-no-dimensions — 3 <img> missing width/height (CLS risk)
  [medium] seo-no-lang-attr — <html> missing lang attribute
  [low] seo-no-internal-links — Only 2 internal link(s) (target ≥3)

Average score across 2 file(s): 65.0
```

## Surface 3 — Programmatic JSON

For automation (Agent 7, scripts):

```bash
node mechanics/semantic-html-audit/cli.js ../lumana/index.html
```

Returns:

```json
{
  "file": "../lumana/index.html",
  "score": 58,
  "violations": [
    { "id": "seo-no-jsonld", "severity": "high", "message": "No JSON-LD structured data on page" },
    { "id": "seo-multiple-h1", "severity": "high", "message": "2 <h1> elements (should be exactly 1)", "count": 2 }
  ],
  "stats": {
    "h1_count": 2,
    "heading_count": 12,
    "img_count": 8,
    "img_missing_alt": 4,
    "img_missing_dimensions": 6,
    "internal_links": 1,
    "word_count": 87,
    "jsonld_blocks": 0,
    "has_main": true,
    "has_header": true,
    "has_footer": true,
    "has_nav": true,
    "has_lang_attr": false,
    "title_chars": 24,
    "meta_desc_chars": 0
  }
}
```

## Agent 7 batch-audit recipe

```bash
# audit every shipped site
SITES=(altru passage lumana elix-eor xinceai elitez-pulse aevum-mri ecotech)
for site in "${SITES[@]}"; do
  echo "=== $site ==="
  node mechanics/semantic-html-audit/cli.js "../$site/index.html" --format=summary
done > /tmp/fleet-audit-$(date +%Y%m%d).txt
```

Then triage by score: anything <70 is a priority fix; anything <50 is critical.

## How Agent 7 uses violations

Each violation maps 1:1 to a known pitfall id (the same ids in `archetypes/static-informational/pitfalls.md`). Agent 7 doesn't propose new pitfalls from these — they're already in the library. Instead Agent 7 proposes **site-level fixes** in `qa-report.json.fix_proposals[]`:

```json
{
  "site": "lumana",
  "page": "index.html",
  "violation": "seo-multiple-h1",
  "fix": "Demote second <h1> (Section 'How it works') to <h2>. Section already lives inside a <section>; the h1 is contributing nothing structurally.",
  "estimated_effort": "5 min",
  "files_to_edit": ["lumana/index.html:142"]
}
```

These fix proposals are what feed Week 4's "fix top 5 sites" effort.
