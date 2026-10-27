---
title: "10/27 AWSとGoogle CloudがPyTorch対応版を公開"
date: 2026-10-27T10:02:05+09:00
tags: ["Google", "ツール"]
lead: "AWSとGoogle Cloudが自社製AIプロセッサに対応するPyTorchの実行環境をオープンソースとして公開した。"
source_name: "Publickey"
source_url: "https://www.publickey1.jp/blog/26/awsgoogle_cloudpytorchaws_trainiumgoogle_cloud_tpunvidia.html"
rank: 3
---

## ポイント

- AWSがTrainium対応のTorchNeuronをパブリックベータとして公開
- Google CloudがTPU対応のTorchTPUをオープンソース化
- 標準APIとの互換性を維持しNVIDIAからの移行を容易にする

## 要約

米カリフォルニア州で開催された「PyTorch Conference 2026」において、AWSとGoogle Cloudが自社製AIプロセッサに対応するPyTorchの実行環境をオープンソースとして発表した。AWSは「TorchNeuron」をパブリックベータとして公開し、Google Cloudは「TorchTPU」を発表した。

TorchNeuronはAWS Trainiumに、TorchTPUはGoogle Cloud TPUにそれぞれ対応しており、標準的なPyTorch APIやtorch.compileとの互換性を維持しながらネイティブ実行を可能にする。これにより、コードの大幅な書き換えを行わずに独自プロセッサへの移行が容易になり、NVIDIA CUDAへの依存からの脱却を目指す。

両ツールとも以前から一部ユーザー向けに提供されていたが、今回のオープンソース化によって誰でも利用可能になった。今後は実際のワークロードでの互換性や性能が注目される。

## 元記事

- [AWSとGoogle Cloudが「PyTorch」のAWS Trainium、Google Cloud TPU対応版をオープンソースで公開。NVIDIAからの移行に挑む](<https://www.publickey1.jp/blog/26/awsgoogle_cloudpytorchaws_trainiumgoogle_cloud_tpunvidia.html>)（Publickey）
