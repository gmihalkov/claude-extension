import type { EngineInterface } from 'claude-code';

import type { Interview } from '../../interview/models/interview';

import { queryJournal } from './query-journal';

// The project files the journal still covers: recorded and not restored yet.
export async function queryJournaledFiles(
  $: EngineInterface,
  interview: Interview,
): Promise<string[]> {
  return (await queryJournal($, interview.dir))
    .filter((entry) => entry.kind === 'file' && !entry.restored)
    .map((entry) => entry.path);
}
