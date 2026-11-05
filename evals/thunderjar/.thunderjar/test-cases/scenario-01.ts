import { declareTestCase } from "thunderjar";

// Scenario 01, "Bug reported in the wrong place", run by a real agent. Each iteration is its own
// container with a fresh copy of the project. To compare agents or models, add more entries to
// `harnessModel` (`<harness>@<version>/<model>`, as declared under harnessModels/): every entry is
// run `iterations` times.
export default declareTestCase({
  baseImage: ["node22"],
  codeState: ["main-24dc11c"],
  promptSet: ["none"],
  harnessModel: ["claude-code@2.1.311/sonnet-5-5"],
  task: "01-wrong-place-bug",
  initialPrompt: ["issue"],
  iterations: 3,
});
