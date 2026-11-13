import { declareInitialPrompt, writePrompt } from "thunderjar";

export default declareInitialPrompt({
  applyParameter: () => writePrompt("Implement `discount()` in src/retail/money.js as described in SPEC.md."),
  timeoutSeconds: 900,
});
