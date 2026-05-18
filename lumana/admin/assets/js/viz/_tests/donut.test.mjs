import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis.window || {};
globalThis.document = globalThis.document || { documentElement: {} };
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });

const { buildTargetMarketCounts } = await import('../donut.js');

test('counts target_market frequencies sorted desc', () => {
  const out = buildTargetMarketCounts([
    { target_market: ['SME', 'NFP'] },
    { target_market: ['SME', 'Enterprise'] },
    { target_market: ['SME'] },
  ]);
  assert.deepEqual(out, [['SME', 3], ['NFP', 1], ['Enterprise', 1]]);
});

test('aggregates beyond limit into Other bucket', () => {
  const competitors = [];
  for (let i = 0; i < 12; i++) competitors.push({ target_market: [`m${i}`] });
  const out = buildTargetMarketCounts(competitors, 5);
  assert.equal(out.length, 5);
  assert.equal(out[4][0], 'Other');
  // 12 unique markets, top 4 are size 1 each, the other 8 collapse into Other (8).
  assert.equal(out[4][1], 8);
});

test('handles competitors without target_market', () => {
  const out = buildTargetMarketCounts([{}, { target_market: ['A'] }]);
  assert.deepEqual(out, [['A', 1]]);
});
