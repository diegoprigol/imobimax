import React from "https://esm.sh/react@18";
import ReactDOM from "https://esm.sh/react-dom@18/client";

function App() {
  const [pergunta, setPergunta] = React.useState("");
  const [resposta, setResposta] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function perguntarIA() {
    setLoading(true);
    setResposta("");

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: pergunta })
    });

    const data = await res.json();

    const texto =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sem resposta da IA.";

    setResposta(texto);
    setLoading(false);
  }

  return React.createElement(
    "div",
    { style: { padding: 30, maxWidth: 700, fontFamily: "Arial" } },
    React.createElement("h1", null, "ImobiMax IA"),
    React.createElement("textarea", {
      value: pergunta,
      onChange: (e) => setPergunta(e.target.value),
      placeholder: "Digite sua pergunta",
      style: { width: "100%", height: 100, marginTop: 20 }
    }),
    React.createElement(
      "button",
      {
        onClick: perguntarIA,
        style: {
          marginTop: 10,
          padding: "10px 20px",
          background: "#2563eb",
          color: "white",
          borderRadius: 6
        }
      },
      loading ? "Consultando..." : "Perguntar à IA"
    ),
    resposta &&
      React.createElement(
        "p",
        { style: { marginTop: 20, whiteSpace: "pre-wrap" } },
        resposta
      )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(App)
);
