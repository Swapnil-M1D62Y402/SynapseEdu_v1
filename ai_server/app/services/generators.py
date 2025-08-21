# app/services/generators.py
from typing import List, Optional
from pydantic import ValidationError
from app.services.llm import LLMProvider
from app.services.json_utils import extract_json_from_text
from app.schemas.generators import (
    MCQResponse, FlashcardsResponse, TestResponse, SummarizeResponse, RAGResponse
)

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


async def generate_mcqs_llm(topic: str, n: int = 5, provider: str = "openai") -> dict:
    provider_obj = LLMProvider(provider=provider, temperature=0.3)
    system_prompt = "You are a high-quality MCQ generator. Output ONLY the JSON document requested."
    user_prompt = MCQ_PROMPT.format(n=n, topic=topic)
    return await run_and_validate(provider_obj, system_prompt, user_prompt, MCQResponse)


async def generate_flashcards_llm(topic: str, n: int = 10, provider: str = "openai") -> dict:
    provider_obj = LLMProvider(provider=provider, model="gpt-4o", temperature=0.3)
    system_prompt = "You are a flashcard generator. Output ONLY valid JSON of the requested schema."
    user_prompt = FLASHCARD_PROMPT.format(n=n, topic=topic)
    return await run_and_validate(provider_obj, system_prompt, user_prompt, FlashcardsResponse)


async def create_test_llm(topic: str, n: int = 10, difficulty:str="easy", provider: str = "openai") -> dict:
    provider_obj = LLMProvider(provider=provider, temperature=0.0)
    system_prompt = "You are an exam generator. Output EXACT JSON for the requested schema."
    user_prompt = TEST_PROMPT.format(n=n, topic=topic, difficulty=difficulty)
    return await run_and_validate(provider_obj, system_prompt, user_prompt, TestResponse)


async def summarize_llm(text: str, provider: str = "openai") -> dict:
    provider_obj = LLMProvider(provider=provider, temperature=0.0)
    system_prompt = "You are a summarizer. Output only strict JSON with a summary field."
    user_prompt = SUMMARIZE_PROMPT.format(text=text)
    return await run_and_validate(provider_obj, system_prompt, user_prompt, SummarizeResponse)


async def rag_chat_no_context(query: str, provider: str = "openai") -> dict:
    provider_obj = LLMProvider(provider=provider, temperature=0.0)
    system_prompt = "You are a helpful assistant. Output strict JSON only."
    user_prompt = f"""Answer the following question. Output strict JSON only:
{{ "answer": "<text>", "citations": [] }}
Question: {query}"""
    return await run_and_validate(provider_obj, system_prompt, user_prompt, RAGResponse)


async def rag_chat_with_context(query: str, contexts: List[str], provider: str = "openai") -> dict:
    # contexts: list of textual chunks (strings). Limit size upstream.
    provider_obj = LLMProvider(provider=provider, temperature=0.0)
    # join contexts but keep them short to meet token budgets
    joined = "\n\n---\n\n".join(contexts[:6])
    system_prompt = "You MUST use ONLY the provided context for facts. If it's not in the context say you don't know. Output strict JSON only."
    user_prompt = RAG_PROMPT_TEMPLATE.format(context=joined, query=query)
    return await run_and_validate(provider_obj, system_prompt, user_prompt, RAGResponse)
