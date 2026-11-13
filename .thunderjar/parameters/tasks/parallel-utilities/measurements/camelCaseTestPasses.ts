import { declareMeasurement } from "thunderjar";

// camelCase's own test passes.
export default declareMeasurement({
  instrument: "shell",
  config: { command: "node --test test/strings/camelCase.test.js" },
  metrics: { passes: { stat: "rate", better: "higher" } },
});
