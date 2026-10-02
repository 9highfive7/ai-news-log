---
title: "9/30 Amazon BedrockがインドのClaude推論に対応"
date: 2026-09-30T12:00:00+09:00
tags: ["Anthropic", "ツール"]
lead: "Amazon Bedrockで、Claude Opus 5などのモデルをインド国内（ムンバイとハイデラバード）のリージョンだけで推論できるようになった。"
source_name: "AWS Machine Learning Blog"
source_url: "https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-expands-claude-model-availability-to-india-cross-region-inference/"
rank: 1
---

## ポイント

- インド国内に閉じたClaudeモデルのクロスリージョン推論が可能に
- ムンバイとハイデラバードのリージョン間でトラフィックを分散
- データを保持しない方式で、インド国内でのデータ処理の要件に対応

## 要約

Amazon Bedrockは、Anthropicの「Claude Opus 5」「Claude Sonnet 5」「Claude Haiku 4.5」について、インド国内のリージョン間での推論の提供を始めたと発表した。

ムンバイとハイデラバードのリージョン間でトラフィックを分散しつつ、データの処理と推論をインド国内に限定できる。データを保持しない方式を採用しており、APIやコンソールから利用できる。

## 業務への影響

データを国内に留める規制がある地域で、生成AIアプリを展開する際の選択肢が広がる。複数リージョンでの負荷分散とデータ主権の維持を両立できるため、グローバル展開でのインフラ設計の幅が広がるとみられる。

## 元記事

- [Amazon Bedrock expands Claude model availability to in-country inferencing in India](<https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-expands-claude-model-availability-to-india-cross-region-inference/>)（AWS Machine Learning Blog）
