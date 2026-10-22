---
title: "10/22 AnthropicがClaude Codeを更新"
date: 2026-10-22T09:20:49+09:00
tags: ["Anthropic", "ツール"]
lead: "Anthropicは、Claude Codeのアップデート版となるv2.1.307をリリースし、APIバージョンの更新や各種不具合の修正を行った。"
source_name: "Claude Code（GitHubリリース）"
source_url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.307"
rank: 1
---

## ポイント

- Claude APIのコードをバージョン2026-10-21へ移行するコマンドを追加
- ツール呼び出しや安全チェックなどを記録するOpenTelemetryイベントを導入
- MCPサーバーの接続エラーやモデル選択時の不具合など多数の修正を実施

## 要約

Anthropicは、開発支援ツール「Claude Code」のアップデートとなるv2.1.307を公開した。

今回の更新では、Claude APIのコードをAPIバージョン2026-10-21へ移行する「/claude-api api-version」が追加された。また、ツール呼び出しや権限ルールなどの実行時にOpenTelemetryイベントを記録する機能や、未パースのツール呼び出しに対する再試行回数の上限設定といった改善が含まれている。

さらに、モデルサフィックス付きエイリアスで発生するモデル未検出エラーの修正や、MCPサーバーの認証状態・タイムアウトに関する不具合、セルフホストランナーでのチェックアウト処理の修正など、多数のバグ修正が行われている。

## 元記事

- [Claude Code v2.1.307](<https://github.com/anthropics/claude-code/releases/tag/v2.1.307>)（Claude Code（GitHubリリース））
