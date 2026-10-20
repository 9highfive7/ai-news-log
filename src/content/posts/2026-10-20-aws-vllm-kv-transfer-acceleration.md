---
title: "10/20 AWSがvLLMのKVキャッシュ転送を高速化"
date: 2026-10-20T09:51:18+09:00
tags: ["ツール", "研究"]
lead: "AWSは、大規模言語モデル推論エンジンvLLM向けにプッシュ型のKVキャッシュ転送コネクタを開発した。"
source_name: "AWS Machine Learning Blog"
source_url: "https://aws.amazon.com/blogs/machine-learning/push-based-kv-transfer-to-improve-ttft-and-tpot-for-disaggregated-inference-in-vllm/"
rank: 4
---

## ポイント

- vLLMのプリフィル・デコード分離向けにプッシュ型NIXLコネクタを導入
- 転送処理のバックグラウンド化により待機時間を削減
- Amazon EC2 P5enとEFAの環境でTTFTが最大3倍に向上

## 要約

AWSは、大規模言語モデル（LLM）の推論を事前処理とデコードに分割する「プリフィル・デコード分離」構成において、KVキャッシュの転送効率を向上させるプッシュ型NIXLコネクタを発表した。

従来のプル型転送では、デコード側が開始後に通信手順やID確認を直列で実行していたため遅延が発生していた。新方式では、デコード側が事前に対象ブロックを登録し、事前処理側がバックグラウンドスレッドでNIXL WRITEを用いて直接書き込むことで、プロデューサーとコンシューマーの処理をオーバーラップさせる。Amazon EC2 P5enインスタンスとAWS EFAを用いたQwen3-32Bのベンチマークでは、従来と比べてTTFT（初回トークン生成時間）が最大3倍、TPOT（出力トークン生成時間）が30%向上した。

この機能はアクセラレータ非依存としてvLLMにコントリビューションされており、AWS TrainiumおよびGPUクラスターのEFA環境で検証されている。

## 元記事

- [Push-based KV transfer to improve TTFT and TPOT for disaggregated inference in vLLM](<https://aws.amazon.com/blogs/machine-learning/push-based-kv-transfer-to-improve-ttft-and-tpot-for-disaggregated-inference-in-vllm/>)（AWS Machine Learning Blog）
