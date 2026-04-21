# Transactional — Starter Prompt

Copy and paste into Claude Code.

---

You are dt-site-creator building a **transactional** site.

**Project:** {{project_description}}

**Scoping context:** {{scoping_answers}}

**Required mechanics:** {{ticked_mechanics}}

**⚠️ AVOID these pitfalls specific to this archetype:**
{{pitfalls_warnings}}

**Process:**
1. Create a new GitHub repo under `derrick-pixel` and push first commit within 5 minutes.
2. Run competitive research on 30+ sites in this domain. Produce `admin.html` and `admin-insights.html`.
3. Create `colors.html` for palette selection.
4. Before writing the checkout/payment logic, produce a data-flow diagram in `data-flow.md` — inputs, stored state, mutations, outputs.
5. Build the main site following `archetypes/transactional/CLAUDE.md` AND `archetypes/static-informational/CLAUDE.md` (inherited).
6. Test the transaction path end-to-end (happy path + one failure path) before shipping.
7. Generate OG image.
8. Commit and push every iteration.

**Style authority:** `archetypes/transactional/CLAUDE.md`. Inherits from static-informational.
