export async function gerarResposta(prompt: string) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error('Erro ao chamar a IA');
  }

  return await response.json();
}

