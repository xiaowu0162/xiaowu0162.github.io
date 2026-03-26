---
title: "Open-Domain Safety Policy Construction"
collection: publications
Authors: '<b>Di Wu</b>, Siyue Liu, Zixiang Ji, Ya-Liang Chang, Zhe-Yu Liu, Andrew Pleffer, Kai-Wei Chang.'
date: 03/2026
venue: 'EACL (Findings)'
paperurl: 'https://aclanthology.org/2026.findings-eacl.262/'
codeurl: 'https://github.com/xiaowu0162/deep-policy-research'
excerpt: ''
topic: 'rag'
selected: 'true'
---
---
<a href='https://aclanthology.org/2026.findings-eacl.262.pdf' target="_blank">[Download Paper]</a>

<p align="justify">
Moderation layers are increasingly a core component of many products built on user- or model-generated content. However, drafting and maintaining domain-specific safety policies remains costly. We present Deep Policy Research (DPR), a minimal agentic system that drafts a full content moderation policy based on only human-written seed domain information. DPR uses a single web search tool and lightweight scaffolding to iteratively propose search queries, distill diverse web sources into policy rules, and organize rules into an indexed document. We evaluate DPR on (1) the OpenAI undesired content benchmark across five domains with two compact reader LLMs and (2) an in-house multimodal advertisement moderation benchmark. DPR consistently outperforms definition-only and in-context learning baselines, and in our end-to-end setting it is competitive with expert-written policy sections in several domains. Moreover, under the same seed specification and evaluation protocol, DPR outperforms a general-purpose deep research system, suggesting that a task-specific, structured research loop can be more effective than generic web research for policy drafting. We release our experiment code at https://github.com/xiaowu0162/deep-policy-research.
</p>
