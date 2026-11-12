---
title: "11/12 Grokで作られた多数のアプリでデータが外部に露出"
date: 2026-11-12T11:38:06+09:00
tags: ["セキュリティ", "ツール"]
lead: "セキュリティ企業Clarocの調査により、AIアシスタントGrokで作成されたアプリの約95%がログイン不要で誰からでもアクセス可能な状態だったことが判明した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/grok-built-apps-exposed-patient-data-plaintext-passwords-and-spacexsis-own-sales-pipeline/"
rank: 5
---

## ポイント

- Grok製アプリの約95%がログイン不要で外部からアクセス可能だった
- 患者データや平文のパスワード、企業の内部機密文書が露出した
- 公開設定のデフォルトが原因とされ、一部を除き未対応のままとなっている

## 要約

セキュリティ企業のClarocが調査した結果、AIアシスタントのGrokで構築された3万7,000件以上のWebアプリのうち、約95%にあたる3万5,578件がログイン不要で誰からでもアクセスできる状態にあったことが明らかになった。原因として、公開設定のデフォルトで「リンクを知っている全員」が事前に選択されていたことや、容易に特定可能なサブドメインの仕様が挙げられている。

露出したデータには、医療機関の患者データや勤務シフト表、平文のパスワードのほか、開発元であるSpaceXSIやXの内部機密文書が含まれていた。また、認証コードの不備により、外部のアカウントがチームに参加してデータを編集・削除できるケースも確認されている。

SpaceXSIは従業員が作成した24件のアプリをオフラインにしたものの、他のユーザーが作成した公開状態のアプリに対しては対応を行っていない。Clarocは同社に対し、デフォルト設定の変更や警告機能の追加を提案している。

## 元記事

- [Grok-built apps exposed patient data, plaintext passwords, and SpaceXSI's own sales pipeline](<https://the-decoder.com/grok-built-apps-exposed-patient-data-plaintext-passwords-and-spacexsis-own-sales-pipeline/>)（The Decoder）
