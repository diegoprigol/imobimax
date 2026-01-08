const root = document.getElementById("root");

if (!root) {
  throw new Error("Root não encontrado");
}

root.innerHTML = `
  <div style="max-width:600px;margin:40px auto;font-family:Arial">
    <h1>ImobiMax IA</h1>

    <input id="pergunta" placeholder="Pergunte algo sobre mercado imobiliário"
      style="width:100%;padding:10px;font-size:16px" />

    <button id="btn" style="margin-top:10px;padding:10px">
      Perguntar à IA
    </button>

    <pre id="resposta" style="margin-top:20px;white-space:pre-wrap"></pre>
  </div>
`;

document.getElementById("btn")?.addEventListener("click", async () => {
  const perguntaInput = document.getElementById("pergunta") as HTMLInputElement;
  const respostaEl = document.getElementById("resposta") as HTMLElement;

  const pergunta = perguntaInput.value;
  if (!pergunta) return;

  respostaEl.textContent = "Pensando...";

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCAgr9o6raAyapDsEQK0Y3MOnxFccKZq9M",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: pergunta }] }
          ]
        })
      }
    );

    const data = await res.json();
    const texto =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sem resposta da IA.";

    respostaEl.textContent = texto;
  } catch (e) {
    respostaEl.textContent = "Erro ao chamar a IA.";
  }
});
