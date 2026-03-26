---
title: "TaoBench: Do Automated Theorem Prover LLMs Generalize Beyond MathLib?"
collection: publications
Authors: 'Alexander K Taylor, Junyi Zhang, Ethan Ji, Vigyan Sahai, Haikang Deng, Yuanzhou Chen, Yifan Yuan, <b>Di Wu</b>, Jia-Chen Gu, Kai-Wei Chang, Nanyun Peng, Amit Sahai, Wei Wang.'
date: 03/2026
venue: 'arXiv'
paperurl: 'https://arxiv.org/abs/2603.12744/'
codeurl: ''
excerpt: ''
topic: 'llm'
selected: 'false'
---
---
<a href='https://arxiv.org/pdf/2603.12744.pdf' target="_blank">[Download Paper]</a>

<p align="justify">
Automated theorem proving (ATP) benchmarks largely consist of problems formalized in MathLib, so current ATP training and evaluation are heavily biased toward MathLib's definitional framework. However, frontier mathematics is often exploratory and prototype-heavy, relying on bespoke constructions that deviate from standard libraries. In this work, we evaluate the robustness of current ATP systems when applied to a novel definitional framework, specifically examining the performance gap between standard library problems and bespoke mathematical constructions. We introduce TaoBench, an undergraduate-level benchmark derived from Terence Tao's Analysis I, which formalizes analysis by constructing core mathematical concepts from scratch, without relying on standard Mathlib definitions, as well as by mixing from-scratch and MathLib constructions. For fair evaluation, we build an agentic pipeline that automatically extracts a compilable, self-contained local environment for each problem. To isolate the effect of definitional frameworks, we additionally translate every problem into a mathematically equivalent Mathlib formulation, yielding paired TaoBench-Mathlib statements for direct comparison. While state-of-the-art ATP models perform capably within the MathLib framework, performance drops by an average of roughly 26% on the definitionally equivalent Tao formulation. This indicates that the main bottleneck is limited generalization across definitional frameworks rather than task difficulty. TaoBench thus highlights a gap between benchmark performance and applicability, and provides a concrete foundation for developing and testing provers better aligned with research mathematics.
</p>
