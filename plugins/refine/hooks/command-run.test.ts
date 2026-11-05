import { expect, mock, test } from 'claude-code/testing';

import { fakeEngine } from '../common/engine/fixtures/fake-engine';
import { HOME } from '../common/engine/fixtures/home';
import { ROOT } from '../common/engine/fixtures/root';
import { INTERVIEW } from '../common/interview/fixtures/interview';
import { storeKey } from '../common/interview/helpers/store-key';

import { commandRun } from './command-run';

test('/refine without a task prints usage', async ($, on) => {
  mock.store(on);
  mock.env(on, { HOME });
  on('session.root', () => ({ value: ROOT }));
  on('session.id', () => ({ value: 's1' }));
  on('fs.exists', () => ({ value: false }));
  on('command.register', () => ({ value: { command: 'refine' } }));
  on('session.start', (_, e) => ({ cwd: e.cwd }));

  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true });

  const result = await $.command.run({
    command: 'refine',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 80 },
  });

  expect(result.text).toBe('Usage: /refine <task>');
});

const DIR = INTERVIEW.dir;

async function refine(fake: ReturnType<typeof fakeEngine>, args: string) {
  return (await commandRun(
    fake.$,
    { command: 'refine', args } as never,
    (async () => ({})) as never,
  )) as { text: string; context?: string[] };
}

test('start creates the folder, journal and interview', async () => {
  const fake = fakeEngine();

  await refine(fake, 'add CSV export');

  expect(fake.files.get(`${DIR}/journal.json`)).toBe('[]');
  expect(fake.store.get(storeKey(ROOT))).toMatchObject({ phase: 'what', task: 'add CSV export' });
  // Submitting inside command.run would be refused, so the kickoff waits for the hook to answer.
  expect(fake.submitted).toHaveLength(0);
  await fake.tick();
  expect(fake.submitted).toHaveLength(1);
});

test('continue queues /compact after the hook answers', async () => {
  const fake = fakeEngine({ store: { [storeKey(ROOT)]: INTERVIEW } });

  await refine(fake, 'continue');

  expect(fake.store.get(storeKey(ROOT))).toMatchObject({ pending: 'continue' });
  expect(fake.commands).toHaveLength(0);
  await fake.tick();
  expect(fake.commands).toEqual([{ command: 'compact' }]);
});

test('non-git start warns', async () => {
  const fake = fakeEngine({
    run: (argv) =>
      argv[1] === 'rev-parse' ? { exitCode: 128, stdout: '', stderr: '' } : undefined,
  });

  const { text } = await refine(fake, 'add CSV export');

  expect(text).toContain('changes made through the shell are invisible');
});

test('second start offers continue or restart', async () => {
  const fake = fakeEngine({ store: { [storeKey(ROOT)]: INTERVIEW } });

  const { text } = await refine(fake, 'other');

  expect(text).toContain('/refine continue');
  expect(text).toContain('/refine restart');
  expect(fake.store.get(storeKey(ROOT))).toEqual(INTERVIEW);
  expect(fake.submitted).toHaveLength(0);
});

test('restart rolls back, deletes the folder and forgets the interview', async () => {
  const fake = fakeEngine({
    store: { [storeKey(ROOT)]: INTERVIEW },
    files: {
      [`${DIR}/journal.json`]: JSON.stringify([
        {
          id: 'j1',
          phase: 'what',
          path: `${ROOT}/a.ts`,
          plan: 'p',
          kind: 'file',
          original: 'file',
          restored: false,
        },
      ]),
      [`${DIR}/originals/j1`]: 'old',
      [`${ROOT}/a.ts`]: 'changed',
    },
  });

  await refine(fake, 'restart');

  expect(fake.files.get(`${ROOT}/a.ts`)).toBe('old');
  expect(fake.files.has(`${DIR}/journal.json`)).toBe(false);
  expect(fake.store.has(storeKey(ROOT))).toBe(false);
});

test('headless start hands the kickoff over as command context', async () => {
  const fake = fakeEngine({ state: { isInteractive: false } });

  const result = await refine(fake, 'add CSV export');

  expect(result.context?.[0]).toContain('Task: add CSV export');
  expect(fake.submitted).toHaveLength(0);
});

test('/refine next runs the close checks', async () => {
  const fake = fakeEngine({
    store: { [storeKey(ROOT)]: INTERVIEW },
    files: { [`${DIR}/journal.json`]: '[]' },
  });

  expect((await refine(fake, 'next')).text).toContain('what.md');
  expect(fake.commands).toHaveLength(0);
});
