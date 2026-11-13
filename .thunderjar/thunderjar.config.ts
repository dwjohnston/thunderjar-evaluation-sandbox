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
  // Containers run on a Docker daemon on a Fly.io machine, in app thunderjar-runtime-dwj (syd),
  // shared with Thunderjar's own repository. FLY_MACHINE picks which of the app's machines. Thunderjar
  // doesn't start, stop or clear it down: run `.thunderjar/fly-machine.sh start` before working,
  // `prune` when its disk fills, and `stop` when done. Use `run --local` to run on this machine
  // instead. `run --concurrency <n>` overrides 16 for one execution. The scripts need FLYIO_TOKEN.
  runtime: {
    command: ["./.thunderjar/fly-docker.sh"],
    concurrency: 16,
    ...(onRuntime && { runner: { registryLogin: { usernameEnv: "GHCR_USER", passwordEnv: "GHCR_TOKEN" } } }),
  },
});
