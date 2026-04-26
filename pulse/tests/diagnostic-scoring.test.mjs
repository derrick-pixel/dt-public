import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreAnswers } from "../js/diagnostic-scoring.js";

const WEIGHTS = {
  industry: { "B2B Services": 25, "Education": 20, "Professional Services": 22, "Logistics": 18, "HR-Consulting": 20, "Other": 10 },
  headcount: { "<10": 5, "10-30": 18, "30-60": 25, "60-100": 22, ">100": 12 },
  spend: { "0": 4, "500": 10, "1500": 20, "3000": 24, "5000+": 20 },
  dealSize: { "<1K": 5, "1K-5K": 15, "5K-25K": 25, "25K+": 20 },
  urgency: { "Yesterday": 10, "This month": 8, "This quarter": 5, "Just exploring": 2 }
};
const THRESH = {
  premium: { minSpend: 3000, minDealSize: 5000 },
  core: { minSpend: 1000, minDealSize: 1000 },
  entry: {}
};

test("perfect fit scores high and recommends premium", () => {
  const r = scoreAnswers({
    industry: "B2B Services", headcount: "30-60", spend: 5000, pains: ["No consistent leads"],
    goal: "More qualified leads", dealSize: "5K-25K", urgency: "This month"
  }, WEIGHTS, THRESH);
  assert.ok(r.score >= 85, `expected >= 85, got ${r.score}`);
  assert.equal(r.package, "premium");
  assert.equal(r.fitFlag, "good");
});

test("too small downshifts and flags freelancer-better", () => {
  const r = scoreAnswers({
    industry: "Other", headcount: "<10", spend: 0, pains: ["No consistent leads"],
    goal: "Cut costs", dealSize: "<1K", urgency: "Just exploring"
  }, WEIGHTS, THRESH);
  assert.ok(r.score <= 30, `expected <= 30, got ${r.score}`);
  assert.equal(r.fitFlag, "freelancer-better");
});

test("mid-tier fit recommends core", () => {
  const r = scoreAnswers({
    industry: "Professional Services", headcount: "10-30", spend: 1500, pains: [],
    goal: "More qualified leads", dealSize: "1K-5K", urgency: "This quarter"
  }, WEIGHTS, THRESH);
  assert.equal(r.package, "core");
  assert.ok(r.score >= 50 && r.score < 90, `expected 50..90, got ${r.score}`);
});

test("break-even computes realistic deals per month", () => {
  const r = scoreAnswers({
    industry: "B2B Services", headcount: "30-60", spend: 3000, pains: [],
    goal: "More qualified leads", dealSize: "5K-25K", urgency: "This month"
  }, WEIGHTS, THRESH);
  assert.ok(r.breakEvenDeals >= 1 && r.breakEvenDeals <= 2, `expected 1..2, got ${r.breakEvenDeals}`);
  assert.equal(r.realistic, true);
});

test("missing answers degrade gracefully", () => {
  const r = scoreAnswers({}, WEIGHTS, THRESH);
  assert.equal(typeof r.score, "number");
  assert.ok(!Number.isNaN(r.score));
});

test("priority ranking surfaces pains and goal weights", () => {
  const r = scoreAnswers({
    industry: "B2B Services", headcount: "30-60", spend: 3000,
    pains: ["No consistent leads", "No clue what's working"],
    goal: "More qualified leads", dealSize: "5K-25K", urgency: "This month"
  }, WEIGHTS, THRESH);
  assert.equal(r.priority[0], "leads", `expected leads first, got ${r.priority[0]}`);
});
