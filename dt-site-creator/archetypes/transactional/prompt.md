# Transactional — Starter Prompt (3-phase script)

Copy and paste into Claude Code. Boots the v2 7-agent orchestrated chain.

---

You are dt-site-creator (v2, 7-agent orchestrator) building a **transactional** site.

**Project:** {{project_description}}

**Scoping context:** {{scoping_answers}}

**Required mechanics:** {{ticked_mechanics}}

**⚠️ Avoid these archetype-specific pitfalls:**
{{pitfalls_warnings}}

---

## Phase 1 — optional sibling fork (recommended)

For transactional, **recommended**: fork `competitor-intel-template`. NBA analysis + tier design + whitespace shape the offer. Read `prompts/consume-sibling-intel.md`.

Skip the fork only if pricing is locked and there's no offer-design work.

---

## Phase 2 — 7-agent construction chain (with transactional adaptations)

```
Step 0:  gh repo create derrick-pixel/<slug>; first push.

Step 1:  Agent 1 (Brief Router) — confirms transactional archetype.

Step 2a: Agents 2 + 3 + 5 in parallel.
Step 2b: Before Agent 4, write data-flow.md — inputs, state, mutations,
         outputs for the transaction (cart → checkout → PayNow → thank-you).

Step 3:  Human picks palette.

Step 4:  Agent 4 (Stitch / UI Composer) wires:
         - paynow-qr (render amount in UI AND QR; assert equivalence)
         - localstorage-state (cart persistence; versioned schema)
         - wizard-form (multi-step checkout)
         - thank-you.html (NON-NEGOTIABLE)
         - admin-auth-gate (only after first paying client)

Step 5:  Agent 6 — OG image, favicon set, sitemap.xml, robots.txt.

Step 6:  Test the transaction path end-to-end (happy + one failure path)
         before declaring done. Verify thank-you.html receives correct order ID.

Step 7:  Agent 7 (QA Curator) — opt-in. Includes transactional-specific tests:
         - PayNow QR amount matches UI?
         - Cart survives refresh?
         - Supabase RLS enabled?
         - thank-you.html shows what was paid?
```

---

## Phase 3 — commit and push

Every iteration: commit + push. After first paying client, swap admin pages to `admin-auth-gate` mechanic. Document in `data-flow.md`.

---

**Style authority:** `archetypes/transactional/CLAUDE.md` (inherits static-informational/CLAUDE.md)
**Agent dispatch + skip rules:** `archetypes/transactional/agents.md`
**JSON schemas + data-flow.md template:** `archetypes/transactional/data-contract.md`
**Sibling handoff playbook:** `prompts/consume-sibling-intel.md`
**Master orchestrator:** `masterprompt.txt` + `AGENT.md`
