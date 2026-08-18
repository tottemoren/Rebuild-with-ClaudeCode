# API設計

> 02-screen-design（画面設計）・03-system-design（システム設計）・04-database（DB設計）の内容を、実際のエンドポイントとして定義する工程。
> ここでの成果物は、06-test（テスト）およびバックエンド実装のインプットとなる。

---

## 1. フォルダ構成

| パス | 内容 |
|---|---|
| [README.md](README.md) | このファイル。05フォルダ全体の概要 |
| [api-list.md](api-list.md) | API一覧（全25本のエンドポイント、共通仕様、現行実装との差分） |
| [specifications/](specifications/) | API詳細（リクエスト・レスポンス・エラーをAPIグループごとに記載） |

---

## 2. サマリー

現行の実装（`RebuildJava`の各Controller）を確認したところ、エンドポイントのパスが不統一（`/api`が付くものと付かないものが混在）、認証・認可が存在しない、他人のデータを閲覧・改ざんできてしまう等の課題があった。これらを踏まえ、次の方針でAPIを再設計した。

| 論点 | 現状 | 方針 |
|---|---|---|
| パスの一貫性 | `/login`, `/stories`, `/dialogues`など`/api`が無いものが混在 | `/api/**`に統一 |
| 認証 | 認証の仕組みが無い（`permitAll`） | 03-system-designの方針通りJWTを必須化 |
| データの持ち主判定 | `userId`をリクエストパラメータで受け取り、そのまま信用している | JWTから取得した自分のIDを正とし、他人のデータへのアクセスを`403`で拒否する |
| メモAPIの実装場所 | 汎用コントローラーに直書きされ、Service層を経由しない | `MemosController` → `MemoService`のレイヤー構成に統一 |
| エラー時のレスポンス形式 | 文字列だったりJSONだったりバラバラ | `{ "message": "..." }`形式に統一 |

APIグループは02-screen-designの画面、04-databaseのテーブルとおおよそ対応している。

| APIグループ | 対応画面 | 対応する主なテーブル |
|---|---|---|
| [認証](specifications/auth.md) | Login, Register | `users` |
| [ユーザー](specifications/users.md) | Home等（ヘッダーのアカウント情報） | `users` |
| [メモ](specifications/memos.md) | Memo | `memos` |
| [ストーリー・ジャンル](specifications/stories.md) | StoryCreate | `stories`, `genres`, `story_genres` |
| [セリフ](specifications/dialogues.md) | StoryCreate（作成）, CreateManga（配置） | `dialogues` |
| [漫画ページ・コマ](specifications/manga.md) | CreateManga | `manga_pages`, `manga_panels` |
| [イラスト素材フォルダ・素材](specifications/materials.md) | TopicChoice, CreateManga | `folders`, `materials` |

---

## 3. 申し送り事項

- トークンの有効期限・リフレッシュトークンの要否は未確定（[auth.md 備考](specifications/auth.md)参照）。
- ジャンルマスタの初期データ投入方針は未確定（[stories.md](specifications/stories.md)参照）。
- フォルダ削除時、中に素材が残っている場合の扱いは暫定方針のみ（[materials.md](specifications/materials.md)参照）。
- 素材削除時、既にその素材を使っている`manga_panels`がある場合の扱いは未確定（[materials.md](specifications/materials.md)参照）。
- `folder_shares`（フォルダ共有）に対応するAPIは未設計。対応する画面が無いため。
- 設定画面・アカウント情報編集画面に対応するAPIは、画面自体が未設計のため本ドキュメントには含めていない（[02-screen-design README](../02-screen-design/README.md)申し送り事項参照）。

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | API設計 |
| 最終更新日 | 2026-08-18 |
| 更新者 | Ren Nakamoto |
