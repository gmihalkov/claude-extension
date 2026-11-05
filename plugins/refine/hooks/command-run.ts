import type { MatchedHook } from 'claude-code';

import { parseCommandArgs } from '../common/command-args/helpers/parse-command-args';
import { runLater } from '../common/engine/commands/run-later';
import { queryInterview } from '../common/interview/queries/query-interview';
import { runEndInterview } from '../common/interview-end/commands/run-end-interview';
import { runStartInterview } from '../common/interview-start/commands/run-start-interview';
import { queryPendingPlans } from '../common/journal/queries/query-pending-plans';
import { queryKickoffPrompt } from '../common/phase/queries/query-kickoff-prompt';
import { runClosePhase } from '../common/phase-close/commands/run-close-phase';
import { closeRefusal } from '../common/phase-close/helpers/close-refusal';
import { queryPhaseClose } from '../common/phase-close/queries/query-phase-close';
import { runQueueTransition } from '../common/phase-transition/commands/run-queue-transition';

const NO_GIT_WARNING =
  'This project is not a git repository: changes made through the shell are invisible to refine; rollback restores only what went through Write/Edit.';

export const commandRun: MatchedHook<'command.run', { readonly command: 'refine' }> = async (
  $,
  e,
) => {
  const args = parseCommandArgs(e.args);
  const root = await $.session.root();
  const interview = await queryInterview($, root);

  if (interview === undefined) {
    if (args.kind !== 'start') {
      return {
        text: args.kind === 'empty' ? 'Usage: /refine <task>' : 'refine: no active interview.',
      };
    }

    await runStartInterview($, args.task);

    const started = await queryInterview($, root);

    if (started === undefined) {
      throw new Error('refine: the interview was not saved');
    }

    const kickoff = await queryKickoffPrompt($, 'what', started, true);
    const text = started.isGit
      ? 'refine: phase WHAT started.'
      : `refine: phase WHAT started.\n${NO_GIT_WARNING}`;
    const { value: isInteractive = true } = await $.state.get({
      plugin: 'refine',
      key: 'isInteractive',
    });

    // A headless session drops a prompt submitted from a typed command, so the kickoff rides along
    // as context and the next message starts the turn.
    if (!isInteractive) {
      return { text: `${text}\nSend any message to begin.`, context: [kickoff] };
    }

    runLater($, () => $.prompt.submit({ text: kickoff }));

    return { text };
  }

  switch (args.kind) {
    case 'start':
    case 'empty':
      return {
        text: `refine: an interview is already active in phase ${interview.phase.toUpperCase()}. Run /refine continue to resume it or /refine restart to discard it.`,
      };
    case 'restart': {
      const plans = (await queryPendingPlans($, interview))
        .map((entry) => `\n- ${entry.path}: ${entry.plan}`)
        .join('');

      await runEndInterview($, interview);

      return {
        text: `refine: interview discarded; run /refine <task> to start over.${plans === '' ? '' : `\nCleanup plans never carried out:${plans}`}`,
      };
    }
    case 'back':
      if (interview.phase === 'what') {
        return { text: 'refine: already in phase WHAT.' };
      }

      await runQueueTransition($, interview, 'back');

      return { text: 'refine: returning to phase WHAT.' };
    case 'next': {
      const refusal = closeRefusal(await queryPhaseClose($, interview));

      if (refusal !== undefined) {
        return { text: refusal };
      }

      await runClosePhase($, interview);
      runLater($, () => $.command.run({ command: 'compact' }));

      return { text: 'refine: phase closed; the transition runs when this turn ends.' };
    }
    case 'continue':
      await runQueueTransition($, interview, 'continue');

      return { text: 'refine: resuming the interview.' };
  }
};
