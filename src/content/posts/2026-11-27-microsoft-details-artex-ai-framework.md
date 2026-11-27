---
title: "11/27 MicrosoftがAIフレームワークARTEXの脅威を分析"
date: 2026-11-27T12:53:46+09:00
tags: ["Microsoft", "セキュリティ", "ツール"]
lead: "Microsoftが、国家支援型のハッカーらがサイバー攻撃の自動化に悪用しているAIフレームワーク「ARTEX」の仕組みと対策を公表した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/microsoft-details-how-state-backed-hackers-use-the-artex-ai-framework-to-automate-cyberattacks/"
rank: 4
---

## ポイント

- 国家支援型のハッカーや犯罪者がAIフレームワーク「ARTEX」をサイバー攻撃に悪用
- マルチエージェント構造により、既存のセキュリティツールを人間の介入なしで機械的スピードで操作
- Microsoftはハニーポットなどの欺瞞技術による防御を推奨しているが、効果の持続性には懸念が残る

## 要約

Microsoftは、2026年7月に公開された自動ペネトレーションテストフレームワーク「ARTEX」の脅威分析レポートを発表した。中国や北朝鮮の国家支援グループやサイバー犯罪者が、同システムを悪用してサプライチェーン攻撃などを仕掛けている。

ARTEXはマルチエージェントアーキテクチャを採用しており、目標モデル、計画エージェント、ワーカーエージェントが連携して偵察からデータ窃取までの攻撃タスクを自動実行する。NmapやMetasploitなどの既存ツールを人間の介入なしで機械的なスピードで操作し、エラー発生時にはモデルやAPIキーを自動で切り替える機能を持つ。そのため従来のルールベースのフィルターでは対応が難しく、防衛側の対応時間が数分に短縮されるケースが確認されている。

これに対する防御策として、Microsoftはハニーポットやフェイクの成功シグナルといった積極的な欺瞞技術の導入を推奨している。しかし、AIエージェントが学習や適応を重ねた場合、これらの防御策が長期間有効であるかは依然として不透明である。

## 元記事

- [Microsoft details how state-backed hackers use the ARTEX AI framework to automate cyberattacks](<https://the-decoder.com/microsoft-details-how-state-backed-hackers-use-the-artex-ai-framework-to-automate-cyberattacks/>)（The Decoder）
