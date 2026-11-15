---
title: "11/15 Runwayがロボット制御モデルPraxis-1を公開"
date: 2026-11-15T10:27:58+09:00
tags: ["研究", "ツール"]
lead: "Runwayは映像学習を活用したロボット制御AIモデル「Praxis-1」の重みとソースコードをオープンソースで公開した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/runways-open-source-praxis-1-turns-video-ai-into-a-robot-controller/"
rank: 2
---

## ポイント

- Apache 2.0ライセンスでモデルの重みとソースコードが公開された
- NvidiaのRoboLab-120ベンチマークで高いスコアを記録した
- 複雑な連続動作の自律的な計画にはまだ対応していない

## 要約

Runwayは、カメラ画像やテキスト指示、位置情報からロボットの動きを計算するロボット制御モデル「Praxis-1」をApache 2.0ライセンスで公開した。同モデルはビデオ学習の成果を基盤としており、NvidiaのRoboLab-120ベンチマークのワールドアクションモデル部門で最高スコアを記録している。

モデルの利用にはApache 2.0ライセンスが適用され、標準バージョンには80GBのVRAMを搭載したGPUが必要となる。ただし、現時点では類似した形状のオブジェクトを混同することがあり、複雑な一連のアクションを自律的に計画する機能は備わっていない。

## 元記事

- [Runway's open-source Praxis-1 turns video AI into a robot controller](<https://the-decoder.com/runways-open-source-praxis-1-turns-video-ai-into-a-robot-controller/>)（The Decoder）
