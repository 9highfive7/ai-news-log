---
title: "9/29 AWSがStrandsハーネスをオープンソースで公開"
date: 2026-09-29T12:00:00+09:00
tags: ["ツール"]
lead: "AWSが、使うLLMを後から入れ替えられるAIエージェント構築ツール「Strandsハーネス」をオープンソースで公開した。任意のコンテナ環境にデプロイできる。"
source_name: "Publickey"
source_url: "https://www.publickey1.jp/blog/26/awsaistrandsllm.html"
rank: 6
---

## ポイント

- 主要なLLMやLLMランタイムを基盤にしたAIエージェントの自作が可能
- コードの修正やCLI操作により、LLMの変更やコンテナ環境へのデプロイが容易
- プロンプトキャッシングやコンテキスト管理、各種ツール連携機能を標準装備

## 要約

Amazon Web Services（AWS）は、主要な大規模言語モデル（LLM）を基にしたAIエージェントを構築できるオープンソースツール「Strandsハーネス」を公開した。今年8月に発表された「Strands Harness SDK」を用いており、わずか数行のコードでシェル実行やファイル読み書き、Web検索などの機能を備えたエージェントを作成できる。

Amazon Bedrock上のLLMのほか、Claude、GPT、Gemini、Ollama、Lite LLMに対応する。プロンプトキャッシングやコンテキストの要約・圧縮機能、セッションごとの記憶保持などを備える。構築したエージェントはコードの書き換えだけでLLMの入れ替えが可能であり、Linuxコンテナを備えた任意の環境へデプロイできる。Strands CLIを用いたコマンドラインからの構成や、TypeScriptおよびPythonコードへのエクスポートにも対応する。

## 元記事

- [AWS、AIエージェントを自作できるツール「Strandsハーネス」をオープンソースで公開。特定のLLMに依存せず入れ替え可能、任意のコンテナ環境にデプロイ](<https://www.publickey1.jp/blog/26/awsaistrandsllm.html>)（Publickey）
