---
title: "Lean Graph Search for Formal Theorem Proving"
collection: publications
Authors: 'Yihan Xu*, Jia-Chen Gu*, Junyi Zhang, <b>Di Wu</b>, Haikang Deng, Po-Nien Kung, Kai-Wei Chang, Amit Sahai, Wei Wang, and Nanyun Peng.'
date: 2026-10-15
venue: 'arXiv'
paperurl: 'https://arxiv.org/abs/2610.22339'
codeurl: 'https://github.com/PlusLabNLP/LeanGraphSearch'
excerpt: ''
topic: 'rag'
selected: 'true'
---
---
<a href='https://arxiv.org/pdf/2610.22339' target="_blank">[Download Paper]</a><a href='https://github.com/PlusLabNLP/LeanGraphSearch' target="_blank">[Source Code]</a>

<p align="justify">
LeanGraphSearch uses Mathlib's declaration dependencies to retrieve supporting lemmas for Lean 4 proofs. It starts with semantic retrieval, propagates relevance through a dependency graph, and reranks the resulting candidates. This helps uncover useful premises that are difficult to find through similarity matching alone. Experiments on two retrieval benchmarks and three theorem-proving benchmarks show improvements in lemma recall, proof completion, and accuracy relative to inference cost when graph retrieval is integrated into an iterative prover guided by Lean feedback.
</p>
