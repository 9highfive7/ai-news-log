---
title: "10/29 MicrosoftがCopilot harnessを発表"
date: 2026-10-29T10:28:03+09:00
tags: ["Microsoft"]
lead: "Microsoftは複数のAIモデルを統合制御するMicrosoft Copilot harnessをMicrosoft Foundryで提供開始した。"
source_name: "Microsoft Official Blog"
source_url: "https://blogs.microsoft.com/blog/2026/10/28/introducing-the-microsoft-copilot-harness-unlocking-the-potential-of-truly-multi-model-agentic-work/"
rank: 5
---

## ポイント

- Microsoft Copilot harnessがMicrosoft Foundryで利用可能になった
- 20種類以上のモデルに対応しRust製ランタイムで高速化されている
- エージェントの実行環境やオーケストレーション機能を提供する

## 要約

Microsoftは、複数のAIモデルをシームレスに組み合わせてエージェントを構築できる「Microsoft Copilot harness」を発表した。GitHubのエンジニアリングチームが開発し、社内のCopilot製品群で採用されているオーケストレーション層である。

このハーネスは20種類以上のフロンティアモデルに対応しており、MCPやエージェントスキルなどのオープン標準をサポートする。ランタイムをRustで再実装したことにより、セッションオーバーヘッドや初回トークンまでの時間が削減されている。

開発者はMicrosoft Foundryを通じてこのマネージドなハーネスを利用し、エージェントループやサンドボックス環境を活用できる。また、独自のモデルキーの持ち込みや既存のフレームワークの利用にも引き続き対応している。

## 元記事

- [Introducing the Microsoft Copilot harness: Unlocking the potential of truly multi-model agentic work](<https://blogs.microsoft.com/blog/2026/10/28/introducing-the-microsoft-copilot-harness-unlocking-the-potential-of-truly-multi-model-agentic-work/>)（Microsoft Official Blog）
