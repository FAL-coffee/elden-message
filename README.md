# EldenMessage

エルデンリング風のメッセージシステムをWebページ上に実装するChrome拡張機能です。

## 機能

- 定型文を組み合わせてメッセージを作成
- Webページ上の任意の場所にメッセージを配置
- 同じ拡張機能を使用している他のユーザーとメッセージを共有
- メッセージに評価を付ける

## 開発環境のセットアップ

### 必要な環境

- Node.js (v18以上)
- npm または yarn
- Chrome ブラウザ

### インストール

1. リポジトリをクローン

```bash
git clone https://github.com/FAL-coffee/elden-message.git
cd elden-message
```

2. 依存パッケージをインストール

```bash
npm install
```

3. 環境変数を設定

`.env.example`を`.env`にコピーし、Supabaseの設定を記入：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 開発

#### ビルド

```bash
npm run build
```

#### 開発モード

```bash
npm run dev
```

### Chrome拡張機能として読み込む

1. `npm run build`を実行してビルド
2. Chromeで`chrome://extensions/`を開く
3. 右上の「デベロッパーモード」を有効化
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. プロジェクトの`dist`フォルダを選択

## プロジェクト構造

```
elden-message/
├── src/
│   ├── popup/           # ポップアップUI
│   ├── content/         # Content Script
│   ├── background/      # Background Service Worker
│   ├── shared/          # 共有コード
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   ├── supabase.ts
│   │   ├── urlUtils.ts
│   │   └── storage.ts
│   └── styles/
├── public/
│   ├── manifest.json    # Chrome拡張機能の設定
│   └── icons/
└── dist/                # ビルド出力
```

## 技術スタック

- React 18
- TypeScript
- Vite
- Supabase
- Chrome Extension Manifest V3

## ライセンス

MIT

## 作者

FAL-coffee
