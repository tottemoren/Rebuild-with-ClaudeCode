#!/usr/bin/env bash
# Claude Code の PostToolUse フック（Edit / Write）。
# RebuildReact の .ts / .tsx を書き換えた直後に、そのファイルだけ ESLint にかける。
# エラーがあれば終了コード 2 で結果を Claude に返し、その場で直させる。

file=$(jq -r '.tool_response.filePath // .tool_input.file_path // ""')
frontend="$CLAUDE_PROJECT_DIR/RebuildReact"

case "$file" in
  "$frontend"/src/*.ts|"$frontend"/src/*.tsx) ;;
  *) exit 0 ;;
esac

[ -x "$frontend/node_modules/.bin/eslint" ] || exit 0

if ! output=$(cd "$frontend" && ./node_modules/.bin/eslint "$file" 2>&1); then
  echo "ESLint でエラーが見つかりました（$file）。直してください：" >&2
  echo "$output" >&2
  exit 2
fi

exit 0
