import os
from typing import List
from dotenv import load_dotenv
load_dotenv()

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain_community.vectorstores import PGVector  # ensure this matches installed adapter
from langchain.schema import Document

PG_CONN = os.getenv("SUPABASE_DB_URL")
EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")
DEFAULT_COLLECTION = os.getenv("VECTOR_COLLECTION", "study_resources")

if not PG_CONN:
    raise RuntimeError("SUPABASE_DB_URL not set in .env")

def chunk_splitter(text:str, metadata: dict, chunk_size: int=1000, chunk_overlap:int=200):
    splitter=RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    docs = splitter.create_documents([text], metadatas=[metadata])
    return docs

def get_embeddings(embedding_model: str=EMBED_MODEL):
    return OpenAIEmbeddings(model=embedding_model)

def upsert_documents_to_vectorstore(documents: List[Document], collection_name: str=DEFAULT_COLLECTION):

    vs = PGVector.from_documents(
        documents=documents,
        embedding=get_embeddings(),
        collection_name=collection_name,
        connection_string=PG_CONN,
        use_jsonb=True
    )
    return vs 

def get_vectorstore(collection_name: str=DEFAULT_COLLECTION):
    return PGVector(
        collection_name=collection_name,
        embedding_function=get_embeddings(),
        connection_string=PG_CONN,
        use_jsonb=True
    )

def get_retriever(collection_name: str=DEFAULT_COLLECTION, k: int=5):
    vs = get_vectorstore(collection_name)
    return vs.as_retriever(search_type="similarity", search_kwargs={"k": k})


