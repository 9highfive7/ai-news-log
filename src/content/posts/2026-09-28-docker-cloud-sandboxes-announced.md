---
title: "9/28 DockerがCloud Sandboxesを発表"
date: 2026-09-28T12:00:00+09:00
tags: ["ツール"]
lead: "Dockerが、AIエージェント用のサンドボックスを動かしたまま手元とクラウドの間で移動できる「Docker Cloud Sandboxes」を発表した。"
source_name: "Publickey"
source_url: "https://www.publickey1.jp/blog/26/docker_cloud_snadboxesai.html"
rank: 1
---

## ポイント

- AIエージェント向けサンドボックスのクラウド版「Docker Cloud Sandboxes」が発表された
- ファイルシステムのキャプチャにより、作業を中断せずにローカルとクラウド間で環境を移動できる
- MicroVMベースで数百ミリ秒で起動し、インスタンスサイズに応じた従量課金制で提供される

## 要約

Docker社は、AIエージェント向けのクラウド上の隔離環境を提供する「Docker Cloud Sandboxes」を発表した。今年2月に発表されたローカル向けの「Docker Sandboxes」と組み合わせることで、稼働中の状態を維持したままローカルとクラウドの間でサンドボックスを自由に移動できるようになる。

Docker Cloud SandboxesはMicroVMを採用し、数百ミリ秒での高速起動や既存のCLIと同じ使い勝手を実現している。大規模なコーディング作業で長時間のマシン稼働が必要な場合や、多数のサブエージェントを同時に起動する際に、ローカルマシンのリソース制限や常時起動の課題を解決する。

料金は従量課金制となっており、最小のMicroインスタンスが1時間あたり0.07ドル、最大のXLインスタンスが1.12ドルで提供される。また、現在新規申し込み者に対して250ドルの無料クレジットが提供されている。

## 元記事

- [「Docker Cloud Sandboxes」発表、AIエージェント向けサンドボックスをローカルとクラウド間で自由に移動可能に](<https://www.publickey1.jp/blog/26/docker_cloud_snadboxesai.html>)（Publickey）
