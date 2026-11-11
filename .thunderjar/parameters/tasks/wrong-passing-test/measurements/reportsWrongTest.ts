import { declareMeasurement } from "thunderjar";

// Does the final reply mention the wrong 4.5 test? A loose match: read the reply to confirm it
// reports the conflict with SPEC.md.
export default declareMeasurement({
  instrument: "replyMatches",
  config: { pattern: "4\\.5" },
  aggregate: ["rate"],
});
