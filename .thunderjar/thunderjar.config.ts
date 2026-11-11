import { declareConfig, postgresStore } from "thunderjar";

export default declareConfig({
  // Prerun and postrun images are pushed here. Needs `docker login ghcr.io` with a token
  // that has the write:packages scope.
  imageStore: { repository: "ghcr.io/blacksheep-bot/thunderjar-images" },
  // Run results go to Supabase Postgres. Export its connection URL in the shell that runs
  // thunderjar, e.g. postgres://postgres.<ref>:$SUPERBASE_PASSWORD@<host>:5432/postgres
  runDataStore: postgresStore({ urlEnv: "THUNDERJAR_DB_URL" }),
  // Containers run on a Docker daemon on Fly.io (app thunderjar-runtime-dwj, in syd). Use
  // `run --local` to run on this machine instead.
  // Before each run, fly-runtime.sh resizes the machine for the containers that run at once
  // (half a CPU and 1 GB each), and stops it after. `run --concurrency <n>` overrides 16 for
  // one run, and the machine is sized to match.
  runtime: {
    command: ["./.thunderjar/fly-docker.sh"],
    concurrency: 16,
    beforeRun: ["./.thunderjar/fly-runtime.sh", "up"],
    afterRun: ["./.thunderjar/fly-runtime.sh", "down"],
  },
});
