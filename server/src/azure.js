import { config } from './config.js';

function buildRagPrompt(question, contexts) {
  const ctx = contexts.map((c, i) => `Source ${i + 1}:\n${c.text}`).join("\n\n---\n\n");
  return {
    system: `You are a helpful assistant. Use the provided sources to answer. If the answer isn't in the sources, say you don't know. Cite sources by their number when relevant.`,
    user: `Answer the question using only the sources.\n\nQuestion:\n${question}\n\nSources:\n${ctx}`
  };
}

export async function generateAnswer(question, contexts, options = {}) {
  const { system, user } = buildRagPrompt(question, contexts);
  const url = `${config.azure.endpoint}/openai/deployments/${config.azure.deployment}/chat/completions?api-version=${config.azure.apiVersion}`;
  const body = {
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 600
  };

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.azure.apiKey
    },
    body: JSON.stringify(body)
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Azure OpenAI error ${r.status}: ${text}`);
  }
  const data = await r.json();
  const content = data?.choices?.[0]?.message?.content?.trim?.() ?? '';
  return content;
}

