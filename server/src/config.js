import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),

  // Chroma
  chromaUrl: process.env.CHROMA_URL || 'http://localhost:8000',
  chromaCollection: process.env.CHROMA_COLLECTION || 'rag_docs',

  // Ollama
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaEmbeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',

  // Azure OpenAI (must match required format)
  azure: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    deployment: process.env.AZURE_DEPLOYMENT_NAME || 'gpt-4o',
    apiKey: process.env.AZURE_OPENAI_KEY || '',
    apiVersion: process.env.AZURE_API_VERSION || ''
  }
};

