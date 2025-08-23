from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.api import rag, test_creation, flashcard, summarizer, mcq, ingestion

 
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = FastAPI(
    title="AI Backend Server",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    # allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routes
app.include_router(mcq.router, prefix="/api/mcq", tags=["MCQ"])
app.include_router(flashcard.router, prefix="/api/flashcards", tags=["Flashcards"])
app.include_router(test_creation.router, prefix="/api/tests", tags=["Tests"])
app.include_router(rag.router, prefix="/api/rag", tags=["RAG Chat"])
app.include_router(summarizer.router, prefix="/api/summarize", tags=["Summarization"])
app.include_router(ingestion.router, prefix="/api", tags=["Ingestion"])


@app.get("/")
async def root():
    return {"message": "StudyKit AI Backend is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "All systems operational"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8008, reload=True)
