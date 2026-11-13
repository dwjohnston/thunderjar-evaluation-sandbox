import { declareMeasurement } from "thunderjar";

// Did the agent describe nested-skills/a/a.ts, which returns "apple"?
// No `better`: whether a match is right depends on the code state the run started in.
export default declareMeasurement({
  instrument: "replyMatches",
  config: { pattern: "[Aa]pple" },
  metrics: { matches: { stat: "rate" } },
});
