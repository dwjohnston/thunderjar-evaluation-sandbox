import { declareInitialPrompt, writePrompt } from "thunderjar";

export default declareInitialPrompt({
  applyParameter: () => writePrompt("Fix the issue described in ISSUE.md."),
  timeoutSeconds: 900,
});
