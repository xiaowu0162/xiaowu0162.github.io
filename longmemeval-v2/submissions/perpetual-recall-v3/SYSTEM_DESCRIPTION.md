# Perpetual Recall V3

A retrieval-first memory system for LongMemEval-V2. Design goal: maximum
accuracy at interactive latency (~2s mean memory-query time), occupying the
fast end of the accuracy-latency frontier rather than the agentic slow end.

## Architecture (query time, per question)

1. **Dense retrieval** (official RAG substrate): Qwen3-Embedding-8B anchors —
   top-6 raw-state slices plus typed notes (procedure/hint, top-9 per type).
2. **Sparse lexical lane**: a dependency-free BM25 index over raw-state text,
   titles, goals, action sequences and notes supplies exact-language candidates
   that dense embeddings blur (identifiers, field names, error strings).
3. **Evidence controller** (one call, thinking off): gpt-5.4-mini receives the
   question plus ranked excerpts of the dense anchors and lexical candidates.
   It may add at most two supplements and returns candidate evidence quotes.
   The same frontier-model family is used by the benchmark's own AgentRunbook
   baselines at query time; we use one short call instead of a multi-turn agent.
4. **Code-side verification**: every controller quote is verified verbatim
   against the evidence the controller saw; fabricated or off-candidate quotes
   are discarded in code. Verified quotes (plus code-derived key values
   extracted from those quotes only) are appended at the end of the packet.
5. **Packet discipline**: a 150k-character budget enforced by in-slice trimming
   (never whole-slice drops) plus a hard backstop; global line-level
   deduplication collapses repeated lines while annotating multiplicity
   ("[xN in record]") so enumeration questions retain ground truth.
6. **Answer-shape exemplar**: a fixed ~40-token packet item demonstrating the
   expected final-answer SHAPE with placeholders (a terse value; a named
   absence). Content-free, question-independent, identical for every question.

The final packet = notes + anchors + supplements + verified-evidence receipt +
exemplar, capped and delivered to the unmodified official reader.

## What the method does NOT do

- No benchmark metadata: passes tests/test_query_privacy.py; question ids,
  types and gold answers are never read at query time.
- No modification of the official reader, judge, prompts, or sampling
  (Qwen3.5-9B, temp 0.6 / top_p 0.95 / top_k 20 / 20k tokens, thinking on;
  judge gpt-5.2). Verified byte-identical to the release.
- No per-question-type branching; every question takes the same path.

## Measured operating point (this submission)

- Accuracy: 240/451 = 53.22% (enterprise 112/211, web 128/240)
- Mean memory-query latency: 1.958s (all query-time compute included:
  embedding search, BM25, controller call, verification, packing)
- LAFS gain vs the fixed small-tier frontier: 1.0955

## External services used at query time

- gpt-5.4-mini (OpenAI API) as the evidence controller — one thinking-off
  call per question, ~1s. Reader-side inference runs on self-hosted vLLM
  (Qwen3.5-9B) and Qwen3-Embedding-8B, as required.
