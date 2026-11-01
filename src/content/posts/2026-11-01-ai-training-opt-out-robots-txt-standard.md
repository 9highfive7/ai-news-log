---
title: "11/1 OpenAIやGoogleなどがAI学習拒否の共通化へ対応"
date: 2026-11-01T09:35:36+09:00
tags: ["OpenAI", "Google"]
lead: "主要なAI企業が、WebサイトのAI学習利用拒否をrobots.txtで一括指定できる共通の仕組みへの対応を表明した。"
source_name: "ITmedia AI+"
source_url: "https://www.itmedia.co.jp/news/article/2611/01/2000002776/"
rank: 3
---

## ポイント

- robots.txtの専用トークンで複数企業のAI学習を一括制限
- OpenAIやGoogleなどが対応を表明し順次導入へ
- データ収集の遮断とは異なり、学習用途に特化した制御が可能

## 要約

OpenAIやGoogle、Microsoftなどの主要AI企業が、管理者がAIモデルの訓練に自サイトのデータを使わせないようまとめて意思表示できる共通の仕組みを導入すると発表した。Anthropicも同様の実装を進めている。

この方式はIETFへのドラフト提出に基づいており、robots.txtの記述だけで複数社に対してデータ活用の許可や拒否を一度に指示できるようになる。クロールそのものを禁止する従来の仕組みとは異なり、あくまで生成AIのトレーニング用途の制限を目的としている。

対応時期は各社で異なり、OpenAIは数カ月以内、GoogleやMicrosoftは2027年を予定している。Microsoftはページ単位の設定や独自の検索参照制限も合わせて導入する方針を示している。

## 元記事

- [AI学習への利用拒否をrobots.txtで一括指定へ OpenAIやGoogleなどが対応表明](<https://www.itmedia.co.jp/news/article/2611/01/2000002776/>)（ITmedia AI+）
