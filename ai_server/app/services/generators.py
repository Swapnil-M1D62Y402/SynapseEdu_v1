# app/services/generators.py
import re
from typing import List, Optional, Dict
from pydantic import ValidationError
from app.services.llm import LLMProvider
from app.services.json_utils import extract_json_from_text
from app.schemas.generators import (
    MCQResponse, FlashcardsResponse, TestResponse, SummarizeResponse, RAGResponse
)
from app.db.supabase_client import fetch_processed_sources
from app.services.loader import download_bytes, bytes_to_text
from app.services.retriever import get_contexts_for_query

# -------------------
# PROMPT TEMPLATES
# -------------------

MCQ_PROMPT = """SYSTEM:
You are a highly accurate question generator. You MUST follow the output schema exactly and ONLY output valid JSON — nothing else (no explanation, no commentary, no code fence).
The JSON schema expected:
{{
  "mcqs": [
    {{
      id: "q_<unique_id>",
      questionId: <unique question id>,
      "question": "<full question text>",
      "choices": [
        {{ key: "A", text: <option text> }},
        {{ key: "B", text: <option text> }},
        {{ key: "C", text: <option text> }},
        {{ key: "D", text: <option text> }},
      ],
      "correctOption": "<exactly one of the options>",
      "explanation": ["<optional explanation for the answer>"],
      "difficulty": "<easy | medium | hard>",
      "tags": ["<optional tags>"],
      "confidence": <0.0 to 1.0>  # optional, LLM confidence in correctness       
    }},
    ...
  ]
}}

USER:
Generate exactly {n} multiple-choice questions about the topic: "{topic}" with proper explanation.
Each question must have 4 options. Provide the correct answer as the "correctOption" field (exactly matching one option).
"""

FLASHCARD_PROMPT = """SYSTEM:
You are a concise flashcard generator. Output strict JSON only, EXACTLY in this format:
{{
  "flashcards": [
    {{ 
        "id": "<unique id>",
        "front": "an important term", 
        "back": "short answer/definition" 
    }},
    ...
  ]
}}
USER:
Create {n} flashcards for the topic: "{topic}".
"""

TEST_PROMPT = """SYSTEM:
You are an exam generator. Output strict JSON only with this schema:
{{
  "test": [
    {{
      "question": "<text>",
      "type": "<mcq | short_answer | true_false>",
      "options": ["a","b","c","d"] | null,
      "answer": "<the correct answer text>"
    }},
    ...
  ]
}}
USER:
Create {n} test items on the topic: "{topic}" with this difficulty:{difficulty}. Include only MCQs. For MCQ include 4 options.
"""

SUMMARIZE_PROMPT = """SYSTEM:
You are a concise summarizer. Output strict JSON only as:
{{ "summary": "<3-5 sentence concise summary>" }}
USER:
Summarize the following text verbatim (do not invent facts). Text:
\"\"\"{text}\"\"\"
"""

RAG_PROMPT_TEMPLATE = """SYSTEM:
You are a helpful assistant who MUST use the provided context to answer. Use ONLY the context for facts — if the context does not contain the answer, reply that you don't know.
You MUST return strict JSON only in this format:
{{ "answer": "<answer text>", "citations": ["<source-id or snippet reference>", ...] }}

USER:
Context:
{context}

Question:
{query}
"""

TOPIC_EXTRACTION_PROMPT = """SYSTEM:
You are an assistant that extracts concise high-quality topic keywords from provided text.
Return strict JSON only in this format:
{{
  "topics": [
    {{ "topic": "<short phrase>", "weight": <0.0-1.0> }},
    ...
  ]
}}

USER:
From the text below, extract the top {k} most important topic phrases (short, 1-4 words) with a weight (0-1).
Text:
\"\"\"{sample_text}\"\"\"
"""

# ---- Helper Functions ----
async def get_topics(
    topic: Optional[str],
    topics: Optional[List[str]] = None,
    studyKitId: Optional[str] = None,
    provider: str = "openai",
    default_k: int = 5
) -> List[str]:
    """Get topics in priority order: explicit topics > studyKit extraction > single topic"""
    if topics:
        return topics
    elif studyKitId:
        res = await extract_key_topics(studyKitId=studyKitId, k=default_k, provider=provider)
        return [t.get("topic") for t in res.get("topics", []) if t.get("topic")]
    elif topic:
        return [topic]
    else:
        return []

def build_prompt(base_prompt: str, topic: str, n: int, contexts: Optional[List[str]] = None) -> str:
    """Build prompt with optional context"""
    prompt = base_prompt.format(n=n, topic=topic)
    if contexts:
        joined_ctx = "\n\n---\n\n".join(contexts[:6])
        prompt += f"\n\nCONTEXT:\n{joined_ctx}"
    return prompt

async def run_and_validate(provider_obj, system_prompt, user_prompt, schema_cls):
    """Run LLM and validate against schema"""
    raw = await provider_obj.generate(system_prompt, user_prompt)
    parsed = extract_json_from_text(raw)
    try:
        validated = schema_cls(**parsed)
        return validated.dict()
    except ValidationError as e:
        raise RuntimeError(f"{schema_cls.__name__} validation failed: {e}\nRAW OUTPUT:\n{raw}")

async def extract_key_topics(studyKitId: Optional[str] = None, k: int = 8, provider: str = "openai"):
    """Extract key topics from processed sources"""
    rows = fetch_processed_sources(studyKitId)
    if not rows:
        return {"topics": []}

    # Build a sample: for each source take first 1200 chars
    pieces = []
    max_sample_size = 15000
    for r in rows:
        url = r.get("fileUrl")
        if not url:
            continue
        try:
            b = download_bytes(url)
            text, _ = bytes_to_text(url, b)
            snippet = (text[:1200] + "...") if len(text) > 1200 else text
            pieces.append(f"--- {r.get('fileName') or r.get('id')} ---\n{snippet}\n")
        except Exception:
            continue
        if sum(len(p) for p in pieces) > max_sample_size:
            break

    sample_text = "\n\n".join(pieces)[:max_sample_size]
    user_prompt = TOPIC_EXTRACTION_PROMPT.format(sample_text=sample_text, k=k)
    provider_obj = LLMProvider(provider=provider, temperature=0.0)
    raw = await provider_obj.generate("Extract topics only and output strict JSON.", user_prompt)
    parsed = extract_json_from_text(raw)
    topics = parsed.get("topics", []) if isinstance(parsed, dict) else []
    return {"topics": topics}

# ---- Main Generator Functions ----

async def generate_mcqs_llm(
    topic: Optional[str] = None,
    n: int = 5,
    provider: str = "openai",
    contexts: Optional[List[str]] = None,
    topics: Optional[List[str]] = None,
    studyKitId: Optional[str] = None,
    use_retriever: bool = True,
) -> dict:
    """Generate MCQs with optional context from retriever"""
    # Get topics
    resolved_topics = await get_topics(topic, topics, studyKitId, provider)
    if not resolved_topics:
        return {"mcqs": []}

    # Get contexts if needed
    if contexts is None and use_retriever and resolved_topics:
        try:
            contexts = get_contexts_for_query(resolved_topics[0], k=4)
        except Exception:
            contexts = None

    # Distribute questions across topics
    num_topics = len(resolved_topics)
    per = max(1, n // num_topics)
    rem = n - (per * num_topics)

    aggregated = {"mcqs": []}
    provider_obj = LLMProvider(provider=provider, temperature=0.25)

    for i, t in enumerate(resolved_topics):
        count = per + (1 if i < rem else 0)
        if count <= 0:
            continue

        prompt = build_prompt(MCQ_PROMPT, topic=t, n=count, contexts=contexts)
        raw = await provider_obj.generate("Generate MCQs JSON", prompt)
        parsed = extract_json_from_text(raw)

        try:
            validated = MCQResponse(**parsed)
            aggregated["mcqs"].extend(validated.mcqs)
        except ValidationError as e:
            raise RuntimeError(f"MCQ validation failed for topic '{t}': {e}\nRAW OUTPUT:\n{raw}")

    return aggregated

async def generate_flashcards_llm(
    topic: Optional[str] = None,
    n: int = 5,
    provider: str = "openai",
    contexts: Optional[List[str]] = None,
    topics: Optional[List[str]] = None,
    studyKitId: Optional[str] = None,
    use_retriever: bool = True,
) -> dict:
    """Generate flashcards with optional context"""
    resolved_topics = await get_topics(topic, topics, studyKitId, provider)
    if not resolved_topics:
        return {"flashcards": []}

    if contexts is None and use_retriever and resolved_topics:
        try:
            contexts = get_contexts_for_query(resolved_topics[0], k=4)
        except Exception:
            contexts = None

    aggregated = {"flashcards": []}
    per_topic = max(1, n // len(resolved_topics))
    provider_obj = LLMProvider(provider=provider, temperature=0.3)

    for t in resolved_topics:
        prompt = build_prompt(FLASHCARD_PROMPT, t, per_topic, contexts)
        raw = await provider_obj.generate("Generate Flashcards JSON", prompt)
        parsed = extract_json_from_text(raw)
        
        try:
            validated = FlashcardsResponse(**parsed)
            aggregated["flashcards"].extend(validated.flashcards)
        except ValidationError as e:
            raise RuntimeError(f"Flashcard validation failed for topic '{t}': {e}\nRAW OUTPUT:\n{raw}")

    return aggregated

async def create_test_llm(
    topic: Optional[str] = None,
    n: int = 20,
    provider: str = "openai",
    difficulty: str = "easy",
    contexts: Optional[List[str]] = None,
    studyKitId: Optional[str] = None
) -> dict:
    """Generate test questions"""
    if not topic and studyKitId:
        res = await extract_key_topics(studyKitId=studyKitId, k=6, provider=provider)
        topics = [t.get("topic") for t in res.get("topics", []) if t.get("topic")]
    else:
        topics = [topic] if topic else []

    if not topics:
        return {"test": []}

    aggregated = {"test": []}
    per_topic = max(1, n // len(topics))

    for t in topics:
        user_prompt = TEST_PROMPT.format(n=per_topic, topic=t, difficulty=difficulty)
        if contexts:
            joined_ctx = "\n\n---\n\n".join(contexts[:6])
            user_prompt += f"\n\nCONTEXT:\n{joined_ctx}"

        provider_obj = LLMProvider(provider=provider, temperature=0.4)
        raw = await provider_obj.generate("Generate Test JSON", user_prompt)
        parsed = extract_json_from_text(raw)

        try:
            validated = TestResponse(**parsed)
            aggregated["test"].extend(validated.test)
        except ValidationError as e:
            raise RuntimeError(f"Test validation failed: {e}\nRAW:\n{raw}")

    return aggregated

async def summarize_llm(text: str, provider: str = "openai") -> dict:
    """Summarize text"""
    provider_obj = LLMProvider(provider=provider, temperature=0.0)
    system_prompt = "You are a summarizer. Output only strict JSON with a summary field."
    user_prompt = SUMMARIZE_PROMPT.format(text=text)
    return await run_and_validate(provider_obj, system_prompt, user_prompt, SummarizeResponse)

async def rag_chat_with_retriever_only(
    query: str,
    provider: str = "openai",
    k: int = 4,
    collection: Optional[str] = None,
    max_chars_per_doc: int = 2000
) -> dict:
    """RAG chat with retriever context only"""
    # Fetch contexts
    contexts = get_contexts_for_query(query, k=k, collection_name=collection)
    if not contexts:
        return {"answer": "I don't know — no relevant context found.", "citations": []}

    # Build numbered context
    context_pieces = []
    citation_labels = []
    for i, ctx in enumerate(contexts, start=1):
        # Extract label if present
        m = re.match(r"^\s*\[(?P<label>[^\]]+)\]\s*(?P<body>.*)$", ctx, flags=re.DOTALL)
        if m:
            label = m.group("label").strip()
            body = m.group("body").strip()
        else:
            label = f"doc_{i}"
            body = ctx.strip()

        snippet = body[:max_chars_per_doc].strip()
        context_pieces.append(f"[{i}] Source: {label}\n{snippet}")
        citation_labels.append(label)

    joined_context = "\n\n---\n\n".join(context_pieces)

    system_prompt = (
        "You are an assistant that MUST answer using ONLY the provided CONTEXT. "
        "Do NOT use external knowledge or prior training data. If the answer cannot be "
        "found in the context, reply with exactly: \"I don't know.\" "
        "Return strict JSON only matching this schema: "
        "{\"answer\": \"<answer text>\", \"citations\": [\"<source-label>\", ...]} "
        "Do not include any explanation or extra fields."
    )

    user_prompt = (
        f"CONTEXT (numbered):\n{joined_context}\n\n"
        f"QUESTION: {query}\n\n"
        "Instructions:\n"
        " 1) Use ONLY the context above for facts. If the answer is not contained, say \"I don't know.\" \n"
        " 2) In your answer text you may include inline citation markers like [1] to point at the numbered sources above.\n"
        " 3) The JSON field 'citations' MUST be an array of the **source labels** (exactly as shown after 'Source:') that you used, "
        "in the order of relevance. Example: [\"intro.pdf\", \"chapter2.pdf\"].\n"
        " 4) Output ONLY the JSON object (no markdown, no code fences, no extra commentary).\n"
    )

    provider_obj = LLMProvider(provider=provider, temperature=0.0)
    return await run_and_validate(provider_obj, system_prompt, user_prompt, RAGResponse)