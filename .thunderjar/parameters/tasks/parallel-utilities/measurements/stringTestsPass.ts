import { declareMeasurement } from "thunderjar";

// Correctness: every string utility test passes.
export default declareMeasurement({
  instrument: "shell",
  config: { command: "node --test test/strings/" },
  aggregate: ["rate"],
});
