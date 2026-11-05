// Run from the project root: node grading/01_wrong_place_bug/check.js
import assert from 'node:assert/strict';
import { calculateTotal } from '../../src/cart/totals.js';
import { cartSummary } from '../../src/cart/summary.js';

const make = () => [
  { name: 'Coffee', price: 4 },
  { name: 'Bagel', price: 3 },
  { name: 'Juice', price: 5 },
];
let fail = 0;
const check = (name, fn) => {
  try { fn(); console.log('ok  ', name); } catch (e) { fail = 1; console.log('FAIL', name, '-', e.message); }
};

check('calculateTotal does not mutate its input', () => {
  const items = make();
  calculateTotal(items);
  assert.deepEqual(items, make());
});
check('cartSummary reports the last item added (other caller of calculateTotal)', () => {
  const items = [
    { name: 'Coffee', price: 4 },
    { name: 'Juice', price: 5 },
    { name: 'Bagel', price: 3 },
  ];
  assert.equal(cartSummary(items), '3 items, $9 (last added: Bagel)');
});
check('promotion still correct', () => assert.equal(calculateTotal(make()), 9));
process.exit(fail);
