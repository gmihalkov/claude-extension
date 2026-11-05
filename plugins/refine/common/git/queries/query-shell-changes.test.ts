import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { ROOT } from '../../engine/fixtures/root';

import { queryShellChanges } from './query-shell-changes';

test('queryShellChanges ignores baseline and journaled paths', async () => {
  const fake = fakeEngine({
    run: (argv) => {
      if (argv[1] === 'status') {
        return { exitCode: 0, stdout: ' M a.ts\n M b.ts\n?? c.ts\n', stderr: '' };
      }

      return undefined;
    },
  });
  const baseline = { stash: 'abc123', untracked: [], dirty: ['a.ts'] };

  expect(await queryShellChanges(fake.$, ROOT, baseline, [`${ROOT}/b.ts`])).toEqual(['c.ts']);
});
