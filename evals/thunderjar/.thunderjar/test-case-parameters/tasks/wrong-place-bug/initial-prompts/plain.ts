import { declareInitialPrompt } from "thunderjar";

// The prompt from the scenario's README.
export default declareInitialPrompt({
  prompt: "Fix the issue described in ISSUE.md.",
  timeoutSeconds: 900,
});
