## Claude によるアップデート（2026-09-29 ヘッダー・レイアウトの重複整理）

ユーザーとのコードレビュー中に発覚した、ヘッダー・レイアウトコンポーネントの重複を整理した（ユーザーからの依頼によりClaude Codeが実施）。

### 発端

- `Header.tsx`（検索バー・アカウントメニュー付き）と `SimpleHeader.tsx`（中央だけ差し替え可能）という、ほぼ同じ役割の2ファイルが存在していた
- `LayoutHeaderSimple`（`NoRightAndSimpleHeader.tsx`）と `LayoutAdvertisementSimple`（`NoRightMenu.tsx`）も、中身がほぼ同一の重複だった

### 実施した内容

1. **`Header.tsx` を統合**
   `centerContent?: React.ReactNode`（中央の表示内容を差し替え可能に。省略時は従来の検索バー）と `showAccountMenu?: boolean`（デフォルト`true`。設定・プロフィール・ログアウトの表示切り替え）の2つのpropsを追加。

2. **`NoRightAndSimpleHeader.tsx`（`LayoutHeaderSimple`）を修正**
   `SimpleHeader` ではなく統合した `Header` を `showAccountMenu={false}` 付きで使うように変更。

3. **`StoryCreatePage.tsx` の参照先を切り替え**
   `LayoutAdvertisementSimple`（`NoRightMenu.tsx`）から `LayoutHeaderSimple`（`NoRightAndSimpleHeader.tsx`）に変更。

4. **未使用になったファイルを削除**
   `SimpleHeader.tsx`、`NoRightMenu.tsx` を削除。

### 動作確認

`npm run lint`（エラー0件）、`npm run build`（56→54モジュールに減少、削除が反映されていることを確認）。
ローカル環境で `HomePage`・`MemoPage`・`TopicChoice`・`CreateMangaPage`・`StoryCreatePage` の表示崩れが無いことを確認し、`Deploy Frontend` 経由で本番（mangarebuild.com）にも反映。

### 副次的なトラブルと対応

作業中、`StoryCreatePage.tsx` への短時間の連続編集がきっかけで、ローカルDocker上のフロントエンド開発サーバー（Vite）がファイル監視の一時的な不整合でクラッシュ（`ENOENT`）。コード自体に問題は無く、`docker compose restart frontend` で復旧。Docker Desktopのファイル監視が、ホスト⇄コンテナ間の同期タイミングで稀に起こす既知の不安定さによるもの。
