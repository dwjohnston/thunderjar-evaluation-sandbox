// Offline self-test: run promptfooconfig.selftest.yaml (scripted fake agents, no API key) and
// check every assertion gave the verdict we expect for each kind of fix.
//   npm run selftest
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'thunderjar-selftest-'));
const outFile = path.join(outDir, 'results.json');

// [pass, score] per metric. diff_location has weight 0, so it always "passes"; its score is
// what carries the signal.
const EXPECTED = {
  'fake-root-cause-fix': { cart_tests: [true, 1], root_cause: [true, 1], diff_location: [true, 1], overall: true },
  'fake-both-files': { cart_tests: [true, 1], root_cause: [true, 1], diff_location: [true, 0.5], overall: true },
  'fake-symptom-patch': { cart_tests: [true, 1], root_cause: [false, 0], diff_location: [true, 0], overall: false },
  'fake-noop': { cart_tests: [false, 0], root_cause: [false, 0], diff_location: [true, 0], overall: false },
};

const bin = path.join(here, 'node_modules/.bin/promptfoo');
const r = spawnSync(bin, ['eval', '-c', 'promptfooconfig.selftest.yaml', '--no-cache', '--no-write', '--no-progress-bar', '-o', outFile], {
  cwd: here,
  stdio: 'inherit',
  env: { ...process.env, SELFTEST_AGENTS: path.join(here, 'selftest/agents'), PROMPTFOO_DISABLE_TELEMETRY: '1' },
});
// promptfoo exits non-zero when any test fails, which is expected here (two fakes should fail).
if (!fs.existsSync(outFile)) {
  console.error(`promptfoo produced no results (exit ${r.status})`);
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(outFile, 'utf8')).results.results;
let failures = 0;
const seen = new Set();
for (const res of results) {
  const label = res.provider?.label ?? res.provider?.id;
  const want = EXPECTED[label];
  if (!want) continue;
  seen.add(label);
  const got = { overall: res.success };
  for (const c of res.gradingResult?.componentResults ?? []) {
    if (c.assertion?.metric) got[c.assertion.metric] = [c.pass, c.score];
  }
  for (const [key, exp] of Object.entries(want)) {
    const ok = JSON.stringify(got[key]) === JSON.stringify(exp);
    if (!ok) failures++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${label} ${key}: expected ${JSON.stringify(exp)}, got ${JSON.stringify(got[key])}`);
  }
  if (res.response?.error) console.log(`     (${label} provider error: ${res.response.error})`);
}
for (const label of Object.keys(EXPECTED)) {
  if (!seen.has(label)) {
    failures++;
    console.log(`FAIL ${label}: no result`);
  }
}
fs.rmSync(outDir, { recursive: true, force: true });
console.log(failures ? `\n${failures} self-test check(s) failed` : '\nself-test passed');
process.exit(failures ? 1 : 0);
