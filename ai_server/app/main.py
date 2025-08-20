from fastapi import FastAPI

from app.api import rag, test_creation, flashcard, summarizer, mcq

app = FastAPI(
    title="AI Backend Server",
    version="0.1.0"
)

app.include_router(rag.router, prefix="/rag", tags=["RAG Chatbot"])
app.include_router(test_creation.router, prefix="/test", tags=["Test Creation"])
app.include_router(flashcard.router, prefix="/flashcard", tags=["Flashcards"])
app.include_router(summarizer.router, prefix="/summarizer", tags=["Text Summarization"])
app.include_router(mcq.router, prefix="/mcq", tags=["MCQ Generation"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
