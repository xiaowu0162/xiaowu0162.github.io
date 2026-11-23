"""AgentRunbook-C+ : AgentRunbook-C span selection with a grounded re-writer.

Motivation
----------
``agentrunbook_c`` lets a Codex agent both (a) select ``trajectory_spans`` -- pointers
to the concrete trajectory state ranges that hold the evidence -- and (b) write the
narrative ``memory_markdown`` the downstream reader consumes. Codex's span selection is
reliable, but its free-form ``memory_markdown`` tends to *hallucinate* fields/values that
are not literally in the retrieved evidence and to *substitute the nearest similar entity*
when a question's premise is actually false (the trap / abstention questions). Both push
the reader toward confidently wrong answers.

AgentRunbook-C+ keeps Codex's spans verbatim and replaces only the ``memory_markdown``:
a dedicated "markdown writer" LLM re-derives the ``## Support Analysis`` section grounded
*strictly* in the rendered span evidence + the question text, under a prompt that:

  * runs an explicit two-step presupposition check -- verify the specifically named entity
    / presupposed structure actually exists (allowing only trivial surface-form variants of
    the *same* entity) before answering; if it is genuinely absent, LEAD with the
    correction instead of substituting a different-but-related entity;
  * never collapses to a bare refusal ("abstain" / "cannot answer" / "UNKNOWN") -- a
    correction of a false premise is itself a valid answer;
  * pins the benchmark's answer formatting (counts as English words, values/ids/prices
    kept literal, no LaTeX / ``\\boxed{}``).

The writer sees ONLY the question text and the rendered span evidence -- never the gold
answer nor the ``-abs`` trap marker -- matching the original Codex sandbox exposure, so no
evaluation signal leaks into memory construction.

Mechanism
---------
``query()`` (inherited from :class:`CodexMemory`) runs Codex exactly as
``agentrunbook_c`` does and then, for both the fresh-attempt and reused-successful-trace
paths, calls :meth:`_normalize_output_for_query` before building the reader context. We
override that single method: after Codex's spans are validated, we re-render their evidence
and ask the markdown-writer LLM to produce a fresh ``memory_markdown``, which replaces
Codex's. Everything downstream (span listing, linked-evidence expansion, screenshots) is
untouched. If the rewrite cannot run (no resolvable question context) it degrades to
Codex's original markdown so a misconfiguration never silently corrupts evidence; a missing
API key fails loudly at construction time instead.

Config (``memory_params``)
--------------------------
Inherits every ``agentrunbook_c`` parameter, plus an optional ``md_writer_params`` object::

    {
      "memory_type": "agentrunbook_c_plus",
      "memory_params": {
        "query_codex_params": { ... },          # same as agentrunbook_c
        "md_writer_params": {
          "base_url": "https://.../v1/chat/completions",
          "model": "bailian/deepseek-v4-pro",
          "api_key_env": "AUX_LLM_KEY",        # name of the env var holding the key
          "max_retries": 4,
          "timeout_seconds": 180.0
        }
      }
    }

The API key is read from the environment variable named by ``api_key_env`` (default
``AUX_LLM_KEY``); it is never embedded in the config or the code.
"""

from __future__ import annotations

import http.client
import json
import os
import sys
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from .memory import MemoryConfig, register_memory, require
from .codex import MAX_TOTAL_SPAN_STATES, load_json, question_image, question_text
from .agentrunbook_c import AgentRunbookC


# --- markdown-writer defaults ---
DEFAULT_MD_WRITER_BASE_URL = (
    ""
)
DEFAULT_MD_WRITER_MODEL = "bailian/deepseek-v4-pro"
DEFAULT_MD_WRITER_API_KEY_ENV = "AUX_LLM_KEY"
DEFAULT_MD_WRITER_MAX_RETRIES = 4
DEFAULT_MD_WRITER_TIMEOUT_SECONDS = 180.0


SUPPORT_ANALYSIS_SYSTEM_PROMPT = (
    "You are a memory-retrieval analyst for a web/enterprise agent benchmark. A downstream "
    "reader model must answer a question about a customized environment using ONLY the memory "
    "context you prepare. Your job is to write the `## Support Analysis` section, grounded "
    "strictly in the provided trajectory evidence.\n\n"
    "Your goal is to hand the reader a USABLE, evidence-grounded answer: either the specific "
    "fact asked for, or — when the question rests on a false assumption — a concrete statement of "
    "what is actually true. Both are valid answers; never collapse to a bare refusal.\n\n"
    "Grounding rules:\n"
    "- Use ONLY facts visible in the provided evidence (Goal/URL/Thoughts/Action/AXTree of the "
    "given spans). NEVER invent fields, values, buttons, rows, labels, or steps not present.\n"
    "- Quote the exact label/value from the AXTree when you state the answer.\n\n"
    "STEP 1 — Check the question's presupposition before answering. Many questions name a "
    "specific entity (a field/column/tab/button/menu item/module/status/section) or presuppose a "
    "structural fact (that a second one exists, that there are N of something, that an extra "
    "section/field appears). Identify what the question assumes exists, then verify it against the "
    "evidence:\n"
    "- A presupposition HOLDS if the named entity is actually present, allowing ONLY trivial "
    "surface-form differences of the SAME entity: letter case, whitespace, punctuation, "
    "hyphenation, or obvious paraphrase. Visual attributes the AXTree cannot encode (color, size, "
    "on-screen position) are judged from element structure/order, never rejected just because a "
    "literal color/position word is absent.\n"
    "  (Fictional illustration: question writes a control as `Save-Layout` and the AXTree shows "
    "`Save Layout` — same control; the presupposition holds, answer normally.)\n"
    "- A presupposition is FALSE when the specifically named entity is genuinely ABSENT — i.e. no "
    "entity by that name exists, and the only candidates are DIFFERENT entities that merely serve a "
    "similar purpose or sit nearby. A different name for a different thing is NOT a surface-form "
    "variant. Likewise it is false when a presupposed structure does not hold (there is no second "
    "one; only one appears; the count differs; the extra section/field is not there).\n"
    "  (Fictional illustration: question asks about a menu item literally named `Quick Export` but "
    "the menu only contains a differently-named item `Batch Download`. `Quick Export` is ABSENT — "
    "do NOT report `Batch Download` as if it were the thing asked about.)\n\n"
    "STEP 2 — Produce the answer:\n"
    "- If the presupposition HOLDS: state the specific asked fact, quoting the exact label/value. "
    "Partial or incomplete evidence is NOT a reason to refuse — if the asked fact (a count, a "
    "yes/no, an order, a present label/value) is determinable or soundly inferable from what is "
    "shown, state it plainly. Absence of a feature across the shown evidence can itself BE the "
    "answer (e.g. nothing shown is marked mandatory supports a 'false'/'zero' answer). Only withhold "
    "the specific fact when it is genuinely indeterminable AND not soundly inferable — and even then "
    "do not guess from numeric progressions, unrelated rows, similar-but-different controls, or "
    "analogous workflows.\n"
    "- If the presupposition is FALSE: LEAD with the correction. State plainly that the named entity "
    "does not exist / the presupposed structure does not hold, then name what the environment "
    "actually provides instead. Do NOT answer by substituting the nearest different entity, and do "
    "NOT write \"abstain\", \"cannot be answered\", \"unable to answer\", or \"UNKNOWN\" — those make "
    "the reader emit a bare refusal that is scored WRONG. The correction itself is the answer, e.g. "
    "phrased as \"There is no <named thing> here; what exists instead is <actual thing>.\"\n\n"
    "Answer formatting (the reader copies your phrasing):\n"
    "- When the asked fact is a COUNT of items (how many buttons/tabs/fields/actions/options/etc.), "
    "express the number as an English word (e.g. `three`), not a digit. When the asked fact is a "
    "measured value, identifier, code, price, or a quantity with units, keep its literal form (e.g. "
    "`20`, `2 days`, `5 - Planning`).\n"
    "- Never wrap the answer text in LaTeX or math formatting (no `\\text{...}`, no `\\boxed{...}`, "
    "no `$...$`); write plain text.\n"
    "- Be concise. Do not copy large AXTree blocks or screenshots into your output.\n\n"
    "Output format:\n"
    "- Output EXACTLY one markdown section beginning with the heading `## Support Analysis` and "
    "nothing else.\n"
)


def build_support_analysis_user_prompt(
    question_text_value: str,
    has_image: bool,
    evidence: str,
) -> str:
    img_note = (
        "\n(Note: the original question includes a screenshot which is not shown here; "
        "rely on the textual evidence below.)"
        if has_image
        else ""
    )
    return (
        f"# Question\n{question_text_value}{img_note}\n\n"
        f"# Retrieved trajectory evidence (the spans the agent selected)\n{evidence}\n"
        "# Task\n"
        "Write the `## Support Analysis` section now. First check whether the question's "
        "presupposition holds (is the specifically named entity / presupposed structure actually "
        "present, allowing only trivial surface-form differences?). If it holds, point to the "
        "supporting span(s) and state the asked fact, quoting exact labels/values (even from partial "
        "evidence). If the named entity is genuinely absent or the presupposed structure does not "
        "hold, LEAD with that correction and name what is actually present instead — do NOT "
        "substitute the nearest different entity, and do NOT say \"cannot be answered\", \"abstain\", "
        "or \"UNKNOWN\". Express counts as English words; never wrap the answer in LaTeX."
    )


@register_memory
class AgentRunbookCPlus(AgentRunbookC):
    memory_type = "agentrunbook_c_plus"

    def __init__(self, memory_params: dict[str, object]) -> None:
        super().__init__(memory_params)

        writer_obj = memory_params.get("md_writer_params", {})
        require(
            isinstance(writer_obj, dict),
            "agentrunbook_c_plus md_writer_params must be an object",
        )
        writer_params = dict(writer_obj)

        self.md_writer_base_url = str(
            writer_params.get("base_url", DEFAULT_MD_WRITER_BASE_URL)
        )
        self.md_writer_model = str(writer_params.get("model", DEFAULT_MD_WRITER_MODEL))
        self.md_writer_api_key_env = str(
            writer_params.get("api_key_env", DEFAULT_MD_WRITER_API_KEY_ENV)
        )
        self.md_writer_max_retries = int(
            writer_params.get("max_retries", DEFAULT_MD_WRITER_MAX_RETRIES)
        )
        self.md_writer_timeout_seconds = float(
            writer_params.get("timeout_seconds", DEFAULT_MD_WRITER_TIMEOUT_SECONDS)
        )

        # Resolve the API key now (fail fast) rather than mid-run inside a
        # per-query exception handler that would silently degrade to Codex markdown.
        api_key = os.environ.get(self.md_writer_api_key_env)
        require(
            isinstance(api_key, str) and api_key.strip(),
            "agentrunbook_c_plus markdown-writer API key not found in environment "
            f"variable {self.md_writer_api_key_env!r}; set it or override "
            "md_writer_params.api_key_env",
        )
        self._md_writer_api_key = api_key.strip()
        self._md_writer_warn_lock = threading.Lock()
        self._md_writer_warned = False

    @property
    def memory_config(self) -> MemoryConfig:
        config = super().memory_config
        # Record the writer configuration (env var NAME only, never the secret).
        config["memory_params"]["md_writer_params"] = {
            "base_url": self.md_writer_base_url,
            "model": self.md_writer_model,
            "api_key_env": self.md_writer_api_key_env,
            "max_retries": self.md_writer_max_retries,
            "timeout_seconds": self.md_writer_timeout_seconds,
        }
        return config

    # ------------------------------------------------------------------
    # Override the single chokepoint both query paths flow through.
    # ------------------------------------------------------------------
    def _normalize_output_for_query(self, output_path: Path) -> dict[str, Any]:
        normalized = super()._normalize_output_for_query(output_path)

        question_item = self._resolve_current_question_item()
        if question_item is None:
            # No resolvable question context (e.g. called outside query()): keep
            # Codex's markdown rather than guessing. Never break the run.
            self._warn_once(
                "could not resolve question context; keeping Codex memory_markdown"
            )
            return normalized

        question_field = question_item.get("question")
        question_text_value = question_text(question_field)
        has_image = question_image(question_field) is not None

        evidence = self._render_spans_evidence(normalized["trajectory_spans_valid"])
        user_prompt = build_support_analysis_user_prompt(
            question_text_value, has_image, evidence
        )

        new_markdown = self._call_md_writer(
            SUPPORT_ANALYSIS_SYSTEM_PROMPT, user_prompt
        )
        # Preserve provenance; the reader only consumes "memory_markdown".
        normalized["memory_markdown_codex"] = normalized["memory_markdown"]
        normalized["memory_markdown"] = new_markdown
        return normalized

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _resolve_current_question_item(self) -> dict[str, Any] | None:
        context = self.get_query_context()
        question_id = context.get("question_id")
        if isinstance(question_id, str) and question_id in self.question_by_id:
            return self.question_by_id[question_id]
        return None

    def _render_spans_evidence(self, valid_spans: list[dict[str, Any]]) -> str:
        if not valid_spans:
            return "(the agent returned no usable trajectory_spans for this question.)\n"
        rendered = [self._render_one_span(span) for span in valid_spans]
        return "\n".join(rendered)

    def _render_one_span(self, span: dict[str, Any]) -> str:
        tid = span["trajectory_id"]
        start = span["start_state_index"]
        end = span["end_state_index"]
        trajectory = self._load_stored_trajectory(tid)
        if trajectory is None:
            return (
                f"### Trajectory `{tid}` states {start}-{end}\n"
                f"[WARNING: trajectory {tid} not found; span cannot be inspected]\n"
            )
        states = trajectory.get("states") or []
        lines: list[str] = [f"### Trajectory `{tid}` states {start}-{end}"]
        lines.append(f"- Goal: {trajectory.get('goal')}")
        lines.append(f"- Start URL: {trajectory.get('start_url')}")
        actions = trajectory.get("actions")
        if isinstance(actions, list) and actions:
            lines.append("- Actions:")
            for ai, act in enumerate(actions):
                lines.append(f"  {ai}. {act}")
        for st in states[start : end + 1]:
            idx = st.get("state_index")
            step = st.get("step")
            lines.append(f"\n#### State {idx} (step {step})")
            lines.append(f"- URL: {st.get('url')}")
            thoughts = st.get("thoughts")
            if thoughts:
                lines.append(f"- Thoughts: {thoughts}")
            action = st.get("action")
            if action:
                lines.append(f"- Action: {action}")
            text = st.get("text")
            if isinstance(text, str) and text.strip():
                lines.append("- AXTree:")
                lines.append("```")
                lines.append(text)
                lines.append("```")
        return "\n".join(lines) + "\n"

    def _call_md_writer(self, system_prompt: str, user_prompt: str) -> str:
        body = json.dumps(
            {
                "model": self.md_writer_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            }
        ).encode("utf-8")
        last_err: Exception | None = None
        for attempt in range(self.md_writer_max_retries + 1):
            self._raise_if_cancelled()
            try:
                req = urllib.request.Request(
                    self.md_writer_base_url,
                    data=body,
                    headers={
                        "Authorization": f"Bearer {self._md_writer_api_key}",
                        "Content-Type": "application/json",
                    },
                    method="POST",
                )
                with urllib.request.urlopen(
                    req, timeout=self.md_writer_timeout_seconds
                ) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                content = data["choices"][0]["message"]["content"]
                if isinstance(content, str) and content.strip():
                    return content.strip()
                raise ValueError(f"empty content from markdown-writer LLM: {data}")
            except (
                urllib.error.URLError,
                urllib.error.HTTPError,
                http.client.HTTPException,
                OSError,
                ValueError,
                KeyError,
            ) as exc:
                last_err = exc
                if attempt < self.md_writer_max_retries:
                    time.sleep(min(2 ** attempt, 30))
                continue
        raise RuntimeError(
            f"markdown-writer LLM call failed after "
            f"{self.md_writer_max_retries + 1} attempts: {last_err}"
        )

    def _warn_once(self, message: str) -> None:
        with self._md_writer_warn_lock:
            if self._md_writer_warned:
                return
            self._md_writer_warned = True
        print(f"[agentrunbook_c_plus] {message}", file=sys.stderr, flush=True)


# Re-exported so downstream tooling / configs can reference the budget constant.
__all__ = ["AgentRunbookCPlus", "MAX_TOTAL_SPAN_STATES", "load_json"]
