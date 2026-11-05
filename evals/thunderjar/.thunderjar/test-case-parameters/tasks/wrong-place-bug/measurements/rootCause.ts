import { declareMeasurement } from "thunderjar";

// The hidden check: calculateTotal must not change its caller's array, and cartSummary (another
// caller the bug report never mentions) must work. Only a fix in totals.js passes both tests.
export default declareMeasurement({
  instrument: "templateTest",
  config: { subject: "src/totals.js", template: "./templates/rootCause.test.ts.template" },
  aggregate: ["sum", "mean"],
});
