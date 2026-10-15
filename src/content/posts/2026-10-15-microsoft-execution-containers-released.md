---
title: "10/15 マイクロソフトがAIエージェント向け隔離環境MXCをリリース"
date: 2026-10-15T09:13:23+09:00
tags: ["Microsoft", "セキュリティ", "ツール"]
lead: "マイクロソフトはOS上で自律型AIを保護する隔離環境「Microsoft Execution Containers」の提供を開始した。"
source_name: "Publickey"
source_url: "https://www.publickey1.jp/blog/26/windowsaimicrosoft_execution_containersmxc.html"
rank: 1
---

## ポイント

- Windows 11環境でAIの動作を安全に制限するMXCが正式公開された
- 用途に応じてプロセス分離やセッション隔離など4つのバックエンドを選べる
- ファイルやネットワークのアクセス制御をポリシーで強制できる

## 要約

マイクロソフトはWindows 11を対象として、自律的に動作するAIプログラムを安全に稼働させるための専用コンテナ基盤「Microsoft Execution Containers」（MXC）を一般提供した。この仕組みにより、AIが触れるファイルや通信先を制限しながら、人間の操作との混同を防いで動作状況を監視することが可能になる。

隔離の仕組みとしては、AppContainerを用いた軽量なプロセス分離から、ユーザーアカウントを完全に分けるセッションコンテナ、WSLコンテナ、さらにハードウェアレイヤーでのMicroVMに至るまで、多様なバックエンドが用意されている。それぞれの環境において、アクセス権限に関するポリシーを動的に適用できる。

今後はWindows Intuneを介した組織的なポリシー管理にも対応する見込みである。発表時点ですでにOpenClawやAnthropic Claude Codeといった複数の主要なエージェントが対応を表明している。

## 元記事

- [Windows上でAIエージェントの実行を安全に隔離する「Microsoft Execution Containers」（MXC）正式リリース。ファイルやネットワークなどの境界を柔軟にカスタマイズ](<https://www.publickey1.jp/blog/26/windowsaimicrosoft_execution_containersmxc.html>)（Publickey）
