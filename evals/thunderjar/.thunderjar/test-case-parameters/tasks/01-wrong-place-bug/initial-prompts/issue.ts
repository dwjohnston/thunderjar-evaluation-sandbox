import { declareInitialPrompt } from "thunderjar";

// The prompt from README.md, "01 · Bug reported in the wrong place".
export default declareInitialPrompt({
  prompt: "Fix the issue described in ISSUE.md.",
  timeoutSeconds: 1200,
});
