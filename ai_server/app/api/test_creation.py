from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.generators import create_test_llm

router = APIRouter()

class TestRequest(BaseModel):
    topic: str
    num_questions: int = 5
    difficulty: str = "easy"
    provider: str = "openai"

@router.post("/create")
async def create_test_endpoint(req: TestRequest):
    """
    Endpoint to create a test based on the provided topic, number of questions, and difficulty.
    """
    try:
        test_result = await create_test_llm(
            topic=req.topic,
            n=req.num_questions,
            difficulty=req.difficulty,
            provider=req.provider if hasattr(req, 'provider') else "openai"
            )
        return test_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
