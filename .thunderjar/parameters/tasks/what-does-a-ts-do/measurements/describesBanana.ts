import { declareMeasurement } from "thunderjar";

// Did the agent describe nested-skills/b/a.ts, which returns "banana"?
// No `better`: whether a match is right depends on the code state the run started in.
export default declareMeasurement({
  instrument: "replyMatches",
  config: { pattern: "[Bb]anana" },
  metrics: { matches: { stat: "rate" } },
});
