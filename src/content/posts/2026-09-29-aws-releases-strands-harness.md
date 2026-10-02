---
title: "9/29 AWSがAIエージェント自作ツールを公開"
date: 2026-09-29T12:00:00+09:00
tags: ["ツール"]
lead: "AWSは主要なLLMに対応し、任意の環境へデプロイできるAIエージェントの自作ツールをオープンソースで公開した。"
source_name: "Publickey"
source_url: "https://www.publickey1.jp/blog/26/awsaistrandsllm.html"
rank: 6
---

## ポイント

- 主要なLLMを自由に切り替えてAIエージェントを構築可能
- プロンプトキャッシングやコンテキストの圧縮・復元機能を標準搭載
- Linuxコンテナ環境であれば任意の場所にデプロイ可能

## 要約

Amazon Web Services（AWS）は、さまざまな大規模言語モデルを組み合わせて高性能なAIエージェントを構築できるオープンソースツール「Strandsハーネス」を公開した。

このツールはAmazon Bedrockのほか、ClaudeやGPT、Gemini、Ollamaなど多様なLLMに対応しており、数行のコードでファイル操作やWeb検索などの機能を持つエージェントを作成できる。また、あとからLLMの切り替えが可能で、Linuxコンテナ環境であればどこでもデプロイできる柔軟性を持つ。

## 業務への影響

特定のLLMベンダーにロックインされることなく、独自のAIエージェントを柔軟に開発・運用できる選択肢が増える。コンテキスト管理やツール連携が組み込まれたハーネスを活用することで、エージェント開発にかかる工数の削減が期待される。

## 元記事

- [AWS、AIエージェントを自作できるツール「Strandsハーネス」をオープンソースで公開。特定のLLMに依存せず入れ替え可能、任意のコンテナ環境にデプロイ](<https://www.publickey1.jp/blog/26/awsaistrandsllm.html>)（Publickey）
