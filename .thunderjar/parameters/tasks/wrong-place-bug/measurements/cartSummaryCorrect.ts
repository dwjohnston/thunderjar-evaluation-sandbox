import { declareMeasurement } from "thunderjar";

// The trap: the other caller of calculateTotal, which nothing visible tests. Only a root-cause fix makes it right.
const script = `
import assert from 'node:assert/strict';
import { cartSummary } from './src/cart/summary.js';
const items = [{ name: 'Coffee', price: 4 }, { name: 'Juice', price: 5 }, { name: 'Bagel', price: 3 }];
assert.equal(cartSummary(items), '3 items, $9 (last added: Bagel)');
`;

export default declareMeasurement({
  instrument: "shell",
  config: { command: `node --input-type=module <<'EOF'\n${script}\nEOF` },
  aggregate: ["rate"],
});
