---
title: "MetaKP: On-Demand Keyphrase Generation"
collection: publications
Authors: '<b>Di Wu</b>, Xiaoxian Shen, and Kai-Wei Chang.'
date: 07/2024
venue: 'EMNLP (Findings)'
paperurl: 'https://arxiv.org/abs/2407.00191'
codeurl: 'https://github.com/uclanlp/MetaKP'
excerpt: ''
topic: 'keyphrase'
selected: 'true'
---
---
<a href='https://arxiv.org/pdf/2407.00191.pdf' target="_blank">[Download Paper]</a><a href='https://github.com/uclanlp/MetaKP' target="_blank">[Source Code]</a>

<p align="justify">
Traditional keyphrase prediction methods predict a single set of keyphrases per document, failing to cater to the diverse needs of users and downstream applications. To bridge the gap, we introduce on-demand keyphrase generation, a novel paradigm that requires keyphrases that conform to specific high-level goals or intents. For this task, we present MetaKP, a large-scale benchmark comprising four datasets, 7500 documents, and 3760 goals across news and biomedical domains with human-annotated keyphrases. Leveraging MetaKP, we design both supervised and unsupervised methods, including a multi-task fine-tuning approach and a self-consistency prompting method with large language models. The results highlight the challenges of supervised fine-tuning, whose performance is not robust to distribution shifts. By contrast, the proposed self-consistency prompting approach greatly improves the performance of large language models, enabling GPT-4o to achieve 0.548 SemF1, surpassing the performance of a fully fine-tuned BART-base model. Finally, we demonstrate the potential of our method to serve as a general NLP infrastructure, exemplified by its application in epidemic event detection from social media.
</p>
