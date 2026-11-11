import { declareInitialPrompt } from "thunderjar";

export default declareInitialPrompt({
  prompt: "Fix the issue described in ISSUE.md.",
  timeoutSeconds: 900,
});
