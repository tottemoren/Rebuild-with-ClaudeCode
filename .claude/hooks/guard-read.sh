#!/usr/bin/env bash
# Claude Code の PreToolUse フック（Read / Edit / Write）。
# .env ファイル（.env、.env.development、.env.production など）を開く・書き換える操作を止める。

file=$(jq -r '.tool_input.file_path // ""')
name=$(basename "$file")

if [[ "$name" == ".env" || "$name" == .env.* ]]; then
  echo "フックにより止めました：.env ファイル（$name）を開く・書き換える操作（CLAUDE.md のルール）。内容の確認や変更は利用者に依頼してください。" >&2
  exit 2
fi

exit 0
