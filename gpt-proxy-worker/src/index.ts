// src/index.ts

export interface Env {
  LLM_API_KEY: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const cache: Record<string, any> = {};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { method } = request;

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Polling endpoint: GET /?id=xyz
    if (method === 'GET' && url.searchParams.has('id')) {
      const id = url.searchParams.get('id');
      const result = cache[id];
      if (!result) {
        return new Response('Not ready', { status: 202, headers: corsHeaders });
      }
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'POST') {
      const { content, prompt } = await request.json();
      const id = crypto.randomUUID();

      (async () => {
        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${env.LLM_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: 'You are a helpful assistant that writes clear, professional customer email updates using provided release note data.',
                },
                {
                  role: 'user',
                  content: `Prompt: ${prompt}\n\nRelease Notes:\n${content}`,
                },
              ],
              temperature: 0.7,
            }),
          });
          const data = await res.json();
          const elapsed = Date.now();
          cache[id] = { data, elapsed };
        } catch (err) {
          cache[id] = { error: 'Failed to generate GPT response' };
        }
      })();

      return new Response(JSON.stringify({ id }), {
        status: 202,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders,
    });
  },
};
