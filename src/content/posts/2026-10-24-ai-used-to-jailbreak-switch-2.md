---
title: "10/24 AIを活用してNintendo Switch 2を脱獄"
date: 2026-10-24T09:10:19+09:00
tags: ["OpenAI", "セキュリティ", "研究"]
lead: "OpenAIのコーディングAIを活用し、Nintendo Switch 2のソフトウェア脆弱性を突いて非公式プログラムを実行する手法が開発された。"
source_name: "GIGAZINE"
source_url: "https://gigazine.net/news/20261023-nintendo-switch-2-jailbreak/"
rank: 1
---

## ポイント

- OpenAI Codexを活用してNintendo Switch 2の脆弱性を調査する手法が公開された
- JetKVMとSwitchBotを用いた遠隔操作環境により、AIが実機の検証作業を自動化した
- ゲームのキャラクター差し替えなどの改造が実現されたが、永続的なカスタムファームウェアの導入には未対応である

## 要約

開発者のサミー・ハジハミド氏が、OpenAIの「OpenAI Codex」を用いてNintendo Switch 2の制限を回避し、任意のコードを実行可能にする手法「ns2jb」を公開した。検証作業では、HDMI経由で映像を取得するJetKVMと、電源ボタンを遠隔操作するSwitchBotを組み合わせてAIに実機を操作させている。

CodexがブラウザエンジンのWebKitやソフト「プチコン4」の脆弱性を調査し、システムファイル「fs」の欠陥を経由して検証プログラムの動作に成功した。実証実験として専用ソフト「マリオカート ワールド」のキャラクターをAIのコーディングによって1日で書き換えるなどの改造が行われた。

ns2jbは本体の改造や専用チップの追加を必要とせず、バージョン23.0.1に対応している。ソースコードはGitLabで公開されているが、カスタムファームウェアの永続的な導入には至っておらず、PCやプチコン4などの外部環境が必要となる。

## 元記事

- [AIにNintendo Switch 2を操作させて脱獄に成功、Codexが脆弱性を発見してゲームの改造まで実現](<https://gigazine.net/news/20261023-nintendo-switch-2-jailbreak/>)（GIGAZINE）
