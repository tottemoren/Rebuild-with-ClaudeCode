# 技術スタック

開発環境（現状の実装）と、本番リリースを見据えた目標構成の両方を記載する。

---

## 1. フロントエンド

| 項目 | 採用技術 | 備考 |
|---|---|---|
| フレームワーク | React 19 | |
| 言語 | TypeScript | |
| ビルドツール | Vite 8 | |
| ルーティング | react-router-dom 7 | |
| Lint | ESLint | |

---

## 2. バックエンド

| 項目 | 採用技術 | 備考 |
|---|---|---|
| 言語 | Java 21 | |
| フレームワーク | Spring Boot 4 | |
| データアクセス | Spring Data JPA (Hibernate) | |
| 認証・認可 | Spring Security + JWT | パスワードはBCryptでハッシュ化済み。JWT発行/検証の実装は未着手（[system-design.md](system-design.md)参照） |
| ボイラープレート削減 | Lombok | |
| ビルドツール | Gradle | |

---

## 3. データベース

| 項目 | 採用技術 | 備考 |
|---|---|---|
| RDBMS | MySQL 8.4 | 開発環境はDockerコンテナ、本番はAmazon RDSを想定 |

---

## 4. ストレージ（画像・ファイル）

| 用途 | 開発環境 | 本番目標環境 |
|---|---|---|
| プロフィール画像 | ローカルディスク保存（`uploads/profile-images/`、実装済み） | Amazon S3への移行を別途検討（現時点ではスコープ外） |
| イラスト素材（漫画のコマ画像等） | 未実装（現状はフロントエンドの静的ファイル参照のみ） | Amazon S3（バケットを新設し、presigned URLを用いた直接アップロード方式を想定） |

---

## 5. インフラ・実行環境

### 5.1 開発環境（現状）

| 項目 | 採用技術 | 備考 |
|---|---|---|
| コンテナ化 | Docker / Docker Compose | `compose.yml`でfrontend/backend/mysqlの3コンテナ構成 |
| フロントエンド配信 | Vite Dev Server（コンテナ内） | ポート5173 |
| バックエンドAPI | Spring Boot 組み込みTomcat | ポート8080 |
| DB | MySQLコンテナ | ホスト側ポート3307（コンテナ内3306） |

### 5.2 本番目標環境（AWS）

実際のサービスとして通用するレベルを目標に、以下のAWS構成を想定する。詳細は[system-architecture.md](system-architecture/system-architecture.md)を参照。

| 項目 | 採用予定技術 | 用途 |
|---|---|---|
| DNS | Route 53 | 独自ドメインの名前解決 |
| CDN配信 | CloudFront | フロントエンド静的ファイル・イラスト素材の配信高速化 |
| フロントエンドホスティング | S3（静的ウェブサイトホスティング） | Reactのビルド成果物を配置 |
| ロードバランサ | ALB（Application Load Balancer） | バックエンドAPIへのリクエスト振り分け |
| バックエンド実行環境 | ECS（Fargate） | Dockerイメージをそのままコンテナ実行。ECRでイメージ管理 |
| データベース | RDS for MySQL | Multi-AZ等の可用性オプションは別途検討 |
| ファイルストレージ | S3（イラスト素材・将来的にはプロフィール画像も） | |
| シークレット管理 | Secrets Manager | DB接続情報・JWT署名鍵等 |

---

## 6. 未選定・今後決定する項目

| 項目 | 状況 |
|---|---|
| JWTライブラリ | 未選定（例: `io.jsonwebtoken:jjwt` 等を候補として別途選定） |
| CI/CDパイプライン | 未検討 |
| 監視・ログ収集（CloudWatch等） | 未検討 |
| IaC（Terraform等でのインフラ管理） | 未検討 |

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | システム設計 |
| 最終更新日 | 2026-08-18 |
| 更新者 | Ren Nakamoto |
