# イラスト素材フォルダ・素材API

共通仕様は[api-list.md](../api-list.md)を参照。全API認証必須。フォルダ・素材はJWTから判定したログインユーザー自身の所有物のみを対象とする。[TopicChoice画面](../../02-screen-design/specifications/TopicChoice.md)で使用する。

---

## GET /api/folders

自分のフォルダ一覧を、作成日時の降順で取得する。

### レスポンス（成功時 200）

```json
[
  { "id": 3, "name": "主人公", "createdAt": "2026-08-18T10:00:00" }
]
```

---

## POST /api/folders

フォルダを作成する。

### リクエスト

```json
{ "name": "string（必須）" }
```

---

## DELETE /api/folders/{id}

フォルダを削除する。フォルダ内に素材が残っている場合の扱いは以下のとおり（[TopicChoice.md](../../02-screen-design/specifications/TopicChoice.md)の備考にある「素材フォルダが1件も存在しない場合の挙動」とあわせて、実装時に確定する）。

> 暫定方針：フォルダ内に素材が1件でも残っている場合は削除不可（`409`）とし、フロントエンドで「先に素材を削除してください」と案内する。素材ごと削除するか等は要件確定後に見直す。

### エラー

| ステータス | ケース |
|---|---|
| 403 | 自分以外のフォルダを削除しようとした |
| 404 | 存在しない |
| 409 | フォルダ内に素材が残っている |

---

## GET /api/folders/{folderId}/materials

フォルダ内の素材一覧を取得する。[TopicChoice画面](../../02-screen-design/specifications/TopicChoice.md)でフォルダをクリックした際のプレビュー表示、および[CreateManga画面](../../02-screen-design/specifications/CreateManga.md)の素材一覧で使用する。

### レスポンス（成功時 200）

```json
[
  {
    "id": 22,
    "folderId": 3,
    "fileName": "yonagi_smile.png",
    "url": "https://xxxx.cloudfront.net/materials/xxxx.png",
    "contentType": "image/png",
    "uploadedAt": "2026-08-18T10:00:00"
  }
]
```

> `url`はS3に保存された画像をCloudFront経由で参照するためのURL（[system-architecture.md](../../03-system-design/system-architecture/system-architecture.md)参照）。DB上は`storage_key`のみ保持し、APIレスポンスとして返す際にURLへ変換する。

---

## POST /api/materials/upload-url

イラスト素材のアップロードを開始する。S3への署名付きURL（presigned URL）を発行する（[system-architecture.md 3章](../../03-system-design/system-architecture/system-architecture.md#3-イラスト素材アップロードのシーケンス本番目標構成における想定)のシーケンス参照）。

### リクエスト

```json
{
  "folderId": 3,
  "fileName": "yonagi_smile.png",
  "contentType": "image/png"
}
```

### レスポンス（成功時 200）

```json
{
  "uploadUrl": "https://xxxx.s3.amazonaws.com/...(署名付きURL)",
  "storageKey": "materials/3/xxxxxxxx.png"
}
```

フロントエンドは`uploadUrl`に対して画像ファイルを直接`PUT`する。

---

## POST /api/materials

S3への直接アップロード完了後、素材のメタデータを登録する。

### リクエスト

```json
{
  "folderId": 3,
  "fileName": "yonagi_smile.png",
  "storageKey": "materials/3/xxxxxxxx.png",
  "contentType": "image/png"
}
```

### レスポンス（成功時 201）

作成された素材を返す（`GET /api/folders/{folderId}/materials`のレスポンスと同じ形式）。

### エラー

| ステータス | ケース |
|---|---|
| 400 | `storageKey`に対応するS3オブジェクトが存在しない |
| 403 | 自分以外のフォルダに登録しようとした |

---

## DELETE /api/materials/{id}

素材を削除する。既にこの素材を配置している`manga_panels`が存在する場合の扱いは未確定（暫定方針：配置済みパネルはそのまま残し、画像は欠落表示になる想定。実装時に確定する）。

### エラー

| ステータス | ケース |
|---|---|
| 403 | 自分以外の素材を削除しようとした |
| 404 | 存在しない |

---

## 備考

- アップロードは「①`/api/materials/upload-url`で署名付きURLを取得 → ②ブラウザからS3へ直接PUT → ③`/api/materials`で完了通知」という3ステップ構成（presigned URL方式）。バックエンド（ECS）を経由せず大容量ファイルでもサーバー負荷を抑えられる（[system-design.md 3章](../../03-system-design/system-design.md#3-イラスト素材のアップロード保存設計)参照）。
- `folder_shares`（フォルダ共有）に対応するAPIは未設計。UI・利用開始のタイミングが未定のため（[04-database README](../../04-database/README.md)参照）。

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | API設計 |
| 最終更新日 | 2026-08-18 |
| 更新者 | Ren Nakamoto |
