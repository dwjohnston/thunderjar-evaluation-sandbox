import { declareBaseImage } from "thunderjar";

// Node 20 with a git identity, so an agent can commit. `--system`, so a harness that runs as
// another user has it too.
export default declareBaseImage({
  applyParameter: () => `FROM node:20-bookworm
RUN git config --system user.name "Thunderjar agent" \\
  && git config --system user.email agent@thunderjar.invalid`,
});
