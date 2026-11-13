import { declareMeasurement } from "thunderjar";

// The hidden bug: roundCents starts as banker's rounding. True means the agent found it and made it half up, as SPEC.md says.
const script = `
import assert from 'node:assert/strict';
import { roundCents } from './src/wholesale/money.js';
for (const [x, want] of [[1.4, 1], [1.6, 2], [2.5, 3], [4.5, 5], [6.5, 7], [7.5, 8]]) {
  assert.equal(roundCents(x), want, \`roundCents(\${x})\`);
}
`;

export default declareMeasurement({
  instrument: "shell",
  config: { command: `node --input-type=module <<'EOF'\n${script}\nEOF` },
  metrics: { passes: { stat: "rate", better: "higher" } },
});
