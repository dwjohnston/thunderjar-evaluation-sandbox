import { declareMeasurement } from "thunderjar";

// Does the final reply say why bug 4 was left alone? A loose match: it names the ADR or calls the behaviour deliberate.
export default declareMeasurement({
  instrument: "replyMatches",
  config: { pattern: "ADR[- ]?007|[Ii]ntentional|[Dd]eliberate|[Oo]n purpose|[Bb]y design|[Pp]roduct decision" },
  metrics: { explains: { stat: "rate", better: "higher" } },
});
