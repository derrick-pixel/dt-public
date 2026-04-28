# copy-deck (single source of truth for site copy)

Schema for `copy.json` + DOM-binding helper. Every string the site renders is in `copy.json`; the helper binds keys to elements via `data-copy="..."` attributes. Eliminates hardcoded copy in HTML/JS.

## What it does

1. Defines the canonical `copy.json` schema (see FIELD-DICTIONARY.md):
   - `global` (site-wide: title, tagline, description, company)
   - `pages.<id>` (per-page: hero_headline, hero_subhead, CTAs, sections[])
   - `microcopy` (toasts, form labels, errors, 404)
   - `faq` (Q/A pairs)
2. Provides `bindCopy(target, copy)` — walks the DOM, finds `[data-copy]` attributes, sets the matching string from copy.json.
3. Supports nested keys via dot notation: `data-copy="pages.home.hero_headline"`.
4. Renders Markdown bold + italic + links inline (no library, ~30 lines of vanilla JS).

## When to plug in

Every project, every page. Required by Agent 5 (Copy Writer) and consumed by Agent 4 (UI Composer).

The "no string >12 chars hardcoded in HTML" rule is enforced via Agent 7 (QA Curator) — if it finds a literal headline in HTML during QA, that's a `copy-hardcoded-in-html` pitfall.

## How to use

### In HTML

```html
<h1 data-copy="pages.home.hero_headline"></h1>
<p data-copy="pages.home.hero_subhead"></p>
<button data-copy="pages.home.hero_cta_primary"></button>
<div class="toast" data-copy="microcopy.toast_save_success"></div>
```

### In JS

```js
import { bindCopy } from './assets/js/copy-deck.js';

const res = await fetch('/data/copy.json');
const copy = await res.json();
bindCopy(document.body, copy);
```

That's it. Every `[data-copy]` element gets its text from copy.json.

### Nested data-copy keys

```html
<!-- pages.home.sections[0].heading -->
<h2 data-copy="pages.home.sections.0.heading"></h2>
<!-- pages.home.sections[0].body — body has Markdown -->
<div data-copy-md="pages.home.sections.0.body"></div>
```

`data-copy` sets `textContent` (XSS-safe).
`data-copy-md` parses Markdown bold/italic/links and sets via `textContent` for plain text + safe DOM construction for inline tags.

### Updating copy at runtime

```js
// Change copy after a state transition (e.g., logged-in user)
copy.pages.home.hero_headline = 'Welcome back, ' + user.name;
bindCopy(document.body, copy);
```

## Schema (excerpt — full schema in FIELD-DICTIONARY.md)

```json
{
  "global": {
    "site_title": "Lumana",
    "site_tagline": "Quiet, calm aged-care monitoring",
    "site_description": "Ambient sensors. No cameras. No wearables.",
    "company_name": "Lumana Pte Ltd"
  },
  "pages": {
    "home": {
      "hero_headline": "Quiet, calm aged-care monitoring.",
      "hero_subhead": "Ambient sensors that know when something is off.",
      "hero_cta_primary": "Book a home visit",
      "hero_cta_secondary": "How it works",
      "sections": [
        { "id": "value-prop", "heading": "Three signals.", "body": "Sleep. Movement. Bathroom rhythm." }
      ]
    }
  },
  "microcopy": {
    "toast_save_success": "Saved.",
    "toast_save_error": "Save failed — try again.",
    "form_required": "Required.",
    "404_headline": "Page not found.",
    "loading": "Loading…"
  },
  "faq": [
    { "q": "Why not a CCTV?", "a": "Cameras feel like surveillance. Ambient sensors give the family **enough** without watching." }
  ]
}
```

## Length budgets (enforced by Agent 5)

- `hero_headline`: ≤72 chars
- `hero_subhead`: ≤180 chars
- CTAs: ≤24 chars
- Section heading: ≤72 chars
- Section body paragraph: ≤600 chars
- FAQ Q: ≤120 chars
- FAQ A: ≤500 chars
- `site_description` (= meta description): ≤160 chars

If your copy is longer, the message is hiding in detail. Trim.

## Trade-offs

- **Pro:** Single source of truth. Translation-ready (point to `copy-en.json`, `copy-zh.json`).
- **Pro:** A/B testing is just two copy.json variants.
- **Pro:** Agent 7 can audit `copy-hardcoded-in-html` violations programmatically.
- **Con:** First-paint shows empty elements briefly while copy.json fetches. Mitigation: inline the copy.json into `<head>` at build time, or render placeholder text in HTML and let `bindCopy` overwrite.

## Linked pitfalls

- `copy-hardcoded-in-html` — string >12 chars rendered on the site lives in HTML, not copy.json. Agent 7 grep-audit.
- `copy-headline-too-long` — `hero_headline` >72 chars wraps oddly on mobile.

## Past uses

(new mechanic — first use coming with v2 projects)
