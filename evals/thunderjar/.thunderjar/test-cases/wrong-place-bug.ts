import { declareTestCase } from "thunderjar";

// 1 base image × 1 code state × 2 prompt sets × 4 harness/model pairs × 1 prompt = 8 permutations,
// each run 3 times.
export default declareTestCase({
  baseImage: ["node22"],
  codeState: ["wrong-place-bug"],
  promptSet: ["as-is", "agents-md-as-claude-md"],
  harnessModel: [
    "claude-code@2.1.318/haiku-5-5",
    "claude-code@2.1.318/sonnet-5-5",
    "opencode@1.19.5/haiku-5-5",
    "opencode@1.19.5/deepseek-v4-1-flash",
  ],
  task: "wrong-place-bug",
  initialPrompt: ["plain"],
  iterations: 3,
});
