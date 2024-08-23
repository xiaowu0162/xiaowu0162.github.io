---
title: "Repoformer: Selective Retrieval for Repository-level Code Completion
"
collection: publications
Authors: '<b>Di Wu</b>, Wasi Uddin Ahmad, Dejiao Zhang, Murali Krishna Ramanathan, and Xiaofei Ma'
date: 03/2024
venue: 'ICML'
paperurl: 'https://arxiv.org/pdf/2403.10059.pdf'
posterurl: 'https://drive.google.com/file/d/1zILw2Km4CVHvfIB6mRRZ1HiYkcM8J296/view?usp=sharing'
presentationurl: 'https://drive.google.com/file/d/1eo08d_bj-nWWK6fFGytXnbRo8d-YMPkg/view?usp=sharing'
website: 'https://repoformer.github.io/'
excerpt: ''
topic: 'rag'
selected: 'true'
oral: 'true'
---
---
<a href='=https://arxiv.org/pdf/2403.10059.pdf' target="_blank">[Download Paper]</a>

<p align="justify">
Recent advances in retrieval-augmented generation (RAG) have initiated a new era in repository-level code completion. However, the invariable use of retrieval in existing methods exposes issues in both efficiency and robustness, with a large proportion of the retrieved contexts proving unhelpful or harmful to code language models (code LMs). In this paper, we propose a selective RAG framework to avoid retrieval when unnecessary. To power this framework, we design a self-supervised learning approach to enable a code LM to accurately self-evaluate whether retrieval can improve its output quality and robustly leverage the potentially noisy retrieved contexts. Using this LM as both the selective RAG policy and the generation model, our framework achieves state-of-the-art repository-level code completion performance on diverse benchmarks including RepoEval, CrossCodeEval, and CrossCodeLongEval, a new long-form code completion benchmark. Meanwhile, our analyses show that selectively retrieving brings as much as 70% inference speedup in the online serving setting without harming the performance. We further demonstrate that our framework is able to accommodate different generation models, retrievers, and programming languages. These advancements position our framework as an important step towards more accurate and efficient repository-level code completion.
</p>
