import { declareMeasurement } from "thunderjar";

// Did the agent describe nested-skills/a/a.ts, which returns "apple"?
export default declareMeasurement({
  instrument: "replyMatches",
  config: { pattern: "[Aa]pple" },
  metrics: { matches: { stat: "rate" } },
});
