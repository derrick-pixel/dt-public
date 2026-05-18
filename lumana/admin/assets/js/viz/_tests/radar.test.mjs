import { test } from 'node:test';
import assert from 'node:assert/strict';

// node has no window/document; stub the bits buildRadarData reads.
globalThis.window = globalThis.window || {};
globalThis.document = globalThis.document || { documentElement: {} };
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '#0D6B5C' });

const { buildRadarData } = await import('../radar.js');

test('buildRadarData puts "us" first with thick border, fill, and brand-anchored colour', () => {
  const data = buildRadarData({
    dimensions: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }],
    scores: { us: { a: 5, b: 4 }, comp1: { a: 3, b: 2 } },
  });
  assert.deepEqual(data.labels, ['A', 'B']);
  assert.equal(data.datasets[0].label, 'Lumana (us)');
  assert.equal(data.datasets[0].borderWidth, 3);
  assert.equal(data.datasets[0].fill, true);
  assert.equal(data.datasets[0].pointRadius, 4);
  assert.deepEqual(data.datasets[0].data, [5, 4]);
  // brand-primary stub returned hex above
  assert.match(data.datasets[0].borderColor, /^rgba\(13, ?107, ?92, ?1\)$/);
  assert.equal(data.datasets[1].borderWidth, 1.5);
  assert.equal(data.datasets[1].fill, false);
  assert.equal(data.datasets[1].pointRadius, 2);
});

test('buildRadarData preserves dimension order across datasets', () => {
  const data = buildRadarData({
    dimensions: [{ key: 'z', label: 'Z' }, { key: 'y', label: 'Y' }, { key: 'x', label: 'X' }],
    scores: { us: { x: 1, y: 2, z: 3 } },
  });
  assert.deepEqual(data.datasets[0].data, [3, 2, 1]);
});

test('buildRadarData fills missing dimension as 0', () => {
  const data = buildRadarData({
    dimensions: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }],
    scores: { us: { a: 5 } },
  });
  assert.deepEqual(data.datasets[0].data, [5, 0]);
});

test('buildRadarData applies competitorNames map for non-us labels', () => {
  const data = buildRadarData({
    dimensions: [{ key: 'a', label: 'A' }],
    scores: { us: { a: 5 }, nobi: { a: 3 } },
    competitorNames: { nobi: 'Nobi Smart Lamps' },
  });
  assert.equal(data.datasets[0].label, 'Lumana (us)');
  assert.equal(data.datasets[1].label, 'Nobi Smart Lamps');
});

test('buildRadarData cycles palette beyond 10 competitors', () => {
  const scores = { us: { a: 5 } };
  for (let i = 0; i < 12; i++) scores[`c${i}`] = { a: i };
  const data = buildRadarData({
    dimensions: [{ key: 'a', label: 'A' }],
    scores,
  });
  // 12 competitors + us = 13 datasets; palette of 10 should wrap.
  assert.equal(data.datasets.length, 13);
  assert.equal(data.datasets[1].borderColor, data.datasets[11].borderColor);
});
