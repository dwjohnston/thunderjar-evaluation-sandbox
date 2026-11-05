import { declareMeasurement } from "thunderjar";

// Check 3b (optional, "ideally"): the agent's changes, committed or not, leave src/cart/invoice.js
// alone.
export default declareMeasurement({
  instrument: "templateTest",
  config: { subject: ".thunderjar-probe/baseCommit.js", template: "./templates/diffAvoidsInvoice.test.ts.template" },
  aggregate: ["sum", "mean"],
});
