import { declareBaseImage } from "thunderjar";

// The project needs Node 22+ (`node --test test/cart/`). The measurements are templateTests, which
// thunderjar runs with `bun test` inside the measurement container, so bun is installed too.
export default declareBaseImage({
  applyParameter: () => `FROM node:22-bookworm
RUN npm install --global bun@1.3.14`,
});
