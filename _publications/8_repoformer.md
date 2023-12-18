---
title: "Repoformer: Selective Retrieval for Repository-level Code Completion
"
collection: publications
Authors: ''
date: 12/2023
venue: 'arXiv'
paperurl: '[https://arxiv.org/abs/2310.06374/](https://xiaowu0162.github.io/files/repoformer_preprint.pdf)'
excerpt: ''
selected: 'true'
---
---
<a href='https://xiaowu0162.github.io/files/repoformer_preprint.pdf' target="_blank">[Download Paper]</a>

<p align="justify">
 Recent advances in retrieval-augmented generation (RAG) have initiated a new era in repository-level code completion. However, the invariable use of retrieval in existing frameworks often leads to inefficiencies and inaccuracies, with up to 80\% of the retrieved contexts proving unhelpful for strong code language models (code LMs) such as CodeGen and StarCoder. To tackle the challenges, we propose a selective RAG framework where the retriever is invoked only when necessary. At the core of this framework is Repoformer, a novel code LM that self-determines the necessity of cross-file context based on the current file's information. To enhance the model's self-assessment and code completion capabilities, we design a multi-task learning approach that leverages self-supervision from public repositories with a contrastive data labeling paradigm. Extensive evaluations on diverse benchmarks reveal that Repoformer not only markedly outperforms existing retrieval-enhanced code LMs, but also reduces the inference latency by as much as 60%. These advancements position Repoformer as a significant step towards more accurate and efficient repository-level code completion. 
</p>
