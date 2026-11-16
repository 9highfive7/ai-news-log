---
title: "11/16 AnthropicのClaude Fable 5.2が描画を実行"
date: 2026-11-16T10:30:07+09:00
tags: ["Anthropic", "研究", "ツール"]
lead: "Anthropicの新モデルClaude Fable 5.2が、Pythonコードを用いて仮想キャンバス上にブラシストロークを配置する画像生成機能を発表した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/anthropics-claude-fable-5-2-doesnt-generate-images-it-paints-them/"
rank: 2
---

## ポイント

- 仮想キャンバスへのPythonコードによる描画プロセスを採用
- 手ブレや失敗の上描きなど物理的な絵画制作をシミュレート
- ロボットアームの制御テストでは微細な動作に課題を残す

## 要約

Anthropicは、新しい言語モデル「Claude Fable 5.2」を発表した。このモデルは画素を直接計算するのではなく、物理的な筆の質感をシミュレートするPythonコードを記述して、仮想キャンバス上に数多くのブラシストロークを配置することで画像を生成する。

従来の拡散モデルとは異なり、モデルは1,000から2,000行のプログラムで描画エンジンを駆動し、手ブレの再現や失敗した箇所の上描きといった実際の絵画制作プロセスを模倣する。駐車場や鳥を描いたデモでは、数百本の座標配列や約70万回のストロークが使用された。

また、内部のロボットシミュレーションベンチマークではOpenAIのモデルを上回るスコアを記録した一方で、実世界のロボットアームを用いたテストでは細かい動作制御に課題が残るなど、空間推論能力の限界も示されている。

## 元記事

- [Anthropic's Claude Fable 5.2 doesn't generate images, it paints them](<https://the-decoder.com/anthropics-claude-fable-5-2-doesnt-generate-images-it-paints-them/>)（The Decoder）
