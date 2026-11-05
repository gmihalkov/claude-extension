import type { CommandArgs } from '../models/command-args';

const SUBCOMMANDS = ['continue', 'restart', 'next', 'back'] as const;

// A subcommand only when the word stands alone; anything else is a task.
export function parseCommandArgs(args: string): CommandArgs {
  const task = args.trim();

  if (task === '') {
    return { kind: 'empty' };
  }

  const subcommand = SUBCOMMANDS.find((word) => word === task);

  return subcommand === undefined ? { kind: 'start', task } : { kind: subcommand };
}
