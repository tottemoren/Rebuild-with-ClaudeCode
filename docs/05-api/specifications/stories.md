# ストーリー・ジャンルAPI

共通仕様は[api-list.md](../api-list.md)を参照。全API認証必須。ストーリーはJWTから判定したログインユーザー自身のものだけを対象とする。

---

## GET /api/genres

ジャンルマスタ（`genres`テーブル）の一覧を取得する。[StoryCreate画面](../../02-screen-design/specifications/StoryCreate.md)でジャンルを選択する際に使用する。

### レスポンス（成功時 200）

```json
[
  { "id": 1, "name": "恋愛" },
  { "id": 2, "name": "友人" },
  { "id": 3, "name": "会話" }
]
```

> ジャンルマスタの初期データ投入方針（運営が用意するプリセットか、ユーザーの自由入力を都度マスタ化するか）は未確定（[04-database README](../../04-database/README.md)申し送り事項参照）。未確定の間は、運営が用意した固定リストを返すものとして設計する。

---

## GET /api/stories

自分のストーリー一覧を、更新日時の降順で取得する。

### レスポンス（成功時 200）

```json
[
  {
    "id": 1,
    "title": "特別な映画",
    "summary": "ひょんなことから2人で映画を見に行くことに、、、",
    "genres": [
      { "id": 1, "name": "恋愛" },
      { "id": 4, "name": "緊張" }
    ],
    "visibility": "PRIVATE",
    "createdAt": "2026-08-18T10:00:00",
    "updatedAt": "2026-08-18T10:00:00"
  }
]
```

---

## POST /api/stories

ストーリーを新規作成する。ジャンルの紐付け（`story_genres`への登録）も同時に行う。

### リクエスト

```json
{
  "title": "string（必須）",
  "summary": "string",
  "genreIds": [1, 4]
}
```

### エラー

| ステータス | ケース |
|---|---|
| 400 | `title`未入力 |
| 400 | `genreIds`が4件以上指定されている（最大3件までという制約は04-databaseの通りアプリケーション側で検証する） |

---

## GET /api/stories/{id}

ストーリー詳細を取得する。

### エラー

| ステータス | ケース |
|---|---|
| 403 | 自分以外のストーリーを取得しようとした |
| 404 | 存在しない |

---

## PUT /api/stories/{id}

ストーリーを更新する。`POST`と同じボディ形式。ジャンルは指定された`genreIds`で全件置き換える。

### エラー

`POST`のエラーに加え、`403`（自分以外）・`404`（存在しない）。

---

## DELETE /api/stories/{id}

ストーリーを削除する。関連する`dialogues` / `manga_pages` / `manga_panels`も合わせて削除する（カスケード削除）。

### エラー

| ステータス | ケース |
|---|---|
| 403 | 自分以外のストーリーを削除しようとした |
| 404 | 存在しない |

---

## 備考

- 現行実装の`GET /stories`は全ユーザーのストーリーを無条件で返しており、`userId`による絞り込みが無い。目標設計ではJWTから取得した`user_id`で必ず絞り込む。
- 現行実装は`genre`が単一の文字列カラムだったが、04-databaseでの正規化にあわせてAPIも配列（`genreIds` / `genres`）に変更する。
- `visibility`は常に`"PRIVATE"`で登録・返却する。v1では値を選択するUI・公開範囲を変更するAPIは提供しない（[04-database](../../04-database/README.md)参照）。
- [StoryCreate画面](../../02-screen-design/specifications/StoryCreate.md)の参照エリア（自分の過去のストーリー一覧）は、本APIの`GET /api/stories`をそのまま利用する。専用のAPIは不要。

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | API設計 |
| 最終更新日 | 2026-08-18 |
| 更新者 | Ren Nakamoto |
