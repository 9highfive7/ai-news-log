---
title: "10/19 AIの長期計画能力を測る新ベンチマーク"
date: 2026-10-19T08:50:19+09:00
tags: ["Microsoft", "研究", "ツール"]
lead: "マイクロソフトと香港城市大学が、AIエージェントの長期的な意思決定能力を評価する新しいベンチマーク「Taste-Bench」を開発した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/ai-agents-have-bad-taste-in-long-term-decisions-and-a-new-benchmark-proves-it/"
rank: 4
---

## ポイント

- AIエージェントの長期的な意思決定能力を測るTaste-Benchが公開された
- 最高性能のモデルでも分岐点での選択の正答率は6割に満たなかった
- 教師モデルの知識を蒸留することでAIの選択精度やタスク成功率が向上した

## 要約

マイクロソフトと香港城市大学の研究チームは、AIエージェントが長期にわたるタスクで戦略的な選択を行う能力を評価するベンチマーク「Taste-Bench」を構築した。従来のベンチマークは最終的な成果物のみを評価していたが、同手法ではタスク途中の分岐点における判断力を評価する。

テストの結果、Claude、GPT、Grok、DeepSeekなどの14モデルの中で、最高性能を記録したGPT-5.6 Solでも正答率は59.7%にとどまった。将来のヒントが隠された分岐点では精度が最大21%まで低下し、思考時間を増やしても精度は向上しなかった。また、教師モデルの判断力を学習させた生徒モデルを導入することで、未見のタスクにおけるエージェントの成功率が向上することが確認された。

「Taste-Bench」のコードとベンチマークデータは一般に公開されている。

## 元記事

- [AI agents have bad taste in long-term decisions and a new benchmark proves it](<https://the-decoder.com/ai-agents-have-bad-taste-in-long-term-decisions-and-a-new-benchmark-proves-it/>)（The Decoder）
