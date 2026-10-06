# 04. CIとGitHub Actions

## CI / CD とは

| 用語 | 意味 | このプロジェクトでは |
|---|---|---|
| CI（継続的インテグレーション） | コードをpushするたびに、テストなどを**自動で実行**して、壊れていないか確認する | Frontend CI、Backend CI |
| CD（継続的デリバリー／デプロイ） | 確認が済んだコードを、**自動で本番に反映**する | Deploy Frontend |

**GitHub Actions** は、GitHubが提供している自動実行の仕組みです。`.github/workflows/` に書いた設定ファイル（YAML）に従って、GitHubのサーバー上で処理が動きます。

CIは、人間が書いたコードにも、AIが書いたコードにも、同じように働きます。「誰が書いたか」ではなく、「機械で確認できるか」が大切です。

## このプロジェクトのワークフロー

| ワークフロー | ファイル | 動くとき | 内容 |
|---|---|---|---|
| Frontend CI | [frontend-ci.yml](../../.github/workflows/frontend-ci.yml) | pushとPR | 依存のインストール → lint → テスト |
| Backend CI | [backend-ci.yml](../../.github/workflows/backend-ci.yml) | pushとPR | MySQLを起動 → `./gradlew test` |
| Deploy Frontend | [frontend-deploy.yml](../../.github/workflows/frontend-deploy.yml) | mainへのpushで、`RebuildReact/` に変更があるとき | lint → テスト → ビルド → S3へアップロード → CloudFrontのキャッシュ削除 |

> **注意**：`RebuildReact/` を変更したPRをmainにマージすると、**本番サイトに自動で反映されます**。マージ前に、影響を確認することが大切です。

## Backend CI の読み方

[backend-ci.yml](../../.github/workflows/backend-ci.yml) の主な部分を説明します。

### 1. いつ動くか（`on`）

```yaml
on:
  push:
    branches: [main, 'feature/**']
  pull_request:
    branches: [main]
```

mainと `feature/` で始まるブランチへのpush、そしてmainを宛先にしたPRで動きます。

**パスのフィルタをつけていない理由**：「Javaのファイルが変わったときだけ動かす」ようにすると、他の変更では動かなくなります。将来、「CIが成功しないとマージできない」設定にしたとき、動かないCIを待ち続けてマージできなくなる恐れがあるためです。

### 2. 使い捨てのMySQL（`services`）

```yaml
services:
  mysql:
    image: mysql:8.4
```

Spring Bootのテストは、起動時にDBへ接続します。そのため、CIの実行中だけ、使い捨てのMySQLを一緒に立ち上げます。終われば消えるので、本物のデータには触れません。

`health-cmd`（MySQLが応答するかを確認する設定）をつけて、**準備ができてからテストを始める**ようにしています。

### 3. 接続先の上書き（`env`）

アプリの設定ファイル（`application.properties`）には、接続先が `mysql:3306` と書かれています。これは、Docker Composeの中でだけ通じる名前です。CIでは `127.0.0.1` に変える必要があります。

そこで、環境変数 `SPRING_DATASOURCE_URL` などで上書きします。Spring Bootは、設定ファイルより環境変数を優先する仕組みを持っています。**ソースコードを変えずに、環境ごとに値を切り替えられる**のがポイントです。

### 4. 失敗したときだけ、レポートを保存

```yaml
- name: テストレポートを保存（失敗時のみ）
  if: failure()
```

失敗したときだけ、詳しいテスト結果をダウンロードできる形で残します。原因の調査に使えます。

## 手元でCIと同じ条件を再現する方法

ローカルで `./gradlew test` を実行するときも、MySQLが必要です。普段の開発用DBには触れないよう、別のポート（例：3308）に使い捨てのMySQLを起動し、環境変数で接続先を上書きします（手順は [CLAUDE.md](../../CLAUDE.md) 参照）。

DBなしで実行すると、`contextLoads`（アプリが起動できるかの確認）が、DB接続エラーで失敗します。**CIにMySQLが必要な理由を、実際の失敗で確かめられました。**

## 学んだこと

- CIは、**自分のパソコンの外**で動きます。「自分の環境では動く」が、本当に再現できるかを確かめられます。
- ワークフローの変更は、**手元では結果が見えません**。pushしてから、GitHub上の実行結果を見て、はじめて確認できます。
- 自動デプロイの認証は、推奨のOIDC方式で原因不明の失敗が続いたため、いったんアクセスキー方式（GitHubのSecretsに保存）で完成させました。アクセスキーは長期間有効なので、定期的な入れ替えが必要です（残課題）。
- `Frontend CI` と `Deploy Frontend` の両方でlintとテストを実行しているため、mainへのマージ時は二重実行になります。1つにまとめる改善が残っています。
