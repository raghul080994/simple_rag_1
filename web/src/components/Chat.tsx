import React, { useState } from 'react'
import { askQuestion } from '../api'
import type { QueryResponse, Reference } from '../types'

type Message = { role: 'user' | 'assistant'; content: string; references?: Reference[] }

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async () => {
    const q = input.trim()
    if (!q) return
    setMessages(m => [...m, { role: 'user', content: q }])
    setInput('')
    setBusy(true)
    setError(null)
    try {
      const res: QueryResponse = await askQuestion(q)
      setMessages(m => [...m, { role: 'assistant', content: res.answer, references: res.references }])
    } catch (e: any) {
      setError(e.message || 'Query error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
      <h3>Ask a Question</h3>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ flex: 1, padding: 8 }}
          placeholder="Ask about your PDFs…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={send} disabled={busy}>Send</button>
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ background: m.role === 'user' ? '#f5f5f5' : '#f9fbff', padding: 12, borderRadius: 6 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{m.role === 'user' ? 'You' : 'Assistant'}</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
            {m.role === 'assistant' && m.references && m.references.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 'bold' }}>References</div>
                <ul style={{ marginTop: 6 }}>
                  {m.references.map((r, idx) => (
                    <li key={idx}>
                      {r.source ?? 'unknown'}{r.page ? ` p.${r.page}` : ''} [chunk {r.chunk ?? '?'}] — score: {r.score?.toFixed(3)}
                      <div style={{ color: '#555' }}>{r.text_preview}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

