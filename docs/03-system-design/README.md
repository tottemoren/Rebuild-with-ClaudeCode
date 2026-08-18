# システム設計

> 01-requirements（要件定義）・02-screen-design（画面設計）の内容を、実際にどう作るか（アーキテクチャ・認証方式・データ保存方式・実行環境）に落とし込む工程。
> ここでの成果物は、04-database（DB設計）・05-api（API設計）のインプットとなる。

---

## 1. フォルダ構成

| パス | 内容 |
|---|---|
| [README.md](README.md) | このファイル。03フォルダ全体の概要 |
| [system-design.md](system-design.md) | システム設計書。アーキテクチャ方針・認証設計・素材保存設計・招待コードの扱い・環境構成などの意思決定をまとめたもの |
| [system-architecture/](system-architecture/) | システム構成図（開発環境・本番目標環境・アップロード処理のシーケンス） |
| [tech-stack.md](tech-stack.md) | 技術スタック一覧（フロントエンド・バックエンド・DB・インフラ） |

---

## 2. サマリー

現在の実装（`RebuildJava` / `RebuildReact`）を調査したうえで、実務レベルのシステムとして不足していた以下の点をユーザーと合意し設計した。

| 論点 | 現状 | 方針 |
|---|---|---|
| 認証 | `localStorage`保存のみ、バックエンドは全API無条件許可 | JWTトークン認証を導入する |
| イラスト素材の保存 | 未実装（静的ファイル参照のみ） | Amazon S3（署名付きURLによる直接アップロード） |
| 招待コード | バックエンドにハードコードされた文字列1つ | 開発段階限定の暫定措置。正式リリース時に廃止 |
| 本番環境 | 未構築（開発はDocker Composeのみ） | AWS（S3 + CloudFront + ALB + ECS + RDS）を目標構成とする |

詳細は[system-design.md](system-design.md)、構成図は[system-architecture.md](system-architecture/system-architecture.md)、技術要素の一覧は[tech-stack.md](tech-stack.md)を参照。

---

## 3. 申し送り事項

- 招待コードは開発段階限定の仕組みであるため、正式リリース時には[01-requirements](../01-requirements/README.md)（REQ-002）と[02-screen-design](../02-screen-design)（ユーザー登録画面）の記述も更新が必要になる。現時点では未対応（[system-design.md 4章](system-design.md#4-招待コードユーザー登録制限について)参照）。
- 04-databaseでは、02-screen-designで定義されているイラスト素材フォルダ機能に対応するテーブル設計が必要（現状のDBスキーマには存在しない）。
- JWT認証・S3アップロードはいずれも設計のみで実装は未着手。

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | システム設計 |
| 最終更新日 | 2026-08-18 |
| 更新者 | Ren Nakamoto |
