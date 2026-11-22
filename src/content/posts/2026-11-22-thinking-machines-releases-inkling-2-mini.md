---
title: "11/22 Thinking Machinesが新モデルを公開"
date: 2026-11-22T10:50:47+09:00
tags: ["研究", "ツール"]
lead: "Thinking Machinesが、内部ループで推論を行うオープンな新型トランスフォーマーモデル「Inkling 2 Mini」を公開した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/new-open-model-inkling-2-mini-thinks-in-loops-to-solve-problems-with-fewer-words-and-still-runs-on-a-laptop/"
rank: 5
---

## ポイント

- 24層のうち12層を3回実行するループ構造を採用
- 264億パラメータでテキストと画像を処理
- MacやDGX Sparkでローカル実行が可能

## 要約

Thinking Machinesは、層を繰り返し実行するループ型トランスフォーマーモデル「Inkling 2 Mini」を公開した。全24層のうち12層を3回連続で処理することで、テキストを追加生成せずに内部でより長く推論し、より少ないトークンで回答を導き出す仕組みを採用している。

総パラメータ数は264億で、ループにより1トークンあたり54億が有効稼働する。テキストと画像処理に対応し、コンテキストウィンドウは100万トークンである。エージェント型コーディングテストにおいて100億パラメータ未満のオープンモデルで最高性能を記録し、Artificial AnalysisのIntelligence IndexではQwen3.8 27Bと同等のスコアを約6分の1のコストと4倍の速度で達成した。

Apache 2.0ライセンスの下で提供されており、32GB以上のメモリを搭載したMacやNvidiaのDGX Sparkでローカル実行が可能である。モデルの重みと可変ループを持つ研究用バージョンがHugging Faceで公開されているほか、Tinker Playgroundでの試用にも対応している。

## 元記事

- [New open model Inkling 2 Mini thinks in loops to solve problems with fewer words and still runs on a laptop](<https://the-decoder.com/new-open-model-inkling-2-mini-thinks-in-loops-to-solve-problems-with-fewer-words-and-still-runs-on-a-laptop/>)（The Decoder）
