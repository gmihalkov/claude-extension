import type { Hook } from 'claude-code';

import { runSaveInterview } from '../common/interview/commands/run-save-interview';
import { queryInterview } from '../common/interview/queries/query-interview';
import { runEndInterview } from '../common/interview-end/commands/run-end-interview';
import { runAdvanceInterview } from '../common/phase-transition/commands/run-advance-interview';
import { isFinalTransition } from '../common/phase-transition/helpers/is-final-transition';
import { queryTransitionMessages } from '../common/phase-transition/queries/query-transition-messages';

// Only the mod's own compaction, queued after a phase transition: every other one goes on as is.
export const sessionCompact: Hook<'session.compact'> = async ($, e, next) => {
  const interview =
    e.agentId === undefined && e.trigger !== 'precompute'
      ? await queryInterview($, await $.session.root())
      : undefined;

  if (interview?.pending === undefined) {
    return next(e);
  }

  try {
    // The documents are read before the final transition deletes them.
    const messages = await queryTransitionMessages($, interview);

    if (isFinalTransition(interview)) {
      await runEndInterview($, interview);
    } else {
      await runAdvanceInterview($, interview);
    }

    return { messages };
  } catch (error) {
    // Never fall back to a summary: keep the conversation, drop the transition, say why.
    const left = await queryInterview($, interview.root);

    if (left !== undefined) {
      await runSaveInterview($, { ...left, pending: undefined });
    }

    return {
      skip: `refine: the phase transition failed (${String(error)}); run /refine continue.`,
    };
  }
};
