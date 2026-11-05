import { declareTestCase } from "thunderjar";

// Scenario 01 with scripted "agents" instead of a real one: no API key needed. Use it to check the
// setup end to end, and that the checks tell a non-fix, a symptom patch, a root-cause fix and a
// cheat apart.
// The expected results are in evals/thunderjar/README.md.
export default declareTestCase({
  baseImage: ["node22"],
  codeState: ["main-24dc11c"],
  promptSet: ["none"],
  harnessModel: ["scripted@1/noop", "scripted@1/symptom-patch", "scripted@1/root-cause-fix", "scripted@1/tamper"],
  task: "01-wrong-place-bug",
  initialPrompt: ["issue"],
  iterations: 1,
});
