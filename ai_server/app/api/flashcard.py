from fastapi import APIRouter, HTTPException 
from pydantic import BaseModel
from app.services.flashcard_services import generate_flashcard

router = APIRouter()

class FlashCardRequest(BaseModel):
    topic: str
    num_flashcards: int = 5

class FlashCardResponse(BaseModel):
    flashcards: list[str]

@router.post("/create")
async def create_flashcard_endpoint(req: FlashCardRequest):
    """
    Endpoint to create flashcards based on the provided topic and number of flashcards.
    """
    try:
        flashcard_result = await generate_flashcard(
            req.topic,
            req.num_flashcards
        )
        return FlashCardResponse(flashcards=flashcard_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))