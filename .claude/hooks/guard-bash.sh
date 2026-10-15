#!/usr/bin/env bash
# Claude Code の PreToolUse フック（Bash）。
# CLAUDE.md で「事前確認なしにやってはいけない」と決めた操作のうち、
# 機械的に判定できるものを実行前に止める。終了コード 2 で止め、理由を Claude に返す。

command=$(jq -r '.tool_input.command // ""')

block() {
  echo "フックにより止めました：$1（CLAUDE.md のルール）。必要なら、利用者に説明して本人に実行してもらってください。" >&2
  exit 2
}

# コマンドの先頭（行の頭、; && || | ( の直後）にあるものだけを判定する。
# 文章（ヒアドキュメントやコミットメッセージ）の中に同じ文字列があっても止めないため。
# 判定は1行ずつ行われるので、改行で区切られた複数のコマンドもそれぞれ判定される。
start='(^|[;&|(])[[:space:]]*'

matches() {
  printf '%s\n' "$command" | grep -Eq "$1"
}

if matches "${start}git[[:space:]]+push([[:space:]][^;&|]*)?[[:space:]](origin[[:space:]]+)?(HEAD:)?main([[:space:]]|$)"; then
  block "main への直接 push"
fi

if matches "${start}git[[:space:]]+push([[:space:]][^;&|]*)?[[:space:]](-f|--force|--force-with-lease)([[:space:]=]|$)"; then
  block "force push"
fi

if matches "${start}git[[:space:]]+reset([[:space:]][^;&|]*)?[[:space:]]--hard"; then
  block "git reset --hard"
fi

if matches "${start}git[[:space:]]+add[[:space:]]+(-A|--all|\.)([[:space:]]|$)"; then
  block "git add -A / git add .（関係するファイルだけを指定してください）"
fi

# .env / .env.development などの中身を表示するコマンド
if matches "${start}(cat|less|more|head|tail|grep|bat|sed|awk|strings|xxd|od)[[:space:]]([^|;&]*[[:space:]])?[^[:space:]]*\.env([.][A-Za-z0-9_-]+)?([[:space:]]|$|[\"'])"; then
  block ".env ファイルの中身の表示"
fi

exit 0
