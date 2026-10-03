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

- Amazon Bedrockがインド国内でのClaudeモデルの地理的クロスリージョン推論に対応
- ムンバイとハイデラバード間でリクエストを処理し、国内のデータ処理要件に対応
- ゼロデータ保持モデルを採用し、APIやコンソール経由で利用が可能

## 要約

AWSは、Amazon BedrockにおいてAnthropicのClaudeモデルの提供範囲を拡大し、インド国内での地理的クロスリージョン推論に対応したと発表した。対象となるモデルはClaude Opus 5、Claude Sonnet 5、Claude Haiku 4.5の3つであり、ムンバイとハイデラバードのリージョン間でリクエストをルーティングする仕組みを採用している。

この機能により、ユーザーはインド国内のデータ処理要件を満たしながらモデルを利用できる。トラフィックのピーク時には複数リージョンのコンピューティングプールを活用してスループットを維持し、通信時はエンドツーエンドの暗号化が適用される。

データは転送先リージョンに保存されず、ゼロデータ保持モデルが適用される。請求やモニタリングはリクエスト元のリージョンで一元管理され、Messages APIやInvokeModel、Converse APIなどを通じて利用可能である。

## 元記事

- [Amazon Bedrock expands Claude model availability to in-country inferencing in India](<https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-expands-claude-model-availability-to-india-cross-region-inference/>)（AWS Machine Learning Blog）
