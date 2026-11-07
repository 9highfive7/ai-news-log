---
title: "11/7 Amazon SageMakerがGPU分割機能に対応"
date: 2026-11-07T10:30:08+09:00
tags: ["ツール"]
lead: "Amazon SageMaker InferenceがNVIDIA MIGを利用したGPU分割に対応し、ハードウェアレベルで独立した複数のパーティションでモデルを実行可能になった。"
source_name: "AWS Machine Learning Blog"
source_url: "https://aws.amazon.com/blogs/machine-learning/sagemaker-inference-now-supports-multi-instance-gpu-to-maximize-gpu-utilization-for-model-endpoints/"
rank: 4
---

## ポイント

- NVIDIA MIGにより1つの物理GPUをハードウェア隔離されたパーティションに分割可能
- 各パーティションが専用のメモリと演算を持ち、予測可能なレイテンシと障害隔離を実現
- インファレンスコンポーネントを使用するエンドポイントで利用可能

## 要約

Amazon SageMaker Inferenceは、NVIDIAのMulti-Instance GPU（MIG）を活用したGPU分割機能のサポートを開始した。これにより、1つの物理GPUをハードウェアで完全に隔離された複数のパーティションに分割し、それぞれ異なるモデルを配置できる。

従来は1つのエンドポイントにつき1つの物理GPUを割り当てる必要があり、モデルの規模によってはリソースが過不足になる課題があった。MIGの導入により、各パーティションが専用の演算ユニットとメモリを持ち、予測可能なレイテンシや耐障害性、セキュリティ上のテナント隔離が確保される。Salesforceなどの企業も、GPU稼働率の向上とコスト削減の効果を期待して検証を進めている。

利用にあたっては、複数モデルのデプロイに用いられるインファレンスコンポーネントを使用するエンドポイントが対象となる。単一モデル、サーバーレス、異種インスタンスプールではパーティションを利用できず、レイアウトの変更はエンドポイント作成時に指定する必要がある。

## 元記事

- [SageMaker Inference now supports Multi-Instance GPU to maximize GPU utilization for model endpoints](<https://aws.amazon.com/blogs/machine-learning/sagemaker-inference-now-supports-multi-instance-gpu-to-maximize-gpu-utilization-for-model-endpoints/>)（AWS Machine Learning Blog）
