---
title: "11/10 Claude CodeがAPIキーや秘密情報をGitHubに流出"
date: 2026-11-10T12:54:50+09:00
tags: ["Anthropic", "ツール", "セキュリティ"]
lead: "AnthropicのClaude Codeの設定ファイルに機密情報が保存され、パブリックリポジトリに誤って流出する事象が多見されている。"
source_name: "Ars Technica AI"
source_url: "https://arstechnica.com/ai/2026/11/claude-code-settings-files-expose-thousands-of-secrets-on-github/"
rank: 5
---

## ポイント

- Claude Codeの設定ファイルに機密情報が保存される仕様が原因でGitHubへの流出が発生した
- Apiiroの調査により63組織のパブリックリポジトリから約1100件の機密情報が発見された
- 開発元は自動モードの改善やシークレットスキャナーの導入検討を進めている

## 要約

AIセキュリティ企業のApiiroが、Anthropicの開発支援ツール「Claude Code」の設定ファイルを通じて、データベースのパスワードやAPIトークンなどの機密情報がパブリックなGitHubリポジトリに流出している事実を発見した。

ユーザーがシェルコマンド実行時の「Yes, and don’t ask again」を選択した際、ローカルの「.claude/settings.local.json」にその内容や機密情報がそのまま書き込まれることが原因である。Anthropicのドキュメントでは同ファイルがグローバルな.gitignoreに含まれるよう案内されているが、リポジトリ単位では反映されない場合があり、Claude Code自身が設定ファイルを自動コミットするケースもある。Apiiroの調査では、10万件以上の設定ファイルの中から、63組織に属する約1100件の流出事例を確認した。

AnthropicのBoris Cherny氏は、設定ファイルをGit管理に含めるべきではないと指摘しつつ、自動モードの改善やシークレットスキャナーの組み込みを検討する方針を示している。なお、Apiiroの調査では、主要なシークレットスキャナーで検知できないケースも存在した。

## 元記事

- [Claude Code is accidentally exposing secrets all over GitHub](<https://arstechnica.com/ai/2026/11/claude-code-settings-files-expose-thousands-of-secrets-on-github/>)（Ars Technica AI）
