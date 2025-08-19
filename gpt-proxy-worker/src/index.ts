// src/index.ts

export interface Env {
  LLM_API_KEY: string;
  WORKER_AUTH_KEY?: string;
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (origin === 'http://localhost:3000') return true;
  try {
    const host = new URL(origin).host;
    return host.endsWith('vercel.app');
  } catch {
    return false;
  }
}

function buildCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, x-worker-key, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin as string;
  }
  return headers;
}

type CacheRecord = {
  data?: unknown;
  error?: string;
  elapsed: number;
  expiresAt?: number;
  token?: string;
};

const cache: Record<string, CacheRecord> = {};
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX_POSTS = 30; // per IP per window
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkPostRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX_POSTS) {
    return false;
  }
  entry.count += 1;
  return true;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { method } = request;
    const origin = request.headers.get('origin');
    const corsHeaders = buildCorsHeaders(origin);
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Debug endpoint: GET /debug
    if (method === 'GET' && url.pathname === '/debug') {
      const cacheKeys = Object.keys(cache);
      const cacheEntries = cacheKeys.map((key) => ({
        id: key,
        hasData: !!cache[key].data,
        hasError: !!cache[key].error,
        elapsed: cache[key].elapsed,
        expiresAt: cache[key].expiresAt,
      }));

      return new Response(
        JSON.stringify({
          cacheSize: cacheKeys.length,
          entries: cacheEntries,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Polling endpoint: GET /?id=xyz with Authorization: Bearer <token>
    if (method === 'GET' && url.searchParams.has('id')) {
      const id = url.searchParams.get('id');
      const auth = request.headers.get('Authorization') || '';
      const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
      const record = cache[id];

      console.log('GET request for id:', id, 'bearer:', bearer ? 'present' : 'missing');
      console.log('Cache record found:', !!record);
      if (record) {
        console.log('Record structure:', Object.keys(record));
        console.log('Record data:', record.data);
        console.log('Record error:', record.error);
        console.log('Record data type:', typeof record.data);
        console.log('Record data is null:', record.data === null);
        console.log('Record data is undefined:', record.data === undefined);
      }

      if (!record) {
        return new Response(JSON.stringify({ status: 'pending' }), {
          status: 202,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // If record exists but has no data yet, return pending
      if (!record.data && !record.error) {
        return new Response(JSON.stringify({ status: 'pending' }), {
          status: 202,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (record.expiresAt && record.expiresAt < Date.now()) {
        delete cache[id];
        return new Response(JSON.stringify({ error: 'Result expired' }), {
          status: 410,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (!record.token || !bearer || bearer !== record.token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Returning result for id:', id, 'data:', record.data, 'error:', record.error);
      console.log('Full record:', record);

      // Only return data or error, not both
      const responseData = record.error ? { error: record.error } : { data: record.data };

      console.log('Response data being sent:', responseData);
      console.log('Response data JSON:', JSON.stringify(responseData));
      console.log('Response data keys:', Object.keys(responseData));

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'POST') {
      const isLocalHost = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
      const workerKeyHeader = request.headers.get('x-worker-key') || '';
      if (!isLocalHost) {
        if (!env.WORKER_AUTH_KEY) {
          return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (workerKeyHeader !== env.WORKER_AUTH_KEY) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      if (!checkPostRateLimit(clientIp)) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = (await request.json()) as { content?: string; prompt?: string };
      const { content, prompt } = body || {};
      if (!content || !prompt) {
        return new Response(JSON.stringify({ error: 'Missing content or prompt' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const safeContent = content.length > 8000 ? content.slice(0, 8000) + '\n\n[...truncated]' : content;
      const safePrompt = prompt.length > 1000 ? prompt.slice(0, 1000) + ' [...truncated]' : prompt;
      const id = crypto.randomUUID();
      const token = crypto.randomUUID();

      // create stub so GET can validate token during pending period
      const now = Date.now();
      cache[id] = { elapsed: now, expiresAt: now + 10 * 60 * 1000, token };
      console.log('Created cache entry for id:', id, 'token:', token);

      ctx.waitUntil(
        (async () => {
          console.log('Starting GPT request for id:', id);
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
                    content: `Prompt: ${safePrompt}\n\nRelease Notes:\n${safeContent}`,
                  },
                ],
                temperature: 0.7,
                max_tokens: 800,
              }),
            });

            if (!res.ok) {
              const errorText = await res.text();
              console.error(`OpenAI API error: ${res.status} ${res.statusText}`, errorText);
              const elapsed = Date.now();
              console.log('About to update cache for id:', id, 'with error');
              cache[id] = {
                error: `OpenAI API error: ${res.status} ${res.statusText}`,
                elapsed,
                expiresAt: elapsed + 10 * 60 * 1000,
                token,
              };
              console.log('Cache updated for id:', id, 'cache entry now has error:', !!cache[id].error);
              return;
            }

            const data = await res.json();
            const elapsed = Date.now();
            console.log('About to update cache for id:', id, 'with data:', !!data);
            cache[id] = { data, elapsed, expiresAt: elapsed + 10 * 60 * 1000, token };
            console.log('Cache updated for id:', id, 'cache entry now has data:', !!cache[id].data);
            console.log('GPT request completed successfully for id:', id, 'data:', data);
          } catch (err) {
            console.error('Worker GPT request error:', err);
            const elapsed = Date.now();
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            cache[id] = {
              error: `Failed to generate GPT response: ${errorMessage}`,
              elapsed,
              expiresAt: elapsed + 10 * 60 * 1000,
              token,
            };
          }
        })()
      );

      return new Response(JSON.stringify({ id, token }), {
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
