import { declareInitialPrompt } from "thunderjar";

export default declareInitialPrompt({
  prompt: "Implement `discount()` in src/retail/money.js as described in SPEC.md.",
  timeoutSeconds: 900,
});
