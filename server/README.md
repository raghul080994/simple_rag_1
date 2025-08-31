RAG Server (Express + ChromaDB + Ollama + Azure OpenAI)

Requirements
- Node.js 18+
- ChromaDB running locally (default http://localhost:8000)
- Ollama running locally with nomic-embed-text model (default http://localhost:11434)
- Azure OpenAI credentials for GPT-4o

Environment
Copy ../.env.example to server/.env or project root .env and fill values:

AZURE_OPENAI_ENDPOINT=
AZURE_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_KEY=
AZURE_API_VERSION=

Optional:
PORT=3001
CHROMA_URL=http://localhost:8000
CHROMA_COLLECTION=rag_docs
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

Scripts
- npm run dev — start server with watch
- npm start — start server

Endpoints
- GET /health — server ok
- POST /api/ingest — body: { items: [{ id?, text, metadata? }] }
- POST /api/ask — body: { question, topK? }

Notes
- Embeddings are computed locally via Ollama (/api/embeddings, prompt field) one-by-one.
- ChromaDB is accessed via the official JS client and stores provided embeddings.
- Azure OpenAI is called via Chat Completions API for deployment “gpt-4o”.

