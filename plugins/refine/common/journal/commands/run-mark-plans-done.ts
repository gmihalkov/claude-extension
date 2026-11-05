import type { EngineInterface } from 'claude-code';

import type { Interview } from '../../interview/models/interview';
import { queryJournal } from '../queries/query-journal';

import { runWriteJournal } from './run-write-journal';

export async function runMarkPlansDone(
  $: EngineInterface,
  interview: Interview,
  ids: readonly string[],
): Promise<void> {
  const entries = await queryJournal($, interview.dir);

  for (const entry of entries) {
    if (entry.kind === 'plan' && ids.includes(entry.id)) {
      entry.restored = true;
    }
  }

  await runWriteJournal($, interview.dir, entries);
}
