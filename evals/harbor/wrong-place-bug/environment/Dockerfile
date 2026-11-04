FROM node:22-bookworm

# The scenario's code, copied in by ../../sync.sh. Owned by the non-root `node`
# user, who the agent runs as (see [agent] user in task.toml).
WORKDIR /app
COPY --chown=node:node workspace/ /app/
RUN git init -q && git add -A \
 && git -c user.name=eval -c user.email=eval@example.com commit -qm base \
 && chown -R node:node /app
