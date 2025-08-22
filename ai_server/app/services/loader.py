import os
import httpx 
import tempfile 
from typing import Tuple 
from pypdf import PdfReader
import docx2txt

def download_bytes(url: str, timeout: int=60)->bytes:
    """
    Downloads the content from the given URL and returns it as bytes.
    """
    try:
        with httpx.Client(follow_redirects=True, timeout=timeout) as client:
            response = client.get(url)
            response.raise_for_status()
            return response.content
    except httpx.RequestError as e:
        raise RuntimeError(f"Failed to download from {url}. Error: {e}")
    
def pdf_bytes_to_text(b: bytes)->str:
    from io import BytesIO 
    reader = PdfReader(BytesIO(b))
    pages = []
    for p in reader.pages:
        pages.append(p.extract_text() or "")
    return "\n".join(pages).strip()

def docx_bytes_to_text(b: bytes) -> str:
    # Save to temp file and use docx2txt
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
        tmp.write(b)
        tmp_path = tmp.name
    text = docx2txt.process(tmp_path) or ""
    try:
        os.remove(tmp_path)
    except Exception:
        pass
    return text

def bytes_to_text(url: str, b: bytes) -> Tuple[str, str]:
    url = url.lower()
    if url.endswith(".pdf"):
        return pdf_bytes_to_text(b), "pdf"
    if url.endswith(".docx"):
        return docx_bytes_to_text(b), "docx"
    # fallback to utf-8 text
    try:
        return b.decode("utf-8", errors="ignore"), "text"
    except Exception:
        return "", "binary"


