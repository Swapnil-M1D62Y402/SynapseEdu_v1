from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.test_services import generate_test

router = APIRouter()

class TestRequest(BaseModel):
    topic: str
    num_questions: int = 5
    difficulty: str = "easy"

class TestResponse(BaseModel):
    test: list[str]


@router.post("/create")
async def create_test_endpoint(req: TestRequest):
    """
    Endpoint to create a test based on the provided topic, number of questions, and difficulty.
    """
    try:
        test_result = await generate_test(req.topic,
                                   req.num_questions,
                                   req.difficulty)
        return TestResponse(test=test_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
