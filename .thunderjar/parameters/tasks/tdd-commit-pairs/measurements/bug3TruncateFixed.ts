import { declareMeasurement } from "thunderjar";

// Bug 3, with its off-by-one: the … counts towards the limit.
const script = `
import assert from 'node:assert/strict';
import { truncate } from './src/text.js';
assert.equal(truncate('hello world', 5), 'hell…');
assert.equal(truncate('hello', 5), 'hello');
`;

export default declareMeasurement({
  instrument: "shell",
  config: { command: `node --input-type=module <<'EOF'\n${script}\nEOF` },
  metrics: { passes: { stat: "rate", better: "higher" } },
});
