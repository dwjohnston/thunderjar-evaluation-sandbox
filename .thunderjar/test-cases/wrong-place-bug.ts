import { declareTestCase } from "thunderjar";
import { scenarioHarnessModels } from "../shared/scenarioHarnessModels.ts";

// README scenario 01: a bug report that blames the wrong function.
export default declareTestCase({
  baseImage: ["node20"],
  codeState: ["baseline"],
  promptSet: ["snerk"],
  harnessModel: [...scenarioHarnessModels],
  task: "wrong-place-bug",
  initialPrompt: ["plain"],
  iterations: 1,
});
