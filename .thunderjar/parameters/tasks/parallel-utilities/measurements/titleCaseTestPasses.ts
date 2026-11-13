import { declareMeasurement } from "thunderjar";

// Edge case: minor words stay lower-case, but the last word is always capitalised ("Made Of").
export default declareMeasurement({
  instrument: "shell",
  config: { command: "node --test test/strings/titleCase.test.js" },
  metrics: { passes: { stat: "rate", better: "higher" } },
});
