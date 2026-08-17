# データベース設計

> 01-requirements・02-screen-design・03-system-designの内容を、実際のテーブル構造に落とし込む工程。
> ここでの成果物は、05-api（API設計）のインプットとなる。

---

## 1. フォルダ構成

| パス | 内容 |
|---|---|
| [README.md](README.md) | このファイル。04フォルダ全体の概要 |
| [table-definitions.md](table-definitions.md) | テーブル定義書（全11テーブルのカラム定義・制約・現行実装との差分） |
| [er-diagram/](er-diagram/) | ER図（Mermaid記法） |

---

## 2. サマリー

既存の実装（`RebuildJava`のEntity・`database/init.sql`）を確認したところ、現行のDB設計には以下の課題があった。これらをユーザーと合意のうえ、新しいテーブル設計を行った。

| 論点 | 現状 | 方針 |
|---|---|---|
| メモの所有者 | `memo`テーブルに`user_id`が無く、全ユーザーで共有されてしまう | `memos`テーブルに`user_id`を追加（実質バグ修正） |
| ストーリーのジャンル（最大3つ） | `stories.genre`が単一カラム | `genres`マスタ＋`story_genres`中間テーブルで正規化 |
| メモの横書き/縦書き | カラムなし | `writing_direction`カラムを追加（1件のメモにつき1方向） |
| イラスト素材・フォルダ | テーブル自体が存在しない | `folders` / `materials`テーブルを新設。03-system-designで決定したS3保存を前提に`storage_key`を持たせる |
| 素材の共有・コラボ | 未検討 | 将来拡張用に`folder_shares`テーブルを用意（現時点でUI・APIは無し） |
| コマ画像の参照方法 | `manga_panels.image_src`が単なるパス文字列 | `materials`テーブルへの外部キー（`material_id`）に変更 |
| 漫画の「ページ」管理 | テーブル自体が存在しない（`manga_panels`が`story_id`に直接紐づくのみ） | `manga_pages`テーブルを新設。`manga_panels`・`dialogues`はともに`page_id`で特定のページに紐づける |
| セリフの座標管理 | カラムなし（台本としての順序のみ） | `dialogues`に`page_id` / `x` / `y` / `width` / `height` / `z_index`を追加。素材のような「マスタ＋配置」分離はせず直接カラムを持たせる |
| テーブル間の整合性 | 外部キー制約が一切無い | 全ての関連カラムにFK制約を追加 |

全体像は[er-diagram.md](er-diagram/er-diagram.md)、各テーブルの詳細は[table-definitions.md](table-definitions.md)を参照。

---

## 3. 申し送り事項

- 本設計は**現行実装からの破壊的変更**を複数含む（`memo`→`memos`のリネーム、`stories.genre`の廃止、`manga_panels.image_src`→`material_id`への変更等）。実装時の移行対応は[table-definitions.md 末尾](table-definitions.md#現行実装との差分マイグレーション時の申し送り)を参照。
- `genres`マスタの初期データ投入方針（運営が用意するプリセットか、ユーザーの自由入力を都度マスタ化するか）は未確定。05-api以降で決める。
- `folder_shares`は将来の共有機能に備えたテーブルのみ用意しており、対応する画面（02-screen-design）・API（05-api）は未着手。
- イラスト素材（`materials`）のアップロード自体（S3への保存処理）は03-system-designで方式のみ決定しており、実装は未着手。

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | データベース設計 |
| 最終更新日 | 2026-08-17 |
| 更新者 | Ren Nakamoto |
