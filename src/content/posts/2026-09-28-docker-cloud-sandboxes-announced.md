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

- 手元の端末とクラウドの間でサンドボックスを動かしたまま移動できる
- 長時間のAI処理や大規模なマルチエージェントの実行に対応
- MicroVMベースの軽量な設計で素早く起動する

## 要約

Dockerは、AIエージェントの実行に特化したクラウド上の隔離環境「Docker Cloud Sandboxes」を発表した。すでに提供している手元の端末向けのサンドボックスと連携し、動作中の状態を保ったまま手元とクラウドの間で行き来させられる。

これにより、数時間以上かかるコーディング処理や、多数のサブエージェントを動かす大規模な処理でも、端末の電源や性能に縛られずに作業を続けられる。料金は使った分だけの従量課金で、処理の規模に応じてインスタンスを選べる。

## 業務への影響

長時間のAIコーディング作業を手元のマシンの稼働状況から切り離せるため、バックグラウンドでの大規模処理やマルチエージェント開発がしやすくなる。インフラ管理の手間を抑えながら、用途に応じてリソースを柔軟に割り当てられる。

## 元記事

- [「Docker Cloud Sandboxes」発表、AIエージェント向けサンドボックスをローカルとクラウド間で自由に移動可能に](<https://www.publickey1.jp/blog/26/docker_cloud_snadboxesai.html>)（Publickey）
