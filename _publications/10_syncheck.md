---
title: "Synchronous Faithfulness Monitoring for Trustworthy Retrieval-Augmented Generation"
collection: publications
Authors: '<b>Di Wu</b>, Jia-Chen Gu, Fan Yin, Nanyun Peng, and Kai-Wei Chang.'
date: 06/2024
venue: 'EMNLP'
paperurl: 'https://arxiv.org/abs/2406.13692'
codeurl: 'https://github.com/xiaowu0162/sync-ralm-faithfulness'
presentationurl: 'https://docs.google.com/presentation/d/1M_ctHffF5Cy-CP64QRoma_h1ZXKLACEX/edit?usp=sharing&ouid=112942099362791325316&rtpof=true&sd=true'
posterurl: 'https://drive.google.com/file/d/14HGVh4HL--xDHSvU9Gu_Ej2knUSJvjvc/view?usp=sharing'
website: 'https://xiaowu0162.github.io/syncheck/'
excerpt: ''
topic: 'rag'
selected: 'true'
---
---
<a href='https://arxiv.org/pdf/2406.13692.pdf' target="_blank">[Download Paper]</a><a href='https://github.com/xiaowu0162/sync-ralm-faithfulness' target="_blank">[Source Code]</a>

<p align="justify">
Retrieval-augmented language models (RALMs) have shown strong performance and wide applicability in knowledge-intensive tasks. However, there are significant trustworthiness concerns as RALMs are prone to generating unfaithful outputs, including baseless information or contradictions with the retrieved context. This paper proposes SynCheck, a lightweight monitor that leverages fine-grained decoding dynamics including sequence likelihood, uncertainty quantification, context influence, and semantic alignment to synchronously detect unfaithful sentences. By integrating efficiently measurable and complementary signals, SynCheck enables accurate and immediate feedback and intervention, achieving 0.85 AUROC in detecting faithfulness errors across six long-form retrieval-augmented generation tasks, improving prior best method by 4%. Leveraging SynCheck, we further introduce FOD, a faithfulness-oriented decoding algorithm guided by beam search for long-form retrieval-augmented generation. Empirical results demonstrate that FOD outperforms traditional strategies such as abstention, reranking, or contrastive decoding significantly in terms of faithfulness, achieving over 10% improvement across six datasets.
</p>
