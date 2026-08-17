# システム設計書

01-requirements（要件定義）・02-screen-design（画面設計）の内容を実現するための、システム全体の設計方針をまとめる。技術スタックの詳細は[tech-stack.md](tech-stack.md)、構成図は[system-architecture.md](system-architecture/system-architecture.md)を参照。

---

## 1. アーキテクチャ方針

バックエンドは、現状の実装（`RebuildJava`）に倣い、Controller → Service → Repository → Entity のレイヤードアーキテクチャを採用する。

| 層 | 役割 |
|---|---|
| Controller | HTTPリクエストの受付、DTOへの変換、レスポンス返却 |
| Service | ビジネスロジック |
| Repository | Spring Data JPAによるDBアクセス |
| Entity | DBテーブルに対応するドメインモデル |

フロントエンド（`RebuildReact`）は、画面（`pages/`）・共通コンポーネント（`components/`）・状態取得用フック（`hooks/`）・型定義（`types/`）に分離する現状の構成を踏襲する。

---

## 2. 認証・認可設計

### 2.1 現状の課題

現在は以下の状態であり、正式な認証・認可の仕組みが存在しない。

- ログイン成功時、フロントエンドは`localStorage`にユーザー情報を保存するのみ
- バックエンドは`SecurityConfig`で全リクエストを`permitAll()`しており、誰でも任意のAPIを呼び出せる
- パスワードのみBCryptでハッシュ化・照合されている（[CHANGELOG 2026-08-08](../docs/ClaudeCode%20CHANGELOG/2026/08/2026-08-08.md)参照）

### 2.2 方針：JWTトークン認証

現在のフロントエンドがCookieを使わないfetchベースのAPI構成であることを踏まえ、JWTによるトークン認証を採用する。

| 項目 | 方針 |
|---|---|
| トークン発行 | ログイン成功時（`POST /api/users/login`相当）に、バックエンドがJWTを発行する |
| トークン送信 | フロントエンドはトークンを保持し、以降のAPIリクエストで`Authorization: Bearer <token>`ヘッダーに付与する |
| トークン検証 | バックエンドにSpring SecurityのフィルターとしてJWT検証処理を追加し、未認証リクエストを`401`で拒否する |
| 保護対象 | ユーザー自身のデータを扱うAPI（メモ・ストーリー・漫画関連等）は認証必須とする。ログイン・登録APIは対象外 |
| トークン保持場所 | フロントエンドでの保持方法（`localStorage` / メモリ保持等）はXSSリスクとのトレードオフがあるため、05-api（または実装時）で確定する |

### 2.3 未確定事項（今後の詳細設計）

- トークンの有効期限、リフレッシュトークンの要否
- JWT署名鍵の管理方法（本番はSecrets Manager、開発は環境変数を想定）
- 使用するJWTライブラリの選定（[tech-stack.md](tech-stack.md)参照）

---

## 3. イラスト素材のアップロード・保存設計

### 3.1 現状

- プロフィール画像：バックエンドのローカルディスク（`uploads/profile-images/`）に保存し、`/uploads/**`で配信する仕組みが実装済み
- イラスト素材（漫画のコマ画像等）：アップロードの仕組み自体が未実装。現状は`MangaPanel.imageSrc`にフロントエンドの静的ファイルパスを保持しているのみ

### 3.2 方針：S3への直接アップロード（presigned URL方式）

本番環境ではAmazon S3にイラスト素材を保存する。バックエンドを経由した通常のアップロードではなく、S3の署名付きURL（presigned URL）を用いてブラウザから直接S3へアップロードする方式を採用する。

理由：
- イラスト素材は画像ファイルでありサイズが大きくなり得るため、バックエンド（ECS）を経由させるとサーバー負荷・処理時間が増える
- presigned URL方式であれば、バックエンドは認可判断とメタデータ管理に専念できる

処理の流れは[system-architecture.md 3章](system-architecture/system-architecture.md#3-イラスト素材アップロードのシーケンス本番目標構成における想定)を参照。

### 3.3 保留事項

- プロフィール画像もS3に統一するかどうかは、今回のスコープ外として保留する（現状のローカルディスク実装を維持）
- S3バケットの構成（フォルダ単位でのプレフィックス設計等）は04-databaseのフォルダ・素材のデータモデルとあわせて設計する

---

## 4. 招待コード（ユーザー登録制限）について

### 4.1 現状

`UserController#register`にて、招待コード文字列`"Rebuild2026"`がハードコードされており、一致した場合のみ登録を許可している。

### 4.2 方針

ユーザーへの確認の結果、招待コードによる登録制限は**開発段階（限定公開）のための暫定措置**であり、正式リリース時には廃止する前提とする。そのため、招待コードを管理するための専用テーブルや発行・失効機能への投資は行わない。

> **申し送り**：[01-requirements](../01-requirements/README.md)のREQ-002、および[02-screen-design](../02-screen-design)のユーザー登録画面（Register）の仕様は、招待コードを前提とした記述になっている。正式リリース時にはこれらのドキュメントも「招待コード欄を削除する」形に更新が必要になる。本ドキュメント作成時点では未対応。

---

## 5. 環境構成

| 環境 | 用途 | 構成 |
|---|---|---|
| 開発環境 | ローカルでの開発・動作確認 | Docker Compose（frontend / backend / mysql） |
| 本番目標環境 | 実際のサービス公開時 | AWS（S3 + CloudFront + ALB + ECS + RDS）。詳細は[system-architecture.md](system-architecture/system-architecture.md) |

現時点で本番環境の構築・デプロイは未着手であり、上記は目標構成として設計している。

---

## 6. 今後の検討事項（申し送り）

- JWT認証の実装（ライブラリ選定、フィルター実装、フロントエンドのトークン管理）
- S3アップロード（presigned URL発行API）の詳細設計 → 05-apiで具体化
- 招待コード廃止に伴う01-requirements・02-screen-designの更新
- プロフィール画像のS3移行要否の判断
- CI/CDパイプライン、IaC（Terraform等）、監視・ログ収集の検討
- 04-databaseにて、イラスト素材フォルダ（[02-screen-design TopicChoice](../02-screen-design/specifications/TopicChoice.md)参照）に対応するテーブル設計を行う（現状のDBスキーマにはフォルダ・素材関連のテーブルが存在しない）

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | システム設計 |
| 最終更新日 | 2026-08-17 |
| 更新者 | Ren Nakamoto |
