# app/api/flashcard.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.generators import generate_flashcards_llm

router = APIRouter()

class FlashCardRequest(BaseModel):
    topic: Optional[str] = None
    num_flashcards: int = 5
    provider: str = "openai"
    studyKitId: Optional[str] = None
    topics: Optional[List[str]] = None
    use_retriever: bool = True

@router.post("/create")
async def create_flashcard_endpoint(req: FlashCardRequest):
    """
    Endpoint to create flashcards based on topic, studyKit, or explicit topics.
    """
    try:
        flashcard_result = await generate_flashcards_llm(
            topic=req.topic,
            n=req.num_flashcards,
            provider=req.provider,
            topics=req.topics,
            studyKitId=req.studyKitId,
            use_retriever=req.use_retriever
        )
        return flashcard_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))