import { declareMeasurement } from "thunderjar";

// Does the agent's final reply say the array was mutated / sorted in place?
export default declareMeasurement({
  instrument: "replyMatches",
  config: { pattern: "[Mm]utat|in[ -]place" },
  aggregate: ["rate"],
});
