---
title: "10/5 Google、AIエージェントの過学習を防ぐ新手法を発表"
date: 2026-10-05T09:20:59+09:00
tags: ["Google", "研究"]
lead: "Googleの研究チームが、自己改善型AIエージェントのテスト過学習を防ぎ、未知のタスクでの性能を向上させる新手法「RRSI」を発表した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/google-researchers-find-a-way-to-keep-self-improving-ai-agents-from-memorizing-their-tests/"
rank: 2
---

## ポイント

- Googleが自己改善型AIエージェントの過学習を防ぐ新手法「RRSI」を発表した
- 変更予算の縮小と厳格な批評により、未知のタスクでのスコアが最大4.7ポイント向上した
- モデルの重みを変更せず、実行時のトークン消費量を約30パーセント削減することに成功した

## 要約

Google Cloud AI Researchなどの研究チームが、AIエージェントの自己最適化におけるテストタスクの過学習を防ぐ新手法「RRSI（Regularized Recursive Self-Improvement of Agent Harnesses）」を発表した。

RRSIは最適化ループの両端を制御することで、テスト環境の書き換えを制限する。変更可能な回数を示す予算を徐々に縮小させ、タスク名や解法をハードコードするような変更を厳しく排除する仕組みを取り入れている。これにより、モデル自体の重みを変更することなく、未知のベンチマークにおいて最大4.7ポイントのスコア向上を実現し、実行時のトークン消費量も約30パーセント削減した。

検証はコーディングや事務作業などの8つのベンチマークを用いて行われ、学習用タスクでの過剰なスコア上昇を抑えつつ、未知のタスクに対する汎用性を高めることに成功している。また、あるモデルで最適化されたハーネスは、より小規模なモデルの精度向上にも寄与することが確認されている。

## 元記事

- [Google researchers find a way to keep self-improving AI agents from memorizing their tests](<https://the-decoder.com/google-researchers-find-a-way-to-keep-self-improving-ai-agents-from-memorizing-their-tests/>)（The Decoder）
