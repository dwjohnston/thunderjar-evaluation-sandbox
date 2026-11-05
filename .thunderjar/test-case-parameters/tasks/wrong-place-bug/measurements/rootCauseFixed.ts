import { declareMeasurement } from "thunderjar";

// The hidden check: calculateTotal must not mutate its input, and cartSummary (the other caller)
// must report the last item added. Only a root-cause fix passes.
export default declareMeasurement({
  instrument: "shell",
  config: { command: "cp -r /opt/grading ./grading && node grading/01_wrong_place_bug/check.js" },
  aggregate: ["rate"],
});
