#!/usr/bin/env bash
# Claude Code の Stop フック。
# Claude が作業を終えようとしたとき、RebuildReact/src に未コミットの変更があれば
# フロントエンドのテストを実行する。失敗したら終了コード 2 で作業を続けさせ、直させる。

input=$(cat)

# このフックがきっかけで再開した後は、もう一度止めない（無限ループの防止）
if [ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false')" = "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR" || exit 0

if [ -z "$(git status --porcelain -- RebuildReact/src 2>/dev/null)" ]; then
  exit 0
fi

[ -x RebuildReact/node_modules/.bin/vitest ] || exit 0

if ! output=$(cd RebuildReact && npm run test --silent 2>&1); then
  echo "フロントエンドのテストが失敗しています。原因を説明して本体を直してください（テストを弱めて通すことは禁止）：" >&2
  printf '%s\n' "$output" | tail -40 >&2
  exit 2
fi

exit 0
