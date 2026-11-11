import { declareConfig, sqliteStore } from "thunderjar";

export default declareConfig({
  // Images stay in the local Docker daemon. To push them to a registry, name its repository,
  // e.g. { repository: "ghcr.io/your-org/thunderjar-images" }, and `docker login` to it.
  imageStore: null,
  // Runs are recorded in a local file.
  runDataStore: sqliteStore({ path: "./.thunderjar/.data/runs.sqlite" }),
  // The test case has three harnesses: their prerun images build side by side.
  build: { concurrency: 3 },
});
