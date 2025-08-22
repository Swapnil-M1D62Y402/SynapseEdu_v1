# app/services/ingest.py
from app.db.supabase_client import fetch_unprocessed_sources, mark_source_processed
from app.services.loader import download_bytes, bytes_to_text
from app.services.vectorstore import chunk_text_into_docs, upsert_documents_to_pgvector
import logging

logger = logging.getLogger(__name__)

def ingest_pending_sources(limit: int = 50, collection_name: str = None) -> dict:
    """
    Fetch unprocessed Source rows, ingest them to vector DB, mark processed.
    Returns summary dict.
    """
    rows = fetch_unprocessed_sources(limit=limit)
    if not rows:
        return {"ingested": 0, "skipped": 0}

    total = 0
    skipped = 0
    for r in rows:
        src_id = r.get("id")
        url = r.get("fileUrl")
        if not url:
            skipped += 1
            continue
        try:
            b = download_bytes(url)
            text, mime = bytes_to_text(url, b)
            if not text or not text.strip():
                logger.warning("No text extracted for %s", url)
                skipped += 1
                # mark processed to avoid repeated attempts (optional)
                mark_source_processed(src_id)
                continue

            metadata = {
                "source_id": src_id,
                "file_url": url,
                "file_name": r.get("fileName"),
                "file_type": r.get("fileType") or mime,
                "studyKitId": r.get("studyKitId")
            }
            docs = chunk_text_into_docs(text, metadata)
            upsert_documents_to_pgvector(docs, collection_name=collection_name)
            mark_source_processed(src_id)
            total += len(docs)
        except Exception as e:
            logger.exception("Failed to ingest %s: %s", url, e)
            # don't mark processed so we can retry later
            skipped += 1

    return {"ingested": total, "skipped": skipped, "sources_processed": len(rows) - skipped}
