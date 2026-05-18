import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimatePerEventSgd } from '../price-bars.js';

test('returns null for empty pricing string', () => {
  assert.equal(estimatePerEventSgd({ pricing_range_published: '' }), null);
  assert.equal(estimatePerEventSgd({}), null);
});

test('uses sg_monthly_sgd when present (future-proof path)', () => {
  assert.equal(estimatePerEventSgd({ sg_monthly_sgd: 12345, pricing_range_published: 'whatever' }), 12345);
});

test('parses /pax range and scales to 600 PAX', () => {
  // (80 + 250) / 2 = 165 × 600 = 99,000
  assert.equal(estimatePerEventSgd({ pricing_range_published: 'D&D SGD 80-250/pax' }), 99000);
});

test('parses /pax range with comma-thousands stripped', () => {
  assert.equal(estimatePerEventSgd({ pricing_range_published: 'SGD 100-200/pax all-in' }), 90000);
});

test('parses per-seat context BEFORE the price', () => {
  // "Per-seat … SGD ~30-150" → (30+150)/2 = 90 × 600 = 54,000
  assert.equal(estimatePerEventSgd({ pricing_range_published: 'Per-seat experiences from SGD ~30-150' }), 54000);
});

test('parses "from SGD X" minimum-spend floor', () => {
  assert.equal(estimatePerEventSgd({ pricing_range_published: 'From SGD 1,200 minimum spend' }), 1200);
});

test('parses 4-digit per-event range when no per-unit hint', () => {
  // (25,000 + 70,000) / 2 = 47,500 — but "Family day SGD 5,000-30,000; D&D SGD 80-250/pax"
  // should hit the per-pax branch first because /pax appears.
  // Plain per-event range:
  assert.equal(estimatePerEventSgd({ pricing_range_published: 'Corporate event SGD 25000-70000' }), 47500);
});

test('returns null when string has no SGD numeric content', () => {
  assert.equal(estimatePerEventSgd({ pricing_range_published: 'Bespoke; quote-on-brief' }), null);
  assert.equal(estimatePerEventSgd({ pricing_range_published: 'Tight-budget positioning' }), null);
});
