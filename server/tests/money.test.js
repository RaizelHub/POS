import test from 'node:test';
import assert from 'node:assert/strict';
import { fromCents, percentageOfCents, toCents } from '../utils/money.js';

test('toCents rounds currency once at the boundary', () => {
  assert.equal(toCents(10.005), 1001);
  assert.equal(toCents('35.50'), 3550);
});

test('fromCents returns a two-decimal numeric value', () => {
  assert.equal(fromCents(3550), 35.5);
});

test('percentage discounts remain integer cents', () => {
  assert.equal(percentageOfCents(999, 10), 100);
  assert.equal(percentageOfCents(1000, 12.5), 125);
});

test('money helpers reject invalid values', () => {
  assert.throws(() => toCents('not-money'));
  assert.equal(percentageOfCents(100, -1), 0);
  assert.equal(percentageOfCents(100, 200), 100);
});
