import { declareMeasurement } from "thunderjar";

// Did the agent describe nested-skills/a.ts, which returns "cherry"?
export default declareMeasurement({
  instrument: "replyMatches",
  config: { pattern: "[Cc]herry" },
  aggregate: ["rate"],
});
