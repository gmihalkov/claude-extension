import type { EngineInterface } from 'claude-code';

// The engine refuses $.prompt.submit and $.command.run inside a hook the turn waits on
// (command.run, session.compact), and a typed command fires no later turn.complete to move them to,
// so the call waits on a timer until the hook has answered.
// shortcut: relies on a timer leaving the hook's dispatch; switch to an after-command event once
// the engine offers one.
export function runLater($: EngineInterface, run: () => Promise<unknown>): void {
  $.clock.after(0, () => void run());
}
