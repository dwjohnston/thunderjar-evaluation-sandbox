import { declareConfig, sqliteStore } from "thunderjar";

// As `thunderjar init` writes it. thunderjar@0.1.3-preview-73f04c4 doesn't read this file yet:
// images stay in the local Docker daemon, and run data goes to .thunderjar/.data/ (or --data-dir).
export default declareConfig({
  imageStore: { repository: "thunderjar-evaluation-sandbox" },
  runDataStore: sqliteStore({ path: "./.thunderjar/.data/runs.sqlite" }),
});
