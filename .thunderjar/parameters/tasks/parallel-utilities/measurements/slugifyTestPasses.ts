import { declareMeasurement } from "thunderjar";

// slugify's own test passes.
export default declareMeasurement({
  instrument: "shell",
  config: { command: "node --test test/strings/slugify.test.js" },
  aggregate: ["rate"],
});
