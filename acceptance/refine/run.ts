// Runs one live refine interview with a persona playing the user:
// `bun acceptance/refine/run.ts <task> [--max-rounds 20] [--model <model>]`.
// Prints the path of the run.json that check.ts reads.
import { createHash, randomUUID } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join, relative } from 'node:path';

import type { Run } from './run-record';

type Fixture = {
  git?: boolean;
  dirty?: Record<string, string>;
};

type Event = {
  type: string;
  subtype?: string;
  result?: string;
  total_cost_usd?: number;
};

const HERE = import.meta.dir;
const REPO = join(HERE, '..', '..');
const args = process.argv.slice(2);
const task = args[0];
const option = (name: string, fallback: string) => {
  const index = args.indexOf(name);

  return index === -1 ? fallback : (args[index + 1] ?? fallback);
};
const maxRounds = Number(option('--max-rounds', '20'));
const model = option('--model', '');

if (task === undefined || !existsSync(join(HERE, 'fixtures', task))) {
  console.error(
    `usage: bun acceptance/refine/run.ts <${readdirSync(join(HERE, 'fixtures')).join('|')}>`,
  );
  process.exit(2);
}

const fixtureDir = join(HERE, 'fixtures', task);
const fixture: Fixture = existsSync(join(fixtureDir, 'fixture.json'))
  ? (JSON.parse(readFileSync(join(fixtureDir, 'fixture.json'), 'utf8')) as Fixture)
  : {};
const scratch = realpathSync(mkdtempSync(join(tmpdir(), 'refine-run-')));
const cwd = join(scratch, 'project');

function sh(argv: string[]): string {
  const result = Bun.spawnSync(argv, { cwd });

  return result.stdout.toString();
}

function hashes(): Record<string, string> {
  const found: Record<string, string> = {};
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);

      if (name === '.git') {
        continue;
      }

      if (statSync(path).isDirectory()) {
        walk(path);
      } else {
        found[relative(cwd, path)] = createHash('sha256').update(readFileSync(path)).digest('hex');
      }
    }
  };

  walk(cwd);

  return found;
}

cpSync(join(fixtureDir, 'project'), cwd, { recursive: true });

if (fixture.git) {
  sh(['git', 'init', '-q']);
  sh(['git', 'add', '-A']);
  sh([
    'git',
    '-c',
    'user.name=refine',
    '-c',
    'user.email=refine@example.invalid',
    'commit',
    '-qm',
    'fixture',
  ]);

  for (const [path, content] of Object.entries(fixture.dirty ?? {})) {
    writeFileSync(join(cwd, path), content);
  }
}

const gitStatus = () => (fixture.git ? sh(['git', 'status', '--porcelain']) : undefined);
const hashesBefore = hashes();
const gitBefore = gitStatus();
const sessionId = randomUUID();
const interviewDir = join(
  homedir(),
  '.claude',
  'projects',
  cwd.replaceAll('/', '-'),
  'refine',
  sessionId,
);
const started = Date.now();
let costUsd = 0;
const violations: string[] = [];
const hidden = readFileSync(join(fixtureDir, 'hidden.md'), 'utf8');
const persona = readFileSync(join(HERE, 'persona.md'), 'utf8');
const interviewer = Bun.spawn(
  [
    'claude',
    '-p',
    '--plugin-dir',
    join(REPO, 'plugins', 'refine'),
    '--session-id',
    sessionId,
    '--input-format',
    'stream-json',
    '--output-format',
    'stream-json',
    '--verbose',
    '--permission-mode',
    'acceptEdits',
    '--allowedTools',
    'WebSearch',
    'WebFetch',
    ...(model === '' ? [] : ['--model', model]),
  ],
  { cwd, stdin: 'pipe', stdout: 'pipe', stderr: 'inherit' },
);

function send(text: string) {
  interviewer.stdin.write(
    `${JSON.stringify({ type: 'user', message: { role: 'user', content: text } })}\n`,
  );
  interviewer.stdin.flush();
  console.log(`>> ${text.slice(0, 200).replaceAll('\n', ' ')}`);
}

const queue: Event[] = [];
let wake: () => void = () => {};
let isOver = false;

void (async () => {
  const decoder = new TextDecoder();
  let buffer = '';

  for await (const chunk of interviewer.stdout) {
    buffer += decoder.decode(chunk);

    const lines = buffer.split('\n');

    buffer = lines.pop() ?? '';
    queue.push(
      ...lines.filter((line) => line.trim() !== '').map((line) => JSON.parse(line) as Event),
    );
    wake();
  }

  isOver = true;
  wake();
})();

// The next event, or undefined after `ms` without one (or when the stream ended).
async function nextEvent(ms: number): Promise<Event | undefined> {
  if (queue.length === 0 && !isOver) {
    await new Promise<void>((resolve) => {
      wake = resolve;
      setTimeout(resolve, ms);
    });
  }

  return queue.shift();
}

async function answer(message: string): Promise<string> {
  const prompt = `${persona}\n\n## Your hidden requirements\n\n${hidden}\n\n## The agent's message\n\n${message}`;
  const result = Bun.spawnSync(
    [
      'claude',
      '-p',
      '--output-format',
      'json',
      '--model',
      'sonnet',
      '--tools',
      '',
      '--no-session-persistence',
      prompt,
    ],
    {
      cwd: scratch,
    },
  );
  const parsed = JSON.parse(result.stdout.toString()) as Event;

  costUsd += parsed.total_cost_usd ?? 0;

  const lines = (parsed.result ?? '').split('\n');

  violations.push(...lines.filter((line) => line.startsWith('VIOLATION:')));

  return lines
    .filter((line) => !line.startsWith('VIOLATION:'))
    .join('\n')
    .trim();
}

send(`/refine ${readFileSync(join(fixtureDir, 'task.txt'), 'utf8').trim()}`);

let rounds = 0;
let compactions = 0;
let pending: string | undefined;

while (!isOver || queue.length > 0) {
  // A finished turn is answered only once the session stays quiet: a phase close queues /compact
  // and the next kickoff right after the turn, and those must run before the user speaks.
  const event = await nextEvent(pending === undefined ? 600_000 : 8_000);

  if (event === undefined) {
    if (pending === undefined) {
      break;
    }

    rounds += 1;
    send(await answer(pending));
    pending = undefined;
    continue;
  }

  if (event.subtype === 'compact_boundary') {
    compactions += 1;
    pending = undefined;
    console.log(`-- compaction ${compactions}`);
  }

  if (event.type === 'system' && event.subtype === 'init') {
    pending = undefined;
  }

  if (event.type !== 'result') {
    continue;
  }

  costUsd += event.total_cost_usd ?? 0;
  console.log(`<< ${(event.result ?? '').slice(0, 300).replaceAll('\n', ' ')}`);

  if (compactions >= 2 || rounds >= maxRounds) {
    break;
  }

  // A headless session cannot start the kickoff turn by itself (the mod says so); any message does.
  if ((event.result ?? '').includes('Send any message to begin.')) {
    send('Begin.');
    continue;
  }

  // Command echoes ("refine: ...", the plugin's name first) need no answer.
  if (!/^(refine: )?refine:/.test(event.result ?? '') && (event.result ?? '').trim() !== '') {
    pending = event.result;
  }
}

interviewer.stdin.end();
await interviewer.exited;

const transcript =
  readdirSync(join(homedir(), '.claude', 'projects'))
    .map((dir) => join(homedir(), '.claude', 'projects', dir, `${sessionId}.jsonl`))
    .find((path) => existsSync(path)) ?? '';
const run: Run = {
  task,
  sessionId,
  transcript,
  interviewDir,
  interviewDirGone: !existsSync(interviewDir),
  hashesBefore,
  hashesAfter: hashes(),
  gitBefore,
  gitAfter: gitStatus(),
  violations,
  costUsd,
  wallMs: Date.now() - started,
};

rmSync(cwd, { recursive: true, force: true });
writeFileSync(join(scratch, 'run.json'), JSON.stringify(run, null, 2));
console.log(join(scratch, 'run.json'));
