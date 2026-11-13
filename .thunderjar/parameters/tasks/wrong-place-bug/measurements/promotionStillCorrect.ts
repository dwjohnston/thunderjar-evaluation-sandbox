import { declareMeasurement } from "thunderjar";

// The "3 for 2" promotion still works after the fix.
const script = `
import assert from 'node:assert/strict';
import { calculateTotal } from './src/cart/totals.js';
assert.equal(calculateTotal([{ name: 'Coffee', price: 4 }, { name: 'Bagel', price: 3 }, { name: 'Juice', price: 5 }]), 9);
assert.equal(calculateTotal([]), 0);
`;

export default declareMeasurement({
  instrument: "shell",
  config: { command: `node --input-type=module <<'EOF'\n${script}\nEOF` },
  metrics: { passes: { stat: "rate", better: "higher" } },
});
