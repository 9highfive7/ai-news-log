---
title: "10/4 AnthropicがClaude CodeのMods公開"
date: 2026-10-04T09:17:00+09:00
tags: ["Anthropic", "ツール"]
lead: "Anthropicは、AIコーディングツール内部で動作するプラグインシステム「Mods」の提供を開始した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/claude-codes-new-mods-system-lets-developers-rewrite-the-ai-coding-tool-from-the-inside/"
rank: 1
---

## ポイント

- JavaScriptやTypeScriptでClaude Codeの動作をカスタマイズ可能
- CLIやデスクトップアプリなどで動作し独自のパネルやコマンドを追加できる
- サンドボックス非対応のため信頼できるソースからの導入が推奨される

## 要約

Anthropicは、AIコーディングツール「Claude Code」に向けて、ツール内部で直接動作するミドルウェア「Mods」を発表した。プラグイン形式のシステムにより、JavaScriptやTypeScriptを用いてインターフェースや動作をカスタマイズできる。

Mods機能を利用することで、チャット画面の横へのカスタムパネルの追加、ツール呼び出しの傍受、独自のコマンドの作成などが可能になる。公式のビルトイン機能である「/diff」コマンドなどもこのシステムで構築されており、出力内容を監視する別エージェントを実行する公式プラグイン「You Should Know」も用意されている。

このシステムはCLI、デスクトップアプリ、およびVS Code拡張機能の一部で動作する。サンドボックス環境ではなくユーザー権限で実行されるため、公式は信頼できるソースからのインストールを推奨しており、組織側で読み込みを制御することも可能となっている。

## 元記事

- [Claude Code's new Mods system lets developers rewrite the AI coding tool from the inside](<https://the-decoder.com/claude-codes-new-mods-system-lets-developers-rewrite-the-ai-coding-tool-from-the-inside/>)（The Decoder）
