# HOW template

Write `{{dir}}/how.md` with exactly these sections, in this order. Leave a section with "none" rather than dropping it.

1. **Drivers**: the requirements and qualities from WHAT that act as selection criteria.
2. **Solution strategy**: the overall approach, plus minor decisions one line each.
3. **Building blocks**: modules, files and public interfaces at the level of "what changes"; no signatures.
4. **Decision records**: one per significant decision: question → options (with the existing alternatives found, and links) → criteria → choice → why the others were rejected → consequences.
5. **Crosscutting concepts**: rules that apply across building blocks (error handling, logging, configuration and the like).
6. **Quality**: which decision serves which quality scenario, and where qualities trade off.
7. **Risks, assumptions, technical debt.**
8. **Confirmation**: how to check that the code follows each decision, and what executes the acceptance scenarios from WHAT (tools, test data, launch commands).
9. **New questions** raised by the decisions.

**Appendix: Unclassified**: as in WHAT: content, provenance, sections considered and why each was rejected, proposed home.

Every claim carries its provenance tag.
