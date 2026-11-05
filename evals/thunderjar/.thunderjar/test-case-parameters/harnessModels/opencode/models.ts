import { declareHarnessModels } from "thunderjar";

// Models come and go: check https://opencode.ai/zen/v1/models for the current IDs.
export default declareHarnessModels({
  // The same model Claude Code runs, so the harness is the only difference.
  "haiku-5-5": "opencode/claude-haiku-5-5",
  // A cheap model.
  "deepseek-v4-1-flash": "opencode/deepseek-v4.1-flash",
});
