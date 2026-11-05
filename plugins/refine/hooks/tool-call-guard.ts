import type { MatchedHook } from 'claude-code';

import { runCaptureOriginal } from '../common/journal/commands/run-capture-original';
import { queryWriteVerdict } from '../common/write-guard/queries/query-write-verdict';

// Write, Edit and NotebookEdit during an interview land only where rollback can undo them.
export const toolCallGuard: MatchedHook<
  'tool.call',
  { readonly tool: readonly ['Write', 'Edit', 'NotebookEdit'] }
> = async ($, e, next) => {
  const verdict = await queryWriteVerdict(
    $,
    e.tool === 'NotebookEdit' ? e.notebook_path : e.file_path,
  );

  if (verdict.deny !== undefined) {
    return { deny: verdict.deny };
  }

  if (verdict.capture !== undefined) {
    await runCaptureOriginal($, verdict.capture.dir, verdict.capture.path);
  }

  return next(e);
};
