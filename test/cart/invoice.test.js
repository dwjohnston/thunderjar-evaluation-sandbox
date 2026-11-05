import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatInvoice } from '../../src/cart/invoice.js';

test('invoice lists items in the order they were added', () => {
  const items = [
    { name: 'Coffee', price: 4 },
    { name: 'Bagel', price: 3 },
    { name: 'Juice', price: 5 },
  ];
  assert.equal(
    formatInvoice(items),
    ['1. Coffee $4', '2. Bagel $3', '3. Juice $5', 'Total: $9'].join('\n'),
  );
});
