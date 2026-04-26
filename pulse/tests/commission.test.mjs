import { test } from "node:test";
import assert from "node:assert/strict";
import { computeCommission } from "../js/admin/commission.js";

// Commission tiers from the "Marketing as Revenue Generator" deck.
// Interpreted as step-function bands where revenue ≤ threshold picks the row.
//   ≤ $1,500  → 20% of GP($1,100)   = $220   (tier 0)
//   ≤ $3,000  → 22% of GP($2,200)   = $484   (tier 1)
//   ≤ $5,000  → 22% of GP($3,700)   = $814   (tier 2)
//   ≤ $7,500  → 25% of GP($5,700)   = $1,425 (tier 3)
//   > $7,500  → 25% cost $2,000     (tier 4, e.g. $10K → $2,000)

test("$1,500 revenue → tier 0, 20% of $1,100 GP = $220", () => {
  const r = computeCommission({ revenue: 1500 });
  assert.equal(r.tier, 0);
  assert.equal(r.commission, 220);
});

test("$3,000 revenue → tier 1, 22% of $2,200 GP = $484", () => {
  const r = computeCommission({ revenue: 3000 });
  assert.equal(r.tier, 1);
  assert.equal(r.commission, 484);
});

test("$5,000 revenue → tier 2, 22% of $3,700 GP = $814", () => {
  const r = computeCommission({ revenue: 5000 });
  assert.equal(r.tier, 2);
  assert.equal(r.commission, 814);
});

test("$7,500 revenue → tier 3, 25% of $5,700 GP = $1,425", () => {
  const r = computeCommission({ revenue: 7500 });
  assert.equal(r.tier, 3);
  assert.equal(r.commission, 1425);
});

test("$10,000 revenue → tier 4, 25% of $8,000 GP = $2,000", () => {
  const r = computeCommission({ revenue: 10000 });
  assert.equal(r.tier, 4);
  assert.equal(r.commission, 2000);
});

test("upsell adds +3% of incremental revenue", () => {
  const r = computeCommission({ revenue: 5000, upsellValue: 1000 });
  assert.equal(r.commission, 814);
  assert.equal(r.upsellBonus, 30);
});

test("monthly bonus: $8K → $300", () => {
  assert.equal(computeCommission({ revenue: 8000 }).monthlyBonus, 300);
});

test("monthly bonus: $13K → $800", () => {
  assert.equal(computeCommission({ revenue: 13000 }).monthlyBonus, 800);
});

test("total payout sums base + upsell + monthly bonus", () => {
  const r = computeCommission({ revenue: 13000, upsellValue: 500 });
  assert.equal(r.total, r.commission + r.upsellBonus + r.monthlyBonus);
});
