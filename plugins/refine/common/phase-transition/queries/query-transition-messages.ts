import type { EngineInterface } from 'claude-code';

import type { Interview } from '../../interview/models/interview';
import { queryPendingPlans } from '../../journal/queries/query-pending-plans';
import type { Phase } from '../../phase/models/phase';
import { queryShellReport } from '../../phase-close/queries/query-shell-report';
import { compactMessages } from '../../session-message/helpers/compact-messages';
import type { SessionMessage } from '../../session-message/models/session-message';
import { isFinalTransition } from '../helpers/is-final-transition';
import { serviceNote } from '../helpers/service-note';
import { transitionTarget } from '../helpers/transition-target';

async function readDocs(
  $: EngineInterface,
  dir: string,
  phases: readonly Phase[],
): Promise<string[]> {
  const docs: string[] = [];

  for (const phase of phases) {
    const text = await $.fs.read(`${dir}/${phase}.md`).then(String, () => undefined);

    if (text !== undefined) {
      docs.push(text);
    }
  }

  return docs;
}

// The transcript the mod's own compaction leaves: the phase documents and one note.
export async function queryTransitionMessages(
  $: EngineInterface,
  interview: Interview,
): Promise<SessionMessage[]> {
  const { dir, phase } = interview;

  if (isFinalTransition(interview)) {
    const docs = await readDocs($, dir, ['what', 'how']);
    const report = [
      ...(await queryPendingPlans($, interview)).map(
        (entry) => `- cleanup never carried out: ${entry.path}: ${entry.plan}`,
      ),
      ...(await queryShellReport($, interview)).map(
        (path) => `- changed outside Write/Edit and left as is: ${path}`,
      ),
    ];
    const note = serviceNote('how-done', phase, dir);

    return compactMessages(
      docs,
      report.length === 0 ? note : `${note}\nLeft for the user:\n${report.join('\n')}`,
    );
  }

  const target = transitionTarget(interview);
  // After WHAT closes, a HOW draft left by an earlier /refine back comes back with it.
  const docs = await readDocs($, dir, target.phase === 'what' ? ['what'] : ['what', 'how']);

  return compactMessages(docs, serviceNote(target.note, target.phase, dir));
}
