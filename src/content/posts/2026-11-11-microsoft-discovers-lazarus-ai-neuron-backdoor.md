---
title: "11/11 MicrosoftがAIの休眠ニューロンを悪用する手法を発見"
date: 2026-11-11T10:37:50+09:00
tags: ["Microsoft", "研究", "セキュリティ"]
lead: "Microsoftの研究チームが、LLMの休眠ニューロンを書き換えてバックドアを仕込む新しい攻撃手法「Lazarus」を発表した。"
source_name: "Microsoft Research Blog"
source_url: "https://www.microsoft.com/en-us/research/blog/lazare-veni-foras-reprogramming-dormant-neurons-to-backdoor-ai-agents/"
rank: 3
---

## ポイント

- 10個未満の休眠ニューロンを書き換えるだけでバックドアを構築可能
- 通常時は安全評価を通過し、特定トリガーの検知時のみ攻撃コマンドを出力
- モデルの出所管理や重みの整合性チェックによる対策が不可欠

## 要約

Microsoftの研究チームは、AIモデル内の休眠ニューロンを再プログラミングしてバックドア化する「Lazarus」という手法を発見した。

この手法では、10個未満の休眠ニューロンを書き換えることで、トレーニングを行わずにモデルへバックドアを仕込むことができる。改変されたモデルは通常の安全評価をすり抜けるが、特定の日付などのトリガーを検知すると、攻撃者のコードをダウンロードして実行するコマンドを出力する。

この脅威を防ぐためには、モデルのトレーニング時だけでなく、モデルの重みの整合性やプロバナン（出所の証明）を厳格に管理し、改変の有無を監査することが重要となる。

## 元記事

- [Lazare, veni foras: Reprogramming Dormant Neurons to Backdoor AI Agents](<https://www.microsoft.com/en-us/research/blog/lazare-veni-foras-reprogramming-dormant-neurons-to-backdoor-ai-agents/>)（Microsoft Research Blog）
