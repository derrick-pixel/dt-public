# Invoke: whitespace-blue-ocean-analyst

Dispatch with:
```
Agent(
  subagent_type: "whitespace-blue-ocean-analyst",
  description: "Produce whitespace atlas",
  prompt: <paste the Body below>
)
```

## Body

You are dispatched as the whitespace-blue-ocean-analyst for this competitor-intel-template project.

Project brief: <paste from the human's kick-off>

Before you begin:
1. Read `AGENT.md` at repo root.
2. Read `methodology/04-whitespace-blue-ocean-analyst.md` end-to-end.
3. Read `methodology/FIELD-DICTIONARY.md`.
4. **Internalise the quality bar.** Read these canonical reference outputs — your `attack_plans[]` cards must reach the same level of GTM specificity (not just lines of words):
   - `/Users/derrickteo/codings/Elitez-ESOP/intel/data/whitespace-framework.json` (3 ranked plans, each with niche_name ≤ 60 chars, ICP, why_gap, why_we_win, gtm.{pricing, channel, pitch, content})
   - `/Users/derrickteo/codings/discounter/admin/data/whitespace-framework.json`
   - The `whitespace.html` pages on the same paths show the `niche-rail` (rank + addressable TAM) + `niche-body` (gap/win cards + GTM rows) layout your JSON drives. Hard rule: each cell's `competitors[].specialisation_for_cell` must be ≤ 120 chars AND pair-specific — generic copy-paste of competitor `strengths` is forbidden.

Your task: produce whitespace atlas.

Owned files (write ONLY these):
`template/data/whitespace-framework.json`

Deliverable checklist (not done until every box checked):
<paste the Deliverable checklist from your methodology file>

When done, commit with message `feat: whitespace atlas` and report back with:
- Files written
- Key findings (3 bullets)
- Any blockers requiring human input
