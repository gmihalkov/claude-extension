import type { EngineInterface } from 'claude-code';

import { runLater } from '../../engine/commands/run-later';
import { runSaveInterview } from '../../interview/commands/run-save-interview';
import type { Interview } from '../../interview/models/interview';
import type { Transition } from '../../interview/types/transition';

// Marks the transition and queues /compact: the session.compact hook does the rest between turns.
export async function runQueueTransition(
  $: EngineInterface,
  interview: Interview,
  pending: Transition,
): Promise<void> {
  await runSaveInterview($, { ...interview, pending });
  runLater($, () => $.command.run({ command: 'compact' }));
}
