import type { EngineInterface } from 'claude-code';

import { lines } from '../helpers/lines';
import type { GitBaseline } from '../models/git-baseline';

export async function queryShellChanges(
  $: EngineInterface,
  root: string,
  baseline: GitBaseline,
  journaled: readonly string[],
): Promise<string[]> {
  const status = await $.process.run(['git', 'status', '--porcelain', '-uall'], { cwd: root });
  const skipped = new Set(journaled.map((path) => path.replace(`${root}/`, '')));
  const changed: string[] = [];

  for (const line of lines(status.stdout)) {
    const path = line.slice(3).split(' -> ').pop() ?? '';

    if (skipped.has(path)) {
      continue;
    }

    // shortcut: a file untracked at the baseline is not in the stash, so its later edits are not
    // seen; upgrade by hashing untracked files into the baseline if that bites.
    if (baseline.untracked.includes(path)) {
      continue;
    }

    if (baseline.dirty.includes(path)) {
      const diff = await $.process.run(['git', 'diff', '--quiet', baseline.stash, '--', path], {
        cwd: root,
      });

      if (diff.exitCode === 0) {
        continue;
      }
    }

    changed.push(path);
  }

  return changed;
}
