import { expect, test } from 'claude-code/testing';

import { parseCommandArgs } from './parse-command-args';

test('subcommand words only match alone', () => {
  expect(parseCommandArgs('next')).toEqual({ kind: 'next' });
  expect(parseCommandArgs('  back  ')).toEqual({ kind: 'back' });
  expect(parseCommandArgs('continue the export work')).toEqual({
    kind: 'start',
    task: 'continue the export work',
  });
  expect(parseCommandArgs('')).toEqual({ kind: 'empty' });
});
