import { declareMeasurement } from "thunderjar";

// The root cause: calculateTotal sorted the caller's array in place.
const script = `
import assert from 'node:assert/strict';
import { calculateTotal } from './src/cart/totals.js';
const make = () => [{ name: 'Coffee', price: 4 }, { name: 'Bagel', price: 3 }, { name: 'Juice', price: 5 }];
const items = make();
calculateTotal(items);
assert.deepEqual(items, make());
`;

export default declareMeasurement({
  instrument: "shell",
  config: { command: `node --input-type=module <<'EOF'\n${script}\nEOF` },
  metrics: { passes: { stat: "rate", better: "higher" } },
});
