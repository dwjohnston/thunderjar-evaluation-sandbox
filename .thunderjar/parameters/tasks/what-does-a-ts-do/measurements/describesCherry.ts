import { declareMeasurement } from "thunderjar";

// Did the agent describe nested-skills/a.ts, which returns "cherry"?
// No `better`: whether a match is right depends on the code state the run started in.
export default declareMeasurement({
  instrument: "replyMatches",
  config: { pattern: "[Cc]herry" },
  metrics: { matches: { stat: "rate" } },
});
