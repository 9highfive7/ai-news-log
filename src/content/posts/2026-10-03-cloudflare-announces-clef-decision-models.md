---
title: "10/3 CloudflareがClefモデルを発表"
date: 2026-10-03T09:51:39+09:00
tags: ["ツール"]
lead: "Cloudflareが、文章を生成せず選択肢ごとの確率を返す、AIエージェントの判断用モデル「Clef」と高速版「Clef-flash」を発表した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/cloudflare-says-its-new-clef-model-means-humans-no-longer-need-to-be-in-the-loop-for-ai-agents/"
rank: 4
---

## ポイント

- テキストを生成せず確率で直接判断を下すClefとClef-flashを公開
- Clef-flashの応答速度は中央値で約39ミリ秒と高速に動作する
- Workers AI上で稼働し、Hugging FaceにてApache 2.0で提供される

## 要約

Cloudflareは、AIエージェントがテキストを生成せずに事前定義された選択肢から確率に基づいて判断を下すための決定モデル「Clef」および「Clef-flash」を発表した。競合するTypeSafe AIの「Jev」に対抗するもので、Qwenをベースに構築されており、テキストと画像の両方をサポートしている。

Clef-flashの応答速度は中央値で約39ミリ秒、Clefは約209ミリ秒であり、ベンチマークにおいて競合モデルよりも高速に動作する。また、64,000トークンのコンテキストウィンドウを持ち、APIはJevと完全互換性を保っている。Qwen3.8-27BをベースにしたClefと、Qwen3.5-9BをベースにしたClef-flashがあり、モデル自体は変更せず追加の合成データトレーニングコンポーネントが組み込まれている。

両モデルはCloudflareのWorkers AIプラットフォーム上で稼働し、Hugging FaceにてApache 2.0ライセンスで公開されている。顧客はAI Gatewayを通じたリクエストログからデータセットを構築し、強化学習を用いて独自のタスク向けにモデルを微調整することが可能である。

## 元記事

- [Cloudflare says its new Clef model means humans no longer need to be in the loop for AI agents](<https://the-decoder.com/cloudflare-says-its-new-clef-model-means-humans-no-longer-need-to-be-in-the-loop-for-ai-agents/>)（The Decoder）
