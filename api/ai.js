export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ ok: true });
    }

    const prompt = req.body?.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt não enviado" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const texto =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        .join("") ||
      "A IA não conseguiu gerar resposta.";

    return res.status(200).json({ text: texto });
  } catch (e) {
    return res.status(500).json({ error: "Erro interno na IA" });
  }
}
