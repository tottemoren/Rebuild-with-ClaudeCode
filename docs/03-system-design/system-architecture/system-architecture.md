# システム構成図

02-screen-designの画面遷移図が`.drawio`形式であるのに対し、本ファイルはMermaid記法で構成図を記述している（この環境ではdrawioの編集アプリを直接操作できないため）。GitHubやVS Code（Mermaidプラグイン導入時）ではそのまま図として表示される。drawio形式への統一が必要であれば、本ファイルの内容をベースに作成できる。

---

## 1. 開発環境構成（現状）

`compose.yml`で定義されている、現在ローカルで動かしている構成。

```mermaid
graph TB
    subgraph Client["開発者のブラウザ"]
        Browser
    end

    subgraph Docker["Docker Compose ネットワーク"]
        FE["frontend コンテナ<br/>Vite Dev Server<br/>:5173"]
        BE["backend コンテナ<br/>Spring Boot (Tomcat)<br/>:8080"]
        DB[("mysql コンテナ<br/>MySQL 8.4<br/>:3306 (外部公開:3307)")]
        Vol[("mysql_data<br/>Docker Volume")]
    end

    Browser -->|"HTTP :5173"| FE
    FE -->|"fetch (CORS)<br/>HTTP :8080/api/**"| BE
    BE -->|"JDBC"| DB
    DB --- Vol
    BE -.->|"静的配信<br/>/uploads/**"| Browser
```

- フロントエンドとバックエンドは別コンテナ・別オリジンで動作し、`@CrossOrigin`によるCORS許可で通信している（Cookieは使用しない）。
- プロフィール画像はバックエンドコンテナのローカルファイルシステム（`uploads/`）に保存され、`/uploads/**`として配信される。
- DBの永続化はDocker Volume（`mysql_data`）で行っている。

---

## 2. 本番目標構成（AWS）

「実際のWebアプリと遜色ないレベル」を目標に想定する構成。ユーザーからの要望に基づき、S3 + CloudFront + ALB + ECS + RDSを中心に設計する。

```mermaid
graph TB
    User["ユーザー"]

    subgraph AWS["AWS"]
        R53["Route 53<br/>(DNS)"]
        CF["CloudFront<br/>(CDN)"]

        subgraph StaticHosting["静的ホスティング"]
            S3Front["S3<br/>フロントエンド静的ファイル<br/>(Reactビルド成果物)"]
        end

        ALB["ALB<br/>(Application Load Balancer)"]

        subgraph VPC["VPC"]
            subgraph Private["プライベートサブネット"]
                ECS["ECS (Fargate)<br/>Spring Boot コンテナ"]
                RDS[("RDS for MySQL")]
            end
        end

        ECR["ECR<br/>(バックエンドDockerイメージ)"]
        S3Asset["S3<br/>イラスト素材バケット"]
        SM["Secrets Manager<br/>(DB認証情報・JWT署名鍵)"]
    end

    User -->|"HTTPS"| R53
    R53 --> CF
    CF -->|"/ (静的ファイル)"| S3Front
    CF -->|"/api/** をオリジンに転送"| ALB
    ALB --> ECS
    ECS -->|"JDBC"| RDS
    ECS -.->|"イメージ取得"| ECR
    ECS -->|"署名付きURL発行/検証"| S3Asset
    User -->|"署名付きURLで直接アップロード/取得"| S3Asset
    ECS -.->|"シークレット取得"| SM
```

### 構成のポイント

| 項目 | 内容 |
|---|---|
| フロントエンド配信 | CloudFront経由でS3の静的ファイルを配信し、CDNキャッシュで高速化する |
| API通信 | CloudFrontで`/api/**`パスをALBにルーティングし、単一ドメイン配下でフロント・APIを配信する（CORS設定を簡素化できる） |
| バックエンド実行 | ECS（Fargate）でSpring Bootコンテナを実行。ECRに登録したDockerイメージ（現状の`RebuildJava/Dockerfile`）をそのまま利用できる |
| データベース | RDS for MySQL。可用性（Multi-AZ）やバックアップ方針は04-database以降で詳細化する |
| イラスト素材アップロード | バックエンドが発行するS3署名付きURL（presigned URL）を使い、ブラウザからS3へ直接アップロードする方式を想定（バックエンドを経由しないため大容量ファイルでもサーバー負荷が小さい） |
| ネットワーク | ECS・RDSはプライベートサブネットに配置し、インターネットからの直接アクセスを避ける（ALB経由のみ） |
| シークレット管理 | DB接続情報・JWT署名鍵はSecrets Managerで管理し、環境変数や設定ファイルへの平文記載を避ける |

---

## 3. イラスト素材アップロードのシーケンス（本番目標構成における想定）

S3への直接アップロード方式（presigned URL方式）の処理の流れ。詳細なAPI仕様は05-apiで定義する。

```mermaid
sequenceDiagram
    participant U as ブラウザ
    participant BE as バックエンド(ECS)
    participant S3 as S3(イラスト素材バケット)
    participant DB as RDS

    U->>BE: アップロード許可をリクエスト（ファイル名・種別等）
    BE->>BE: JWTを検証し、アップロード可否を判定
    BE->>S3: 署名付きURL(PUT用)を発行
    BE-->>U: 署名付きURLを返却
    U->>S3: 署名付きURLへ直接ファイルをPUT
    U->>BE: アップロード完了を通知（保存先キー等）
    BE->>DB: 素材メタデータ（保存先キー・フォルダ等）を登録
    BE-->>U: 登録結果を返却
```

---

## 作成情報

| 項目 | 内容 |
|------|------|
| 工程名 | システム設計 |
| 最終更新日 | 2026-08-18 |
| 更新者 | Ren Nakamoto |
