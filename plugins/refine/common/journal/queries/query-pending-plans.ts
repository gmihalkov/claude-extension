import type { EngineInterface } from 'claude-code';

import type { Interview } from '../../interview/models/interview';
import type { Phase } from '../../phase/models/phase';
import type { JournalEntry } from '../models/journal-entry';

import { queryJournal } from './query-journal';

// Cleanup plans the agent has not carried out yet: in one phase, or in all of them.
export async function queryPendingPlans(
  $: EngineInterface,
  interview: Interview,
  phase?: Phase,
): Promise<JournalEntry[]> {
  return (await queryJournal($, interview.dir)).filter(
    (entry) =>
      entry.kind === 'plan' && !entry.restored && (phase === undefined || entry.phase === phase),
  );
}
