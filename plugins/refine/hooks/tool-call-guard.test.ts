import { expect, mock, test } from 'claude-code/testing';

import { fakeEngine } from '../common/engine/fixtures/fake-engine';
import { HOME } from '../common/engine/fixtures/home';
import { ROOT } from '../common/engine/fixtures/root';
import { INTERVIEW } from '../common/interview/fixtures/interview';
import { storeKey } from '../common/interview/helpers/store-key';
import { runRecordCleanup } from '../common/journal/commands/run-record-cleanup';
import { queryJournal } from '../common/journal/queries/query-journal';

import { toolCallGuard } from './tool-call-guard';

const DIR = INTERVIEW.dir;

test('the Write hook denies through the engine', async ($, on) => {
  mock.store(on, { [storeKey(ROOT)]: INTERVIEW });
  mock.env(on, { HOME });
  on('session.root', () => ({ value: ROOT }));
  on('fs.stat', (_, e) => ({
    value: { kind: 'file', size: 0, mtimeMs: 0, isLink: false, realPath: e.path },
  }));
  on('fs.read', () => ({ value: '[]' }));

  const result = await $.tool.call({ tool: 'Write', file_path: `${ROOT}/src/a.ts`, content: 'x' });

  expect(result.deny).toContain('writes are blocked');
});

test('the Write hook fails closed', async ($, on) => {
  mock.store(on, { [storeKey(ROOT)]: INTERVIEW });
  mock.env(on, { HOME });
  on('session.root', () => ({ value: ROOT }));
  on('fs.stat', (_, e) => ({
    value: { kind: 'file', size: 0, mtimeMs: 0, isLink: false, realPath: e.path },
  }));
  on('fs.read', () => {
    throw new Error('ENOENT');
  });

  const result = await $.tool.call({ tool: 'Write', file_path: `${DIR}/what.md`, content: 'x' });

  expect(result.deny).toContain('refine');
});

function setup() {
  return fakeEngine({
    files: {
      [`${DIR}/journal.json`]: '[]',
      [`${ROOT}/src/a.ts`]: 'old',
    },
    store: { [storeKey(ROOT)]: INTERVIEW },
  });
}

function write(fake: ReturnType<typeof fakeEngine>, path: string) {
  return toolCallGuard(
    fake.$,
    { tool: 'Write', file_path: path, content: 'x' } as never,
    (async () => ({})) as never,
  );
}

test('a journaled write saves the original first', async () => {
  const fake = setup();
  const id = await runRecordCleanup(fake.$, INTERVIEW, {
    path: `${ROOT}/src/a.ts`,
    plan: 'restore the original',
    kind: 'file',
  });

  await write(fake, `${ROOT}/src/a.ts`);

  expect(fake.files.get(`${DIR}/originals/${id}`)).toBe('old');
});

test('original captured once', async () => {
  const fake = setup();
  const id = await runRecordCleanup(fake.$, INTERVIEW, {
    path: `${ROOT}/src/a.ts`,
    plan: 'restore the original',
    kind: 'file',
  });

  await write(fake, `${ROOT}/src/a.ts`);
  fake.files.set(`${ROOT}/src/a.ts`, 'new');
  await write(fake, `${ROOT}/src/a.ts`);

  expect(fake.files.get(`${DIR}/originals/${id}`)).toBe('old');
});

test('a created file is journaled as not existing', async () => {
  const fake = setup();

  await runRecordCleanup(fake.$, INTERVIEW, {
    path: `${ROOT}/src/new.ts`,
    plan: 'delete it',
    kind: 'file',
  });
  await write(fake, `${ROOT}/src/new.ts`);

  expect((await queryJournal(fake.$, DIR))[0]?.original).toBeNull();
});
