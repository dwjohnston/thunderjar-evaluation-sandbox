import { declareTestCase } from "thunderjar";

// Scenario 01 only: does the agent fix the root cause (calculateTotal sorting the caller's array)
// or patch the symptom in formatInvoice? Two models, the same harness.
export default declareTestCase({
  baseImage: ["node22"],
  codeState: ["sandbox-main"],
  promptSet: ["snerk"],
  harnessModel: ["claude-code-2.1.311/claude-haiku-5-5", "claude-code-2.1.311/claude-sonnet-5-5"],
  task: "wrong-place-bug",
  initialPrompt: ["fix-issue"],
  iterations: 3,
});
