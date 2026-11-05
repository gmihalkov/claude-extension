import type { Register } from 'claude-code';

import { commandRun } from './command-run';
import { promptContext } from './prompt-context';
import { sessionCompact } from './session-compact';
import { sessionStart } from './session-start';
import { toolCallCleanup } from './tool-call-cleanup';
import { toolCallClosePhase } from './tool-call-close-phase';
import { toolCallGuard } from './tool-call-guard';
import { toolCheck } from './tool-check';
import { turnComplete } from './turn-complete';

export const register: Register = (on) => {
  on('session.start', sessionStart);
  on('command.run', { command: 'refine' }, commandRun);
  on('tool.call', { tool: 'mcp__refine__refine_cleanup' }, toolCallCleanup);
  on('tool.call', { tool: 'mcp__refine__refine_close_phase' }, toolCallClosePhase);
  on('turn.complete', turnComplete);
  on('session.compact', sessionCompact);
  on('prompt.context', promptContext);
  on('tool.check', toolCheck);
  // A guard that fails refuses the write instead of letting it through.
  on('tool.call', { tool: ['Write', 'Edit', 'NotebookEdit'] }, toolCallGuard).catch((_, e, next) =>
    next.called ? next(e) : { deny: 'refine: the write guard failed; the write is refused.' },
  );
};
