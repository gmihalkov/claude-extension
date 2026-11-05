import type { Hook } from 'claude-code';

import { queryIsInterviewWrite } from '../common/write-guard/queries/query-is-interview-write';

// Claude Code asks before any write under ~/.claude; the mod answers that ask for its own
// folder only, and never lifts a deny.
export const toolCheck: Hook<'tool.check'> = async ($, e, next) => {
  const verdict = await next(e);
  const input = e.input as { file_path?: unknown; notebook_path?: unknown };
  const path = e.tool === 'NotebookEdit' ? input.notebook_path : input.file_path;
  const isFileTool = ['Write', 'Edit', 'NotebookEdit'].includes(e.tool);

  if (
    verdict.decision === 'ask' &&
    isFileTool &&
    typeof path === 'string' &&
    (await queryIsInterviewWrite($, path))
  ) {
    return { decision: 'allow', reason: 'refine: the interview folder' };
  }

  return verdict;
};
