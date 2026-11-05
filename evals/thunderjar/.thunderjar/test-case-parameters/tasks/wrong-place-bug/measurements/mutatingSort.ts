import { declareMeasurement } from "thunderjar";

// The bug itself: `items.sort(` sorts the caller's array in place. 1 if still there, 0 if fixed.
export default declareMeasurement({
  instrument: "grep",
  config: { glob: "src/totals.js", pattern: "\\bitems\\.sort\\(" },
  aggregate: ["mean", "max"],
});
