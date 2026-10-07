---
title: "10/7 AnthropicがClaude Codeを更新"
date: 2026-10-07T10:09:48+09:00
tags: ["Anthropic", "ツール", "セキュリティ"]
lead: "Anthropicは開発支援ツール「Claude Code」の新バージョンv2.1.292を公開し、マーケットプレイス機能やエージェントの制御オプションを追加した。"
source_name: "Claude Code（GitHubリリース）"
source_url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.292"
rank: 3
---

## ポイント

- プラグインインストール時にマーケットプレイスを追加する--marketplaceオプションを実装
- エージェントツールに処理の度合いを指定するeffortパラメータを追加
- ネットワークパスからのファイル読み込みに関するセキュリティ脆弱性などを修正

## 要約

Anthropicは開発支援ツール「Claude Code」のバージョン2.1.292をリリースし、新機能の追加や各種不具合の修正を行った。

今回のアップデートでは、プラグインインストール時にマーケットプレイスを自動追加する「--marketplace」オプションや、エージェントツールの努力量を指定できる「effort」パラメータが追加された。また、529エラー発生時のリトライ間隔を変更する環境変数や、プロンプトのオートコンプリート機能、プロンプトキャッシュなども導入されている。

セキュリティ面では、ネットワークパスからのファイル読み込み時にPreToolUseフックの承認や自動モードがバイパスされる問題などが修正された。ほかにもPDFやノートブック読み込み時のファイル不正アクセスの修正や、MCPツールのエラーハンドリング改善など多岐にわたる修正が含まれている。

## 元記事

- [Claude Code v2.1.292](<https://github.com/anthropics/claude-code/releases/tag/v2.1.292>)（Claude Code（GitHubリリース））
