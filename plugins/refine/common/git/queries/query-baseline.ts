import type { EngineInterface } from 'claude-code';

import { lines } from '../helpers/lines';
import type { GitBaseline } from '../models/git-baseline';

// The working tree as it stands: a stash commit of it (HEAD when clean), untracked and dirty files.
export async function queryBaseline($: EngineInterface, root: string): Promise<GitBaseline> {
  const created = await $.process.run(['git', 'stash', 'create'], { cwd: root });
  let stash = created.stdout.trim();

  if (stash === '') {
    stash = (await $.process.run(['git', 'rev-parse', 'HEAD'], { cwd: root })).stdout.trim();
  }

  const untracked = await $.process.run(['git', 'ls-files', '--others', '--exclude-standard'], {
    cwd: root,
  });
  const dirty = await $.process.run(['git', 'diff', '--name-only', 'HEAD'], { cwd: root });

  return {
    stash,
    untracked: lines(untracked.stdout),
    dirty: lines(dirty.stdout),
  };
}
