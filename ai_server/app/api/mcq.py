from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.generators import generate_mcqs_llm

router = APIRouter()

class MCQRequest(BaseModel):
    topic: str
    num_questions: int = 5
    provider: str = "openai"
                  

@router.post("/create")
async def create_mcqs(req: MCQRequest):
    """
    Endpoint to create MCQs based on the provided topic and number of questions.
    """

    try:
        mcq_result = await generate_mcqs_llm(
            topic=req.topic,
            n=req.num_questions,
            provider=req.provider if hasattr(req, 'provider') else "openai",
            )
        return mcq_result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
