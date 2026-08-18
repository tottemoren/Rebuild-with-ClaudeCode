# 認証API

共通仕様は[api-list.md](../api-list.md)を参照。本APIグループのみ認証不要（ログイン前に呼び出すため）。

---

## POST /api/auth/register

ユーザー登録を行う。招待コードの確認は[03-system-design](../../03-system-design/system-design.md#4-招待コードユーザー登録制限について)の方針により、開発段階限定の暫定チェック（バックエンドに直書きした固定文字列との一致確認）。正式リリース時はこのチェック自体を削除する。

### リクエスト

```json
{
  "username": "string（必須、他ユーザーと重複不可）",
  "password": "string（必須）",
  "inviteCode": "string（必須・開発段階限定。正式リリース時に廃止）"
}
```

### レスポンス（成功時 200）

```json
{
  "id": 1,
  "username": "nakamoto",
  "role": "USER",
  "profileImageUrl": null
}
```

### エラー

| ステータス | ケース |
|---|---|
| 400 | `username` / `password`が未入力 |
| 400 | 招待コードが一致しない |
| 409 | `username`が既に使用されている |

---

## POST /api/auth/login

ユーザー名・パスワードで認証し、JWTを発行する。

### リクエスト

```json
{
  "username": "string",
  "password": "string"
}
```

### レスポンス（成功時 200）

```json
{
  "token": "（JWT文字列）",
  "user": {
    "id": 1,
    "username": "nakamoto",
    "role": "USER",
    "profileImageUrl": null
  }
}
```

フロントエンドは`token`を保持し、以降のリクエストで`Authorization: Bearer <token>`ヘッダーに付与する。

### エラー

| ステータス | ケース |
|---|---|
| 401 | ユーザー名またはパスワードが誤っている（どちらが誤っているかはメッセージで区別しない） |

---

## 備考

- トークンの有効期限・リフレッシュトークンの要否は未確定（[system-design.md 2.3](../../03-system-design/system-design.md)参照）。本ドキュメントでは有効期限を暫定的に24時間とし、リフレッシュ機構は無し（期限切れ時は再ログイン）とする想定を仮置きしている。確定次第この節を更新する。
- 現行実装の`POST /login`（`/api`無し、レスポンスがUserエンティティそのもの）から、パスの統一とJWT発行のためレスポンス形式を変更する。

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | API設計 |
| 最終更新日 | 2026-08-18 |
| 更新者 | Ren Nakamoto |
