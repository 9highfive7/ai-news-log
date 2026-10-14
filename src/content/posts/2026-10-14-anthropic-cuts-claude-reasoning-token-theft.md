---
title: "10/14 AnthropicがClaudeの推論データ窃取を90%以上削減"
date: 2026-10-14T09:47:30+09:00
tags: ["Anthropic", "セキュリティ"]
lead: "Anthropicは、Claudeの内部推論データが不正に抽出される大規模な蒸留攻撃を防ぎ、抽出量を最大99%削減したと発表した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/anthropic-says-it-cut-claude-reasoning-token-theft-by-up-to-99-in-fight-against-industrial-scale-distillation/"
rank: 2
---

## ポイント

- Claudeの内部推論データの不正抽出を最大99%削減
- 中国のZhipuやMoonshotなどが大規模な蒸留攻撃に関与
- 抽出検知の導入と数十万件の不正アカウント停止を実施

## 要約

Anthropicは、同社のAIモデル「Claude」に対する大規模な蒸留攻撃への対策を強化し、内部の推論プロセスの抽出量を90%から99%削減することに成功したと発表した。この攻撃は、中国の企業であるZhipuやMoonshotが関与しているとされており、数十万件に及ぶ偽アカウントのネットワークが利用されていた。

対策として、同社はClaudeの内部推論ステップへのアクセス制限、抽出試行を検知する分類器の導入、該当アカウントの自動BANを実施し、すでに数万件のアカウントを停止している。盗み出された能力は、海外の軍事や監視システムに悪用される恐れがある。

同社は他のAI開発企業に対しても同様の保護策の導入を呼びかけているが、この防御プロセスの影響により正当なユーザーまで制限の対象に含まれてしまう課題も生じている。

## 元記事

- [Anthropic says it cut Claude reasoning token theft by up to 99% in fight against industrial-scale distillation](<https://the-decoder.com/anthropic-says-it-cut-claude-reasoning-token-theft-by-up-to-99-in-fight-against-industrial-scale-distillation/>)（The Decoder）
