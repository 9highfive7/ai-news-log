---
title: "10/16 AnthropicがPython SDKのv1.15.0を公開"
date: 2026-10-16T08:59:40+09:00
tags: ["Anthropic", "ツール"]
lead: "AnthropicはPython SDKのv1.15.0をリリースし、モデル機能の拡張や速度調整パラメータの追加などのアップデートを実施した。"
source_name: "Anthropic SDK（GitHubリリース）"
source_url: "https://github.com/anthropics/anthropic-sdk-python/releases/tag/v1.15.0"
rank: 3
---

## ポイント

- Messages APIにspeedパラメータとusage.speedを追加
- モデル機能のthinkingタイプにbetween_toolsを拡張
- 一部モデルの利用にはベータヘッダーが必要

## 要約

AnthropicはPython SDKのv1.15.0を公開し、Messages APIへの速度制御パラメータ追加やモデル機能APIへの仕様追加を行った。

具体的には、Messages APIにspeedパラメータとusage.speedが追加され、モデル機能のthinkingタイプにbetween_toolsが導入された。また、Console組織の利用枠上限を読み取り専用の支出制限として返却する機能も実装されている。

一部のモデルでspeedパラメータを利用する際にはベータヘッダーが必要となるほか、Managed Agentsやテレメトリーエンドポイントに関するドキュメントの記述も更新された。

## 元記事

- [Anthropic Python SDK v1.15.0](<https://github.com/anthropics/anthropic-sdk-python/releases/tag/v1.15.0>)（Anthropic SDK（GitHubリリース））
