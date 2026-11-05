# WHAT template

Write `{{dir}}/what.md` with exactly these sections, in this order. Each section holds one kind of information, so every answer has exactly one place. Leave a section with "none" rather than dropping it.

1. **Goal**: the problem and why it matters; what success looks like. No solution.
2. **Users and context**: who uses or triggers the feature (people, other code, CI); the current situation it changes.
3. **Scope**: in scope; explicitly out of scope, each with a one-line reason; the boundary between the change and its environment.
4. **Glossary**: terms as the user means them; terms that must not be confused.
5. **Functional requirements**: numbered atomic statements (`FR-n`), each with a priority and a short rationale; business rules as `BR-n`; the state tables.
6. **Interfaces and data**: externally visible inputs and outputs (CLI flags, API shapes, file formats, events), data definitions (formats, allowed values, defaults), the graphic sources register.
7. **Quality requirements**: only the qualities the task touches, each with a measurable pass criterion ("under 200 ms on N items", "no new runtime dependency"). Prompt list: functional suitability, performance, compatibility, usability, reliability, security, maintainability, portability, safety; finer: speed, precision, robustness, capacity, longevity, backward compatibility, audit, privacy.
8. **Constraints**: mandated limits on the solution (language, libraries, files that must not change, compatibility), each with its reason; the budget.
9. **Facts and assumptions**: facts about the environment and assumptions the requirements rely on, each marked confirmed or assumed and still carrying its provenance tag (`[model]` for an assumption of your own).
10. **Acceptance scenarios**: for each rule or requirement, given/when/then examples including edge and error cases, plus how each is verified manually (browser flow, CLI run with data, command). Every requirement has at least one.
11. **Open issues**: empty at the close, or each item marked "left to HOW" or "accepted as a risk".
12. **Deferred**: discussed and explicitly excluded from this task.
13. **Solution ideas**: suggestions heard during WHAT, not decisions; input for HOW.

**Appendix: Unclassified**: only what fits nowhere after routing it by reason into the sections above. Each entry: content, provenance, sections considered and why each was rejected, proposed home.

Every claim carries its provenance tag. Not in the document: chat history, facts about the code that can be re-read, rejected alternatives.
