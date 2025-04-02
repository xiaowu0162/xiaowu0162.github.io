---
title: "Self-Routing RAG: Binding Selective Retrieval with Knowledge Verbalization"
collection: publications
Authors: '<b>Di Wu*</b>, Jia-Chen Gu*, Kai-Wei Chang, and Nanyun Peng.'
date: 04/2025
venue: 'arXiv'
paperurl: 'https://arxiv.org/abs/2504.01018'
codeurl: 'https://github.com/xiaowu0162/self-routing-rag'
presentationurl: 'https://drive.google.com/file/d/14ZFl7Nq3KjJV4jH0y3PEcuYF-WG1rr0p/view?usp=sharing'
excerpt: ''
topic: 'rag'
selected: 'true'
---
---
<a href='https://arxiv.org/pdf/2504.01018.pdf' target="_blank">[Download Paper]</a><a href='https://github.com/xiaowu0162/self-routing-rag' target="_blank">[Source Code]</a>

<p align="justify">
Selective retrieval improves retrieval-augmented generation (RAG) by reducing distractions from low-quality retrievals and improving efficiency. However, existing approaches under-utilize the inherent knowledge of large language models (LLMs), leading to suboptimal retrieval decisions and degraded generation performance. To bridge this gap, we propose Self-Routing RAG (SR-RAG), a novel framework that binds selective retrieval with knowledge verbalization. SR-RAG enables an LLM to dynamically decide between external retrieval and verbalizing its own parametric knowledge. To this end, we design a multi-task objective that jointly optimizes an LLM on knowledge source selection, knowledge verbalization, and response generation. We further introduce dynamic knowledge source inference via nearest neighbor search to improve the accuracy of knowledge source decision under domain shifts. Fine-tuning three LLMs with SR-RAG significantly improves both their response accuracy and inference latency. Compared to the strongest selective retrieval baseline, SR-RAG reduces retrievals by 29% while improving the performance by 5.1%.
</p>
