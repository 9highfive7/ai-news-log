# AIニュースログ

AI関連ニュースを毎日自動で収集し、LLM（Claude / Gemini / GPT のいずれか）で日本語の短い記事にまとめて蓄積するブログです。
GitHub Pages で公開します（`https://9highfive7.github.io/ai-news-log/`）。

- サイト: [Astro](https://astro.build/)（静的サイト）＋ [Pagefind](https://pagefind.app/)（サイト内検索）
- 記事生成: Node.js（TypeScript）＋ Anthropic / Google Gen AI / OpenAI の公式 SDK（どれを使うか切り替え可能）
- 定期実行: GitHub Actions（毎朝 7:00 JST、手動実行も可）

## しくみ

```
GitHub Actions（毎朝7:00 JST / 手動実行）
  generate: RSS取得 → 直近36時間・未処理の記事に絞る → LLMが重要度順に最大5本選ぶ
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
3. 使うモデルのキーを登録する（比較モードでは、キーを登録したモデルすべてを比べます）

| Name | 内容 |
| --- | --- |
| `ANTHROPIC_API_KEY` | Anthropic の API キー（[Claude Console](https://console.anthropic.com/) で発行） |
| `GEMINI_API_KEY` | Gemini の API キー（[Google AI Studio](https://aistudio.google.com/) で発行） |
| `OPENAI_API_KEY` | OpenAI の API キー（[OpenAI Platform](https://platform.openai.com/) で発行） |
| `TYPESAFE_API_KEY`（任意） | 比較モードの審査役 Jev の API キー（[TypeSafe AI](https://typesafe.ai/) で発行）。未登録なら審査なしで比較します |

任意で、同じ画面の **Variables** タブから次の値を設定できます。

| 名前 | 内容 | 未設定時 |
| --- | --- | --- |
| `LLM_PROVIDER` | 毎日の定期実行で使うモデルの種類（`claude` / `gemini` / `openai`） | `claude` |
| `ANTHROPIC_MODEL` | Claude を使うときのモデル | `claude-haiku-4-5` |
| `GEMINI_MODEL` | Gemini を使うときのモデル | `gemini-3.5-flash-lite` |
| `OPENAI_MODEL` | GPT を使うときのモデル | `gpt-6-luna` |
| `MAX_ARTICLES` | 1日に生成する最大本数 | `5` |
| `TYPESAFE_DEFAULT_MODEL` | 審査に使う Jev のモデル | `jev-latest` |

### 2. GitHub Pages の公開元を「GitHub Actions」にする

1. **Settings > Pages** を開く
2. **Build and deployment** の **Source** で **GitHub Actions** を選ぶ

### 3. 動作確認

**Actions** タブ → **Daily AI News** → **Run workflow** で手動実行できます。
**provider** で使うモデルを選べます（`auto` は Variables の `LLM_PROVIDER`、未設定なら claude）。
新しい記事が0件でもサイトを公開したい場合（初回など）は、**force_deploy** にチェックを入れて実行してください。

**dry_run** にチェックを入れると、記事を生成するだけでコミット・デプロイ・`data/seen.json` の更新は行いません。
生成された Markdown は実行結果ページの **Summary** に表示されます（**Artifacts** の `dry-run-posts` からダウンロードも可）。

### 4. モデルを比較する

**provider** で **compare** を選んで実行すると、比較モードになります。

- API キーを登録したモデル（2つ以上）それぞれで選別し、多くのモデルが選んだニュースを優先して最大5本を、同じ材料で全モデルに記事化させます。
- 結果は実行結果ページの **Summary** にそのまま表示されます（Artifacts の `compare-report` からもダウンロード可）。
  - 集計（記事化できた本数、形式エラーでの出し直し回数、トークン数、概算費用、応答時間）
  - 選別結果の並び比べ（何を選んだか・理由）
  - ニュースごとの記事の読み比べ
- `TYPESAFE_API_KEY` を登録していると、TypeSafe AI の判断モデル **Jev** が審査役として採点します。
  - 観点ごとの点数（1〜5）: 正確さ、日本語の自然さ、業務への有用性、見出しの分かりやすさ
  - 元記事にない内容を含んでいる確率
  - 総合で優れている確率（モデル名を伏せて記事A・Bとして渡し、組み合わせごとに順番を入れ替えて2回ずつ判定し、各モデルの1対1の勝ち確率を平均）
  - Jev は文章を返さず理由は出ないので、気になる判定はレポート内の記事を読んで確認してください
- 記事の公開・コミット・`data/seen.json` の更新は行いません。何度でも試せます。
- どれを使うか決めたら、Variables の `LLM_PROVIDER` に `claude` / `gemini` / `openai` のいずれかを設定してください。

> 概算費用は `scripts/lib/llm/index.ts` に登録した単価で計算しています。単価は変わることがあるので、正確な値は各社の料金ページで確認してください。

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
cp .env.example .env   # 使うモデルの API キーを記入
```

### 記事生成の dry-run

```bash
npm run generate:dry
```

- RSS取得 → 選別 → 記事化まで本番と同じように動き、`src/content/posts/` に Markdown を出力します。
- `data/seen.json` は更新せず、git の操作（コミット・push）も一切しません。
- 本数を減らして試すときは `MAX_ARTICLES=2 npm run generate:dry` のようにします。
- モデルを指定するときは `npm run generate:dry -- --provider=gemini` のようにします（省略時は `.env` の `LLM_PROVIDER`、なければ claude）。
- 出力された記事が不要なら `git clean -n src/content/posts`（確認）→ `git clean -f src/content/posts` で削除できます。

`npm run generate` は本番用で、`data/seen.json` も更新します（コミットはしません）。

### モデルの比較

```bash
npm run compare
```

`compare-output/` に比較レポート（Markdown）を出力します（2つ以上のモデルの API キーが必要です。`.env` に `TYPESAFE_API_KEY` があれば Jev の審査も行います）。

### サイトの確認

```bash
npm run dev                         # 開発サーバー（http://localhost:4321/ai-news-log/）
npm run build && npm run preview    # 本番と同じビルド（サイト内検索はこちらで確認）
```

## 記事のルール

`scripts/lib/prompts.ts` でLLMに指示しています（Claude・Gemini共通）。

- ファイル名: `src/content/posts/YYYY-MM-DD-slug.md`
- フロントマター: `title`, `date`, `tags`, `source_name`, `source_url`
- タイトル: `10/1 OpenAIが新機能発表` のように「M/D + 20〜30字の見出し」
- 本文: 要約（3〜5文）／ポイント（箇条書き3つ程度）／業務への影響（2〜3文）／元記事リンク
- タグ: OpenAI, Google, Anthropic, Microsoft, Meta, 国内, 規制・政策, 研究, ツール, その他（`src/consts.ts`）
- 英語の記事も日本語で書く
- 著作権への配慮: 元記事の文章をそのまま使わず自分の言葉で要約する。長い引用はしない。画像は扱わない
  - 元記事と30字以上一致する箇所があれば、自動で書き直させます
- 社名や社内案件には触れない（「当社」「弊社」などが含まれていれば自動で書き直させます）
- LLMの出力はJSONで受け取り、壊れていたり形式に合わなかったりした場合は理由を伝えて最大3回まで出し直させます

## ディレクトリ構成

```
.github/workflows/daily.yml        記事生成 → コミット → ビルド → デプロイ
.github/workflows/check-feeds.yml  フィードの取得確認
scripts/generate.ts                記事生成のエントリポイント
scripts/check-feeds.ts             フィード確認ツール
scripts/lib/                       RSS取得・プロンプト・Markdown出力・比較レポート・seen管理
scripts/lib/llm/                   Claude / Gemini / GPT の呼び出しとJSONの検証・リトライ
scripts/lib/judge.ts               比較モードの審査（Jev）
sources.json                       取得元RSSの一覧
data/seen.json                     処理済みURL
src/content/posts/                 記事（Markdown）
src/pages/                         トップ・記事・タグ・検索・RSS
```
