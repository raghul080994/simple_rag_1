from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os

from rag.config import Settings, get_settings
from rag.pdf_loader import extract_chunks_from_pdf_files
from rag.vectorstore import VectorStore
from rag.embedding import OllamaEmbedder
from rag.prompt import build_rag_messages
from rag.llm_providers import get_llm_provider
from rag.schemas import QueryRequest, QueryResponse, UploadResponse, HealthResponse


app = FastAPI(title="RAG App (Chroma + Ollama + Azure)")

# CORS for local dev (frontend on Vite default 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_components(settings: Settings = Depends(get_settings)):
    vs = VectorStore(persist_path=settings.CHROMA_DB_DIR, collection=settings.CHROMA_COLLECTION)
    embedder = OllamaEmbedder(base_url=settings.OLLAMA_BASE_URL, model=settings.OLLAMA_EMBED_MODEL)
    llm = get_llm_provider(settings)
    return settings, vs, embedder, llm


@app.get("/api/health", response_model=HealthResponse)
def health(settings: Settings = Depends(get_settings)):
    return HealthResponse(status="ok", chroma_dir=settings.CHROMA_DB_DIR)


@app.post("/api/upload", response_model=UploadResponse)
async def upload_pdfs(files: List[UploadFile] = File(...), components=Depends(get_components)):
    settings, vectorstore, embedder, _ = components

    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    # Read PDFs into memory and process
    try:
        chunks, stats = extract_chunks_from_pdf_files(files, target_chunk_chars=settings.CHUNK_CHARS, overlap=settings.CHUNK_OVERLAP)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing PDFs: {e}")

    if not chunks:
        raise HTTPException(status_code=400, detail="No text could be extracted from PDFs")

    # Embed and upsert to Chroma
    try:
        texts = [c.text for c in chunks]
        embeddings = embedder.embed_texts(texts)
        ids = [c.id for c in chunks]
        metadatas = [c.metadata() for c in chunks]
        vectorstore.upsert(ids=ids, texts=texts, embeddings=embeddings, metadatas=metadatas)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error indexing into Chroma: {e}")

    return UploadResponse(message="Uploaded and indexed",
                          documents=[s.dict() for s in stats],
                          chunks_indexed=len(chunks))


@app.post("/api/query", response_model=QueryResponse)
def query_rag(req: QueryRequest, components=Depends(get_components)):
    settings, vectorstore, embedder, llm = components

    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Question is required")

    try:
        q_emb = embedder.embed_text(req.question)
        results = vectorstore.query(
            query_embedding=q_emb,
            top_k=req.top_k or settings.TOP_K,
            min_relevance=settings.MIN_RELEVANCE,
            max_context_chars=settings.MAX_CONTEXT_CHARS,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying Chroma: {e}")

    messages = build_rag_messages(question=req.question, contexts=results.context_texts, guidance=req.guidance)

    try:
        answer_text = llm.complete_chat(messages=messages, temperature=req.temperature, max_tokens=req.max_tokens)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM provider error: {e}")

    return QueryResponse(
        answer=answer_text,
        references=results.references,
        used_context_chars=sum(len(c) for c in results.context_texts),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)

