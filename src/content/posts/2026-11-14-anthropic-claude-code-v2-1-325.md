---
title: "11/14 AnthropicがClaude Codeを更新"
date: 2026-11-14T10:55:34+09:00
tags: ["Anthropic", "ツール", "セキュリティ"]
lead: "Anthropicは開発支援ツール「Claude Code」の最新バージョンをリリースし、セキュリティ修正や多数の不具合対応を行った。"
source_name: "Claude Code（GitHubリリース）"
source_url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.325"
rank: 2
---

## ポイント

- zstd圧縮レスポンスのデコード脆弱性を修正
- 組織のポリシー制限時にリクエスト継続の案内を追加
- Jupyterノートブックに関するヒント表示機能を追加

## 要約

Anthropicは開発支援ツール「Claude Code」のアップデートとなるバージョン2.1.325を公開した。

今回の更新では、zstd圧縮されたレスポンスのデコード処理におけるセキュリティ上の脆弱性が修正された。また、組織ポリシーによるリクエスト制限時の案内追加や、VS Codeなどのターミナル向けにJupyterノートブックのセル再実行に関するヒント機能が導入されている。

さらに、Gitの保護ファイルを更新できない場合のClaudeへの通知追加や、各種コマンドおよびサブエージェントの動作安定化など、多数の不具合修正が行われている。

## 元記事

- [Claude Code v2.1.325](<https://github.com/anthropics/claude-code/releases/tag/v2.1.325>)（Claude Code（GitHubリリース））
