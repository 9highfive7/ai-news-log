---
title: "11/4 AnthropicがMessages APIにスレッド機能を追加"
date: 2026-11-04T10:47:28+09:00
tags: ["Anthropic", "ツール"]
lead: "AnthropicはMessages API向けにMessage Threadsを公開ベータとしてリリースし、長文会話の処理速度を改善した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/anthropics-message-threads-cut-time-to-first-token-by-35-percent-for-long-conversations/"
rank: 5
---

## ポイント

- Messages APIで会話の差分のみを送信するMessage Threads機能がパブリックベータとして公開された
- 50万から100万トークンのリクエストで最初のトークン出力までの時間が約35パーセント短縮される
- スレッドはメモリ上で暗号化され、5分間の非アクティブ状態で失効する仕様となっている

## 要約

Anthropicは、ClaudeプラットフォームのMessages APIにおいて、会話の変更差分のみを送信する「Message Threads」機能をパブリックベータとして公開した。

これまでのAPIリクエストでは毎回全会話履歴を再送信する必要があったが、新機能の導入により、50万から100万トークン規模のリクエストにおいて最初のトークン出力までの時間が約35パーセント短縮される。スレッドはリクエスト間でメモリ上に暗号化された状態で保持され、5分間の非アクティブ状態で期限切れとなる。

Claudeが引き続き全会話履歴を読み取るためトークン使用量自体は変わらない。本機能はClaudeプラットフォームのほか、AWS、Microsoft Foundry、Google Cloud経由でも利用可能となっている。

## 元記事

- [Anthropic's Message Threads cut time to first token by 35 percent for long conversations](<https://the-decoder.com/anthropics-message-threads-cut-time-to-first-token-by-35-percent-for-long-conversations/>)（The Decoder）
