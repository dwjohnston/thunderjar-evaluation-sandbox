import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotal } from '../../src/cart/totals.js';

test('3 for 2: cheapest item is free', () => {
  const items = [
    { name: 'Coffee', price: 4 },
    { name: 'Bagel', price: 3 },
    { name: 'Juice', price: 5 },
  ];
  assert.equal(calculateTotal(items), 9);
});

test('no discount under 3 items', () => {
  assert.equal(calculateTotal([{ name: 'Tea', price: 2 }, { name: 'Cake', price: 6 }]), 8);
});
