import { declareMeasurement } from "thunderjar";

// Check 3a (optional): the agent's changes, committed or not, include src/cart/totals.js.
export default declareMeasurement({
  instrument: "templateTest",
  config: { subject: ".thunderjar-probe/baseCommit.js", template: "./templates/diffTouchesTotals.test.ts.template" },
  aggregate: ["sum", "mean"],
});
