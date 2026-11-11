import { declareMeasurement } from "thunderjar";

// Does the final reply name the rounding bug? A loose match on how agents usually describe it.
export default declareMeasurement({
  instrument: "replyMatches",
  config: { pattern: "[Bb]anker|[Hh]alf[- ]?(to[- ])?[Ee]ven|[Rr]ound(s|ing)? to even|[Hh]alf[- ]?[Uu]p" },
  aggregate: ["rate"],
});
