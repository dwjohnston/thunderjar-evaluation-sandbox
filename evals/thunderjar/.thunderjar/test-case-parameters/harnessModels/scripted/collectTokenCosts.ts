import { declareTokenCostCollector } from "thunderjar";

// Scripts use no tokens.
export default declareTokenCostCollector(() => ({ outcome: "unavailable", reason: "notReported" }));
