## Claude によるアップデート（2026-09-30 レイアウトを1本化）

`MainLayout`（広告枠あり）と`NoRightAndSimpleHeader.tsx`（`LayoutHeaderSimple`、広告枠なし）の2つの型紙が、「広告枠の有無」だけの違いで分かれていたため、`MainLayout`に`showAdvertisement`propsを追加して1本化した（ユーザーからの依頼）。

### 実施した内容

1. **`MainLayout.tsx`**: `showAdvertisement?: boolean`（デフォルト`true`）を追加。`false`の場合、`Advertisement`を描画せず、`.main-contents`に`.main-contents-full`クラスを追加して幅を広げる。
2. **`MainLayout.css`**: `.main-contents-full { width: 90%; }` を追加。また、未使用になっていた`.LayoutAdvertisementSimple-maincontents`（既に参照元が無かった）を削除。
3. **`TopicChoice.tsx` / `StoryCreatePage.tsx`**: 既存の`MainLayout`呼び出しに`showAdvertisement={false}`を追加（レイアウト自体の切り替えは不要）。
4. **`CreateMangaPage.tsx`**: `LayoutHeaderSimple`（`NoRightAndSimpleHeader.tsx`）から`MainLayout`に切り替え。`headerContent`はそのまま、`showAdvertisement={false}`を追加。
5. **`NoRightAndSimpleHeader.tsx`とその`NoRightMenu`フォルダを削除**（参照元が無くなったため）。

### 結果

- レイアウトの型紙は実質`MainLayout`1つに統合された
- 広告あり: `HomePage`・`MemoPage`
- 広告なし: `TopicChoice`・`StoryCreatePage`・`CreateMangaPage`（それぞれ`headerContent`/`headerSecondaryContent`は画面ごとに指定）

### 動作確認

`npm run lint`（エラー0件）、`npm run test`（5件成功）、`npm run build`成功。
ローカル環境で5画面すべて（`HomePage`・`MemoPage`・`TopicChoice`・`StoryCreatePage`・`CreateMangaPage`）の表示を確認。広告あり/なしとも意図通り。
