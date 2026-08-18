# テーブル定義書

01〜03の内容を踏まえたDB設計。ER図は[er-diagram.md](er-diagram/er-diagram.md)を参照。

---

## 0. 命名規則・共通ルール

| 項目 | 規則 |
|---|---|
| テーブル名 | 複数形・snake_case（例: `stories`, `manga_panels`） |
| カラム名 | snake_case |
| 主キー | 全テーブル共通で`id BIGINT AUTO_INCREMENT`（中間テーブルを除く） |
| 外部キー | 参照先テーブルの単数形 + `_id`（例: `stories`を参照する場合`story_id`） |
| 日時カラム | `created_at` / `updated_at`を全テーブルに付与する（中間テーブル・共有テーブルは`created_at`のみ） |
| 文字コード | `utf8mb4` / `utf8mb4_0900_ai_ci`（現行DBに合わせる） |
| ストレージエンジン | InnoDB |

---

## 1. users（ユーザー）

| 物理名 | 型 | PK | FK | NOT NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | ○ | |
| username | VARCHAR(255) | | | ○ | ログインID。UNIQUE制約あり |
| password | VARCHAR(255) | | | ○ | BCryptハッシュ化済みパスワード |
| role | VARCHAR(255) | | | ○ | 例: `USER`。将来`ADMIN`等の追加を想定 |
| profile_image_url | VARCHAR(255) | | | | プロフィール画像URL。未設定時はNULL |
| created_at | DATETIME | | | ○ | |
| updated_at | DATETIME | | | ○ | |

現行実装からの変更：`created_at` / `updated_at`を追加。

---

## 2. memos（メモ）

| 物理名 | 型 | PK | FK | NOT NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | ○ | |
| user_id | BIGINT | | users.id | ○ | 所有ユーザー |
| title | VARCHAR(255) | | | ○ | メモのタイトル |
| content | TEXT | | | | 本文 |
| writing_direction | VARCHAR(20) | | | ○ | `horizontal`（横書き）/ `vertical`（縦書き） |
| created_at | DATETIME | | | ○ | |
| updated_at | DATETIME | | | ○ | |

現行実装からの変更：テーブル名を`memo`→`memos`に変更。`user_id`（所有者の紐付け。現行は存在せず全ユーザーで共有されてしまっている）、`title`、`writing_direction`、`created_at`、`updated_at`を追加。`text`カラムは`content`にリネーム。

---

## 3. stories（ストーリー）

| 物理名 | 型 | PK | FK | NOT NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | ○ | |
| user_id | BIGINT | | users.id | ○ | 所有ユーザー |
| title | VARCHAR(255) | | | ○ | |
| summary | TEXT | | | | あらすじ |
| created_at | DATETIME | | | ○ | |
| updated_at | DATETIME | | | ○ | |

現行実装からの変更：`genre`カラムを廃止し、`genres` / `story_genres`で正規化。`user_id`にFK制約を追加。`updated_at`を追加。

---

## 4. genres（ジャンルマスタ）

| 物理名 | 型 | PK | FK | NOT NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | ○ | |
| name | VARCHAR(100) | | | ○ | ジャンル名（例: 恋愛、友人、会話）。UNIQUE制約あり |

新規テーブル。初期データの投入方針（ユーザーが自由入力するか、運営が用意したマスタから選ぶか）は[README.md](README.md)の申し送り事項を参照。

---

## 5. story_genres（ストーリー×ジャンル 中間テーブル）

| 物理名 | 型 | PK | FK | NOT NULL | 説明 |
|---|---|---|---|---|---|
| story_id | BIGINT | ○ | stories.id | ○ | |
| genre_id | BIGINT | ○ | genres.id | ○ | |
| created_at | DATETIME | | | ○ | |

複合主キー（`story_id`, `genre_id`）。1ストーリーあたり最大3件までという制約は、DBのCHECK制約ではなくアプリケーション（Service層）でのバリデーションとして実装する。

---

## 6. manga_pages（漫画のページ）

| 物理名 | 型 | PK | FK | NOT NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | ○ | |
| story_id | BIGINT | | stories.id | ○ | 所属ストーリー |
| page_no | INT | | | ○ | ページ番号（表示順）。1始まりを想定 |
| created_at | DATETIME | | | ○ | |
| updated_at | DATETIME | | | ○ | |

新規テーブル。[02-screen-design CreateManga](../02-screen-design/specifications/CreateManga.md)の「ページ（コマ）一覧」に対応する。`manga_panels`（イラストの配置）と`dialogues`（セリフの配置）は、いずれも本テーブルの`id`（`page_id`）で特定のページに紐づく。

---

## 7. dialogues（セリフ）

| 物理名 | 型 | PK | FK | NOT NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | ○ | |
| story_id | BIGINT | | stories.id | ○ | 所属ストーリー（ストーリー作成時点で確定） |
| page_id | BIGINT | | manga_pages.id | | 配置先ページ。ストーリー作成段階（座標未確定）ではNULL、漫画編集時に確定する |
| order_no | INT | | | ○ | 台本としての表示順（[StoryCreate](../02-screen-design/specifications/StoryCreate.md)でのセリフ作成順） |
| talker_name | VARCHAR(255) | | | | 発言者名（自由入力。キャラクターマスタは持たない） |
| line | TEXT | | | | セリフ本文 |
| x | DOUBLE | | | | ページ内でのX座標(px)。配置前はNULL |
| y | DOUBLE | | | | ページ内でのY座標(px)。配置前はNULL |
| width | DOUBLE | | | | セリフ枠の幅(px)。配置前はNULL |
| height | DOUBLE | | | | セリフ枠の高さ(px)。配置前はNULL |
| z_index | INT | | | | 重なり順。配置前はNULL |
| created_at | DATETIME | | | ○ | |
| updated_at | DATETIME | | | ○ | |

現行実装からの変更：`story_id`にFK制約を追加。`page_id` / `x` / `y` / `width` / `height` / `z_index` / `created_at` / `updated_at`を追加。イラスト素材（`materials`）と異なり、同一セリフを複数箇所で再利用するケースは想定しないため、「セリフマスタ＋配置」を別テーブルに分けず、本テーブルに座標を直接持たせる設計とした。

---

## 8. folders（イラスト素材フォルダ）

| 物理名 | 型 | PK | FK | NOT NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | ○ | |
| user_id | BIGINT | | users.id | ○ | 所有ユーザー |
| name | VARCHAR(255) | | | ○ | フォルダ名 |
| created_at | DATETIME | | | ○ | |
| updated_at | DATETIME | | | ○ | |

新規テーブル。[02-screen-design TopicChoice](../02-screen-design/specifications/TopicChoice.md)のフォルダ追加・削除機能に対応。

---

## 9. materials（イラスト素材）

| 物理名 | 型 | PK | FK | NOT NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | ○ | |
| folder_id | BIGINT | | folders.id | ○ | 所属フォルダ |
| file_name | VARCHAR(255) | | | ○ | アップロード時の元ファイル名 |
| storage_key | VARCHAR(512) | | | ○ | S3オブジェクトキー（[03-system-design](../03-system-design/system-design.md)のアップロード設計を参照） |
| content_type | VARCHAR(100) | | | | MIMEタイプ（例: `image/png`） |
| uploaded_at | DATETIME | | | ○ | |

新規テーブル。所有者は`folder_id`経由で`folders.user_id`を参照する（このテーブル自体に`user_id`は持たせない）。

---

## 10. folder_shares（フォルダ共有：将来拡張用）

| 物理名 | 型 | PK | FK | NOT NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | ○ | |
| folder_id | BIGINT | | folders.id | ○ | 共有対象フォルダ |
| shared_with_user_id | BIGINT | | users.id | ○ | 共有先ユーザー |
| permission | VARCHAR(20) | | | ○ | 例: `VIEW` / `EDIT` |
| created_at | DATETIME | | | ○ | |

新規テーブル。03-system-designでの合意（将来的な素材共有・コラボ機能を見据える）を受けて用意。**現時点でこのテーブルを利用するUI・APIは存在しない**。02-screen-designに共有関連の画面が追加された段階で、具体的な権限設計とあわせて利用を開始する。

---

## 11. manga_panels（漫画のコマ＝配置されたイラスト素材）

| 物理名 | 型 | PK | FK | NOT NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | ○ | |
| page_id | BIGINT | | manga_pages.id | ○ | 配置先ページ |
| material_id | BIGINT | | materials.id | ○ | 配置しているイラスト素材 |
| x | DOUBLE | | | ○ | ページ内のX座標(px) |
| y | DOUBLE | | | ○ | ページ内のY座標(px) |
| width | DOUBLE | | | ○ | |
| height | DOUBLE | | | ○ | |
| z_index | INT | | | ○ | 重なり順 |
| created_at | DATETIME | | | ○ | |
| updated_at | DATETIME | | | ○ | |

現行実装からの変更：`image_src`（パス文字列）を廃止し、`material_id`（`materials`への外部キー）に変更。また、現行は`story_id`に直接紐づいていたが、`manga_pages`を新設したことに伴い`page_id`に変更（ストーリーは`page_id → manga_pages.story_id`で辿る）。

---

## 現行実装との差分・マイグレーション時の申し送り

現行の`database/init.sql`は開発初期のシンプルなスキーマであり、上記設計への移行にはいくつか破壊的変更（既存データ・既存API実装への影響）を伴う。実装時に対応すること。

| 変更内容 | 影響 |
|---|---|
| `memo`→`memos`にリネーム、`user_id`等を追加 | `Memo`エンティティ・`MemoRepository`・関連APIの修正が必要。既存の`memo`テーブルのデータは、所有者不明のため移行方針を別途検討（開発用シードデータのため再投入でも可） |
| `stories.genre`を廃止し正規化 | `Story`エンティティ・`StoryService`の修正、既存データがあれば`genres` / `story_genres`への移行が必要 |
| `manga_pages`の新設 | `MangaPage`エンティティ・Repository・Service・Controllerを新規実装する必要がある（05-apiで詳細化） |
| `dialogues`に`page_id` / 座標カラムを追加 | `Dialogue`エンティティの修正、[StoryCreate](../02-screen-design/specifications/StoryCreate.md)（台本作成）と[CreateManga](../02-screen-design/specifications/CreateManga.md)（座標確定）の2段階でAPIが更新する形になる想定 |
| `manga_panels.image_src`→`material_id`、`story_id`→`page_id` | `MangaPanel`エンティティ・`MangaPanelController` / `MangaPanelService`の修正が必要。現状はフロントエンドの静的画像パスを直接保存しているため、`materials`テーブルへのデータ投入（S3アップロード導入）と`manga_pages`の導入が前提となる |
| `folders` / `materials` / `folder_shares` / `genres` / `story_genres`の新規追加 | 対応するEntity・Repository・Service・Controllerを新規実装する必要がある（05-apiで詳細化） |
| 全テーブルへの`created_at` / `updated_at`追加 | 既存テーブルへのALTER、Entityへの`@CreationTimestamp` / `@UpdateTimestamp`等の付与が必要 |
| 外部キー制約の追加 | 現行はJPA上も外部キー制約が無い状態。制約追加時は既存データの整合性（孤立レコードの有無）を確認する |

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | データベース設計 |
| 最終更新日 | 2026-08-18 |
| 更新者 | Ren Nakamoto |
