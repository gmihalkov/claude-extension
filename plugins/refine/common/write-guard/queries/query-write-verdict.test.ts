import { expect, test } from 'claude-code/testing';

import { fakeEngine } from '../../engine/fixtures/fake-engine';
import { ROOT } from '../../engine/fixtures/root';
import { INTERVIEW } from '../../interview/fixtures/interview';
import { storeKey } from '../../interview/helpers/store-key';
import { runRecordCleanup } from '../../journal/commands/run-record-cleanup';

import { queryWriteVerdict } from './query-write-verdict';

const DIR = INTERVIEW.dir;

function setup(files: Record<string, string> = {}, links: Record<string, string> = {}) {
  return fakeEngine({
    files: {
      [`${DIR}/journal.json`]: '[]',
      [`${ROOT}/src/a.ts`]: 'old',
      ...files,
    },
    links,
    store: { [storeKey(ROOT)]: INTERVIEW },
  });
}

test('a project write without a journal entry is denied', async () => {
  const fake = setup();

  expect((await queryWriteVerdict(fake.$, `${ROOT}/src/a.ts`)).deny).toContain(
    'writes are blocked',
  );
});

test('the interview folder is free', async () => {
  const fake = setup();

  expect(await queryWriteVerdict(fake.$, `${DIR}/what.md`)).toEqual({});
});

test('a journaled path goes on after its original is saved', async () => {
  const fake = setup();

  await runRecordCleanup(fake.$, INTERVIEW, {
    path: `${ROOT}/src/a.ts`,
    plan: 'restore the original',
    kind: 'file',
  });

  expect(await queryWriteVerdict(fake.$, `${ROOT}/src/a.ts`)).toEqual({
    capture: { dir: DIR, path: `${ROOT}/src/a.ts` },
  });
});

test('dot-dot and symlinked paths are resolved', async () => {
  const fake = setup({ '/home/u/secret.txt': 's' }, { [`${DIR}/link`]: `${ROOT}/src` });

  expect((await queryWriteVerdict(fake.$, `${DIR}/../../../../secret.txt`)).deny).toContain(
    'writes are blocked',
  );
  expect((await queryWriteVerdict(fake.$, `${DIR}/link/a.ts`)).deny).toContain(
    'writes are blocked',
  );
});

test('no interview, no guard', async () => {
  const fake = fakeEngine({ files: { [`${ROOT}/src/a.ts`]: 'old' } });

  expect(await queryWriteVerdict(fake.$, `${ROOT}/src/a.ts`)).toEqual({});
});

test('a restored entry no longer covers writes', async () => {
  const fake = setup({
    [`${DIR}/journal.json`]: JSON.stringify([
      {
        id: 'j1',
        phase: 'what',
        path: `${ROOT}/src/a.ts`,
        plan: 'p',
        kind: 'file',
        original: 'file',
        restored: true,
      },
    ]),
  });

  expect((await queryWriteVerdict(fake.$, `${ROOT}/src/a.ts`)).deny).toContain(
    'writes are blocked',
  );
});

test("the mod's own control files are not writable", async () => {
  const fake = setup();

  expect((await queryWriteVerdict(fake.$, `${DIR}/journal.json`)).deny).toContain(
    'writes are blocked',
  );
  expect((await queryWriteVerdict(fake.$, `${DIR}/originals/j1`)).deny).toContain(
    'writes are blocked',
  );
});
