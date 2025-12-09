# Chrome拡張機能 要件定義兼設計書

## プロジェクト概要

### プロジェクト名
EldenMessage

### 概要
エルデンリング風のメッセージシステムをWebページ上に実装するChrome拡張機能。ユーザーは定型文を組み合わせてメッセージを作成し、Webページ上の任意の場所に配置できる。同じ拡張機能を使用している他のユーザーは、同じURLの同じ位置にメッセージを閲覧・評価することができる。

---

## 機能要件

### 1. メッセージ作成機能

#### 1.1 ベース文選択
ユーザーは以下の24種類のベース文テンプレートから1つを選択できる：

```
- "この先、****があるぞ"
- "この先、****はないぞ"
- "この先、****が必要だ"
- "この先、****に注意しろ"
- "この先、****が有効だ"
- "おそらく****"
- "まずは****"
- "****を目指せ"
- "****はまだか…"
- "やはり****か…"
- "****さえあれば…"
- "****とはな…"
- "****の予感…"
- "****だと思うだろう？"
- "****の時間だ"
- "****、おぉ****"
- "****をご照覧あれ"
- "****を捧げよ"
- "****万歳！"
- "****あれ！"
- "ああ、****よ…"
- "****"
- "****！"
- "****？"
- "****…"
```

#### 1.2 種類選択
メッセージの種類カテゴリを以下から選択（UI表示用、機能的な影響は仕様次第）：

```
- "敵"
- "人物"
- "モノ"
- "戦術"
- "アクション"
- "状況"
- "場所"
- "指示語"
- "部位"
- "属性"
- "概念"
- "つぶやき"
```

#### 1.3 単語選択
ベース文の `****` 部分に挿入する単語を以下から選択：

```
- "がんばれよ"
- "よく見ろ"
- "よく聞け"
- "よく考えろ"
- "よくやった"
- "おれはやった！"
- "やっちまった…"
- "ここだ！"
- "ここじゃない！"
- "やっちまえ！"
- "心が折れそうだ…"
- "考えるな"
- "さみしい…"
- "またここか…"
- "ここからが本番だ"
- "慌てるんじゃない"
- "立ち止まるな"
- "引き返せ"
- "諦めろ"
- "諦めるな"
- "助けてくれ…"
- "そんな馬鹿な…"
- "高すぎる…"
- "帰りたい…"
- "夢みたい…"
- "懐かしい…"
- "美しい…"
- "その資格は無い"
- "覚悟はできたか？"
```

#### 1.4 メッセージ生成ロジック
- ベース文の `****` を選択した単語で置換
- 複数の `****` がある場合は同じ単語で全て置換

### 2. メッセージ配置機能

#### 2.1 配置モード
- ユーザーが配置モードを有効化すると、カーソルが配置モードに変更
- クリックした位置にメッセージUIを表示
- 配置位置はビューポート座標ではなく、ページ内の絶対座標として保存

#### 2.2 配置情報
各メッセージには以下の情報を保存：
- URL（正規化後）
- X座標（ページ内絶対座標）
- Y座標（ページ内絶対座標）
- メッセージ本文
- 種類
- 作成日時
- 作成者ID（匿名化されたブラウザ識別子）

### 3. メッセージ表示機能

#### 3.1 自動表示
- ページ読み込み時、現在のURLに対応するメッセージを全て取得
- 各メッセージを保存された座標位置に表示
- 表示はfixed positionではなく、ページスクロールに追従する形式

#### 3.2 UI仕様
提供されたHTMLスタイルを使用：
- エルデンリング風のダークテーマ
- グラデーション背景
- ボーダーとシャドウによる立体感
- 日本語セリフ体フォント（Noto Serif JP優先）
- 評価総数の表示
- 評価ボタン

### 4. 評価機能

#### 4.1 評価の仕組み
- 各メッセージに対して「評価」ボタンを配置
- ユーザーは1メッセージにつき1回のみ評価可能
- 評価済みかどうかはlocalStorageで管理
- 評価するとSupabase上の評価カウントが+1

#### 4.2 評価の制限
- 同一ブラウザ（同一拡張機能インストール）からは1回のみ
- 自分が投稿したメッセージも評価可能（仕様による）

### 5. 拡張機能UI

#### 5.1 Popup UI
ブラウザアクションをクリックすると表示されるポップアップ：
- メッセージ作成フォーム
  - ベース文選択ドロップダウン
  - 種類選択ドロップダウン
  - 単語選択ドロップダウン
  - プレビュー表示
  - 「配置モードで配置」ボタン
- 設定
  - メッセージ表示のON/OFF
  - 通知設定など

#### 5.2 Content Script UI
Webページ上に表示される要素：
- 配置されたメッセージUI
- 配置モード時のカーソルフィードバック
- 配置プレビュー

---

## 非機能要件

### 1. パフォーマンス
- ページ読み込み時のメッセージ取得は1秒以内
- メッセージ表示による体感的な遅延なし
- 大量のメッセージがあってもページスクロールが重くならない

### 2. セキュリティ
- XSS対策：ユーザー入力は全て定型文のため、基本的に安全
- Supabase APIキーはバックエンドで管理（環境変数）
- CORS設定の適切な構成

### 3. プライバシー
- ユーザー識別はブラウザごとの匿名IDを使用
- 個人情報の収集なし
- IPアドレスなどの追跡情報は保存しない

### 4. 互換性
- Chrome最新版で動作
- React 18+を使用
- Manifest V3準拠

---

## 技術スタック

### フロントエンド
- **React 18+**: UI構築
- **TypeScript**: 型安全性
- **Vite**: ビルドツール
- **TailwindCSS or Styled Components**: スタイリング（インラインスタイルからの移行を検討）

### Chrome拡張機能
- **Manifest V3**: 最新のChrome拡張機能仕様
- **Content Scripts**: Webページへのメッセージ表示
- **Background Service Worker**: バックグラウンド処理
- **Storage API**: ローカル設定保存

### バックエンド/データベース
- **Supabase**:
  - PostgreSQL: メッセージデータ保存
  - Realtime: リアルタイム更新（オプション）
  - Row Level Security: アクセス制御

---

## データベース設計

### Supabaseテーブル設計

#### 1. messages テーブル

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,                      -- 正規化されたURL
  url_hash TEXT NOT NULL,                 -- URL検索用ハッシュ（インデックス用）
  x_position INTEGER NOT NULL,            -- X座標（ページ内絶対座標）
  y_position INTEGER NOT NULL,            -- Y座標（ページ内絶対座標）
  message_text TEXT NOT NULL,             -- 完成したメッセージ本文
  base_template TEXT NOT NULL,            -- 使用したベース文
  category TEXT NOT NULL,                 -- 選択した種類
  word TEXT NOT NULL,                     -- 選択した単語
  rating_count INTEGER DEFAULT 0,         -- 評価総数
  creator_id TEXT NOT NULL,               -- 作成者の匿名ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_messages_url_hash ON messages(url_hash);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

#### 2. ratings テーブル

```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,                  -- 評価者の匿名ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)             -- 1メッセージに1回のみ
);

-- インデックス
CREATE INDEX idx_ratings_message_id ON ratings(message_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
```

### URL正規化ルール
同じページを識別するために、URLを正規化：
- プロトコルを統一（https優先）
- クエリパラメータのソート
- トレイリングスラッシュの統一
- フラグメント（#以降）の除去（オプション）

例：
```
https://example.com/page?b=2&a=1#section
↓
https://example.com/page?a=1&b=2
```

---

## アーキテクチャ

### 拡張機能構成

```
chrome-extension/
├── manifest.json              # Manifest V3設定
├── src/
│   ├── popup/                 # ポップアップUI（React）
│   │   ├── Popup.tsx
│   │   ├── MessageCreator.tsx
│   │   ├── Settings.tsx
│   │   └── index.tsx
│   ├── content/               # Content Script
│   │   ├── ContentScript.tsx  # メッセージ表示コンポーネント
│   │   ├── MessageOverlay.tsx # メッセージUI
│   │   ├── PlacementMode.tsx  # 配置モード
│   │   └── index.tsx
│   ├── background/            # Service Worker
│   │   └── background.ts
│   ├── shared/                # 共有コード
│   │   ├── types.ts           # 型定義
│   │   ├── constants.ts       # 定数（ベース文、単語など）
│   │   ├── supabase.ts        # Supabaseクライアント
│   │   ├── urlUtils.ts        # URL正規化
│   │   └── storage.ts         # Chrome Storage API
│   └── styles/
│       └── content.css        # Content Script用CSS
├── public/
│   ├── icons/                 # 拡張機能アイコン
│   └── manifest.json
├── vite.config.ts
├── package.json
└── tsconfig.json
```

### データフロー

#### メッセージ作成・配置フロー
```
1. ユーザーがPopupでメッセージ作成
   ↓
2. 「配置モードで配置」をクリック
   ↓
3. Content Scriptに配置モード開始を通知（chrome.tabs.sendMessage）
   ↓
4. ユーザーがページ上でクリック
   ↓
5. クリック座標とメッセージデータをBackgroundに送信
   ↓
6. BackgroundがSupabaseにPOST
   ↓
7. 成功したらContent Scriptに通知してメッセージを即座に表示
```

#### メッセージ表示フロー
```
1. ページ読み込み完了（DOMContentLoaded）
   ↓
2. Content ScriptがBackgroundに現在URLを送信
   ↓
3. BackgroundがSupabaseからメッセージ取得（URL正規化後）
   ↓
4. Content Scriptがメッセージを受信
   ↓
5. 各メッセージをReactコンポーネントでレンダリング
```

#### 評価フロー
```
1. ユーザーが評価ボタンをクリック
   ↓
2. LocalStorageで評価済みかチェック
   ↓
3. 未評価の場合、BackgroundにPOST
   ↓
4. Supabaseでratingsテーブルに追加、messagesのrating_countを+1
   ↓
5. 成功したらlocalStorageに記録、UIを更新
```

---

## UI/UX設計

### 1. Popup UI（拡張機能ポップアップ）

#### レイアウト
```
┌─────────────────────────────────┐
│  Web Message Marker             │
├─────────────────────────────────┤
│  ベース文:                       │
│  [▼ この先、****があるぞ       ] │
│                                 │
│  種類:                          │
│  [▼ つぶやき                   ] │
│                                 │
│  単語:                          │
│  [▼ 尻                         ] │
│                                 │
│  ┌─────────────────────────┐   │
│  │ プレビュー:                │   │
│  │ この先、尻があるぞ          │   │
│  └─────────────────────────┘   │
│                                 │
│  [  配置モードで配置する  ]     │
│                                 │
├─────────────────────────────────┤
│  設定                           │
│  □ メッセージを表示する         │
└─────────────────────────────────┘
```

### 2. メッセージUI（Webページ上）

提供された仕様のまま実装：
- 最小幅520px、最大幅720px
- エルデンリング風デザイン
- 評価ボタンと評価総数
- ホバー時の視覚的フィードバック

#### 配置モード時の表示
- 配置モード中はカーソルが十字カーソル（crosshair）に変更
- マウス位置にメッセージのプレビューを半透明で表示
- クリックで確定

---

## 実装ステップ

### Phase 1: 環境構築とプロジェクトセットアップ
- [ ] Vite + React + TypeScriptプロジェクト作成
- [ ] Chrome拡張機能の基本構造構築（Manifest V3）
- [ ] Supabaseプロジェクト作成とテーブル設計
- [ ] 開発環境での拡張機能読み込み確認

### Phase 2: データ層実装
- [ ] Supabaseクライアント設定
- [ ] URL正規化ユーティリティ実装
- [ ] Chrome Storage APIラッパー実装
- [ ] 型定義（TypeScript）
- [ ] 定数データ（ベース文、単語など）

### Phase 3: Popup UI実装
- [ ] メッセージ作成フォーム
- [ ] ベース文/種類/単語のセレクトボックス
- [ ] プレビュー表示
- [ ] 配置モード開始ボタン
- [ ] 設定画面

### Phase 4: Content Script実装
- [ ] メッセージ表示コンポーネント
- [ ] ページ読み込み時のメッセージ取得・表示
- [ ] 配置モード実装
- [ ] 評価ボタン機能
- [ ] スタイリング（提供されたデザイン）

### Phase 5: Background Service Worker実装
- [ ] Popup ↔ Content Script間の通信
- [ ] Supabase API呼び出し
- [ ] メッセージCRUD処理
- [ ] 評価処理

### Phase 6: 統合テストと最適化
- [ ] エンドツーエンドテスト
- [ ] パフォーマンス最適化
- [ ] エラーハンドリング
- [ ] ユーザーフィードバック実装

### Phase 7: デプロイ準備
- [ ] プロダクションビルド
- [ ] アイコン・スクリーンショット作成
- [ ] Chrome Web Store用のメタデータ準備
- [ ] プライバシーポリシー作成

---

## 今後の拡張機能案

### オプション機能
- メッセージの削除機能（作成者のみ）
- メッセージの報告機能（不適切なコンテンツ）
- 人気メッセージのフィルタリング
- リアルタイム更新（Supabase Realtime）
- メッセージ検索機能
- カスタムテーマ
- 多言語対応

### パフォーマンス改善
- メッセージのページネーション/遅延読み込み
- キャッシング戦略
- Service Workerでのオフライン対応

---

## セキュリティ考慮事項

### 1. Content Security Policy
Manifest V3の厳格なCSPに準拠：
- インラインスクリプト禁止
- evalの使用禁止
- 外部リソースの制限

### 2. Supabase設定
- Row Level Security (RLS) の有効化
- 匿名アクセスの適切な制限
- API Keyの管理（環境変数）

### 3. 入力検証
- 定型文のみのため、基本的にXSSリスクは低い
- 座標値の妥当性チェック
- URL長の制限

---

## パフォーマンス目標

- 初回メッセージ読み込み: < 1秒
- メッセージ配置のレスポンス: < 500ms
- 評価のレスポンス: < 300ms
- ページパフォーマンスへの影響: < 5% （Lighthouse スコア）
- メモリ使用量: < 50MB

---

## まとめ

本設計書は、エルデンリング風メッセージ共有Chrome拡張機能の要件と設計をまとめたものです。React + TypeScript + Supabaseを使用し、ユーザーが定型文ベースのメッセージをWebページ上に配置・共有できる仕組みを実装します。

次のステップは、この設計書に基づいて実装を進めることです。

---

## 付録：メッセージUI HTMLサンプル

以下は、Webページ上に表示されるメッセージUIの実装サンプルです。

```html
<div>
  <div style="
    min-width: 520px;
    max-width: 720px;
    padding: 2px;
    background:
      radial-gradient(
        ellipse at top,
        rgba(145, 132, 97, 0.45) 0,
        rgba(145, 132, 97, 0.05) 34%,
        rgba(0, 0, 0, 0.9) 100%
      ),
      linear-gradient(
        to bottom,
        #2f2d28 0,
        #24231e 38%,
        #23221d 65%,
        #2f302b 100%
      );
    border: 1px solid #6e6655;
    box-shadow:
      0 0 32px rgba(0, 0, 0, 0.9),
      0 0 4px rgba(255, 255, 255, 0.08) inset;
    border-radius: 2px;
  ">
    <div style="
      position: relative;
      padding: 8px 16px 6px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: #f7f3e7;
      font-family: 'Noto Serif JP','Yu Mincho','YuMincho',
        'Hiragino Mincho ProN',serif;
      letter-spacing: 0.08em;
    ">
      <div style="
        display: flex;
        flex-direction: column;
        gap: 8px;
      ">
        <div style="
          font-size: 14px;
          text-shadow:
            0 0 2px rgba(0, 0, 0, 0.9),
            0 0 8px rgba(0, 0, 0, 0.9);
          width: 100%;
        ">
          尻の時間だ
        </div>

        <div style="
          display: inline-flex;
          font-size: 12px;
          color: #d2cab0;
          white-space: nowrap;
          justify-content: flex-end;
        ">
          <span>評価総数</span>
          <span style="
            min-width: 16px;
            text-align: right;
          ">
            0
          </span>
        </div>
      </div>

      <div style="
        margin: 6px -16px 6px;
        border-top: 1px solid #8c8269;
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.9);
      "></div>

      <div style="
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 26px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont,
          'Segoe UI','Hiragino Kaku Gothic ProN','Meiryo',sans-serif;
        font-size: 12px;
        color: #f4f1e6;
      ">
        <button style="
          display: inline-flex;
          all: unset;
          cursor: pointer;
        ">
          <span style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            padding-left: 1px;
            height: 18px;
            border-radius: 999px;
            border: 1px solid #d3cdb9;
            font-size: 10px;
            line-height: 1;
            box-shadow:
              0 0 2px rgba(0, 0, 0, 0.9),
              0 0 4px rgba(0, 0, 0, 0.9);
            background: radial-gradient(
              circle at 30% 30%,
              rgba(255, 255, 255, 0.06) 0,
              rgba(255, 255, 255, 0) 80%
            );
          ">
            □
          </span>
          評価
        </button>
      </div>
    </div>
  </div>
</div>
```

### UIの特徴

- **グラデーション背景**: 放射状と線形グラデーションの組み合わせで深みを表現
- **多重ボーダー**: 外側と内側のボーダーで立体感を演出
- **シャドウ効果**: 外側の大きなシャドウと内側のハイライトで浮遊感を表現
- **日本語フォント**: Noto Serif JPを優先し、和風の雰囲気を醸成
- **評価ボタン**: 円形のボタンに□記号を配置し、ゲーム風のUIを再現
