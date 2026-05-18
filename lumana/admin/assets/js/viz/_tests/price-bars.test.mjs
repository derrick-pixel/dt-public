import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis.window || {};
globalThis.document = globalThis.document || {
  documentElement: {},
  createElement: () => ({ getContext: () => ({ fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, createPattern() { return null; } }), width: 0, height: 0 }),
};
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });

const { buildPriceSeries } = await import('../price-bars.js');

test('sorts ascending and appends "us" at the end', () => {
  const out = buildPriceSeries({
    competitors: [
      { name: 'C', sg_monthly_sgd: 80, pricing_flag: 'public' },
      { name: 'A', sg_monthly_sgd: 30, pricing_flag: 'public' },
      { name: 'B', sg_monthly_sgd: 50, pricing_flag: 'partial' },
    ],
    ourPrice: 85,
    ourLabel: 'Us',
  });
  assert.deepEqual(out.labels, ['A', 'B', 'C', 'Us']);
  assert.deepEqual(out.prices, [30, 50, 80, 85]);
});

test('lists competitors with no published price as omitted', () => {
  const out = buildPriceSeries({
    competitors: [
      { name: 'A', sg_monthly_sgd: 10 },
      { name: 'B', sg_monthly_sgd: null },
      { name: 'C', sg_monthly_sgd: null },
    ],
  });
  assert.deepEqual(out.omitted, ['B', 'C']);
  assert.deepEqual(out.labels, ['A']);
});

test('skips us series when ourPrice is null', () => {
  const out = buildPriceSeries({
    competitors: [{ name: 'A', sg_monthly_sgd: 10 }],
    ourPrice: null,
  });
  assert.deepEqual(out.labels, ['A']);
});
