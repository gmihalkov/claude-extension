import type { EngineInterface } from 'claude-code';

import { queryInterview } from '../../interview/queries/query-interview';
import { queryJournaledFiles } from '../../journal/queries/query-journaled-files';
import { isWriteAllowed } from '../../path/helpers/is-write-allowed';
import { queryRealPath } from '../../path/queries/query-real-path';
import type { WriteVerdict } from '../models/write-verdict';

export async function queryWriteVerdict($: EngineInterface, path: string): Promise<WriteVerdict> {
  const interview = await queryInterview($, await $.session.root());

  if (interview === undefined) {
    return {};
  }

  const real = await queryRealPath($, path);
  const journaled = await queryJournaledFiles($, interview);

  if (real === undefined || !isWriteAllowed(real, interview.dir, journaled)) {
    return {
      deny: `refine: writes are blocked during the interview active in this project. Use the interview folder ${interview.dir}, or record a cleanup plan first with the refine_cleanup tool. The user ends the interview with /refine restart.`,
    };
  }

  return journaled.includes(real) ? { capture: { dir: interview.dir, path: real } } : {};
}
