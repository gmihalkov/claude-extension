import type { Hook } from 'claude-code';

import { queryInterview } from '../common/interview/queries/query-interview';
import { queryPhaseRules } from '../common/phase/queries/query-phase-rules';

// The phase rules ride in a context block, so every compaction brings them back.
export const promptContext: Hook<'prompt.context'> = async ($, e, next) => {
  const result = await next(e);
  const interview = await queryInterview($, await $.session.root());

  if (interview === undefined) {
    return result;
  }

  const text = (await queryPhaseRules($, interview.phase)).replaceAll('{{dir}}', interview.dir);

  return { ...result, blocks: [...result.blocks, { name: 'refine', text }] };
};
