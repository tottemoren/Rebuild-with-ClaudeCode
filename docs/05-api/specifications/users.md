# ユーザーAPI

共通仕様は[api-list.md](../api-list.md)を参照。全API認証必須。

---

## GET /api/users/me

JWTから判定した、ログイン中ユーザー自身の情報を取得する。

### レスポンス（成功時 200）

```json
{
  "id": 1,
  "username": "nakamoto",
  "role": "USER",
  "profileImageUrl": "/uploads/profile-images/xxxx.png"
}
```

### エラー

| ステータス | ケース |
|---|---|
| 401 | JWTが無効・期限切れ |

---

## POST /api/users/me/profile-image

プロフィール画像をアップロードする。`multipart/form-data`で送信する（現行実装を踏襲）。

### リクエスト

| 項目 | 内容 |
|---|---|
| Content-Type | `multipart/form-data` |
| パート名 `file` | 画像ファイル（最大5MB。現行の`spring.servlet.multipart.max-file-size`設定を踏襲） |

### レスポンス（成功時 200）

```json
{
  "id": 1,
  "username": "nakamoto",
  "role": "USER",
  "profileImageUrl": "/uploads/profile-images/user-1-xxxxxxxx.png"
}
```

### エラー

| ステータス | ケース |
|---|---|
| 400 | ファイルが選択されていない |
| 500 | 保存処理に失敗した |

---

## 備考

- 現行実装は`GET /api/users/{id}`で任意のユーザーIDを指定できたが、他人の情報を取得できてしまうため`/api/users/me`に変更する（[api-list.md 現行実装との主な差分](../api-list.md#現行実装との主な差分)参照）。
- プロフィール画像の保存先は現状ローカルディスクのままとする（S3移行は[tech-stack.md](../../03-system-design/tech-stack.md)で保留事項として記載済み）。

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | API設計 |
| 最終更新日 | 2026-08-18 |
| 更新者 | Ren Nakamoto |
