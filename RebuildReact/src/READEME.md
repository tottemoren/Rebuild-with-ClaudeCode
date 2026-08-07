

src
├── components (再利用コンポーネント)
│   ├── auth (認証系)
│   │   └──　ProtectedRoute.tsx (app.tsxで画面遷移の時のログイン認証として使用)
│   ├── layout (レイアウト系)
│   │   └──　Header,LeftMenu,RightMenu (画面の部品)　PageLayout (画面全体レイアウト)
│   └── MemoItem.tsx (メモ機能の要素)
├── hooks (Reactの状態管理や再利用関数/カスタムフック)
│   └── useLoginUser.ts (ローカルストレージからログインユーザーを取得)
├── pages (画面単位のコンポーネント)
├── styles (css)
│   └── common.css (app.tsxでアプリ全体に掛かるcss)
├── types (TypeScriptの型)
├── utils (共通処理)
├── app.css
├── app.tsx ("/"に合わせて遷移する画面指定)
├── index.css
├── main.tsx
└── README.md (srcフォルダ取説)



# srcフォルダ

このフォルダには、「Rebuildアプリケーション」のReactコードを配置します。

## フォルダ構成

### components
画面で共通して利用するUIコンポーネントを管理します。

#### auth
認証（ログイン・ログアウト・認可など）に関するコンポーネントを配置します。

#### layout
画面全体で共通利用するレイアウトを配置します。
例：Header、Footer、Sidebar

---

### hooks
Reactのカスタムフックを配置します。hookはコンポーネントの中でしか使用できません。

例
- useAuth
- useFetch
- useWindowSize

---

### pages
画面単位のコンポーネントを配置します。

例
- LoginPage
- HomePage
- CreateMangaPage

---

### styles
共通CSSやスタイルを配置します。

---

### types
TypeScriptの型（interface、type）を配置します。

例
- User
- Manga
- Memo

---

### utils
複数の場所で利用する共通処理を配置します。

例
- formatDate
- validation
- calculate

---

## ファイル

### App.tsx
画面全体の親コンポーネントです。
ルーティングや共通レイアウトの表示を行います。

### App.css
App.tsx専用のスタイルを定義します。

### main.tsx
Reactアプリケーションのエントリーポイントです。
Appコンポーネントをブラウザへ描画します。

### index.css
アプリ全体で共通利用するCSSを定義します。

---

## 開発ルール

- 画面は pages に作成する。
- 再利用できるUIは components に作成する。
- 共通処理は utils に作成する。
- 型定義は types に作成する。
- カスタムフックは hooks に作成する。


