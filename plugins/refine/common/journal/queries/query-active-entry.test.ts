import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { ROOT } from '../../engine/fixtures/root';
import { INTERVIEW } from '../../interview/fixtures/interview';
import { runRecordCleanup } from '../commands/run-record-cleanup';
import { runRestorePhase } from '../commands/run-restore-phase';

import { queryActiveEntry } from './query-active-entry';

test('a recorded file stays the active entry until it is restored', async () => {
  const fake = fakeEngine({ files: { [`${INTERVIEW.dir}/journal.json`]: '[]' } });
  const path = `${ROOT}/a.ts`;
  const id = await runRecordCleanup(fake.$, INTERVIEW, { path, plan: 'restore', kind: 'file' });

  expect((await queryActiveEntry(fake.$, INTERVIEW, path))?.id).toBe(id);

  await runRestorePhase(fake.$, INTERVIEW, 'what');

  expect(await queryActiveEntry(fake.$, INTERVIEW, path)).toBeUndefined();
});
