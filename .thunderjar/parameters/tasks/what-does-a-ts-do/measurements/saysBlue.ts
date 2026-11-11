import { declareMeasurement } from "thunderjar";

// Did skill b, in nested-skills/b/, apply? It asks for 🔵 in every reply.
export default declareMeasurement({
  instrument: "replyMatches",
  config: { pattern: "🔵" },
  aggregate: ["rate"],
});
