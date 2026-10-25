---
title: "10/26 Proof of Humanがボット検出システムの性能を比較"
date: 2026-10-26T08:41:49+09:00
tags: ["セキュリティ", "研究"]
lead: "Proof of Humanが5種類のボット検出システムを対象に、AIエージェントとボットに対する検出性能を比較する試験結果を公開した。"
source_name: "GIGAZINE"
source_url: "https://gigazine.net/news/20261026-ai-bot-detection-benchmark/"
rank: 3
---

## ポイント

- Proof of Humanが5種類のボット検出システムの検証結果を公表した
- hCaptchaやCloudflare Turnstileは自動プログラムを高率で捉える一方でAIエージェントの大部分を許した
- reCAPTCHA v3はAIエージェントの操作を多く捉えたが偽装された自動操作は検知できなかった

## 要約

ボット検出システムを手がけるProof of Humanが、自社製品やreCAPTCHA v3など5つのシステムを評価した検証結果を明らかにした。

検証では3種類のAIエージェントと2パターンのボットにブラウザを操作させ、それぞれの検知精度を測っている。その結果、hCaptchaやCloudflare Turnstileは従来の自動プログラムに対しては高い検知力を示したものの、画面を自ら判断して動くAIエージェントの操作の大半を捉えきれなかった。中でもCloudflare TurnstileはすべてのAIエージェントの動作を検知できなかった。一方でreCAPTCHA v3はAIエージェントの操作を高確率で見抜いたが、ブラウザ情報を偽装した自動操作の検知には失敗している。全テストを通じた総合的な検知率ではProof of Humanが最も高い数値となった。

なお、今回の検証では人間を誤ってボットと判定するケースについての調査は含まれておらず、今後は実際の人間を交えた検証が求められるとしている。

## 元記事

- [AIエージェントによる操作の多くがボット検出システムのhCaptchaやCloudflare Turnstileを通過](<https://gigazine.net/news/20261026-ai-bot-detection-benchmark/>)（GIGAZINE）
