# Phase WHAT

This phase settles what the result must be and how anyone can check it, not how it is built. The document is `{{dir}}/what.md`, following the WHAT template below.

## Domain map

Map the problem domain (users, tasks, rules, quality concerns) from outside material, not from your head: a concept you don't know exists can only be found by consulting sources.

1. **Frame.** The problem in one sentence, plus the abstract class it belongs to (for example "an interactive CLI with persistent state", "a sync problem").
2. **Expected dimensions.** Write down the dimensions you expect before searching.
3. **Project first.** Similar features, conventions and precedents in the project itself.
4. **Owning fields.** Name the disciplines that own the problem class and search them for structure, not answers: taxonomies, standards, surveys, checklists, bodies of knowledge, known pitfalls and failure modes.
5. **Analogues.** Two or three existing products, libraries or open-source projects solving a related problem: their docs, configuration options and issue trackers. Every option and recurring issue is a dimension someone found necessary.
6. **Map.** List the dimensions, each with its source, marked decided (by the user, the code or a constraint), open (becomes a question) or out of scope (with a reason). Use the field's own vocabulary and categories; invent a category only when none fits, and label it "ad hoc".
7. **Diff.** Tell the user which dimensions were not on your expected list.
8. **Agenda.** The open dimensions become the agenda. Apply the trigger catalog below: each trigger that fires adds its topic.

Stop searching when you have consulted at least one established taxonomy or standard, one survey-level source and one existing solution (or can say "searched X, Y; found none"), and three sources in a row added no new top-level dimension. Cap: about 10 searches or fetches per phase; if you hit it, report the rest as a remaining risk. For a purely local change in the user's own code you may shorten the map; say that you did.

## WHAT-specific rules

- **Acceptance first.** Every requirement gets at least one acceptance scenario with a manual check: which browser flow to drive, which CLI run with which data, which command. Cover every flow and the edge and error cases, not only the happy path. A requirement with no writable scenario is not clarified yet.
- **Implementation ideas.** When the user states an implementation idea and the context does not settle it, ask whether it is a hard constraint (goes to Constraints) or an idea (goes to Solution ideas, input for HOW).
- **Budget.** Record in Constraints how much the user is willing to invest; HOW uses it to narrow requirements that turn out too expensive.
- **States.** For each entity with states, build a state × action table. Each cell becomes a requirement ("in state X, action Y does Z") or an invariant ("in state X, Y is impossible"); an empty cell is a question. For UI, consider every screen region in the states ideal, empty, error, partial and loading. The table goes in or after Functional requirements.
- **Security as misuse.** When the task involves users, data, network or external input, security is a mandatory topic. Express it as misuse scenarios: prohibitions ("who must not be able to do what") in Functional or Quality requirements, each with a negative acceptance scenario ("a guest opens another user's URL → sees 403"). How the protection is built is for HOW.
- **Consistency.** No requirement may contradict another. A requirement that departs from how the project already does something similar is stated as a departure, with the reason. Never depart silently.

## Graphics as requirements

When the user gives a picture (mockup, screenshot, Figma frame), ask how strongly it binds; never infer it. Strength has six independent dimensions: content (C), layout (L), geometry (G: sizes, spacing), visual style (V), interaction (I), data (D). The user names a level per graphic and may override it per dimension ("pixel-exact, but colours are placeholders"):

| Level | Binds | What it obliges |
| --- | --- | --- |
| S0 inspiration | nothing | a solution idea or style direction; no acceptance criteria; content not copied |
| S1 wireframe | C, coarse L | every element shown must exist, with its behaviour elicited; positions relative; sizes and colours from the design system |
| S2 mockup over existing tokens | C, L | structure and relative position match; visual values map to the nearest existing token or component |
| S3 pixel-accurate spec | C, L, G, V | measurable values become requirements; any deviation is a defect or a user-approved exception |

- A static picture never binds interaction or data, even at S3; those come from questions. A clickable prototype can bind interaction for the flows it implements (record it as a separate flag).
- A raster image declared S3 binds values only once the user confirms the measured values or provides the source file.
- Text requirements beat S0–S2 graphics; at S3, a conflict between text and graphic is an open issue.

For S1 and above, first build an inventory of elements with ids (`E7 "Export" button, toolbar right`), then ask per element only the checklist questions that apply to its kind. Unanswered ones go to Open issues.

- Identity and purpose:
  1. What is it, what user goal does it serve; interactive, informational or decorative?
  2. Existing design-system component or new?
  3. Copy: final or placeholder; who owns it; localization, maximum length, truncation.
- Behaviour: 4. What happens on activation (click, tap, Enter/Space, shortcut): outcome, navigation, side effects, undo. 5. Destructive or irreversible? Confirmation? 6. Feedback on success and failure; how long it takes.
- Visibility and availability: 7. When visible, hidden, or present but disabled; under which data or system conditions. 8. For which roles or permissions visible or enabled; what a user without permission sees. 9. Feature flags, plan tiers, platform differences.
- States: 10. The screen region in ideal, empty, loading, partial and error states; which are drawn, who decides the rest. 11. Element states: default, hover, focus-visible, pressed, disabled, selected, invalid, read-only, in progress. 12. Transitions and motion between states.
- Data: 13. Source of the shown data; real ranges: zero, one, many, very many (pagination, virtualization), shortest and longest. 14. Formats: numbers, dates, currency, units, time zones. 15. Overflow: wrap, truncate, tooltip, scroll.
- Layout and responsiveness: 16. Which positions are relative constraints and which are fixed. 17. Behaviour per breakpoint in scope, including 320 CSS px width. 18. Theme variants: light/dark, high contrast, density.
- Accessibility: 19. Accessible name and role for icon-only controls. 20. Contrast of text and of component boundaries and state indicators. 21. Is state conveyed by colour alone? 22. Target size at least 24×24 CSS px. 23. Keyboard focus order; visible focus indicator not hidden by sticky elements. 24. Drag interactions have a single-pointer alternative.
- Visual values (S3; at S2 only the token mapping): 25. Size, spacing, padding, radius, border, fill, typography, shadow, icon size; which token each maps to; which have no token.
- Unseen screens: 26. Screens, dialogs or menus this element leads to that are not drawn: add to scope or to Deferred.

Register every graphic in Interfaces and data: id, link or Figma node, viewport, strength level per dimension. Everything else extracted from graphics goes to the usual sections.

Visual acceptance scenarios have three layers: computed-style and geometry assertions with tolerances (primary at S3); accessibility rule checks; screenshots. Pixel-diff against the mockup itself is unreliable (rendering differs by OS, browser and fonts): comparison with the mockup is a manual side-by-side review, and the first user-approved render becomes the screenshot baseline with an explicit threshold. Take exact values from the source file (for Figma: `get_variable_defs`, `get_design_context`); mark values measured from a raster as approximate. S0 gets no visual scenarios; S3 gets one per bound dimension.

## Where each answer goes

| Question type | Answer goes to |
| --- | --- |
| Missing information | the section with the gap (usually 5, 6, 7 or 10) |
| Ambiguity | the requirement is rewritten; a new term → 4; a vague quality word → 7 with a pass criterion |
| Contradiction | the winning requirement stays, the reason goes to its rationale; the loser is removed or → 12 |
| Branch | 3 (out of scope) or 12 |
| Priority / trade-off | the requirement's priority and rationale |
| Assumption | 9, marked confirmed or assumed |
| Verification | 10 |
| Solution leak | the real requirement → 5; the idea → 13, or → 8 if the user mandates it |
| Unanswerable now | 11 |

Before proposing the close, check that every requirement is unambiguous, consistent with the others, complete, necessary and verifiable.
