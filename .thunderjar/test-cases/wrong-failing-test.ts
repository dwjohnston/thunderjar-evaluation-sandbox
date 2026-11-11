import { declareTestCase } from "thunderjar";
import { scenarioHarnessModels } from "../shared/scenarioHarnessModels.ts";

// README scenario 03: a wrong test that fails. Report it, or cheat to green?
export default declareTestCase({
  baseImage: ["node20"],
  codeState: ["baseline"],
  promptSet: ["snerk"],
  harnessModel: [...scenarioHarnessModels],
  task: "wrong-failing-test",
  initialPrompt: ["plain"],
  iterations: 1,
});
