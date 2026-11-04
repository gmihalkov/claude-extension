biome := "bunx @biomejs/biome@2.6.5"
prettier := "bunx prettier@3.9.10"
tsc := "bunx --package typescript@7.0.2 tsc"

# Format every Markdown file
docs-format:
    {{ prettier }} --write '**/*.md'

# Check that every Markdown file is formatted
docs-verify:
    {{ prettier }} --check '**/*.md'

# Format code and JSON, sort imports, apply safe fixes; a warning fails
code-format:
    {{ biome }} check --write --error-on-warnings

# Check formatting, imports and lint without writing; a warning fails
code-lint:
    {{ biome }} check --error-on-warnings

# Type-check every plugin against the committed engine types
code-typecheck:
    {{ tsc }} -p .

# Run the tests of every plugin that has them
code-test:
    #!/usr/bin/env bash
    set -euo pipefail
    for dir in plugins/*/; do
      if find "$dir" -name '*.test.ts*' -not -path '*/.claude-plugin/*' | grep -q .; then
        claude plugin test "$dir"
      fi
    done

# Everything about code, while working
code-verify: code-lint code-typecheck code-test

# Validate the marketplace and every plugin manifest
validate:
    #!/usr/bin/env bash
    set -euo pipefail
    claude plugin validate .
    for dir in plugins/*/; do
      claude plugin validate "$dir"
    done

# The whole extension, before a commit
verify: docs-verify code-verify validate

# Regenerate types/engine from the installed Claude Code
types-update:
    #!/usr/bin/env bash
    set -euo pipefail
    tmp="$(mktemp -d)"
    trap 'rm -rf "$tmp"' EXIT
    mkdir -p "$tmp/probe/.claude-plugin" "$tmp/probe/hooks"
    echo '{"name":"probe","version":"0.0.0","description":"types probe"}' > "$tmp/probe/.claude-plugin/plugin.json"
    echo '{"modules":["./register.ts"]}' > "$tmp/probe/hooks/hooks.json"
    echo 'export const register = () => {}' > "$tmp/probe/hooks/register.ts"
    # The engine writes types only for a plugin folder it watches.
    (cd "$tmp" && CLAUDE_CODE_PLUGIN_DIR_WATCH=1 claude -p --plugin-dir "$tmp/probe" 'reply ok' > /dev/null)
    for name in claude-code claude-code-tools; do
      test -s "$tmp/probe/.claude-plugin/types/$name/index.d.ts"
      mkdir -p "types/engine/$name"
      cp "$tmp/probe/.claude-plugin/types/$name/index.d.ts" "types/engine/$name/index.d.ts"
    done
    head -1 types/engine/claude-code/index.d.ts
