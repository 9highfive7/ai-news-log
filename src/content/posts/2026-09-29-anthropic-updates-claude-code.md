---
title: "9/29 Claude CodeがSonnet 5.5を既定モデルに"
date: 2026-09-29T12:00:00+09:00
tags: ["Anthropic", "ツール"]
lead: "Claude Code v2.1.284で、100万トークンに対応したSonnet 5.5が既定のモデルになり、MCPサーバーの再接続機能も加わった。"
source_name: "Claude Code（GitHubリリース）"
source_url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.284"
rank: 3
---

## ポイント

- Anthropic APIのデフォルトとしてClaude Sonnet 5.5を追加
- 作業ディレクトリ外の読み取りに対する柔軟なプロンプト選択を実装
- プロンプト長超過時の再圧縮やWindows環境での不具合など多数のバグを修正

## 要約

Anthropicは開発支援ツール「Claude Code」の最新バージョンであるv2.1.284をリリースした。Anthropic APIのデフォルトSonnetモデルとしてClaude Sonnet 5.5が追加され、100万トークンのコンテキストに対応している。

機能面では、自動モードで作業ディレクトリ外の読み取りを行う前に一時的な許可を選択できるプロンプトが追加された。また、Claude apps gatewayの利用量制限に関する表示や、MCPサーバーをまとめて再接続するコマンドが導入されている。

さらに、プロンプトの長さ制限に関する自動圧縮処理の改善や、Windows環境におけるBashツールのパス処理の不具合修正など、複数のバグ修正と安定性の向上が実施されている。

## 元記事

- [Claude Code v2.1.284](<https://github.com/anthropics/claude-code/releases/tag/v2.1.284>)（Claude Code（GitHubリリース））
