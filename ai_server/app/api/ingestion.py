# app/api/ingestion.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from app.services.ingestion_manager import ingestion_manager

router = APIRouter()

class IngestRequest(BaseModel):
    limit: Optional[int] = 50
    max_concurrency: Optional[int] = 5
    collection_name: Optional[str] = None

class StudyKitIngestRequest(BaseModel):
    studyKitId: str
    max_concurrency: Optional[int] = 5
    collection_name: Optional[str] = None

@router.post("/ingest/pending")
async def ingest_pending_sources(req: IngestRequest):
    """
    Process all pending (unprocessed) sources from the database.
    """
    try:
        # Set collection name if provided
        if req.collection_name:
            ingestion_manager.collection_name = req.collection_name
            
        result = await ingestion_manager.ingest_pending_sources(
            limit=req.limit,
            max_concurrency=req.max_concurrency
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

@router.post("/ingest/study-kit")
async def ingest_study_kit_sources(req: StudyKitIngestRequest):
    """
    Process all unprocessed sources for a specific study kit.
    """
    try:
        # Set collection name if provided
        if req.collection_name:
            ingestion_manager.collection_name = req.collection_name
            
        result = await ingestion_manager.ingest_study_kit_sources(
            studyKitId=req.studyKitId,
            max_concurrency=req.max_concurrency
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Study kit ingestion failed: {str(e)}")

@router.post("/ingest/background/pending")
async def ingest_pending_sources_background(background_tasks: BackgroundTasks, req: IngestRequest):
    """
    Process pending sources in the background and return immediately.
    """
    try:
        async def run_ingestion():
            if req.collection_name:
                ingestion_manager.collection_name = req.collection_name
            await ingestion_manager.ingest_pending_sources(
                limit=req.limit,
                max_concurrency=req.max_concurrency
            )
        
        background_tasks.add_task(run_ingestion)
        return {"message": "Ingestion started in background", "status": "accepted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start background ingestion: {str(e)}")

@router.post("/ingest/background/study-kit")
async def ingest_study_kit_background(background_tasks: BackgroundTasks, req: StudyKitIngestRequest):
    """
    Process study kit sources in the background.
    """
    try:
        async def run_ingestion():
            if req.collection_name:
                ingestion_manager.collection_name = req.collection_name
            await ingestion_manager.ingest_study_kit_sources(
                studyKitId=req.studyKitId,
                max_concurrency=req.max_concurrency
            )
        
        background_tasks.add_task(run_ingestion)
        return {
            "message": f"Study kit ingestion started in background",
            "studyKitId": req.studyKitId,
            "status": "accepted"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start background ingestion: {str(e)}")

@router.get("/ingest/status")
async def get_ingestion_status():
    """
    Get the current status of unprocessed sources.
    """
    try:
        from app.db.supabase_client import fetch_unprocessed_sources, fetch_processed_sources
        
        unprocessed = fetch_unprocessed_sources(limit=1000)  # Get count
        processed = fetch_processed_sources()
        
        return {
            "unprocessed_count": len(unprocessed),
            "processed_count": len(processed),
            "total_sources": len(unprocessed) + len(processed)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")