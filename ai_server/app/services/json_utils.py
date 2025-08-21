# app/services/json_utils.py
import json
import re
from typing import Any

def _strip_code_blocks(text: str) -> str:
    # removes triple/backtick code fences and leading/trailing quotes
    text = re.sub(r"```(?:json)?\n?", "", text, flags=re.IGNORECASE)
    text = re.sub(r"```$", "", text)
    return text.strip().strip('"').strip("'")

def extract_json_from_text(text: str) -> Any:
    """
    Best-effort extraction of the first JSON object/array from an LLM output.
    Raises ValueError if nothing parseable is found.
    """
    if not text:
        raise ValueError("No text to parse")

    t = _strip_code_blocks(text).strip()

    # 1) If it already starts with { or [, try direct parse
    if t.startswith("{") or t.startswith("["):
        try:
            return json.loads(t)
        except json.JSONDecodeError:
            pass  # fall through to search approach

    # 2) Heuristic: find first JSON-looking substring using regex (DOTALL)
    # This is greedy between a starting { or [ and its corresponding } or ].
    # Regex approach is simplistic but works in many LLM cases.
    pattern = r"(\{(?:.|\s)*\}|\[(?:.|\s)*\])"
    m = re.search(pattern, t, flags=re.DOTALL)
    if m:
        candidate = m.group(1)
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            # As a last attempt, try trimming trailing commas
            cand2 = re.sub(r",\s*}", "}", candidate)
            cand2 = re.sub(r",\s*\]", "]", cand2)
            return json.loads(cand2)

    # 3) Give up
    raise ValueError("No JSON found in model output. Raw text:\n" + text)
