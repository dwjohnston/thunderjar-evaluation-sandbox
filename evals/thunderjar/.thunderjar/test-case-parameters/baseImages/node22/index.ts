import { declareBaseImage } from "thunderjar";

// Node 22 for the scenario, plus bun, which the templateTest measurements run their tests with.
export default declareBaseImage({
  applyParameter: () => `FROM node:22-bookworm
RUN npm install --global bun@1.3.14`,
});
