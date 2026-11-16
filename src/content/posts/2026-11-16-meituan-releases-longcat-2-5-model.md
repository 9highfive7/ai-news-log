---
title: "11/16 Meituanが1.6兆パラメータのAIモデルを公開"
date: 2026-11-16T10:30:07+09:00
tags: ["研究", "ツール"]
lead: "中国のMeituanが、Nvidia製GPUを使用せず中国製ハードウェアのみで学習した1.6兆パラメータのエージェントモデル「LongCat-2.5」の重みを公開した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/meituan-releases-a-1-6-trillion-parameter-agent-model-that-never-touched-an-nvidia-gpu/"
rank: 5
---

## ポイント

- Nvidia製GPUを使わず中国製ハードウェアのみで学習された1.6兆パラメータモデル
- 画像とテキストを統合処理し、APIで最大100万トークンのコンテキストに対応
- MITライセンスで公開され、Huawei製チップによるデプロイ環境が提供される

## 要約

中国の出前サービスを手がけるMeituanの開発チームは、自律型エージェント向けのマルチモーダルモデル「LongCat-2.5」の重みを公開した。Nvidia製GPUを一切使用せず、中国製ハードウェアのみで学習が行われている。

LongCat-2.5はMixture-of-Expertsアーキテクチャを採用し、総パラメータ数1.6兆のうち1トークンあたり約480億がアクティブになる仕組みである。画像、テキスト、動画を直接トークンとして処理し、API経由では最大100万トークンの入力と12,800トークンの出力に対応する。コマンドラインタスクを評価するTerminal Bench v2.1では88.4ポイントを記録し、Huawei Ascendアクセラレータ194基を用いた構成でのデプロイ例が示されている。

モデルの重みは商用利用や改変が可能なMITライセンスで公開され、専用のチャットインターフェースやAPIも提供されている。APIの料金は入力トークンが約0.27ユーロ、出力トークンが約1.07ユーロ（100万トークンあたり）に設定されている。

## 元記事

- [Meituan releases a 1.6-trillion-parameter agent model that never touched an Nvidia GPU](<https://the-decoder.com/meituan-releases-a-1-6-trillion-parameter-agent-model-that-never-touched-an-nvidia-gpu/>)（The Decoder）
