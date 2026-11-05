import type { EngineInterface } from 'claude-code';

import { runRemoveWorktrees } from '../../git/commands/run-remove-worktrees';
import type { Interview } from '../../interview/models/interview';

import { runRestorePhase } from './run-restore-phase';

export async function runRestoreAll($: EngineInterface, interview: Interview): Promise<void> {
  await runRestorePhase($, interview, 'what');
  await runRestorePhase($, interview, 'how');

  if (interview.isGit) {
    await runRemoveWorktrees($, interview.root, interview.dir);
  }
}
