import { declareMeasurement } from "thunderjar";

// The visible check: the cart tests, including the failing invoice test. A symptom patch passes it.
export default declareMeasurement({
  instrument: "shell",
  config: { command: "node --test test/cart/" },
  aggregate: ["rate"],
});
