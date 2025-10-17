---
title: "LLMs as Scalable, General-Purpose Simulators For Evolving Digital Agent Training"
collection: publications
Authors: 'Yiming Wang, Da Yin, Yuedong Cui, Ruichen Zheng, Zhiqian Li, Zongyu Lin, <b>Di Wu</b>, Xueqing Wu, Chenchen Ye, Yu Zhou, and Kai-Wei Chang.'
date: 10/2025
venue: 'arXiv'
paperurl: 'https://arxiv.org/abs/2510.14969/'
codeurl: ''
excerpt: ''
topic: 'llm'
selected: 'false'
---
---
<a href='https://arxiv.org/pdf/2510.14969.pdf' target="_blank">[Download Paper]</a>

<p align="justify">
Digital agents require diverse, large-scale UI trajectories to generalize across real-world tasks, yet collecting such data is prohibitively expensive in both human annotation, infra and engineering perspectives. To this end, we introduce UI-Simulator, a scalable paradigm that generates structured UI states and transitions to synthesize training trajectories at scale. Our paradigm integrates a digital world simulator for diverse UI states, a guided rollout process for coherent exploration, and a trajectory wrapper that produces high-quality and diverse trajectories for agent training. We further propose UI-Simulator-Grow, a targeted scaling strategy that enables more rapid and data-efficient scaling by prioritizing high-impact tasks and synthesizes informative trajectory variants. Experiments on WebArena and AndroidWorld show that UI-Simulator rivals or surpasses open-source agents trained on real UIs with significantly better robustness, despite using weaker teacher models. Moreover, UI-Simulator-Grow matches the performance of Llama-3-70B-Instruct using only Llama-3-8B-Instruct as the base model, highlighting the potential of targeted synthesis scaling paradigm to continuously and efficiently enhance the digital agents.</p>
