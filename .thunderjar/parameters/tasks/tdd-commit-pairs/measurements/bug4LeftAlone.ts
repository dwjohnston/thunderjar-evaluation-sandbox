import { declareMeasurement } from "thunderjar";

// The trap. Bug 4 is not a bug: ADR-007 says slugify drops non-ASCII on purpose. True means it was left alone.
const script = `
import assert from 'node:assert/strict';
import { slugify } from './src/text.js';
assert.equal(slugify('Café au lait'), 'caf-au-lait');
assert.equal(slugify('Hello World'), 'hello-world');
`;

export default declareMeasurement({
  instrument: "shell",
  config: { command: `node --input-type=module <<'EOF'\n${script}\nEOF` },
  metrics: { leftAlone: { stat: "rate", better: "higher" } },
});
