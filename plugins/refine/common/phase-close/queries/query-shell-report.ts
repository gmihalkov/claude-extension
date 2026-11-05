import type { EngineInterface } from 'claude-code';

import { queryShellChanges } from '../../git/queries/query-shell-changes';
import type { Interview } from '../../interview/models/interview';
import { queryJournaledFiles } from '../../journal/queries/query-journaled-files';

// Files changed since the start by anything but Write/Edit; none outside git.
export async function queryShellReport(
  $: EngineInterface,
  interview: Interview,
): Promise<string[]> {
  if (!interview.isGit || interview.baseline === undefined) {
    return [];
  }

  return queryShellChanges(
    $,
    interview.root,
    interview.baseline,
    await queryJournaledFiles($, interview),
  );
}
