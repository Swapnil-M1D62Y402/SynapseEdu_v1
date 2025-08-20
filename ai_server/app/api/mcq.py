from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.mcq_services import generate_mcqs

router = APIRouter()

class MCQRequest(BaseModel):
    topic: str
    num_questions: int = 5

class MCQ(BaseModel):
    question: str
    options: list[str]
    answer: str

class MCQResponse(BaseModel):
    mcqs: list[MCQ]
                  

@router.post("/create")
async def create_mcqs(req: MCQRequest):
    """
    Endpoint to create MCQs based on the provided topic and number of questions.
    """

    try:
        mcq_dicts = await generate_mcqs(req.topic, req.num_questions)
        # mcqs = [MCQ(**mcq) for mcq in mcq_dicts]
        return MCQResponse(mcqs=mcq_dicts)
        # return {"mcqs": mcq_dicts}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
