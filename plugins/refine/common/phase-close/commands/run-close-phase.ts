import type { EngineInterface } from 'claude-code';

import { runRemoveWorktrees } from '../../git/commands/run-remove-worktrees';
import { runSaveInterview } from '../../interview/commands/run-save-interview';
import type { Interview } from '../../interview/models/interview';
import { runRestorePhase } from '../../journal/commands/run-restore-phase';

// Rolls the phase back and marks the transition; the session.compact hook carries it out.
export async function runClosePhase($: EngineInterface, interview: Interview): Promise<void> {
  await runRestorePhase($, interview, interview.phase);

  if (interview.isGit) {
    await runRemoveWorktrees($, interview.root, interview.dir);
  }

  await runSaveInterview($, { ...interview, pending: 'next' });
}
