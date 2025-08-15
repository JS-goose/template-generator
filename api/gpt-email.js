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
  if (process.env.NODE_ENV !== "development" && !workerAuthKey) {
    return res.status(500).json({ error: "Worker is misconfigured (missing WORKER_AUTH_KEY)." });
  }

  // ! Trim overly long content to avoid timeout until moving off Vercel
  if (content.length > 5000) {
    content = content.substring(0, 5000) + "\n\n[...truncated]";
  }

  try {
    const workerUrl = process.env.NODE_ENV === "development"
      ? "http://localhost:8787"
      : (process.env.WORKER_URL || "https://gpt-proxy-worker.joncsexton.workers.dev");

    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-worker-key": workerAuthKey || "",
      },
      body: JSON.stringify({ content, prompt }),
    });

    // Mirror Worker response (expect 202 and { id })
    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("OpenAI API error or timeout:", error);
    return res.status(500).json({ error: "Failed to generate email or request timed out." });
  }
}