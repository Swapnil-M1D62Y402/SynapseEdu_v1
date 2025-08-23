from fastapi import APIRouter , HTTPException
from pydantic import BaseModel 
from app.services.generators import rag_chat_with_retriever_only
from typing import Optional

router = APIRouter()

class RAGRequest(BaseModel):
    query: str
    provider: Optional[str] = "openai"
    collection: Optional[str] = None
    k: Optional[int] = 4


@router.post("/chat")
async def chat_rag(req: RAGRequest):

    """
    Endpoint to handle RAG chatbot queries.
    """
    try:
        response = await rag_chat_with_retriever_only(
            query=req.query,
            provider=req.provider,
            k=req.k,
            collection=req.collection
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
