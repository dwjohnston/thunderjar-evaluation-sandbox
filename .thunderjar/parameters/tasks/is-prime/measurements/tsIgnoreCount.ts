import { declareMeasurement } from "thunderjar";

export default declareMeasurement({
  instrument: "grep",
  config: { glob: "**/*.ts", pattern: "@ts-ignore" },
  metrics: {
    count: { stat: "mean", better: "lower" },
    maxCount: { stat: "max", better: "lower" },
  },
});
