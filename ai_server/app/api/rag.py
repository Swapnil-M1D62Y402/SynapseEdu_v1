from fastapi import APIRouter , HTTPException
from pydantic import BaseModel 
from app.services.rag_services import generate_rag_response

router = APIRouter()

class RAGRequest(BaseModel):
    query: str

class RAGResponse(BaseModel):
    response: str 


@router.post("/chat")
async def chat_rag(req: RAGRequest):

    """
    Endpoint to handle RAG chatbot queries.
    """
    try:
        response = await generate_rag_response(req.query)
        return RAGResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
