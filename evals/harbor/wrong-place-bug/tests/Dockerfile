FROM node:22-bookworm

# The verifier's own image. The agent's /app is copied in after the agent
# finishes (see artifacts in task.toml); the grader lives only here.
WORKDIR /app
COPY . /tests/
