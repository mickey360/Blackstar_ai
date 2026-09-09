type AIProvider = 'huggingface' | 'local';

type AIGenerateArgs = {
  task: string;
  input: any;
  model?: string;
  provider?: AIProvider;
  temperature?: number;
};

const DEFAULT_MODEL = 'google/gemma-4-26B-A4B-it';

function fallback(task: string, input: any) {
  const text = typeof input === 'string' ? input : JSON.stringify(input);
  if (task === 'classify') return { label: text.toLowerCase().includes('urgent') ? 'urgent' : 'normal', confidence: 0.72, provider: 'local-fallback' };
  if (task === 'extract') return { text, entities: text.match(/#[\w-]+|@[\w-]+/g) || [], provider: 'local-fallback' };
  if (task === 'summarize') return { summary: text.length > 280 ? text.slice(0, 277) + '...' : text, provider: 'local-fallback' };
  return { result: text, provider: 'local-fallback' };
}

export async function aiGenerate({ task, input, model = process.env.HF_MODEL || DEFAULT_MODEL, provider = 'huggingface', temperature = 0.4 }: AIGenerateArgs) {
  const token = process.env.HF_TOKEN;

  if (provider === 'local') {
    const endpoint = process.env.LOCAL_AI_ENDPOINT;
    if (endpoint) {
      try {
        const response = await fetch(`${endpoint.replace(/\/$/, '')}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(process.env.LOCAL_AI_TOKEN ? { Authorization: `Bearer ${process.env.LOCAL_AI_TOKEN}` } : {}) },
          body: JSON.stringify({ model, temperature, messages: [{ role: 'user', content: `Task: ${task}\nInput: ${JSON.stringify(input)}` }] }),
        });
        if (response.ok) {
          const json = await response.json();
          return { result: json.choices?.[0]?.message?.content ?? json, provider: 'local', model };
        }
      } catch {}
    }
    return fallback(task, input);
  }

  if (token) {
    try {
      const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          temperature,
          max_tokens: 512,
          messages: [{ role: 'system', content: 'You are Blackstar AI, a precise workflow assistant. Return concise, useful output. If the task is extraction or classification, prefer structured JSON.' }, { role: 'user', content: `Task: ${task}\nInput: ${JSON.stringify(input)}` }],
        }),
      });
      if (response.ok) {
        const json = await response.json();
        const content = json.choices?.[0]?.message?.content ?? json;
        return { result: content, provider: 'huggingface', model, usage: json.usage };
      }
    } catch {}
  }

  return fallback(task, input);
}
