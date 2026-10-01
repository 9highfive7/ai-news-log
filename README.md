# AIニュースログ

AI関連ニュースを毎日自動で収集し、Claude API で日本語の短い記事にまとめて蓄積するブログです。
GitHub Pages で公開します（`https://9highfive7.github.io/ai-news-log/`）。

- サイト: [Astro](https://astro.build/)（静的サイト）＋ [Pagefind](https://pagefind.app/)（サイト内検索）
- 記事生成: Node.js（TypeScript）＋ Anthropic 公式 SDK
- 定期実行: GitHub Actions（毎朝 7:00 JST、手動実行も可）

## しくみ

```
GitHub Actions（毎朝7:00 JST / 手動実行）
  generate: RSS取得 → 直近36時間・未処理の記事に絞る → Claudeが重要度順に最大5本選ぶ
            → 1本ずつ日本語の記事にする → src/content/posts/ に保存 → コミット & push
  build:    astro build → pagefind で検索インデックス作成
  deploy:   GitHub Pages にデプロイ
```

- 新しい記事が0件のときはコミットもデプロイもせずに正常終了します。
- `main` に push したとき（デザイン変更など）は、記事生成なしでビルド・デプロイだけ行います。
- 1つのフィードの取得に失敗しても、他のフィードで処理を続けます。
- 処理済みのURLは `data/seen.json` に記録し、同じ記事を二重に取り上げないようにしています（60日で自動削除）。

## 初期設定

### 1. Secrets に API キーを登録する

1. リポジトリの **Settings > Secrets and variables > Actions** を開く
2. **Secrets** タブで **New repository secret** をクリック
3. Name に `ANTHROPIC_API_KEY`、Secret に Anthropic の API キー（[Claude Console](https://console.anthropic.com/) で発行）を入れて **Add secret**

任意で、同じ画面の **Variables** タブから次の値を設定できます。

| 名前 | 内容 | 未設定時 |
| --- | --- | --- |
| `ANTHROPIC_MODEL` | 使用するモデル | `claude-haiku-4-5` |
| `MAX_ARTICLES` | 1日に生成する最大本数 | `5` |

### 2. GitHub Pages の公開元を「GitHub Actions」にする

1. **Settings > Pages** を開く
2. **Build and deployment** の **Source** で **GitHub Actions** を選ぶ

### 3. 動作確認

**Actions** タブ → **Daily AI News** → **Run workflow** で手動実行できます。
新しい記事が0件でもサイトを公開したい場合（初回など）は、**force_deploy** にチェックを入れて実行してください。

> 定期実行（schedule）はリポジトリのデフォルトブランチでのみ動きます。デフォルトブランチを `main` にしておいてください。

## 取得元（RSS）の追加・削除

取得元は `sources.json` で管理しています。

```json
{
  "maxAgeHours": 36,
  "sources": [
    { "name": "OpenAI News", "url": "https://openai.com/news/rss.xml" },
    { "name": "Publickey", "url": "https://www.publickey1.jp/atom.xml", "keywords": ["AI", "生成AI", "LLM"] }
  ]
}
```

| 項目 | 内容 |
| --- | --- |
| `name` | 記事の出典として表示される名前 |
| `url` | RSS / Atom フィードのURL |
| `keywords`（任意） | AI専門でないフィード向け。タイトルか概要にどれかを含む記事だけを候補にします |
| `enabled`（任意） | `false` にすると一時的に取得対象から外れます |
| `maxAgeHours` | 何時間以内に公開された記事を対象にするか |

追加する前に、フィードが取得できるか確認してください。

```bash
npm run check-feeds -- https://example.com/feed.xml   # 追加候補のURLを確認
npm run check-feeds                                   # sources.json 全体を確認
```

`sources.json` を変更して push すると、**Check feeds** ワークフローが GitHub 上でも同じ確認を行います。

## ローカルでの実行

Node.js 22.12 以上が必要です。

```bash
npm install
cp .env.example .env   # ANTHROPIC_API_KEY を記入
```

### 記事生成の dry-run

```bash
npm run generate:dry
```

- RSS取得 → 選別 → 記事化まで本番と同じように動き、`src/content/posts/` に Markdown を出力します。
- `data/seen.json` は更新せず、git の操作（コミット・push）も一切しません。
- 本数を減らして試すときは `MAX_ARTICLES=2 npm run generate:dry` のようにします。
- 出力された記事が不要なら `git clean -n src/content/posts`（確認）→ `git clean -f src/content/posts` で削除できます。

`npm run generate` は本番用で、`data/seen.json` も更新します（コミットはしません）。

### サイトの確認

```bash
npm run dev                         # 開発サーバー（http://localhost:4321/ai-news-log/）
npm run build && npm run preview    # 本番と同じビルド（サイト内検索はこちらで確認）
```

## 記事のルール

`scripts/lib/prompts.ts` でClaudeに指示しています。

- ファイル名: `src/content/posts/YYYY-MM-DD-slug.md`
- フロントマター: `title`, `date`, `tags`, `source_name`, `source_url`
- タイトル: `10/1 OpenAIが新機能発表` のように「M/D + 20〜30字の見出し」
- 本文: 要約（3〜5文）／ポイント（箇条書き3つ程度）／業務への影響（2〜3文）／元記事リンク
- タグ: OpenAI, Google, Anthropic, Microsoft, Meta, 国内, 規制・政策, 研究, ツール, その他（`src/consts.ts`）
- 英語の記事も日本語で書く
- 著作権への配慮: 元記事の文章をそのまま使わず自分の言葉で要約する。長い引用はしない。画像は扱わない
  - 元記事と30字以上一致する箇所があれば、自動で書き直させます
- 社名や社内案件には触れない（「当社」「弊社」などが含まれていれば自動で書き直させます）
- Claudeの出力はJSONで受け取り、壊れていたり形式に合わなかったりした場合は理由を伝えて最大3回まで出し直させます

## ディレクトリ構成

```
.github/workflows/daily.yml        記事生成 → コミット → ビルド → デプロイ
.github/workflows/check-feeds.yml  フィードの取得確認
scripts/generate.ts                記事生成のエントリポイント
scripts/check-feeds.ts             フィード確認ツール
scripts/lib/                       RSS取得・Claude呼び出し・プロンプト・Markdown出力・seen管理
sources.json                       取得元RSSの一覧
data/seen.json                     処理済みURL
src/content/posts/                 記事（Markdown）
src/pages/                         トップ・記事・タグ・検索・RSS
```
