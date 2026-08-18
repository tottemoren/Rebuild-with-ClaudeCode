# メモAPI

共通仕様は[api-list.md](../api-list.md)を参照。全API認証必須。すべてJWTから判定したログインユーザー自身のメモのみを対象とする。

---

## GET /api/memos

自分のメモ一覧を、更新日時の降順で取得する（[Memo画面](../../02-screen-design/specifications/Memo.md)・[Home画面](../../02-screen-design/specifications/Home.md)で使用）。

### レスポンス（成功時 200）

```json
[
  {
    "id": 1,
    "title": "アイデアメモ",
    "content": "ここに本文",
    "writingDirection": "horizontal",
    "createdAt": "2026-08-18T10:00:00",
    "updatedAt": "2026-08-18T10:00:00"
  }
]
```

---

## POST /api/memos

メモを新規作成する。

### リクエスト

```json
{
  "title": "string（必須）",
  "content": "string",
  "writingDirection": "horizontal または vertical（必須）"
}
```

### レスポンス（成功時 201）

作成されたメモを返す（`GET`のレスポンスと同じ形式）。

### エラー

| ステータス | ケース |
|---|---|
| 400 | `title`未入力、または`writingDirection`が不正な値 |

---

## PUT /api/memos/{id}

メモを更新する。

### リクエスト

`POST`と同じボディ形式。

### エラー

| ステータス | ケース |
|---|---|
| 400 | バリデーションエラー |
| 403 | 自分以外のメモを更新しようとした |
| 404 | 指定したメモが存在しない |

---

## DELETE /api/memos/{id}

メモを削除する。

### エラー

| ステータス | ケース |
|---|---|
| 403 | 自分以外のメモを削除しようとした |
| 404 | 指定したメモが存在しない |

---

## 備考

- 現行実装はメモAPIが`RebuildJavaController`という汎用コントローラーに実装されており、`user_id`による絞り込みも存在しない（全ユーザーのメモが1つの一覧として見えてしまう）。目標設計では専用の`MemosController` → `MemoService`構成にし、JWTから取得した`user_id`で必ず絞り込む（[api-list.md 現行実装との主な差分](../api-list.md#現行実装との主な差分)参照）。

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | API設計 |
| 最終更新日 | 2026-08-18 |
| 更新者 | Ren Nakamoto |
