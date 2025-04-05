---
title: "LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory"
collection: publications
Authors: '<b>Di Wu</b>, Hongwei Wang, Wenhao Yu, Yuwei Zhang, Kai-Wei Chang, and Dong Yu.'
date: 04/2025
venue: 'ICLR'
paperurl: 'https://arxiv.org/abs/2410.10813'
codeurl: 'https://github.com/xiaowu0162/LongMemEval'
posterurl: 'https://drive.google.com/file/d/13eLcBSrijsNgUcIGk63DAwRIRh4BOlru/view?usp=sharing'
presentationurl: 'https://drive.google.com/file/d/1q1QYZm3SzLT8yp9o6PDrkDvbjqkCruRC/view?usp=sharing'
website: 'https://xiaowu0162.github.io/long-mem-eval/'
excerpt: ''
topic: 'rag'
selected: 'true'
---
---
<a href='https://arxiv.org/pdf/2410.10813.pdf' target="_blank">[Download Paper]</a><a href='https://github.com/xiaowu0162/LongMemEval' target="_blank">[Source Code]</a>

<p align="justify">
Recent large language model (LLM)-driven chat assistant systems have integrated memory components to track user-assistant chat histories, enabling more accurate and personalized responses. However, their long-term memory capabilities in sustained interactions remain underexplored. This paper introduces LongMemEval, a comprehensive benchmark designed to evaluate five core long-term memory abilities of chat assistants: information extraction, multi-session reasoning, temporal reasoning, knowledge updates, and abstention. With 500 meticulously curated questions embedded within freely scalable user-assistant chat histories, LongMemEval presents a significant challenge to existing long-term memory systems, with commercial chat assistants and long-context LLMs showing 30% accuracy drop on memorizing information across sustained interactions. We then present a unified framework that breaks down the long-term memory design into four design choices across the indexing, retrieval, and reading stages. Built upon key experimental insights, we propose several memory designs including session decomposition for optimizing value granularity, fact-augmented key expansion for enhancing the index structure, and time-aware query expansion for refining the search scope. Experiment results show that these optimizations greatly improve both memory recall and downstream question answering on LongMemEval. Overall, our study provides valuable resources and guidance for advancing the long-term memory capabilities of LLM-based chat assistants, paving the way toward more personalized and reliable conversational AI.
</p>
