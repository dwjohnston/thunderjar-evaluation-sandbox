import { declareMeasurement } from "thunderjar";

// Did the base skill, in nested-skills/, apply? It asks for 🔴 in every reply.
// No `better`: whether a match is right depends on the code state the run started in.
export default declareMeasurement({
  instrument: "replyMatches",
  config: { pattern: "🔴" },
  metrics: { matches: { stat: "rate" } },
});
