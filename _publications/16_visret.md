---
title: "VisRet: Visualization Improves Knowledge-Intensive Text-to-Image Retrieval"
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
Text-to-image retrieval (T2I retrieval) remains challenging because cross-modal embeddings often behave as bags of concepts and underrepresent structured visual relationships such as pose and viewpoint. We propose Visualize-then-Retrieve (VisRet), a new paradigm for T2I retrieval that mitigates this limitation of cross-modal similarity alignment. VisRet first projects textual queries into the image modality via T2I generation. Then, it performs retrieval within the image modality to bypass the weaknesses of cross-modal retrievers in recognizing subtle visual-spatial features. Across four benchmarks (Visual-RAG, INQUIRE-Rerank, Microsoft COCO, and our new Visual-RAG-ME featuring multi-entity comparisons), VisRet substantially outperforms cross-modal similarity matching and baselines that recast T2I retrieval as text-to-text similarity matching, improving nDCG@30 by 0.125 on average with CLIP as the retriever and by 0.121 with E5-V. For downstream question answering, VisRet increases accuracy on Visual-RAG and Visual-RAG-ME by 3.8% and 15.7% in top-1 retrieval, and by 3.9% and 11.1% in top-10 retrieval. Ablation studies show compatibility with different T2I instruction LLMs, T2I generation models, and downstream LLMs. VisRet provides a practical and principled path that energizes further advances in vision-language retrieval. Our code and the Visual-RAG-ME benchmark will be publicly released.
</p>
