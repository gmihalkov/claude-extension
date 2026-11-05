import type { Hook } from 'claude-code';

import { queryInterview } from '../common/interview/queries/query-interview';

// A closed phase queues the mod's own /compact once the main loop's turn is over.
export const turnComplete: Hook<'turn.complete'> = async ($, e, next) => {
  const result = await next(e);

  if (e.agentId === undefined && (await queryInterview($, await $.session.root()))?.pending) {
    void $.command.run({ command: 'compact' });
  }

  return result;
};
