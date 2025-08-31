import { config } from './config.js';

const base = config.ollamaBaseUrl.replace(/\/$/, '');

export async function embedTexts(texts) {
  // Batch by looping; Ollama /api/embeddings most reliably accepts single prompt
  const out = [];
  for (const t of texts) {
    const r = await fetch(`${base}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: config.ollamaEmbeddingModel, prompt: t })
    });
    if (!r.ok) {
      const body = await r.text();
      throw new Error(`Ollama embeddings error ${r.status}: ${body}`);
    }
    const data = await r.json();
    if (!data || !data.embedding) {
      throw new Error('Ollama returned no embedding');
    }
    out.push(data.embedding);
  }
  return out;
}

