# Simulator-Educational — Pitfalls

```yaml
- id: universal-no-push
  title: "The site that went live but nobody could see"
  severity: high
  phase: shipping
  story: "Edited locally, demoed in browser, didn't git push."
  source: "Universal"
  fix: |
    git add . && git commit -m '...' && git push
  lesson: "GitHub Pages serves from remote, not disk."
  mechanic: null

- id: universal-dark-default
  title: "Another dark-cyan site"
  severity: medium
  phase: planning
  story: "Defaulted to dark-cyan, shipped a site identical to the last 3."
  source: "Universal"
  fix: |
    colors.html with 5 palettes first.
  lesson: "Every brand needs its own personality."
  mechanic: null

- id: universal-stale-og
  title: "The WhatsApp preview showing last week's site"
  severity: medium
  phase: shipping
  story: "Redesigned, shipped, shared — thumbnail stale."
  source: "Universal"
  fix: |
    Regenerate og-image.jpg on visual changes.
  lesson: "OG images cache aggressively."
  mechanic: og-social-meta

- id: universal-no-competitors
  title: "The generic copy"
  severity: medium
  phase: planning
  story: "Skipped competitor research."
  source: "Universal"
  fix: |
    Research 30+ sites, ship admin.html with analysis.
  lesson: "You cannot design better than the best without seeing the best."
  mechanic: null

- id: sim-progress-lost
  title: "The quiz that forgot everything"
  severity: high
  phase: building
  story: "Quiz progress held in JS memory. User closed tab, lost all answers."
  source: "dtws_works v1"
  fix: |
    1. Persist progress to localStorage after every answer.
    2. Hydrate on page load.
    3. Version the storage key (v1, v2) for future migrations.
  lesson: "Learning is long. State must outlive the tab."
  mechanic: localstorage-state

- id: sim-pdf-multipage
  title: "The report that cut off mid-sentence"
  severity: high
  phase: shipping
  story: "jsPDF generated page 1 correctly. Page 2 overlapped content from page 1. Tested only single-page case."
  source: "market_tracker PDF v1"
  fix: |
    1. Test with content that spans 2+ pages explicitly.
    2. Use pagebreak-before CSS or manual addPage() calls with precise Y-offset tracking.
    3. Consider html2canvas + jsPDF combo for complex layouts.
  lesson: "Single-page PDF is not multi-page PDF. Test both."
  mechanic: pdf-pipeline

- id: sim-api-no-limiter
  title: "The yfinance ban"
  severity: critical
  phase: shipping
  story: "No rate limiter on yfinance calls. One user ran 200 queries in 5 minutes. yfinance returned 429 for all subsequent users for 2 hours."
  source: "market_tracker, Apr 2026"
  fix: |
    1. Add a guest rate-limiter: max N calls per session.
    2. Cache responses in memory / localStorage for duration of session.
    3. Show clear 'try again in X seconds' message on limit hit.
  lesson: "External APIs are shared resources. Protect them from your users."
  mechanic: null

- id: sim-no-reset
  title: "The scenario that wouldn't start over"
  severity: medium
  phase: building
  story: "Simulator had no Reset button. User had to refresh the page (losing work) to run a new scenario."
  source: "Early training prototype"
  fix: |
    1. Every simulator has a visible Reset button.
    2. Reset clears only scenario state, not saved progress.
    3. Confirm reset with toast: 'Scenario cleared, progress saved'.
  lesson: "Iteration is the core learning loop. Don't break it."
  mechanic: null

- id: sim-streamlit-no-rerun
  title: "The widget that did nothing"
  severity: medium
  phase: building
  story: "Changed a Streamlit input, result didn't update. Forgot st.rerun() after the state mutation."
  source: "market_tracker"
  fix: |
    1. After any st.session_state mutation that should visually propagate, call st.rerun().
    2. Or restructure to use widgets' native callback-triggered reruns.
  lesson: "Streamlit reactivity is explicit, not magical."
  mechanic: null

- id: sim-patronizing-tone
  title: "The tutorial that lost adults"
  severity: low
  phase: building
  story: "Wrote 'Great job!' after every correct answer. Adult learners bounced — felt like a children's app."
  source: "dtws_works v0"
  fix: |
    1. Treat learners as peers. No 'Great job!'
    2. Feedback is informational, not congratulatory.
    3. Respect the audience's expertise level (set at onboarding).
  lesson: "Tone is a product feature. Mis-tone costs trust."
  mechanic: null
```
