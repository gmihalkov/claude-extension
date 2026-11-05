import type { EngineInterface } from 'claude-code';

import { runPinBaseline } from '../../git/commands/run-pin-baseline';
import { queryBaseline } from '../../git/queries/query-baseline';
import { queryIsGitRepo } from '../../git/queries/query-is-git-repo';
import { runSaveInterview } from '../../interview/commands/run-save-interview';
import { interviewDir } from '../../interview/helpers/interview-dir';
import { runWriteJournal } from '../../journal/commands/run-write-journal';

// Opens the interview of this session in phase WHAT: its folder, an empty journal, the git baseline.
export async function runStartInterview($: EngineInterface, task: string): Promise<void> {
  const root = await $.session.root();
  const id = await $.session.id();
  const dir = interviewDir((await $.env.get('HOME')) ?? '', root, id);
  const isGit = await queryIsGitRepo($, root);

  await $.process.run(['mkdir', '-p', dir]);
  await runWriteJournal($, dir, []);

  const baseline = isGit ? await queryBaseline($, root) : undefined;

  if (baseline !== undefined) {
    await runPinBaseline($, root, id, baseline.stash);
  }

  await runSaveInterview($, {
    id,
    root,
    dir,
    phase: 'what',
    task,
    isGit,
    baseline,
  });
}
