import type { Hook } from 'claude-code';

import { runSweepInterviews } from '../common/interview-sweep/commands/run-sweep-interviews';

export const sessionStart: Hook<'session.start'> = async ($, e, next) => {
  await $.state.set({ plugin: 'refine', key: 'isInteractive' }, e.isInteractive);
  await $.command.register({
    name: 'refine',
    description: 'Clarify a task: WHAT, then HOW',
    argumentHint: '<task> | continue | restart | next | back',
  });
  await $.tool.register({
    name: 'refine_cleanup',
    description:
      'During a refine interview, record how you will undo something before you do it. kind "file": a path you are about to write in the project; refine saves its original on the first write and restores it when the phase closes. kind "plan": anything else (a container, a package, a service); you carry out the plan yourself before the phase closes.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Absolute path to write, or what the plan cleans up',
        },
        plan: {
          type: 'string',
          description: 'How it will be undone',
        },
        kind: {
          type: 'string',
          enum: ['file', 'plan'],
        },
      },
      required: ['path', 'plan'],
    },
  });
  await $.tool.register({
    name: 'refine_close_phase',
    description:
      'Close the current refine phase. First call with confirmed: false to collect what the close proposal must show the user (cleanup plans not carried out, files changed outside Write/Edit). Call with confirmed: true only after the user explicitly confirmed closing the phase; pass the ids of cleanup plans you carried out in donePlans.',
    inputSchema: {
      type: 'object',
      properties: {
        confirmed: {
          type: 'boolean',
        },
        donePlans: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['confirmed'],
    },
  });
  await runSweepInterviews($, await $.session.root());

  return next(e);
};
