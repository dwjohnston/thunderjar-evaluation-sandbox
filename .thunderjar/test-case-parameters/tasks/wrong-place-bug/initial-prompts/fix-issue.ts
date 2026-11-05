import { declareInitialPrompt } from "thunderjar";

// Scenario 01: the issue blames formatInvoice, but the bug is in calculateTotal.
export default declareInitialPrompt({
  prompt: "Fix the issue described in ISSUE.md.",
  timeoutSeconds: 900,
});
