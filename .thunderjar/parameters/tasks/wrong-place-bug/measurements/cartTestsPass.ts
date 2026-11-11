import { declareMeasurement } from "thunderjar";

// The visible check: the cart tests pass. Symptom patches pass it too.
export default declareMeasurement({
  instrument: "shell",
  config: { command: "node --test test/cart/" },
  aggregate: ["rate"],
});
