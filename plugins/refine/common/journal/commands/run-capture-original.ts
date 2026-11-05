import type { EngineInterface } from 'claude-code';

import { queryJournal } from '../queries/query-journal';

import { runWriteJournal } from './run-write-journal';

// Saves a journaled file as it was before its first write, or notes that it did not exist.
export async function runCaptureOriginal(
  $: EngineInterface,
  dir: string,
  realPath: string,
): Promise<void> {
  const entries = await queryJournal($, dir);
  const fresh = entries.filter(
    (entry) => entry.kind === 'file' && entry.path === realPath && entry.original === undefined,
  );

  if (fresh.length === 0) {
    return;
  }

  const exists = await $.fs.exists(realPath);

  for (const entry of fresh) {
    if (exists) {
      // cp keeps bytes exact; $.fs.write takes text only.
      await $.process.run(['mkdir', '-p', `${dir}/originals`]);
      await $.process.run(['cp', '-p', realPath, `${dir}/originals/${entry.id}`]);
      entry.original = 'file';
    } else {
      entry.original = null;
    }
  }

  await runWriteJournal($, dir, entries);
}
