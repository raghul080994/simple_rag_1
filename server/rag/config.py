import os
from functools import lru_cache
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    # General
    CHROMA_DB_DIR: str = Field(default="./server/chroma_db")
    CHROMA_COLLECTION: str = Field(default="rag_docs")

    # Embeddings via Ollama local API
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434")
    OLLAMA_EMBED_MODEL: str = Field(default="nomic-embed-text")

    # Retrieval
    TOP_K: int = Field(default=6)
    MIN_RELEVANCE: float = Field(default=0.0)  # 0..1 lower is less strict
    MAX_CONTEXT_CHARS: int = Field(default=12000)
    CHUNK_CHARS: int = Field(default=1200)
    CHUNK_OVERLAP: int = Field(default=200)

    # LLM Provider selection (currently: azure)
    LLM_PROVIDER: str = Field(default="azure")

    # Azure OpenAI
    AZURE_OPENAI_ENDPOINT: str = Field(default="")
    AZURE_OPENAI_KEY: str = Field(default="")
    AZURE_DEPLOYMENT_NAME: str = Field(default="gpt-4o")
    AZURE_API_VERSION: str = Field(default="2024-06-01")

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> 'Settings':
    return Settings()

