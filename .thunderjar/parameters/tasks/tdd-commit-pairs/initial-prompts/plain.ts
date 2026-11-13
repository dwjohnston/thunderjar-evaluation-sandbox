import { declareInitialPrompt, writePrompt } from "thunderjar";

export default declareInitialPrompt({
  applyParameter: () => writePrompt("Fix the bugs in BUGS.md."),
  timeoutSeconds: 900,
});
