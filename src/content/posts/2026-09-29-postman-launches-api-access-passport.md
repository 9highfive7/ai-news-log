---
title: "9/29 PostmanがAPIキーを渡さない「Passport」提供"
date: 2026-09-29T12:00:00+09:00
tags: ["ツール", "セキュリティ"]
lead: "Postmanが、開発者やAIエージェントに本物のAPIキーを渡さず、暗号化した参照トークンでAPIを呼べる「Passport by Postman」を始めた。"
source_name: "@IT"
source_url: "https://atmarkit.itmedia.co.jp/ait/articles/2609/29/news036.html"
rank: 4
---

## ポイント

- PostmanがAPIアクセスを管理する新機能「Passport by Postman」の提供を開始
- 実際のキーを渡さず、暗号化された参照トークンを使う仕組み
- タスク単位での権限設定や、API呼び出しの追跡ができる

## 要約

AIエージェントが外部システムを使う際、APIキーなどの認証情報を直接持たせると漏えいのリスクがあることが課題になっていた。

Postmanが提供を始めた「Passport by Postman」は、実際のキーをVPC内のVaultに保管し、開発者やエージェントには暗号化された参照トークンだけを渡す仕組みである。

これにより、タスク単位の一時的なアクセス権の制御や、API呼び出しの追跡ができ、外部連携を安全に行えるようにする。

## 元記事

- [「APIキーを守る」ではなく「AIエージェントに渡さない」――Postmanが発表した新アプローチ](<https://atmarkit.itmedia.co.jp/ait/articles/2609/29/news036.html>)（@IT）
