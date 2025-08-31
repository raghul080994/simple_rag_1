from typing import List
import requests


class OllamaEmbedder:
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "nomic-embed-text") -> None:
        self.base_url = base_url.rstrip('/')
        self.model = model

    def embed_text(self, text: str) -> List[float]:
        payload = {"model": self.model, "prompt": text}
        r = requests.post(f"{self.base_url}/api/embeddings", json=payload, timeout=120)
        r.raise_for_status()
        data = r.json()
        # Ollama returns { embedding: [...] }
        return data["embedding"]

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        # Ollama embeddings API is single-prompt; batch by looping
        return [self.embed_text(t) for t in texts]

