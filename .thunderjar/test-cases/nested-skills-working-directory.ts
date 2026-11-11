import { declareTestCase } from "thunderjar";

// "tell me what a.ts does", started in each of nested-skills/, nested-skills/a/ and
// nested-skills/b/, in three harnesses on the same cheap model, Haiku 5.5. The code states differ
// only in their working directory. If skills stack, expect:
//   nested-root: 🔴,    cherry
//   nested-a:    🔴 🟢, apple
//   nested-b:    🔴 🔵, banana
// Each harness needs its own key: ANTHROPIC_API_KEY, COPILOT_GITHUB_TOKEN and OPENCODE_API_KEY.
export default declareTestCase({
  baseImage: ["node20"],
  codeState: ["nested-root", "nested-a", "nested-b"],
  promptSet: ["none"],
  harnessModel: [
    "claude-code-2.1.311/claude-haiku-5-5",
    "copilot-1.0.105/claude-haiku-5.5",
    "opencode-1.19.5/opencode/claude-haiku-5-5",
  ],
  task: "what-does-a-ts-do",
  initialPrompt: ["plain"],
  iterations: 1,
});
