export type Reference = {
  id: string
  source?: string
  page?: number
  chunk?: number
  score?: number
  text_preview?: string
}

export type QueryResponse = {
  answer: string
  references: Reference[]
  used_context_chars: number
}

export type UploadResponse = {
  message: string
  documents: { filename: string; pages: number; chunks: number }[]
  chunks_indexed: number
}

