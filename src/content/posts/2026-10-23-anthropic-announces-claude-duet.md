---
title: "10/23 Anthropicが常時稼働AIを発表"
date: 2026-10-23T09:18:24+09:00
tags: ["Anthropic", "ツール", "セキュリティ"]
lead: "Anthropicはユーザーのオフライン中もバックグラウンドで自律的にタスクを処理する常時稼働AIエージェントを発表した。"
source_name: "The Decoder"
source_url: "https://the-decoder.com/anthropic-takes-on-grok-bot-metas-muse-and-openais-dots-with-its-always-on-agent-claude-duet/"
rank: 1
---

## ポイント

- バックグラウンドで自律的にタスクを処理する常時稼働AIエージェントClaude Duetが発表された
- GmailやSlack、Stripeなど6,000以上の外部サービスと連携しスケジュール管理や請求準備を行う
- 米国のProおよびMaxプランユーザーを対象にウェイティングリスト形式で提供されている

## 要約

Anthropicはユーザーがオフラインの際にもバックグラウンドで自律的にタスクを処理する常時稼働AIエージェント「Claude Duet」のプレビュー版を発表した。xAIのGrok Bot、MetaのMuse、OpenAIのDotsに対抗するプロダクトとなる。

Claude Opus 5.5を基盤とし、クラウド上の仮想マシン上で動作する。Claude Marketplace経由でGmail、Slack、Stripeなど6,000以上の外部サービスと連携し、メッセージ作成や請求書の準備、スケジュール管理などを単一のチャットスレッドで行う。決済などのセンシティブな操作の実行前には必ずユーザーの承認を求める仕組みであり、送金や証券取引はブロックされる。また、プロンプトインジェクション対策としてブラウザ利用に関する研究成果に基づく防御機能や機密情報漏えいを防ぐ新しい分類器が組み込まれている。

米国におけるProおよびMaxプランのユーザーを対象にウェイティングリスト形式で提供されており、チームやエンタープライズプランは対象外となっている。iOS、Android、およびWeb版のclaude.aiからアクセス可能である。初期バージョンではメッセージスレッドの読み誤りや緊急度の判断ミスが発生する場合があり、定常的なチェックはサブスクリプションの利用制限を消費する。

## 元記事

- [Anthropic takes on Grok Bot, Meta's Muse, and OpenAI's Dots with its always-on agent "Claude Duet"](<https://the-decoder.com/anthropic-takes-on-grok-bot-metas-muse-and-openais-dots-with-its-always-on-agent-claude-duet/>)（The Decoder）
