---
title: "11/24 AmazonがBedrockのAPIを公開"
date: 2026-11-24T14:41:45+09:00
tags: ["Anthropic", "セキュリティ", "ツール"]
lead: "Amazon Bedrockでモデルプロバイダーのプログラムを管理できるTrusted Access APIが一般提供を開始した。"
source_name: "AWS Machine Learning Blog"
source_url: "https://aws.amazon.com/blogs/machine-learning/introducing-the-amazon-bedrock-trusted-access-api-with-anthropics-enterprise-frontier-safeguards-and-enterprise-data-controls/"
rank: 4
---

## ポイント

- Amazon Bedrockでtrusted access program APIの一般提供が開始された
- AnthropicのEFSとEDCのパブリックプレビューが利用可能となった
- EFSでは顧客自身のAWS環境にデータを保持しつつ安全なモデル利用を実現する

## 要約

AWSは、Amazon Bedrockにおいてモデルプロバイダーの信頼できるアクセスプログラムを一元管理できる「trusted access program API」の一般提供を開始したと発表した。このAPIを使用することで、各プロバイダーが提供するプログラムの確認や申請、登録を統一された手順で行うことが可能となる。

同時に、Anthropicの「Enterprise Frontier Safeguards（EFS）」と「Enterprise Data Controls（EDC）」のパブリックプレビューも発表された。EFSでは、顧客自身のAWS環境内でデータ保管や暗号化を行いつつ、Claude FableやClaude Mythos、Claude Opus 5.5、Sonnet 5.5などのモデルを安全に利用できる。自動安全監視によってリスクが検出された場合、人間のレビューを行わずに顧客自身が確認できる仕組みとなっている。

利用にあたってはIAMポリシーやサービスコントロールポリシー（SCP）を用いて管理者が登録権限を制御でき、いつでもオプトアウトが可能である。EFSではプロンプトや応答データがAnthropicやAmazon Bedrockによって保持されない仕様となっている。

## 元記事

- [Introducing the Amazon Bedrock Trusted Access API with Anthropic’s Enterprise Frontier Safeguards and Enterprise Data Controls](<https://aws.amazon.com/blogs/machine-learning/introducing-the-amazon-bedrock-trusted-access-api-with-anthropics-enterprise-frontier-safeguards-and-enterprise-data-controls/>)（AWS Machine Learning Blog）
