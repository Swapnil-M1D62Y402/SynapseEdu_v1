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
from app.services.llm import LLMProvider
from app.services.json_utils import extract_json_from_text
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
        { key: "A", text: <option text> },
        { key: "B", text: <option text> },
        { key: "C", text: <option text> },
        { key: "D", text: <option text> },
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

Example output:
{{
    "mcqs": [
        {{
      id: "q_7g8h9i",
      questionId: 3,
      question: "What is Agentic AI?",
      choices: [
        { key: "A", text: "An AI that acts autonomously to complete multi-step tasks" },
        { key: "B", text: "A visual-only transformer model" },
        { key: "C", text: "A deterministic rule-based system" },
        { key: "D", text: "A hardware chip for machine learning" },
      ],
      correctOption: "A",
      explanation: [
        "Agentic AI coordinates actions and decisions over time.",
        "It can plan, execute, and adapt across multiple steps.",
        "This function is essential for preserving visualizations, enabling reproducibility, and facilitating the inclusion of plots in reports or publications.",
      ],
      difficulty: "hard",
      tags: ["agents", "generative-ai"],
      confidence: 0.92,
    }}
    ]
}}

USER:
Generate exactly {n} multiple-choice questions about the topic: "{topic}" with proper explanation.
Each question must have 4 options. Provide the correct answer as the "answer" field (exactly matching one option).
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

CHUNK_SUMMARIZE_PROMPT = """SYSTEM:
You are a concise summarizer. Output strict JSON only: {{ "summary": "<3-4 sentence summary>" }}
USER:
Summarize the following chunk:
\"\"\"{chunk_text}\"\"\"
"""

FINAL_SUMMARIZE_PROMPT = """SYSTEM:
You are an integrative summarizer. Output strict JSON only: {{ "summary": "<final 3-5 sentence summary>" }}
USER:
Combine the following chunk summaries into a final concise summary. Do not add new facts.
{chunk_summaries}
"""


# ---- Helper 1: Topic extraction ----
async def get_topics(
    topic: Optional[str],
    studyKitId: Optional[str],
    provider: str,
    default_k: int = 5
) -> List[str]:
    if studyKitId:
        res = await extract_key_topics(studyKitId=studyKitId, k=default_k, provider=provider)
        return [t["topic"] for t in res.get("topics", [])]
    elif topic:
        res = await extract_key_topics(studyKitId=None, k=default_k, provider=provider)
        return [t["topic"] for t in res.get("topics", [])] or [topic]
    return []

# ---- Helper 2: Context builder ----
def build_prompt(base_prompt: str, topic: str, n: int, contexts: Optional[List[str]]) -> str:
    prompt = base_prompt.format(n=n, topic=topic)
    if contexts:
        joined_ctx = "\n\n---\n\n".join(contexts[:6])
        prompt += f"\n\nCONTEXT:\n{joined_ctx}"
    return prompt

# ---- Helper 3: LLM call wrapper ----
async def call_llm(provider: str, task_name: str, prompt: str) -> Dict:
    provider_obj = LLMProvider(provider=provider, temperature=0.3)
    raw = await provider_obj.generate(task_name, prompt)
    return extract_json_from_text(raw)


# -------------------
# Service functions
# -------------------

async def run_and_validate(provider_obj, system_prompt, user_prompt, schema_cls):
    raw = await provider_obj.generate(system_prompt, user_prompt)
    parsed = extract_json_from_text(raw)
    try:
        validated = schema_cls(**parsed)
        return validated.dict()
    except ValidationError as e:
        raise RuntimeError(f"{schema_cls.__name__} validation failed: {e}\nRAW OUTPUT:\n{raw}")


async def extract_key_topics(studyKitId: Optional[str] = None, k: int = 8, provider: str = "openai"):
    """
    Sample processed source texts for a studyKit (or all if studyKitId None),
    build a representative sample, ask the LLM to return the top-k topics as JSON.
    """
    rows = fetch_processed_sources(studyKitId)
    if not rows:
        return {"topics": []}

    # Build a sample: for each source take first 1200 chars (or less); stop when sample grows large
    pieces = []
    max_sample_size = 15000  # chars; keep below token limits
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
    # basic validation/cleanup
    topics = parsed.get("topics", []) if isinstance(parsed, dict) else []
    # normalize to list of strings or keep weights
    return {"topics": topics}


# async def generate_mcqs_llm(topic: str, n: int = 5, provider: str = "openai") -> dict:
#     provider_obj = LLMProvider(provider=provider, temperature=0.3)
#     system_prompt = "You are a high-quality MCQ generator. Output ONLY the JSON document requested."
#     user_prompt = MCQ_PROMPT.format(n=n, topic=topic)
#     return await run_and_validate(provider_obj, system_prompt, user_prompt, MCQResponse)

async def generate_mcqs_llm(
    topic: Optional[str] = None,
    n: int = 5,
    provider: str = "openai",
    contexts: Optional[List[str]] = None,
    topics: Optional[List[str]] = None,
    studyKitId: Optional[str] = None,
    use_retriever: bool = True,
) -> dict:
    """
    Simple MCQ generator:
    - `topics` wins if provided.
    - otherwise try studyKitId -> extract topics.
    - otherwise use `topic` as single topic.
    - optionally fetch contexts from retriever (first topic used as hint).
    Returns {"mcqs": [...]}
    """
    # Resolve topics
    if not topics:
        if studyKitId:
            res = await extract_key_topics(studyKitId=studyKitId, k=6, provider=provider)
            topics = [t.get("topic") for t in (res.get("topics") or []) if t.get("topic")]
        else:
            topics = [topic] if topic else []

    if not topics:
        return {"mcqs": []}

    # Optionally fetch contexts (use first topic as hint)
    if contexts is None and use_retriever:
        try:
            contexts = get_contexts_for_query(topics[0], k=4)
        except Exception:
            contexts = None

    # Distribute n across topics (simple fair split)
    num_topics = len(topics)
    per = max(1, n // num_topics)
    rem = n - (per * num_topics)  # remainder to add 1 to first `rem` topics

    aggregated = {"mcqs": []}
    provider_obj = LLMProvider(provider=provider, temperature=0.25)  # conservative temperature

    for i, t in enumerate(topics):
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
            # include raw output to help debugging if something goes wrong
            raise RuntimeError(f"MCQ validation failed for topic '{t}': {e}\nRAW OUTPUT:\n{raw}")

    return aggregated



# async def generate_flashcards_llm(topic: str, n: int = 10, provider: str = "openai") -> dict:
#     provider_obj = LLMProvider(provider=provider, model="gpt-4o", temperature=0.3)
#     system_prompt = "You are a flashcard generator. Output ONLY valid JSON of the requested schema."
#     user_prompt = FLASHCARD_PROMPT.format(n=n, topic=topic)
#     return await run_and_validate(provider_obj, system_prompt, user_prompt, FlashcardsResponse)


# async def create_test_llm(topic: str, n: int = 10, difficulty:str="easy", provider: str = "openai") -> dict:
#     provider_obj = LLMProvider(provider=provider, temperature=0.0)
#     system_prompt = "You are an exam generator. Output EXACT JSON for the requested schema."
#     user_prompt = TEST_PROMPT.format(n=n, topic=topic, difficulty=difficulty)
#     return await run_and_validate(provider_obj, system_prompt, user_prompt, TestResponse)



from typing import Optional, List, Dict

# --- FLASHCARDS ---
async def generate_flashcards_llm(
    topic: str = None,
    n: int = 5,
    provider: str = "openai",
    contexts: Optional[List[str]] = None,
    topics: Optional[List[str]] = None,
    studyKitId: Optional[str] = None,
    use_retriever: bool = True,
) -> dict:
    """
    Generate flashcards for a topic or topics (with optional context).
    """
    topics = await get_topics(topic, topics, studyKitId, provider)
    aggregated = {"flashcards": []}

    per_topic = max(1, n // max(1, len(topics)))
    provider_obj = LLMProvider(provider=provider, temperature=0.3)

    for t in topics:
        prompt = build_prompt(FLASHCARD_PROMPT, per_topic, t, contexts)
        raw = await provider_obj.generate("Generate Flashcards JSON", prompt)

        parsed = extract_json_from_text(raw)
        validated = FlashcardsResponse(**parsed)  # Expect {"flashcards":[...]}
        aggregated["flashcards"].extend(validated.flashcards)

    return aggregated


# --- TESTS ---
async def generate_test_llm(
    topic: str = None,
    n: int = 10,
    provider: str = "openai",
    contexts: Optional[List[str]] = None,
    topics: Optional[List[str]] = None,
    studyKitId: Optional[str] = None,
    use_retriever: bool = True,
) -> dict:
    """
    Generate test questions (mixture of MCQs, short answers, etc.)
    """
    topics = await get_topics(topic, topics, studyKitId, provider)
    aggregated = {"questions": []}

    per_topic = max(1, n // max(1, len(topics)))
    provider_obj = LLMProvider(provider=provider, temperature=0.3)

    for t in topics:
        prompt = build_prompt(TEST_PROMPT, per_topic, t, contexts)
        raw = await provider_obj.generate("Generate Test Questions JSON", prompt)

        parsed = extract_json_from_text(raw)
        validated = TestResponse(**parsed)  # Expect {"questions":[...]}
        aggregated["questions"].extend(validated.questions)

    return aggregated




async def create_test_llm(
    topic: Optional[str] = None,
    n: int = 20,
    provider: str = "openai",
    contexts: Optional[List[str]] = None,
    studyKitId: Optional[str] = None
) -> dict:
    """
    Generate a test (MCQs + short answers + true/false).
    - If studyKitId: derive topics automatically
    - Else: use provided topic
    """

    if not topic and studyKitId:
        res = await extract_key_topics(studyKitId=studyKitId, k=6, provider=provider)
        topics = [t["topic"] for t in res.get("topics", [])]
    else:
        topics = [topic] if topic else []

    aggregated = {"test": []}
    per_topic = max(1, n // max(1, len(topics)))

    for t in topics:
        user_prompt = TEST_PROMPT.format(n=per_topic, topic=t)
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
    provider_obj = LLMProvider(provider=provider, temperature=0.0)
    system_prompt = "You are a summarizer. Output only strict JSON with a summary field."
    user_prompt = SUMMARIZE_PROMPT.format(text=text)
    return await run_and_validate(provider_obj, system_prompt, user_prompt, SummarizeResponse)

# async def summarize_large_document_from_text(text: str, provider: str = "openai", max_concurrency: int = 6) -> dict:
#     # 1. chunk text (you can adjust sizes)
#     docs = chunk_text_into_docs(text, metadata={})
#     chunks = [d.page_content for d in docs]

#     # 2. summarize chunks concurrently (map)
#     provider_obj = LLMProvider(provider=provider, temperature=0.0)
#     async def summarize_chunk(chunk):
#         user_prompt = CHUNK_SUMMARIZE_PROMPT.format(chunk_text=chunk)
#         raw = await provider_obj.generate("Summarize chunk", user_prompt)
#         parsed = extract_json_from_text(raw)
#         return parsed.get("summary", "")

#     sem = asyncio.Semaphore(max_concurrency)
#     async def sem_summarize(c):
#         async with sem:
#             return await summarize_chunk(c)

#     chunk_summaries = await asyncio.gather(*[sem_summarize(c) for c in chunks])

#     # 3. reduce: combine summaries into final summary
#     combined = "\n".join(f"- {s}" for s in chunk_summaries if s)
#     provider_obj2 = LLMProvider(provider=provider, temperature=0.0)
#     user_prompt = FINAL_SUMMARIZE_PROMPT.format(chunk_summaries=combined)
#     raw_final = await provider_obj2.generate("Combine summaries", user_prompt)
#     parsed_final = extract_json_from_text(raw_final)
#     try:
#         validated = SummarizeResponse(**parsed_final)
#         return validated.dict()
#     except ValidationError as e:
#         raise RuntimeError(f"Final summary validation failed: {e}\nRAW:{raw_final}")



# async def rag_chat_no_context(query: str, provider: str = "openai") -> dict:
#     provider_obj = LLMProvider(provider=provider, temperature=0.0)
#     system_prompt = "You are a helpful assistant. Output strict JSON only."
#     user_prompt = f"""Answer the following question. Output strict JSON only:
# {{ "answer": "<text>", "citations": [] }}
# Question: {query}"""
#     return await run_and_validate(provider_obj, system_prompt, user_prompt, RAGResponse)


# async def rag_chat_with_context(query: str, contexts: List[str], provider: str = "openai") -> dict:
#     # contexts: list of textual chunks (strings). Limit size upstream.
#     provider_obj = LLMProvider(provider=provider, temperature=0.0)
#     # join contexts but keep them short to meet token budgets
#     joined = "\n\n---\n\n".join(contexts[:6])
#     system_prompt = "You MUST use ONLY the provided context for facts. If it's not in the context say you don't know. Output strict JSON only."
#     user_prompt = RAG_PROMPT_TEMPLATE.format(context=joined, query=query)
#     return await run_and_validate(provider_obj, system_prompt, user_prompt, RAGResponse)


async def rag_chat_with_retriever_only(
    query: str,
    provider: str = "openai",
    k: int = 4,
    collection: Optional[str] = None,
    max_chars_per_doc: int = 2000
) -> dict:
    """
    Retrieve top-k chunks (via get_contexts_for_query), force model to use ONLY that
    context, and return validated JSON { "answer": "<text>", "citations": ["<source labels>"] }.
    """

    # 1) fetch contexts (strings). They may be prefixed like "[filename] content"
    contexts = get_contexts_for_query(query, k=k, collection_name=collection)
    if not contexts:
        return {"answer": "I don't know — no relevant context found.", "citations": []}

    # 2) build numbered context and a map index -> readable label
    context_pieces = []
    citation_labels = []
    for i, ctx in enumerate(contexts, start=1):
        # attempt to extract "[label]" prefix if present
        m = re.match(r"^\s*\[(?P<label>[^\]]+)\]\s*(?P<body>.*)$", ctx, flags=re.DOTALL)
        if m:
            label = m.group("label").strip()
            body = m.group("body").strip()
        else:
            label = f"doc_{i}"
            body = ctx.strip()

        # truncate to control prompt size
        snippet = body[:max_chars_per_doc].strip()
        # label the chunk with its index so the model can cite [1], [2] etc.
        context_pieces.append(f"[{i}] Source: {label}\n{snippet}")
        citation_labels.append(label)

    joined_context = "\n\n---\n\n".join(context_pieces)

    # 3) strong system + user prompts that require "use ONLY the context" and return strict JSON
    system_prompt = (
        "You are an assistant that MUST answer using ONLY the provided CONTEXT. "
        "Do NOT use external knowledge or prior training data. If the answer cannot be "
        "found in the context, reply with exactly: \"I don't know.\" "
        "Return strict JSON only matching this schema: "
        "{\"answer\": \"<answer text>\", \"citations\": [\"<source-label>\", ...]} "
        "Do not include any explanation or extra fields."
    )

    # Be explicit about the citation format we expect in the JSON 'citations' field.
    # Also tell the model it may reference chunks in the text using [1], [2], etc.
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

    # 4) Run + validate
    # run_and_validate will call provider_obj.generate(...) and validate against RAGResponse
    return await run_and_validate(provider_obj, system_prompt, user_prompt, RAGResponse)




