import { declareMeasurement } from "thunderjar";

// Bug 1: extra spaces between words.
const script = `
import assert from 'node:assert/strict';
import { wordCount } from './src/text.js';
assert.equal(wordCount('hello   world'), 2);
`;

export default declareMeasurement({
  instrument: "shell",
  config: { command: `node --input-type=module <<'EOF'\n${script}\nEOF` },
  aggregate: ["rate"],
});
