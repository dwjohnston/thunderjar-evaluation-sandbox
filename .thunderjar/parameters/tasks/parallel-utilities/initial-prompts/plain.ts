import { declareInitialPrompt } from "thunderjar";

export default declareInitialPrompt({
  prompt: "Implement all six utilities in src/strings/ so the tests pass.",
  timeoutSeconds: 1200,
});
