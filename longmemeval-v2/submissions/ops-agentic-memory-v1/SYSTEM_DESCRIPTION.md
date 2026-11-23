# OPS-Agentic-Memory-v1 — System Description

**Method:** `OPS-Agentic-Memory-v1` (internally: `agentrunbook_c_plus`)
**Tier:** small
**Reader model:** `qwen3.5-9b`
**Judge model:** `gpt-5.2`

## Overview

AgentRunbook-C+ extends the `agentrunbook_c` memory method. As in AgentRunbook-C, a
Codex agent explores the conversation trajectories and selects **trajectory spans** —
pointers to the concrete trajectory state ranges that contain the evidence for a
question. AgentRunbook-C+ keeps Codex's span selection **verbatim** and replaces only the
narrative `memory_markdown` that the downstream reader consumes.

## Motivation

Codex's span selection is reliable, but its free-form `memory_markdown` tends to:

- **hallucinate** fields/values that are not literally present in the retrieved evidence, and
- **substitute the nearest similar entity** when a question's premise is actually false
  (the trap / abstention questions).

Both failure modes push the reader toward confidently wrong answers.

## Mechanism

`query()` runs Codex exactly as `agentrunbook_c` does. We override a single hook,
`_normalize_output_for_query`: after Codex's spans are validated, their evidence is
re-rendered and a dedicated **markdown-writer LLM** produces a fresh `memory_markdown` (the
`## Support Analysis` section), grounded strictly in the rendered span evidence plus the
question text. This replacement runs on both the fresh-attempt and reused-successful-trace
paths. Everything downstream (span listing, linked-evidence expansion, screenshots) is
untouched.

The writer prompt ("v3"):

- runs an explicit **two-step presupposition check** — verify the specifically named entity
  / presupposed structure actually exists (allowing only trivial surface-form variants of
  the *same* entity) before answering; if it is genuinely absent, **lead with the
  correction** instead of substituting a different-but-related entity;
- **never collapses to a bare refusal** ("abstain" / "cannot answer" / "UNKNOWN") — a
  correction of a false premise is itself a valid answer;
- pins the benchmark's answer formatting (counts as English words; values / ids / prices
  kept literal; no LaTeX or `\boxed{}`).

The markdown writer sees **only** the question text and the rendered span evidence — never
the gold answer nor the `-abs` trap marker — matching the original Codex sandbox exposure,
so no evaluation signal leaks into memory construction.

## Configuration

Inherits every `agentrunbook_c` parameter, plus an optional `md_writer_params` object. For
this submission:

- **Span selector (Codex):** `gpt-5.4-mini`, reasoning effort `xhigh`.
- **Markdown writer:** `bailian/deepseek-v4-pro`.
- **Reader:** `qwen3.5-9b`, thinking enabled, temperature 0.6, top_p 0.95, top_k 20.

## Results (combined web + enterprise, full set of 451 questions)

| Metric | Value |
|---|---|
| Overall (full set) | 81.37% |
| Static accuracy | 87.83% |
| Dynamic accuracy | 81.10% |
| Procedure accuracy | 76.42% |
| Gotchas accuracy | 58.62% |
| Memory-query avg latency | 153.64 s/question |
