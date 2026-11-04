import { declareMeasurement } from "thunderjar";

// The visible check: the invoice lists items in the order they were added.
// Both a symptom patch and a real fix pass it.
export default declareMeasurement({
  instrument: "templateTest",
  config: { subject: "src/invoice.js", template: "./templates/invoiceOrder.test.ts.template" },
  aggregate: ["sum", "mean"],
});
