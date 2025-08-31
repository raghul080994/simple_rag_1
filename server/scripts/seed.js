// Simple seeding script to add example documents to Chroma via the API
const SERVER = process.env.SERVER_URL || 'http://localhost:3001'

const docs = [
  {
    text: `RAG stands for Retrieval-Augmented Generation, which enriches prompts with external context fetched from a knowledge base such as a vector database.`,
    metadata: { source: 'seed', tag: 'definition' }
  },
  {
    text: `ChromaDB is an open-source embedding database that supports similarity search over vectors with associated documents and metadata.`,
    metadata: { source: 'seed', tag: 'chroma' }
  },
  {
    text: `Ollama can run models locally, including the nomic-embed-text model for generating embeddings compatible with vector databases.`,
    metadata: { source: 'seed', tag: 'ollama' }
  }
]

async function main() {
  const res = await fetch(`${SERVER}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: docs })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(data))
  console.log('Seeded:', data)
}

main().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})

