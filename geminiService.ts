
import { GoogleGenAI } from "@google/genai";

export async function getBusinessInsights(data: any) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Como um consultor sênior de BI imobiliário, analise os seguintes dados de desempenho:
    ${JSON.stringify(data)}

    Forneça um resumo executivo curto (máximo 2 parágrafos) cobrindo:
    1. Performance de vendas e saúde do estoque.
    2. Uma recomendação estratégica rápida.

    Responda em português de forma profissional e direta.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    return "Análise temporariamente indisponível.";
  }
}
