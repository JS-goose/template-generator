// /api/gpt-email.js

export default async function handler(req, res) {
    console.log("LLM_API_KEY exists:", process.env.LLM_API_KEY);
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  
    const { content, prompt } = req.body;
  
    if (!content || !prompt) {
      return res.status(400).json({ error: "Missing content or prompt" });
    }
  
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured." });
    }
  
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
      });
  
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error("OpenAI API error:", error);
      return res.status(500).json({ error: "Failed to generate email." });
    }
  }