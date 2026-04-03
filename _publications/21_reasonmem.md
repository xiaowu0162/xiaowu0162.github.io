---
title: "Procedural Knowledge at Scale Improves Reasoning"
collection: publications
Authors: '<b>Di Wu</b>, Devendra Singh Sachan, Wen-tau Yih, Mingda Chen.'
date: 04/2026
venue: 'arXiv'
paperurl: 'https://arxiv.org/abs/2604.01348'
codeurl: 'https://github.com/facebookresearch/reasoning-memory'
excerpt: ''
topic: 'rag'
selected: 'true'
---
---
<a href='https://arxiv.org/pdf/2604.01348' target="_blank">[Download Paper]</a>

<p align="justify">
Test-time scaling has emerged as an effective way to improve language models on challenging reasoning tasks. However, most existing methods treat each problem in isolation and do not systematically reuse knowledge from prior reasoning trajectories. In particular, they underutilize procedural knowledge: how to reframe a problem, choose an approach, and verify or backtrack when needed. We introduce Reasoning Memory, a retrieval-augmented generation (RAG) framework for reasoning models that explicitly retrieves and reuses procedural knowledge at scale. Starting from existing corpora of step-by-step reasoning trajectories, we decompose each trajectory into self-contained subquestion-subroutine pairs, yielding a datastore of 32 million compact procedural knowledge entries. At inference time, a lightweight in-thought prompt lets the model verbalize the core subquestion, retrieve relevant subroutines within its reasoning trace, and reason under diverse retrieved subroutines as implicit procedural priors. Across six math, science, and coding benchmarks, Reasoning Memory consistently outperforms RAG with document, trajectory, and template knowledge, as well as a compute-matched test-time scaling baseline. With a higher inference budget, it improves over no retrieval by up to 19.2% and over the strongest compute-matched baseline by 7.9% across task types. Ablation studies show that these gains come from two key factors: the broad procedural coverage of the source trajectories and our decomposition and retrieval design, which together enable effective extraction and reuse of procedural knowledge.
</p>
