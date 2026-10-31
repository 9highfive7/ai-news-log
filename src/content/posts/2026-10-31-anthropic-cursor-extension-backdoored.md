---
title: "10/31 Anthropic公式のCursor用拡張機能が改ざん被害"
date: 2026-10-31T10:18:35+09:00
tags: ["Anthropic", "セキュリティ", "ツール"]
lead: "Cursor向けのAnthropic製拡張機能に不正なコードが混入し、最大5000の開発者環境が脅威にさらされた。"
source_name: "Ars Technica AI"
source_url: "https://arstechnica.com/security/2026/10/anthropic-vs-code-extension-on-cursor-backdoored-for-nearly-12-hours/"
rank: 1
---

## ポイント

- CursorのAnthropic公式拡張機能に悪意あるバージョンが約12時間混入した
- 最大5000人の開発者端末でホスト情報収集やSSHバックドア設置が試みられた
- 両社から侵入経路の詳細や顧客への公式な注意喚起は行われていない

## 要約

AI開発ツール「Cursor」のマーケットプレイスで配信されていたAnthropicの公式VS Code拡張機能に、不正なバックドアが仕込まれた状態で約12時間にわたり配信された。

該当するバージョン2.1.313では、ホスト情報や環境変数の収集、SSHバックドアの設置、リバースSSHトネルの構築などが試みられ、最大5000人のユーザーが影響を受けたとみられる。コードの不具合により一部の機能は失敗したものの、クラウド認証情報やAPIトークンの流出につながる危険性があった。

Cursor側は該当バージョンの削除やサーバーの遮断などの対応を実施した。現在もAnthropicからの公式な警告や、攻撃者がアカウントへ侵入した手口についての説明は行われていない。

## 元記事

- [Anthropic VS code extension on Cursor backdoored for nearly 12 hours](<https://arstechnica.com/security/2026/10/anthropic-vs-code-extension-on-cursor-backdoored-for-nearly-12-hours/>)（Ars Technica AI）
