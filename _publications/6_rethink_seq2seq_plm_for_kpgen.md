---
title: "Rethinking Model Selection and Decoding for Keyphrase Generation with Pre-trained Sequence-to-Sequence Models
"
collection: publications
Authors: '<b>Di Wu</b>, Wasi Uddin Ahmad, and Kai-Wei Chang.'
date: 10/2023
venue: 'EMNLP'
paperurl: 'https://aclanthology.org/2023.emnlp-main.410/'
codeurl: 'https://github.com/uclanlp/DeepKPG'
posterurl: 'https://drive.google.com/file/d/1zxQRiOOFJjcklf8D5dbkjmBorq3KFpZb/view?usp=sharing'
excerpt: ''
topic: 'keyphrase'
selected: 'false'
---
---
<a href='https://aclanthology.org/2023.emnlp-main.410.pdf' target="_blank">[Download Paper]</a><a href='https://github.com/uclanlp/DeepKPG' target="_blank">[Source Code]</a>

<p align="justify">
Keyphrase Generation (KPG) is a longstanding task in NLP with widespread applications. The advent of sequence-to-sequence (seq2seq) pre-trained language models (PLMs) has ushered in a transformative era for KPG, yielding promising performance improvements. However, many design decisions remain unexplored and are often made arbitrarily. This paper undertakes a systematic analysis of the influence of model selection and decoding strategies on PLM-based KPG. We begin by elucidating why seq2seq PLMs are apt for KPG, anchored by an attention-driven hypothesis. We then establish that conventional wisdom for selecting seq2seq PLMs lacks depth: (1) merely increasing model size or performing task-specific adaptation is not parameter-efficient; (2) although combining in-domain pre-training with task adaptation benefits KPG, it does partially hinder generalization. Regarding decoding, we demonstrate that while greedy search delivers strong F1 scores, it lags in recall compared with sampling-based methods. From our insights, we propose DeSel, a likelihood-based decode-select algorithm that improves greedy search by an average of 4.7% semantic F1 across five datasets. Our collective findings pave the way for deeper future investigations into PLM-based KPG.
</p>
