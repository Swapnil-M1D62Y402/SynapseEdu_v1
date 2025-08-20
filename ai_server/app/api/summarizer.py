from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.summarizer_services import summarize_text

router = APIRouter()

class SummarizeRequest(BaseModel):
    text: str

class SummarizeResponse(BaseModel):
    summary: str

@router.post("/")
async def summarize_endpoint(req: SummarizeRequest):
    """
    Endpoint to create summarize based on the provided context.
    """
    try:
        summary = await summarize_text(req.text)
        return SummarizeResponse(summary=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
