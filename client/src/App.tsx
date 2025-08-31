import { useMemo, useState } from 'react'

type Context = { id: string; text: string; metadata?: Record<string, any>; distance?: number }

export default function App() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [contexts, setContexts] = useState<Context[]>([])
  const [loading, setLoading] = useState(false)
  const canAsk = useMemo(() => question.trim().length > 0 && !loading, [question, loading])

  async function ask() {
    setLoading(true)
    setAnswer('')
    setContexts([])
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Request failed')
      setAnswer(data.answer)
      setContexts(data.contexts || [])
    } catch (e: any) {
      setAnswer(`Error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1>RAG App</h1>
      <p>Enter a question. The backend embeds with Ollama, retrieves from ChromaDB, and answers with Azure OpenAI.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ flex: 1, padding: 10, fontSize: 16 }}
          placeholder="Ask something..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && canAsk) ask() }}
        />
        <button disabled={!canAsk} onClick={ask}>{loading ? 'Asking…' : 'Ask'}</button>
      </div>

      {answer && (
        <section style={{ marginTop: 24 }}>
          <h3>Answer</h3>
          <div style={{ whiteSpace: 'pre-wrap', background: '#f6f6f6', padding: 12, borderRadius: 6 }}>{answer}</div>
        </section>
      )}

      {contexts.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h3>Retrieved Context</h3>
          {contexts.map((c, i) => (
            <details key={c.id} style={{ marginBottom: 12 }} open={i === 0}>
              <summary>Source {i + 1} {typeof c.distance === 'number' ? `(distance: ${c.distance.toFixed(4)})` : ''}</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{c.text}</pre>
              {c.metadata && <code>{JSON.stringify(c.metadata)}</code>}
            </details>
          ))}
        </section>
      )}
    </div>
  )
}

