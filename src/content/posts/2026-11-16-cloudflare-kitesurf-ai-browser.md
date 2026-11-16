---
title: "11/16 CloudflareがAI専用ブラウザKitesurfを公開"
date: 2026-11-16T10:30:07+09:00
tags: ["ツール"]
lead: "Cloudflareは、AIエージェントの操作に特化した軽量なオープンソースのヘッドレスブラウザKitesurfを発表した。"
source_name: "Publickey"
source_url: "https://www.publickey1.jp/blog/26/cloudflareaikitesurf.html"
rank: 1
---

## ポイント

- AIエージェント専用に設計された軽量なヘッドレスブラウザ
- Chromiumと比較して3倍から7倍のCPU・メモリ効率を実現
- Rust製でWebAssemblyにコンパイルされCloudflare Workers等で実行可能

## 要約

Cloudflareは、AIエージェントによるWeb操作を想定した軽量なヘッドレスブラウザ「Kitesurf」をオープンソースとして公開した。ライセンスはApache 2.0が適用されている。

Kitesurfはタブやブックマーク、拡張機能などを排し、主にRustで記述されてWebAssemblyにコンパイルされる構造を採用している。これによりChromiumと比較して3倍から7倍のCPUおよびメモリ効率を実現しており、Cloudflare Workers上での実行やChrome DevTools Protocolを通じたPuppeteerからの接続に対応する。

HTMLパースやJavaScript実行を担うBlitzやBoaなどのコンポーネントで構成されており、Wranglerを用いたローカル実行やブラウザ上のプレイグラウンドでの試用が可能である。

## 元記事

- [Cloudflare、AI専用でタブやテーマや拡張などない軽量ヘッドレスブラウザ「Kitesurf」、オープンソースで公開](<https://www.publickey1.jp/blog/26/cloudflareaikitesurf.html>)（Publickey）
