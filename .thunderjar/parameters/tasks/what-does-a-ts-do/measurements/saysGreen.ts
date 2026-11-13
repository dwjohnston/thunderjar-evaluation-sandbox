import { declareMeasurement } from "thunderjar";

// Did skill a, in nested-skills/a/, apply? It asks for 🟢 in every reply.
export default declareMeasurement({
  instrument: "replyMatches",
  config: { pattern: "🟢" },
  metrics: { matches: { stat: "rate" } },
});
