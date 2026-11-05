# gm marketplace

This repository is the Claude Code marketplace `gm` (`.claude-plugin/marketplace.json`). Every plugin lives in `plugins/<name>/` and has an entry there with `"source": "./plugins/<name>"`.

## Layout of a plugin

- `.claude-plugin/plugin.json`: `name`, `version`, `description`.
- A mod: `hooks/hooks.json` (`{ "modules": ["./register.ts"] }`) and `hooks/register.ts` in TypeScript. A plugin has one hooks module, so separate mods are separate plugins.
- A mod that keeps values in `$.state`: `types/index.d.ts`, named in `plugin.json` as `"types"`.
- Skills: `skills/<skill>/SKILL.md`. A skill tied to a mod lives in that mod's plugin; general skills go in one shared skills plugin.
- A skill's name must differ from every slash command its plugin's mod registers: on a clash, `/<name>` runs the skill and the mod's command is never reached.
- `hooks/` holds only hooks: `register.ts` wires them, and each hook is its own file named after the event (`session-compact.ts`). A hook reads with queries, changes with commands and builds its answer; it holds no domain logic.
- `common/` beside `hooks/` holds modules, one folder per domain model, named with a noun: an entity (`interview`, `journal`, even a core one like `session-message`) or a scenario (`phase-close`, `interview-end`), whose state need not be stored anywhere. A module has the subfolders it needs:
  - `models/`: the model's type; a core type is re-exported.
  - `types/`: the module's other types.
  - `commands/`: `run*` functions that change state through `$`; they return nothing but the id of what they create.
  - `queries/`: `query*` functions that read through `$` and change nothing.
  - `helpers/`: pure functions without `$`.
  - `fixtures/`: test data and stand-ins (`fakeEngine` lives in `common/engine/fixtures/`).
- Layers: base modules (`path`, `git`, `session-message`, `command-args`, `engine`) import no other module; entities import base modules; scenarios import any module; type-only imports are free.
- Tests: `<file>.test.ts` next to the file it tests. A hook's test calls the hook with `fakeEngine`, or goes through the engine with the test kit's `$` and `on`.

Adding a plugin means adding its folder, its entry in `marketplace.json` and its row in the README table.

## Commands and rules

@CONTRIBUTING.md

## Running it

This folder is added as a local marketplace (`claude plugin marketplace add <this folder>`), so edits load after `/reload-plugins`.
