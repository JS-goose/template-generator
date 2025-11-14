// /api/gpt-email.js

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const isAllowedOrigin = (() => {
    if (!origin) return false;
    if (origin === "http://localhost:3000") return true;
    try {
      const host = new URL(origin).host;
      return host.endsWith("vercel.app");
    } catch {
      return false;
    }
  })();

  if (isAllowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let { content, prompt } = req.body;

  if (!content || !prompt) {
    return res.status(400).json({ error: "Missing content or prompt" });
  }

  const workerAuthKey = process.env.WORKER_AUTH_KEY;
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    hasWorkerAuthKey: !!workerAuthKey,
    workerAuthKeyLength: workerAuthKey ? workerAuthKey.length : 0
  });
  if (process.env.NODE_ENV !== "development" && !workerAuthKey) {
    return res.status(500).json({ error: "Worker is misconfigured (missing WORKER_AUTH_KEY)." });
  }

  // Validate content size (prevent abuse, not security)
  // Note: Truncation removed - let the worker handle size validation
  // This prevents silent data loss and ensures proper error handling
  const MAX_CONTENT_LENGTH = 200000; // ~50k tokens
  const MAX_PROMPT_LENGTH = 10000; // ~2.5k tokens
  
  if (content.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({ error: `Content too large: ${content.length} characters. Maximum allowed: ${MAX_CONTENT_LENGTH}` });
  }
  
  if (prompt && prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: `Prompt too large: ${prompt.length} characters. Maximum allowed: ${MAX_PROMPT_LENGTH}` });
  }

  try {
    const workerUrl = process.env.NODE_ENV === "development"
      ? "http://localhost:8787"
      : (process.env.WORKER_URL || "https://gpt-proxy-worker.joncsexton.workers.dev");

    console.log('Making request to Worker:', workerUrl);
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-worker-key": workerAuthKey || "",
      },
      body: JSON.stringify({ content, prompt }),
    });

    console.log('Worker response status:', response.status);
    const data = await response.json().catch(() => ({}));
    console.log('Worker response data:', data);
    
    // Mirror Worker response (expect 202 and { id })
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("OpenAI API error or timeout:", error);
    return res.status(500).json({ error: "Failed to generate email or request timed out." });
  }
}