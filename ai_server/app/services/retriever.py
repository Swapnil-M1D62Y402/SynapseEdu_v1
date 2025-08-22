# app/services/retriever.py
from typing import List
from app.services.vectorstore import get_retriever

def get_contexts_for_query(query: str, k: int = 4, collection_name: str = None) -> List[str]:
    retriever = get_retriever(collection_name=collection_name, k=k)
    docs = retriever.get_relevant_documents(query)
    # return list of texts or include metadata for citations
    contexts = []
    for d in docs:
        # d.page_content and d.metadata
        ctx = d.page_content
        # optionally prepend source id or url
        meta = d.metadata or {}
        if meta.get("file_name"):
            ctx = f"[{meta.get('file_name')}] {ctx}"
        contexts.append(ctx)
    return contexts
