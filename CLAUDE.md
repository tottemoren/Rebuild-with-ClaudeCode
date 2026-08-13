# CLAUDE.md

このファイルは、Claude Code がこのリポジトリで作業する際に毎回読み込む前提知識です。

## プロジェクト概要

Rebuild は、ユーザーが作画した同じイラストを使って何度でも漫画を作成できるWebアプリケーション。個人開発中。詳細は [README.md](README.md) を参照。

## 技術スタック

- フロントエンド: React 19 + TypeScript + Vite
- バックエンド: Java 21 + Spring Boot 4 + Spring Data JPA + Spring Security
- データベース: MySQL 8.4
- 開発環境: macOS / Eclipse / VS Code / Docker

## ディレクトリ構成

```
Rebuild
├── RebuildReact/        # フロントエンド (React + TypeScript)
│   └── src/
│       ├── pages/        # 画面単位のコンポーネント
│       ├── components/   # 共通コンポーネント (auth, layout など)
│       ├── hooks/
│       ├── utils/
│       ├── types/
│       └── styles/
├── RebuildJava/          # バックエンド (Spring Boot)
│   └── src/main/java/com/example/demo/
├── database/             # init.sql (MySQLの初期化スクリプト)
├── docs/                 # 要件・画面設計・API・DB設計・テストのドキュメント
│   └── docs/ClaudeCode CHANGELOG/  # Claude Codeによる変更履歴（下記参照）
└── compose.yml           # Docker Compose設定
```

## よく使うコマンド

### フロントエンド (RebuildReact)

```bash
cd RebuildReact
npm install       # 依存関係インストール
npm run dev       # 開発サーバー起動 (localhost:5173)
npm run build     # 本番ビルド
npm run lint      # ESLint実行
```

### バックエンド (RebuildJava)

```bash
cd RebuildJava
./gradlew bootRun   # 起動 (localhost:8080)
./gradlew test      # テスト実行
```

### Docker

```bash
docker compose up -d      # frontend / backend / mysql をまとめて起動
docker compose down       # 停止
docker compose logs -f    # ログ確認
```

## コーディング規約

<!-- 例: 好みに合わせて書き換えてください -->
- コンポーネント名は PascalCase、関数・変数は camelCase
- 1コンポーネント1ファイルを基本とする
- コメントは「なぜそうしたか」が非自明な場合のみ書く。自明な処理説明は書かない
- 未使用のimport・変数は残さない

## Git / コミット運用

<!-- 例: 好みに合わせて書き換えてください -->
- コミットメッセージは日本語、Conventional Commits的な接頭辞は使わず簡潔な要約でOK
- Claude Code はユーザーから明示的に指示されない限り `git commit` / `git push` しない
- 破壊的なgit操作（`reset --hard`, `force push` など）は事前に確認を取ってから実行する

## 変更履歴（Changelog）の運用

Claude Code が何らかの修正・変更を行った場合、**指示がなくても毎回**以下に記録すること。

- 場所: `docs/docs/ClaudeCode CHANGELOG/YYYY/MM/YYYY-MM-DD.md`
- 同じ日に複数回作業した場合は、新規ファイルを作らず同じ日付のファイルに追記する
- フォーマットは既存ファイル（例: `2026-08-08.md`）に倣う:
  ```
  ## Claude によるアップデート（YYYY-MM-DD）

  （概要）

  ### 実施した内容
  1. ...
  2. ...
  ```

## 触ってはいけない・注意が必要な設定

<!-- 例: 好みに合わせて書き換えてください -->
- `compose.yml` / `RebuildJava/src/main/resources/application.properties` / `database/init.sql` のDB名・ユーザー名・パスワード（`RebuildDB_CloudCode` 等）は、Docker/アプリの動作に直結するため、必要がない限り変更しない
- `.env` など環境変数ファイルの中身をログや出力に含めない
- 既存DBに平文パスワードで登録済みのユーザーがいる場合、パスワードハッシュ化の仕様変更でログインできなくなることがある（テスト用アカウントは再登録が必要）

## 開発予定・今後の目標

README.md の「開発予定」「今後の目標」を参照。
ClaudeCodeが実装が完了したと思っても完全に完成していない場合があるためREADMEをすぐには更新せず、項目が最後まで完成しているかを聞いてからREADMEを更新する。
