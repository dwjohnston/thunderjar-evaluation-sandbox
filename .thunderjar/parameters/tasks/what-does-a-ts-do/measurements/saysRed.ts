import { declareMeasurement } from "thunderjar";

// Did the base skill, in nested-skills/, apply? It asks for 🔴 in every reply.
export default declareMeasurement({
  instrument: "replyMatches",
  config: { pattern: "🔴" },
  aggregate: ["rate"],
});
