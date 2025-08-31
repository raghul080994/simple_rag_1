import React from 'react'
import Upload from './components/Upload'
import Chat from './components/Chat'

export default function App() {
  return (
    <div style={{ maxWidth: 900, margin: '30px auto', fontFamily: 'Inter, system-ui, Arial, sans-serif' }}>
      <h1>RAG App: PDFs → Chroma → Azure</h1>
      <p style={{ color: '#555' }}>
        Upload PDFs, then ask questions. Embeddings via local Ollama (nomic-embed-text), vector store via Chroma, answers via Azure OpenAI.
      </p>
      <Upload />
      <Chat />
    </div>
  )
}

