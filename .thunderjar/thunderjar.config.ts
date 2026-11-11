import { declareConfig, postgresStore } from "thunderjar";

export default declareConfig({
  // Prerun and postrun images are pushed here. Needs `docker login ghcr.io` with a token
  // that has the write:packages scope.
  imageStore: { repository: "ghcr.io/blacksheep-bot/thunderjar-images" },
  // Run results go to Supabase Postgres. Export its connection URL in the shell that runs
  // thunderjar, e.g. postgres://postgres.<ref>:$SUPERBASE_PASSWORD@<host>:5432/postgres
  runDataStore: postgresStore({ urlEnv: "THUNDERJAR_DB_URL" }),
  // Containers run on a Docker daemon on Fly.io (app thunderjar-runtime-dwj, in syd).
  // The script starts the machine and a `fly proxy` to it as needed. Use `run --local`
  // to run on this machine instead.
  // Up to 2 containers run on it at once: it has 2 shared CPUs and 4 GB of memory. Raise it if
  // the machine is scaled up; `run --concurrency <n>` overrides it for one run.
  runtime: { command: ["./.thunderjar/fly-docker.sh"], concurrency: 2 },
});
