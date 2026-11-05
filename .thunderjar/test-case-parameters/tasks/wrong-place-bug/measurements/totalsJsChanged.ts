import { declareMeasurement } from "thunderjar";

// Did the agent touch src/cart/totals.js, where the bug is? Committed or not, against the pinned commit.
export default declareMeasurement({
  instrument: "shell",
  config: { command: "! git diff --quiet 24dc11c26e2716a12cf33b82fec895a7f02b3e8a -- src/cart/totals.js" },
  aggregate: ["rate"],
});
