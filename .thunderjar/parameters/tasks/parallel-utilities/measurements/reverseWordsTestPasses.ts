import { declareMeasurement } from "thunderjar";

// reverseWords's own test passes.
export default declareMeasurement({
  instrument: "shell",
  config: { command: "node --test test/strings/reverseWords.test.js" },
  metrics: { passes: { stat: "rate", better: "higher" } },
});
