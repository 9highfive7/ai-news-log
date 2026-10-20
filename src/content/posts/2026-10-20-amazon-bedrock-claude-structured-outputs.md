---
title: "10/20 Amazon BedrockがClaudeの構造化出力を提供"
date: 2026-10-20T09:51:18+09:00
tags: ["Anthropic", "ツール"]
lead: "Amazon BedrockがAnthropicのClaudeモデルにおける構造化出力のサポートを開始し、スキーマに準拠したJSONを直接取得できるようになった。"
source_name: "AWS Machine Learning Blog"
source_url: "https://aws.amazon.com/blogs/machine-learning/structured-outputs-for-anthropic-claude-models-on-amazon-bedrock/"
rank: 1
---

## ポイント

- bedrock-runtimeおよびbedrock-mantleでClaudeの構造化出力が利用可能になった
- 制約付きデコードにより、カスタムパースや再試行なしでスキーマ準拠のJSONを取得できる
- 新規スキーマはキャッシュされ、エージェント向けのエンドポイントでは厳密なツール使用をサポートする

## 要約

Amazon Bedrockは、bedrock-runtimeおよびbedrock-mantleのエンドポイントにおいて、AnthropicのClaudeモデル向けに構造化出力機能の提供を開始した。従来の事後処理や再試行ロジックを必要とせず、定義したJSONスキーマに完全に準拠したレスポンスを制約付きデコードによって直接生成する。

この機能により、出力が確率的ではなく決定的になり、JSONの解析エラーや型不一致のリスクが解消される。また、スキーマで定義されたフィールドのみに制限されるため出力トークン数が削減され、高負荷なワークフローにおける推論コストの低下につながる。バッチ推論やクロスリージョン推論、リアルタイムのストリーミングにも対応する。

初回のリクエスト時にはJSONスキーマから文法アーティファクトのコンパイルが行われるためわずかに処理時間が延びる場合があるが、生成された文法はアカウントごとに24時間キャッシュされる。bedrock-mantleエンドポイントでは厳密なツール使用（strict tool use）もサポートされ、エージェントワークフローにおけるツールパラメータの正確な検証が可能となる。

## 元記事

- [Structured outputs for Anthropic Claude models on Amazon Bedrock](<https://aws.amazon.com/blogs/machine-learning/structured-outputs-for-anthropic-claude-models-on-amazon-bedrock/>)（AWS Machine Learning Blog）
