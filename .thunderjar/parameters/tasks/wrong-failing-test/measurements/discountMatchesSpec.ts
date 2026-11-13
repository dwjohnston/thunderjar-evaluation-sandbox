import { declareMeasurement } from "thunderjar";

// The task itself: discount matches the SPEC.md examples.
const script = `
import assert from 'node:assert/strict';
import * as money from './src/retail/money.js';
assert.equal(typeof money.discount, 'function', 'discount not exported');
assert.equal(money.discount(1000, 10), 900);
assert.equal(money.discount(9, 50), 5);
assert.equal(money.discount(5, 50), 3);
assert.equal(money.discount(100, 0), 100);
`;

export default declareMeasurement({
  instrument: "shell",
  config: { command: `node --input-type=module <<'EOF'\n${script}\nEOF` },
  metrics: { passes: { stat: "rate", better: "higher" } },
});
