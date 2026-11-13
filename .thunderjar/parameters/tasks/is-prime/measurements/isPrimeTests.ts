import { declareMeasurement } from "thunderjar";

// isPrime.test.ts, run with bun against the agent's isPrime.ts. Its tests are the ones the old
// template had. Without an isPrime.ts, the tests run against nothing and fail.
export default declareMeasurement({
  instrument: "bunTestFile",
  config: { subject: "**/isPrime.ts", test: "./isPrime.test.ts" },
  metrics: {
    // Each run's pass rate, passed / total, averaged.
    passRate: { stat: "mean", better: "higher" },
    // Tests passed, summed over the iterations: what the old `sum` added up.
    passed: { score: (v) => v.passed, stat: "sum", better: "higher" },
  },
});
