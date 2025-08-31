import { ChromaClient } from 'chromadb';
import { config } from './config.js';

const client = new ChromaClient({ path: config.chromaUrl });

let collectionPromise;
async function getCollection() {
  if (!collectionPromise) {
    collectionPromise = client.getOrCreateCollection({ name: config.chromaCollection });
  }
  return collectionPromise;
}

export async function addDocuments(items) {
  const collection = await getCollection();
  const ids = items.map((d) => d.id);
  const documents = items.map((d) => d.text);
  const metadatas = items.map((d) => d.metadata || {});
  const embeddings = items.map((d) => d.embedding);
  await collection.add({ ids, documents, metadatas, embeddings });
}

export async function queryByEmbedding(embedding, nResults = 4) {
  const collection = await getCollection();
  const res = await collection.query({ queryEmbeddings: [embedding], nResults });
  // Normalize to list of results
  const out = [];
  const ids = res.ids?.[0] || [];
  const docs = res.documents?.[0] || [];
  const metas = res.metadatas?.[0] || [];
  const dists = res.distances?.[0] || [];
  for (let i = 0; i < ids.length; i++) {
    out.push({ id: ids[i], text: docs[i], metadata: metas[i], distance: dists[i] });
  }
  return out;
}

