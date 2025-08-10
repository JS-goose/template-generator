// /api/gpt-email.js

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000", // ! Local dev
    "https://template-generator-ten.vercel.app", // ! Production domain
  ];

  if (allowedOrigins.includes(origin)) {
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

  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured." });
  }

  // ! Trim overly long content to avoid timeout until moving off Vercel
  if (content.length > 5000) {
    content = content.substring(0, 5000) + "\n\n[...truncated]";
  }

  try {
    const response = await fetch("https://gpt-email-worker.jonathansexton.workers.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ content, prompt }),
    });

    clearTimeout(timeout);

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("OpenAI API error or timeout:", error);
    return res.status(500).json({ error: "Failed to generate email or request timed out." });
  }
}