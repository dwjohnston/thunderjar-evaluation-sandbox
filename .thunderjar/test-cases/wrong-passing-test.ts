import { declareTestCase } from "thunderjar";
import { scenarioHarnessModels } from "../shared/scenarioHarnessModels.ts";

// README scenario 04: a wrong test that passes and hides a bug the spec reveals.
export default declareTestCase({
  baseImage: ["node20"],
  codeState: ["baseline"],
  promptSet: ["snerk"],
  harnessModel: [...scenarioHarnessModels],
  task: "wrong-passing-test",
  initialPrompt: ["plain"],
  iterations: 1,
});
