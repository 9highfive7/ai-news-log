---
title: "10/1 AWSがAgentCoreに長時間実行基盤を追加"
date: 2026-10-01T12:00:00+09:00
tags: ["ツール"]
lead: "Amazon Bedrock AgentCoreに、GPUも使える「Runtime Instances」が加わり、複数のエージェントが数日がかりの処理を共同で行える。"
source_name: "AWS Machine Learning Blog"
source_url: "https://aws.amazon.com/blogs/machine-learning/build-a-multi-agent-music-production-pipeline-on-amazon-bedrock-agentcore-runtime-instances/"
rank: 5
---

## ポイント

- Amazon Bedrock AgentCoreにRuntime Instances機能が追加された
- 同一のセッションIDで複数のAIエージェントを同一EC2インスタンス上に配置できる
- GPUや永続ボリュームを活用した数日間にわたる長期的なワークフロー構築が可能になる

## 要約

Amazon Web Servicesは、Amazon Bedrock AgentCoreのRuntime Instancesにおいて、複数エージェントによるワークフロー構築機能を発表した。

この機能により、GPUを備えたAWS管理のEC2インスタンス上で複数のエージェントを同じセッションIDで共同配置し、共有ファイルシステムを通じてファイルをやり取りすることが可能となる。音楽制作パイプラインの事例では、Claude Sonnet 4.6やオープンソースの音楽生成モデル「ACE-Step」を用いた作曲、マスタリング、コンプライアンスチェックの3つのエージェントが協調して動作する。

Runtime Instancesは、数日間に及ぶセッションや永続ボリュームの利用をサポートしており、サーバーレスのMicroVM環境とは異なる長期的なエージェント運用を可能にする。

## 元記事

- [Build a multi-agent music production pipeline on Amazon Bedrock AgentCore Runtime Instances](<https://aws.amazon.com/blogs/machine-learning/build-a-multi-agent-music-production-pipeline-on-amazon-bedrock-agentcore-runtime-instances/>)（AWS Machine Learning Blog）
