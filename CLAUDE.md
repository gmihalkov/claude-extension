# gm marketplace

This repository is the Claude Code marketplace `gm` (`.claude-plugin/marketplace.json`). Every plugin lives in `plugins/<name>/` and has an entry there with `"source": "./plugins/<name>"`.

## Layout of a plugin

- `.claude-plugin/plugin.json`: `name`, `version`, `description`.
- A mod: `hooks/hooks.json` (`{ "modules": ["./register.ts"] }`) and `hooks/register.ts` in TypeScript. A plugin has one hooks module, so separate mods are separate plugins.
- A mod that keeps values in `$.state`: `types/index.d.ts`, named in `plugin.json` as `"types"`.
- Skills: `skills/<skill>/SKILL.md`. A skill tied to a mod lives in that mod's plugin; general skills go in one shared skills plugin.
- A skill's name must differ from every slash command its plugin's mod registers: on a clash, `/<name>` runs the skill and the mod's command is never reached.
- Tests: `*.test.ts` in the plugin folder.

Adding a plugin means adding its folder, its entry in `marketplace.json` and its row in the README table.

## Commands and rules

@CONTRIBUTING.md

## Running it

This folder is added as a local marketplace (`claude plugin marketplace add <this folder>`), so edits load after `/reload-plugins`.
