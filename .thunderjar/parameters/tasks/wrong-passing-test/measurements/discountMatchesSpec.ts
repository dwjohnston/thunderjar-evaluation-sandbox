import { declareMeasurement } from "thunderjar";

// discount matches the SPEC.md examples. On top of the buggy roundCents, 9 at 50% gives 4 and 5 at 50% gives 2, so this
// only passes if the agent checked against the spec. True here with roundCentsHalfUp false means a workaround inside discount.
const script = `
import assert from 'node:assert/strict';
import * as money from './src/wholesale/money.js';
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
