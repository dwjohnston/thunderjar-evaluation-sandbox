import { declareMeasurement } from "thunderjar";

// The tempting symptom patch: copying the array inside formatInvoice instead of fixing totals.js.
export default declareMeasurement({
  instrument: "grep",
  config: { glob: "src/invoice.js", pattern: "\\[\\.\\.\\.items\\]|items\\.slice\\(\\)|structuredClone\\(items\\)" },
  aggregate: ["mean", "max"],
});
