import { declareHarnessModels } from "thunderjar";

// Each name is the script in scripts/ that the harness runs.
export default declareHarnessModels({
  noop: "noop",
  "symptom-patch": "symptom-patch",
  "root-cause-fix": "root-cause-fix",
  tamper: "tamper",
});
