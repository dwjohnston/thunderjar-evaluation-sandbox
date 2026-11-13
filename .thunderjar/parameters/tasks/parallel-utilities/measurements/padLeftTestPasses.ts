import { declareMeasurement } from "thunderjar";

// padLeft's own test passes.
export default declareMeasurement({
  instrument: "shell",
  config: { command: "node --test test/strings/padLeft.test.js" },
  metrics: { passes: { stat: "rate", better: "higher" } },
});
