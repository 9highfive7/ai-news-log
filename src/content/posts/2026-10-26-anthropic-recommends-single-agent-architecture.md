---
title: "10/26 Anthropicが単一エージェントへの移行を推奨"
date: 2026-10-26T08:41:49+09:00
tags: ["Anthropic", "ツール"]
lead: "Anthropicは複数エージェント構成を見直し、コンテキストを動的読み込みする単一エージェントへの移行を推奨している。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/anthropic-says-one-ai-agent-beats-many-subagents-now-that-models-can-handle-complexity-alone/"
rank: 1
---

## ポイント

- 複数サブエージェントから単一エージェントへの統合を推奨
- 単一エージェント構成により処理速度が約2倍に向上
- 移行を支援するキットがGitHub上で公開されている

## 要約

Anthropicは、多くの特化型サブエージェントを廃止し、必要に応じてコンテキストを読み込む単一エージェントへの統合を企業に推奨していると発表した。複数エージェント構成はレイテンシの増大やコスト上昇、引き継ぎ時の情報ロスを招く原因となる。

Opus 4.5やOpus 5.5、Fable 5.1などの新しいモデルでは、単一ループ内で複雑な計画を直接管理できる。実際のアーキテクチャ比較では、単一エージェント構成は複数エージェント構成と比較して約2倍の速度で動作した。また、Claude Codeのシステムプロンプトを8割以上削減できた事例もある。

Anthropicは移行を支援するため、GitHub上で移行キットを公開している。ただし、盲目的な統合は既存のプロセスを壊す恐れがあるため、ワークショップを通じて慎重に検証するよう警告している。

## 元記事

- [Anthropic says one AI agent beats many subagents now that models can handle complexity alone](<https://the-decoder.com/anthropic-says-one-ai-agent-beats-many-subagents-now-that-models-can-handle-complexity-alone/>)（The Decoder）
