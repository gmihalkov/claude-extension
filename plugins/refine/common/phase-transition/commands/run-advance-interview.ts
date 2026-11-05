import type { EngineInterface } from 'claude-code';

import { runSaveInterview } from '../../interview/commands/run-save-interview';
import type { Interview } from '../../interview/models/interview';
import { queryKickoffPrompt } from '../../phase/queries/query-kickoff-prompt';
import { transitionTarget } from '../helpers/transition-target';

// Moves the interview to the transition's phase and starts the agent's turn there.
export async function runAdvanceInterview($: EngineInterface, interview: Interview): Promise<void> {
  const next: Interview = { ...interview, phase: transitionTarget(interview).phase };

  delete next.pending;
  await runSaveInterview($, next);
  void $.prompt.submit({ text: await queryKickoffPrompt($, next.phase, next, false) });
}
