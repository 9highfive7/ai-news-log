---
title: "10/16 AnthropicがClaude Codeを更新"
date: 2026-10-16T08:59:40+09:00
tags: ["Anthropic", "ツール"]
lead: "Anthropicは開発支援ツール「Claude Code」をアップデートし、自動リトライ機能の改善やVimモードへの対応などを実施した。"
source_name: "Claude Code（GitHubリリース）"
source_url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.301"
rank: 2
---

## ポイント

- 無人リトライモードのリクエスト終了に関する新しい設定を追加
- Vimモードへの対応強化や複数行テキスト入力への対応を実施
- モデルエイリアスエラーのフォールバックやメモリ消費の不具合など多数のバグを修正

## 要約

Anthropicは開発支援ツール「Claude Code」のアップデートとなるバージョン2.1.301を公開した。

今回のアップデートでは、無人リトライモードに制限時間が遠すぎるリクエストを終了させる仕組みを追加したほか、claude-apiスキルへのOpenTelemetryトレーシングの案内や、Vimモードへの「%」モーション（対応する括弧へのジャンプ）の追加が行われた。また、ターミナル内のテキストフィールドにおける複数行入力のサポートや、OpenTelemetryのツール決定イベントへの分類情報追加なども含まれている。

さらに、Fableモデルのエイリアスに関するエラー時のフォールバック動作の改善や、ディスク容量不足時のエラーメッセージの修正、メモリ大量消費の不具合修正など、多数のバグ修正と安定性の向上が実施されている。

## 元記事

- [Claude Code v2.1.301](<https://github.com/anthropics/claude-code/releases/tag/v2.1.301>)（Claude Code（GitHubリリース））
