import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesCompetitor, computePageIndex } from '../search.js';

const sample = {
  id: 'safelyyou', name: 'SafelyYou (Halo)',
  primary_value_prop: 'AI camera + 24/7 human review that confirms falls',
  hq: 'San Francisco, USA',
  features: ['Bedroom AI camera', 'Halo predictive analytics'],
  strengths: ['450+ US communities deployed', 'Published JAMDA RCT'],
  category: 'global_incumbent',
  hq_region: 'Global',
  pricing_flag: 'hidden_estimated',
  threat_level: 4,
};

test('empty query matches all', () => {
  assert.equal(matchesCompetitor(sample, '', {}), true);
});

test('matches name case-insensitive', () => {
  assert.equal(matchesCompetitor(sample, 'safely', {}), true);
  assert.equal(matchesCompetitor(sample, 'SAFELY', {}), true);
});

test('matches feature text', () => {
  assert.equal(matchesCompetitor(sample, 'predictive', {}), true);
});

test('matches strength text', () => {
  assert.equal(matchesCompetitor(sample, 'JAMDA', {}), true);
});

test('matches HQ city', () => {
  assert.equal(matchesCompetitor(sample, 'francisco', {}), true);
});

test('category filter', () => {
  assert.equal(matchesCompetitor(sample, '', { category: 'global_incumbent' }), true);
  assert.equal(matchesCompetitor(sample, '', { category: 'sg_local' }), false);
});

test('hqRegion filter', () => {
  assert.equal(matchesCompetitor(sample, '', { hqRegion: 'Global' }), true);
  assert.equal(matchesCompetitor(sample, '', { hqRegion: 'APAC' }), false);
});

test('pricingFlag filter', () => {
  assert.equal(matchesCompetitor(sample, '', { pricingFlag: 'hidden_estimated' }), true);
  assert.equal(matchesCompetitor(sample, '', { pricingFlag: 'public' }), false);
});

test('threatLevelMin filter (number)', () => {
  assert.equal(matchesCompetitor(sample, '', { threatLevelMin: 4 }), true);
  assert.equal(matchesCompetitor(sample, '', { threatLevelMin: 5 }), false);
});

test('threatLevelMin filter (string from select)', () => {
  assert.equal(matchesCompetitor(sample, '', { threatLevelMin: '3' }), true);
  assert.equal(matchesCompetitor(sample, '', { threatLevelMin: '5' }), false);
});

test('query AND filter both required', () => {
  assert.equal(matchesCompetitor(sample, 'notexist', { category: 'global_incumbent' }), false);
});

test('computePageIndex computes window', () => {
  const r = computePageIndex(45, 0, 12);
  assert.equal(r.start, 0);
  assert.equal(r.end, 12);
  assert.equal(r.totalPages, 4);
  assert.equal(r.page, 0);
});

test('computePageIndex final page partial', () => {
  const r = computePageIndex(45, 3, 12);
  assert.equal(r.start, 36);
  assert.equal(r.end, 45);
  assert.equal(r.totalPages, 4);
  assert.equal(r.page, 3);
});

test('computePageIndex clamps over-range page back to last', () => {
  const r = computePageIndex(45, 99, 12);
  assert.equal(r.page, 3);
  assert.equal(r.end, 45);
});

test('computePageIndex empty list', () => {
  const r = computePageIndex(0, 0, 12);
  assert.equal(r.start, 0);
  assert.equal(r.end, 0);
  assert.equal(r.totalPages, 1);
});

test('computePageIndex handles single short page', () => {
  const r = computePageIndex(7, 0, 12);
  assert.equal(r.start, 0);
  assert.equal(r.end, 7);
  assert.equal(r.totalPages, 1);
});
