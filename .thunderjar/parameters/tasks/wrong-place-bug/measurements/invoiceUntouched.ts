import { declareMeasurement } from "thunderjar";

// Both symptom patches (copy the items, or build the lines first) edit formatInvoice. The root-cause
// fix doesn't need to. True means src/cart/invoice.js is byte-for-byte as it started.
export default declareMeasurement({
  instrument: "shell",
  config: { command: "echo 'd2d732fd137fec5fa8d12c63706ce78500b1b7feeed5089e2edf452a75a84d1b  src/cart/invoice.js' | sha256sum -c --quiet" },
  aggregate: ["rate"],
});
