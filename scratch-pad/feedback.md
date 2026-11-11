# Thunderjar feedback (from setting up ghcr + Supabase + Fly.io, 0.3.0-preview-de63488)

## Skill (`tj-config`) is out of date
- Says `sqliteStore` is the only `runDataStore`. 0.3.0 also ships `postgresStore({ urlEnv })`, and the scaffolded config comment even suggests it. The skill and the scaffold contradict each other.
- Doesn't mention the `runtime` field (`{ command: [...] }`) or that it requires an `imageStore`.
- Doesn't mention `thunderjar doctor`. It only suggests `plan` to check the config, and `plan` fails on unrelated things (e.g. a missing `ANTHROPIC_API_KEY`) before you know whether the config is good.

## Skill gaps
- No guidance for hosted Postgres (Supabase, Neon…): which connection string to use (pooler vs direct, `sslmode`), and that a password alone isn't enough.
- No guidance for remote runtimes beyond "a docker command". Users ask for "Fly.io" etc.; say plainly which platforms work (anything exposing a Docker daemon) and which don't (Fly Machines, without running your own Docker host).
- ghcr: note that the token's account must own the namespace (or be an org member with package rights). A bot token can't push to `ghcr.io/<other-user>/…`. Also note that newly added scopes can take a moment to apply.

## Framework
- `doctor` checks that a login *exists*, not that it can push. Without a `runtime` it never test-pushes, so a login that can't push passes and only fails later at `build`/`run`. It should do the push probe whenever `imageStore` is set.
- `plan` should validate the config first and report config errors on their own, separately from missing harness env vars.
- `doctor` could check that a `postgresStore`'s `urlEnv` is set and that the database connects.
- Postgres errors could say more. "Connection closed" was really "host doesn't resolve over IPv4" (Supabase's direct host is IPv6-only); the skill should point Supabase users to the session pooler URL.
- Remote runtime CPU mismatch: images are built locally (arm64 on Apple Silicon) but the runtime may be amd64 (Fly). `doctor` only says "no matching manifest for linux/amd64". Thunderjar should build for the runtime's platform (e.g. ask it with `docker version`) or have a `build.platform` option; for now, `DOCKER_DEFAULT_PLATFORM=linux/amd64` works.
- `doctor`'s probe image is `FROM scratch` with no `RUN`, so it can't catch a build host that can't run the runtime's architecture.
- No built-in way to start or tunnel to a remote runtime. Fly needed a wrapper script (start machine + `fly proxy`) as `runtime.command`.
- The image hash ignores the CPU platform. After switching to amd64, `run` reused the cached arm64 prerun image (same hash) and pushed it, so the runtime still couldn't pull it. The platform should be part of the hash or the tag, or `run` should check a cached image's architecture against the runtime's.
- When the agent exits non-zero in milliseconds, `show <exec> <run>` records nothing useful: no stderr, an empty result file. Thunderjar should capture the agent's stderr (or the last lines of its output) on failure. Here, a `fly proxy` tunnel was silently dropping attached container output.
- `doctor` should check that output from an attached `docker run` reaches the client, not just that the runtime can pull. A runtime that drops output passes `doctor`.
