import { declareInitialPrompt } from "thunderjar";

export default declareInitialPrompt({
  prompt: "Implement all six utilities in src/strings/ so the tests pass. Work on them in parallel.",
  timeoutSeconds: 1200,
});
