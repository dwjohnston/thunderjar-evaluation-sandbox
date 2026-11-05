import { declareBaseImage } from "thunderjar";

// Node 22 (the sandbox needs 22+, and has no dependencies), with a git identity so the agent can
// commit. `--system`, so the harness's non-root user has it too.
export default declareBaseImage({
  applyParameter: () => `FROM node:22-bookworm
RUN git config --system user.name "Thunderjar agent" \\
  && git config --system user.email agent@thunderjar.invalid`,
});
