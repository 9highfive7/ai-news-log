---
title: "11/12 AWSがAIエージェント向け軽量VMの提供を開始"
date: 2026-11-12T11:38:06+09:00
tags: ["ツール", "セキュリティ"]
lead: "AWSは、AIエージェントによるコード実行向けに高い安全性を確保した軽量仮想マシン「AWS Nitro Sandboxes」の提供を開始した。"
source_name: "Publickey"
source_url: "https://www.publickey1.jp/blog/26/awsaiec2vmaws_nitro_sandboxes.html"
rank: 2
---

## ポイント

- Nitro基盤による強固な物理レベルの分離機能
- EC2と遜色ない高速な処理性能の維持
- 既存のコンテナ定義を変更せずにEKS等で活用可能

## 要約

Amazon Web Services（AWS）は、Amazon EC2上で動作する新たな軽量仮想マシン「AWS Nitro Sandboxes」の提供開始を発表した。

Nitro基盤を活用することで、物理レベルの堅牢な分離を維持しながらEC2と同等の処理速度を発揮する。Amazon ECSやEKSのPodとしてデプロイでき、既存のコンテナ資産を書き換えることなく適用できる仕様となっている。

各サンドボックスはホストや周辺のコンテナから完全に切り離されたカーネルを持ち、外部への不正な影響を遮断する設計を採用している。

## 元記事

- [AWS、AIエージェント向けに強力な隔離環境とネイティブなEC2性能を備えた軽量VM「AWS Nitro Sandboxes」提供開始](<https://www.publickey1.jp/blog/26/awsaiec2vmaws_nitro_sandboxes.html>)（Publickey）
