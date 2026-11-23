---
title: "11/23 安価なAI推移プロバイダが認証情報を窃取"
date: 2026-11-23T11:06:18+09:00
tags: ["セキュリティ", "研究"]
lead: "セキュリティ研究チームが、低価格なAI推移プロバイダを利用した際の情報漏えいや秘密鍵の窃取リスクを明らかにした。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/security-researchers-show-how-cheap-ai-inference-providers-steal-keys-and-snoop-on-users/"
rank: 4
---

## ポイント

- Dragosが約200万件のリクエストでAIプロバイダの脆弱性を調査
- 少なくとも3つのプロバイダで数百個のAWSキーが窃取されていた
- OpenRouterが該当するプロバイダの削除や設定の取り消しを実施

## 要約

Dragosの研究チームは、約200万件の偽の認証情報を含むAIリクエストを用いて、AIサプライチェーンの脆弱性を調査した。その結果、少なくとも3つのプロバイダが侵害されており、数百個のAWSキーが盗み出されていたことが判明した。

攻撃者はプロバイダが処理前に拒否したリクエストからもキーを収集し、S3ストレージの検索や持続的なアクセスの確立を試みていた。また、モデルのマーケットプレイスや中国のAIラボなどがプライバシー設定を無視してリクエスト内容を閲覧していた事例も確認されている。

OpenRouterはこの調査結果を受けて3つのプロバイダをプラットフォームから削除し、125のエンドポイントで「Zero Data Retention」の承認を取り消した。研究チームは、企業に対してAIリクエストのルーティング制御や、偽の認証情報を用いたカナリートークンの配置を推奨している。

## 元記事

- [Security researchers show how cheap AI inference providers steal keys and snoop on users](<https://the-decoder.com/security-researchers-show-how-cheap-ai-inference-providers-steal-keys-and-snoop-on-users/>)（The Decoder）
