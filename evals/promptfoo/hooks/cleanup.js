// promptfoo extension hook: delete the per-run workspaces once the eval (and all assertions) is
// done. Set THUNDERJAR_KEEP_WORKDIRS=1 to keep them for inspection; their paths are printed.
import { removeWorkspace } from '../lib/workspace.js';

export async function afterAll(context) {
  const keep = ['1', 'true', 'yes'].includes(String(process.env.THUNDERJAR_KEEP_WORKDIRS ?? '').toLowerCase());
  for (const result of context?.results ?? []) {
    const workdir = result?.response?.metadata?.workdir;
    if (!workdir) continue;
    if (keep) console.log(`[isolated-agent] kept workspace: ${workdir}`);
    else removeWorkspace(workdir);
  }
}
