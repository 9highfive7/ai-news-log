---
title: "10/3 CloudflareがClefモデルを発表"
date: 2026-10-03T09:51:39+09:00
tags: ["ツール", "研究"]
lead: "CloudflareはAIエージェントの自動判断に特化したClefおよびClef-flashモデルを発表しました。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/cloudflare-says-its-new-clef-model-means-humans-no-longer-need-to-be-in-the-loop-for-ai-agents/"
rank: 4
---

## ポイント

- テキスト生成の代わりに確率を返す判断モデルとしてClefとClef-flashが登場
- Clef-flashの中央値応答時間は39ミリ秒と非常に高速
- Qwenモデルをベースに構築され、テキストと画像処理の両方に対応

## 要約

Cloudflareは、AIエージェント向けにテキスト生成を行わず構造化された判断を下す決定モデル「Clef」および「Clef-flash」を発表した。従来のLLMと異なり、事前定義された選択肢に対して確率を割り当てることで高速な処理を実現している。

Clef-flashは中央値39ミリ秒という高速なレスポンスを特徴とし、競合モデルと比較して優位性を持つ。Qwenベースのモデルとして構築され、テキストと画像の両方に対応しているのが強みである。

同社は、AIエージェントが人間の介在なしに文脈を収集し決定を下すことを目指している。今後は顧客が独自タスクに合わせて微調整できる強化学習サービスも提供する予定である。

## 業務への影響

AIエージェントを活用したシステム開発において、従来のLLMよりも高速かつ構造化された判断処理を組み込めるようになります。人間による手動の割り振りを経ずに自動でチケットのルーティングやエスカレーションを行う仕組みの構築が進むとみられます。

## 元記事

- [Cloudflare says its new Clef model means humans no longer need to be in the loop for AI agents](<https://the-decoder.com/cloudflare-says-its-new-clef-model-means-humans-no-longer-need-to-be-in-the-loop-for-ai-agents/>)（The Decoder）
