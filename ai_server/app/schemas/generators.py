# app/schemas/generators.py
from pydantic import BaseModel
from typing import List, Optional

class Choice(BaseModel):
    key: str
    text: str

class MCQ(BaseModel):
    id: str
    questionId: int
    question: str
    choices: List[Choice]
    correctOption: str
    explanation: List[str]
    difficulty: str
    tags: List[str]
    confidence: float

class MCQResponse(BaseModel):
    mcqs: List[MCQ]

class FlashcardItem(BaseModel):
    id: str  # Added this field
    front: str
    back: str

class FlashcardsResponse(BaseModel):
    flashcards: List[FlashcardItem]

class TestItem(BaseModel):
    question: str
    type: str  # "mcq" / "short_answer" / "true_false"
    options: Optional[List[str]] = None  # Changed from List[str] | None
    answer: str

class TestResponse(BaseModel):
    test: List[TestItem]

class SummarizeResponse(BaseModel):
    summary: str

class RAGResponse(BaseModel):
    answer: str
    citations: Optional[List[str]] = None  # Changed from List[str] | None