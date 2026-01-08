import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt vazio' });
    }

    // resposta simulada (por enquanto)
    return res.status(200).json({
      text: `Resposta de teste da IA para: "${prompt}"`
    });

  } catch (err) {
    return res.status(500).json({ error: 'Erro interno' });
  }
}
