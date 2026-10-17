---
title: "10/18 AnthropicのClaudeが米NSAの暗号謎を解明"
date: 2026-10-18T08:41:05+09:00
tags: ["Anthropic", "セキュリティ", "研究"]
lead: "AnthropicのClaudeが米NSAのデジタル署名に関する25年来の暗号の謎をわずか30分で解き明かした。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/anthropics-claude-cracks-a-25-year-old-nsa-cryptography-mystery-in-under-30-minutes/"
rank: 1
---

## ポイント

- Claudeが25年来のNSAの暗号の謎を30分で解明
- シードはC言語の簡易的な乱数生成器から生成されていた
- 意図的なバックドアの可能性は低いと判断された

## 要約

AnthropicのAIモデル「Claude」が、米国家安全保障局（NSA）が提供したデジタル署名用標準曲線のシードに関する25年来の謎を解明した。NSAが2000年に公開したECDSA標準曲線のシード生成元は長年不明であり、バックドアの存在が疑われていた。

Claudeはわずか30分で、シードがC言語の乱数生成器「lrand48」と1997年5月から1998年4月の間に設定されたUnixタイムスタンプから作られていたことを見つけ出した。乱数生成器の出力ビットの偏りからパターンを特定したものであり、Anthropicはこの結果から意図的なバックドアの可能性は低いとしている。

Anthropicはこの解明によって獲得した3万6864ドルの賞金をInternet Security Research Groupへ寄付する予定である。

## 元記事

- [Anthropics' Claude cracks a 25-year-old NSA cryptography mystery in under 30 minutes](<https://the-decoder.com/anthropics-claude-cracks-a-25-year-old-nsa-cryptography-mystery-in-under-30-minutes/>)（The Decoder）
