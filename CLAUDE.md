# CLAUDE.md

このファイルは、Claude Code がこのリポジトリで作業する際に毎回読み込む決まりごとです。
リポジトリは公開されるため、鍵・個人情報・実際のアカウントIDは書かないこと。

## 守ること（ガードレール）

### 1. 作業の進め方

- 変更を伴う作業（ファイル編集、コミット、push、設定変更、変更を伴うコマンド）の前に、初学者にも分かる言葉で次を説明し、ユーザーの了解を得てから実行する
  1. 何のために（目的）
  2. 考え方（なぜその方法か）
  3. 作業予定（どのファイル・コマンドで何をするか）
  4. 変更されるもの・されないもの
  5. リスクと戻し方
  6. 確認してほしいこと
- 1ステップずつ進める。承認された範囲を超えて作業を広げない。必要になったら、再度説明して聞く
- 読み取りだけの調査（ファイルを読む、状態を確認する）は、説明の準備として行ってよい。行う前に一言伝える
- 不確かなことは推測で進めず、選択肢と推奨を示して聞く。決定権はユーザーにある

### 2. 事前確認なしにやってはいけない操作

このうち main への push、force push、`reset --hard`、全ファイルの一括 add（`-A` / `.`）、`.env` の表示・編集は、`.claude/hooks/` の Hooks で機械的に止めている。止められた場合は回避せず、利用者に説明する。


- git：commit、push、ブランチの作成・削除、PR・マージ、force push、`reset --hard`など履歴を書き換える操作。mainへ直接pushしない（作業は `feature/` ブランチで行う）
- 削除：複数ファイルの一括削除、DBのデータや `RebuildJava/uploads/` の削除
- 外部サービスの設定変更：GitHub（ブランチ保護、Secretsなど）、AWS（S3、CloudFront、IAMなど）、本番環境への操作
- 鍵・トークン・パスワードの取り扱い：`.env*` の中身を表示・出力・コミットしない。チャットに貼らせない
- `.github/workflows/` の変更（mainへのマージが本番公開に直結するため）
- 依存ライブラリの追加・バージョン変更
- CORS・認証・DB接続の設定変更（本番のフロントエンドとの接続が切れる恐れがあるため）

### 3. 検証の義務（「できた」と言う前に）

- 変更後は、関連するテストとlintを実行し、結果（成功/失敗と件数）を報告する。実行していない場合は、していないと明記する
- テストの削除・無効化・弱体化で通すことは禁止。失敗したら原因を説明して本体を直す（仕様変更ならユーザーに確認する）
- 画面の変更は、ブラウザで実際に動作確認する。確認できなかった場合はその旨を伝える
- 変更が本番に影響するかどうかを毎回説明する

### 4. 範囲の守り方

- 依頼されていない修正・整理・リファクタリングはしない。気づいた問題は直さず報告する
- 1つのブランチ・PRは1つの目的に絞る
- コミットには、その作業に関係するファイルだけを明示的に指定して含める（`git add -A` / `git add .` は使わない）。ユーザーが編集中の未コミットの変更を巻き込まない

## プロジェクト概要

Rebuild は、ユーザーが作画した同じイラストを使って何度でも漫画を作成できるWebアプリケーション。個人開発中。詳細は [README.md](README.md) を参照。

## 技術スタック

- フロントエンド：React 19 + TypeScript + Vite（テスト：Vitest + Testing Library）
- バックエンド：Java 21 + Spring Boot 4 + Spring Data JPA + Spring Security（テスト：JUnit + MockMvc。実際のMySQLに接続して検証）
- データベース：MySQL 8.4
- CI/CD：GitHub Actions（Frontend CI / Backend CI / Deploy Frontend）
- 本番：フロントエンドは AWS（S3 + CloudFront、自動デプロイ）。バックエンドは EC2（Ubuntu・t3.micro）上の Docker Compose で動かし、手動で反映（自動デプロイは未構築）。詳細は「本番環境」を参照
- 開発環境：macOS / Eclipse / VS Code / Docker

## ディレクトリ構成

```
Rebuild
├── RebuildReact/         # フロントエンド (React + TypeScript)
│   └── src/ (pages / components / hooks / utils / types / styles)
├── RebuildJava/          # バックエンド (Spring Boot)
│   ├── src/main/java/com/example/demo/
│   ├── src/test/java/com/example/demo/   # テスト
│   └── uploads/          # アップロードされた画像の実データ（Dockerと共有）
├── database/             # init.sql (MySQLの初期化スクリプト)
├── docs/                 # ドキュメント（下記の地図を参照）
├── .github/workflows/    # CI/CD
└── compose.yml           # Docker Compose設定
```

### ドキュメントの地図（`docs/`）

- `01-requirements`：要件定義
- `02-screen-design`：画面一覧・画面遷移図・ワイヤーフレーム・画面仕様書
- `03-system-design`：システム設計・構成図・技術スタック
- `04-database`：テーブル定義・ER図
- `05-api`：API一覧・API詳細
- `06-test`：未整備
- `docs/ClaudeCode CHANGELOG/`：変更履歴

注意：`01〜05` には「目標とする設計」が含まれ、現状の実装と異なる場合がある（例：JWT認証・S3保存は未実装）。食い違いを見つけたら実装が正。どちらに合わせるかは勝手に決めず、ユーザーに確認する。

## よく使うコマンド

### フロントエンド（RebuildReact）

```bash
cd RebuildReact
npm install       # 依存関係インストール
npm run dev       # 開発サーバー起動 (localhost:5173)
npm run lint      # ESLint実行
npm run test      # テスト実行 (Vitest)
npm run build     # 本番ビルド
```

### バックエンド（RebuildJava）

```bash
cd RebuildJava
./gradlew bootRun   # 起動 (localhost:8080)
./gradlew test      # テスト実行
```

テストはアプリ起動時にMySQLへ接続する。`application.properties` の接続先はDocker内でしか通じない `mysql:3306` のため、ローカルでは使い捨てのMySQLを別ポート（例：3308）で起動し、環境変数 `SPRING_DATASOURCE_URL` / `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` で接続先を上書きして実行する（値は `.github/workflows/backend-ci.yml` と同じ）。普段の開発用DB（ホスト側3307）には接続しない。

### Docker

```bash
docker compose up -d                 # frontend / backend / mysql をまとめて起動
docker compose up -d --build backend # バックエンドの変更を反映（イメージの再ビルドが必要）
docker compose down                  # 停止
docker compose logs -f               # ログ確認
```

## コーディング規約

- コンポーネント名は PascalCase、関数・変数は camelCase
- 1コンポーネント1ファイルを基本とする
- コメントは「なぜそうしたか」が非自明な場合のみ書く。自明な処理説明は書かない
- 未使用のimport・変数は残さない
- 機能追加・修正には、対応するテストの追加を作業予定に含めて提案する

## Git / PR運用

- ブランチ名は `feature/内容`（例：`feature/backend-ci`）。mainに直接commit・pushしない
- PRの作成とマージは、ユーザーがGitHub上で行う。Claude Code は作成・マージしない（PR本文の下書きは提供してよい）
- マージ前に Frontend CI / Backend CI が成功していること
- mainへのマージで `RebuildReact/` 配下に変更があると、本番（S3 + CloudFront）へ自動デプロイされる。影響を必ず説明する
- `RebuildJava/` 配下の変更は、マージしても本番に自動では反映されない。マージ後にEC2への手動反映が必要なことを、PRのたびに伝える（フロントだけが先に本番に出てずれることがある）
- コミットメッセージは日本語で、簡潔な要約（必要なら説明を追記）
- 破壊的なgit操作は事前に確認を取ってから実行する

## 変更履歴（Changelog）の運用

Claude Code が承認を得て何らかの修正・変更を行った場合、**指示がなくても毎回**以下に記録すること。

- 場所：`docs/docs/ClaudeCode CHANGELOG/YYYY/MM/YYYY-MM-DD.md`
- 同じ日に複数回作業した場合は、新規ファイルを作らず同じ日付のファイルに追記する
- フォーマットは既存ファイルに倣う（`## Claude によるアップデート（YYYY-MM-DD）` → 概要 → `### 実施した内容`）

## 学習ノート（`docs/Study`）の運用

作業の中で学びがあった場合（新しい考え方、設計の判断、つまずきと原因、テストの工夫、新しい用語）は、**同じPRで** `docs/Study` の該当ファイルも更新する。学びが無い作業では更新しない。

- CHANGELOG との書き分け：CHANGELOG は「何をしたか」（ファイル・手順・確認結果）を日付順に記録する。Study は「なぜそうしたか・他の選択肢・次に同じ場面でどう考えるか・用語の意味」をテーマ別に要点だけ書き、細部は CHANGELOG に任せる
- 書く場所：開発の歩み（01）、設計判断（02）、テスト（05）、AIとの開発（07）、つまずき（08）、用語（09）など、既存の分類に合わせる
- 各項目の最後に、元になった CHANGELOG を `<sub>作業記録：[2026-10-13（5回目）](../docs/ClaudeCode%20CHANGELOG/2026/10/2026-10-13.md)</sub>` の形で小さく書く（見出しへの直接リンクは使わず、ファイルへのリンク＋何回目か）。元の記録が分からないものには付けない
- 初学者にも分かる言葉で書き、うまくいかなかったことも書く（`docs/Study/README.md` の方針に従う）

## 本番環境

公開リポジトリのため、IPアドレス・CloudFrontのドメイン名やID・AWSのアカウントID・鍵ファイル名は書かない。

- 構成：利用者 → フロント用 CloudFront（S3）／API用 CloudFront（`rebuild-backend-first`）→ EC2 の Docker Compose（`backend` と `mysql`）
- バックエンドの反映（手動）：EC2で `cd ~/Rebuild-with-ClaudeCode` → `git status`（変更が無いことを確認）→ `git pull origin main` → `docker compose up -d --build backend`。t3.micro のためビルドに数分かかる。EC2での作業はユーザーが行う
- バックエンドの環境変数：EC2・手元とも、`compose.yml` と同じ場所の `.env`（Git の管理外）に書く。`INVITE_CODE`（新規登録の招待コード。未設定なら登録を受け付けない）、`JWT_SECRET`（ログインの合言葉の署名の鍵。32文字以上。未設定だとバックエンドが起動しない。作るときは `echo "JWT_SECRET=$(openssl rand -base64 48)" >> .env` で、値を画面に出さずに書き込む）。値はチャットに貼らせない・表示しない
- API用 CloudFront の WAF（無料プラン、コア保護）で `SizeRestrictions_BODY` を「カウント」にしている。8KBを超える送信（画像アップロード、長いメモ・ストーリー）がブロックされていたため。無料プランではラベルを使った例外ルールが作れない
- 本番でアップロードした画像は EC2 のディスク（`RebuildJava/uploads/`）にある（S3には未移行）。EC2が失われると消える
- ローカルと本番の違い（CloudFront・WAF・オリジンの違い）で、本番だけ動かないことがある。本番の不具合は、ブラウザの開発者ツール（Network・Console）とEC2のログ（`docker logs rebuild-java`）で確認する

## プロジェクト固有の注意

- `compose.yml` / `RebuildJava/src/main/resources/application.properties` / `database/init.sql` のDB名・ユーザー名・パスワードは、動作に直結するため必要がない限り変更しない
- `RebuildJava/uploads/` はユーザーの実データ。作業やテストで削除・上書きしない（テストの保存先は一時フォルダに差し替える）
- 実在の人物・作品・キャラクターの名前や画像を、コード・素材・docs・テストデータに入れない（過去に混入があった）。新しい素材や固有名詞を追加するときは、実在のものと一致していないか確認する
- docsは公開される前提で、現在のスコープ（v1）に沿って書く。範囲外の予定や構想は、ユーザーの明示的な指示がない限り書き込まない
- 既存DBに平文パスワードで登録済みのユーザーがいる場合、パスワードハッシュ化の仕様変更でログインできなくなることがある（テスト用アカウントは再登録が必要）

## 既知の課題（依頼がない限り直さず、気づいたら報告するだけ）

[docs/05-api/api-list.md](docs/05-api/api-list.md) の「現行実装との主な差分」を参照（認証未実装などを含む）。
特に、ユーザーごとのデータ分離と認証が無いため、本番で他のユーザーのメモ・ストーリーが見え、APIを直接呼べば読み書き・削除もできる状態（メモには所有者の項目自体が無い）。
バックエンドの自動デプロイ、DBマイグレーション管理、監視は未整備。EC2のOS更新がたまっている。

## 開発予定・今後の目標

作業を提案する前に、下に読み込んだロードマップで最終ゴール・現在の段階・次の項目を確認し、そこから次の一手を提案する。

@docs/00-roadmap.md

README.md の「開発予定」「今後の目標」を参照。
ClaudeCodeが実装が完了したと思っても完全に完成していない場合があるためREADMEをすぐには更新せず、項目が最後まで完成しているかを聞いてからREADMEを更新する。
