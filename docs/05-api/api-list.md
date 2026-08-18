# API一覧

04-databaseのテーブル設計・03-system-designの認証方針（JWT）をもとに設計したAPI一覧。各APIの詳細（リクエスト/レスポンス/エラー）は[specifications/](specifications/)を参照。

---

## 共通仕様

| 項目 | 内容 |
|---|---|
| ベースパス | `/api` に統一する（現行実装は`/stories`や`/dialogues`など`/api`が付いていないエンドポイントが混在しているため、統一する） |
| 認証 | ログイン・登録を除く全APIで`Authorization: Bearer <JWTトークン>`ヘッダーを必須とする |
| データの持ち主の判定 | URLやリクエストボディの`userId`をそのまま信用せず、JWTから取得した「自分のID」を正として扱う（現行実装は`userId`をクエリパラメータで受け取っており、他人のデータを閲覧・改ざんできてしまう状態） |
| 成功時レスポンス | 対象のリソースをそのままJSONで返す（一覧は配列） |
| エラー時レスポンス | `{ "message": "エラー内容" }`形式で統一し、意味に応じたHTTPステータスコードを返す（`400`不正なリクエスト、`401`未認証、`403`権限なし、`404`存在しない、`409`競合、`500`サーバーエラー） |
| 一覧取得のページング | v1ではページングを行わず全件返却する（データ量が増えた場合は別途追加を検討） |

---

## 1. 認証（auth）

| No | メソッド | パス | 概要 | 認証 | 詳細 |
|---|---|---|---|---|---|
| 1-1 | POST | `/api/auth/register` | ユーザー登録（招待コード確認は開発段階限定） | 不要 | [auth.md](specifications/auth.md) |
| 1-2 | POST | `/api/auth/login` | ログイン。成功時にJWTを発行する | 不要 | [auth.md](specifications/auth.md) |

## 2. ユーザー（users）

| No | メソッド | パス | 概要 | 認証 | 詳細 |
|---|---|---|---|---|---|
| 2-1 | GET | `/api/users/me` | ログイン中ユーザーの情報を取得する | 必要 | [users.md](specifications/users.md) |
| 2-2 | POST | `/api/users/me/profile-image` | プロフィール画像をアップロードする | 必要 | [users.md](specifications/users.md) |

## 3. メモ（memos）

| No | メソッド | パス | 概要 | 認証 | 詳細 |
|---|---|---|---|---|---|
| 3-1 | GET | `/api/memos` | 自分のメモ一覧を取得する | 必要 | [memos.md](specifications/memos.md) |
| 3-2 | POST | `/api/memos` | メモを新規作成する | 必要 | [memos.md](specifications/memos.md) |
| 3-3 | PUT | `/api/memos/{id}` | メモを更新する | 必要 | [memos.md](specifications/memos.md) |
| 3-4 | DELETE | `/api/memos/{id}` | メモを削除する | 必要 | [memos.md](specifications/memos.md) |

## 4. ストーリー・ジャンル（stories）

| No | メソッド | パス | 概要 | 認証 | 詳細 |
|---|---|---|---|---|---|
| 4-1 | GET | `/api/genres` | ジャンルマスタの一覧を取得する | 必要 | [stories.md](specifications/stories.md) |
| 4-2 | GET | `/api/stories` | 自分のストーリー一覧を取得する | 必要 | [stories.md](specifications/stories.md) |
| 4-3 | POST | `/api/stories` | ストーリーを新規作成する（ジャンルの紐付けを含む） | 必要 | [stories.md](specifications/stories.md) |
| 4-4 | GET | `/api/stories/{id}` | ストーリー詳細を取得する | 必要 | [stories.md](specifications/stories.md) |
| 4-5 | PUT | `/api/stories/{id}` | ストーリーを更新する | 必要 | [stories.md](specifications/stories.md) |
| 4-6 | DELETE | `/api/stories/{id}` | ストーリーを削除する | 必要 | [stories.md](specifications/stories.md) |

## 5. セリフ（dialogues）

| No | メソッド | パス | 概要 | 認証 | 詳細 |
|---|---|---|---|---|---|
| 5-1 | GET | `/api/stories/{storyId}/dialogues` | ストーリーの台本（セリフ一覧）を取得する | 必要 | [dialogues.md](specifications/dialogues.md) |
| 5-2 | POST | `/api/stories/{storyId}/dialogues` | セリフを追加する | 必要 | [dialogues.md](specifications/dialogues.md) |
| 5-3 | PUT | `/api/dialogues/{id}` | セリフの発言者・本文を編集する | 必要 | [dialogues.md](specifications/dialogues.md) |
| 5-4 | DELETE | `/api/dialogues/{id}` | セリフを削除する | 必要 | [dialogues.md](specifications/dialogues.md) |
| 5-5 | PUT | `/api/dialogues/{id}/placement` | セリフの配置先ページ・座標を確定する（漫画編集時） | 必要 | [dialogues.md](specifications/dialogues.md) |

## 6. 漫画ページ・コマ（manga）

| No | メソッド | パス | 概要 | 認証 | 詳細 |
|---|---|---|---|---|---|
| 6-1 | GET | `/api/stories/{storyId}/pages` | ページ一覧を取得する | 必要 | [manga.md](specifications/manga.md) |
| 6-2 | POST | `/api/stories/{storyId}/pages` | ページを追加する | 必要 | [manga.md](specifications/manga.md) |
| 6-3 | DELETE | `/api/pages/{id}` | ページを削除する | 必要 | [manga.md](specifications/manga.md) |
| 6-4 | GET | `/api/pages/{pageId}/panels` | ページに配置済みのイラスト一覧を取得する | 必要 | [manga.md](specifications/manga.md) |
| 6-5 | PUT | `/api/pages/{pageId}/panels` | ページのイラスト配置をまとめて保存する | 必要 | [manga.md](specifications/manga.md) |

## 7. イラスト素材フォルダ・素材（materials）

| No | メソッド | パス | 概要 | 認証 | 詳細 |
|---|---|---|---|---|---|
| 7-1 | GET | `/api/folders` | 自分のフォルダ一覧を取得する | 必要 | [materials.md](specifications/materials.md) |
| 7-2 | POST | `/api/folders` | フォルダを作成する | 必要 | [materials.md](specifications/materials.md) |
| 7-3 | DELETE | `/api/folders/{id}` | フォルダを削除する | 必要 | [materials.md](specifications/materials.md) |
| 7-4 | GET | `/api/folders/{folderId}/materials` | フォルダ内の素材一覧を取得する | 必要 | [materials.md](specifications/materials.md) |
| 7-5 | POST | `/api/materials/upload-url` | 素材アップロード用のS3署名付きURLを発行する | 必要 | [materials.md](specifications/materials.md) |
| 7-6 | POST | `/api/materials` | アップロード完了を通知し、素材メタデータを登録する | 必要 | [materials.md](specifications/materials.md) |
| 7-7 | DELETE | `/api/materials/{id}` | 素材を削除する | 必要 | [materials.md](specifications/materials.md) |

---

## 現行実装との主な差分

| 現行実装 | 目標設計 | 理由 |
|---|---|---|
| `/login`, `/stories`, `/dialogues`（`/api`無し） | すべて`/api/**`配下に統一 | エンドポイントの一貫性 |
| メモAPIが`RebuildJavaController`という汎用コントローラーに実装され、Service層を経由していない | `MemosController` → `MemoService` → `MemoRepository`のレイヤー構成に統一 | 03-system-designのアーキテクチャ方針との整合 |
| `GET /stories`が全ユーザーのストーリーを無条件で返す（`userId`によるフィルタなし） | JWTから取得した自分のIDでフィルタする | 他人のデータが見えてしまう問題の解消 |
| `GET /api/users/{id}`が任意のIDを指定して他人の情報を取得できる | `GET /api/users/me`に変更し、常に自分の情報のみ返す | 同上 |
| 認証・認可の仕組みが無い（全API`permitAll`） | JWT必須化 | 03-system-designの認証方針 |

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | API設計 |
| 最終更新日 | 2026-08-18 |
| 更新者 | Ren Nakamoto |
