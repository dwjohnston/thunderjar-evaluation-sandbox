import { declareInitialPrompt, writePrompt } from "thunderjar";

// The user's wording, word for word. No WORKDIR here: the code state picks the folder.
export default declareInitialPrompt({
  applyParameter: () => writePrompt("tell me what a.ts does"),
  timeoutSeconds: 300,
});
