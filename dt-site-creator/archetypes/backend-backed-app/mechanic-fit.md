# Backend-Backed App — Mechanic Fit

Backend-Backed Apps fit a different mechanic mix than static sites — real auth replaces shared-password gates; persistence pairings shift toward Postgres; SEO and OG mechanics remain universal regardless of whether the page is behind a login wall. The fits below apply ONLY when this archetype scores top; the same mechanics retain their original fits for other archetypes.

| Mechanic | Fit | Why |
|---|---|---|
| magic-link-auth-supabase | core | The default real-auth recipe for this archetype |
| containerized-fastapi-fly | core | The default backend stack for API-heavy projects |
| cf-zero-trust-static-admin | optional | When static admin paths exist alongside the app |
| streamlit-cloud-analytics | optional | When the app is fundamentally a data dashboard |
| admin-auth-gate | rare | Demoted — use real auth; shared-password gate is not auth |
| localstorage-state | optional | Useful for client-side ephemeral state inside an authenticated session |
| pdf-pipeline | optional | Still client-side, still works; useful for doc-gen features |
| chartjs-dashboard | optional | Useful but often superseded by server-side viz or Streamlit |
| paynow-qr | optional | Client-side QR still works for SG payment flows |
| wizard-form | optional | Useful for multi-step onboarding or intake forms |
| favicon | core | Universal — required on every site regardless of archetype |
| og-thumbnail | core | Universal — required on every site regardless of archetype |
| og-social-meta | core | Universal — required on every site regardless of archetype |
| multi-page-scaffold | core | Shared nav is still needed even in authenticated apps |
| meta-tags-generator | core | Universal — per-page OG/Twitter/canonical/sitemap.xml |
| schema-jsonld | core | Universal — Organization + WebSite + BreadcrumbList minimum |
| semantic-html-audit | core | Universal — heading hierarchy, landmarks, alt text |
| a11y-axe-runner | core | Universal — zero critical/serious violations before ship |
| canvas-hero | optional | Project-dependent; sign-in landing pages can still have a strong visual |
| palette-tryout | optional | Project-dependent; colors.html is useful before committing to a design |
| copy-deck | optional | Useful but not required; auth-page microcopy matters more than hero copy |
| stitch-bridge | optional | Useful for generating sign-in screen and dashboard mockups |
| intel-consumer | optional | Useful when a competitor-intel sibling exists for the project domain |
| mobile-test-harness | optional | Sign-in flows must be tested on mobile — use this mechanic |
| competitor-pricing-intel | rare | Deprecated; use competitor-intel-template sibling fork instead |
| formspree-form | optional | Still useful for simple contact forms that don't warrant a real backend endpoint |

Fits for other archetypes are unchanged. The Assembly engine reads each mechanic's `meta.json` fits map at runtime, so these levels show up in the dashboard automatically.
