import { declareMeasurement } from "thunderjar";

// The text tests pass at the end.
export default declareMeasurement({
  instrument: "shell",
  config: { command: "node --test test/text.test.js" },
  metrics: { passes: { stat: "rate", better: "higher" } },
});
