const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function uploadPdfs(files: File[]): Promise<any> {
  const fd = new FormData()
  files.forEach(f => fd.append('files', f))
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: fd,
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Upload failed')
  }
  return res.json()
}

export async function askQuestion(question: string, opts?: { top_k?: number; temperature?: number; max_tokens?: number; guidance?: string }) {
  const res = await fetch(`${API_BASE}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, ...opts }),
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Query failed')
  }
  return res.json()
}

