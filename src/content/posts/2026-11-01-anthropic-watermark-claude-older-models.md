---
title: "11/1 Anthropicが旧モデルのClaudeへ電子透かしを導入"
date: 2026-11-01T09:35:36+09:00
tags: ["Anthropic", "規制・政策", "セキュリティ"]
lead: "AnthropicはEU人工知能法の期限に対応するため、既存のClaudeモデルへテキストの電子透かしの展開を進めている。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/anthropics-watermark-rollout-leaves-a-loophole-on-two-older-claude-models/"
rank: 1
---

## ポイント

- AnthropicがEU人工知能法の期限に対応するためClaude旧モデルへ電子透かしを導入
- Claude Opus 4.6などの特定モデルではパラメータ変更により透かしを回避可能
- Google DeepMindのSynthID技術をベースにし、モデルレベルで適用される

## 要約

AnthropicはEU人工知能法（AI Act）の12月の期限に向け、Claude Mythos 5、Claude Opus 4.7、Claude Opus 4.6、Claude Sonnet 4.6の4モデルへテキストの電子透かしを順次追加するとAPI顧客へ通知した。すでにClaude Opus 5.5などの新しいモデルには透かしが組み込まれており、Amazon Bedrockなどの各プラットフォーム経由でも適用される。

導入される透かしはGoogle DeepMindのSynthIDの技術をベースにしており、意味や品質、処理速度を変えずに単語の選択に統計的なパターンを付与する仕組みである。ただしClaude Opus 4.6とClaude Sonnet 4.6では、サンプリングパラメータであるtemperature、top_p、top_kのいずれかを規定値から変更すると透かしが回避される仕様となっている。

Anthropicはコンプライアンス遵守のために設定をデフォルト値に維持するよう警告している。また、この透かしの検証用として検出APIがプライベートプレビューとして提供されている。一方で、透かしの導入による文章精度の低下を懸念する声や、法務分野での利用における複雑化の指摘もあがっている。

## 元記事

- [Anthropic's watermark rollout leaves a loophole on two older Claude models](<https://the-decoder.com/anthropics-watermark-rollout-leaves-a-loophole-on-two-older-claude-models/>)（The Decoder）
