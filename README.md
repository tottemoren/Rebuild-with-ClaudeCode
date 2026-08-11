# Rebuild

## 概要

Rebuild は、ユーザーが作画した同じイラストを使って、何度でも漫画を作成できるWebアプリケーションです。

ストーリーを確認しながら、コマ素材を自由に配置し、漫画形式で物語を視覚的に構築できるサービスを目指しています。

現在は個人開発中です。

---

## 開発目的

* Webアプリケーション開発技術の習得
* React + java(Spring Boot) 構成の理解
* フロントエンドとバックエンドを分離した開発経験の獲得
* 将来的なサービス公開を見据えた設計経験の習得

---

## 使用技術

### フロントエンド

* React
* TypeScript
* HTML
* CSS
* Vite

### バックエンド

* Java 21
* Spring Boot
* Spring Data JPA

### データベース

* MySQL

### 開発環境

* macOS
* Eclipse
* VS Code

### バージョン管理

* Git
* GitHub

---

## ディレクトリ構成

Rebuild

├── RebuildReact

│   └── フロントエンド

│

├── RebuildJava

│   └── バックエンド

│

└── README.md

---

## 主な機能

### 実装済み

* ユーザー登録
* ログイン機能
* データベース連携
* React Routerによる画面遷移
* 共通レイアウト機能
* 認証機能(localstorageにユーザー情報の一時保存)
* ProtectedRoute
* ログアウト機能
* ストーリー創作・保存機能
* パスワード暗号化（BCrypt）・Spring Security導入
* ユーザーごとのプロフィール画像
* 漫画作成機能（コマ画像のドラッグ配置・移動・削除・サーバー保存）
* 固定枠内のスクリーンショット機能（Canvas APIによるPNG書き出し）

### 開発予定

* CreateMangaPage と StoryCreatePage の連携（現状は URL の `?storyId=` を手動で付ける形）
* コマのリサイズ・回転
* AWSへのデプロイ
* Docker対応

---

## 今後の目標

* AWSへのデプロイ
* Docker対応
* セキュリティの強化

---

## 開発者

個人開発プロジェクト

---

## Claude によるアップデート（2026-08-08）

このフォルダ（`Rebuild with Cloud code`）は、GitHub上の `tottemoren/Rebuild` をベースに、
README の「開発予定」に挙がっていた5項目を実装したコピーです。
元の `Rebuild` フォルダはそのまま残してあるので、比較しながら確認してください。

### 実装した内容

1. **パスワード暗号化 + Spring Security導入**
   `spring-boot-starter-security` を追加し、`BCryptPasswordEncoder` でパスワードをハッシュ化。
   ログイン時も `matches()` で照合するように変更。既存の全エンドポイントへのアクセス制限は変えていません（`permitAll`）。
   `User` エンティティの `password` は `@JsonIgnore` にしたので、レスポンスにも一切含まれません。
   ⚠️ **注意**: 既存DBに平文パスワードで登録済みのユーザーがいる場合、そのユーザーはログインできなくなります（ハッシュ形式が変わるため）。テスト用アカウントは再登録してください。

2. **ユーザーごとのプロフィール画像**
   `POST /api/users/{id}/profile-image`（multipart/form-data、キー名 `file`）で画像をアップロードすると、
   サーバー起動ディレクトリ配下の `uploads/profile-images/` に保存され、`/uploads/profile-images/xxx.png` として配信されます。
   画面右上のアイコンボタン（👤）をクリックすると画像を選べます。

3. **漫画作成機能**
   `CreateMangaPage` にあった未定義変数バグ（`setSelectedCharacter` が宣言されていない）や、
   右メニュー（`RightMenuKoma`）が画面に一切表示されていなかった問題を修正。
   コマ画像は生DOM操作ではなくReactのstateで管理し、ドラッグでの新規配置・移動・削除ができます。
   `PUT /api/manga-panels?storyId=<id>` で配置をサーバーに保存、`GET` で読み込みます。

4. **固定枠内のスクリーンショット機能**
   キャンバスは 640×900px の固定サイズにし、「画像として保存」ボタンでその枠内をCanvas APIで
   PNGとして書き出し、ダウンロードできます（外部ライブラリ不要）。

5. **細かい不具合修正**
   ロゴ画像や一部キャラクター画像のファイル名が実ファイルと一致しておらず表示されていなかった箇所を修正
   （`ActarStoryRogo1.png` → `RebuildRogo1.png` 等）。

### 動作確認について（重要）

このタスクを実行した環境（Cowork のサンドボックス）は外部ネットワークが制限されており、
MySQL・Java 21・Gradle/npm のパッケージ取得ができなかったため、**実際にビルド・起動してのテストはできていません**。
お手元の環境（Eclipse / VS Code + ローカルMySQL）で、以下を確認してください。

**バックエンド**
1. MySQLサーバーが起動していること（DB自体は自動作成されます）
2. `RebuildJava` を実行（Eclipseの起動設定 or `./gradlew bootRun`）
3. 初回起動時、`RebuildDB_CloudCode` という新しいデータベースが自動作成され（`createDatabaseIfNotExist=true`）、`manga_panels` テーブルや `users.profile_image_url` 列も自動生成されます（`ddl-auto=update`）。元の `Rebuild` フォルダが使っている `RebuildDB` とは別のDBなので、データは混ざりません
4. 新規登録 → ログインが通ること（既存アカウントは前述の理由で作り直しが必要な場合あり）

**フロントエンド**
1. `cd RebuildReact && npm install`
2. `npm run dev`
3. ログイン後、右上のアイコンから画像アップロードを確認
4. 左メニュー「CreateManga」→「Next」でコマ作成画面へ。右のコマ素材をキャンバスへドラッグ→移動→削除を確認
5. 「画像として保存」でPNGがダウンロードされることを確認
6. サーバー保存を試す場合は、URLに `?storyId=1` のように付けてアクセス（`StoryCreatePage` で作成したストーリーのID）

何かエラーが出た場合は、エラーメッセージを教えてもらえれば一緒に直せます。
