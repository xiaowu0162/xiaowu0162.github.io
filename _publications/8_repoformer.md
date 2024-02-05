---
title: "Repoformer: Selective Retrieval for Repository-level Code Completion
"
collection: publications
Authors: ''
date: 12/2023
venue: 'Anonymous Preprint'
paperurl: 'https://xiaowu0162.github.io/files/repoformer_preprint.pdf'
excerpt: ''
selected: 'true'
---
---
<a href='https://xiaowu0162.github.io/files/repoformer_preprint.pdf' target="_blank">[Download Paper]</a>

<p align="justify">
Recent advances in retrieval-augmented generation (RAG) have initiated a new era in repositorylevel code completion. However, the invariable use of retrieval in existing methods exposes issues in both efficiency and robustness, with a large proportion of the retrieved contexts proving unhelpful or harmful to code 
language models (code LMs). To tackle the challenges, this paper proposes a selective RAG framework where retrieval is avoided when unnecessary. To power this framework, we design a self-supervised learning approach that enables a code LM to accurately self-evaluate whether retrieval can improve its output quality and robustly leverage the potentially noisy retrieved contexts. Using this LM as both the selective retrieval policy and the generation model, our framework consistently outperforms  the state-of-the-art prompting with an invariable retrieval approach on diverse benchmarks including RepoEval, CrossCodeEval, and a new benchmark. Meanwhile, our selective retrieval strategy results in strong efficiency improvements by as much as 70% inference speedup without harming  the performance. We demonstrate that our framework effectively accommodates different generation models, retrievers, and programming languages. These advancements position our framework as an important step towards more accurate and efficient repository-level code completion.
</p>
