import { declareConfig, postgresStore, sqliteStore } from "thunderjar";

// With THUNDERJAR_RUN_DATA=sqlite, runs are recorded in a local SQLite file instead of Supabase:
// for machines that can't reach Postgres, e.g. a sandbox that only allows HTTPS.
const localRunData = Bun.env.THUNDERJAR_RUN_DATA === "sqlite";
// With THUNDERJAR_ON_RUNTIME=1, a remote execution runs on the Fly machine itself, in a runner: a
// container there, with Thunderjar and this folder, that runs the containers, measures them and
// writes the run data. `run` only builds, submits and follows: Ctrl-C leaves the execution running,
// and `thunderjar attach <execution ID>` follows it again. The runner logs in to ghcr with GHCR_USER
// and GHCR_TOKEN, sent to it with the model keys and THUNDERJAR_DB_URL as it starts.
const onRuntime = Bun.env.THUNDERJAR_ON_RUNTIME === "1";

export default declareConfig({
  // Prerun and postrun images are pushed here. Needs `docker login ghcr.io` with a token
  // that has the write:packages scope.
  imageStore: { repository: "ghcr.io/blacksheep-bot/thunderjar-images" },
  // Run results go to Supabase Postgres. Export its connection URL in the shell that runs
  // thunderjar, e.g. postgres://postgres.<ref>:$SUPERBASE_PASSWORD@<host>:5432/postgres
  runDataStore: localRunData
    ? sqliteStore({ path: "./.thunderjar/.data/runs.sqlite" })
    : postgresStore({ urlEnv: "THUNDERJAR_DB_URL" }),
  // Containers run on a Docker daemon on Fly.io (app thunderjar-runtime-dwj, in syd). Use
  // `run --local` to run on this machine instead.
  // Before each execution, fly-runtime.sh claims the machine, starts it, and sizes it for the
  // containers that run at once (half a CPU and 1 GB each). After, it releases it. The machine
  // stops itself after an hour idle (FLY_IDLE_MINUTES): see fly-machine-init.sh. Executions from
  // here and from Thunderjar's own repository share it. `run --concurrency <n>` overrides 16 for
  // one execution, and the machine is sized to match. Both scripts need FLYIO_TOKEN.
  runtime: {
    command: ["./.thunderjar/fly-docker.sh"],
    concurrency: 16,
    beforeExecution: ["./.thunderjar/fly-runtime.sh", "up"],
    afterExecution: ["./.thunderjar/fly-runtime.sh", "down"],
    ...(onRuntime && { runner: { registryLogin: { usernameEnv: "GHCR_USER", passwordEnv: "GHCR_TOKEN" } } }),
  },
});
