# Rebuild

## 概要

Rebuild は、一度描いたイラストを組み合わせ直すだけで、新しい漫画を何度でも作れるWebアプリケーションです。

毎回ゼロから描き直す手間をなくすことを目指しています。

企画・設計・開発のすべてをAIを使いながら一人で行っています。（個人開発・継続中）

---

## 開発目的

* Webアプリケーション開発技術の習得
* React + Java（Spring Boot）構成の理解
* フロントエンドとバックエンドを分離した開発経験の獲得
* 将来的なサービス公開を見据えた設計経験の習得
* AIと協働し、テストとCIで品質を確かめながら進める開発の進め方の習得

---

## ドキュメント

| 資料 | 内容 |
|---|---|
| [ロードマップ](docs/00-roadmap.md) | 最終ゴール、段階ごとの完了条件、現在地と課題 |
| [要件定義](docs/01-requirements/README.md) | サービスの目的、ターゲット、機能要件 |
| [画面設計](docs/02-screen-design/README.md) | 画面一覧、画面遷移図、ワイヤーフレーム、画面仕様書 |
| [システム設計](docs/03-system-design/README.md) | アーキテクチャ、認証・素材保存の方針、構成図 |
| [データベース設計](docs/04-database/README.md) | テーブル定義、ER図 |
| [API設計](docs/05-api/README.md) | API一覧、API詳細 |
| [学習ノート](docs/Study/README.md) | 開発の歩み、設計判断の理由、ループエンジニアリング、CI・テスト・Git運用、AIとの開発、つまずき、用語集 |

学習ノートは、AI（Claude Code）と一緒に進める中で出てきた学びを Claude Code が整理して書き、実際のコードや変更履歴と照らして確認しています。

---

## 使用技術

| 分類 | 技術 |
|---|---|
| フロントエンド | React 19 / TypeScript / Vite / React Router / HTML / CSS |
| バックエンド | Java 21 / Spring Boot 4 / Spring Data JPA / Spring Security |
| データベース | MySQL 8.4 |
| テスト | Vitest・Testing Library（フロントエンド）、JUnit・MockMvc（バックエンド。実際のMySQLに接続して検証） |
| インフラ | AWS（S3 / CloudFront / EC2 / Route 53 / ACM）、Docker / Docker Compose |
| CI/CD | GitHub Actions（フロントエンド・バックエンドのテスト、フロントエンドの自動デプロイ） |
| 開発環境 | macOS / VS Code / Eclipse / Claude Code |
| バージョン管理 | Git / GitHub |

---

## システム構成

* フロントエンド：S3 + CloudFront で配信（main へのマージで自動デプロイ）。独自ドメイン・HTTPS 対応
* バックエンド：EC2 上の Docker Compose で Spring Boot と MySQL を動かし、API は CloudFront 経由で配信（反映は手動）
* 開発環境：Docker Compose で frontend / backend / mysql をまとめて起動

目標とする構成は [システム構成図](docs/03-system-design/system-architecture/system-architecture.md) を参照してください。

---

## ディレクトリ構成

```
Rebuild
├── RebuildReact/        # フロントエンド（React + TypeScript）
├── RebuildJava/         # バックエンド（Spring Boot）
├── database/            # MySQL の初期化スクリプト
├── docs/                # ロードマップ・設計書・学習ノート・変更履歴
├── .github/workflows/   # CI/CD（GitHub Actions）
└── compose.yml          # Docker Compose の設定
```

---

## 主な機能

### 実装済み

**認証・共通**
* ユーザー登録（招待コード制）・ログイン・ログアウト
* パスワードのハッシュ化（BCrypt）・Spring Security の導入
* ログイン状態の保持（ブラウザに保存）と、未ログイン時の画面保護（JWT 認証は今後導入予定）
* 共通レイアウト（ヘッダー・サイドメニュー・広告枠）と、React Router による画面遷移
* ロゴを押すと画面を更新

**ホーム・メモ・ストーリー**
* ホーム画面での、メモ・ストーリー一覧の表示切り替え
* 縦書き・横書きのメモの作成・保存・削除
* ストーリーの作成・保存（メモ・過去のストーリーを参照しながら作成）

**漫画作成**
* 素材フォルダの作成と、イラスト素材のアップロード
* ストーリーと素材フォルダの選択（セリフのプレビュー表示）
* イラスト素材のドラッグでの配置・移動・削除と、サーバーへの保存
* 作成したページの PNG 書き出し

**開発基盤**
* Docker による開発環境の構築（別のOSの端末でも同じ環境を再現）
* フロントエンド・バックエンドの自動テスト（CI）と、フロントエンドの自動デプロイ
* 独自ドメインでの公開

### 開発中・今後の予定

次は「ストーリーを選び、コマ枠に素材を配置し、吹き出しでセリフを入れ、ページを増やして、見開きで書き出す」までの流れを作ります。その後、素材の一覧・整理画面、ログインせずに試せる体験などを追加する予定です。

段階ごとの予定・完了条件・現在の課題は [ロードマップ](docs/00-roadmap.md) にまとめています。

---

## 開発者

個人開発プロジェクト
