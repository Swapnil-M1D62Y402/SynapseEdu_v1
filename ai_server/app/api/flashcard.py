from fastapi import APIRouter, HTTPException 
from pydantic import BaseModel
from app.services.generators import generate_flashcards_llm

router = APIRouter()

class FlashCardRequest(BaseModel):
    topic: str
    num_flashcards: int = 5
    provider: str = "openai"


@router.post("/create")
async def create_flashcard_endpoint(req: FlashCardRequest):
    """
    Endpoint to create flashcards based on the provided topic and number of flashcards.
    """
    try:
        flashcard_result = await generate_flashcards_llm(
            topic=req.topic,
            n=req.num_flashcards,
            provider=req.provider if hasattr(req, 'provider') else "openai"
        )
        return flashcard_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))