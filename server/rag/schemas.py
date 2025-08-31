from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class Reference(BaseModel):
    id: str
    source: Optional[str]
    page: Optional[int]
    chunk: Optional[int]
    score: Optional[float]
    text_preview: Optional[str]


class QueryRequest(BaseModel):
    question: str
    top_k: Optional[int] = None
    temperature: Optional[float] = 0.2
    max_tokens: Optional[int] = 500
    guidance: Optional[str] = None


class QueryResponse(BaseModel):
    answer: str
    references: List[Reference]
    used_context_chars: int


class UploadResponse(BaseModel):
    message: str
    documents: List[Dict[str, Any]]
    chunks_indexed: int


class HealthResponse(BaseModel):
    status: str
    chroma_dir: str

