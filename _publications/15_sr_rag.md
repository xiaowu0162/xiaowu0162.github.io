---
title: "Self-Routing RAG: Binding Selective Retrieval with Knowledge Verbalization"
collection: publications
Authors: '<b>Di Wu*</b>, Jia-Chen Gu*, Kai-Wei Chang, and Nanyun Peng.'
date: 04/2026
venue: 'AACL (Findings)'
paperurl: 'https://arxiv.org/abs/2504.01018'
codeurl: 'https://github.com/xiaowu0162/self-routing-rag'
presentationurl: 'https://drive.google.com/file/d/14ZFl7Nq3KjJV4jH0y3PEcuYF-WG1rr0p/view?usp=sharing'
posterurl: 'https://drive.google.com/file/d/1OlIi3XXY0vDRihoQBIrjBRnJGWnZJMkg/view?usp=sharing'
excerpt: ''
topic: 'rag'
selected: 'true'
---
---
<a href='https://arxiv.org/pdf/2504.01018.pdf' target="_blank">[Download Paper]</a><a href='https://github.com/xiaowu0162/self-routing-rag' target="_blank">[Source Code]</a>

<p align="justify">
Selective retrieval aims to make retrieval-augmented generation (RAG) more efficient and reliable by skipping retrieval when an LLM's parametric knowledge suffices. Despite promising results, existing methods are constrained by a binary design choice: either retrieve from a single external source or skip retrieval and let the LLM directly produce the final answer. We argue that this fallback underestimates the model's knowledge and obscures the more general multi-source decision problem that arises in practical systems. We propose Self-Routing RAG (SR-RAG), which casts selective retrieval as knowledge source selection and treats the LLM itself as a first-class knowledge source. SR-RAG learns to select an appropriate knowledge source, optionally verbalize parametric knowledge, and answer using the selected source, all within a single left-to-right generation pass. SR-RAG further augments source selection by combining LLM-based uncertainty with a flexible external policy datastore to improve decision calibration. Across four benchmarks and three 7B-class LLMs, SR-RAG outperforms a strong selective retrieval baseline by 8.5%/2.1%/4.7% while performing 26%/40%/21% fewer retrievals, and it achieves favorable accuracy-latency trade-offs without dataset-specific threshold tuning.
</p>
