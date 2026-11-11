import { declareInitialPrompt } from "thunderjar";

export default declareInitialPrompt({
  prompt: "Implement `discount()` in src/wholesale/money.js as described in SPEC.md.",
  timeoutSeconds: 900,
});
