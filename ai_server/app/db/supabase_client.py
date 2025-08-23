from supabase import create_client
import os 
from dotenv import load_dotenv 
load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env")

supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def fetch_processed_sources(studyKitId: str | None = None, limit: int = 1000):
    q = supabase_client.table("Source").select("*").eq("processed", True).limit(limit)
    if studyKitId:
        q = q.eq("studyKitId", studyKitId)
    res = q.execute()
    return res.data or []

def fetch_unprocessed_sources(limit: int=50):
    """
    Returns list of rows from the Source table where processed = false.
    Each row is a dict with fields: id, studyKitId, fileUrl, fileName, fileType, ...
    """
     
    try:
        res = supabase_client.table("Source").select("*").eq("processed", False).limit(limit).execute()
    except Exception as e:
        raise RuntimeError("Failed to fetch unprocessed sources from Supabase. Error:" + str(e))

def mark_source_processed(source_id: str):
    """
    Marks the source with the given ID as processed in the database.
    """
    try:
        res = supabase_client.table("Source").update({"processed": True}).eq("id", source_id).execute()
        if res.status_code != 200:
            raise RuntimeError(f"Failed to mark source {source_id} as processed. Status code: {res.status_code}")
    except Exception as e:
        raise RuntimeError(f"Failed to mark source {source_id} as processed. Error: {e}")
                                 
