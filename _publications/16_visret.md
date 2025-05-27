---
title: "Visualized Text-to-Image Retrieval"
collection: publications
Authors: '<b>Di Wu*</b>, Yixin Wan*, and Kai-Wei Chang.'
date: 05/2025
venue: 'arXiv'
paperurl: 'https://arxiv.org/abs/2505.20291'
codeurl: 'https://github.com/xiaowu0162/Visualize-then-Retrieve'
website: 'https://xiaowu0162.github.io/visret/'
excerpt: ''
topic: 'rag'
selected: 'true'
---
---
<a href='https://arxiv.org/pdf/2505.20291.pdf' target="_blank">[Download Paper]</a><a href='https://github.com/xiaowu0162/Visualize-then-Retrieve' target="_blank">[Source Code]</a>

<p align="justify">
We propose Visualize-then-Retrieve (VisRet), a new paradigm for Text-to-Image (T2I) retrieval that mitigates the limitations of cross-modal similarity alignment of existing multi-modal embeddings. VisRet first projects textual queries into the image modality via T2I generation. Then, it performs retrieval within the image modality to bypass the weaknesses of cross-modal retrievers in recognizing subtle visual-spatial features. Experiments on three knowledge-intensive T2I retrieval benchmarks, including a newly introduced multi-entity benchmark, demonstrate that VisRet consistently improves T2I retrieval by 24.5% to 32.7% NDCG@10 across different embedding models. VisRet also significantly benefits downstream visual question answering accuracy when used in retrieval-augmented generation pipelines. The method is plug-and-play and compatible with off-the-shelf retrievers, making it an effective module for knowledge-intensive multi-modal systems. Our code and the new benchmark are publicly available at https://github.com/xiaowu0162/Visualize-then-Retrieve.
</p>
