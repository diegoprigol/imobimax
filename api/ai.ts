import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Aceita SOMENTE POST
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  try {
    const prompt = req.body?.prompt;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt não enviado' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API Key não encontrada' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Falha ao chamar o Gemini' });
  }
}
