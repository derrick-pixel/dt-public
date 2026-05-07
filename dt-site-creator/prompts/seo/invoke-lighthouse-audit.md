# Invoke: Lighthouse / Core Web Vitals Audit (SEO Agent 03)

Dispatch with:

```
Agent(
  subagent_type: "general-purpose",
  description: "SEO 03 — Lighthouse audit + Core Web Vitals fixes for {{site_name}}",
  prompt: <paste Body below, with {{placeholders}} filled>
)
```

Use after launch (verify perf is good before announcing) and after major asset changes.

---

## Body

You are dispatched as **SEO Agent 03 (Lighthouse / Core Web Vitals)**.

### Site context

- **Site name:** {{site_name}}
- **Live URL:** {{live_url}}
- **Source repo path:** {{source_repo_path}}
- **Pages to audit:** {{e.g., homepage + /pricing + /founder ; OR all in sitemap.json}}
- **Existing performance state:** {{Lighthouse score known? CWV pass/fail?}}

### Before you begin

Read:
1. `/Users/derrickteo/codings/dt-site-creator/methodology/seo/03-lighthouse-audit.md` — your handbook
2. {{source_repo_path}}/data/sitemap.json — to know which pages count

### Your task

1. Run Lighthouse audit on {{pages}} (mobile preset, throttled CPU). Use either:
   - PageSpeed Insights API: `https://pagespeed.web.dev/analysis?url={{live_url}}` (no install)
   - Lighthouse CLI: `npx lighthouse {{live_url}} --output=json --form-factor=mobile`
2. Parse reports; identify top opportunities by `savings_ms` per page
3. Apply standard fixes in ROI order:
   - Image compression (convert PNG/JPG → WebP @ q80)
   - `loading="lazy"` on below-fold images
   - `<img>` width/height attrs (verify still present)
   - Font display swap + preconnect
   - Defer/async non-critical JS
   - Preload critical resources
4. Re-audit; verify scores improved
5. Write `/data/lighthouse-report.json` capturing before/after scores + applied fixes
6. Commit + push (Cloudflare auto-deploys for dt-public mirrors)

### Files you write

- Image files (compressed WebP versions of existing JPG/PNG)
- HTML files (where `<img>`, `<script>`, `<link>` tags are updated)
- `{{source_repo_path}}/data/lighthouse-report.json`

### When done, report back

- Per-page Lighthouse score deltas (Performance, A11y, Best Practices, SEO)
- LCP / CLS / INP before vs. after
- Fixes applied (with ms-saved estimates)
- Any deferred items (e.g., third-party scripts the human controls)
- Date for next audit (typically 3 months out, OR sooner if assets change)
