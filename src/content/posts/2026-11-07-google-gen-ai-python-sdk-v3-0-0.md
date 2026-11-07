---
title: "11/7 GoogleがGenAI SDKを更新"
date: 2026-11-07T10:30:08+09:00
tags: ["Google", "ツール"]
lead: "Google Gen AI Python SDK v3.0.0がリリースされ、デフォルトのAPIバージョンがv1に変更された。"
source_name: "Gemini SDK（GitHubリリース）"
source_url: "https://github.com/googleapis/python-genai/releases/tag/v3.0.0"
rank: 1
---

## ポイント

- Gemini Developer APIのデフォルトバージョンがv1へ変更
- デフォルトのHTTPクライアントがhttpx2へ移行
- 一部モデルエイリアスはv1未対応のためv1betaの指定が必要

## 要約

Googleは、Google Gen AI Python SDKのバージョン3.0.0を公開した。今回のアップデートでは、Gemini Developer APIのデフォルトのバージョンがv1betaからv1へ変更された。

Gemini EnterpriseやVertex AIを利用するクライアントはv1beta1が維持され影響を受けない。また、デフォルトのHTTPクライアントがhttpxからhttpx2へと移行され、httpxはデフォルトでインストールされなくなった。

一部のモデルエイリアスはv1で利用できずv1betaでのみ提供されるため、継続して利用するには特定バージョンの指定やバージョン切替が必要となる。環境変数やコード内のHttpOptionsで動作を変更可能である。

## 元記事

- [Google Gen AI Python SDK v3.0.0](<https://github.com/googleapis/python-genai/releases/tag/v3.0.0>)（Gemini SDK（GitHubリリース））
