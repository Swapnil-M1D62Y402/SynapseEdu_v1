# app/api/mcq.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.generators import generate_mcqs_llm

router = APIRouter()

class MCQRequest(BaseModel):
    topic: Optional[str] = None
    num_questions: int = 5
    provider: str = "openai"
    studyKitId: Optional[str] = None
    topics: Optional[List[str]] = None
    use_retriever: bool = True
    collection_name: Optional[str] = None

@router.post("/create")
async def create_mcqs(req: MCQRequest):
    """
    Endpoint to create MCQs based on topic, studyKit, or explicit topics list.
    Priority: explicit topics > studyKitId extraction > single topic
    """
    try:
        mcq_result = await generate_mcqs_llm(
            topic=req.topic,
            n=req.num_questions,
            provider=req.provider,
            topics=req.topics,
            studyKitId=req.studyKitId,
            use_retriever=req.use_retriever,
            contexts=None  # Let the function handle context retrieval
        )
        return mcq_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))