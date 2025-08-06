// src/index.ts

export interface Env {
  LLM_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const { content, prompt } = await request.json();

      if (!content || !prompt) {
        return new Response("Missing 'content' or 'prompt'", { status: 400 });
      }

      const start = Date.now();

      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
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

      const data = await openaiRes.json();
      const elapsed = Date.now() - start;

      return new Response(JSON.stringify({ data, elapsed }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (err) {
      return new Response('Error during GPT call', { status: 500 });
    }
  },
};
