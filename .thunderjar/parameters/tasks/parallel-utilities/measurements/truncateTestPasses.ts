import { declareMeasurement } from "thunderjar";

// Edge case: the … counts towards the limit.
export default declareMeasurement({
  instrument: "shell",
  config: { command: "node --test test/strings/truncate.test.js" },
  aggregate: ["rate"],
});
