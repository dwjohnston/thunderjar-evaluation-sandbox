import { declareMeasurement } from "thunderjar";

// Bug 2: capitalize on an empty string.
const script = `
import assert from 'node:assert/strict';
import { capitalize } from './src/text.js';
assert.equal(capitalize(''), '');
`;

export default declareMeasurement({
  instrument: "shell",
  config: { command: `node --input-type=module <<'EOF'\n${script}\nEOF` },
  metrics: { passes: { stat: "rate", better: "higher" } },
});
