import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { ROOT } from '../../engine/fixtures/root';
import { INTERVIEW } from '../../interview/fixtures/interview';

import { runCaptureOriginal } from './run-capture-original';
import { runRestorePhase } from './run-restore-phase';

const DIR = INTERVIEW.dir;

test('originals are copied byte for byte', async () => {
  const fake = fakeEngine({
    files: {
      [`${DIR}/journal.json`]: JSON.stringify([
        {
          id: 'j1',
          phase: 'what',
          path: `${ROOT}/a.bin`,
          plan: 'restore it',
          kind: 'file',
          restored: false,
        },
      ]),
      [`${ROOT}/a.bin`]: 'bytes',
    },
  });

  await runCaptureOriginal(fake.$, DIR, `${ROOT}/a.bin`);
  fake.files.set(`${ROOT}/a.bin`, 'changed');
  await runRestorePhase(fake.$, INTERVIEW, 'what');

  expect(fake.runs).toContainEqual(['cp', '-p', `${ROOT}/a.bin`, `${DIR}/originals/j1`]);
  expect(fake.runs).toContainEqual(['cp', '-p', `${DIR}/originals/j1`, `${ROOT}/a.bin`]);
  expect(fake.files.get(`${ROOT}/a.bin`)).toBe('bytes');
});
