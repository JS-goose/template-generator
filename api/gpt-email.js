// /api/gpt-email.js

export default async function handler(req, res) {
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

  // * Setup timeout using AbortController (9s)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that writes clear, professional customer email updates using provided release note data.",
          },
          {
            role: "user",
            content: `Prompt: ${prompt}\n\nRelease Notes:\n${content}`,
          },
        ],
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("OpenAI API error or timeout:", error);
    return res.status(500).json({ error: "Failed to generate email or request timed out." });
  }
}