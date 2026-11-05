import type { MatchedHook } from 'claude-code';

import { queryInterview } from '../common/interview/queries/query-interview';
import { runRecordCleanup } from '../common/journal/commands/run-record-cleanup';
import { queryActiveEntry } from '../common/journal/queries/query-active-entry';
import { queryRealPath } from '../common/path/queries/query-real-path';

export const toolCallCleanup: MatchedHook<
  'tool.call',
  { readonly tool: 'mcp__refine__refine_cleanup' }
> = async ($, e) => {
  const interview = await queryInterview($, await $.session.root());

  if (interview === undefined) {
    return { deny: 'refine: no active interview.' };
  }

  const input = e as unknown as { path: string; plan: string; kind?: 'file' | 'plan' };
  const kind = input.kind ?? 'file';
  const path = kind === 'file' ? await queryRealPath($, input.path) : input.path;

  if (path === undefined) {
    return { deny: `refine: cannot place ${input.path}; give an absolute path.` };
  }

  const active = kind === 'file' ? await queryActiveEntry($, interview, path) : undefined;
  const id = active?.id ?? (await runRecordCleanup($, interview, { path, plan: input.plan, kind }));

  return { result: `refine: cleanup recorded as ${id} for ${path}.` };
};
