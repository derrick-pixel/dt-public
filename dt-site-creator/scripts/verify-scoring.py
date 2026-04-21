#!/usr/bin/env python3
"""Verify the archetype scoring weights produce the expected matches."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "dashboard" / "data" / "archetypes.json").read_text())

# 5 test scenarios — each is (description, 4 answer IDs, expected top archetype)
TESTS = [
    ("Marketing SaaS for dentists",
     ["q1_public", "q2_no_money", "q3_content", "q4_no_data"],
     "static-informational"),
    ("PayNow charity donation site",
     ["q1_public", "q2_one_time", "q3_interaction", "q4_api"],
     "transactional"),
    ("Warehouse safety quiz training",
     ["q1_learners", "q2_no_money", "q3_interaction", "q4_no_data"],
     "simulator-educational"),
    ("Gamified onboarding for new hires",
     ["q1_learners", "q2_no_money", "q3_goal", "q4_no_data"],
     "game"),
    ("Internal plant KPI dashboard",
     ["q1_internal", "q2_no_money", "q3_interaction", "q4_dashboard"],
     "dashboard-analytics"),
]

archetypes = DATA["archetypes"]

def score(answers):
    scores = {a["id"]: 0 for a in archetypes}
    for ans in answers:
        for a in archetypes:
            scores[a["id"]] += a["scoring_weights"].get(ans, 0)
    return scores

def top(scores):
    return max(scores.items(), key=lambda kv: kv[1])

print(f"{'Scenario':<40} {'Expected':<22} {'Got':<22} {'Match':<6} {'Score'}")
print("-" * 105)

pass_count = 0
for desc, answers, expected in TESTS:
    scores = score(answers)
    top_id, top_score = top(scores)
    ok = "✓" if top_id == expected else "✗"
    if top_id == expected:
        pass_count += 1
    print(f"{desc:<40} {expected:<22} {top_id:<22} {ok:<6} {top_score}")
    # Show top-3 for context
    ranked = sorted(scores.items(), key=lambda kv: -kv[1])
    ranks = ", ".join(f"{a}={s}" for a, s in ranked[:3])
    print(f"  Top 3: {ranks}")

print(f"\n{pass_count}/{len(TESTS)} scenarios matched expected archetype.")
