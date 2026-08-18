# 漫画ページ・コマAPI

共通仕様は[api-list.md](../api-list.md)を参照。全API認証必須。対象の`story` / `page`が自分の所有物であることを確認したうえで処理する。[CreateManga画面](../../02-screen-design/specifications/CreateManga.md)で使用する。

---

## GET /api/stories/{storyId}/pages

ストーリーのページ一覧を、`page_no`の昇順で取得する。

### レスポンス（成功時 200）

```json
[
  { "id": 5, "storyId": 10, "pageNo": 1 },
  { "id": 6, "storyId": 10, "pageNo": 2 }
]
```

---

## POST /api/stories/{storyId}/pages

ページを1枚追加する。`pageNo`は末尾に自動採番する。

### レスポンス（成功時 201）

作成されたページを返す。

---

## DELETE /api/pages/{id}

ページを削除する。関連する`manga_panels`・配置済み`dialogues`（該当ページへの紐付け）も合わせて削除・解除する。

### エラー

| ステータス | ケース |
|---|---|
| 403 | 自分以外のページを削除しようとした |
| 404 | 存在しない |

---

## GET /api/pages/{pageId}/panels

ページに配置済みのイラスト（コマ）一覧を取得する。

### レスポンス（成功時 200）

```json
[
  {
    "id": 1,
    "pageId": 5,
    "materialId": 22,
    "x": 0.0,
    "y": 0.0,
    "width": 320.0,
    "height": 450.0,
    "zIndex": 1
  }
]
```

---

## PUT /api/pages/{pageId}/panels

ページのイラスト配置をまとめて保存する（既存の配置を丸ごと置き換える）。現行実装の`PUT /api/manga-panels`と同様の一括更新方式を踏襲する。

### リクエスト

```json
[
  {
    "materialId": 22,
    "x": 0.0,
    "y": 0.0,
    "width": 320.0,
    "height": 450.0,
    "zIndex": 1
  }
]
```

### レスポンス（成功時 200）

保存後の配置一覧を返す（`GET`のレスポンスと同じ形式）。

### エラー

| ステータス | ケース |
|---|---|
| 400 | `materialId`が自分の所有する素材ではない |
| 403 | 自分以外のページを操作しようとした |

---

## 備考

- 現行実装は`story_id`に直接紐づく単一キャンバスのみで「ページ」の概念が無いが、目標設計では04-databaseで新設した`manga_pages`を介した構成に変更する（[api-list.md 現行実装との主な差分](../api-list.md#現行実装との主な差分)参照）。
- 現行実装は`imageSrc`（パス文字列）を直接保存していたが、目標設計では`materialId`（[materials.md](materials.md)で登録した素材への参照）に変更する。
- [見開き書き出し機能](../../02-screen-design/specifications/CreateManga.md)（PNGダウンロード）はクライアント側のCanvas処理のみで完結するため、対応するAPIは無い（[system-design.md 5章](../../03-system-design/system-design.md)参照）。

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | API設計 |
| 最終更新日 | 2026-08-18 |
| 更新者 | Ren Nakamoto |
