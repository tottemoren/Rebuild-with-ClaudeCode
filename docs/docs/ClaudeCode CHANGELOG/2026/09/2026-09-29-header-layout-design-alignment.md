## Claude によるアップデート（2026-09-29 ヘッダー構成を画面設計書に合わせて再構築）

ユーザーからの依頼により、`docs/02-screen-design/` の設計書（TopicChoice.md、StoryCreate.md、CreateManga.md）を確認した上で、Header/レイアウトの構成を設計書に沿う形に修正した。

### 方針

- ロゴ・アカウントメニュー（設定・プロフィール・ログアウト）は全画面で共通固定表示にする
- 画面ごとに変えたいのは「検索バーの行（centerContent）」と、画面によっては「その下にもう1段（secondaryRow）」の2箇所のみ
- `LayoutHeaderSimple`（独自ヘッダー内容）を使うのは `CreateMangaPage` のみとし、`TopicChoice`・`StoryCreatePage` は `MainLayout` に統一する

### 実施した内容

1. **`Header.tsx`**: `showAccountMenu` propsを廃止し、ロゴ・アカウントメニューを常時表示に変更。新たに `secondaryRow?: React.ReactNode` を追加し、検索バーの下にもう1段、画面ごとの内容を差し込めるようにした。
2. **`Header.css`**: 新設した`.HeaderWrapper`は`display: contents`とし、既存の`%`指定の高さ計算（`.HomePagetop { height: 19% }`）に影響を与えないようにした。`.header-secondary-row`のスタイルを追加。
3. **`MainLayout.tsx`**: `headerContent` / `headerSecondaryContent` を受け取り、`Header`の`centerContent` / `secondaryRow`にそのまま渡すよう変更。
4. **`NoRightAndSimpleHeader.tsx`**: `showAccountMenu={false}`の指定を削除（propsが無くなったため）。
5. **`TopicChoice.tsx`**: `LayoutHeaderSimple`→`MainLayout`に変更。「次へ」ボタンを`headerSecondaryContent`に、見出しと`- artist -`ボタンは画面本体側（`TopicChoice-page-heading`）に移動。
6. **`StoryCreatePage.tsx`**: `LayoutHeaderSimple`→`MainLayout`に変更。「メモ／過去のストーリー」切り替えボタンを`headerSecondaryContent`に移動（設計書通りヘッダー側に）。説明文は画面本体側に残した。
7. **`TopicChoice.css`**: 不要になった`.TopicChoice-top`・`.explanation`・`.space1`・`.space2`を削除し、代わりに`.TopicChoice-page-heading`を追加。

### 副次的な効果

`CreateMangaPage`は元々`showAccountMenu={false}`でアカウントメニューが非表示になっていたが、これは`CreateManga.md`の設計（設定・アカウント・ログアウトをヘッダーに表示）と食い違っていた。今回の変更で、意図せず設計と一致する形になった。

### 修正のやり直し（ユーザーからの指摘）

初回実装では、`secondaryRow`を`Header`要素の**外側**（下に別の帯として）追加してしまい、見た目上Headerからはみ出す形になっていた。
ユーザーからの指摘を受け、`.header-center`（検索バーが入っている要素）の**内側**で縦に2段（`.header-center-main` / `.header-center-secondary`）を積む形に修正。`secondaryRow`がある画面だけ`.HomePagetop-tall`を適用。

さらに、`.HomePagetop-tall`の高さを固定%（当初28%）にしていたところ、「追加した分だけ余計に広がっている」との指摘を受け、`height: auto`（中身に合わせて必要な分だけ広がる）に変更。細かい余白の最終調整はユーザー自身が後日行う方針。

### 動作確認

`npm run lint`（エラー0件）、`npm run test`（5件成功）、`npm run build`成功。
ローカル環境で `HomePage`・`TopicChoice`・`StoryCreatePage`・`CreateMangaPage` の表示を確認し、いずれも画面設計書のワイヤーフレーム通りの配置になっていることを確認済み。
