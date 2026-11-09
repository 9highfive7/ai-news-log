---
title: "11/9 実世界テストでAIコーディングの課題が判明"
date: 2026-11-09T10:20:45+09:00
tags: ["研究", "ツール"]
lead: "アリババなどの研究チームが実世界の問題を用いたコーディングAIの評価ベンチマークを公開し、最高性能のモデルでも全自動でのクリア率は約26%にとどまることが分かった。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/ai-coding-agents-still-need-human-cleanup-on-nearly-three-out-of-four-tasks-in-a-real-world-test/"
rank: 3
---

## ポイント

- 最高性能のモデルでも実世界タスクの完全解決は26.4%
- 複数種類の変更が絡むタスクで性能が大きく低下
- モデルの性能評価は作業環境によっても変動

## 要約

アリババおよびアジア複数の大学の研究チームが、実際のユーザーからの修正依頼をベースにしたコーディングAI向けの新しいベンチマーク「Co-Design Bench」を開発した。既存のベンチマークで多くのモデルが99%以上の高得点を記録する一方、この新しいテストでは、最高性能とされる「GPT-6 Astra」でもすべての要件を完全に満たせたのは26.4%のタスクのみであった。

テストでは、画像や音声なども入力として既存のウェブアプリを改修するタスクが課され、レイアウトやデザイン、コンテンツなど複数の変更が組み合わさるほどモデルの性能が低下することが確認された。また、コードの読み書きや実行を行う作業環境（ハーネス）の違いによってもモデルのスコアや優劣が変動するため、モデル単体だけでなく環境を含めた評価が重要であると指摘されている。

今回のテストは、ユーザーからの追加の質問や作業途中の修正などは対象外となっている。従来のベンチマークスコアと実世界での有用性には乖離があり、実際のプロジェクトにおいて人間による修正や確認が依然として不可欠であることを示している。

## 元記事

- [AI coding agents still need human cleanup on nearly three out of four tasks in a real-world test](<https://the-decoder.com/ai-coding-agents-still-need-human-cleanup-on-nearly-three-out-of-four-tasks-in-a-real-world-test/>)（The Decoder）
