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

- PostmanがAPI資格情報を直接渡さない新管理機能「Passport」の提供を開始
- 実際のAPIキーはVPC内のVaultで保持し、参照トークンや一時的権限を発行する
- AIエージェント利用時の資格情報漏えいや意図しない利用のリスクを軽減する

## 要約

Postmanは2025年9月15日、APIアクセスを管理する新サービス「Passport by Postman」の提供を開始した。AIエージェントなどが外部サービスを利用する際、従来のようにコードや設定ファイルに実際のAPIキーやシークレットを直接持たせない仕組みを実現している。

Passportでは、実際のAPIキーをVPC内のVaultで安全に保持し、開発者やAIエージェントには暗号化された参照トークンのみを渡す。これにより、AIエージェントごとのタスク範囲に限定した一時的なアクセス権限の付与や、アクセス状況の追跡が可能になる。

人間の開発者やAIエージェントがAPIを呼び出す際の資格情報の管理や漏えいリスクを軽減し、セキュアな開発環境を維持する狙いがある。

## 元記事

- [「APIキーを守る」ではなく「AIエージェントに渡さない」――Postmanが発表した新アプローチ](<https://atmarkit.itmedia.co.jp/ait/articles/2609/29/news036.html>)（@IT）
