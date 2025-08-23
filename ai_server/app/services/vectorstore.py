# import os
# from typing import List
# from dotenv import load_dotenv
# load_dotenv()

# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain_community.embeddings import OpenAIEmbeddings
# from langchain_community.vectorstores import PGVector  # ensure this matches installed adapter
# from langchain.schema import Document

# PG_CONN = os.getenv("SUPABASE_DB_URL")
# EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")
# DEFAULT_COLLECTION = os.getenv("VECTOR_COLLECTION", "study_resources")

# if not PG_CONN:
#     raise RuntimeError("SUPABASE_DB_URL not set in .env")

# def chunk_splitter(text:str, metadata: dict, chunk_size: int=1000, chunk_overlap:int=200):
#     splitter=RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
#     docs = splitter.create_documents([text], metadatas=[metadata])
#     return docs

# def chunk_text_into_docs(text: str, metadata: dict, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Document]:
#     """
#     Split text into chunks and create Document objects.
#     """
#     return chunk_splitter(text, metadata, chunk_size, chunk_overlap)

# def get_embeddings(embedding_model: str=EMBED_MODEL):
#     return OpenAIEmbeddings(model=embedding_model)

# def upsert_documents_to_pgvector(documents: List[Document], collection_name: str = DEFAULT_COLLECTION):
#     """
#     Upsert documents to PGVector. This will create the collection if it doesn't exist.
#     """
#     try:
#         vs = PGVector.from_documents(
#             documents=documents,
#             embedding=get_embeddings(),
#             collection_name=collection_name,
#             connection_string=PG_CONN,
#             use_jsonb=True
#         )
#         return vs
#     except Exception as e:
#         raise RuntimeError(f"Failed to upsert documents to vector store: {e}")

# def upsert_documents_to_vectorstore(documents: List[Document], collection_name: str=DEFAULT_COLLECTION):
#     """Legacy function name - kept for compatibility"""
#     return upsert_documents_to_pgvector(documents, collection_name)

# def get_vectorstore(collection_name: str=DEFAULT_COLLECTION):
#     return PGVector(
#         collection_name=collection_name,
#         embedding_function=get_embeddings(),
#         connection_string=PG_CONN,
#         use_jsonb=True
#     )

# def get_retriever(collection_name: str=DEFAULT_COLLECTION, k: int=5):
#     vs = get_vectorstore(collection_name)
#     return vs.as_retriever(search_type="similarity", search_kwargs={"k": k})



###############################################################



# import os
# from typing import List
# from dotenv import load_dotenv
# load_dotenv()

# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain_community.embeddings import OpenAIEmbeddings
# from langchain_community.vectorstores import PGVector
# from langchain.schema import Document

# PG_CONN = os.getenv("SUPABASE_DB_URL")
# EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")
# DEFAULT_COLLECTION = os.getenv("VECTOR_COLLECTION", "study_resources")

# if not PG_CONN:
#     raise RuntimeError("SUPABASE_DB_URL not set in .env")

# # Ensure proper SSL connection for Supabase
# if "sslmode" not in PG_CONN:
#     if "?" in PG_CONN:
#         PG_CONN += "&sslmode=require"
#     else:
#         PG_CONN += "?sslmode=require"

# def chunk_splitter(text: str, metadata: dict, chunk_size: int = 1000, chunk_overlap: int = 200):
#     splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
#     docs = splitter.create_documents([text], metadatas=[metadata])
#     return docs

# def chunk_text_into_docs(text: str, metadata: dict, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Document]:
#     """
#     Split text into chunks and create Document objects.
#     """
#     return chunk_splitter(text, metadata, chunk_size, chunk_overlap)

# def get_embeddings(embedding_model: str = EMBED_MODEL):
#     return OpenAIEmbeddings(model=embedding_model)

# def upsert_documents_to_pgvector(documents: List[Document], collection_name: str = DEFAULT_COLLECTION):
#     """
#     Upsert documents to PGVector. This will create the collection if it doesn't exist.
#     """
#     try:
#         # Add connection arguments for better reliability with Supabase
#         vs = PGVector.from_documents(
#             documents=documents,
#             embedding=get_embeddings(),
#             collection_name=collection_name,
#             connection_string=PG_CONN,
#             use_jsonb=True,
#             pre_delete_collection=False,  # Don't delete existing collection
#             connection_kwargs={
#                 "sslmode": "require",
#                 "connect_timeout": 30,
#                 "application_name": "fastapi_vectorstore"
#             }
#         )
#         return vs
#     except Exception as e:
#         raise RuntimeError(f"Failed to upsert documents to vector store: {e}")

# def upsert_documents_to_vectorstore(documents: List[Document], collection_name: str = DEFAULT_COLLECTION):
#     """Legacy function name - kept for compatibility"""
#     return upsert_documents_to_pgvector(documents, collection_name)

# def get_vectorstore(collection_name: str = DEFAULT_COLLECTION):
#     try:
#         return PGVector(
#             collection_name=collection_name,
#             embedding_function=get_embeddings(),
#             connection_string=PG_CONN,
#             use_jsonb=True
#         )
#     except Exception as e:
#         raise RuntimeError(f"Failed to connect to vector store: {e}")

# def get_retriever(collection_name: str = DEFAULT_COLLECTION, k: int = 5):
#     vs = get_vectorstore(collection_name)
#     return vs.as_retriever(search_type="similarity", search_kwargs={"k": k})


############################################


# import os
# from typing import List
# from dotenv import load_dotenv
# load_dotenv()

# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain_openai import OpenAIEmbeddings
# from langchain_community.vectorstores import PGVector
# from langchain.schema import Document

# PG_CONN = os.getenv("SUPABASE_DB_URL")
# EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")
# DEFAULT_COLLECTION = os.getenv("VECTOR_COLLECTION", "study_resources")

# if not PG_CONN:
#     raise RuntimeError("SUPABASE_DB_URL not set in .env")

# # Ensure proper SSL connection for Supabase
# if "sslmode" not in PG_CONN:
#     if "?" in PG_CONN:
#         PG_CONN += "&sslmode=require"
#     else:
#         PG_CONN += "?sslmode=require"

# def chunk_splitter(text: str, metadata: dict, chunk_size: int = 1000, chunk_overlap: int = 200):
#     splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
#     docs = splitter.create_documents([text], metadatas=[metadata])
#     return docs

# def chunk_text_into_docs(text: str, metadata: dict, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Document]:
#     """
#     Split text into chunks and create Document objects.
#     """
#     return chunk_splitter(text, metadata, chunk_size, chunk_overlap)

# def get_embeddings(embedding_model: str = EMBED_MODEL):
#     return OpenAIEmbeddings(model=embedding_model)

# def upsert_documents_to_pgvector(documents: List[Document], collection_name: str = DEFAULT_COLLECTION):
#     """
#     Upsert documents to PGVector. This will create the collection if it doesn't exist.
#     """
#     try:
#         vs = PGVector.from_documents(
#             documents=documents,
#             embedding=get_embeddings(),
#             collection_name=collection_name,
#             connection_string=PG_CONN,
#             use_jsonb=True,
#             pre_delete_collection=False  # Don't delete existing collection
#         )
#         return vs
#     except Exception as e:
#         raise RuntimeError(f"Failed to upsert documents to vector store: {e}")

# def upsert_documents_to_vectorstore(documents: List[Document], collection_name: str = DEFAULT_COLLECTION):
#     """Legacy function name - kept for compatibility"""
#     return upsert_documents_to_pgvector(documents, collection_name)

# def get_vectorstore(collection_name: str = DEFAULT_COLLECTION):
#     try:
#         return PGVector(
#             collection_name=collection_name,
#             embedding_function=get_embeddings(),
#             connection_string=PG_CONN,
#             use_jsonb=True
#         )
#     except Exception as e:
#         raise RuntimeError(f"Failed to connect to vector store: {e}")

# def get_retriever(collection_name: str = DEFAULT_COLLECTION, k: int = 5):
#     vs = get_vectorstore(collection_name)
#     return vs.as_retriever(search_type="similarity", search_kwargs={"k": k})


#################################################################################


# app/services/vectorstore.py
import os
from typing import List
from dotenv import load_dotenv
load_dotenv()

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.schema import Document

# Chroma persistence directory (change or set CHROMA_PERSIST_DIR in env)
CHROMA_DIR = os.getenv("CHROMA_PERSIST_DIR", "./.chroma_db")

EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")
DEFAULT_COLLECTION = os.getenv("VECTOR_COLLECTION", "study_resources")

# --- chunking helpers (same behaviour as before) ---
def chunk_splitter(text: str, metadata: dict, chunk_size: int = 1000, chunk_overlap: int = 200):
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    docs = splitter.create_documents([text], metadatas=[metadata])
    return docs

def chunk_text_into_docs(text: str, metadata: dict, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Document]:
    """
    Split text into chunks and return a list of langchain Document objects.
    """
    return chunk_splitter(text, metadata, chunk_size, chunk_overlap)

# --- embeddings ---
def get_embeddings(embedding_model: str = EMBED_MODEL):
    """
    Returns an embedding function instance.
    Requires OPENAI_API_KEY in env if using OpenAI.
    """
    return OpenAIEmbeddings(model=embedding_model)

# --- upsert into Chroma ---
def upsert_documents_to_chroma(documents: List[Document], collection_name: str = DEFAULT_COLLECTION, persist: bool = True):
    """
    Upsert documents into a Chroma collection.
    - documents: list of langchain Document objects (page_content + metadata)
    - collection_name: name of the chroma collection
    - persist: whether to persist to disk (default True)
    """
    if not documents:
        return {"inserted": 0, "collection": collection_name}

    try:
        embedding_fn = get_embeddings()

        # Create or load the Chroma vector store
        vs = Chroma.from_documents(
            documents=documents,
            embedding=embedding_fn,
            collection_name=collection_name,
            persist_directory=CHROMA_DIR,
            client_settings=None  # optional: pass chromadb.config.Settings if you want custom impl
        )

        if persist:
            vs.persist()

        return {"inserted": len(documents), "collection": collection_name}
    except Exception as e:
        raise RuntimeError(f"Failed to upsert documents to vector store (Chroma): {e}")

# back-compat name
def upsert_documents_to_vectorstore(documents: List[Document], collection_name: str = DEFAULT_COLLECTION):
    return upsert_documents_to_chroma(documents, collection_name=collection_name, persist=True)

# --- get a vectorstore instance (useful for queries) ---
def get_vectorstore(collection_name: str = DEFAULT_COLLECTION):
    try:
        return Chroma(
            collection_name=collection_name,
            embedding_function=get_embeddings(),
            persist_directory=CHROMA_DIR,
            client_settings=None
        )
    except Exception as e:
        raise RuntimeError(f"Failed to connect to Chroma vector store: {e}")

# --- retriever similar to langchain's interface ---
def get_retriever(collection_name: str = DEFAULT_COLLECTION, k: int = 5):
    vs = get_vectorstore(collection_name)
    return vs.as_retriever(search_type="similarity", search_kwargs={"k": k})




