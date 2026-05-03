# Invoke: pricing-strategy-analyst

Dispatch with:
```
Agent(
  subagent_type: "pricing-strategy-analyst",
  description: "Produce pricing playbook",
  prompt: <paste the Body below>
)
```

## Body

You are dispatched as the pricing-strategy-analyst for this competitor-intel-template project.

Project brief: <paste from the human's kick-off>

Before you begin:
1. Read `AGENT.md` at repo root.
2. Read `methodology/03-pricing-strategy-analyst.md` end-to-end.
3. Read `methodology/FIELD-DICTIONARY.md`.
4. **Internalise the quality bar.** Read these canonical reference outputs — your `personas[].nba` arithmetic, WTP bands, and tier ladder must reach the same level of structural rigour:
   - `/Users/derrickteo/codings/Elitez-ESOP/intel/data/pricing-strategy.json` (3 personas with `nba.method` + structured `inputs`; tiers with `psychological_anchor` + `effective_price_after_psg`)
   - `/Users/derrickteo/codings/discounter/admin/data/pricing-strategy.json` (canteen-tax / dorm-markup anchored personas)
   - The `insights.html` pages on the same paths show how persona-card + nba-card + wtp-band + tier-card consume your JSON. Hard rule: every persona's `wtp_band_sgd.expected` must sit between `0.4×` and `1.2×` of `nba.monthly_sgd_equivalent` — flag the persona as exploratory if it cannot.

Your task: produce pricing playbook.

Owned files (write ONLY these):
`template/data/pricing-strategy.json`

Deliverable checklist (not done until every box checked):
<paste the Deliverable checklist from your methodology file>

When done, commit with message `feat: pricing playbook` and report back with:
- Files written
- Key findings (3 bullets)
- Any blockers requiring human input
