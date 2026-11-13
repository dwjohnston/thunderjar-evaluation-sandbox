import { declareMeasurement } from "thunderjar";

// Re-exporting or importing src/text.js, whose truncate and slugify behave differently. 0 is good.
export default declareMeasurement({
  instrument: "grep",
  config: { glob: "src/strings/**/*.js", pattern: "text\\.js" },
  metrics: {
    lines: { stat: "mean", better: "lower" },
    maxLines: { stat: "max", better: "lower" },
  },
});
