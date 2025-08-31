import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { embedTexts } from './ollama.js';
import { addDocuments, queryByEmbedding } from './chroma.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', async (req, res) => {
  res.json({ ok: true });
});

// Ingest documents into Chroma: { items: [{ id?, text, metadata? }] }
app.post('/api/ingest', async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) return res.status(400).json({ error: 'No items' });

    const normalized = items.map((it, idx) => ({
      id: it.id || `${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 8)}`,
      text: String(it.text || ''),
      metadata: it.metadata || {}
    })).filter((x) => x.text.length > 0);

    const embeddings = await embedTexts(normalized.map((x) => x.text));
    const toAdd = normalized.map((x, i) => ({ ...x, embedding: embeddings[i] }));
    await addDocuments(toAdd);

    res.json({ added: toAdd.length, ids: toAdd.map((x) => x.id) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Ask: { question, topK? }
app.post('/api/ask', async (req, res) => {
  try {
    const { question, topK = 4 } = req.body || {};
    if (!question || !String(question).trim()) {
      return res.status(400).json({ error: 'question is required' });
    }

    const [embedding] = await embedTexts([String(question)]);
    const results = await queryByEmbedding(embedding, Math.max(1, Math.min(10, topK)));

    // Build context and call Azure
    const { generateAnswer } = await import('./azure.js');
    const answer = await generateAnswer(String(question), results);

    res.json({ answer, contexts: results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`RAG server listening on http://localhost:${config.port}`);
});

