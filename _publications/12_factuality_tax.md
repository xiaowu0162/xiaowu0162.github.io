---
title: "The Factuality Tax of Diversity-Intervened Text-to-Image Generation: Benchmark and Fact-Augmented Intervention"
collection: publications
Authors: 'Yixin Wan, <b>Di Wu</b>, Haoran Wang, and Kai-Wei Chang.'
date: 07/2024
venue: 'EMNLP'
paperurl: 'https://arxiv.org/abs/2407.00377/'
codeurl: 'https://github.com/elainew728/factuality-tax-t2i'
excerpt: ''
topic: 'rag'
selected: 'false'
---
---
<a href='https://arxiv.org/pdf/2407.00377' target="_blank">[Download Paper]</a>

<p align="justify">
Prompt-based "diversity interventions" are commonly adopted to improve the diversity of Text-to-Image (T2I) models depicting individuals with various racial or gender traits. However, will this strategy result in nonfactual demographic distribution, especially when generating real historical figures? In this work, we propose DemOgraphic FActualIty Representation (DoFaiR), a benchmark to systematically quantify the trade-off between using diversity interventions and preserving demographic factuality in T2I models. DoFaiR consists of 756 meticulously fact-checked test instances to reveal the factuality tax of various diversity prompts through an automated evidence-supported evaluation pipeline. Experiments on DoFaiR unveil that diversity-oriented instructions increase the number of different gender and racial groups in DALLE-3's generations at the cost of historically inaccurate demographic distributions. To resolve this issue, we propose Fact-Augmented Intervention (FAI), which instructs a Large Language Model (LLM) to reflect on verbalized or retrieved factual information about gender and racial compositions of generation subjects in history, and incorporate it into the generation context of T2I models. By orienting model generations using the reflected historical truths, FAI significantly improves the demographic factuality under diversity interventions while preserving diversity.
</p>
