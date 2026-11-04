import { expect, test } from 'claude-code/testing';

test('/hello answers with a greeting', async ($, on) => {
  // Nothing sits beneath the plugin: these hooks stand for the engine.
  on('command.register', () => ({ value: { command: 'hello' } }));
  on('session.start', (_, e) => ({ cwd: e.cwd }));

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true });

  const result = await $.command.run({
    command: 'hello',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 80 },
  });

  expect(result.text).toBe('Hello from gm.');
});
