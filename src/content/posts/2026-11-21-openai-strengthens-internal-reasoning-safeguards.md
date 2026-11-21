---
title: "11/21 OpenAIが新モデルの内部推論保護を大幅に強化"
date: 2026-11-21T11:56:39+09:00
tags: ["OpenAI", "セキュリティ", "Anthropic"]
lead: "OpenAIは最新モデルにおける内部推論の抽出を防ぐ防御策を大幅に強化し、攻撃成功率を激減させたと発表した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/openai-makes-it-much-harder-for-attackers-to-extract-how-its-latest-ai-models-think/"
rank: 3
---

## ポイント

- GPT-6.2 AstraとSolで内部推論の抽出に対する安全機能が強化された
- 過去のリクエストからの推論抽出の成功率が54.0%から0.2%に低下した
- 組織的な蒸留攻撃に対して毎週数千から数万のアカウントが停止されている

## 要約

OpenAIは、「GPT-6.2 Astra」および「GPT-6.2 Sol」を対象として、モデルの内部推論の抽出に対する安全機能を大幅に強化した。内部の自動テストにおいて、過去のリクエストから保護された推論を引き出す攻撃の成功率は、「GPT-6 Astra」の54.0パーセントから「GPT-6.2 Astra」では0.2パーセントへと激減した。また、アクティブなリクエストに対する攻撃成功率も22.9パーセントから0.9パーセントへと低下し、一部の改善は従来の「GPT-6 Astra」にも適用される。

この防御システムは、個別のリクエストに対する学習の調整、メッセージやツール呼び出しのための入出力フィルター、および古いモデルによる保護された推論の読み取りを阻止するAPIブロックによって構成されている。組織的な蒸留キャンペーンに対しては、毎週数千から数万のアカウントを停止する措置をとっている。また、Anthropic社も同様に数万のアカウントを停止するなどして体系的な蒸留攻撃に対抗している。

## 元記事

- [OpenAI makes it much harder for attackers to extract how its latest AI models think](<https://the-decoder.com/openai-makes-it-much-harder-for-attackers-to-extract-how-its-latest-ai-models-think/>)（The Decoder）
