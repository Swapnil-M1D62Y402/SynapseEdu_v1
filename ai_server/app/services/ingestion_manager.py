# # app/services/ingestion_manager.py
# import asyncio
# from typing import List, Dict, Optional
# from app.db.supabase_client import (
#     fetch_unprocessed_sources, 
#     mark_source_processed, 
#     get_sources_by_study_kit
# )
# from app.services.loader import download_bytes, bytes_to_text
# from app.services.vectorstore import chunk_text_into_docs, upsert_documents_to_pgvector
# import logging

# logger = logging.getLogger(__name__)

# class IngestionManager:
#     def __init__(self, collection_name: str = None):
#         self.collection_name = collection_name
    
#     async def process_single_source(self, source_record: Dict) -> Dict:
#         """Process a single source record"""
#         source_id = source_record.get("id")
#         url = source_record.get("fileUrl")
#         file_name = source_record.get("fileName", "unknown")
        
#         try:
#             # Download and extract text
#             content_bytes = download_bytes(url)
#             text, detected_type = bytes_to_text(url, content_bytes)
            
#             if not text or not text.strip():
#                 logger.warning(f"No text extracted from {file_name}")
#                 return {
#                     "source_id": source_id,
#                     "status": "skipped",
#                     "reason": "no_text_content",
#                     "chunks": 0
#                 }
            
#             # Create metadata
#             metadata = {
#                 "source_id": source_id,
#                 "file_url": url,
#                 "file_name": file_name,
#                 "file_type": source_record.get("fileType") or detected_type,
#                 "studyKitId": source_record.get("studyKitId"),
#                 "file_size": source_record.get("fileSize")
#             }
            
#             # Create document chunks
#             docs = chunk_text_into_docs(text, metadata)
            
#             # Store in vector database
#             upsert_documents_to_pgvector(docs, collection_name=self.collection_name)
            
#             # Mark as processed
#             mark_source_processed(source_id, loader_used=detected_type)
            
#             logger.info(f"Successfully processed {file_name}: {len(docs)} chunks")
            
#             return {
#                 "source_id": source_id,
#                 "status": "success", 
#                 "chunks": len(docs),
#                 "file_name": file_name,
#                 "detected_type": detected_type
#             }
            
#         except Exception as e:
#             logger.error(f"Failed to process {file_name} (ID: {source_id}): {e}")
#             return {
#                 "source_id": source_id,
#                 "status": "failed",
#                 "error": str(e),
#                 "chunks": 0
#             }
    
#     async def ingest_pending_sources(self, limit: int = 50, max_concurrency: int = 5) -> Dict:
#         """Process unprocessed sources with concurrency control"""
#         sources = fetch_unprocessed_sources(limit=limit)
        
#         if not sources:
#             return {
#                 "total_sources": 0,
#                 "processed": 0,
#                 "failed": 0,
#                 "skipped": 0,
#                 "results": []
#             }
        
#         # Process sources with concurrency limit
#         semaphore = asyncio.Semaphore(max_concurrency)
        
#         async def process_with_semaphore(source):
#             async with semaphore:
#                 return await self.process_single_source(source)
        
#         results = await asyncio.gather(
#             *[process_with_semaphore(source) for source in sources],
#             return_exceptions=True
#         )
        
#         # Aggregate results
#         processed = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "success")
#         failed = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "failed")
#         skipped = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "skipped")
        
#         return {
#             "total_sources": len(sources),
#             "processed": processed,
#             "failed": failed, 
#             "skipped": skipped,
#             "results": results
#         }
    
#     async def ingest_study_kit_sources(self, studyKitId: str, max_concurrency: int = 5) -> Dict:
#         """Process all sources for a specific study kit"""
#         sources = get_sources_by_study_kit(studyKitId)
#         unprocessed_sources = [s for s in sources if not s.get("processed", False)]
        
#         if not unprocessed_sources:
#             return {
#                 "studyKitId": studyKitId,
#                 "total_sources": len(sources),
#                 "already_processed": len(sources),
#                 "newly_processed": 0,
#                 "failed": 0,
#                 "skipped": 0
#             }
        
#         # Process with concurrency
#         semaphore = asyncio.Semaphore(max_concurrency)
        
#         async def process_with_semaphore(source):
#             async with semaphore:
#                 return await self.process_single_source(source)
        
#         results = await asyncio.gather(
#             *[process_with_semaphore(source) for source in unprocessed_sources],
#             return_exceptions=True
#         )
        
#         # Aggregate results
#         processed = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "success")
#         failed = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "failed")
#         skipped = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "skipped")
        
#         return {
#             "studyKitId": studyKitId,
#             "total_sources": len(sources),
#             "already_processed": len(sources) - len(unprocessed_sources),
#             "newly_processed": processed,
#             "failed": failed,
#             "skipped": skipped,
#             "results": results
#         }

# # Global instance
# ingestion_manager = IngestionManager()


# app/services/ingestion_manager.py
import asyncio
from typing import List, Dict, Optional
from app.db.supabase_client import (
    fetch_unprocessed_sources, 
    mark_source_processed, 
    get_sources_by_study_kit
)
from app.services.loader import download_bytes, bytes_to_text
# NOTE: changed import to use the Chroma-backed function but keep the old name for compatibility
from app.services.vectorstore import chunk_text_into_docs, upsert_documents_to_vectorstore as upsert_documents_to_pgvector
import logging

logger = logging.getLogger(__name__)

class IngestionManager:
    def __init__(self, collection_name: str = None):
        self.collection_name = collection_name
    
    async def process_single_source(self, source_record: Dict) -> Dict:
        """Process a single source record"""
        source_id = source_record.get("id")
        url = source_record.get("fileUrl")
        file_name = source_record.get("fileName", "unknown")
        
        try:
            # Download and extract text
            content_bytes = download_bytes(url)
            text, detected_type = bytes_to_text(url, content_bytes)
            
            if not text or not text.strip():
                logger.warning(f"No text extracted from {file_name}")
                return {
                    "source_id": source_id,
                    "status": "skipped",
                    "reason": "no_text_content",
                    "chunks": 0
                }
            
            # Create metadata
            metadata = {
                "source_id": source_id,
                "file_url": url,
                "file_name": file_name,
                "file_type": source_record.get("fileType") or detected_type,
                "studyKitId": source_record.get("studyKitId"),
                "file_size": source_record.get("fileSize")
            }
            
            # Create document chunks
            docs = chunk_text_into_docs(text, metadata)
            
            # Store in vector database (this now calls the Chroma-backed implementation)
            upsert_documents_to_pgvector(docs, collection_name=self.collection_name)
            
            # Mark as processed
            mark_source_processed(source_id, loader_used=detected_type)
            
            logger.info(f"Successfully processed {file_name}: {len(docs)} chunks")
            
            return {
                "source_id": source_id,
                "status": "success", 
                "chunks": len(docs),
                "file_name": file_name,
                "detected_type": detected_type
            }
            
        except Exception as e:
            logger.error(f"Failed to process {file_name} (ID: {source_id}): {e}")
            return {
                "source_id": source_id,
                "status": "failed",
                "error": str(e),
                "chunks": 0
            }
    
    async def ingest_pending_sources(self, limit: int = 50, max_concurrency: int = 5) -> Dict:
        """Process unprocessed sources with concurrency control"""
        sources = fetch_unprocessed_sources(limit=limit)
        
        if not sources:
            return {
                "total_sources": 0,
                "processed": 0,
                "failed": 0,
                "skipped": 0,
                "results": []
            }
        
        # Process sources with concurrency limit
        semaphore = asyncio.Semaphore(max_concurrency)
        
        async def process_with_semaphore(source):
            async with semaphore:
                return await self.process_single_source(source)
        
        results = await asyncio.gather(
            *[process_with_semaphore(source) for source in sources],
            return_exceptions=True
        )
        
        # Aggregate results
        processed = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "success")
        failed = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "failed")
        skipped = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "skipped")
        
        return {
            "total_sources": len(sources),
            "processed": processed,
            "failed": failed, 
            "skipped": skipped,
            "results": results
        }
    
    async def ingest_study_kit_sources(self, studyKitId: str, max_concurrency: int = 5) -> Dict:
        """Process all sources for a specific study kit"""
        sources = get_sources_by_study_kit(studyKitId)
        unprocessed_sources = [s for s in sources if not s.get("processed", False)]
        
        if not unprocessed_sources:
            return {
                "studyKitId": studyKitId,
                "total_sources": len(sources),
                "already_processed": len(sources),
                "newly_processed": 0,
                "failed": 0,
                "skipped": 0
            }
        
        # Process with concurrency
        semaphore = asyncio.Semaphore(max_concurrency)
        
        async def process_with_semaphore(source):
            async with semaphore:
                return await self.process_single_source(source)
        
        results = await asyncio.gather(
            *[process_with_semaphore(source) for source in unprocessed_sources],
            return_exceptions=True
        )
        
        # Aggregate results
        processed = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "success")
        failed = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "failed")
        skipped = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "skipped")
        
        return {
            "studyKitId": studyKitId,
            "total_sources": len(sources),
            "already_processed": len(sources) - len(unprocessed_sources),
            "newly_processed": processed,
            "failed": failed,
            "skipped": skipped,
            "results": results
        }

# Global instance
ingestion_manager = IngestionManager()





