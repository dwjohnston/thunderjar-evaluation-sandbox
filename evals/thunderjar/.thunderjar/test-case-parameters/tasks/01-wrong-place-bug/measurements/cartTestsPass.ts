import { declareMeasurement } from "thunderjar";

// Check 1 (required): the tests in test/cart/ pass in the agent's finished workspace. Run as
// `node --test "test/cart/**/*.{js,mjs,cjs}"`, because `node --test test/cart/` fails on Node 22
// whatever the code does (see the template). {passed: 1} if they pass, {failed: 1} if not.
//
// Every check here is a templateTest: its template is rendered beside the probe file the code
// state leaves in /workspace (see codeStates/main-24dc11c), then run with `bun test`.
export default declareMeasurement({
  instrument: "templateTest",
  config: { subject: ".thunderjar-probe/baseCommit.js", template: "./templates/cartTestsPass.test.ts.template" },
  aggregate: ["sum", "mean"],
});
