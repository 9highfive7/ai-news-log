---
title: "11/28 GoogleがAIエージェントのAPI直接アクセスを制限"
date: 2026-11-28T12:39:55+09:00
tags: ["Google", "ツール", "セキュリティ"]
lead: "Googleは、AIエージェントによるGmailやGoogleドライブへのアクセスに公式MCPサーバーなどの使用を義務付ける方針を発表した。"
source_name: "GIGAZINE"
source_url: "https://gigazine.net/news/20261127-google-workspace-ai-tools-mcp/"
rank: 1
---

## ポイント

- 2027年2月1日からWorkspaceへのAIアクセスにMCPサーバーやCLIが必須化される
- 直接APIアクセスを利用するAIエージェントは利用上限が無料プラン水準に制限される
- 重要な処理を行う前に人間による確認を挟む設計となっている

## 要約

Googleは、AIエージェントがGmailやGoogleドライブといったWorkspaceサービスへ接続する際、公式のMCPサーバーやGoogle Workspace CLIを用いるよう求める方針を明らかにした。2027年2月1日以降、従来のAPIへ直接アクセスするAIエージェントは、有料プランであっても無料プランと同等の水準まで利用上限が絞られる。

MCPはAIと外部ツールをつなぐ共通規格であり、Googleが提供する専用サーバーを経由させることで、管理者はAIの動作を制限したり重要処理へのユーザー承認を挟んだりできる。一時はメール送信機能などがパートナー限定とされていたが、その後のドキュメント改定で一般開発者向けとしても記載されている。

既存の非AIアプリケーションへの影響はなく、自律型AIツールによる勝手な外部送信や誤操作を防ぎ、人間が最終判断を下せる環境を整えるための安全対策として導入される仕様となっている。

## 元記事

- [GoogleがAIエージェントによるGmailなどへのAPI直接アクセスを制限へ、MCPサーバーかCLIの使用を要求](<https://gigazine.net/news/20261127-google-workspace-ai-tools-mcp/>)（GIGAZINE）
