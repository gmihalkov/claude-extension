import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { INTERVIEW } from '../../interview/fixtures/interview';
import type { Interview } from '../../interview/models/interview';
import { queryPhaseClose } from '../queries/query-phase-close';

import { closeProposal } from './close-proposal';

test('the close proposal lists shell changes', async () => {
  const git: Interview = {
    ...INTERVIEW,
    isGit: true,
    baseline: { stash: 'abc', untracked: [], dirty: [] },
  };
  const fake = fakeEngine({
    files: { [`${INTERVIEW.dir}/journal.json`]: '[]' },
    run: (argv) =>
      argv[1] === 'status' ? { exitCode: 0, stdout: '?? scratch.sh\n', stderr: '' } : undefined,
  });

  expect(closeProposal(await queryPhaseClose(fake.$, git))).toContain('scratch.sh');
});
