import { declareMeasurement } from "thunderjar";

// The shared file: six export lines, alphabetical, in the format AGENTS.md gives. Where parallel agents collide.
export default declareMeasurement({
  instrument: "shell",
  config: { command: "node --test test/strings/index.test.js" },
  aggregate: ["rate"],
});
