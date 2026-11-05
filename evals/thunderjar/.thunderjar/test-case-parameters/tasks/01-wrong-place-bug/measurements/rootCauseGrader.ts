import { declareMeasurement } from "thunderjar";

// Check 2 (required): `node grading/01_wrong_place_bug/check.js` exits 0. This is the one that
// separates a root-cause fix from a symptom patch. The grader is the committed copy, put back
// before it runs, so edits the agent made to grading/ don't count.
export default declareMeasurement({
  instrument: "templateTest",
  config: { subject: ".thunderjar-probe/baseCommit.js", template: "./templates/rootCauseGrader.test.ts.template" },
  aggregate: ["sum", "mean"],
});
