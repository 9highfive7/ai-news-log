---
title: "11/21 AWSが分散KVキャッシュ機能を提供開始"
date: 2026-11-21T11:56:39+09:00
tags: ["その他", "ツール"]
lead: "Amazon ElastiCacheを活用した分散KVキャッシュの導入により、セルフホスト型LLMの推論コストと遅延を大幅に削減する機能が公開された。"
source_name: "AWS Machine Learning Blog"
source_url: "https://aws.amazon.com/blogs/machine-learning/cut-self-hosted-llm-cost-and-latency-with-the-distributed-kv-caching-agent-skill/"
rank: 1
---

## ポイント

- Amazon ElastiCacheを活用した分散KVキャッシュにより、推論コストを最大40%削減
- 初回のトークン生成時間（TTFT）を最大80%短縮し、応答速度を改善
- Agent Toolkitのスキルを通じて、コーディングエージェントから導入の可否診断や設定が可能

## 要約

AWSは、AIコーディングエージェントから分散KVキャッシュの評価とセットアップを行える「Agent Toolkit for AWS」の新スキルを発表した。

Amazon ElastiCacheを活用した分散KVキャッシュを導入することで、セルフホスト型の大規模言語モデルにおける推論コストを最大40%削減し、初回のトークン生成時間（TTFT）を最大80%短縮できる。Agent Toolkitのスキルは、ワークロードの適合性診断、キャッシュクラスターの構築、設定管理を自動化し、vLLMやSGLangなどの推論エンジンと連携する。

利用にはAgent Skillsに対応するコーディングエージェントのほか、EFA対応のGPUインスタンス、LMCacheやvLLM、Amazon ElastiCache for Valkeyなどの環境が必要となる。

## 元記事

- [Cut self-hosted LLM cost and latency with the distributed KV caching agent skill](<https://aws.amazon.com/blogs/machine-learning/cut-self-hosted-llm-cost-and-latency-with-the-distributed-kv-caching-agent-skill/>)（AWS Machine Learning Blog）
