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

- 長期間のセッションやGPUを使える「Runtime Instances」を提供
- 複数のエージェントが同じインスタンス上でファイルシステムを共有できる
- 各エージェントを別々の成果物として、独立してデプロイ・更新できる

## 要約

Amazon Bedrock AgentCoreに、AWSが管理するEC2インスタンス上で長時間のエージェント処理を実行できる「Runtime Instances」が加わった。

複数のAIエージェントが同じGPUインスタンスや共有ファイルシステムの上で協調して動き、数日にわたる処理を続けられる。

AWSのブログでは、音楽制作を例に、作曲・配信・コンプライアンス確認の3つの専門エージェントを連携させる手順を紹介している。

## 元記事

- [Build a multi-agent music production pipeline on Amazon Bedrock AgentCore Runtime Instances](<https://aws.amazon.com/blogs/machine-learning/build-a-multi-agent-music-production-pipeline-on-amazon-bedrock-agentcore-runtime-instances/>)（AWS Machine Learning Blog）
