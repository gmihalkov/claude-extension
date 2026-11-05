// Checks one live refine run: `bun acceptance/refine/check.ts <run.json>`.
// Prints PASS / FAIL / MANUAL per checklist item with evidence; exits 1 on any FAIL.
import { readdirSync, readFileSync } from 'node:fs';

import type { Run } from './run-record';

type Row = {
  type: string;
  subtype?: string;
  isMeta?: boolean;
  message?: {
    role: string;
    content: unknown;
  };
  attachment?: {
    type: string;
  };
};

type Block = {
  type: string;
  text?: string;
  name?: string;
  id?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  is_error?: boolean;
};

const QUESTION_TYPES = [
  'Branch',
  'Missing information',
  'Ambiguity',
  'Contradiction',
  'Priority / trade-off',
  'Assumption',
  'Other',
];
const WHAT_SECTIONS = [
  'Goal',
  'Users and context',
  'Scope',
  'Glossary',
  'Functional requirements',
  'Interfaces and data',
  'Quality requirements',
  'Constraints',
  'Facts and assumptions',
  'Acceptance scenarios',
  'Open issues',
  'Deferred',
  'Solution ideas',
];
const TAG = /\[(code|run|user|model|web)(:[^\]]*)?\]/;
const CITATIONS = /ISO|IEEE|WCAG|Volere|arc42|ATAM|MADR|et al\./;

function blocks(row: Row): Block[] {
  const content = row.message?.content;

  if (typeof content === 'string') {
    return [{ type: 'text', text: content }];
  }

  return Array.isArray(content) ? (content as Block[]) : [];
}

function text(row: Row): string {
  return blocks(row)
    .filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('\n');
}

// Rows the /compact command itself leaves (its caveat, its name, its output) are not history.
function isCommandEcho(row: Row): boolean {
  return /<local-command-caveat>|<command-name>|<local-command-stdout>/.test(text(row));
}

function isPluginPrompt(row: Row): boolean {
  return /plugin sent a message/.test(text(row));
}

function readTranscript(path: string): Row[] {
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as Row);
}

// What each compaction left: the user/assistant messages after its boundary, up to the next prompt.
function afterCompactions(rows: readonly Row[]): { messages: Row[]; attachments: string[] }[] {
  const found: { messages: Row[]; attachments: string[] }[] = [];

  rows.forEach((row, index) => {
    if (row.subtype !== 'compact_boundary') {
      return;
    }

    const messages: Row[] = [];
    const attachments: string[] = [];

    for (const next of rows.slice(index + 1)) {
      if (next.subtype === 'compact_boundary' || isPluginPrompt(next)) {
        break;
      }

      if (next.type === 'attachment' && next.attachment !== undefined) {
        attachments.push(next.attachment.type);
      }

      if (
        (next.type === 'user' || next.type === 'assistant') &&
        !next.isMeta &&
        !isCommandEcho(next)
      ) {
        if (next.type === 'assistant' && messages.at(-1)?.type === 'assistant') {
          break;
        }

        messages.push(next);
      }
    }

    found.push({ messages, attachments });
  });

  return found;
}

// A compaction passes when it left documents (user rows) followed by one note (an assistant row)
// and no re-attached file or skill.
function compactionShape(rows: readonly Row[]): { ok: boolean; evidence: string } {
  const compactions = afterCompactions(rows);

  if (compactions.length === 0) {
    return { ok: false, evidence: 'no compact_boundary in the transcript' };
  }

  for (const [index, { messages, attachments }] of compactions.entries()) {
    const roles = messages.map((row) => row.type);
    const isShape =
      roles.length >= 2 &&
      roles.at(-1) === 'assistant' &&
      roles.slice(0, -1).every((role) => role === 'user');
    const extra = attachments.filter((type) => /file|skill/i.test(type));

    if (!isShape || extra.length > 0) {
      return {
        ok: false,
        evidence: `compaction ${index + 1}: roles [${roles.join(', ')}], attachments [${extra.join(', ')}]`,
      };
    }
  }

  return { ok: true, evidence: `${compactions.length} compaction(s): documents + note only` };
}

function toolCalls(rows: readonly Row[]): { use: Block; result?: Block }[] {
  const results = new Map<string, Block>();

  for (const row of rows) {
    for (const block of blocks(row)) {
      if (block.type === 'tool_result' && block.tool_use_id !== undefined) {
        results.set(block.tool_use_id, block);
      }
    }
  }

  return rows.flatMap((row) =>
    blocks(row)
      .filter((block) => block.type === 'tool_use')
      .map((use) => ({ use, result: results.get(use.id ?? '') })),
  );
}

function writesOutside(rows: readonly Row[], dir: string): string[] {
  const calls = toolCalls(rows);
  const journaled = calls
    .filter(({ use }) => use.name === 'mcp__refine__refine_cleanup' && use.input?.kind !== 'plan')
    .map(({ use }) => String(use.input?.path));

  return calls
    .filter(
      ({ use, result }) =>
        ['Write', 'Edit', 'NotebookEdit'].includes(use.name ?? '') && result?.is_error !== true,
    )
    .map(({ use }) => String(use.input?.file_path ?? use.input?.notebook_path))
    .filter((path) => !path.startsWith(`${dir}/`) && !journaled.includes(path));
}

function untypedQuestions(rows: readonly Row[]): string[] {
  return rows
    .filter((row) => row.type === 'assistant')
    .flatMap((row) => text(row).split('\n'))
    .filter((line) => /^\W*Q\d+\b/.test(line))
    .filter((line) => !QUESTION_TYPES.some((type) => line.includes(`[${type}]`)));
}

function finalDocuments(rows: readonly Row[]): string[] {
  const last = afterCompactions(rows).at(-1);

  return last === undefined ? [] : last.messages.filter((row) => row.type === 'user').map(text);
}

function untaggedClaims(documents: readonly string[]): string[] {
  return (
    documents
      .flatMap((document) => document.split('\n'))
      // A list item that only labels the list under it ("- Out of scope:") is not a claim.
      .filter((line) => /^\s*([-*]|\d+\.)\s+\S/.test(line) && !/^\s*[-*]\s*none\b/i.test(line))
      .filter((line) => !/:\s*$/.test(line))
      .filter((line) => !TAG.test(line))
  );
}

function promptCitations(): string[] {
  const dir = `${import.meta.dir}/../../plugins/refine/prompts`;

  return readdirSync(dir).flatMap((name) =>
    readFileSync(`${dir}/${name}`, 'utf8')
      .split('\n')
      .filter((line) => CITATIONS.test(line))
      .map((line) => `${name}: ${line.trim()}`),
  );
}

function sample(items: readonly string[]): string {
  return items.slice(0, 5).join(' | ');
}

function check(run: Run): { status: 'PASS' | 'FAIL' | 'MANUAL'; item: string; evidence: string }[] {
  const rows = readTranscript(run.transcript);
  const shape = compactionShape(rows);
  const outside = writesOutside(rows, run.interviewDir);
  const changed = Object.keys({ ...run.hashesBefore, ...run.hashesAfter }).filter(
    (path) => run.hashesBefore[path] !== run.hashesAfter[path],
  );
  const untyped = untypedQuestions(rows);
  const documents = finalDocuments(rows);
  const untagged = untaggedClaims(documents);
  const what = documents[0] ?? '';
  const missingSections = WHAT_SECTIONS.filter((section) => !what.includes(section));
  const citations = promptCitations();
  const pass = (ok: boolean) => (ok ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL';

  return [
    {
      status: pass(shape.ok),
      item: 'after each compaction only documents and the note',
      evidence: shape.evidence,
    },
    {
      status: pass(afterCompactions(rows).length === 2),
      item: 'two compactions (WHAT, HOW)',
      evidence: `${afterCompactions(rows).length} found`,
    },
    {
      status: pass(outside.length === 0),
      item: 'no Write/Edit outside allowed places',
      evidence: sample(outside),
    },
    {
      status: pass(run.interviewDirGone),
      item: 'interview folder gone',
      evidence: run.interviewDir,
    },
    {
      status: pass(changed.length === 0),
      item: 'project files unchanged',
      evidence: sample(changed),
    },
    {
      status: pass(run.gitBefore === run.gitAfter),
      item: 'git status unchanged',
      evidence:
        run.gitBefore === undefined ? 'no git' : JSON.stringify([run.gitBefore, run.gitAfter]),
    },
    {
      status: pass(untyped.length === 0),
      item: 'every question has a type',
      evidence: sample(untyped),
    },
    {
      status: pass(untagged.length === 0),
      item: 'every claim has a provenance tag',
      evidence: sample(untagged),
    },
    {
      status: pass(missingSections.length === 0),
      item: 'WHAT has the 13 sections',
      evidence: missingSections.join(', '),
    },
    {
      status: pass(run.violations.length === 0),
      item: 'no findable questions',
      evidence: sample(run.violations),
    },
    {
      status: pass(citations.length === 0),
      item: 'prompts cite nothing',
      evidence: sample(citations),
    },
    {
      status: 'MANUAL',
      item: 'options are real; no yes/yes confirmations',
      evidence: run.transcript,
    },
    {
      status: 'MANUAL',
      item: 'WHAT against the hidden requirements',
      evidence: `acceptance/refine/fixtures/${run.task}/hidden.md vs the first document after the last compaction`,
    },
  ];
}

if (import.meta.main) {
  const path = process.argv[2];

  if (path === undefined) {
    console.error('usage: bun acceptance/refine/check.ts <run.json>');
    process.exit(2);
  }

  const run = JSON.parse(readFileSync(path, 'utf8')) as Run;
  const results = check(run);

  for (const { status, item, evidence } of results) {
    console.log(`${status.padEnd(6)} ${item}${evidence === '' ? '' : ` — ${evidence}`}`);
  }

  console.log(`cost $${run.costUsd.toFixed(2)}, ${Math.round(run.wallMs / 1000)} s`);

  if (results.some(({ status }) => status === 'FAIL')) {
    process.exit(1);
  }
}
