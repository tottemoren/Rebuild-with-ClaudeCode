# セリフAPI

共通仕様は[api-list.md](../api-list.md)を参照。全API認証必須。対象の`story`が自分の所有物であることを確認したうえで処理する。

セリフは[StoryCreate画面](../../02-screen-design/specifications/StoryCreate.md)で台本として作成し（`page_id`・座標は未確定＝NULL）、[CreateManga画面](../../02-screen-design/specifications/CreateManga.md)で配置先ページ・座標を確定させる、という2段階の使われ方をする（[04-database table-definitions.md](../../04-database/table-definitions.md#7-dialoguesセリフ)参照）。

---

## GET /api/stories/{storyId}/dialogues

指定したストーリーの台本（セリフ一覧）を、`order_no`の昇順で取得する。

### レスポンス（成功時 200）

```json
[
  {
    "id": 1,
    "storyId": 10,
    "pageId": null,
    "orderNo": 1,
    "talkerName": "夜凪",
    "line": "え、映画...一緒に行く?",
    "x": null,
    "y": null,
    "width": null,
    "height": null,
    "zIndex": null
  }
]
```

---

## POST /api/stories/{storyId}/dialogues

台本にセリフを1件追加する。`orderNo`は末尾に自動採番する。

### リクエスト

```json
{
  "talkerName": "string",
  "line": "string"
}
```

---

## PUT /api/dialogues/{id}

セリフの発言者名・本文を編集する（台本の編集）。

### リクエスト

```json
{
  "talkerName": "string",
  "line": "string"
}
```

---

## DELETE /api/dialogues/{id}

セリフを削除する。

---

## PUT /api/dialogues/{id}/placement

[CreateManga画面](../../02-screen-design/specifications/CreateManga.md)での配置操作用。セリフをどのページの、どの座標に置くかを確定・更新する。

### リクエスト

```json
{
  "pageId": 5,
  "x": 120.0,
  "y": 340.0,
  "width": 200.0,
  "height": 80.0,
  "zIndex": 3
}
```

### エラー

| ステータス | ケース |
|---|---|
| 403 | 自分以外のストーリーのセリフを操作しようとした |
| 404 | セリフ、または指定した`pageId`が存在しない |

---

## 備考

- 現行実装の`POST /dialogues`は`storyId`をリクエストボディに含める形式だったが、目標設計ではURLパス（`/api/stories/{storyId}/dialogues`）に変更し、リソースの所属関係をURLで表現する。
- 座標の一括保存（[manga.md](manga.md)のパネル保存APIのように、ページ内の全セリフをまとめて`PUT`する方式）にするかは、フロントエンド実装時のUX次第で見直す可能性がある。

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | API設計 |
| 最終更新日 | 2026-08-18 |
| 更新者 | Ren Nakamoto |
