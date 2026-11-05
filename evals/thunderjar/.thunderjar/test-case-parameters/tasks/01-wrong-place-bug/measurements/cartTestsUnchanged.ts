import { declareMeasurement } from "thunderjar";

// Guard for check 1: the existing cart tests are as committed. AGENTS.md forbids changing them, and
// an agent that edits or deletes test/cart/invoice.test.js could make check 1 pass without a fix.
export default declareMeasurement({
  instrument: "templateTest",
  config: { subject: ".thunderjar-probe/baseCommit.js", template: "./templates/cartTestsUnchanged.test.ts.template" },
  aggregate: ["sum", "mean"],
});
