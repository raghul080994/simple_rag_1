RAG App (React + Express + ChromaDB + Ollama + Azure OpenAI)

Overview
- Frontend: React (Vite) at `client/` for asking questions and viewing context-backed answers.
- Backend: Node.js (Express) at `server/` with endpoints for ingestion and RAG.
- Vector Store: ChromaDB (local HTTP server).
- Embeddings: Ollama local `nomic-embed-text`.
- Completions: Azure OpenAI GPT-4o.

Environment
Copy `.env.example` to `.env` and fill Azure values (required):

AZURE_OPENAI_ENDPOINT=
AZURE_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_KEY=
AZURE_API_VERSION=

Optional: tweak `CHROMA_URL`, `OLLAMA_BASE_URL`, etc.

Setup
1) Server
   - cd server
   - npm install
   - npm run dev

2) Client
   - cd client
   - npm install
   - npm run dev (proxies /api to server on :3001)

Prereqs to run locally
- Start ChromaDB (default http://localhost:8000)
- Start Ollama (http://localhost:11434) and ensure `nomic-embed-text` is available

Usage
- Ingest sample docs: `cd server && npm run seed`
- Ask question in the client UI.

API
- POST /api/ingest: { items: [{ id?, text, metadata? }] }
- POST /api/ask: { question, topK? }

Key Files
- server/src/chroma.js — ChromaDB client wrapper
- server/src/ollama.js — Local embeddings via Ollama
- server/src/azure.js — Azure OpenAI chat completions
- server/src/index.js — Express routes for ingest and ask
- client/src/App.tsx — UI for asking questions and viewing context

