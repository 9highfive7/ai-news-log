---
title: "10/2 DeepSeekがHuawei向けAI開発ツールを公開"
date: 2026-10-02T12:01:32+09:00
tags: ["ツール"]
lead: "DeepSeekがHuaweiと組み、AIチップ「Ascend」向けのプログラミング環境「TileLang」など6つの開発ツールをオープンソースで公開した。"
source_name: "GIGAZINE"
source_url: "https://gigazine.net/news/20261001-deepseek-huawei-ascend/"
rank: 5
---

## ポイント

- DeepSeekがHuaweiのAscendチップ向けAI開発ツールをオープンソースで公開した
- CUDAより簡潔に記述できるプログラミング言語TileLangなどがAscendに対応した
- NVIDIA製GPUからHuawei製アクセラレーターへの移行を促進する狙いがある

## 要約

中国のDeepSeekはHuaweiと協力し、Huawei製AIアクセラレーター「Ascend」向けのプログラミング基盤や開発ツールなど6つのソフトウェアをオープンソースで公開した。NVIDIAのCUDAに対する依存度を低減し、ハードウェア性能を引き出すことを狙いとしている。

公開されたツールには、高性能カーネルを簡潔に記述できるドメイン固有言語「TileLang」をはじめ、行列演算ライブラリ「DeepGEMM Ascend」、多ノード間の通信を高速化する「DeepEP Ascend」などが含まれる。また、アテンション処理を高速化する「FlashMLA」やTopK処理向けの「DeepSelect」もAscend NPUに対応し、一部の処理では理論性能の95％に達すると報告されている。

両社は「Ascend 950」を128基搭載するスーパーノード向けの最適化にも取り組んでいる。TileLangなどのツール群は複数の実行環境に対応しており、実行時にNVIDIA GPUとHuawei NPUを自動判定して同じPython APIを利用できる仕様となっている。

## 元記事

- [DeepSeekがHuaweiと提携しAscend向け「TileLang」など6つのAI開発ツールをオープンソースで公開、NVIDIAのCUDA依存低減を狙う](<https://gigazine.net/news/20261001-deepseek-huawei-ascend/>)（GIGAZINE）
