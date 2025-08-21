from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.generators import summarize_llm

router = APIRouter()

class SummarizeRequest(BaseModel):
    text: str
    provider: str = "openai"


@router.post("/")
async def summarize_endpoint(req: SummarizeRequest):
    """
    Endpoint to create summarize based on the provided context.
    """
    try:
        summary_response = await summarize_llm(
            text=req.text,
            provider=req.provider if hasattr(req, 'provider') else "openai"
        )
        return summary_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
