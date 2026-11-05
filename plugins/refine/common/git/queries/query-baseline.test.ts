import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { ROOT } from '../../engine/fixtures/root';

import { queryBaseline } from './query-baseline';

test('queryBaseline takes the stash and the dirty files', async () => {
  const fake = fakeEngine({
    run: (argv) => {
      if (argv[1] === 'stash') {
        return { exitCode: 0, stdout: 'abc123\n', stderr: '' };
      }

      if (argv[1] === 'diff') {
        return { exitCode: 0, stdout: 'a.ts\n', stderr: '' };
      }

      return undefined;
    },
  });

  expect(await queryBaseline(fake.$, ROOT)).toEqual({
    stash: 'abc123',
    untracked: [],
    dirty: ['a.ts'],
  });
});
