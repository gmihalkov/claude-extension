import type { EngineInterface } from 'claude-code';

import type { Interview } from '../../interview/models/interview';
import type { Phase } from '../models/phase';

import { queryPhaseRules } from './query-phase-rules';

// After a transition the rules arrive in the `refine` context block the compaction re-creates, so
// only the first kickoff carries them.
export async function queryKickoffPrompt(
  $: EngineInterface,
  phase: Phase,
  interview: Interview,
  withRules: boolean,
): Promise<string> {
  const rules = withRules
    ? `${(await queryPhaseRules($, phase)).replaceAll('{{dir}}', interview.dir)}\n\n`
    : '';
  const start =
    phase === 'what'
      ? `Start or resume phase WHAT. Task: ${interview.task}`
      : 'Start phase HOW from the WHAT document above.';

  return `${rules}${start}`;
}
