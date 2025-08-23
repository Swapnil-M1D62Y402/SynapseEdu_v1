# app/api/test_creation.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.generators import create_test_llm

router = APIRouter()

class TestRequest(BaseModel):
    topic: Optional[str] = None
    num_questions: int = 5
    difficulty: str = "easy"
    provider: str = "openai"
    studyKitId: Optional[str] = None

@router.post("/create")
async def create_test_endpoint(req: TestRequest):
    """
    Endpoint to create a test based on topic or studyKit.
    """
    try:
        test_result = await create_test_llm(
            topic=req.topic,
            n=req.num_questions,
            difficulty=req.difficulty,
            provider=req.provider,
            studyKitId=req.studyKitId
        )
        return test_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))