---
title: "10/10 AnthropicがClaudeに並行エージェント機能を追加"
date: 2026-10-10T10:25:28+09:00
tags: ["Anthropic", "ツール"]
lead: "Anthropicは、Claude Managed Agentsにおいて最大1,000のエージェントを並行して動かす動的ワークフロー機能の提供を開始した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/anthropics-claude-can-now-orchestrate-up-to-1000-ai-agents-in-parallel-through-dynamic-workflows/"
rank: 1
---

## ポイント

- Claude Managed Agentsで最大1,000エージェントの並行処理が可能になった
- リードエージェントが計画立案からタスク分配、結果統合までを自動で管理する
- 大量のトークンを消費するため、小規模なワークロードからの検証が推奨されている

## 要約

Anthropicは「Claude Managed Agents」に動的ワークフロー機能を追加し、複数のAIエージェントを連携させるマルチエージェントのオーケストレーション機能に対応させた。

この機能では、リードエージェントが全体計画の作成とサブエージェントへのタスク分配を行い、処理完了後に結果を統合する。1回の実行につき最大1,000のエージェントを並行稼働させることが可能であり、11万行を超えるコードベースを用いたテストでは、70件の隠しバグに対して単体エージェントが最大27件検出したのに対し、動的ワークフローでは一貫して66件を検出した。

動的ワークフローを有効にするには、エージェントタイプに「multiagent_20261001」を指定する。大量のトークン消費を伴う可能性があるため、Anthropicは小規模な検証から始めるよう推奨しており、ドキュメントの参照やClaude Codeでのコマンド実行によって利用を開始できる。

## 元記事

- [Anthropic's Claude can now orchestrate up to 1,000 AI agents in parallel through dynamic workflows](<https://the-decoder.com/anthropics-claude-can-now-orchestrate-up-to-1000-ai-agents-in-parallel-through-dynamic-workflows/>)（The Decoder）
