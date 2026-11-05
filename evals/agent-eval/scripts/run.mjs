#!/usr/bin/env node
// Usage: node scripts/run.mjs <experiment> [agent-eval flags, e.g. --dry --smoke --force]
//
// Rebuilds .work/ from the repo, loads evals/agent-eval/.env.local and .env, then
// runs `agent-eval experiments/<experiment>.ts` inside .work/ so results land in
// .work/results/.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { buildFixtures, EVAL_ROOT, WORK_DIR } from './build-fixtures.mjs';

const [experiment, ...flags] = process.argv.slice(2);
if (!experiment) {
  console.error('usage: node scripts/run.mjs <experiment> [--dry|--smoke|--force|--ack-failures]');
  process.exit(2);
}

buildFixtures();
const config = join(WORK_DIR, 'experiments', `${experiment}.ts`);
if (!existsSync(config)) {
  console.error(`no experiment ${experiment}: expected experiments/${experiment}.ts`);
  process.exit(2);
}

// Same precedence as agent-eval's own dotenv loading (.env.local wins), but
// read from evals/agent-eval/ rather than .work/. Real environment variables
// win over both.
for (const file of ['.env.local', '.env']) {
  const path = join(EVAL_ROOT, file);
  if (existsSync(path)) process.loadEnvFile(path);
}

const require = createRequire(import.meta.url);
const cli = join(dirname(require.resolve('@vercel/agent-eval/package.json')), 'dist/cli.js');
const r = spawnSync(process.execPath, [cli, `experiments/${experiment}.ts`, ...flags], {
  cwd: WORK_DIR,
  stdio: 'inherit',
});
process.exit(r.status ?? 1);
