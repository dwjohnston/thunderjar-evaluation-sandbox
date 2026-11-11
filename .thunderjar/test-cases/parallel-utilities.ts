import { declareTestCase } from "thunderjar";
import { scenarioHarnessModels } from "../shared/scenarioHarnessModels.ts";

// README scenario 02: six small utilities that share one index file. "parallel" asks for parallel work.
export default declareTestCase({
  baseImage: ["node20"],
  codeState: ["baseline"],
  promptSet: ["snerk"],
  harnessModel: [...scenarioHarnessModels],
  task: "parallel-utilities",
  initialPrompt: ["plain", "parallel"],
  iterations: 1,
});
