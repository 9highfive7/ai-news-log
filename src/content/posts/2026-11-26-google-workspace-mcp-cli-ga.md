---
title: "11/26 GoogleがWorkspaceのMCPを正式版に"
date: 2026-11-26T12:51:59+09:00
tags: ["Google", "ツール"]
lead: "Googleは、AIエージェントによるGoogle Workspace操作を可能にするMCPサーバとCLIの正式版を発表した。"
source_name: "Publickey"
source_url: "https://www.publickey1.jp/blog/26/google_workspace_mcpgoogle_workspace_cli.html"
rank: 3
---

## ポイント

- Google WorkspaceのMCPサーバとCLIが正式版としてリリースされた
- GmailやDriveなどの各サービスにAIエージェントから効率的なアクセスが可能となる
- Restful APIによるアクセスは2027年2月までにMCPへ移行することが求められる

## 要約

Googleは、AIエージェントがGoogle Workspaceを操作するための「Google Workspace MCP Server」および「Google Workspace CLI」を正式版としてリリースした。

Workspace MCPサーバはマネージドサービスとして提供され、GmailやGoogle Drive、Google Docsなどの各サービスにAIエージェントから接続できる。また、Workspace CLIを用いることで、ユーザーやAIエージェントのローカルマシン環境からコマンドライン経由で各サービスへアクセスが可能となる。従来のRestful APIと比較してトークン効率に優れており、ユーザー確認機能や監査ログを備える。

新規のパーソナルモード設定により、エンタープライズプランや課金カードなしで1クリックでのセットアップに対応する。無料枠として各製品あたり1日5000リクエストが利用可能であり、Google Keepの対応も予定されている。なお、AIエージェントからのGoogle WorkspaceアクセスはMCPへ移行する方針が示されており、Restful APIを利用している場合は2027年2月までに切り替える必要がある。

## 元記事

- [「Google Workspace MCPサーバ」と「Google Workspace CLI」が正式版としてリリース](<https://www.publickey1.jp/blog/26/google_workspace_mcpgoogle_workspace_cli.html>)（Publickey）
