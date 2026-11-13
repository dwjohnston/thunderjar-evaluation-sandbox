import { declareInitialPrompt, writePrompt } from "thunderjar";

export default declareInitialPrompt({
  applyParameter: () => writePrompt("Implement all six utilities in src/strings/ so the tests pass. Work on them in parallel."),
  timeoutSeconds: 1200,
});
