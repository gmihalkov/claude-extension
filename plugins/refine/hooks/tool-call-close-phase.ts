import type { MatchedHook } from 'claude-code';

import { queryInterview } from '../common/interview/queries/query-interview';
import { runMarkPlansDone } from '../common/journal/commands/run-mark-plans-done';
import { runClosePhase } from '../common/phase-close/commands/run-close-phase';
import { closeProposal } from '../common/phase-close/helpers/close-proposal';
import { closeRefusal } from '../common/phase-close/helpers/close-refusal';
import { queryPhaseClose } from '../common/phase-close/queries/query-phase-close';

export const toolCallClosePhase: MatchedHook<
  'tool.call',
  { readonly tool: 'mcp__refine__refine_close_phase' }
> = async ($, e) => {
  const interview = await queryInterview($, await $.session.root());

  if (interview === undefined) {
    return { deny: 'refine: no active interview.' };
  }

  const input = e as unknown as { confirmed: boolean; donePlans?: string[] };

  await runMarkPlansDone($, interview, input.donePlans ?? []);

  const close = await queryPhaseClose($, interview);

  if (!input.confirmed) {
    return { result: closeProposal(close) };
  }

  const refusal = closeRefusal(close);

  if (refusal !== undefined) {
    return { result: refusal };
  }

  await runClosePhase($, interview);

  return { result: 'refine: phase closed; the transition runs when this turn ends.' };
};
