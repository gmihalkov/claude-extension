import type { EngineInterface } from 'claude-code';

import { HOME } from './home';
import { ROOT } from './root';

type RunAnswer = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

type FakeOptions = {
  files?: Record<string, string>;
  links?: Record<string, string>;
  store?: Record<string, unknown>;
  state?: Record<string, unknown>;
  run?: (argv: readonly string[]) => RunAnswer | undefined;
  root?: string;
  id?: string;
  home?: string;
  pluginRoot?: string;
};

type Fake = {
  $: EngineInterface;
  files: Map<string, string>;
  store: Map<string, unknown>;
  runs: string[][];
  submitted: string[];
  commands: { command: string; args?: string }[];
  tick: () => Promise<void>;
};

function normalize(path: string): string {
  const parts: string[] = [];

  for (const part of path.split('/')) {
    if (part === '' || part === '.') {
      continue;
    }

    if (part === '..') {
      parts.pop();
    } else {
      parts.push(part);
    }
  }

  return `/${parts.join('/')}`;
}

// A plain stand-in for the plugin's `$`: helper modules take `$`, and the test kit's `$` is the
// engine's side, so module tests hand them this one.
export function fakeEngine(options: FakeOptions = {}): Fake {
  const prompts = `${options.pluginRoot ?? '/plugins/refine'}/prompts`;
  const files = new Map(
    Object.entries({
      ...Object.fromEntries(
        ['common', 'what', 'how', 'catalog', 'what-template', 'how-template'].map((name) => [
          `${prompts}/${name}.md`,
          `${name.toUpperCase()} {{dir}}`,
        ]),
      ),
      ...options.files,
    }),
  );
  const links = new Map(Object.entries(options.links ?? {}));
  const store = new Map(Object.entries(options.store ?? {}));
  const state = new Map(Object.entries(options.state ?? {}));
  const runs: string[][] = [];
  const submitted: string[] = [];
  const commands: { command: string; args?: string }[] = [];
  const timers: (() => void)[] = [];
  const real = (path: string) => {
    const plain = normalize(path);

    for (const [link, target] of links) {
      if (plain === link || plain.startsWith(`${link}/`)) {
        return target + plain.slice(link.length);
      }
    }

    return plain;
  };
  const isDir = (path: string) => {
    const plain = real(path);

    return [...files.keys()].some((file) => file.startsWith(`${plain}/`));
  };
  const enoent = (path: string) => Object.assign(new Error(`ENOENT: ${path}`), { code: 'ENOENT' });
  const engine = {
    plugin: {
      name: 'refine',
      root: options.pluginRoot ?? '/plugins/refine',
    },
    fs: {
      read: async (path: string) => {
        const text = files.get(real(path));

        if (text === undefined) {
          throw enoent(path);
        }

        return text;
      },
      write: async (path: string, text: string) => {
        files.set(real(path), text);
      },
      exists: async (path: string) => files.has(real(path)) || isDir(path),
      list: async (path: string) => {
        const prefix = `${real(path)}/`;
        const names = new Set<string>();

        for (const file of files.keys()) {
          if (file.startsWith(prefix)) {
            names.add(file.slice(prefix.length).split('/')[0] ?? '');
          }
        }

        return [...names].map((name) => ({
          name,
          kind: files.has(prefix + name) ? 'file' : 'dir',
          size: 0,
          mtimeMs: 0,
          isLink: false,
        }));
      },
      stat: async (path: string) => {
        const target = real(path);

        if (!files.has(target) && !isDir(path)) {
          throw enoent(path);
        }

        return {
          kind: files.has(target) ? 'file' : 'dir',
          size: 0,
          mtimeMs: 0,
          isLink: links.has(normalize(path)),
          realPath: target,
        };
      },
    },
    process: {
      run: async (argv: readonly string[]) => {
        runs.push([...argv]);

        if (argv[0] === 'cp' && argv[2] !== undefined && argv[3] !== undefined) {
          files.set(real(argv[3]), files.get(real(argv[2])) ?? '');
        }

        if (argv[0] === 'rm' && argv[1] === '-rf' && argv[2] !== undefined) {
          const gone = real(argv[2]);

          for (const file of [...files.keys()]) {
            if (file === gone || file.startsWith(`${gone}/`)) {
              files.delete(file);
            }
          }
        }

        return {
          exitCode: 0,
          stdout: '',
          stderr: '',
          ...options.run?.(argv),
          isStdoutTruncated: false,
          isStderrTruncated: false,
        };
      },
    },
    store: {
      get: async (key: string) => store.get(key),
      set: async (key: string, value: unknown) => {
        store.set(key, structuredClone(value));
      },
      delete: async (key: string) => {
        store.delete(key);
      },
      keys: async () => [...store.keys()],
    },
    state: {
      get: async (ref: { key: string }) => ({
        value: state.get(ref.key),
        version: state.has(ref.key) ? 1 : 0,
      }),
      set: async (ref: { key: string }, value: unknown) => {
        state.set(ref.key, value);

        return { isSet: true, version: 1 };
      },
    },
    env: {
      get: async (name: string) => (name === 'HOME' ? (options.home ?? HOME) : undefined),
    },
    session: {
      id: async () => options.id ?? 's1',
      root: async () => options.root ?? ROOT,
    },
    prompt: {
      submit: async (input: { text: string }) => {
        submitted.push(input.text);

        return {};
      },
    },
    command: {
      run: async (input: { command: string; args?: string }) => {
        commands.push(input);

        return {};
      },
    },
    clock: {
      after: (_ms: number, fn: () => void) => {
        timers.push(fn);

        return { cancel: () => undefined };
      },
    },
  };

  return {
    $: engine as unknown as EngineInterface,
    files,
    store,
    runs,
    submitted,
    commands,
    // Fires the pending timers, as the engine does once the hook has answered.
    tick: async () => {
      for (const fn of timers.splice(0)) {
        fn();
      }

      await Promise.resolve();
    },
  };
}
