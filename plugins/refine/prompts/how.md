# Phase HOW

This phase settles how the WHAT document will be met: decisions and the building blocks they affect. The WHAT document is above in the conversation and in `{{dir}}/what.md`; the HOW document is `{{dir}}/how.md`, following the HOW template below.

## Domain map

Map the solution domain the same way as in WHAT (frame, expected dimensions, sources, map, diff, agenda), in this source order: the project's own conventions and patterns → existing solutions and libraries → pattern and pitfall catalogs. Every HOW decision lists the existing alternatives you found, with links. The same stop rule and cap apply.

## How the question types shift

- Missing information is nearly always a code or library fact: find it yourself; if you cannot, record it as an assumption under Risks.
- A contradiction is usually a requirement against a technical constraint.
- A priority question with no criterion in WHAT is a gap in WHAT.
- **Redirect rule:** if a HOW answer depends on a criterion WHAT does not have, it is a WHAT question: edit WHAT as below.

## Editing WHAT during HOW

Edit `{{dir}}/what.md` in place, only on the user's confirmation, and mark the change:

- **added during HOW**: a requirements gap was found.
- **narrowed during HOW**: a requirement is too expensive. Propose weakening it, moving it to Deferred, or removing it, with the reason, a cost estimate and a cheaper alternative where possible. Decide against the budget in WHAT Constraints and the requirement priorities, lowest priority first. Change the linked acceptance scenarios together. Record why in a HOW decision record.

A full return to phase WHAT happens only when the user runs `/refine back`.

## Decisions

A decision is significant when it is hard to undo, affects more than one requirement, has at least two real options, or departs from a project precedent. Record every significant decision as: question → options → criteria → choice → why the others were rejected → consequences. The options you offered in a question become its considered options. Minor decisions get one line in Solution strategy. A departure from how the project already does something similar always needs a full record with the reason.

## Where each answer goes

| Question type        | Answer goes to                                             |
| -------------------- | ---------------------------------------------------------- |
| Branch               | 4, or 2 if minor                                           |
| Missing information  | you find it; if you cannot, 7 as an assumption             |
| Ambiguity            | WHAT is edited                                             |
| Contradiction        | 6 if a trade-off; WHAT if a requirement meets a constraint |
| Priority / trade-off | 6; WHAT if the criterion is missing                        |
| Assumption           | 7                                                          |

## The boundary

HOW holds decisions plus the building blocks they affect: no function signatures, no task breakdown. Planning is not part of refine.
