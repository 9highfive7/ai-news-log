---
title: "11/10 GoogleがAIエージェント向け基盤をCNCFに寄贈"
date: 2026-11-10T12:54:50+09:00
tags: ["Google", "ツール"]
lead: "Googleは、Kubernetes上でAIエージェントを高密度に実行する基盤ソフトウェアをCNCFへ寄贈した。"
source_name: "Publickey"
source_url: "https://www.publickey1.jp/blog/26/googlekubernetes10aiagent_sustrategvisorcncf.html"
rank: 4
---

## ポイント

- GoogleがAgent SubstrateとgVisorをCNCFへ寄贈
- 待機状態の退避と高速復元により10倍の実行密度を達成
- Google CloudのGKEでも正式サービスとして利用可能

## 要約

Googleは、Kubernetes環境においてAIエージェントを効率よく稼働させるための技術である「Agent Substrate」と「gVisor」を、Cloud Native Computing Foundationへ提供すると公表した。AIエージェントは稼働時間の大部分をモデルの応答待ちなどで費やすため、従来のKubernetes運用ではコンピューティング資源が無駄に消費されるという課題があった。

今回寄贈されたAgent Substrateは、ワーカープールのスロットにエージェントの状態を割り当て、待機状態になった際にはスナップショットとして高速ストレージに退避させる仕組みを持つ。再開時も即座にメモリ状態を復元できるため、コールドスタートの遅延を防ぎながら従来比で10倍の高密度稼働を実現する。さらに、コードの安全な実行環境としてgVisorが組み合わされている。

この寄贈により、特定のベンダに依存しない共通の基盤としてクラウドネイティブコミュニティでの普及が見込まれる。これと並行して、Google CloudのGKE上でも同基盤の商用サービス提供が開始されている。

## 元記事

- [Google、Kubernetesで10倍高密度にAIエージェントを実行可能にする「Agent Sustrate」と「gVisor」、オープンソースとしてCNCFに寄贈と発表](<https://www.publickey1.jp/blog/26/googlekubernetes10aiagent_sustrategvisorcncf.html>)（Publickey）
