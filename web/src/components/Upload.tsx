import React, { useState } from 'react'
import { uploadPdfs } from '../api'
import type { UploadResponse } from '../types'

export default function Upload() {
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setFiles(Array.from(e.target.files))
  }

  const doUpload = async () => {
    if (files.length === 0) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const res = await uploadPdfs(files)
      setResult(res)
    } catch (e: any) {
      setError(e.message || 'Upload error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, marginBottom: 16 }}>
      <h3>Upload PDFs</h3>
      <input type="file" accept="application/pdf" multiple onChange={onFileChange} />
      <button onClick={doUpload} disabled={busy || files.length === 0} style={{ marginLeft: 8 }}>
        {busy ? 'Uploading…' : 'Upload & Index'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 8 }}>
          <div>{result.message}. Chunks indexed: {result.chunks_indexed}</div>
          <ul>
            {result.documents.map((d, i) => (
              <li key={i}>{d.filename} — {d.pages} pages, {d.chunks} chunks</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

