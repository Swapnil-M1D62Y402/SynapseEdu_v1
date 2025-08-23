# app/db/supabase_client.py
import os
from typing import List, Dict, Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# if not SUPABASE_URL or not SUPABASE_ANON_KEY:
#     raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")

# supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def fetch_unprocessed_sources(limit: int = 50) -> List[Dict]:
    """
    Fetch unprocessed Source records from Supabase.
    Returns list of dictionaries with source data.
    """
    try:
        response = (
            supabase.table("Source")
            .select("*")
            .eq("processed", False)
            .limit(limit)
            .execute()
        )
        return response.data
    except Exception as e:
        raise RuntimeError(f"Failed to fetch unprocessed sources: {e}")

def fetch_processed_sources(studyKitId: Optional[str] = None) -> List[Dict]:
    """
    Fetch processed Source records, optionally filtered by studyKitId.
    """
    try:
        query = supabase.table("Source").select("*").eq("processed", True)
        
        if studyKitId:
            query = query.eq("studyKitId", studyKitId)
            
        response = query.execute()
        return response.data
    except Exception as e:
        raise RuntimeError(f"Failed to fetch processed sources: {e}")

def mark_source_processed(source_id: str, loader_used: str = None) -> bool:
    """
    Mark a source as processed in the database.
    """
    try:
        update_data = {"processed": True}
        if loader_used:
            update_data["loaderUsed"] = loader_used
            
        response = (
            supabase.table("Source")
            .update(update_data)
            .eq("id", source_id)
            .execute()
        )
        return len(response.data) > 0
    except Exception as e:
        raise RuntimeError(f"Failed to mark source as processed: {e}")

def get_sources_by_study_kit(studyKitId: str) -> List[Dict]:
    """
    Get all sources for a specific study kit.
    """
    try:
        response = (
            supabase.table("Source")
            .select("*")
            .eq("studyKitId", studyKitId)
            .execute()
        )
        return response.data
    except Exception as e:
        raise RuntimeError(f"Failed to fetch sources for studyKitId {studyKitId}: {e}")

def get_source_by_id(source_id: str) -> Optional[Dict]:
    """
    Get a single source by ID.
    """
    try:
        response = (
            supabase.table("Source")
            .select("*")
            .eq("id", source_id)
            .single()
            .execute()
        )
        return response.data
    except Exception as e:
        print(f"Failed to fetch source {source_id}: {e}")
        return None