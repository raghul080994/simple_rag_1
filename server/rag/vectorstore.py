from typing import List, Dict, Any
import chromadb
from chromadb.utils import embedding_functions


class RetrievalResults:
    def __init__(self, context_texts: List[str], references: List[Dict[str, Any]]):
        self.context_texts = context_texts
        self.references = references


class VectorStore:
    def __init__(self, persist_path: str, collection: str = "rag_docs") -> None:
        self.client = chromadb.PersistentClient(path=persist_path)
        # We provide embeddings manually, so no embedding_function here
        self.collection = self.client.get_or_create_collection(name=collection)

    def upsert(self, ids: List[str], texts: List[str], embeddings: List[List[float]], metadatas: List[Dict[str, Any]]):
        # Chroma add will overwrite if ids already exist when using update=True
        # For simplicity, try add then fallback to update
        try:
            self.collection.add(ids=ids, documents=texts, embeddings=embeddings, metadatas=metadatas)
        except Exception:
            self.collection.update(ids=ids, documents=texts, embeddings=embeddings, metadatas=metadatas)

    def query(self, query_embedding: List[float], top_k: int = 6, min_relevance: float = 0.0, max_context_chars: int = 12000) -> RetrievalResults:
        res = self.collection.query(query_embeddings=[query_embedding], n_results=top_k, include=["documents", "metadatas", "distances", "ids"])  # type: ignore
        docs = res.get("documents", [[]])[0]
        metas = res.get("metadatas", [[]])[0]
        ids = res.get("ids", [[]])[0]
        dists = res.get("distances", [[]])[0]

        # Convert distances to pseudo-relevance (1/(1+dist)) if available
        refs = []
        context_texts: List[str] = []
        total_chars = 0

        for i, (doc, meta, _id) in enumerate(zip(docs, metas, ids)):
            dist = dists[i] if i < len(dists) else None
            if dist is not None:
                score = 1.0 / (1.0 + float(dist))
                if score < min_relevance:
                    continue
            else:
                score = 0.0

            # Respect max_context_chars budget
            if total_chars + len(doc) > max_context_chars and len(context_texts) > 0:
                break

            context_texts.append(doc)
            total_chars += len(doc)

            refs.append({
                "id": _id,
                "source": meta.get("source"),
                "page": meta.get("page"),
                "chunk": meta.get("chunk"),
                "score": score,
                "text_preview": (doc[:280] + "…") if len(doc) > 280 else doc,
            })

        return RetrievalResults(context_texts=context_texts, references=refs)

