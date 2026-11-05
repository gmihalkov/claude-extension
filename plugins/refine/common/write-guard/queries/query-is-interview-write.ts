import type { EngineInterface } from 'claude-code';

import { queryInterview } from '../../interview/queries/query-interview';
import { isWriteAllowed } from '../../path/helpers/is-write-allowed';
import { queryRealPath } from '../../path/queries/query-real-path';

// Whether a write lands in the active interview's folder, outside the mod's control files.
export async function queryIsInterviewWrite($: EngineInterface, path: string): Promise<boolean> {
  const interview = await queryInterview($, await $.session.root());
  const real = interview === undefined ? undefined : await queryRealPath($, path);

  return real !== undefined && interview !== undefined && isWriteAllowed(real, interview.dir, []);
}
