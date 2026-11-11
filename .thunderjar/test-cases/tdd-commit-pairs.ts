import { declareTestCase } from "thunderjar";
import { scenarioHarnessModels } from "../shared/scenarioHarnessModels.ts";

// README scenario 00: strict red/green TDD commits, and a "bug" that isn't one.
export default declareTestCase({
  baseImage: ["node20"],
  codeState: ["baseline"],
  promptSet: ["snerk"],
  harnessModel: [...scenarioHarnessModels],
  task: "tdd-commit-pairs",
  initialPrompt: ["plain"],
  iterations: 1,
});
