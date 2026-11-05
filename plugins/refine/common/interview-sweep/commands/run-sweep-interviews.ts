import type { EngineInterface } from 'claude-code';

import { projectKey } from '../../interview/helpers/project-key';
import { queryInterview } from '../../interview/queries/query-interview';
import { runRemoveDir } from '../../path/commands/run-remove-dir';

// Deletes folders of interviews that ended without cleanup, unless their journal still has work.
export async function runSweepInterviews($: EngineInterface, root: string): Promise<void> {
  const home = (await $.env.get('HOME')) ?? '';
  const base = `${home}/.claude/projects/${projectKey(root)}/refine`;

  if (!(await $.fs.exists(base))) {
    return;
  }

  const active = await queryInterview($, root);

  for (const entry of await $.fs.list(base)) {
    const dir = `${base}/${entry.name}`;

    if (entry.kind !== 'dir' || dir === active?.dir) {
      continue;
    }

    const journal = await $.fs.read(`${dir}/journal.json`).then(
      (text) => JSON.parse(String(text)) as { restored: boolean }[],
      () => [],
    );

    if (journal.every((item) => item.restored)) {
      await runRemoveDir($, dir);
    }
  }
}
