---
title: "11/26 AnthropicがMessages APIをRustへ移植"
date: 2026-11-26T12:51:59+09:00
tags: ["Anthropic", "ツール", "研究"]
lead: "AnthropicがClaudeを活用してMessages APIをPythonからRustへ全面移植し、CPU使用率を約70％削減することに成功した。"
source_name: "GIGAZINE"
source_url: "https://gigazine.net/news/20261126-anthropic-claude-api-rust/"
rank: 1
---

## ポイント

- Messages APIをPythonからRustへ全面移植
- Claudeを活用して自動修正と検証の仕組みを構築
- CPU使用率が約70％減少し処理性能が向上

## 要約

Anthropicは、外部向けに提供する「Messages API」をPythonからRustへ全面移植したことを発表した。機能の追加に伴う処理負荷の増大やトラフィックの急増に対処するための措置である。

当初は一部の処理のみを書き換える手法を試したがシステムが複雑化したため、Claudeを用いて全面移植を実施した。稼働中のPython版を正解の基準とする検証の仕組みを構築し、不具合の修正と検証をClaudeに自動化させることで移行を進めた。

その結果、リクエスト当たりのCPU使用量が約70％減少したほか、メモリ使用量も80％以上削減された。さらに、開発ツール利用時の応答速度も向上している。

## 元記事

- [AnthropicがClaudeを使って自社APIをPythonからRustに移植しCPU使用量を約70％削減した方法を公開](<https://gigazine.net/news/20261126-anthropic-claude-api-rust/>)（GIGAZINE）
