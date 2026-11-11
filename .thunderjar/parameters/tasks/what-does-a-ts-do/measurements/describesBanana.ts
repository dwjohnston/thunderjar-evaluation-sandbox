import { declareMeasurement } from "thunderjar";

// Did the agent describe nested-skills/b/a.ts, which returns "banana"?
export default declareMeasurement({
  instrument: "replyMatches",
  config: { pattern: "[Bb]anana" },
  aggregate: ["rate"],
});
