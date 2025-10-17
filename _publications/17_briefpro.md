---
title: "BRIEF-Pro: Universal Context Compression with Short-to-Long Synthesis for Fast and Accurate Multi-Hop Reasoning"
collection: publications
Authors: 'Jia-Chen Gu*, Junyi Zhang*, <b>Di Wu</b>, Yuankai Li, Kai-Wei Chang, and Nanyun Peng.'
date: 10/2025
venue: 'arXiv'
paperurl: 'https://arxiv.org/abs/2510.13799/'
codeurl: 'https://github.com/JasonForJoy/BRIEF'
excerpt: ''
topic: 'rag'
selected: 'false'
---
---
<a href='https://arxiv.org/pdf/2510.13799' target="_blank">[Download Paper]</a>

<p align="justify">
As retrieval-augmented generation (RAG) tackles complex tasks, increasingly expanded contexts offer richer information, but at the cost of higher latency and increased cognitive load on the model. To mitigate this bottleneck, especially for intricate multi-hop questions, we introduce BRIEF-Pro. It is a universal, lightweight compressor that distills relevant evidence for a given query from retrieved documents into a concise summary for seamless integration into in-context RAG. Using seed data consisting of relatively short contexts (fewer than 1k words), BRIEF-Pro is trained to perform abstractive compression of extended contexts exceeding 10k words across a wide range of scenarios. Furthermore, BRIEF-Pro offers flexible user control over summary length by allowing users to specify the desired number of sentences. Experiments on four open-domain multi-hop question-answering datasets show that BRIEF-Pro generates more concise and relevant summaries, enhancing performance across small, large, and proprietary language models. With the 70B reader model, 32x compression by BRIEF-Pro improves QA performance by 4.67% on average over LongLLMLingua's 9x, while requiring only 23% of its computational overhead.
</p>
