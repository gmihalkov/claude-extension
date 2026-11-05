import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { HOME } from '../../engine/fixtures/home';
import { ROOT } from '../../engine/fixtures/root';

import { runSweepInterviews } from './run-sweep-interviews';

test('sweep keeps folders with unrestored journal entries', async () => {
  const base = `${HOME}/.claude/projects/-home-u-Dev-app/refine`;
  const fake = fakeEngine({
    files: {
      [`${base}/old1/journal.json`]: '[]',
      [`${base}/old2/journal.json`]: JSON.stringify([{ id: 'j1', restored: false }]),
    },
  });

  await runSweepInterviews(fake.$, ROOT);

  expect(fake.runs.filter((argv) => argv[0] === 'rm')).toEqual([['rm', '-rf', `${base}/old1`]]);
});
