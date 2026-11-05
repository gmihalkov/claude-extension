import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { ROOT } from '../../engine/fixtures/root';
import { INTERVIEW } from '../../interview/fixtures/interview';
import type { JournalEntry } from '../models/journal-entry';
import { queryJournal } from '../queries/query-journal';
import { queryPendingPlans } from '../queries/query-pending-plans';

import { runRestorePhase } from './run-restore-phase';

const DIR = INTERVIEW.dir;

function entry(fields: Partial<JournalEntry> & Pick<JournalEntry, 'id' | 'path'>): JournalEntry {
  return {
    phase: 'what',
    plan: 'restore it',
    kind: 'file',
    restored: false,
    ...fields,
  };
}

test('runRestorePhase restores files and leaves plans pending', async () => {
  const plan = entry({ id: 'j3', path: 'docker container x', kind: 'plan' });
  const fake = fakeEngine({
    files: {
      [`${DIR}/journal.json`]: JSON.stringify([
        entry({ id: 'j1', path: `${ROOT}/a.ts`, original: 'file' }),
        entry({ id: 'j2', path: `${ROOT}/new.ts`, original: null }),
        plan,
      ]),
      [`${DIR}/originals/j1`]: 'old',
      [`${ROOT}/a.ts`]: 'changed',
      [`${ROOT}/new.ts`]: 'created',
    },
  });

  await runRestorePhase(fake.$, INTERVIEW, 'what');

  expect(fake.files.get(`${ROOT}/a.ts`)).toBe('old');
  expect(fake.runs).toContainEqual(['rm', '-f', `${ROOT}/new.ts`]);
  expect(await queryPendingPlans(fake.$, INTERVIEW, 'what')).toEqual([plan]);

  const journal = await queryJournal(fake.$, DIR);

  expect(journal.filter((item) => item.kind === 'file').every((item) => item.restored)).toBe(true);
});

test('pre-existing file restored, not deleted', async () => {
  const fake = fakeEngine({
    files: {
      [`${DIR}/journal.json`]: JSON.stringify([
        entry({ id: 'j1', path: `${ROOT}/a.ts`, original: 'file' }),
      ]),
      [`${DIR}/originals/j1`]: 'old',
      [`${ROOT}/a.ts`]: 'changed',
    },
  });

  await runRestorePhase(fake.$, INTERVIEW, 'what');

  expect(fake.files.get(`${ROOT}/a.ts`)).toBe('old');
  expect(fake.runs.filter((argv) => argv[0] === 'rm')).toEqual([]);
});
