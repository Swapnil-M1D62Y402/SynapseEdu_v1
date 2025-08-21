from fastapi import APIRouter , HTTPException
from pydantic import BaseModel 
from app.services.generators import rag_chat_no_context

router = APIRouter()

class RAGRequest(BaseModel):
    query: str
    provider: str = "openai"


@router.post("/chat")
async def chat_rag(req: RAGRequest):

    """
    Endpoint to handle RAG chatbot queries.
    """
    try:
        response = await rag_chat_no_context(
            query=req.query,
            provider=req.provider if hasattr(req, 'provider') else "openai"
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
